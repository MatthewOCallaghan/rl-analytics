// Scoreboard images must include both team names and all player usernames as a minimum.
// For best results, minimise amount of text included in image that is not in scoreboard.

//TODO: Replace obviously misread characters like multiplication × with x
//TODO: cut off everything that starts above bottom of team name, as well as all records above and including team name
//TODO: Use fuzzy search comparison to compare extracted names and names used in the RL session and replace if needed

const vision = require('@google-cloud/vision');

const KEYWORDS = ['COMPETITIVE', 'SCORE', 'GOALS', 'ASSISTS', 'SAVES', 'SHOTS', 'PING', 'SCORED', 'BY', 'YOU'];                                                                                                                                                                                                               // From OG PLAYER, as OG can get lost if deemed to start before team name
const ONE_WORD_TITLES = ['VETERAN', 'EXPERT', 'MASTER', 'LEGEND', 'ROCKETEER', 'ALL-STAR', 'SUPERSTAR', 'AIRHEAD', 'ANIMATOR', 'DEVELOPER', 'MODERATOR', 'BALLISTIC', 'FLOATER', 'GOALTENDER', 'LEADFOOT', 'RECKLESS', 'SHERPA', 'SHOWBOAT', 'SKYLORD', 'STEAMROLLER', 'SOLOIST', 'TRAILBLAZER', 'TECHNICIAN', 'WALL-CRAWLER', 'WHEELER', 'DEMOGORGON', 'COUCH-POTATO', 'COMMITTED', 'JUGGLER', 'PLAYER'];
const TEAM_ABBREVIATION = /[\[\(][A-Z0-9\*]{1,4}[\]\)]$/; // Just matches end of word rather than whole word in case avatar text gets merged in

const handleExtractUsernames = async (req, res) => {
    extractUsernamesFromImage(req.body.image)
    .then(data => res.json(data))
    .catch(err => {
        console.log(err);
        res.sendStatus(500);
    });
}

const extractUsernamesFromImage = async image => {
    var config;
    if(process.env.NODE_ENV !== 'production') {
        config = {
            keyFilename: require('../config').GOOGLE_APPLICATION_CREDENTIALS
        };
    } else {
        config = {
            credentials: {
                client_email: process.env.GCV_CLIENT_EMAIL, 
                private_key: `-----BEGIN PRIVATE KEY-----\n${process.env.GCV_PRIVATE_KEY.replace(/\\n/g,'\n')}\n-----END PRIVATE KEY-----\n`
            }
        };
    }

    const client = new vision.ImageAnnotatorClient(config);
    const request = {
        image: {
            content: image
        }
    }
    const [result] = await client.textDetection(request);

    // Find words
    const detections = result.textAnnotations;
    var words = collectWordsFromDetections(detections);

    // Remove outliers
    const boundaries = calculateOutlierBoundaries(words);
    const scores = detections.filter(detection => detection.description.toLowerCase() === 'score'); // Identify 'SCORES' column headings
    if (scores.length === 2) {
        const score1 = scores[0].boundingPoly.vertices;
        const score2 = scores[1].boundingPoly.vertices;
        const score1Width = score1[1].x - score1[0].x;
        const score2Width = score2[1].x - score2[0].x;
        const error = Math.min(score1Width * 0.5, score2Width * 0.5);
        if (Math.abs(score1[0].x - score2[0].x) < error && Math.abs(score1[1].x - score2[1].x) < error) { // Check those are the table headings and not part of some name
            scoresValid = true;
            boundaries[1] = Math.max(score1[0].x, score2[0].x);                                           // Remove everything to the right of them
            boundaries[3] = score2[3].y + score2[0].y - score1[3].y;                                      // Remove everything more that the y distance between them below the lower score
            var i = 0;
            while(i < words.length && words[i].boundingPoly.vertices[3].y < score1[0].y) {
                i++;
            }
            words.splice(0,i);                                                                            // Remove everything above the upper score
        }
    }
    words = words.filter(word => !(word.boundingPoly.vertices[0].x < boundaries[0] || word.boundingPoly.vertices[0].x > boundaries[1] || word.boundingPoly.vertices[0].y < boundaries[2] || word.boundingPoly.vertices[0].y > boundaries[3])); // Remove outliers to hopefully leave just first column of club names, player names and titles

    // Group words into lines
    var lines = groupWordsIntoLines(words);

    // Split lines into two teams
    const teamLines = splitLinesIntoTeams(lines);

    // Extract usernames from team lines
    var players = teamLines.map(extractUsernamesFromTeamLines);

    // Remove duplicates
    players = removeDuplicatePlayers(players);
    return ({players,detections,words,lines,teamLines,teamRecords: teamLines.map(groupLinesIntoRecords)});
}

