import React from 'react';

import './TextBox.css';

const TextBox = ({placeholder, handleOnChange}) => {
    return (
        <input onChange={event => handleOnChange(event.target.value)} placeholder={placeholder} ></input>
    )
}

export default TextBox;