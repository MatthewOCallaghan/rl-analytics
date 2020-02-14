import React from 'react';
import { Link } from 'react-router-dom';

import './Layout.css';

const Layout = ({ children }) => {
    return (
        <>
            <Header />
            <main>
                {children}
            </main>
        </>

    );
}

const Header = () => {
    return (
        <header>
            <span id='logo'>
                <Link to='/'>
                    <span style={{color: 'blue'}}>R</span>
                    <span style={{color: 'orange'}}>L</span>
                    Analytics
                </Link>
            </span>
        </header>
    );
}

export default Layout;