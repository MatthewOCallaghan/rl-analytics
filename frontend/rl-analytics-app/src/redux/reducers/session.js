import { CREATE_SESSION, LOADING_SESSION, CREATE_SESSION_FAILURE, END_SESSION, GET_SESSION_DATA, GET_SESSION_FAILURE, INVITED, INVITE_LOADING, INVITE_FAILURE } from '../actions/session';
import { SIGN_OUT } from '../actions/user';
import { ACCEPTED_INVITE } from '../actions/display';

const session = (state = {}, action) => {
    switch(action.type) {
        case CREATE_SESSION:
            return { token: action.token, code: action.code, startTime: action.startTime, invited: [], owners: action.owners };
        case LOADING_SESSION:
            return { loading: true };
        case CREATE_SESSION_FAILURE:
            return { error: true };
        case GET_SESSION_DATA:
            return { ...state, invited: action.invited.map(invite => ({ email: invite, status: 'invited' })), owners: action.owners, error: false, loading: false };
        case GET_SESSION_FAILURE:
            return { ...state, error: true };
        case INVITED:
            return { ...state, invited: state.invited.map(invite => invite.email === action.email ? { email: action.email, status: 'invited'} : invite) };
        case INVITE_LOADING:
            return { ...state, invited: state.invited.concat({ email: action.email, status: 'loading' }) };
        case INVITE_FAILURE:
            return { ...state, invited: state.invited.concat({ email: action.email, status: 'error' }) };
        case ACCEPTED_INVITE:
            return { token: action.token, loading: true, code: action.code };
        case END_SESSION:
        case SIGN_OUT:
            return {};
        default:
            return state;
    }
}

export default session;