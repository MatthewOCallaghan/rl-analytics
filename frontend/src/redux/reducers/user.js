import { SIGN_IN, SIGN_IN_FAILURE, SIGN_IN_LOADING, SIGN_OUT, SIGN_OUT_LOADING, SIGN_OUT_FAILURE, SIGN_UP_FAILURE, SIGN_UP_LOADING } from '../actions/user';

const INITIAL_STATE = {
    profile: null,
    signIn: { loading: false }, 
    signUp: { loading: false }, 
    signOut: { loading: false }
}

const user = (state = INITIAL_STATE, action) => {
    switch(action.type) {
        case SIGN_IN:
            return { ...INITIAL_STATE, profile: action.user };
        case SIGN_IN_FAILURE:
            return { ...INITIAL_STATE, signIn: { loading: false, error: action.error }};
        case SIGN_IN_LOADING:
            return { ...INITIAL_STATE, signIn: { loading: true }};
        case SIGN_OUT:
            return { ...INITIAL_STATE };
        case SIGN_OUT_LOADING:
            return { ...INITIAL_STATE, signOut: { loading: true }};
        case SIGN_OUT_FAILURE:
            return { ...INITIAL_STATE, signOut: { loading: false, error: action.error }};
        case SIGN_UP_FAILURE:
            return { ...INITIAL_STATE, signUp: { loading: false, error: action.error }};
        case SIGN_UP_LOADING:
            return { ...INITIAL_STATE, signUp: { loading: true }};
        default:
            return state;
    }
}

export default user;