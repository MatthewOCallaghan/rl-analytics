import { GET_PLAYER, LOADING_PLAYER_FAILURE, ADD_MATCH, ADD_MATCH_FAILURE, LOADING_NEW_MATCH, EDIT_USERNAME, FINISH_MATCH, FINISH_MATCH_FAILURE, FINISH_MATCH_LOADING } from '../actions/matches';
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
            return { ...state, matches: state.matches.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? { ...player, ...action.player, loading: false, error: false } : player) : teamPlayers) } : match) };
        case LOADING_PLAYER_FAILURE:
            return { ...state, matches: state.matches.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? { ...player, loading: false, error: true } : player): teamPlayers)} : match) };
        case EDIT_USERNAME:
            return { ...state, matches: state.matches.map(match => match.id === action.match ? { ...match, players: match.players.map((teamPlayers, index) => index === action.team ? teamPlayers.map(player => player.id === action.player ? { id: player.id, name: action.newUsername, loading: true, error: false } : player): teamPlayers)} : match) };
        case FINISH_MATCH:
            return { ...state, matches: state.matches.map(match => match.id === action.matchId ? { ...match, finished: true, completing: false, players: match.players.map((teamPlayers, teamIndex) => teamPlayers.map((player, playerIndex) => ({ ...player, result: action.result[teamIndex][playerIndex] }))) } : match) };
        case FINISH_MATCH_LOADING:
            return { ...state, matches: state.matches.map(match => match.id === action.matchId ? { ...match, completing: true } : match) };
        case FINISH_MATCH_FAILURE:
            return { ...state, matches: state.matches.map(match => match.id === action.matchId ? { ...match, errorFinishing: true, completing: false } : match) };
        default:
            return state;
    }
}

export default matches;