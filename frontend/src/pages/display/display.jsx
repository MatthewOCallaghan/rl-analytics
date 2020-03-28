import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Redirect, Link, useParams, useHistory } from 'react-router-dom';

import Layout from '../../components/layout/Layout';
import AnalyticsScreen from '../../components/analytics-screen/AnalyticsScreen';
import TextBox from '../../components/textbox/TextBox';
import Button from '../../components/button/Button';
import Modal from 'react-bootstrap/Modal';

import './display.css';

import { getMatches, checkInvites, replyToInvite, clearDisplay, checkIfCanResumeOwnership } from '../../redux/actions/display';
import { resumeOwnership } from '../../redux/actions/session';

export const SESSION_CODE_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
export const SESSION_CODE_LENGTH = 6;

export const handleTextBoxChange = setSessionId => sessionId => {
    setSessionId(sessionId.substring(0,SESSION_CODE_LENGTH).toUpperCase().replace(new RegExp(`[^${SESSION_CODE_CHARS}]`, 'g'), ''));
}

export const isSessionCodeFormatValid = code => code.length === SESSION_CODE_LENGTH && code.replace(new RegExp(`[^${SESSION_CODE_CHARS}]`, 'g'), '').length === code.length;

const Display = () => {
    const display = useSelector(store => store.display);
    const user = useSelector(store => store.user);
    const history = useHistory();
    
    const { code } = useParams();
    const dispatch = useDispatch();
    const invalidCode = display.invalidCode && display.invalidCode.code === code;

    const [viewInvite, setViewInvite] = useState(false);

    // Clear display for each new code
    useEffect(() => {
        if (code) {
            dispatch(clearDisplay());
        }
    }, [code, dispatch]);

    // Fetch session data
    useEffect(() => {
        if(code && !invalidCode) {
            dispatch(getMatches(code));
            if (user.profile) {
                dispatch(checkInvites(code));
                dispatch(checkIfCanResumeOwnership(code));
            }
            const interval = setInterval(() => {
                dispatch(getMatches(code));
                if (user.profile) {
                    dispatch(checkInvites(code));
                }
            }, 15000);
            return () => clearInterval(interval);
        }
    }, [dispatch, code, invalidCode, user.profile]);

    const onResumeOwnership = () => {
        if (display.resumeOwnershipToken) {
            dispatch(resumeOwnership(display.resumeOwnershipToken, code));
            history.push('/session');
         }
    }

    return (
        <>
            { display.acceptedInvite && <Redirect to='/session' /> }
            { display.invite && <InviteModal show={viewInvite} onHide={() => setViewInvite(false)} accept={() => dispatch(replyToInvite('accept', code))} reject={() => dispatch(replyToInvite('reject', code))} loading={display.invite.response} /> }
            <Layout>
                {
                    code === undefined || invalidCode
                        ?   <CodePrompt invalidCode={display.invalidCode} />
                        :   <AnalyticsScreen onOwnershipAction={display.resumeOwnershipToken ? () => onResumeOwnership() : display.invite ? () => setViewInvite(true) : undefined} ownershipButtonText={display.resumeOwnershipToken && 'Resume hosting'} errorAlert={display.error ? 'We are having trouble connecting to the session, but we will continue to try...' : false} code={code} matches={display.matches} secondaryButtonText='Quit' />
                }
            </Layout>
        </>
    );
}

const InviteModal = ({ show, onHide, accept, reject, loading }) => {

    return (
        <Modal show={show} onHide={onHide} centered>
            <div id='hosts-modal'>
                <h1>Invite</h1>
                <p>You have been invited to co-host the session. This does mean data from your match history can be used in the analytics provided for this session.</p>
                <div id='invite-buttons'>
                    <Button colour='green' handleOnClick={accept} large loading={loading === 'accept'} disabled={loading === 'reject'} >Accept</Button>
                    <Button colour='red' ghost handleOnClick={reject} large loading={loading === 'reject'} disabled={loading === 'accept'} >Reject</Button>
                </div>
            </div>
        </Modal>
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