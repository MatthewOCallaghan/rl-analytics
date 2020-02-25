import { CREATE_SESSION, LOADING_SESSION, CREATE_SESSION_FAILURE } from '../actions/session';

const session = (state = {}, action) => {
    switch(action.type) {
        case CREATE_SESSION:
            return { token: action.token, code: action.code, startTime: action.startTime };
        case LOADING_SESSION:
            return { loading: true };
        case CREATE_SESSION_FAILURE:
            return { error: true };
        default:
            return state;
    }
}

export default session;