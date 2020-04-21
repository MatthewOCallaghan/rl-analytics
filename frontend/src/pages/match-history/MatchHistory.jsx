import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getIdToken } from '../../firebase/firebase';

import { getMatchHistory } from '../../redux/actions/tracking';

import Layout from '../../components/layout/Layout';
import MatchResult from '../../components/match-result/MatchResult';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../components/button/Button';
import Spinner from '../../components/spinner/Spinner';

import './MatchHistory.css';

const MatchHistory = () => {

    const [view, setView] = useState('list');
    const matchHistory = useSelector(store => store.tracking.matchHistory);
    const user = useSelector(store => store.user.profile);
    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(getMatchHistory());
    }, [dispatch]);

    const selectedMatch = Number.isInteger(view) && matchHistory.matches && matchHistory.matches.filter(match => match.id === view)[0];

    return (
        <Layout>
            {
                selectedMatch
                    ?   <MatchResultScreen match={selectedMatch} goBack={() => setView('list')} />
                    :   matchHistory.error
                            ?   <div id='match-history-status'>Error loading match history</div>
                            :   matchHistory.loading
                                    ?   <div id='match-history-status'><Spinner /></div>
                                    :   matchHistory.matches && matchHistory.matches.map((match, index) => <Match key={`Match:${index}${match}`} match={match} user={user && user.username} setView={() => setView(match.id)} />)
            }
        </Layout>
    );
}

const MatchResultScreen = ({ match, goBack }) => {
    return (
        <Container className='session-container' fluid>
            <Row>
                <Col xs={12} md={8} lg={7}>
                    <MatchResult match={match} />
                </Col>
                <Col xs={12} md={4} lg={5}>
                    <Note matchId={match.id} />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <Button colour='black' style={{minWidth: '25%'}} ghost large handleOnClick={goBack}>Back</Button>
                </Col>
            </Row>
        </Container>
    )
}

const Match = ({ match, user, setView }) => {

    const goals = match.finished && match.finished.completed && match.players.map(team => team.reduce((acc, player) => acc === undefined ? acc : player.result.goals === undefined ? undefined : acc + player.result.goals, 0));

    const winner = match.finished && match.finished.completed && (1 - match.players[0][0].result.wins);

    const isInTeam = team => match.players[team].filter(player => player.name === user).length > 0;

    const result = user && (winner === 0 || winner === 1) && (isInTeam(0) ? (winner ? 'lost' : 'won') : isInTeam(1) ? (winner ? 'won' : 'lost') : undefined);
    
    match.startTime = new Date(match.startTime);

    const playerItem = (player, index) => <span style={player.name === user ? { textDecoration: 'underline' } : undefined} key={`player:${player.name}${index}`}>{player.name}</span>;

    return (
        <section className={`match-history${match.finished ? ' hover' : ''}`} onClick={match.finished ? () => setView() : undefined}>
            <h1 style={{marginBottom: 0}}>{match.mode}</h1>
            <p style={{marginBottom: 0}}>{`${match.startTime.getDate()}/${match.startTime.getMonth()+1}/${match.startTime.getFullYear().toString().slice(2)}`}</p>
            <div className='match-history-row'>
                <div className='match-history-players match-history-blue-team'>
                    <div className='gradient'>
                        {
                            winner === 0 &&
                            <span style={{position: 'absolute'}}>WINNER</span>
                        }
                    </div>
                    <div className='players'>
                        {
                            match.players[0].map(playerItem)
                        }
                    </div>
                </div>
                <div className='match-history-score' style={{color: result === 'won' ? 'green' : result === 'lost' ? 'red' : '#5d5d5d'}}>
                    {
                        match.finished
                            ?   <span style={{fontSize: '2.5rem'}}>{goals && goals[0] !== undefined ? goals[0] : '?'}&nbsp;-&nbsp;{goals && goals[1] !== undefined ? goals[1] : '?'}</span>
                            :   <span>IN<br/>PROGRESS</span>
                    }
                </div>
                <div className='match-history-players match-history-orange-team'>
                    <div className='players'>
                        {
                            match.players[1].map(playerItem)
                        }
                    </div>
                    <div className='gradient'>
                        {
                            winner === 1 &&
                            <span style={{position: 'absolute', right: 0}}>WINNER</span>
                        }
                    </div>
                </div>
            </div>
        </section>
    );
}

const Note = ({ matchId }) => {

    const [stored, setStored] = useState('');
    const [text, setText] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getIdToken()
            .then(token => {
                fetch(`${process.env.REACT_APP_API_URL}/matches/${matchId}/notes`, {
                    headers: {
                        authorization: `Bearer ${token}`
                    }
                })
                    .then(response => {
                        if (!response.ok) {
                            return Promise.reject(new Error(response.statusText));
                        }
                        return response.json();
                    })
                    .then(note => {
                        setLoading(false);
                        if (note.length > 0) {
                            setText(note);
                            setStored(note);
                        }
                    })
                    .catch(err => {
                        console.log(err);
                        setError(true);
                        setLoading(false);
                    });
            })
            .catch(err => {
                console.log(err);
                setError(true);
                setLoading(false);
            });
        
    }, [matchId]);

    const updateNotes = () => {
        setLoading(true);
        getIdToken()
            .then(token => {
                fetch(`${process.env.REACT_APP_API_URL}/matches/${matchId}/notes`, {
                    method: 'post',
                    headers: {
                        authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ note: text })
                })
                    .then(response => {
                        if (!response.ok) {
                            return Promise.reject(new Error(response.statusText));
                        }
                        return response.json();
                    })
                    .then(note => {
                        setLoading(false);
                        setStored(note);
                    })
                    .catch(err => {
                        console.log(err);
                        setError(true);
                        setLoading(false);
                    });
            })
            .catch(err => {
                console.log(err);
                setError(true);
                setLoading(false);
            });
    }

    const errorLoadingNotes = error && text.length === 0;

    return (
        <div id='notes'>
            <h2>Notes</h2>
            {
                loading && text.length === 0
                    ?   <Spinner />
                    :   <>
                            <textarea onChange={event => setText(event.target.value)} disabled={loading || errorLoadingNotes} placeholder={errorLoadingNotes ? 'Error loading notes' : 'Notes'} value={text} />
                            { !errorLoadingNotes && <Button colour='black' loading={loading} handleOnClick={updateNotes} disabled={text.length === 0 || loading || stored === text} >Update</Button> }
                            { error && !errorLoadingNotes && <p style={{ color: 'red' }}>Error updating notes</p> }
                        </>
            }
        </div>
    );
}

export default MatchHistory;