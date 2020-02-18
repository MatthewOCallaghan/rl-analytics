import React from 'react';

import './Button.css';

const Button = ({children, colour, style, disabled, handleOnClick, ghost}) => {
    return (
        <button type="button" disabled={disabled} className={`button-${colour}${disabled ? ' button-disabled' : ''}${ghost ? ' button-ghost' : ''}`} style={style} onClick={disabled ? undefined : () => handleOnClick()}>
            {children}
        </button>
    );
}

export default Button;