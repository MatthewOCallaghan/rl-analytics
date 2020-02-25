import React, { useState, useEffect } from 'react';
import fetch from 'unfetch';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import Layout from '../../components/layout/Layout';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../components/button/Button';
import TextBox from '../../components/textbox/TextBox';
import MatchAnalytics from '../../components/match-analytics/MatchAnalytics';
import DropdownList from '../../components/dropdown-list/DropdownList';

import './session.css';

import { addMatch, getPlayer } from '../../redux/actions/matches';
import { createSession, endSession } from '../../redux/actions/session';

const BASE_64_PREFIX = /^data:image\/\w+;base64,/;

const GAME_MODES = [
    {
        title: 'Ranked Duel 1v1',
        label: 'Solo Duel',
        players: 1
    },
    {
        title: 'Ranked Doubles 2v2',
        label: 'Doubles',
        players: 2
    },
    {
        title: 'Ranked Standard 3v3',
        label: 'Standard',
        players: 3
    },
    {
        title: 'Ranked Solo Standard 3v3',
        label: 'Solo Standard',
        players: 3
    },
    {
        title: 'Hoops',
        label: 'Hoops',
        players: 2
    },
    {
        title: 'Rumble',
        label: 'Rumble',
        players: 3
    },
    {
        title: 'Dropshot',
        label: 'Dropshot',
        players: 3
    },
];

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
    const session = useSelector(store => store.session);

    const dispatch = useDispatch();

    useEffect(() => {
        if(Object.entries(session).length === 0) {
            dispatch(createSession());
        }
    }, [dispatch, session]);

    const submitNewMatch = (mode, players) => {
        const id = matches.length;
        players = players.map(teamPlayers => teamPlayers.filter(player => player !== ''));
        const match = {
            players: players.map(teamPlayers => teamPlayers.map(player => ({
                name: player,
                loading: true,
                error: false
            }))),
            mode
        };
        dispatch(addMatch(match));
        setView('analytics');
        players.forEach((teamPlayers, teamIndex) => teamPlayers.forEach((player, playerIndex) => {
            dispatch(getPlayer(id, teamIndex, playerIndex, mode, player));
        }));
    }

    return (
        <Layout>
            { (session.loading || session.error) && <LoadingSessionScreen loading={session.loading} error={session.error} />}
            { session.token && 
                (view === 'analytics'
                    ?   <AnalyticsScreen code={session.code} matches={matches} navigateNewMatch={() => setView('new')} endSession={() => dispatch(endSession())} />
                    :   <NewMatch navigateBack={() => setView('analytics')} addMatch={submitNewMatch} />)
            }
        </Layout>
    );
}

const LoadingSessionScreen = ({ loading, error }) => {
    return (
        <div style={{display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%'}} >
            {loading && <p>Creating session...</p>}
            {error && <p>Sorry, there was an error creating the session...</p>}
        </div>
    );
}

const AnalyticsScreen = ({ matches, navigateNewMatch, code, endSession }) => {
    return (
        <Container className='session-container'>
            <Row>
                <Col xs={12}>
                    <h2>Session code: {code}</h2>
                    { matches.length > 0 && <h3>{matches[matches.length - 1].mode}</h3> }
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
                <Col xs={12} className='session-button-row'>
                    <Link to='/' style={{minWidth: '25%'}}><Button colour='black' style={{minWidth: '100%'}} ghost large handleOnClick={() => endSession()}>End session</Button></Link>
                    <Button colour='black' style={{minWidth: '25%'}} large handleOnClick={() => navigateNewMatch()}>New match</Button>
                </Col>
            </Row>
        </Container>
    );
}

const NewMatch = ({ addMatch, navigateBack }) => {
    const [fileUpload, setFileUpload] = useState("");
    const [players, setPlayers] = useState([['','',''],['','','']]);
    const [mode, setMode] = useState(GAME_MODES[0].title);

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
        base64 = base64.split(BASE_64_PREFIX)[1];
        
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
            .then(teams => {
                const updatedPlayers = players.map((team, teamIndex) => team.map((player, playerIndex) => teams[teamIndex][playerIndex] || player));
                setPlayers(updatedPlayers);
                updateMode(updatedPlayers);
            })
            .catch(console.log);
    }

    const updateMode = updatedPlayers => {
        const number = Math.max(...updatedPlayers.map(team => team.filter(player => player.length > 0).length));
        if (number > GAME_MODES.filter(gameModes => gameModes.title === mode)[0].players) {
            setMode(GAME_MODES.filter(gameMode => gameMode.players === number)[0].title);
        }
    }

    const handleTypedPlayerInput = teamIndex => playerIndex => name => {
        const updatedPlayers = players.map((team, i) => i === teamIndex ? team.map((player, j) => j === playerIndex ? name : player): team);
        setPlayers(updatedPlayers);
        updateMode(updatedPlayers);
    }

    const handleModeChange = mode => {
        setMode(mode);
    }

    return (
        <Container className='session-container'>
            <Row>
                <Col xs={12}>
                    <h1>New match</h1>
                    <p>Enter each player's username, or simply take a picture of the in-game scoreboard.</p>
                    <p>Scoreboard images must include both team names and all player usernames as a minimum. For best results, minimise the amount of text included in the image that is not in the scoreboard.</p>
                    <input style={{display: 'none'}} type='file' ref={setFileUpload} onChange={event => handleImage(event)} capture accept='image/*' />
                    <Button colour='black' handleOnClick={() => fileUpload.click()}>
                        Take picture
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col xs={12} style={{padding: '1rem', textAlign: 'center'}}>
                    <DropdownList value={mode} handleOnChange={handleModeChange} options={GAME_MODES.map(mode => ({value: mode.title, label: mode.label}))} />
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
                <Col xs={12} className='session-button-row'>
                    <Button colour='black' style={{minWidth: '25%'}} ghost large handleOnClick={() => navigateBack()}>Back</Button>
                    <Button colour='black' style={{minWidth: '25%'}} large handleOnClick={() => addMatch(mode, players)} disabled={!validPlayers(players)}>Submit</Button>
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