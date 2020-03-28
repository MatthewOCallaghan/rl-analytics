import fetch from 'unfetch';

import { getIdToken } from '../../firebase/firebase';

import { getPlayerAndDispatch } from './players';

import { GET_PLAYER, LOADING_PLAYER_FAILURE } from './matches';

export const CREATE_SESSION = 'SESSION__CREATE_SESSION';
export const LOADING_SESSION = 'SESSION__LOADING_SESSION';
export const CREATE_SESSION_FAILURE = 'SESSION_CREATE_SESSION_FAILURE';
export const END_SESSION = 'SESSION__END_SESSION';

export const GET_SESSION_DATA = 'SESSION__GET_SESSION_DATA';
export const GET_SESSION_FAILURE = 'SESSION__GET_SESSION_FAILURE';

export const INVITE_LOADING = 'SESSION__INVITE_LOADING';
export const INVITED = 'SESSION__INVITED';
export const INVITE_FAILURE = 'SESSION__INVITE_FAILURE';

export const createSession = () => {
    return async (dispatch, getState) => {
        dispatch({ type: LOADING_SESSION });

        const user = getState().user;

        try {
            const fetchProperties = {
                method: 'POST'
            };
            if (user.profile) {
                fetchProperties.headers = {
                    authorization: `Bearer ${await getIdToken()}`
                };
            }

            fetch(`${process.env.REACT_APP_API_URL}/sessions`, fetchProperties)
            .then(response => {
                if(!response.ok) {
                    return Promise.reject(new Error(response.statusText));
                }
                return response;
            })
            .then(response => response.json())
            .then(session => dispatch({ type: CREATE_SESSION, token: session.token, code: session.code, startTime: session.startTime, owners: [session.email] }))
            .catch(err => {
                dispatch({ type: CREATE_SESSION_FAILURE });
                console.log(err);
            });
        } catch (error) {
            dispatch({ type: CREATE_SESSION_FAILURE });
            console.log(error);
        }
    }
}

export const addSessionOwner = (sessionCode, sessionToken, ownerToken) => {
    fetch(`${process.env.REACT_APP_API_URL}/sessions/${sessionCode}/owners`, {
        method: 'post',
        headers: {
            authorization: `Bearer ${sessionToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            ownerToken
        })
    })
    .catch(console.log);
}

export const endSession = () => ({
    type: END_SESSION
});

export const getSessionData = () => {
    return (dispatch, getState) => {
        const state = getState();
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${state.session.code}`, {
            headers: {
                authorization: `Bearer ${state.session.token}`
            }
        })
        .then(response => {
            if(!response.ok) {
                return Promise.reject(new Error(response.statusText));
            }
            return response;
        })
        .then(response => response.json())
        .then(sessionData => {
            let matches = sessionData.matches;

            const previousMatches = getState().matches.matches;

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

            dispatch({ type: GET_SESSION_DATA, matches, invited: sessionData.invited, owners: sessionData.owners });
        })
        .catch(err => {
            console.log(err);
            dispatch({ type: GET_SESSION_FAILURE });
        })
    }
}

export const invite = (email) => {
    return (dispatch, getState) => {
        const session = getState().session;
        dispatch({ type: INVITE_LOADING, email });
        fetch(`${process.env.REACT_APP_API_URL}/sessions/${session.code}/invites`, {
            method: 'post',
            headers: {
                authorization: `Bearer ${session.token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                email
            })
        })
        .then(response => {
            if(!response.ok) {
                return Promise.reject(new Error(response.statusText));
            }
            return response.json();
        })
        .then(invite => dispatch({ type: INVITED, email: invite.user_email }))
        .catch(err => {
            console.log(err);
            dispatch({ type: INVITE_FAILURE, email });
        });
    }
}

export const GAME_MODES = [
    {
        title: 'Ranked Duel 1v1',
        label: 'Solo Duel',
        players: 1
    },
    {
        title: 'Ranked Doubles 2v2',
        label: 'Doubles',
        players: 2
    },
    {
        title: 'Ranked Standard 3v3',
        label: 'Standard',
        players: 3
    },
    {
        title: 'Ranked Solo Standard 3v3',
        label: 'Solo Standard',
        players: 3
    },
    {
        title: 'Hoops',
        label: 'Hoops',
        players: 2
    },
    {
        title: 'Rumble',
        label: 'Rumble',
        players: 3
    },
    {
        title: 'Dropshot',
        label: 'Dropshot',
        players: 3
    },
];