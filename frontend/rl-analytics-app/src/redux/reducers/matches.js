import { GET_PLAYER, LOADING_PLAYER_FAILURE, ADD_MATCH, ADD_MATCH_FAILURE, LOADING_NEW_MATCH } from '../actions/matches';
import { END_SESSION } from '../actions/session';

const matches = (state = { matches: [], loading: false, error: false }, action) => {
    switch(action.type) {
        case END_SESSION:
            return { matches: [], loading: false, error: false };
        case ADD_MATCH:
            return { loading: false, error: false, matches: state.matches.concat([action.match]) };
        case ADD_MATCH_FAILURE:
            return { ...state, loading: false, error: true };
        case LOADING_NEW_MATCH:
            return { ...state, loading: true, error: false };
        case GET_PLAYER:
            return { ...state, matches: state.matches.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? action.player : player) : teamPlayers) } : match) };
        case LOADING_PLAYER_FAILURE:
            return { ...state, matches: state.matches.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? { ...player, loading: false, error: true } : player): teamPlayers)} : match) };
        default:
            return state;
    }
}

export default matches;