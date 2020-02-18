import React, { useState } from 'react';
import fetch from 'unfetch';

import Layout from '../../components/layout/Layout';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../components/button/Button';
import TextBox from '../../components/textbox/TextBox';

import './session.css';

const base64Prefix = /^data:image\/\w+;base64,/;

const Session = () => {
    const [fileUpload, setFileUpload] = useState("");
    const [players, setPlayers] = useState([['','',''],['','','']]);

    const handleImage = async event => {
        const file = fileUpload.files[0];
        var base64 = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
        base64 = base64.split(base64Prefix)[1];
        
        fetch('http://localhost:3001/extract', {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                image: base64
            })
        })
            .then(response => response.json())
            .then(response => response.players)
            .then(teams => setPlayers(players.map((team, teamIndex) => team.map((player, playerIndex) => teams[teamIndex][playerIndex] || player))))
            .catch(console.log);
    }

    const handleTypedPlayerInput = teamIndex => playerIndex => name => {
        setPlayers(players.map((team, i) => i === teamIndex ? team.map((player, j) => j === playerIndex ? name : player): team))
    }

    return (
        <Layout>
            <Container style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
                <Row>
                    <Col xs={12}>
                        <h1>Session</h1>
                        <p>Enter each player's username, or simply take a picture of the in-game scoreboard</p>
                        <input style={{display: 'none'}} type='file' ref={setFileUpload} onChange={event => handleImage(event)} capture accept='image/*' />
                        <Button colour='black' handleOnClick={() => fileUpload.click()}>
                            Take picture
                        </Button>
                    </Col>
                </Row>
                <Row style={{flexGrow: 1}}>
                    <Col xs={{ span: 10, offset: 1 }} sm={{span: 6, offset:0}}>
                        <TeamBox team='BLUE' players={players[0]} handlePlayerInput={handleTypedPlayerInput(0)} />
                    </Col>
                    <Col xs={{ span: 10, offset: 1 }} sm={{span: 6, offset:0}}>
                        <TeamBox team='ORANGE' players={players[1]} handlePlayerInput={handleTypedPlayerInput(1)} />
                    </Col>
                </Row>
                <Row>
                    <Col xs={12} style={{display: 'flex', justifyContent: 'space-between'}}>
                        <Button colour='black' style={{minWidth: '25%'}} ghost large handleOnClick={() => console.log('Back')}>Back</Button>
                        <Button colour='black' style={{minWidth: '25%'}} large handleOnClick={() => console.log('Submit')}>Submit</Button>
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}

const TeamBox = ({ team, handlePlayerInput, players }) => {
    return (
        <div className='team-input' style={{backgroundColor: team}}>
            <h2>{team}</h2>
            <TextBox value={players[0]} style={{width: '70%'}} handleOnChange={handlePlayerInput(0)} />
            <TextBox value={players[1]} style={{width: '70%'}} handleOnChange={handlePlayerInput(1)} />
            <TextBox value={players[2]} style={{width: '70%'}} handleOnChange={handlePlayerInput(2)} />
        </div>
    );
}

export default Session;