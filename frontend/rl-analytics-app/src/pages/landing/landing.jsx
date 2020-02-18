import React, { useState } from 'react';
import Particles from 'react-particles-js';
import { Link } from 'react-router-dom';

import Button from '../../components/button/Button';
import TextBox from '../../components/textbox/TextBox';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import './landing.css';

const particlesOptions = {
    particles: {
      number: {
        value: 70,
        density: {
          enable: true,
          value_area: 800
        }
      }
    }
  };

const Landing = () => {
    const [sessionId, setSessionId] = useState('');

    const handleTextBoxChange = sessionId => {
        setSessionId(sessionId);
    }

    return (
        <div id='landing-container'>
            <Particles className='particles' params={particlesOptions} style={{backgroundColor: 'black'}} />
            <Container>
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
                            <h2>New session</h2>
                            <p>Get in-game analytics on teammates and opponents</p>
                            <Link to='/session'><Button colour='blue' style={{width: '100%'}}>New session</Button></Link>
                        </Box>
                        <Box colour='orange' style={{marginTop: 20}}>
                            <h2>Display</h2>
                            <p>Enter the session ID to view it</p>
                            <TextBox handleOnChange={handleTextBoxChange} />
                            <Button colour='orange' disabled={!sessionId.length} style={{width: '100%'}}>View session</Button>
                        </Box>
                    </Col>
                </Row>
            </Container>
        </div>
    )
}

const Box = ({ colour, children, style }) => {
    return (
        <div className='landing-box' style={{borderColor: colour, ...style}}>
            {children}
        </div>
    );
}

export default Landing;