// const removeCompetitiveHeading = 

const isWordCutOff = (word, target, imageRightX) => {
    return word.description === target ||
           (
                word.description === target.substring(0, word.description.length) &&
                Math.max(word.boundingPoly.vertices[1].x, word.boundingPoly.vertices[2].x) > imageRightX - ((word.boundingPoly.vertices[1].x - word.boundingPoly.vertices[0].x) / word.description.length)
            );
}

const collectWordsFromDetections = detections => {

    // Remove 'COMPETITIVE' or 'COMPETITIVE [SOLO]' heading, even if cut off at end
    var startIndex = 1; // Starts at 1 to remove first detection containing all words
    const imageRightX = Math.max(detections[0].boundingPoly.vertices[1].x, detections[0].boundingPoly.vertices[2].x);
    const firstWord = detections[startIndex].description;
    if (firstWord === 'COMPETITIVE') {
        startIndex++;
        if(/^COMPETITIVE [\[\(]/.test(detections[startIndex].description) && isWordCutOff(detections[startIndex], '[SOLO]', imageRightX)) {
            startIndex++;
        }
    } else if (isWordCutOff(detections[startIndex], 'COMPETITIVE', imageRightX)) {
        startIndex++;
    }

    return detections.slice(startIndex).filter(
        detection => 
            !KEYWORDS.includes(detection.description) &&  //Remove keywords
            !/^\d+$/.test(detection.description) && // Remove only numbers
            !/^a?l{1,2}\d{0,3}$/.test(detection.description) // Remove misinterpretation of ping
        );
}

const calculateOutlierBoundaries = words => {
    const xs = words.map(word => word.boundingPoly.vertices[0].x).sort((a,b) => a - b);
    const ys = words.map(word => word.boundingPoly.vertices[0].y).sort((a,b) => a - b);
    const xQ1 = xs[Math.floor((xs.length / 4)) - 1];
    const yQ1 = ys[Math.floor((ys.length / 4)) - 1];
    const xQ3 = xs[Math.ceil((xs.length * (3/4))) - 1];
    const yQ3 = ys[Math.ceil((ys.length * (3/4))) - 1];
    const xIqr = xQ3 - xQ1;
    const yIqr = yQ3 - yQ1;
    return [xQ1 - xIqr*1.5, xQ3 + xIqr*1.5, yQ1 - yIqr*1.5, yQ3 + yIqr*1.5];
}

const groupWordsIntoLines = words => {
    const processLineWord = (word, lines) => {
        const wordTopY = word.boundingPoly.vertices[0].y;
        const wordBottomY = word.boundingPoly.vertices[3].y;
        const line = lines[lines.length - 1];
        const error = Math.min(wordBottomY - wordTopY, line.bottomY - line.topY) / 2;
        if (
            // Math.abs(wordTopY - line.topY) < error && 
            // Math.abs(wordBottomY - line.bottomY) < error && 
            (Math.min(wordBottomY, line.bottomY) - Math.max(wordTopY, line.topY)) > error &&
            Math.abs(word.boundingPoly.vertices[0].x - line.words[line.words.length - 1].boundingPoly.vertices[1].x) < (error * 2) // Ensures word is to right of last word on line (requires a bigger error margin as this time there is supposed to be a gap)
        ) {
            line.topY = Math.min(line.topY, wordTopY);
            line.bottomY = Math.max(line.bottomY, wordBottomY);
            line.words.push(word);
        } else {
            lines.push({topY: wordTopY, bottomY: wordBottomY, words:[word]});
        }
        return lines;
    }

    return words.slice(1).reduce((acc, word) => processLineWord(word, acc), [{topY: words[0].boundingPoly.vertices[0].y, bottomY: words[0].boundingPoly.vertices[3].y, words: [words[0]]}]);
}

const splitLinesIntoTeams = lines => {
    if(lines.length < 2) {
        return [lines[0] || [], lines[1] || []];
    }
    const ySplit = (lines[lines.length - 1].bottomY + lines[0].topY) / 2;
    var i = Math.floor(lines.length / 2);
    var count = 0;
    while(count < lines.length && !(lines[i-1].bottomY < ySplit && lines[i].topY > ySplit)) {
        count++;
        if(lines[i].topY < ySplit) {
            i++;
        } else if (lines[i-1].bottomY > ySplit) {
            i--;
        } else {
            break;
        }
    }
    return [lines.slice(0,i), lines.slice(i)];
}

// Finds line index containing 'BLUE' or 'ORANGE', returning teamLines.length if neither can be found
const findGenericTeamName = teamLines => {
    // var i = 0;
    // while(i < teamLines.length && teamLines[i].words.filter(word => word.description === 'BLUE' || word.description === 'ORANGE').length === 0) {
    //     i++;
    // }
    // return i;

    var i = 0;
    while(i < teamLines.length) {
        const nameWords = teamLines[i].words.filter(word => word.description === 'BLUE' || word.description === 'ORANGE');
        if (nameWords.length > 0) {
            const vertices = nameWords[0].boundingPoly.vertices;
            return {
                lineIndex: i,
                leftX: vertices[0].x,
                bottomY: vertices[3].y,
                error: (vertices[1].x - vertices[0].x) / nameWords[0].description.length
            };
        }
        i++;
    }
    return {};
}

const extractUsernamesAfterTeamAbbreviationsFromLines = lines => {
    const processTeamLine = (line, players) => {
        var i = 0;
        while(i < line.words.length && !TEAM_ABBREVIATION.test(line.words[i].description)) {
            i++;
        }
        if (i === line.words.length) {
            return players; // This isn't a player name line
        }
        players.push(mergeWordsIntoString(line.words.slice(i+1)));
        return players;
    }

    return lines.reduce((acc, line) => processTeamLine(line, acc), []);
}

const groupLinesIntoRecords = lines => {
    const processRecordLines = (line, records) => {
        const record = records[records.length - 1];
        const error = Math.min(record.bottomY - record.topY, line.bottomY - line.topY) * 0.13; // Lowest figure found to not group two names into the same record - was 0.2 beforehand
        if (line.topY < record.bottomY + error) {
            record.topY = Math.min(record.topY, line.topY);
            record.bottomY = Math.max(record.bottomY, line.bottomY);
            record.lines.push(line);
        } else {
            records.push({topY: line.topY, bottomY: line.bottomY, lines: [line]});
        }
        return records;
    }

    return lines.slice(1).reduce((acc, line) => processRecordLines(line, acc), [{topY: lines[0].topY, bottomY: lines[0].bottomY, lines: [lines[0]]}]);
}

const findRecordContainingLine = (records, lineIndex) => {
    var recordIndex = 0;
    var lineCount = 0;
    while(recordIndex < records.length && lineCount - 1 < lineIndex) {
        lineCount += records[recordIndex].lines.length;
        recordIndex++;
    }
    return recordIndex - 1;
}

mergeWordsIntoString = words => {
    return words.map(word => word.description).join(' ');
}

const identifyNamesFromRecords = records => {
    var players = [];
    records.forEach(record => {
        // If team abbreviation present, take name after abbreviation
        const linesWithAbbreviation = record.lines.filter(line => line.words.filter((word, index) => TEAM_ABBREVIATION.test(word.description) && index < line.words.length - 1).length > 0);
        if(linesWithAbbreviation.length > 0) { // Take name from after team abbreviation
            const words = linesWithAbbreviation[0].words;
            var i = 0;
            while(i < words.length && !TEAM_ABBREVIATION.test(words[i].description)) {
                i++;
            }
            players.push(mergeWordsIntoString(words.slice(i+1)));
        } else {
            // Else if multiple lines, take top line
            // Else if not all caps with at least one space and not a one word title, take whole line as name
         
            const name = mergeWordsIntoString(record.lines[0].words);

            if (record.lines.length > 1 || !(/^[A-Z ]* [A-Z ]*$/.test(name) || ONE_WORD_TITLES.includes(name))) {
                players.push(name);
            }
        }
    });
    return players;
}

// const removeWordsFromRecordsThatStartBeforeBottomOfTeamName = (records, teamNameBottomY) => {
//     // return records.map(record => (
//     //     {
//     //         ...record,
//     //         lines: record.lines.map(line => (
//     //             {
//     //                 ...line, 
//     //                 words: line.words.filter(word => word.boundingPoly.vertices[0].y > teamNameBottomY)
//     //             }
//     //         )).filter(line => line.words.length > 0)
//     //     }
//     // )).filter(record => record.lines.length > 0);

//     records.forEach((record, recordIndex) => {
//         record.lines.forEach((line, lineIndex) => {
//             line.words.forEach((word, wordIndex) => {
//                 if(word.boundingPoly.vertices[0].y > teamNameBottomY) {
//                     return records;
//                 }
                
//             });
//         });
//     });
// }

const removeWordsFromLineThatEndBeforeX = (line, x) => {
    // Used to remove avatar text (that ends before title leftX + width of one letter (as an error margin))
    // Keeps words that end before x if they end in team abbreviation (so that abbreviation doesn't get lost if Google merges it with avatar text)

    const newWords = line.words.filter(word => word.boundingPoly.vertices[1].x >= x || TEAM_ABBREVIATION.test(word.description));
    if (newWords.length < line.words.length && newWords.length) {
        line.topY = Math.min(newWords.map(word => word.boundingPoly.vertices[0].y));
        line.bottomY = Math.max(newWords.map(word => word.boundingPoly.vertices[3].y));
    }
    line.words = newWords;
    return line;
}

const extractUsernamesFromTeamLines = teamLines => {

    const { lineIndex, leftX, bottomY, error } = findGenericTeamName(teamLines);

    if(lineIndex || lineIndex === 0) {

        // Remove words that start before title (avatar text)
        teamLines = teamLines.map(line => removeWordsFromLineThatEndBeforeX(line, leftX + error)).filter(line => line.words.length > 0);
        
        var teamRecords = groupLinesIntoRecords(teamLines);
        teamRecords = teamRecords.slice(findRecordContainingLine(teamRecords, lineIndex) + 1);
        // teamRecords = removeWordsFromRecordsThatStartBeforeBottomOfTeamName(teamRecords, bottomY);


        return identifyNamesFromRecords(teamRecords);

    } else {
        // If two clubs playing then every player is in a club so can just look for name after bracketed abbreviation

        return extractUsernamesAfterTeamAbbreviationsFromLines(teamLines);
    }
}

const removeDuplicatePlayers = players => {
    players = players.map(teamPlayers => [...new Set(teamPlayers)]);

    const overlap = players[0].filter(player => players[1].includes(player));

    if(overlap.length > 0) {
        overlap.forEach(player => {
            const index0 = players[0].indexOf(player);
            const index1 = players[1].indexOf(player);
            if (index0 < index1) {
                players[1].splice(index1,1);
            } else {
                players[0].splice(index0,1);
            }
        })
    }

    return players;
}

module.exports = {
    handleExtractUsernames,
    extractUsernamesFromImage
}


/*

    1. Split into two teams
    2. If team contains BLUE or ORANGE...
        i. Remove words that start before team name
        ii. Group into records
        iii. Remove all records from the one including team name and above, and all words that start vertically before bottom of team name
        iv. For every remaining record...
            a. If team abbreviation present, take name
            b. Else if multiple lines, take top line
            c. Else if not all caps with spaces and not a one word title, take it as name
    3. If team does not contain BLUE or ORANGE...
        i. Take names following abbreviation
    4. Remove duplicates


*/