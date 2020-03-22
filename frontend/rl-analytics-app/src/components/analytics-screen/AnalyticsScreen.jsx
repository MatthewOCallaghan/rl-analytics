import React from 'react';
import { Link } from 'react-router-dom';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import PlayerTable from '../player-table/PlayerTable';
import Button from '../../components/button/Button';
import FormChart from '../../components/form-chart/FormChart';

import './AnalyticsScreen.css';

const AnalyticsScreen = ({ errorAlert, matches, code, primaryButtonText, primaryButtonAction, secondaryButtonText, secondaryButtonAction, host }) => {
    return (
        <Container className='session-container' fluid>
            <Row>
                <Col xs={12}>
                    { errorAlert && <span id='analytics-screen-error-alert'>{errorAlert}</span>}
                    <h2>Session code: {code}</h2>
                    { matches.length > 0 && <h3>{matches[matches.length - 1].mode}</h3> }
                </Col>
            </Row>
            <Row>
                {
                    matches.length === 0
                        ?   <Col xs={12}><p>No matches played yet...</p></Col>
                        :   <>
                                <Col xs={12} xl={8}>
                                    <PlayerTable match={matches[matches.length - 1]} canEdit={host} />
                                </Col>
                                <Col xs={12} xl={4} style={{paddingBottom: '1rem'}}>
                                    <h2>Form</h2>
                                    <FormChart players={matches[matches.length - 1].players} />
                                </Col>
                            </>
                }
            </Row>
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