import React from 'react';

import Logo from '../logo/Logo';
import SignInSignOut from '../sign-in-sign-out/SignInSignOut';

import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div id='layout-container'>
            <Header />
            <main>
                {children}
            </main>
        </div>

    );
}

const Header = () => {
    return (
        <header>
            <Logo />
            <SignInSignOut />
        </header>
    );
}

export default Layout;