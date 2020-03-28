import React from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { Link } from 'react-router-dom';

import { signOut } from '../../redux/actions/user';

import './SignOut.css';

const SignOut = ({ full, small, landing }) => {
    const user = useSelector(store => store.user.profile);
    const dispatch = useDispatch();

    return (
        <Link className={landing ? 'landing-nav' : ''} to='/' style={{color: 'white', fontSize: small ? 'undefined' : '1.5rem'}}>
            <span id='sign-out' onClick={() => dispatch(signOut())} >Sign out{full ? `: ${user.username}` : ''}</span>
        </Link>
    );
}

export default SignOut;