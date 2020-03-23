import { GET_MATCHES, GET_MATCHES_FAILURE, INVALID_CODE, GET_PLAYER, LOADING_PLAYER_FAILURE } from '../actions/display';

const display = (state = { matches: [], code: '', invalidCode: false, error: false }, action) => {
    switch(action.type) {
        case GET_MATCHES:
            return { ...state, error: false, code: action.code, invalidCode: false, matches: action.matches };
        case GET_MATCHES_FAILURE:
            return { ...state, error: true };
        case INVALID_CODE:
            return { ...state, invalidCode: { code: action.code } };
        case GET_PLAYER:
            return { ...state, matches: state.matches.map(match => match.id === action.matchId ? { ...match, players: match.players.map((teamPlayers, index) => index === action.team ? teamPlayers.map(player => player.id === action.playerId && player.name === action.player.name ? { ...player, ...action.player, loading: false, error: false } : player) : teamPlayers) } : match) };
        case LOADING_PLAYER_FAILURE:
            return { ...state, matches: state.matches.map(match => match.id === action.matchId ? { ...match, players: match.players.map((teamPlayers, index) => index === action.team ? teamPlayers.map(player => player.id === action.playerId && player.name === action.playerName ? { ...player, loading: false, error: true } : player): teamPlayers)} : match) };
        default:
            return state;
    }
}

export default display;