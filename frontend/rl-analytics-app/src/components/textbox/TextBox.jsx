import React from 'react';

import './TextBox.css';

const TextBox = ({placeholder, handleOnChange, style, value}) => {
    return (
        <input style={style} onChange={event => handleOnChange(event.target.value)} placeholder={placeholder} value={value}></input>
    )
}

export default TextBox;