import React from 'react';
import { Link } from 'react-router-dom';

import Particles from '../../components/particles/Particles';
// import Container from 'react-bootstrap/Container';
// import Row from 'react-bootstrap/Row';
// import Col from 'react-bootstrap/Col';

import './404.css';

const NotFound = () => {
    return (
        <div id='page-404' className='container-vertically-centre'>
            <Particles />
            <span id='title-404'>404</span>
            <p>Well, that wasn't supposed to happen. Why not return <Link to='/' replace>home</Link>?</p>
        </div>
    );
}

export default NotFound;