const vision = require('@google-cloud/vision');

const handleExtractUsernames = async (req, res) => {
    const height = word => {
        return ((word.boundingPoly.vertices[3].y - word.boundingPoly.vertices[0].y) + (word.boundingPoly.vertices[2].y - word.boundingPoly.vertices[1].y)) / 2;
    }

    const outlierBoundaries = words => {
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
    const keywords = ['competitive', 'score', 'goals', 'assists', 'saves', 'shots', 'ping', 'scored', 'by', 'you'];
    const teamAbbreviation = /^[\[\(][A-Z]{1,4}[\]\)]$/;

    const GOOGLE_APPLICATION_CREDENTIALS = `C://Users//Matth//OneDrive//Documents//Computer Science//Project//rl-analytics-266421-08b9e8fb4034.json`;
    const client = new vision.ImageAnnotatorClient({keyFilename: GOOGLE_APPLICATION_CREDENTIALS});
    
    const [result] = await client.textDetection('images/full-scoreboard.JPG');//'https://i1.wp.com/4onegaming.com/wp-content/uploads/2016/01/scoreboard-rocket-league.png?fit=810%2C381&ssl=1');
    // const [result] = await client.textDetection('images/just-names-scoreboard.JPG');
    // const [result] = await client.textDetection('images/skewed-scoreboard.JPG');
    const detections = result.textAnnotations;
    var words = detections.filter(
        detection => 
            !keywords.includes(detection.description.toLowerCase()) &&  //Remove keywords
            !/^\d+$/.test(detection.description) && // Remove only numbers
            !/^a?l{1,2}\d{0,3}$/.test(detection.description) // Remove misinterpretation of ping
        );
    words.splice(0,1); // Remove first result containing all words
    const boundaries = outlierBoundaries(words);

    const scores = detections.filter(detection => detection.description.toLowerCase() === 'score'); // Identify 'SCORES' column headings
    var scoresValid = false;
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
            while(words[i].boundingPoly.vertices[3].y < score1[0].y) {
                i++;
            }
            words.splice(0,i);                                                                            // Remove everything above the upper score
        }
    }
    words = words.filter(word => !(word.boundingPoly.vertices[0].x < boundaries[0] || word.boundingPoly.vertices[0].x > boundaries[1] || word.boundingPoly.vertices[0].y < boundaries[2] || word.boundingPoly.vertices[0].y > boundaries[3])); // Remove outliers to hopefull leave just first column of club names, player names and titles
    
    // Group words into lines
    const processLineWord = (word, lines) => {
        const wordTopY = word.boundingPoly.vertices[0].y;
        const wordBottomY = word.boundingPoly.vertices[3].y;
        const line = lines[lines.length - 1];
        const error = Math.min(wordBottomY - wordTopY, line.bottomY - line.topY) / 2;
        if (
            Math.abs(wordTopY - line.topY) < error && 
            Math.abs(wordBottomY - line.bottomY) < error && 
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
    var lines = words.slice(1).reduce((acc, word) => processLineWord(word, acc), [{topY: words[0].boundingPoly.vertices[0].y, bottomY: words[0].boundingPoly.vertices[3].y, words: [words[0]]}])

    // Split lines into two teams
    const ySplit = (lines[lines.length - 1].bottomY + lines[0].topY) / 2;
    var i = Math.floor(lines.length / 2);
    while(!(lines[i-1].bottomY < ySplit && lines[i].topY > ySplit)) {
        if(lines[i].topY < ySplit) {
            i++;
        } else if (lines[i-1].bottomY > ySplit) {
            i--;
        } else {
            break;
        }
    }
    const teamLines = [lines.slice(0,i), lines.slice(i)];

    if (!(detections.filter(detection => detection.description === 'BLUE' || detection.description === 'ORANGE').length > 0)){
        // If two clubs playing then every player is in a club so can just look for name after bracketed abbreviation

        const processTeamLine = (line, players) => {
            var i = 0;
            while(i < line.words.length && !teamAbbreviation.test(line.words[i].description)) {
                i++;
            }
            if (i === line.words.length) {
                return players; // This isn't a player name line
            }
            players.push(line.words.slice(i+1).map(word => word.description).join('_'));
            return players;
        }

        const players = teamLines.map(team => team.reduce((acc, line) => processTeamLine(line, acc), []));
        res.json(players);
    } else {
        const processRecordLines = (line, records) => {
            const record = records[records.length - 1];
            const error = Math.min(record.bottomY - record.topY, line.bottomY - line.topY) / 4;
            if (line.topY < record.bottomY + error) {
                record.topY = Math.min(record.topY, line.topY);
                record.bottomY = Math.max(record.bottomY, line.bottomY);
                record.lines.push(line);
            } else {
                records.push({topY: line.topY, bottomY: line.bottomY, lines: [line]});
            }
            return records;
        }

        const teamRecords = teamLines.map(team => team.slice(1).reduce((acc, line) => processRecordLines(line, acc), [{topY: team[0].topY, bottomY: team[0].bottomY, lines: [team[0]]}]));
        
        const identifyNamesFromRecords = records => {
            var players = [];
            records.forEach(record => {
                if (!scoresValid || (record.topY > scores[0].boundingPoly.vertices[3].y && record.bottomY < scores[1].boundingPoly.vertices[0].y) || record.topY > scores[1].boundingPoly.vertices[3].y) { // Ditches team names if it can
                    const linesWithAbbreviation = record.lines.filter(line => line.words.filter(word => teamAbbreviation.test(word.description)).length > 0);
                    if(linesWithAbbreviation.length > 0) { // Take name from after team abbreviation
                        const words = linesWithAbbreviation[0].words;
                        var i = 0;
                        while(!teamAbbreviation.test(words[i].description)) {
                            i++;
                        }
                        players.push(words.slice(i+1).map(word => word.description).join('_'));
                    } else if (
                        (record.lines.length > 1 && record.lines.filter(line => line.words.filter(word => word.description === 'BLUE' || word.description === 'ORANGE').length > 0).length === 0) // If no abbreviation but multiple lines, none of which include 'BLUE' or 'ORANGE', take top line
                        || (record.lines[0].words.filter(word => word.description === 'BLUE' || word.description === 'ORANGE').length === 0) // If only one line which doesn't include 'BLUE' or 'ORANGE', take it
                    ) { 
                        players.push(record.lines[0].words.map(word => word.description).join('_'));
                    }
                }
            });
            return players;
        }

        res.json({teams: teamRecords.map(team => identifyNamesFromRecords(team)), teamRecords, teamLines, detections});
    }
}

module.exports = {
    handleExtractUsernames
}