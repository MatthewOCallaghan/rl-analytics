import React from 'react';
import { useSelector } from 'react-redux';

import SignIn from '../sign-in/SignIn';
import SignOut from '../sign-out/SignOut';

const SignInSignOut = ({ fullSignOut, smallSignOut, small, landing }) => {
    const user = useSelector(store => store.user);

    return user.profile ?<SignOut full={fullSignOut} small={small || smallSignOut} landing={landing} /> : <SignIn small={small} />;
}

export default SignInSignOut;