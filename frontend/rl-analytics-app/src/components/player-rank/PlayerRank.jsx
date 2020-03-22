import React from 'react';

import { Ranks } from '../../images';
import Spinner from 'react-bootstrap/Spinner';

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
                <Spinner animation='border' role='status' variant='light' size='sm'>
                    <span className='sr-only'>Loading...</span>
                </Spinner>
            }
            {
                error && <span style={{color: 'red', fontSize: '0.8rem'}}>Error</span>
            }
        </div>
    );
}

export default PlayerRank;