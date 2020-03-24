import { getIdToken } from '../../firebase/firebase';

export const GET_MATCH_HISTORY = 'USER__GET_MATCH_HISTORY';
export const LOADING_MATCH_HISTORY = 'USER__LOADING_MATCH_HISTORY';
export const MATCH_HISTORY_FAILURE = 'USER__MATCH_HISTORY_FAILURE';

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
                        return response.json(response);
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