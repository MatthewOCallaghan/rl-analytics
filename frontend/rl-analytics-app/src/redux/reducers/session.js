import { CREATE_SESSION, LOADING_SESSION, CREATE_SESSION_FAILURE, END_SESSION } from '../actions/session';
import { SIGN_OUT } from '../actions/user';

const session = (state = {}, action) => {
    switch(action.type) {
        case CREATE_SESSION:
            return { token: action.token, code: action.code, startTime: action.startTime };
        case LOADING_SESSION:
            return { loading: true };
        case CREATE_SESSION_FAILURE:
            return { error: true };
        case END_SESSION:
        case SIGN_OUT:
            return {};
        default:
            return state;
    }
}

export default session;