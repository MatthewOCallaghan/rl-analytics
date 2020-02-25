export const CREATE_SESSION = 'SESSION__CREATE_SESSION';
export const LOADING_SESSION = 'SESSION__LOADING_SESSION';
export const CREATE_SESSION_FAILURE = 'SESSION_CREATE_SESSION_FAILURE';

export const createSession = () => {
    return dispatch => {
        dispatch({ type: LOADING_SESSION });
        fetch(`http://localhost:3001/sessions`, {
            method: 'POST'
        })
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
        })
    }
}