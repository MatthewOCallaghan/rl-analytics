import React from 'react';

import './TextBox.css';

const TextBox = ({placeholder, handleOnChange, style, value, disabled, type, disableSpellCheck, helpText }) => {
    return (
        <>
            <input 
                type={type ? type : 'text'} 
                style={style} 
                onChange={event => handleOnChange(event.target.value)} 
                placeholder={placeholder} 
                value={value} 
                disabled={disabled} 
                autoCapitalize={disableSpellCheck ? 'off' : undefined} 
                autoComplete={disableSpellCheck ? 'off' : undefined}
                spellCheck={disableSpellCheck ? 'false' : undefined} 
                autoCorrect={disableSpellCheck ? 'off' : undefined}
            ></input>
            { helpText && <small>{helpText}</small> }
        </>
    )
}

export default TextBox;