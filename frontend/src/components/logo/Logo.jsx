import React from 'react';
import { Link } from 'react-router-dom';

import './Logo.css';

const Logo = () => {
    return (
        <span id='logo'>
            <Link to='/'>
                <span style={{color: 'blue'}}>R</span>
                <span style={{color: 'orange'}}>L</span>
                Analytics
            </Link>
        </span>
    );
}

export default Logo;