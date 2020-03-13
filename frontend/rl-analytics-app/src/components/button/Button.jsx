import React from 'react';
import Spinner from 'react-bootstrap/Spinner';

import './Button.css';

const Button = ({children, colour, style, disabled, handleOnClick, ghost, large, loading}) => {
    return (
        <button type="button" disabled={disabled} className={`button-${colour}${disabled ? ' button-disabled' : ''}${ghost ? ' button-ghost' : ''}${large ? ' button-large' : ''}${loading ? ' button-loading' : ''}`} style={style} onClick={!disabled && handleOnClick ? () => handleOnClick() : undefined}>
            { loading 
                ? <Spinner animation='border' role='status' variant='light' size='sm' style={{marginBottom: '25%'}}><span className='sr-only'>Loading...</span></Spinner>
                : children
            }
        </button>
    );
}

export default Button;