import React from 'react';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Spinner from 'react-bootstrap/Spinner';
import { Ranks } from '../../images';

import './PlayerTable.css';

const Analytics = ({ match }) => {
    return (
        <section id='analytics'>
            <Team name='BLUE' players={match.players[0]} season={match.season} colour='blue' />
            <Team name='ORANGE' players={match.players[1]} season={match.season} colour='orange' />
        </section>
    );
}

const Team = ({ name, players, colour, season }) => {
    return (
        <>
            <h2 style={{color: colour}}>{name}</h2>
            <table className='player-table table-responsive'>
                <caption>Season {season || 13} stats</caption>
                <thead>
                    <tr>
                        <th></th>
                        <th></th>
                        <th>MMR</th>
                        <th>PLAYSTYLE<br/>(GOALS:SAVES:ASSISTS)</th>
                        <th>GAMES<br/>PLAYED</th>
                        <th>MVP/WIN</th>
                        <th>Streak</th>
                        <th>DIV<br/>UP/DOWN</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        players.map((player, index) => 
                            <tr key={'table-row:'+ player.name + index} className='player' style={{backgroundColor: colour === 'orange' ? '#964000' : colour}}>
                                <td>
                                    <div style={{minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column nowrap'}}>
                                        {!player.loading && !player.error && 
                                            <>
                                                <img src={Ranks[player.rank]} alt={`${player.name} is rank ${player.rank}`}/>
                                                <span style={{fontSize: '0.8rem'}}>Div&nbsp;{player.division}</span>
                                            </>
                                        }
                                        {
                                            player.loading && 
                                            <Spinner animation='border' role='status' variant='light' size='sm'>
                                                <span className='sr-only'>Loading...</span>
                                            </Spinner>
                                        }
                                        {
                                            player.error && <span style={{color: 'red', fontSize: '0.8rem'}}>Error</span>
                                        }
                                    </div>
                                </td>
                                <td><span style={{color: player.error ? 'red' : undefined}}>{player.name}</span></td>
                                <td>{player.mmr}</td>
                                <td>{player.playstyle}</td>
                                <td>{player.games}</td>
                                <td>{player.mvpWinPercentage}{!player.loading && !player.error && '%'}</td>
                                <td>
                                    {player.streak
                                        ? <span style={{color: player.streak.type === 'W' ? '#00ff00' : 'red'}}>{player.streak.length + player.streak.type}</span>
                                        : ''
                                    }
                                </td>
                                <td>
                                    {
                                        player.divUp && player.divDown
                                            ?   <span style={{color: player.divUp < player.divDown ? '#00ff00' : 'red'}}>{player.divUp < player.divDown ? player.divUp + String.fromCharCode(8593) : player.divDown + String.fromCharCode(8595)}</span>
                                            :   player.divUp
                                                ? <span style={{color: '#00ff00'}}>{player.divUp}&uarr;</span>
                                                : player.divDown
                                                    ?   <span style={{color: 'red'}}>{player.divDown}&darr;</span>
                                                    :   ''
                                    }
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </table>
        </>        
    );
}

export default Analytics;