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

    const data = Object.entries(players).filter(([username, playerData]) => playerData.data).map(([username, playerData]) => {
        const selectedModes = Object.entries(playerData.modes).filter(([mode, show]) => show).map(([mode, show]) => mode);

        return { 
            name: username, 
            data: playerData.data.map(datum => ({ ...datum, modes: datum.modes.filter(mode => selectedModes.includes(mode.title)) })) // Remove unselected modes
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

    console.log(players);
    
    return (
        <Layout>
            <Container fluid>
                <Row>
                    <Col xs={12} md={3} id='tracking-options-panel'>
                        <div id='new-username'>
                            <TextBox style={{border: 'solid black 1px'}} placeholder='Add username' handleOnChange={setNewUsername} value={newUsername} />
                            <Button colour='black' handleOnClick={addUser} disabled={!newUsername.length}>Add</Button>
                        </div>
                        
                        <DropdownList options={STATS} handleOnChange={setStat} value={stat} />
                        <Accordion>
                            {
                                Object.entries(players).map(([name, player], index) => 
                                    <Card key={`TrackingOptions:${name + index}`} id={`tracking-options-card-${index}`}>
                                        {
                                            player.data && player.modes
                                                ?   <>
                                                        {/* <Accordion.Toggle as={Card.Header} eventKey={index}>
                                                            <span>{name}</span>
                                                            <span onClick={() => dispatch(removePlayerTracking(name))}><RemoveIcon /></span>
                                                        </Accordion.Toggle> */}
                                                        <Card.Header>
                                                            {/* <Accordion.Toggle as={CustomToggle} eventKey={index}>
                                                                {name}
                                                            </Accordion.Toggle> */}
                                                            <CustomToggle eventKey={index}>{name}</CustomToggle>
                                                            <span className='pointer-on-hover' onClick={() => dispatch(removePlayerTracking(name))}><RemoveIcon /></span>
                                                        </Card.Header>
                                                        <Accordion.Collapse eventKey={index}>
                                                            <Card.Body>
                                                                {
                                                                    Object.entries(player.modes).map(([title, show], index) => 
                                                                        <>
                                                                            <label htmlFor={`${name}-${title}`} key={`TrackingOptionsLabel${index}`}>{title}</label>
                                                                            <input type='checkbox' name={`${name}-${title}`} checked={show} onChange={event => dispatch(changeModeView(name, title, event.target.checked))} key={`TrackingOptionsCheckbox${index}`} />
                                                                        </>
                                                                    )
                                                                }
                                                            </Card.Body>
                                                        </Accordion.Collapse>
                                                    </>
                                                :   <Card.Header className='card-header-no-data' style={player.error ? {color: 'red'} : undefined}>
                                                        <span>{name}</span>
                                                        {
                                                            player.loading &&
                                                            <Spinner animation='border' role='status' variant='dark' size='sm'>
                                                                <span className='sr-only'>Loading...</span>
                                                            </Spinner>
                                                        }
                                                    </Card.Header>
                                        }
                                        
                                    </Card>
                                )
                            } 
                        </Accordion>
                    </Col>
                    <Col xs={12} md={9}>
                        <StatTrackingChart data={data} statName={STATS.filter(statistic => statistic.value === stat)[0].label} />
                    </Col>
                </Row>

                
            </Container>
        </Layout>
    );
}

const CustomToggle = ({ children, eventKey }) => <span className='pointer-on-hover' onClick={useAccordionToggle(eventKey)}>{children}</span>;

export default Tracking;