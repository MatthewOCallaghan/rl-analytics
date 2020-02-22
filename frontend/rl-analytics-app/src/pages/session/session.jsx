import React, { useState } from 'react';
import fetch from 'unfetch';
import { useSelector, useDispatch } from 'react-redux';

import Layout from '../../components/layout/Layout';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../components/button/Button';
import TextBox from '../../components/textbox/TextBox';
import MatchAnalytics from '../../components/match-analytics/MatchAnalytics';

import './session.css';

import { addMatch, getPlayer } from '../../redux/actions/matches';

const base64Prefix = /^data:image\/\w+;base64,/;

const testMatch = {
    players: [
        [
            {
                name: 'MattyOCallaghan',
                mmr: 1214,
                playstyle: '42:17:41',
                games: 213,
                mvpWinPercentage: 48.3,
                streak: {type: 'L', length: 2},
                divUp: 5,
                divDown: 25,
                rank: 'Champion I',
                division: 'I',
                loading: false,
                error: false
            },
            {
                name: 'jamesontour',
                mmr: 1187,
                playstyle: '43:27:30',
                games: 248,
                mvpWinPercentage: 52.8,
                divDown: 14,
                rank: 'Diamond III',
                division: 'III',
                loading: false,
                error: false
            }
        ],
        [
            {
                name: 'opring1871',
                loading: true,
                error: false
            },
            {
                name: 'test',
                loading: false,
                error: true
            }
        ]
    ],
    season: 13
}

const Session = () => {
    const [view, setView] = useState('analytics'); //analytics, new
    // const [matches, setMatches] = useState([testMatch]);
    const matches = useSelector(store => store.matches);

    const dispatch = useDispatch();

    const submitNewMatch = players => {
        const id = matches.length;
        players = players.map(teamPlayers => teamPlayers.filter(player => player !== ''));
        var mode = '';
        switch(players[0].length) {
            case 1:
                mode = 'Ranked Duel 1v1';
                break;
            case 2:
                mode = 'Ranked Doubles 2v2';
                break;
            case 3:
                mode = 'Ranked Standard 3v3';
                break;
            default:
                mode = 'Ranked Standard 3v3';
                break;
        }
        const match = {
            players: players.map(teamPlayers => teamPlayers.map(player => ({
                name: player,
                loading: true,
                error: false
            })))
        };
        dispatch(addMatch(match));
        setView('analytics');
        players.forEach((teamPlayers, teamIndex) => teamPlayers.forEach((player, playerIndex) => {
            dispatch(getPlayer(id, teamIndex, playerIndex, mode, player));
        }));
    }

    return (
        <Layout>
            {view === 'analytics'
                ?   <AnalyticsScreen matches={matches} navigateNewMatch={() => setView('new')} />
                :   <NewMatch navigateBack={() => setView('analytics')} addMatch={submitNewMatch} />}
        </Layout>
    );
}

const AnalyticsScreen = ({ matches, navigateNewMatch }) => {
    return (
        <Container style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
            <Row>
                <Col xs={12}>
                    <h2>Session</h2>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    {
                        matches.length === 0
                            ?   <p>No matches played yet...</p>
                            :   <MatchAnalytics match={matches[matches.length - 1]} />
                    }
                </Col>
            </Row>
            <Row>
                <Col xs={12} style={{textAlign: 'right'}}>
                    <Button colour='black' style={{minWidth: '25%'}} large handleOnClick={() => navigateNewMatch()}>New match</Button>
                </Col>
            </Row>
        </Container>
    );
}

const NewMatch = ({ addMatch, navigateBack }) => {
    const [fileUpload, setFileUpload] = useState("");
    const [players, setPlayers] = useState([['','',''],['','','']]);

    const validPlayers = (players) => {
        players = players.map(teamPlayers => teamPlayers.filter(player => player !== ''));
        return players[0].length > 0 && players[1].length === players[0].length;
    }

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
        <Container style={{display: 'flex', flexDirection: 'column', justifyContent: 'space-between', height: '100%'}}>
            <Row>
                <Col xs={12}>
                    <h1>New match</h1>
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
                    <Button colour='black' style={{minWidth: '25%'}} ghost large handleOnClick={() => navigateBack()}>Back</Button>
                    <Button colour='black' style={{minWidth: '25%'}} large handleOnClick={() => addMatch(players)} disabled={!validPlayers(players)}>Submit</Button>
                </Col>
            </Row>
        </Container>
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