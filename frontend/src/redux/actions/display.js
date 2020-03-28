import fetch from 'unfetch';

import { getIdToken } from '../../firebase/firebase';

import { getPlayerAndDispatch } from './players';
import { getSessionData } from './session';

export const GET_MATCHES = 'DISPLAY__GET_MATCHES';
export const INVALID_CODE = 'DISPLAY__INVALID_CODE';
export const GET_MATCHES_FAILURE = 'DISPLAY__GET_MATCHES_FAILURE';
export const GET_PLAYER = 'DISPLAY__GET_PLAYER';
export const LOADING_PLAYER_FAILURE = 'DISPLAY__LOADING_PLAYER_FAILURE';

export const RECEIVED_INVITE = 'DISPLAY__RECEIVED_INVITE';

export const ACCEPTED_INVITE = 'DISPLAY__REPLIED_TO_INVITE';
export const REJECTED_INVITE = 'DISPLAY__REJECTED_INVITE';
export const INVITE_REPLY_LOADING = 'DISPLAY_INVITE_REPLY_LOADING';
export const INVITE_REPLY_FAILURE = 'DISPLAY__INVITE_REPLY_FAILURE';

export const CLEAR_DISPLAY = 'DISPLAY__CLEAR_DISPLAY';

export const RESUME_OWNERSHIP_TOKEN = 'DISPLAY__RESUME_OWNERSHIP_TOKEN';

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

export const checkInvites = code => {
    return async dispatch => {
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${code}/invites`, {
            headers: {
                authorization:  `Bearer ${await getIdToken()}`
            }
        })
        .then(response => {
            if(!response.ok) {
                return Promise.reject(new Error(response.statusText));
            }
            return response;
        })
        .then(response => response.json())
        .then(invite => {
            if (invite.id) {
                dispatch({ type: RECEIVED_INVITE, id: invite.id });
            }
        })
        .catch(console.log);
    }
}

export const replyToInvite = (response, code) => {
    return async (dispatch, getState) => {
        const state = getState();
        dispatch({ type: INVITE_REPLY_LOADING, response });
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${code}/invites/${state.display.invite.id}`, {
            method: 'put',
            headers: {
                authorization: `Bearer ${await getIdToken()}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                response
            })
        })
        .then(response => {
            if (!response.ok) {
                return Promise.reject(new Error(response.statusText));
            }
            return response.json();
        })
        .then(token => {
            if (response === 'accept') {
                dispatch({ type: ACCEPTED_INVITE, token, code });
                dispatch(getSessionData());
            } else {
                dispatch({ type: RECEIVED_INVITE });
            }
        })
        .catch(err => {
            console.log(err);
            dispatch({ type: INVITE_REPLY_FAILURE });
        });
    }
}

export const checkIfCanResumeOwnership = code => {
    return async dispatch => {
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${code}/owner`, {
            headers: {
                authorization:  `Bearer ${await getIdToken()}`
            }
        })
        .then(response => {
            if(!response.ok) {
                return Promise.reject(new Error(response.statusText));
            }
            return response;
        })
        .then(response => response.json())
        .then(response => {
            if (response.token) {
                dispatch({ type: RESUME_OWNERSHIP_TOKEN, token: response.token });
            }
        })
        .catch(console.log);
    }
}

export const clearDisplay = () => ({ type: CLEAR_DISPLAY });