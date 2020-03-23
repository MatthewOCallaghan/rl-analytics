import React from 'react';
import { useState } from 'react';
import { useDispatch } from 'react-redux';

import Modal from 'react-bootstrap/Modal';
import EditIcon from '@material-ui/icons/EditRounded';
import TextBox from '../textbox/TextBox';
import Button from '../button/Button';
import Table from '../table/Table';
import PlayerRank from '../player-rank/PlayerRank';

import { editUsername } from '../../redux/actions/matches';

import './PlayerTable.css';

const Analytics = ({ match, canEdit }) => {
    const [editing, setEditing] = useState(null);
    const [textBoxValue, setTextBoxValue] = useState('');
    const dispatch = useDispatch();

    const handleSetEditing = team => player => {
        if (player === null ) {
            setEditing(null);
            setTextBoxValue('');
        } else {
            setEditing([team, player]);
            setTextBoxValue(match.players[team][player].name);
        }
    }

    const submitNewUsername = () => {
        dispatch(editUsername(match.id, editing[0], match.players[editing[0]][editing[1]].id, textBoxValue));
        setEditing(null);
        setTextBoxValue('');
    }

    return (
        <section id='analytics'>
            <Modal show={editing !== null} onHide={() => setEditing(null)} centered>
                {
                    editing &&
                    <div className='edit-username-modal' style={{borderColor: editing[0] === 0 ? 'blue' : 'orange', backgroundColor: editing[0] === 0 ? 'rgba(255,255,255,0.8)' : 'rgba(0,0,0,0.8)'}}>
                        <h2 style={{color: editing[0] === 0 ? 'blue' : 'orange'}}>Edit username</h2>
                        <TextBox value={textBoxValue} handleOnChange={username => setTextBoxValue(username)} style={editing[0] === 0 ? {backgroundColor: 'black', color: 'white'} : {}} />
                        <div style={{display: 'flex', justifyContent: 'space-between', marginTop: 10}}>
                            <Button colour={editing[0] === 0 ? 'blue' : 'orange'} ghost handleOnClick={() => setEditing(null)}>Back</Button>
                            <Button colour={editing[0] === 0 ? 'blue' : 'orange'} disabled={textBoxValue === match.players[editing[0]][editing[1]].name} handleOnClick={() => submitNewUsername()}>Submit</Button>
                        </div>
                    </div>
                }
            </Modal>
            <Team name='BLUE' players={match.players[0]} season={match.season} setEditing={handleSetEditing(0)} canEdit={canEdit} colour='blue' />
            <Team name='ORANGE' players={match.players[1]} season={match.season} setEditing={handleSetEditing(1)} canEdit={canEdit} colour='orange' />
        </section>
    );
}

const Team = ({ name, players, colour, season, setEditing, canEdit }) => {

    const headings = [undefined, undefined, 'MMR', 'PLAYSTYLE\n(GOALS:SAVES:ASSISTS)', 'GAMES\nPLAYED', 'MVP/WIN', 'Streak', 'DIV\nUP/DOWN'];

    const rows = players.map((player, index) => [
        <PlayerRank loading={player.loading} error={player.error} playerName={player.name} rank={player.rank} division={player.division} />,
        <div style={{display: 'inline-flex'}}><span style={{color: player.error ? 'red' : undefined}}>{player.name}</span>{canEdit && <span className='pointer-on-hover' style={{marginLeft: 3}} onClick={() => setEditing(index)}><EditIcon /></span>}</div>,
        player.mmr,
        player.playstyle,
        player.games,
        player.mvpWinPercentage && `${player.mvpWinPercentage}${!player.loading && !player.error && '%'}`,
        player.streak
            ? <span style={{color: player.streak.type === 'W' ? '#00ff00' : 'red'}}>{player.streak.length + player.streak.type}</span>
            : ''
        ,
        player.divUp && player.divDown
            ?   <span style={{color: player.divUp < player.divDown ? '#00ff00' : 'red'}}>{player.divUp < player.divDown ? player.divUp + String.fromCharCode(8593) : player.divDown + String.fromCharCode(8595)}</span>
            :   player.divUp
                ? <span style={{color: '#00ff00'}}>{player.divUp}&uarr;</span>
                : player.divDown
                    ?   <span style={{color: 'red'}}>{player.divDown}&darr;</span>
                    :   ''

    ]);


    return (
        <Table title={name} headings={headings} rows={rows} caption={`Season ${season || 13} stats`} colour={colour} responsive />
    );
}

