// import fetch from 'unfetch';

export const CREATE_SESSION = 'SESSION__CREATE_SESSION';
export const LOADING_SESSION = 'SESSION__LOADING_SESSION';
export const CREATE_SESSION_FAILURE = 'SESSION_CREATE_SESSION_FAILURE';
export const END_SESSION = 'SESSION__END_SESSION';

export const createSession = () => {
    console.log(process.env.REACT_APP_API_URL);
    return dispatch => {
        dispatch({ type: LOADING_SESSION });
        fetch(`${process.env.REACT_APP_API_URL}/sessions`, {
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

export const endSession = () => ({
    type: END_SESSION
});