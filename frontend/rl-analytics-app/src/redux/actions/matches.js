export const ADD_MATCH = 'MATCHES__ADD_MATCH';
export const GET_PLAYER = 'MATCHES__GET_PLAYER';
export const LOADING_PLAYER_FAILURE = 'MATCHES__LOADING_PLAYER_FAILURE';

export const addMatch = match => ({
    type: ADD_MATCH,
    match
});

export const getPlayer = (matchIndex, teamIndex, playerIndex, mode, player) => {
    return dispatch => {
        fetch(`http://localhost:3001/profile/${player}`)
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
                    return platforms[0].data;
                })
                .then(playerData => {
                    const modeData = playerData.ranks[0][mode];
                    const playstyleData = playerData.charts['trio-breakdown'].series[0].data;
                    const [goals, saves, assists] = ['Goals', 'Saves', 'Assists'].map(type => playstyleData.filter(data => data.name === type)[0].y);
                    const playstyleSum = goals + saves + assists;
                    console.log(modeData.rank);
                    const [rank, division] = modeData.rank.split('Division');
                    console.log(rank);
                    console.log(division);
                    const playerDetails = {
                        name: player,
                        loading: false,  // Determine above what mode we're playing and then get selected data (also which season)
                        error: false,
                        mmr: modeData.rating,
                        playstyle: `${Math.round((goals/playstyleSum)*100)}:${Math.round((saves/playstyleSum)*100)}:${Math.round((assists/playstyleSum)*100)}`,
                        games: modeData.games.count,
                        mvpWinPercentage: playerData.stats.filter(stat => stat.name === 'MVP/Win %')[0].value,
                        rank: rank.trim(),
                        division: division.trim()
                    };
                    if(modeData.divDown) {
                        playerDetails.divDown = modeData.divDown;
                    }
                    if(modeData.divUp) {
                        playerDetails.divUp = modeData.divUp;
                    }
                    dispatch({ type: GET_PLAYER,  matchIndex, teamIndex, playerIndex, player: playerDetails});
                })
                .catch(error => {
                    console.log(error);
                    dispatch({ type: LOADING_PLAYER_FAILURE, matchIndex, teamIndex, playerIndex})
                });
    }
};