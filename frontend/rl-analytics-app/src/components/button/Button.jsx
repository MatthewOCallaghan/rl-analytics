import React from 'react';

import './Button.css';

const Button = ({children, colour, style, disabled, handleOnClick, ghost, large}) => {
    return (
        <button type="button" disabled={disabled} className={`button-${colour}${disabled ? ' button-disabled' : ''}${ghost ? ' button-ghost' : ''}${large ? ' button-large' : ''}`} style={style} onClick={!disabled && handleOnClick ? () => handleOnClick() : undefined}>
            {children}
        </button>
    );
}

export default Button;