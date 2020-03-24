import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import { signOut } from '../../redux/actions/user';

import './SignOut.css';

const SignOut = () => {
    const user = useSelector(store => store.user.profile);
    const dispatch = useDispatch();

    return (
        <Link to='/' style={{color: 'white', fontSize: '1.5rem'}}>
            <span id='sign-out' onClick={() => dispatch(signOut())} >Sign out: {user.username}</span>
        </Link>
    );
}

export default SignOut;