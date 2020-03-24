import fetch from 'unfetch';

import { getPlayerAndDispatch, getPlayerUpdate } from './players';

export const ADD_MATCH = 'MATCHES__ADD_MATCH';
export const ADD_MATCH_FAILURE = 'MATCHES__ADD_MATCH_FAILURE';
export const LOADING_NEW_MATCH = 'MATCHES__LOADING_NEW_MATCH';
export const GET_PLAYER = 'MATCHES__GET_PLAYER';
export const LOADING_PLAYER_FAILURE = 'MATCHES__LOADING_PLAYER_FAILURE';
// export const LOADING_PLAYER = 'MATCHES__LOADING_PLAYER';
export const EDIT_USERNAME = 'MATCHES__EDIT_USERNAME';
export const FINISH_MATCH = 'MATCHES__FINISH_MATCH';
export const FINISH_MATCH_LOADING = 'MATCHES__FINISH_MATCH_LOADING';
export const FINISH_MATCH_FAILURE = 'MATCHES__FINISH_MATCH_FAILURE';

export const addMatch = match => {
    return (dispatch, getState) => {
        dispatch({ type: LOADING_NEW_MATCH });
        const state = getState();
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${state.session.code}`, {
            method: 'post',
            headers: {
                authorization: `Bearer ${state.session.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(match)
        })
        .then(response => {
            if(!response.ok) {
                return Promise.reject(new Error(response.statusText));
            }
            return response;
        })
        .then(response => response.json())
        .then(match => {
            match.players = match.players.map(teamPlayers => teamPlayers.map(player => ({...player, loading: true, error: false})));
            dispatch({ type: ADD_MATCH, match });
            try {
                match.players.forEach((teamPlayers, teamIndex) => teamPlayers.forEach(player => {
                    dispatch(getPlayerAndDispatch(GET_PLAYER, LOADING_PLAYER_FAILURE, match.id, teamIndex, player.id, match.mode, player.name, player.platform));
                }));
            } catch(err) {
                console.log(err);
            }
            
        })
        .catch(err => {
            dispatch({ type: ADD_MATCH_FAILURE });
            console.log(err);
        });
    }
};

export const finishMatch = match => {
    return async (dispatch, getState) => {
        const state = getState();
        dispatch({ type: FINISH_MATCH_LOADING, matchId: match.id });
        try {
            await fetch(`${process.env.REACT_APP_API_URL}/sessions/${state.session.code}/${match.id}/status`, {
                method: 'put',
                headers: {
                    authorization: `Bearer ${state.session.token}`
                },
            });
        } catch (error) {
            console.log(error);
        }
        try {
            const result = await processMatchResult(match);
            if(result) {
                fetch(`${process.env.REACT_APP_API_URL}/sessions/${state.session.code}/${match.id}/result`, {
                    method: 'post',
                    headers: {
                        authorization: `Bearer ${state.session.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'finished',
                        result
                    })
                })
                .then(response => {
                    if(!response.ok) {
                        return Promise.reject(new Error(response.statusText));
                    }
                    return response;
                })
                .then(response => {
                    dispatch({ type: FINISH_MATCH, matchId: match.id, result });
                })
                .catch(err => {
                    console.log(err);
                    dispatch({ type: FINISH_MATCH_FAILURE, matchId: match.id, error: 'Error saving match result'});
                }); 
            } else {
                fetch(`${process.env.REACT_APP_API_URL}/sessions/${state.session.code}/${match.id}/result`, {
                    method: 'post',
                    headers: {
                        authorization: `Bearer ${state.session.token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        status: 'error',
                    })
                })
                .then(response => {
                    if(!response.ok) {
                        return Promise.reject(new Error(response.statusText));
                    }
                    return response;
                })
                .then(response => {
                    dispatch({ type: FINISH_MATCH_FAILURE, matchId: match.id, error: 'Unable to determine match result'});
                })
                .catch(err => {
                    console.log(err);
                    dispatch({ type: FINISH_MATCH_FAILURE, matchId: match.id, error: 'Unable to determine match result and error saving match result'});
                });
            }
        } catch (error) {
            dispatch({ type: FINISH_MATCH_FAILURE, matchId: match.id, error: 'Error calculating match result' });
        }        
    }
}

