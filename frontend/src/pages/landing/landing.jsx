import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';

import Button from '../../components/button/Button';
import TextBox from '../../components/textbox/TextBox';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Box from '../../components/box/Box';
import Particles from '../../components/particles/Particles';
import Navbar from '../../components/navbar/Navbar';

import { handleTextBoxChange, isSessionCodeFormatValid } from '../display/display';

import './landing.css';



const Landing = () => {
    const [sessionId, setSessionId] = useState('');
    const session = useSelector(store => store.session);

    return (
        <div id='landing-container'>
            {/* <span style={{position: 'absolute', top: 20, right: '5%'}}>
                <SignInSignOut fullSignOut />
            </span> */}
            <div style={{ width: '100%' }}><Navbar landing /></div>
            <Particles />
            <Container style={{display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <Row>
                    <Col style={{margin: 'auto 0'}} md={12} lg={6}>
                        <div className='landing-title-rl'>
                            <span style={{color: 'blue'}}>Rocket </span>
                            <span style={{color: 'orange'}}>League</span>
                        </div>
                        <h1 id='landing-title-analytics'>Analytics</h1>
                    </Col>
                    <Col md={12} lg={6} style={{padding: '20px 0'}}>
                        <Box colour='blue'>
                            <h2>{session.token ? 'Continue' : 'New'} session</h2>
                            <p>Get in-game analytics on teammates and opponents</p>
                            <Link to='/session'><Button colour='blue' style={{width: '100%'}}>{session.token ? 'Continue' : 'New'} session</Button></Link>
                        </Box>
                        <Box colour='orange' style={{marginTop: 20}}>
                            <h2>Display</h2>
                            <p>Enter the session code to view it</p>
                            <TextBox value={sessionId} handleOnChange={handleTextBoxChange(setSessionId)} style={{textTransform: 'uppercase'}} />
                            {
                                isSessionCodeFormatValid(sessionId)
                                    ?   <Link to={`/display/${sessionId}`}><Button colour='orange' style={{width: '100%'}}>View session</Button></Link>
                                    :   <Button colour='orange' disabled style={{width: '100%'}}>View session</Button>
                            }
                        </Box>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

export default Landing;