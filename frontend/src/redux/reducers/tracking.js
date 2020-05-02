import { GET_MATCH_HISTORY, LOADING_MATCH_HISTORY, MATCH_HISTORY_FAILURE, GET_PLAYER_STATS, LOADING_PLAYER_STATS, PLAYER_STATS_FAILURE, CHANGE_MODE_VIEW, REMOVE_PLAYER_TRACKING } from '../actions/tracking';
import { SIGN_OUT } from '../actions/user';

import { GAME_MODES } from '../actions/session';

const INITIAL_STATE = {
    matchHistory: {},
    players: []
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
            return { ...state, players: processPlayers(state.players, action.username, player => ({ username: player.username, data: action.data, colours: player.colours, modes: GAME_MODES.reduce((acc, mode) => ({ ...acc, [mode.title]: true }), {}) }), { username: action.username, data: action.data, modes: GAME_MODES.reduce((acc, mode) => ({ ...acc, [mode.title]: true }), {}), colours: nextColour(state.players) }) };
        case LOADING_PLAYER_STATS:
            return { ...state, players: processPlayers(state.players, action.username, player => ({ username: player.username, loading: true, colours: player.colours }), { username: action.username, loading: true, colours: nextColour(state.players) }) };
        case PLAYER_STATS_FAILURE:
            return { ...state, players: processPlayers(state.players, action.username, player => ({ username: player.username, colours: player.colours, error: true }), { username: action.username, error: true, colours: nextColour(state.players) }) };
        case CHANGE_MODE_VIEW:
            return { ...state, players: state.players.map(player => player.username !== action.username ? player : { ...player, modes: { ...player.modes, [action.mode]: action.show } }) };
        case REMOVE_PLAYER_TRACKING:
            return { ...state, players: state.players.filter(player => player.username !== action.username) };
        case SIGN_OUT:
            return INITIAL_STATE;
        default:
            return state;
    }
}

const nextColour = players => {
    const usedColours = players.map(player => player.colours[0]);
    return COLOURS.filter(colour => !usedColours.includes(colour[0]))[0];
}

const processPlayers = (currentPlayers, username, mapFuncIfExists, newObjIfNotExists) => {
    const alreadyIncluded = currentPlayers.filter(player => player.username === username).length > 0;
    return alreadyIncluded ? currentPlayers.map(player => player.username === username ? mapFuncIfExists(player) : player) : currentPlayers.concat(newObjIfNotExists);
}

export const COLOURS = [
    ['#0000FF', '#87CEFA'],
    ['#964000', '#FFA500'],
    ['#006400', '#7CFC00'],
    ['#4B0082', '#9932CC'],
    ['#FFFF00', '#FFFFE0'],
    ['#8B4513', '#A0522D'],
    ['#FF1493', '#FFC0CB']
];

export default tracking;