import React from 'react';

import { Ranks } from '../../images';
import Spinner from '../spinner/Spinner';

const PlayerRank = ({ loading, error, rank, playerName, division }) => {
    return (
        <div style={{minHeight: '3rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexFlow: 'column nowrap'}}>
            {!loading && !error && 
                <>
                    <img src={Ranks[rank]} alt={`${playerName} is rank ${rank}`}/>
                    <span style={{fontSize: '0.8rem'}}>Div&nbsp;{division}</span>
                </>
            }
            {
                loading && 
                <Spinner light small />
            }
            {
                error && <span style={{color: 'red', fontSize: '0.8rem'}}>Error</span>
            }
        </div>
    );
}

export default PlayerRank;