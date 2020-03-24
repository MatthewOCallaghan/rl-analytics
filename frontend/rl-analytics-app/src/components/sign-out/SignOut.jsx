import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { signOut } from '../../redux/actions/user';

import './SignOut.css';

const SignOut = () => {
    const user = useSelector(store => store.user.profile);
    const dispatch = useDispatch();

    return (
        <span id='sign-out' onClick={() => dispatch(signOut())} >Sign out: {user.username}</span>
    );
}

export default SignOut;