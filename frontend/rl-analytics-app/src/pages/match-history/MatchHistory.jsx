import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getMatchHistory } from '../../redux/actions/tracking';

import Layout from '../../components/layout/Layout';
import MatchResult from '../../components/match-result/MatchResult';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Button from '../../components/button/Button';

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
                    :   matchHistory.matches && matchHistory.matches.map((match, index) => <Match key={`Match:${index}${match}`} match={match} user={user && user.displayName} setView={() => setView(match.id)} />)
            }
        </Layout>
    );
}

const MatchResultScreen = ({ match, goBack }) => {
    return (
        <Container className='session-container' fluid>
            <Row>
                <Col xs={12}>
                    <MatchResult match={match} />
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

    const goals = match.finished && match.finished.complete && match.players.map(team => team.reduce((acc, player) => acc === undefined ? acc : player.result.goals === undefined ? undefined : acc + player.result.goals, 0));

    const winner = match.finished && match.finished.complete && (1 - match.players[0][0].result.wins);

    const isInTeam = team => match.players[team].filter(player => player.name === user).length > 0;

    const result = user && (winner === 0 || winner === 1) && (isInTeam(0) ? (winner ? 'lost' : 'won') : isInTeam(1) ? (winner ? 'won' : 'lost') : undefined);
    
    return (
        <section className={`match-history${match.finished ? ' hover' : ''}`} onClick={match.finished ? () => setView() : undefined}>
            <h1>{match.mode}</h1>
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
                            match.players[0].map(player => player.name)
                        }
                    </div>
                </div>
                <div className='match-history-score' style={{color: result === 'won' ? 'green' : result === 'lost' ? 'red' : '#5d5d5d'}}>
                    {
                        match.finished
                            ?   <span style={{fontSize: '2.5rem'}}>{goals[0] ?? '?'} - {goals[1] ?? '?'}</span>
                            :   <span>IN<br/>PROGRESS</span>
                    }
                </div>
                <div className='match-history-players match-history-orange-team'>
                    <div className='players'>
                        {
                            match.players[1].map(player => player.name)
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

export default MatchHistory;