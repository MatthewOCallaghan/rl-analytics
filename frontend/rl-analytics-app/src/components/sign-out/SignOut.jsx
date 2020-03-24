import React from 'react';
import { useDispatch } from 'react-redux';

import { Link } from 'react-router-dom';

import { signOut } from '../../redux/actions/user';

import './SignOut.css';

const SignOut = () => {
    // const user = useSelector(store => store.user.profile);
    const dispatch = useDispatch();

    return (
        <Link to='/' style={{color: 'white', fontSize: '1.5rem'}}>
            <span id='sign-out' onClick={() => dispatch(signOut())} >Sign out</span>
        </Link>
    );
}

export default SignOut;