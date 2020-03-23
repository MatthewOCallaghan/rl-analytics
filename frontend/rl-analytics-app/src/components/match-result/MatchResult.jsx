import React from 'react';

import Table from '../table/Table';
import PlayerRank from '../player-rank/PlayerRank';
import { MVP } from '../../images';

import './MatchResult.css';

const MatchResult = ({ match }) => {
    const winner = match.finished.completed ? 1 - match.players[0][0].result.wins : undefined;

    const showScore = match.finished.completed && match.players[0].concat(match.players[1]).filter(player => player.result.goals === undefined).length === 0;

    const blanks = match.finished.completed && match.players[0].concat(match.players[1]).map(player => player.result).filter(playerResult => ![playerResult.goals, playerResult.assists, playerResult.saves, playerResult.shots, playerResult.mmrChange].every(Number.isInteger)).length > 0;

    return (
        <>
            <h2>{match.finished.loading ? 'Calculating result...' : match.finished.error ? `Result: ${match.finished.error}` : 'Result'}</h2>
            { blanks && <p style={{fontStyle: 'italic'}}>Some stats are blank where they could not be determined</p> }
            <div className='match-result-team'>
                { winner !== undefined && winner === 0 && <span className='winner' style={{color: 'blue'}}>Winner</span> }
                <Team name='BLUE' colour='blue' players={match.players[0]} loading={match.finished.loading} error={match.finished.error} showScore={showScore} />
            </div>
            <div className='match-result-team'>
                { winner !== undefined && winner === 1 && <span className='winner' style={{color: 'orange'}}>Winner</span> }
                <Team name='ORANGE' colour='orange' players={match.players[1]} loading={match.finished.loading} error={match.finished.error} showScore={showScore} />
            </div>
        </>
    );
}

const Team = ({ name, colour, players, loading, error, showScore }) => {

    const headings = [undefined, undefined, 'GOALS', 'ASSISTS', 'SAVES', 'SHOTS', 'MMR\nCHANGE'];

    const rows = loading 
                    ?   players.map(player => [<PlayerRank loading />, player.name, undefined, undefined, undefined, undefined, undefined])
                    :   players.map(player => [
                            <PlayerRank error={error || player.result.error} playerName={player.name} rank={player.result.rank} division={player.result.division} />,
                            <div style={{display: 'inline-flex'}}><span style={{color: error || player.result.error ? 'red' : undefined}}>{player.name}</span>{player.result.mvps === 1 && <img src={MVP} alt={`${player.name} was MVP`}/>}</div>,
                            player.result.goals ?? '',
                            player.result.assists ?? '',
                            player.result.saves ?? '',
                            player.result.shots ?? '',
                            player.result.mmrChange ? <span style={{color: player.result.mmrChange < 0 ? 'red' : '#00ff00'}}>{Math.abs(player.result.mmrChange) + (player.result.mmrChange < 0 ? String.fromCharCode(8595) : String.fromCharCode(8593))}</span> : ''
                        ]);

    

    return <Table title={showScore ? `${players.reduce((acc, player) => acc + player.result.goals, 0)} ${name}` : name} colour={colour} headings={headings} rows={rows} responsive />
}

export default MatchResult;