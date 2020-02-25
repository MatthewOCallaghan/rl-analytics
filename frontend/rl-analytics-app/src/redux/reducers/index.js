import { combineReducers } from "redux";

import matches from './matches';
import session from './session';

export default combineReducers({
    matches, session
});
