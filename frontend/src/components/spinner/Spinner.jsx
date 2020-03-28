import React from 'react';

import Spinner from 'react-bootstrap/Spinner';

const SpinnerWrapper = ({ small, light }) => {
    return (
        <Spinner animation='border' role='status' variant={light ? 'light' : 'dark'} size={small ? 'sm' : undefined}>
            <span className='sr-only'>Loading...</span>
        </Spinner>
    );
}

export default SpinnerWrapper;