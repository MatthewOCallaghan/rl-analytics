import React from 'react';
import { useSelector } from 'react-redux';

import Logo from '../logo/Logo';
import SignInSignOut from '../sign-in-sign-out/SignInSignOut';
import { Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

import './Navbar.css';

const NavigationBar = () => {
    const user = useSelector(store => store.user.profile);
    const session = useSelector(store => store.session);

    // return (
    //     <header>
    //         <Logo />
    //         {
    //             user && user.email &&
    //             <nav>
    //                 {/* <Link to='/session'>{session.token ? 'Continue session' : 'New session'}</Link>
    //                 <Link to='/display'>View session</Link> */}
    //                 <Link to='/matches'>Match history</Link>
    //             </nav>
    //         }
    //         <SignInSignOut smallSignOut={user && user.email} />
    //     </header>
    // );

    return (
        <Navbar expand='md' variant='dark' id='navbar'>
            <Navbar.Brand><Logo /></Navbar.Brand>
            {
                user && user.email
                    ?   <>
                            <Navbar.Toggle />
                            <Navbar.Collapse>
                                <Nav>
                                    <Link to='/session'>{session.token ? 'Continue session' : 'New session'}</Link>
                                    <Link to='/display'>View session</Link>
                                    <Link to='/matches'>Match history</Link>
                                    <Link to='/tracking'>Stats tracker</Link>
                                    <SignInSignOut smallSignOut={user && user.email} />
                                </Nav>
                            </Navbar.Collapse>
                        </>
                    :   <SignInSignOut small/>
            }
            
        </Navbar>
    );
}

export default NavigationBar;