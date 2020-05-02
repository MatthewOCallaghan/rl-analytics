import React from 'react';

import Navbar from '../navbar/Navbar';

import './Layout.css';

const Layout = ({ children }) => {
    return (
        <div id='layout-container'>
            <header>
                <Navbar />
            </header>
            <main>
                {children}
            </main>
        </div>

    );
}

export default Layout;