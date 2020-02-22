import { GET_PLAYER, LOADING_PLAYER_FAILURE, ADD_MATCH } from '../actions/matches';

const matches = (state = [], action) => {
    switch(action.type) {
        case ADD_MATCH:
            return state.concat([action.match]);
        case GET_PLAYER:
            return state.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? action.player : player) : teamPlayers) } : match);
        case LOADING_PLAYER_FAILURE:
            return state.map((match, index) => index === action.matchIndex ? { ...match, players: match.players.map((teamPlayers, index) => index === action.teamIndex ? teamPlayers.map((player, index) => index === action.playerIndex ? { ...player, loading: false, error: true } : player): teamPlayers)} : match);
        default:
            return state;
    }
}

export default matches;