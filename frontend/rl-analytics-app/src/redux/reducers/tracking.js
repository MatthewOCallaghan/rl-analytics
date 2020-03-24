import { GET_MATCH_HISTORY, LOADING_MATCH_HISTORY, MATCH_HISTORY_FAILURE } from '../actions/tracking';

const tracking = (state={ matchHistory: {} }, action) => {
    switch(action.type) {
        case GET_MATCH_HISTORY:
            return { ...state, matchHistory: { matches: action.matches } };
        case LOADING_MATCH_HISTORY:
            return { ...state, matchHistory: { loading: true } };
        case MATCH_HISTORY_FAILURE:
            return { ...state, matchHistory: { error: true } };
        default:
            return state;
    }
}

export default tracking;