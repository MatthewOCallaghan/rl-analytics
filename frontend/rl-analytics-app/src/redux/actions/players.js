import { GAME_MODES } from './session';

export const getPlayerAndDispatch = (successType, errorType, matchId, team, playerId, mode, player, platform) => {
    return dispatch => {
        getPlayer(mode, player, platform)
            .then(player => dispatch({ type: successType,  matchId, team, playerId, player }))
            .catch(error => {
                console.log(error);
                dispatch({ type: errorType, matchId, team, playerId, playerName: player });
            });
    }
};

export const getPlayer = (mode, player, platform) => {
    return new Promise((resolve, reject) => {
        fetch(`${process.env.REACT_APP_API_URL}/profile/${player}${platform ? `?platform=${platform}` : ''}`)
            .then(response => {
                if (!response.ok) {
                    return Promise.reject(new Error(response.statusText));
                }
                return response;
            })
            .then(response => response.json())
            .then(platforms => {
                if (platforms.length === 0) {
                    return Promise.reject(new Error(`${player} does not exist`));
                }
                platforms[0].data.platform = platforms[0].platform;
                return platforms[0].data;
            })
            .then(playerData => {
                const modeData = playerData.ranks[0][mode];
                const playstyleData = playerData.charts['trio-breakdown'].series[0].data;
                const [goals, saves, assists] = ['Goals', 'Saves', 'Assists'].map(type => playstyleData.filter(data => data.name === type)[0].y);
                const playstyleSum = goals + saves + assists;
                const [rank, division] = modeData.rank.split('Division');

                const mmrOverTime = playerData.mmr.filter(data => data.name === mode)[0].data;
                const currentDate = new Date();
                const processedMmrOverTime = mmrOverTime.categories.map((stringDate, index) => {
                    var date = new Date(stringDate);
                    if (date.getMonth() > currentDate.getMonth()) {
                        date = new Date(`${stringDate} ${currentDate.getFullYear() - 1}`);
                    } else {
                        date = new Date(`${stringDate} ${currentDate.getFullYear()}`);
                    }
                    return { date, value: mmrOverTime.rating[index] };
                });

                const playerDetails = {
                    name: player, // Determine above what mode we're playing and then get selected data (also which season)
                    mmr: modeData.rating,
                    playstyle: `${Math.round((goals/playstyleSum)*100)}:${Math.round((saves/playstyleSum)*100)}:${Math.round((assists/playstyleSum)*100)}`,
                    games: modeData.games.count,
                    mvpWinPercentage: playerData.stats.filter(stat => stat.name === 'MVP/Win %')[0].value,
                    rank: rank.trim(),
                    division: division.trim(),
                    platform: playerData.platform,
                    streak: modeData.games.streak,
                    mmrOverTime: processedMmrOverTime,
                    all: playerData
                };
                if(modeData.divDown) {
                    playerDetails.divDown = modeData.divDown;
                }
                if(modeData.divUp) {
                    playerDetails.divUp = modeData.divUp;
                }
                resolve(playerDetails);
            })
            .catch(error => reject(error));
    });
}

export const getPlayerUpdate = async (player, mode) => {
    try {
        const updated = finalPlayer => finalPlayer.games > player.games;

        const fetchPlayer = async () => await getPlayer(mode, player.name, player.platform);

        const fetchPlayerOnInterval = () => new Promise((resolve, reject) => {
            const interval = setInterval(async () => {
                const finalPlayer = await fetchPlayer();
                if (updated(finalPlayer)) {
                    clearInterval(interval);
                    resolve(finalPlayer);
                }
                console.log(`${player.name} not updated yet`);
            }, 90000);
        });

        var finalPlayer = await fetchPlayer();
        console.log(`${player.name}: ${updated(finalPlayer)}`);
        if(!updated(finalPlayer)) {
            finalPlayer = await fetchPlayerOnInterval();
        }


        const calculateStatDifference = name => finalPlayer.all.stats.filter(stat => stat.name === name)[0].value - player.all.stats.filter(stat => stat.name === name)[0].value;

        const countGames = player => GAME_MODES.map(mode => mode.title)
                                                .concat('Un-Ranked')
                                                .reduce((acc, mode) => {
                                                    const games = player.all.ranks[0] && player.all.ranks[0][mode] && player.all.ranks[0][mode].games && player.all.ranks[0][mode].games.count;
                                                    return games ? games + acc : acc;
                                                }, 0);

        return {
            id: player.id,
            games: countGames(finalPlayer) - countGames(player),
            goals: calculateStatDifference('Goals'),
            assists: calculateStatDifference('Assists'),
            saves: calculateStatDifference('Saves'),
            shots: calculateStatDifference('Shots'),
            mvps: calculateStatDifference('MVPs'),
            wins: calculateStatDifference('Wins'),
            rank: finalPlayer.rank,
            division: finalPlayer.division,
            mmrChange: finalPlayer.mmr - player.mmr
        };

    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}