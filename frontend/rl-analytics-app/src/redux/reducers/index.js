import { combineReducers } from "redux";

import matches from './matches';
import session from './session';
import display from './display';
import user from './user';

export default combineReducers({
    matches, session, display, user
});
