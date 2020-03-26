import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, Redirect } from 'react-router-dom';

import { signIn, signUp } from '../../redux/actions/user';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Box from '../../components/box/Box';
import Particles from '../../components/particles/Particles';
import TextBox from '../../components/textbox/TextBox';
import Button from '../../components/button/Button';
import Logo from '../../components/logo/Logo';

import './SignInAndSignUp.css';

const SignInAndSignUp = () => {
    const status = useSelector(store => store.user);
    const location = useLocation();
    
    return (
        <>
            {
                status.profile
                    ?   <Redirect to={location.state ? location.state.from.pathname : '/'} />
                    :   <div id='sign-in-and-sign-up-container'>
                            <div style={{position: 'absolute', top: 20}}><Logo /></div>
                            <Particles />
                            <Container>
                                <Row>
                                    <Col xs={12} md={6}>
                                        <SignIn />
                                    </Col>
                                    <Col xs={12} md={6}>
                                        <SignUp />
                                    </Col>
                                </Row>
                            </Container>
                        </div>
            }
        </>
    );
}

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const dispatch = useDispatch();
    const status = useSelector(store => store.user);

    const onSubmit = () => {
        dispatch(signIn(email, password));
        setEmail('');
        setPassword('');
    }

    return (
        <Box colour='blue' style={{marginTop: 10, marginBottom: 10}}>
            <h2>Sign in</h2>
            { status.signIn.error && <p style={{color: 'red'}}>{status.signIn.error.message}</p> }
            <div className='space-evenly'>
                <TextBox type='email' placeholder='Email' value={email} handleOnChange={setEmail} />
                <TextBox type='password' placeholder='Password' value={password} handleOnChange={setPassword} />
                <Button colour='blue' handleOnClick={onSubmit} loading={status.signIn.loading} disabled={!(email.length > 0 && password.length > 0) || status.signUp.loading || status.profile || status.signIn.loading} >Submit</Button>
            </div>
        </Box>
    );
}

const SignUp = () => {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const dispatch = useDispatch();
    const status = useSelector(store => store.user);

    const onSubmit = () => {
        dispatch(signUp(email, password, username));
        setUsername('');
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    return (
        <Box colour='orange' style={{marginTop: 10, marginBottom: 10}}>
            <h2>Sign up</h2>
            { status.signUp.error && <p style={{color: 'red'}}>{status.signUp.error.message}</p> }
            <div className='space-evenly' >
                <div><TextBox placeholder='Username' value={username} handleOnChange={setUsername} helpText={'Steam ID, PSN name or XBOX gamertag'} /></div>
                <TextBox type='email' placeholder='Email' value={email} handleOnChange={setEmail} />
                <TextBox type='password' placeholder='Password' value={password} handleOnChange={setPassword} />
                <TextBox type='password' placeholder='Confirm password' value={confirmPassword} handleOnChange={setConfirmPassword} />
                <Button colour='orange' handleOnClick={onSubmit} loading={status.signUp.loading} disabled={!(email.length > 0 && password.length > 0 && password === confirmPassword && username.length > 0) || status.signUp.loading || status.signIn.loading || status.profile}>Submit</Button>
            </div>
        </Box>
    )
}

export default SignInAndSignUp;