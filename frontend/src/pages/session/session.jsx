import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';

import Layout from '../../components/layout/Layout';
import AnalyticsScreen from '../../components/analytics-screen/AnalyticsScreen';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../components/button/Button';
import TextBox from '../../components/textbox/TextBox';
import DropdownList from '../../components/dropdown-list/DropdownList';
import Box from '../../components/box/Box';
import Modal from 'react-bootstrap/Modal';
import Spinner from '../../components/spinner/Spinner';

import './session.css';

import { addMatch, finishMatch } from '../../redux/actions/matches';
import { createSession, endSession, getSessionData, invite, GAME_MODES } from '../../redux/actions/session';

const BASE_64_PREFIX = /^data:image\/\w+;base64,/;

const Session = () => {
    const [view, setView] = useState('analytics'); //analytics, new
    const [awaitingSubmit, setAwaitingSubmit] = useState(false);

    const [viewHosts, setViewHosts] = useState(false);

    const matches = useSelector(store => store.matches);
    const session = useSelector(store => store.session);

    const dispatch = useDispatch();

    useEffect(() => {
        if(Object.entries(session).length === 0) {
            dispatch(createSession());
        }
    }, [dispatch, session]);

    useEffect(() => {
        if(session.token) {
            dispatch(getSessionData());
            const interval = setInterval(() => {
                dispatch(getSessionData());
            }, 15000);
            return () => clearInterval(interval);
        }
    }, [dispatch, session.token]);

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
    }

    if(awaitingSubmit && !matches.loading) {
        if (!matches.error) {
            setView('analytics');
        }
        setAwaitingSubmit(false);
    }

    const mostRecentMatch = matches.matches[matches.matches.length - 1];
    const matchesComplete = matches.matches.length === 0 || mostRecentMatch.finished;

    return (
        <Layout>
            { session.loading && !session.error && <LoadingSessionScreen newSession={!session.token} /> }
            { session.error && !session.owners && <ErrorSessionScreen back={() => dispatch(endSession())} newSession={!session.token} /> }
            { session.token && session.code && session.owners &&
                (view === 'analytics'
                    ?   <>
                            <HostsModal show={viewHosts} onHide={() => setViewHosts(false)} owners={[ ...session.owners.map(email => ({ email, status: 'host' })), ...session.invited ]} submitInvite={email => dispatch(invite(email))}  />
                            <AnalyticsScreen code={session.code} matches={matches.matches} primaryButtonText={matchesComplete ? 'Next match' : 'Match finished'} primaryButtonAction={matchesComplete ? () => setView('new') : () => dispatch(finishMatch(mostRecentMatch))} secondaryButtonText='End session' secondaryButtonAction={() => dispatch(endSession())} host onOwnershipAction={() => setViewHosts(true)} errorAlert={session.error && session.token ? 'We are having trouble connecting to the session, but we will continue to try...' : false} />
                        </>
                    :   <NewMatch loading={matches.loading} error={matches.error} navigateBack={() => setView('analytics')} addMatchWithUsernames={submitNewMatch} addMatchWithImage={submitImage} />)
            }
        </Layout>
    );
}

const HostsModal = ({ owners, show, onHide, submitInvite }) => {
    const [invitee, setInvitee] = useState('');

    const whenHiding = () => {
        setInvitee('');
        onHide();
    }

    const onClick = () => {
        submitInvite(invitee);
        setInvitee('');
    }
    
    return (
        <Modal show={show} onHide={() => whenHiding()} centered >
            <div id='hosts-modal'>
                <h1>Hosts</h1>
                <div className='hosts'>
                    {
                        owners.map((host, index) => 
                            <React.Fragment key={`Host:${host.email + host.status + index}`}>
                                <span className='email' style={{ wordWrap: 'break-word', overflow: 'hidden' }}>{host.email}</span>
                                {
                                    host.status === 'loading'
                                        ?   <span style={{textAlign: 'center'}}><Spinner small /></span>
                                        :   <span className={`status ${host.status}`}>{host.status}</span>
                                }
                            </React.Fragment>    
                        )
                    }
                </div>
                <div id='invite'>
                    <TextBox style={{border: 'solid 1px black', maxWidth: '100%' }} placeholder='Email' handleOnChange={setInvitee} value={invitee} type='email' />
                    <Button colour='black' handleOnClick={() => onClick()} disabled={invitee.length === 0 || !owners.filter(host => host.status !== 'error').map(host => host.email).includes(invitee)} >Invite</Button>
                </div>
            </div>
        </Modal>
    );
}

const LoadingSessionScreen = ({ newSession }) => (
    <div className='container-vertically-centre' >
        <p>{newSession ? 'Creating' : 'Loading'} session...</p>
    </div>
);

const ErrorSessionScreen = ({ back, newSession }) => {
    const location = useLocation();

    return (
        <Container className='session-container'>
            <Row></Row>
            <Row>
                <Col xs={12}>
                    <h2 style={{color: 'red'}}>{`Sorry, there was an error ${newSession ? 'creating' : 'loading'} the session...`}</h2>
                </Col>
            </Row>
            <Row>
                <Col xs={12} className='session-button-row'>
                    <Link to={location.state ? location.state.from.pathname : '/'} style={{minWidth: '25%'}}><Button colour='black' style={{minWidth: '100%'}} ghost large handleOnClick={() => back()}>Back</Button></Link>
                </Col>
            </Row>
        </Container>
    );
};

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
                    <Box colour='blue' style={{padding: '2%'}}>
                        <h2>Take picture</h2>
                        <p>Scoreboard images must include both team names and all player usernames as a minimum. For best results, minimise the amount of text included in the image that is not in the scoreboard.</p>
                        <input style={{display: 'none'}} type='file' ref={setFileUpload} onChange={event => handleImage(event)} capture accept='image/*' />
                        <Button colour='black' disabled={loading} handleOnClick={() => fileUpload.click()} loading={loading && lastSubmission === 'image'}>
                            Take picture
                        </Button>
                    </Box>
                    <Box colour='orange' style={{marginTop: 20, padding: '2%'}}>
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

export default Session;