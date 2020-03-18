import fetch from 'unfetch';

import { getIdToken } from '../../firebase/firebase';

export const CREATE_SESSION = 'SESSION__CREATE_SESSION';
export const LOADING_SESSION = 'SESSION__LOADING_SESSION';
export const CREATE_SESSION_FAILURE = 'SESSION_CREATE_SESSION_FAILURE';
export const END_SESSION = 'SESSION__END_SESSION';

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
            .then(session => dispatch({ type: CREATE_SESSION, token: session.token, code: session.code, startTime: session.startTime }))
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

export const endSession = () => ({
    type: END_SESSION
});