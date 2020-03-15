export const getPlayer = (successType, errorType, matchIndex, teamIndex, playerIndex, mode, player, platform) => {
    return dispatch => {
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
                        mmrOverTime: processedMmrOverTime
                    };
                    if(modeData.divDown) {
                        playerDetails.divDown = modeData.divDown;
                    }
                    if(modeData.divUp) {
                        playerDetails.divUp = modeData.divUp;
                    }
                    dispatch({ type: successType,  matchIndex, teamIndex, playerIndex, player: playerDetails});
                })
                .catch(error => {
                    console.log(error);
                    dispatch({ type: errorType, matchIndex, teamIndex, playerIndex})
                });
    }
};