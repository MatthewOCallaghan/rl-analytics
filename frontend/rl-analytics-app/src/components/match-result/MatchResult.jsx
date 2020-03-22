import React from 'react';

import Table from '../table/Table';
import PlayerRank from '../player-rank/PlayerRank';
import { MVP } from '../../images';

const MatchResult = ({ match }) => {
    return (
        <>
            <h2>{match.finished.loading ? 'Calculating result...' : match.finished.error ? `Result: ${match.finished.error}` : 'Result'}</h2>
            <Team name='BLUE' colour='blue' players={match.players[0]} loading={match.finished.loading} />
            <Team name='ORANGE' colour='orange' players={match.players[1]} loading={match.finished.loading} />
        </>
    );
}

const Team = ({ name, colour, players, loading }) => {

    const headings = [undefined, undefined, 'GOALS', 'ASSISTS', 'SAVES', 'SHOTS', 'MMR\nCHANGE'];

    const rows = loading 
                    ?   players.map(player => [<PlayerRank loading />, player.name, undefined, undefined, undefined, undefined, undefined])
                    :   players.map(player => [
                            <PlayerRank error={player.result.error} playerName={player.name} rank={player.result.rank} division={player.result.division} />,
                            <div style={{display: 'inline-flex'}}><span style={{color: player.result.error ? 'red' : undefined}}>{player.name}</span>{player.result.mvps && <img src={MVP} alt={`${player.name} was MVP`}/>}</div>,
                            player.result.goals ?? '',
                            player.result.assists ?? '',
                            player.result.saves ?? '',
                            player.result.shots ?? '',
                            player.result.mmrChange ? <span style={{color: player.result.mmrChange < 0 ? 'red' : '#00ff00'}}>{Math.abs(player.result.mmrChange) + player.result.mmrChange < 0 ? String.fromCharCode(8595) : String.fromCharCode(8593)}</span> : ''
                        ]);

    return <Table title={name} colour={colour} headings={headings} rows={rows} responsive />
}

export default MatchResult;