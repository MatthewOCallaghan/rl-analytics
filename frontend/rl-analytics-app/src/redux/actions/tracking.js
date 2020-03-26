import { getIdToken } from '../../firebase/firebase';

export const GET_MATCH_HISTORY = 'TRACKING__GET_MATCH_HISTORY';
export const LOADING_MATCH_HISTORY = 'TRACKING__LOADING_MATCH_HISTORY';
export const MATCH_HISTORY_FAILURE = 'TRACKING__MATCH_HISTORY_FAILURE';

export const LOADING_PLAYER_STATS = 'TRACKING__LOADING_PLAYER_STATS';
export const GET_PLAYER_STATS = 'TRACKING__GET_PLAYER_STATS';
export const PLAYER_STATS_FAILURE = 'TRACKING__PLAYER_STATS_FAILURE';
export const CHANGE_MODE_VIEW = 'TRACKING__CHANGE_MODE_VIEW';
export const REMOVE_PLAYER_TRACKING = 'TRACKING__REMOVE_PLAYER_TRACKING';

export const getMatchHistory = () => {
    return dispatch => {
        dispatch({ type: LOADING_MATCH_HISTORY });
        getIdToken()
            .then(token => {
                fetch(`${process.env.REACT_APP_API_URL}/matches`, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    return Promise.reject(new Error(response.statusText));
                })
                .then(matches => dispatch({ type: GET_MATCH_HISTORY, matches }))
                .catch(err => {
                    console.log(err);
                    dispatch({ type: MATCH_HISTORY_FAILURE });
                });
            })
            .catch(err => {
                console.log(err);
                dispatch({ type: MATCH_HISTORY_FAILURE });
            });       
    }
}

export const getPlayerStats = (username) => {
    return dispatch => {
        dispatch({ type: LOADING_PLAYER_STATS, username });
        getIdToken()
            .then(token => {
                fetch(`${process.env.REACT_APP_API_URL}/players/${username}`, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })
                .then(response => {
                    if (response.ok) {
                        return response.json();
                    }
                    return Promise.reject(new Error(response.statusText));
                })
                .then(data => dispatch({ type: GET_PLAYER_STATS, data, username }))
                .catch(err => {
                    console.log(err);
                    dispatch({ type: PLAYER_STATS_FAILURE, username });
                });
            })
            .catch(err => {
                console.log(err);
                dispatch({ type: PLAYER_STATS_FAILURE, username });
            });  
    }
}

export const changeModeView = (username, mode, show) => ({ type: CHANGE_MODE_VIEW, username, mode, show });

export const removePlayerTracking = username => ({ type: REMOVE_PLAYER_TRACKING, username });