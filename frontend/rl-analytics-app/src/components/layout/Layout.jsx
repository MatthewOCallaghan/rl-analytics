import React from 'react';
import { useSelector } from 'react-redux';

import Logo from '../logo/Logo';
import SignInSignOut from '../sign-in-sign-out/SignInSignOut';
import { Link } from 'react-router-dom';

import Navbar from 'react-bootstrap/Navbar';
import Nav from 'react-bootstrap/Nav';

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

    const user = useSelector(store => store.user.profile);
    // const session = useSelector(store => store.session);

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
        <header>
            <Navbar expand='md' variant='dark'>
                <Navbar.Brand><Logo /></Navbar.Brand>
                {
                    user && user.email
                        ?   <>
                                <Navbar.Toggle />
                                <Navbar.Collapse>
                                    <Nav>
                                        <Link to='/matches'>Match history</Link>
                                        <Link to='/tracking'>Stats tracker</Link>
                                        <SignInSignOut smallSignOut={user && user.email} />
                                    </Nav>
                                </Navbar.Collapse>
                            </>
                        :   <SignInSignOut small/>
                }
                
            </Navbar>
        </header>
    )
}

export default Layout;