import { GET_MATCH_HISTORY, LOADING_MATCH_HISTORY, MATCH_HISTORY_FAILURE, GET_PLAYER_STATS, LOADING_PLAYER_STATS, PLAYER_STATS_FAILURE, CHANGE_MODE_VIEW, REMOVE_PLAYER_TRACKING } from '../actions/tracking';
import { SIGN_OUT } from '../actions/user';

import { GAME_MODES } from '../actions/session';

const INITIAL_STATE = {
    matchHistory: {},
    players: {}
}

const tracking = (state=INITIAL_STATE, action) => {
    switch(action.type) {
        case GET_MATCH_HISTORY:
            return { ...state, matchHistory: { matches: action.matches } };
        case LOADING_MATCH_HISTORY:
            return { ...state, matchHistory: { loading: true } };
        case MATCH_HISTORY_FAILURE:
            return { ...state, matchHistory: { error: true } };
        case GET_PLAYER_STATS:
            return { ...state, players: { ...state.players, [action.username]: { data: action.data, modes: GAME_MODES.reduce((acc, mode) => ({ ...acc, [mode.title]: true }), {}) } } };
        case LOADING_PLAYER_STATS:
            return { ...state, players: { ...state.players, [action.username]: { loading: true } } };
        case PLAYER_STATS_FAILURE:
            return { ...state, players: { ...state.players, [action.username]: { error: true } } };
        case CHANGE_MODE_VIEW:
            return { ...state, players: { ...state.players, [action.username]: { ...state.players[action.username], modes: { ...state.players[action.username].modes, [action.mode]: action.show } } } };
        case REMOVE_PLAYER_TRACKING:
            delete state.players[action.username];
            return state;
        case SIGN_OUT:
            return INITIAL_STATE;
        default:
            return state;
    }
}

// const STATS = ['goals', 'assists', 'saves', 'shots', 'mvps']

export default tracking;