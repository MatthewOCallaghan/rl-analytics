import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';

import Layout from '../../components/layout/Layout';
import AnalyticsScreen from '../../components/analytics-screen/AnalyticsScreen';
import TextBox from '../../components/textbox/TextBox';
import Button from '../../components/button/Button';

import './display.css';

import { getMatches } from '../../redux/actions/display';

export const SESSION_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const SESSION_CODE_LENGTH = 6;

export const handleTextBoxChange = setSessionId => sessionId => {
    setSessionId(sessionId.substring(0,SESSION_CODE_LENGTH).toUpperCase().replace(new RegExp(`[^${SESSION_CODE_CHARS}]`, 'g'), ''));
}

export const isSessionCodeFormatValid = code => code.length === SESSION_CODE_LENGTH && code.replace(new RegExp(`[^${SESSION_CODE_CHARS}]`, 'g'), '').length === code.length;

const Display = ({ match }) => {
    const display = useSelector(store => store.display);
    const code = match.params.code;
    const dispatch = useDispatch();

    useEffect(() => {
        if(code && !display.invalidCode) {
            dispatch(getMatches(code));
            const interval = setInterval(() => {
                dispatch(getMatches(code));
            }, 15000);
            return () => clearInterval(interval);
        }
    }, [dispatch, code, display.invalidCode]);

    return (
        <Layout>
            {
                code === undefined || display.invalidCode
                    ?   <CodePrompt invalidCode={display.invalidCode} />
                    :   <AnalyticsScreen errorAlert={display.error ? 'We are having trouble connecting to the session, but we will continue to try...' : false} code={code} matches={display.matches} secondaryButtonText='Quit' />
            }
        </Layout>
    );
}

const CodePrompt = ({ invalidCode }) => {
    const [sessionId, setSessionId] = useState('');

    return (
        <div className='container-vertically-centre' style={{alignItems: 'center'}}>
            <div id='code-prompt'>
                <h1>Enter session code</h1>
                { invalidCode && <p id='invalid-code-message'>That session code does not exist</p> }
                <TextBox value={sessionId} handleOnChange={handleTextBoxChange(setSessionId)} style={{textTransform: 'uppercase'}} />
                {
                    isSessionCodeFormatValid(sessionId)
                        ?   <Link to={`/display/${sessionId}`}><Button colour='white' large ghost>Submit</Button></Link>
                        :   <Button colour='white' disabled large ghost>Submit</Button>
                }
            </div>
        </div>
    );
}

export default Display;