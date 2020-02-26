import fetch from 'unfetch';

import { getPlayer } from './players';

export const GET_MATCHES = 'DISPLAY__GET_MATCHES';
export const INVALID_CODE = 'DISPLAY__INVALID_CODE';
export const GET_MATCHES_FAILURE = 'DISPLAY__GET_MATCHES_FAILURE';
export const GET_PLAYER = 'DISPLAY__GET_PLAYER';
export const LOADING_PLAYER_FAILURE = 'DISPLAY__LOADING_PLAYER_FAILURE';

export const getMatches = code => {
    return (dispatch, getState) => {
        fetch(`http://localhost:3001/sessions/${code}`)
        .then(response => {
            if(!response.ok) {
                if(response.status === 400) {
                    dispatch({ type: INVALID_CODE });
                    return Promise.reject(new Error(400));
                }
                return Promise.reject(new Error(response.statusText));
            }
            return response;
        })
        .then(response => response.json())
        .then(matches => {
            const previousMatchesCount = getState().display.matches.length;
            matches = matches.map(match => ({...match, players: match.players.map(teamPlayers => teamPlayers.map(player => ({...player, loading: true, error: false}))) }));
            dispatch({ type: GET_MATCHES, matches });
            if (matches.length > 0 && matches.length > previousMatchesCount) {
                const matchIndex = matches.length - 1;
                matches[matchIndex].players.forEach((teamPlayers, teamIndex) => teamPlayers.forEach((player, playerIndex) => {
                    dispatch(getPlayer(GET_PLAYER, LOADING_PLAYER_FAILURE, matchIndex, teamIndex, playerIndex, matches[matchIndex].mode, player.name, player.platform));
                }));
            }
        })
        .catch(err => {
            if(err.message !== 400) {
                dispatch({ type: GET_MATCHES_FAILURE });
                console.log(err);
            }
        });
    }
}