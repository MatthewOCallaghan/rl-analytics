import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { getPlayerStats, changeModeView, removePlayerTracking } from '../../redux/actions/tracking';

import Layout from '../../components/layout/Layout';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Accordion from 'react-bootstrap/Accordion';
import Card from 'react-bootstrap/Card';
import DropdownList from '../../components/dropdown-list/DropdownList';
import StatTrackingChart from '../../components/stat-tracking-chart/StatTrackingChart';
import Spinner from 'react-bootstrap/Spinner';
import RemoveIcon from '@material-ui/icons/ClearRounded';
import TextBox from '../../components/textbox/TextBox';
import Button from '../../components/button/Button';
import { useAccordionToggle } from'react-bootstrap/AccordionToggle';

import './Tracking.css';

const STATS = [
    {
        value: 'wins',
        label: 'Wins'
    },
    {
        value: 'goals',
        label: 'Goals'
    },
    {
        value: 'assists',
        label: 'Assists'
    },
    {
        value: 'saves',
        label: 'Saves'
    },
    {
        value: 'shots',
        label: 'Shots'
    },
    {
        value: 'mvps',
        label: 'MVPs'
    }
]

const Tracking = () => {

    const dispatch = useDispatch();

    const [stat, setStat] = useState(STATS[0].value); // wins, goals, assists, saves, shots, mvps

    const [newUsername, setNewUsername] = useState('');

    const user = useSelector(store => store.user.profile);
    const players = useSelector(store => store.tracking.players);

    useEffect(() => {
        if (user.username) {
            dispatch(getPlayerStats(user.username));
        }
    }, [user.username, dispatch]);

    const data = players.filter(player => player.data).map(({username, data, modes}) => {
        const selectedModes = Object.entries(modes).filter(([mode, show]) => show).map(([mode, show]) => mode);

        return { 
            name: username, 
            data: data.map(datum => ({ ...datum, modes: datum.modes.filter(mode => selectedModes.includes(mode.title)) })) // Remove unselected modes
                      .filter(datum => datum.modes.length > 0) // Remove points with no data left
                      .map(datum => ({ date: datum.date, games: datum.modes.reduce((acc, mode) => stat === 'wins' ? acc + mode.games : acc + mode[stat].games, 0), stat: datum.modes.reduce((acc, mode) => stat === 'wins' ? acc + mode.wins : acc + mode[stat].value, 0) }))
        };
        
    });

    const addUser = () => {
        if (newUsername.length > 0) {
            dispatch(getPlayerStats(newUsername));
            setNewUsername('');
        }
    }

    const Remove = ({ username }) => <span className='pointer-on-hover' onClick={() => dispatch(removePlayerTracking(username))}><RemoveIcon /></span>;
    
    return (
        <Layout>
            <Container fluid>
                <Row>
                    <Col xs={12} md={12} lg={4} xl={3} id='tracking-options-panel'>
                        <div id='new-username'>
                            <TextBox style={{border: 'solid black 1px'}} placeholder='Add username' handleOnChange={setNewUsername} value={newUsername} />
                            <Button colour='black' handleOnClick={addUser} disabled={!newUsername.length}>Add</Button>
                        </div>
                        
                        <DropdownList options={STATS} handleOnChange={setStat} value={stat} />
                        <small>Click a username for more options</small>
                        <Accordion>
                            {
                                players.map(({ username, data, modes, error, loading }, index) => 
                                    <Card key={`TrackingOptions:${username + index}`} id={`tracking-options-card-${index}`}>
                                        {
                                            data && modes
                                                ?   <>
                                                        <Card.Header>
                                                            <CustomToggle eventKey={index}>{username}</CustomToggle>
                                                            <Remove username={username} />
                                                        </Card.Header>
                                                        <Accordion.Collapse eventKey={index}>
                                                            <Card.Body>
                                                                {
                                                                    Object.entries(modes).map(([title, show], index) => 
                                                                        <>
                                                                            <label htmlFor={`${username}-${title}`} key={`TrackingOptionsLabel${index}`}>{title}</label>
                                                                            <input type='checkbox' name={`${username}-${title}`} checked={show} onChange={event => dispatch(changeModeView(username, title, event.target.checked))} key={`TrackingOptionsCheckbox${index}`} />
                                                                        </>
                                                                    )
                                                                }
                                                            </Card.Body>
                                                        </Accordion.Collapse>
                                                    </>
                                                :   <Card.Header className='card-header-no-data' style={error ? {color: 'red'} : undefined}>
                                                        <span>{username}</span>
                                                        {
                                                            loading &&
                                                            <Spinner animation='border' role='status' variant='dark' size='sm'>
                                                                <span className='sr-only'>Loading...</span>
                                                            </Spinner>
                                                        }
                                                        {
                                                            error &&
                                                            <Remove username={username} />
                                                        }
                                                    </Card.Header>
                                        }
                                        
                                    </Card>
                                )
                            } 
                        </Accordion>
                    </Col>
                    <Col xs={12} md={12} lg={8} xl={9}>
                        <StatTrackingChart data={data} statName={STATS.filter(statistic => statistic.value === stat)[0].label} />
                    </Col>
                </Row>
            </Container>
        </Layout>
    );
}

const CustomToggle = ({ children, eventKey }) => <span className='pointer-on-hover' onClick={useAccordionToggle(eventKey)}>{children}</span>;

export default Tracking;