// const Team = ({ name, players, colour, season, setEditing, canEdit }) => {
//     return (
//         <>
//             <h2 style={{color: colour}}>{name}</h2>
//             <table className='player-table table-responsive'>
//                 <caption>Season {season || 13} stats</caption>
//                 <thead>
//                     <tr>
//                         <th></th>
//                         <th></th>
//                         <th>MMR</th>
//                         <th>PLAYSTYLE<br/>(GOALS:SAVES:ASSISTS)</th>
//                         <th>GAMES<br/>PLAYED</th>
//                         <th>MVP/WIN</th>
//                         <th>Streak</th>
//                         <th>DIV<br/>UP/DOWN</th>
//                     </tr>
//                 </thead>
//                 <tbody>
//                     {
//                         players.map((player, index) => 
//                             <tr key={'table-row:'+ player.name + index} className='player' style={{backgroundColor: colour === 'orange' ? '#964000' : colour}}>
//                                 <td>
//                                     <div style={{minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column nowrap'}}>
//                                         {!player.loading && !player.error && 
//                                             <>
//                                                 <img src={Ranks[player.rank]} alt={`${player.name} is rank ${player.rank}`}/>
//                                                 <span style={{fontSize: '0.8rem'}}>Div&nbsp;{player.division}</span>
//                                             </>
//                                         }
//                                         {
//                                             player.loading && 
//                                             <Spinner animation='border' role='status' variant='light' size='sm'>
//                                                 <span className='sr-only'>Loading...</span>
//                                             </Spinner>
//                                         }
//                                         {
//                                             player.error && <span style={{color: 'red', fontSize: '0.8rem'}}>Error</span>
//                                         }
//                                     </div>
//                                 </td>
//                                 <td><div style={{display: 'inline-flex'}}><span style={{color: player.error ? 'red' : undefined}}>{player.name}</span>{canEdit && <span className='pointer-on-hover' style={{marginLeft: 3}} onClick={() => setEditing(index)}><EditIcon /></span>}</div></td>
//                                 <td>{player.mmr}</td>
//                                 <td>{player.playstyle}</td>
//                                 <td>{player.games}</td>
//                                 <td>{player.mvpWinPercentage}{!player.loading && !player.error && '%'}</td>
//                                 <td>
//                                     {player.streak
//                                         ? <span style={{color: player.streak.type === 'W' ? '#00ff00' : 'red'}}>{player.streak.length + player.streak.type}</span>
//                                         : ''
//                                     }
//                                 </td>
//                                 <td>
//                                     {
//                                         player.divUp && player.divDown
//                                             ?   <span style={{color: player.divUp < player.divDown ? '#00ff00' : 'red'}}>{player.divUp < player.divDown ? player.divUp + String.fromCharCode(8593) : player.divDown + String.fromCharCode(8595)}</span>
//                                             :   player.divUp
//                                                 ? <span style={{color: '#00ff00'}}>{player.divUp}&uarr;</span>
//                                                 : player.divDown
//                                                     ?   <span style={{color: 'red'}}>{player.divDown}&darr;</span>
//                                                     :   ''
//                                     }
//                                 </td>
//                             </tr>
//                         )
//                     }
//                 </tbody>
//             </table>
//         </>        
//     );
// }

export default Analytics;