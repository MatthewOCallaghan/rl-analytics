import React from 'react';

import './Box.css';

const Box = ({ colour, children, style }) => {
    return (
        <div className='box' style={{borderColor: colour, ...style}}>
            {children}
        </div>
    );
}

export default Box;