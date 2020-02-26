import { GET_MATCHES, GET_MATCHES_FAILURE, INVALID_CODE, GET_PLAYER, LOADING_PLAYER_FAILURE } from '../actions/display';

const display = (state = { matches: [], code: '', invalidCode: false, error: false }, action) => {
    switch(action.type) {
        case GET_MATCHES:
            return { ...state, error: false, code: action.code, invalidCode: false, matches: state.matches.concat(action.matches.slice(state.matches.length)) };
        case GET_MATCHES_FAILURE:
            return { ...state, error: true };
        case INVALID_CODE:
            return { ...state, invalidCode: true };
        case GET_PLAYER:
            return { ...state, matches: state.matches.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? action.player : player) : teamPlayers) } : match) };
        case LOADING_PLAYER_FAILURE:
            return { ...state, matches: state.matches.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? { ...player, loading: false, error: true } : player): teamPlayers)} : match) };
        default:
            return state;
    }
}

export default display;