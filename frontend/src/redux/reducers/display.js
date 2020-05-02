import { 
    GET_MATCHES, GET_MATCHES_FAILURE,
    INVALID_CODE,
    GET_PLAYER, LOADING_PLAYER_FAILURE,
    RECEIVED_INVITE, ACCEPTED_INVITE, REJECTED_INVITE, INVITE_REPLY_LOADING, INVITE_REPLY_FAILURE,
    RESUME_OWNERSHIP_TOKEN,
    CLEAR_DISPLAY
} from '../actions/display';

const INITIAL_STATE = {
    matches: [], 
    code: '', 
    invalidCode: false, 
    error: false
}

const display = (state = INITIAL_STATE, action) => {
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
        case RECEIVED_INVITE:
            return { ...state, invite: { id: action.id } };
        case ACCEPTED_INVITE:
            return { ...state, invite: undefined, acceptedInvite: true };
        case REJECTED_INVITE:
            return { ...state, invite: undefined };
        case INVITE_REPLY_LOADING:
            return { ...state, invite: { id: state.invite.id, loading: true, response: action.response } };
        case INVITE_REPLY_FAILURE:
            return { ...state, invite: { id: state.invite.id, error: true } };
        case RESUME_OWNERSHIP_TOKEN:
            return { ...state, resumeOwnershipToken: action.token };
        case CLEAR_DISPLAY:
            return INITIAL_STATE;
        default:
            return state;
    }
}

export default display;