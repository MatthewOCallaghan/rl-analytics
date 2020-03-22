import { createUser as firebaseCreateUser, signIn as firebaseSignIn, signOut as firebaseSignOut } from '../../firebase/firebase';

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
    return dispatch => {
        dispatch({ type: SIGN_IN_LOADING });
        firebaseSignIn(email, password)
        .then(user => dispatch({ type: SIGN_IN, user: { email: user.user.email } }))
        .catch(error => dispatch({ type: SIGN_IN_FAILURE, error }));
    }
}

export const signUp = (email, password) => {
    return dispatch => {
        dispatch({ type: SIGN_UP_LOADING });
        firebaseCreateUser(email, password)
        .then(user => dispatch({ type: SIGN_IN, user: { email: user.user.email } }))
        .catch(error => dispatch({ type: SIGN_UP_FAILURE, error }));
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