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

const PlayerTable = ({ match, canEdit, playerHistory }) => {
    const [editing, setEditing] = useState(null);
    const [textBoxValue, setTextBoxValue] = useState('');
    const dispatch = useDispatch();

    const handleSetEditing = team => player => {
        if (player === null ) {
            setEditing(null);
            setTextBoxValue('');
        } else {
            setEditing([team, player]);
            setTextBoxValue(match.players[team].filter(p => p.id === player)[0].name);
        }
    }

    const submitNewUsername = () => {
        dispatch(editUsername(match.id, editing[0], editing[1], textBoxValue));
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
                            <Button colour={editing[0] === 0 ? 'blue' : 'orange'} disabled={textBoxValue === match.players[editing[0]].filter(p => p.id === editing[1])[0].name} handleOnClick={() => submitNewUsername()}>Submit</Button>
                        </div>
                    </div>
                }
            </Modal>
            <Team name='BLUE' players={match.players[0]} season={match.season} setEditing={handleSetEditing(0)} canEdit={canEdit} colour='blue' playerHistory={playerHistory && playerHistory[0]} />
            <Team name='ORANGE' players={match.players[1]} season={match.season} setEditing={handleSetEditing(1)} canEdit={canEdit} colour='orange' playerHistory={playerHistory && playerHistory[1]} />
        </section>
    );
}

const Team = ({ name, players, colour, season, setEditing, canEdit, playerHistory }) => {

    const headings = [undefined, undefined, 'MMR*', 'PLAYSTYLE\n(GOALS:SAVES:ASSISTS)', 'GAMES\nPLAYED*', 'MVP/WIN', 'Streak', 'DIV\nUP/DOWN*'];
    
    var rows = players.map(player => [
        <PlayerRank loading={player.loading} error={player.error} playerName={player.name} rank={player.rank} division={player.division} />,
        <div style={{display: 'inline-flex'}}><span style={{color: player.error ? 'red' : undefined}}>{player.name}</span>{canEdit && <span className='pointer-on-hover' style={{marginLeft: 3}} onClick={() => setEditing(player.id)}><EditIcon /></span>}</div>,
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

    if (playerHistory) {
        headings.push('GAMES\nRECORDED', 'WINS/\nGAME**', 'GOALS/\nGAME**', 'ASSISTS/\nGAME**', 'SAVES/\nGAME**', 'SHOTS/\nGAME**', 'MVPS/\nGAME**');

        rows = rows.map((row, index) => {
            const player = playerHistory[index] ?? {};
            return row.concat([
                player.games,
                player.wins,
                player.goals,
                player.assists,
                player.saves,
                player.shots,
                player.mvps
            ]);
        });
    }


    return (
        <Table title={name} headings={headings} rows={rows} caption={`*Season ${season || 14} stats${playerHistory ? '\xa0\xa0\xa0**Calculated only from saved matches where stat could be determined' : ''}`} colour={colour} responsive />
    );
}

export default PlayerTable;