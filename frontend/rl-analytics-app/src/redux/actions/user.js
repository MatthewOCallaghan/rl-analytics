import { createUser as firebaseCreateUser, signIn as firebaseSignIn, signOut as firebaseSignOut, getIdToken } from '../../firebase/firebase';
import { addSessionOwner } from './session';

export const SIGN_IN = 'USER__SIGN_IN';
export const SIGN_IN_FAILURE = 'USER__SIGN_IN_FAILURE';
export const SIGN_IN_LOADING = 'USER__SIGN_IN_LOADING'
// export const SIGN_UP = 'USER__SIGN_UP';
export const SIGN_UP_LOADING = 'USER__SIGN_UP_LOADING';
export const SIGN_UP_FAILURE = 'USER__SIGN_UP_FAILURE';
export const SIGN_OUT = 'USER__SIGN_OUT';
export const SIGN_OUT_LOADING = 'USER__SIGN_OUT_LOADING';
export const SIGN_OUT_FAILURE = 'USER__SIGN_OUT_FAILURE';

export const signIn = (email, password) => {
    return (dispatch, getState) => {
        dispatch({ type: SIGN_IN_LOADING });
        firebaseSignIn(email, password)
        .then(user => {
            dispatch({ type: SIGN_IN, user: { email: user.user.email, username: user.user.displayName } });
            const session = getState().session;
            if (session.token && session.code) {
                getIdToken()
                    .then(userToken => addSessionOwner(session.code, session.token, userToken))
                    .catch(console.log);
            }
        })
        .catch(error => dispatch({ type: SIGN_IN_FAILURE, error: getErrorMessage(error.code) }));
    }
}

const getErrorMessage = errorCode => {
    switch (errorCode) {
        case 'auth/invalid-email':
            return 'Invalid email address format';
        case 'auth/user-not-found':
        case 'auth/wrong-password':
            return 'Incorrect email or password';
        case 'auth/weak-password':
            return 'Password must be at least 6 characters';
        case 'auth/email-already-in-use':
            return 'Account for that email address already exists';
        default:
            return 'Sorry, something went wrong...';
    }
}

export const signUp = (email, password, username) => {
    return (dispatch, getState) => {
        dispatch({ type: SIGN_UP_LOADING });
        firebaseCreateUser(email, password)
        .then(user => {
            if (user) {
                user.user.updateProfile({ displayName: username })
                .then(() => dispatch({ type: SIGN_IN, user: { email: user.user.email, username: user.user.displayName } }))
                .catch(error => dispatch({ type: SIGN_UP_FAILURE, error }))
                .then(() => {
                    const session = getState().session;
                    if (session.token && session.code) {
                        getIdToken()
                            .then(userToken => addSessionOwner(session.code, session.token, userToken))
                            .catch(console.log);
                    }
                });
            }
        })
        .catch(error => dispatch({ type: SIGN_UP_FAILURE, error: getErrorMessage(error.code) }));
    }
}

export const signOut = () => {
    return dispatch => {
        dispatch({ type: SIGN_OUT_LOADING });
        firebaseSignOut()
        .then(user => dispatch({ type: SIGN_OUT }))
        .catch(error => dispatch({ type: SIGN_OUT_FAILURE, error }));
    }
}

export const storeUserDetails = (email, username) => {
    return dispatch => dispatch({ type: SIGN_IN, user: { email, username } });
}