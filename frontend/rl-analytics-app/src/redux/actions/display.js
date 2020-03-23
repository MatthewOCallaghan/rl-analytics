import fetch from 'unfetch';

import { getPlayerAndDispatch } from './players';

export const GET_MATCHES = 'DISPLAY__GET_MATCHES';
export const INVALID_CODE = 'DISPLAY__INVALID_CODE';
export const GET_MATCHES_FAILURE = 'DISPLAY__GET_MATCHES_FAILURE';
export const GET_PLAYER = 'DISPLAY__GET_PLAYER';
export const LOADING_PLAYER_FAILURE = 'DISPLAY__LOADING_PLAYER_FAILURE';

export const getMatches = code => {
    return (dispatch, getState) => {
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${code}`)
        .then(response => {
            if(!response.ok) {
                if(response.status === 400) {
                    dispatch({ type: INVALID_CODE, code });
                    return Promise.reject(new Error(400));
                }
                return Promise.reject(new Error(response.statusText));
            }
            return response;
        })
        .then(response => response.json())
        .then(matches => {
            const previousMatches = getState().display.matches;

            matches = matches.map(match => {

                const previousMatch = previousMatches.filter(previousMatch => previousMatch.id === match.id)[0];
                const previousPlayers = previousMatch && previousMatch.players;

                match.players = match.players.map((teamPlayers, team) => teamPlayers.map(player => {
                    const previousPlayer = previousPlayers && previousPlayers[team] && previousPlayers[team].filter(previousPlayer => previousPlayer.id === player.id)[0];

                    if (previousPlayer && player.name === previousPlayer.name) {
                        return { ...previousPlayer, ...player };
                    }

                    if (!match.finished) {
                        dispatch(getPlayerAndDispatch(GET_PLAYER, LOADING_PLAYER_FAILURE, match.id, team, player.id, match.mode, player.name, player.platform));
                    }
                    return { ...player, loading: true, error: false };
                }));

                return match;
            });

            dispatch({ type: GET_MATCHES, matches });
        })
        .catch(err => {
            if(err.message !== 400) {
                dispatch({ type: GET_MATCHES_FAILURE });
                console.log(err);
            }
        });
    }
}