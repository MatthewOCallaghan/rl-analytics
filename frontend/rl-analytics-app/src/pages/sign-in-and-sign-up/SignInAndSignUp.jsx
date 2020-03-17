import React, { useState } from 'react';

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
    return (
        <div id='sign-in-and-sign-up-container'>
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
    );
}

const SignIn = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const onSubmit = () => {
        setEmail('');
        setPassword('');
    }

    return (
        <Box colour='blue' style={{marginTop: 10, marginBottom: 10}}>
            <h2>Sign in</h2>
            <div className='space-evenly'>
                <TextBox type='email' placeholder='Email' value={email} handleOnChange={setEmail} />
                <TextBox type='password' placeholder='Password' value={password} handleOnChange={setPassword} />
                <Button colour='blue' handleOnClick={onSubmit} >Submit</Button>
            </div>
        </Box>
    );
}

const SignUp = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const onSubmit = () => {
        setEmail('');
        setPassword('');
        setConfirmPassword('');
    }

    return (
        <Box colour='orange' style={{marginTop: 10, marginBottom: 10}}>
            <h2>Sign up</h2>
            <div className='space-evenly' >
                <TextBox type='email' placeholder='Email' value={email} handleOnChange={setEmail} />
                <TextBox type='password' placeholder='Password' value={password} handleOnChange={setPassword} />
                <TextBox type='password' placeholder='Confirm password' value={confirmPassword} handleOnChange={setConfirmPassword} />
                <Button colour='orange' handleOnClick={onSubmit} >Submit</Button>
            </div>
        </Box>
    )
}

export default SignInAndSignUp;