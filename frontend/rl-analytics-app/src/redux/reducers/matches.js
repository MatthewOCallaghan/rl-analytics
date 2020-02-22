import { TEST } from '../actions/matches';

const matches = (state = { test: false }, action) => {
    switch(action.type) {
        case TEST:
            return {
                ...state,
                test: true
            };
        default:
            return state;
    }
}

export default matches;