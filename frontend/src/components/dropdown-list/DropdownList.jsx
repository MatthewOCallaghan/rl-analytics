import React from 'react';

import './DropdownList.css';

const DropdownList = ({ options, handleOnChange, value, disabled }) => {
    return (
        <select value={value} onChange={handleOnChange ? event => handleOnChange(event.target.value) : undefined} disabled={disabled} >
            {
                options.map((option, index) => <option key={`dropdown-${option.value}-${option.text}-${index}`} value={option.value}>{option.label}</option>)
            }
        </select>
    );
}

export default DropdownList;