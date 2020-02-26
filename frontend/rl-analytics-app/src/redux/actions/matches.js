import fetch from 'unfetch';

import { getPlayer } from './players';

export const ADD_MATCH = 'MATCHES__ADD_MATCH';
export const ADD_MATCH_FAILURE = 'MATCHES__ADD_MATCH_FAILURE';
export const LOADING_NEW_MATCH = 'LOADING__NEW_MATCH';
export const GET_PLAYER = 'MATCHES__GET_PLAYER';
export const LOADING_PLAYER_FAILURE = 'MATCHES__LOADING_PLAYER_FAILURE';

export const addMatch = match => {
    return (dispatch, getState) => {
        dispatch({ type: LOADING_NEW_MATCH });
        const state = getState();
        fetch(`http://localhost:3001/sessions/${state.session.code}`, {
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
            const matchIndex = getState().matches.matches.length;
            match.players = match.players.map(teamPlayers => teamPlayers.map(player => ({...player, loading: true, error: false})));
            dispatch({ type: ADD_MATCH, match });
            try {
                match.players.forEach((teamPlayers, teamIndex) => teamPlayers.forEach((player, playerIndex) => {
                    dispatch(getPlayer(GET_PLAYER, LOADING_PLAYER_FAILURE, matchIndex, teamIndex, playerIndex, match.mode, player.name, player.platform));
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