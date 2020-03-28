import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PlayerTable from '../player-table/PlayerTable';
import Button from '../button/Button';
import FormChart from '../form-chart/FormChart';
import MatchResult from '../match-result/MatchResult';
import FeaturedMatches from '../featured-matches/FeaturedMatches';

import './AnalyticsScreen.css';

const AnalyticsScreen = ({ errorAlert, matches, code, primaryButtonText, primaryButtonAction, secondaryButtonText, secondaryButtonAction, host, onOwnershipAction, ownershipButtonText }) => {
    const lastMatch = matches[matches.length - 1];
    const [historyAnalytics, setHistoryAnalytics] = useState(undefined);

    useEffect(() => {
        if (lastMatch && !lastMatch.finished && (!historyAnalytics || historyAnalytics.id !== lastMatch.id)) {
            setHistoryAnalytics(undefined);
            fetch(`${process.env.REACT_APP_API_URL}/sessions/${code}/${lastMatch.id}/history`)
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                return new Error(response.statusText);
            })
            .then(data => {
                if (data.matches.length > 0 || !data.players.every(player => player.games)) {
                    setHistoryAnalytics({ ...data, id: lastMatch.id });
                }
            })
            .catch(console.log);
        }
    }, [lastMatch, code, historyAnalytics]);

    return (
        <Container className='session-container' fluid>
            <Row>

                <Col xs={12}>
                    { errorAlert && <span id='analytics-screen-error-alert'>{errorAlert}</span>}
                    <h2>Session code: {code}</h2>
                    { onOwnershipAction && <Button style={{position: 'absolute', right: 15, top: 0 }} colour={host ? 'black' : 'green'} handleOnClick={onOwnershipAction} >{ownershipButtonText || (host ? 'Hosts' : 'Invite pending')}</Button>}
                    { matches.length > 0 && <h3>{matches[matches.length - 1].mode}</h3> }
                </Col>
            </Row>
            {
                matches.length === 0
                    ?   <Row><Col xs={12}><p>No matches played yet...</p></Col></Row>
                    :   lastMatch.finished
                            ?   <Row><Col xs={12}><MatchResult match={lastMatch} /></Col></Row>
                            :   <>
                                    <Row>
                                        <Col xs={12}>
                                            <PlayerTable match={lastMatch} canEdit={host} playerHistory={historyAnalytics && historyAnalytics.players} />
                                        </Col>
                                    </Row>
                                    <Row>
                                        <Col xs={12} md={5} lg={6} style={{paddingBottom: '1rem'}}>
                                            <h2>Form</h2>
                                            <FormChart players={lastMatch.players} />
                                        </Col>
                                        {
                                            historyAnalytics && historyAnalytics.matches && historyAnalytics.matches.length > 0 &&
                                            <Col xs={12} md={7} lg={6} >
                                                <FeaturedMatches matches={historyAnalytics.matches} />
                                            </Col>
                                        }
                                    </Row>
                                </>
            }
            <Row>
                <Col xs={12} className='session-button-row'>
                    {secondaryButtonText && <Link to='/' style={{minWidth: '25%', maxWidth: '40%'}}><Button colour='black' style={{minWidth: '100%'}} ghost large handleOnClick={secondaryButtonAction ? () => secondaryButtonAction() : undefined}>{secondaryButtonText}</Button></Link>}
                    {primaryButtonText && <Button colour='black' style={{minWidth: '25%', maxWidth: '40%'}} large handleOnClick={primaryButtonAction ? () => primaryButtonAction() : undefined}>{primaryButtonText}</Button>}
                </Col>
            </Row>
        </Container>
    );
}

export default AnalyticsScreen;