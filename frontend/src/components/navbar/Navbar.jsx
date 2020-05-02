import React from 'react';
import { useSelector } from 'react-redux';

import Logo from '../logo/Logo';
import SignInSignOut from '../sign-in-sign-out/SignInSignOut';
import { Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import './Navbar.css';

const NavigationBar = ({ landing }) => {
    const user = useSelector(store => store.user.profile);
    const session = useSelector(store => store.session);

    return (
        <Navbar expand={landing ? 'sm' : 'md'} variant='dark' id='navbar' className={landing ? 'landing-nav' : ''}>
            { !landing && <Navbar.Brand><Logo /></Navbar.Brand> }
            {
                user && user.email
                    ?   <>
                            <Navbar.Toggle />
                            <Navbar.Collapse className={landing ? 'landing-nav' : ''}>
                                <Nav>
                                    <Link className={landing ? 'landing-nav' : ''} to='/session'>{session.token ? 'Continue session' : 'New session'}</Link>
                                    <Link className={landing ? 'landing-nav' : ''} to='/display'>View session</Link>
                                    <Link className={landing ? 'landing-nav' : ''} to='/matches'>Match history</Link>
                                    <Link className={landing ? 'landing-nav' : ''} to='/tracking'>Stats tracker</Link>
                                    <SignInSignOut smallSignOut={user && user.email} landing={landing} />
                                </Nav>
                            </Navbar.Collapse>
                        </>
                    :   <SignInSignOut small/>
            }
            
        </Navbar>
    );
}

export default NavigationBar;