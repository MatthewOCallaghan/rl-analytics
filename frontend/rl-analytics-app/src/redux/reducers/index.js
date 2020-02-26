import { combineReducers } from "redux";

import matches from './matches';
import session from './session';
import display from './display';

export default combineReducers({
    matches, session, display
});
