import React from 'react';
import { Link } from 'react-router-dom';

const SignIn = ({ small }) => {
    return (
        <Link to='/signin' style={{color: 'white', fontSize: small ? undefined : '1.5rem'}}>Log in/Sign up</Link>
    );
}

export default SignIn;