import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import Layout from '../../components/layout/Layout';
import AnalyticsScreen from '../../components/analytics-screen/AnalyticsScreen';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../components/button/Button';
import TextBox from '../../components/textbox/TextBox';
import DropdownList from '../../components/dropdown-list/DropdownList';

import './session.css';

import { addMatch } from '../../redux/actions/matches';
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
    const [awaitingSubmit, setAwaitingSubmit] = useState(false);

    const matches = useSelector(store => store.matches);
    const session = useSelector(store => store.session);

    const dispatch = useDispatch();

    useEffect(() => {
        if(Object.entries(session).length === 0) {
            dispatch(createSession());
        }
    }, [dispatch, session]);

    const submitNewMatch = (mode, players) => {
        players = players.map(teamPlayers => teamPlayers.filter(player => player !== ''));
        const previousPlayersArray = matches.matches.map(match => match.players.map(teamPlayers => teamPlayers.map(player => ({name: player.name, platform: player.platform})))).flat(Infinity);
        const previousPlayers = {};
        previousPlayersArray.forEach(player => previousPlayers[player.name] = player.platform);
        const match = {
            players: players.map(teamPlayers => teamPlayers.map(player => {
                const playerObject = {
                    name: player
                };
                if (previousPlayers[player]) {
                    playerObject.platform = previousPlayers[player];
                }
                return playerObject;
            })),
            mode
        };
        dispatch(addMatch(match));
        setAwaitingSubmit(true);
    }

    const submitImage = (mode, image) => {
        dispatch(addMatch({mode, image}));
        setAwaitingSubmit(true);
        // fetch(`${process.env.REACT_APP_API_URL}/extract`, {
        //     method: 'POST',
        //     headers: {
        //         "Content-Type": "application/json"
        //     },
        //     body: JSON.stringify({
        //         image: base64
        //     })
        // })
        //     .then(response => response.json())
        //     .then(response => response.players)
        //     .then(teams => {
        //         const updatedPlayers = players.map((team, teamIndex) => team.map((player, playerIndex) => teams[teamIndex][playerIndex] || player));
        //         setPlayers(updatedPlayers);
        //         updateMode(updatedPlayers);
        //     })
        //     .catch(console.log);
    }

    if(awaitingSubmit && !matches.loading) {
        if (!matches.error) {
            setView('analytics');
        }
        setAwaitingSubmit(false);
    }

    return (
        <Layout>
            { session.loading && <LoadingSessionScreen /> }
            { session.error && <ErrorSessionScreen back={() => dispatch(endSession())} /> }
            { session.token && 
                (view === 'analytics'
                    ?   <AnalyticsScreen code={session.code} matches={matches.matches} primaryButtonText='Next match' primaryButtonAction={() => setView('new')} secondaryButtonText='End session' secondaryButtonAction={() => dispatch(endSession())} />
                    :   <NewMatch loading={matches.loading} error={matches.error} navigateBack={() => setView('analytics')} addMatchWithUsernames={submitNewMatch} addMatchWithImage={submitImage} />)
            }
        </Layout>
    );
}

const LoadingSessionScreen = () => (
    <div className='container-vertically-centre' >
        <p>Creating session...</p>
    </div>
);

const ErrorSessionScreen = ({ back }) => (
    <Container className='session-container'>
        <Row></Row>
        <Row>
            <Col xs={12}>
                <h2 style={{color: 'red'}}>Sorry, there was an error creating the session...</h2>
            </Col>
        </Row>
        <Row>
            <Col xs={12} className='session-button-row'>
                <Link to='/' style={{minWidth: '25%'}}><Button colour='black' style={{minWidth: '100%'}} ghost large handleOnClick={() => back()}>Back</Button></Link>
            </Col>
        </Row>
    </Container>
);

const NewMatch = ({ addMatchWithUsernames, addMatchWithImage, navigateBack, loading, error }) => {
    const [fileUpload, setFileUpload] = useState("");
    const [players, setPlayers] = useState([['','',''],['','','']]);
    const [mode, setMode] = useState(GAME_MODES[0].title);
    const [lastSubmission, setLastSubmission] = useState(null); //image, usernames

    const validPlayers = (players) => {
        players = players.map(teamPlayers => teamPlayers.filter(player => player !== ''));
        return players[0].length > 0 && players[1].length === players[0].length && players[0].length === GAME_MODES.filter(gameMode => gameMode.title === mode)[0].players;
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
        setLastSubmission('image');
        addMatchWithImage(mode, base64);
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
                </Col>
            </Row>
            {
                error &&
                    <Row><Col xs={12} style={{color: 'red', textAlign: 'center'}}><p>Sorry, there was an error submitting the match. Please try again.</p></Col></Row>
            }
            <Row>
                <Col xs={12} style={{padding: '1rem', textAlign: 'center'}}>
                    <DropdownList disabled={loading} value={mode} handleOnChange={handleModeChange} options={GAME_MODES.map(mode => ({value: mode.title, label: mode.label}))} />
                </Col>
            </Row>
            <Row>
                <Col xs = {12} >
                    <Box colour='blue'>
                        <h2>Take picture</h2>
                        <p>Scoreboard images must include both team names and all player usernames as a minimum. For best results, minimise the amount of text included in the image that is not in the scoreboard.</p>
                        <input style={{display: 'none'}} type='file' ref={setFileUpload} onChange={event => handleImage(event)} capture accept='image/*' />
                        <Button colour='black' disabled={loading} handleOnClick={() => fileUpload.click()} loading={loading && lastSubmission === 'image'}>
                            Take picture
                        </Button>
                    </Box>
                    <Box colour='orange' style={{marginTop: 20}}>
                        <h2>Enter usernames</h2>
                        <TeamBox team='BLUE' players={players[0]} handlePlayerInput={handleTypedPlayerInput(0)} disabled={loading}/>
                        <TeamBox team='ORANGE' players={players[1]} handlePlayerInput={handleTypedPlayerInput(1)} disabled={loading} />
                        <Button colour='black' handleOnClick={() => { setLastSubmission('usernames'); addMatchWithUsernames(mode, players); }} disabled={!validPlayers(players) || loading} loading={loading && lastSubmission === 'usernames'}>Submit</Button>
                    </Box>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className='session-button-row'>
                    <Button colour='black' style={{minWidth: '25%'}} ghost large handleOnClick={() => navigateBack()} disabled={loading} >Back</Button>
                </Col>
            </Row>
        </Container>
    );
}

const TeamBox = ({ team, handlePlayerInput, players, disabled }) => {
    return (
        <div className='team-input' style={{backgroundColor: team}}>
            <h2>{team}</h2>
            <TextBox value={players[0]} style={{width: '70%'}} handleOnChange={handlePlayerInput(0)} disabled={disabled} />
            <TextBox value={players[1]} style={{width: '70%'}} handleOnChange={handlePlayerInput(1)} disabled={disabled} />
            <TextBox value={players[2]} style={{width: '70%'}} handleOnChange={handlePlayerInput(2)} disabled={disabled} />
        </div>
    );
}

const Box = ({ colour, children, style }) => {
    return (
        <div className='new-match-box' style={{borderColor: colour, ...style}}>
            {children}
        </div>
    );
}

export default Session;