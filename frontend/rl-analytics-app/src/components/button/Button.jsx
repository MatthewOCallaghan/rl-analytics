import React from 'react';

import './Button.css';

const Button = ({children, colour, width, disabled, handleOnClick}) => {
    return (
        <div className={`button button-${colour} ${disabled && 'button-disabled'}`} style={{width}} onclick={disabled ? undefined : () => handleOnClick()}>
            {children}
        </div>
    );
}

export default Button;