const processMatchResult = async match => {
    try {
        console.log('Processing result');
        var updates;

        // Get updates (repeat if updates do not include the match)
        do {
            updates = await Promise.all(match.players[0].concat(match.players[1]).map(player => getPlayerUpdate(player, match.mode)));
        } while (
            updates.reduce((acc, player) => acc + player.wins) === 0 || // Does not include match if nobody has won
            updates.reduce((acc, player) => acc + player.mvps) === 0 || // Does not include match if nobody has earned an MVP
            updates.reduce((acc, player) => acc + player.goals) === 0 || // Does not include match if nobody has scored
            (updates.slice(0, updates.length / 2).filter(update => update.wins === 0).length && updates.slice(updates.length / 2).filter(update => update.wins === 0).length) // Does not include match if there is at least one player on each team who has not won
        );
        console.log(updates);
        updates = updates.reduce((acc, update, index) => {
            acc[index < updates.length / 2 ? 0 : 1].push(update);
            return acc;
        }, [[],[]]);
        var results = match.players.map(teamPlayers => teamPlayers.map(player => ({})));
        console.log(`Updates retrieved`);
        // Determine who won
        const determineWins = (results, updates) => {
            for (let t = 0; t < updates.length; t++) {
                for (let i = 0; i < updates[t].length; i++) {

                    // If any player has lost all their games
                    if(updates[t][i].wins === 0) {
                        results[t] = results[t].map(player => ({ ...player, wins: 0 }));
                        results[1-t] = results[1-t].map(player => ({ ...player, wins: 1 }));
                        return results;
                    }

                    // If any player has won all their games
                    if(updates[t][i].wins === updates[t][i].games) {
                        results[t] = results[t].map(player => ({ ...player, wins: 1 }));
                        results[1-t] = results[1-t].map(player => ({ ...player, wins: 0 }));
                        return results; 
                    }
                }
            }

            // If only one player has earned an MVP
            const firstTeamMVPs = updates[0].reduce((acc, player) => acc + player.mvps, 0);
            const secondTeamMVPs = updates[1].reduce((acc, player) => acc + player.mvps, 0);
            if (firstTeamMVPs + secondTeamMVPs === 1) {
                results[0] = results[0].map(player => ({ ...player, wins: firstTeamMVPs }));
                results[1] = results[1].map(player => ({ ...player, wins: secondTeamMVPs }));
                return results; 
            }

            return false;
        }

        results = determineWins(results, updates);
        if (!results) {
            // Cannot determine who won
            console.log(match.id + ': Cannot determine who won');
            return;
        }
        const winner = 1 - results[0][0].wins;

        // We know stats of those who have played only once, or stats where total is zero
        var count = 0;
        for (let t = 0; t < updates.length; t++) {
            for (let i = 0; i < updates[t].length; i++) {
                if (updates[t][i].games === 1) {
                    count++;
                    results[t][i] = {
                        ...updates[t][i]
                    };
                } else {
                    ['goals', 'assists', 'saves', 'shots', 'mvps'].forEach(stat => {
                        if(updates[t][i][stat] === 0) {
                            results[t][i][stat] = 0;
                        }
                    });
                }              
            }
        }
        if (count === updates[0].length + updates[1].length) {
            return results; // All players have only played once so all results collected
        }

        // MVP
        // Set losing team MVPs to 0
        results[1-winner] = results[1-winner].map(player => ({ ...player, mvps: 0 }));
        // If already an MVP in results, set other players to 0; Else if only one player with MVPs, they were MVP
        if (results[winner].filter(player => player.mvps).length > 0) {
            results[winner] = results[winner].map(player => ({ ...player, mvps: player.mvps || 0 }));
        } else if (updates[winner].reduce((acc, player) => player.mvps ? acc + 1 : acc, 0) < 2) {
            for (let i = 0; i < updates[winner].length; i++) {
                results[winner][i].mvps = updates[winner][i].mvps === 0 ? 0 : 1;           
            }
        }

        // Goals
        // If we know all winning team's goals...
        if (results[winner].reduce((acc, player) => player.goals ? 0 : acc + 1, 0) === 0) {

            const winningGoals = results[winner].reduce((acc, player) => acc + player.goals, 0);

            // ...and they sum to 1, no losing player scored
            if (winningGoals === 1) {
                results[1-winner] = results[1-winner].map(player => ({ ...player, goals: 0 }));
            } else {
                const losingGoalsSoFar = results[1-winner].reduce((acc, player) => player.goals ? acc + player.goals : acc, 0);

                // If losing goals so far is one less than winning goals, no other losing player scored
                if (losingGoalsSoFar === winningGoals - 1) {
                    results[1-winner] = results[1-winner].map(player => ({ ...player, goals: player.goals || 0 }));
                }
            }            
        }

        // Assists
        // For every goalless pair in a team, the third player got no assists
        for (let t = 0; t < updates.length; t++) {
            for (let i = 0; i < updates[t].length; i++) {
                if (results[t].reduce((acc, player, index) => index !== i && player.goals !== undefined ? acc + player.goals : acc, 0) === 0) {
                    results[t][i].assists = 0;
                }                
            }            
        }

        console.log(results);
        return results;
    } catch (error) {
        console.log(error);
        throw new Error(error);
    }
}

export const editUsername = (matchId, team, playerId, newUsername) => {
    return (dispatch, getState) => {
        const state = getState();
        const matchIndex = state.matches.matches.reduce((acc, m, index) => m.id === matchId ? index : acc, 0);
        const mode = state.matches.matches[matchIndex].mode;
        dispatch({ type: EDIT_USERNAME, matchId, team, playerId, newUsername });
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${state.session.code}/${matchId}/${team}/${playerId}`, {
            method: 'put',
            headers: {
                authorization: `Bearer ${state.session.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newUsername })
        })
        .then(response => {
            if(!response.ok) {
                return Promise.reject(new Error(response.statusText));
            }
            return response;
        })
        .then(response => response.json())
        .then(player => {
            dispatch(getPlayerAndDispatch(GET_PLAYER, LOADING_PLAYER_FAILURE, matchId, team, playerId, mode, player.name, player.platform));  
        })
        .catch(err => {
            console.log(err);
            dispatch({ type: LOADING_PLAYER_FAILURE, matchId, team, playerId });
        })
    }
}