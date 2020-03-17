import React from 'react';

import Logo from '../logo/Logo';

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
        </header>
    );
}

export default Layout;