import React from 'react';

import './TextBox.css';

const TextBox = ({placeholder, handleOnChange, style, value, disabled, type }) => {
    return (
        <input type={type ? type : 'text'} style={style} onChange={event => handleOnChange(event.target.value)} placeholder={placeholder} value={value} disabled={disabled} ></input>
    )
}

export default TextBox;