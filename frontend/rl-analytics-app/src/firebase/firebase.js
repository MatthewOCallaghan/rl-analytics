import firebase from 'firebase/app';

import 'firebase/auth';

const config = process.env.NODE_ENV === 'production'
                    ?   {
                            apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
                            authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
                            databaseURL: process.env.REACT_APP_FIREBASE_DATABASE_URL,
                            projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
                            storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
                            messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
                            appId: process.env.REACT_APP_FIREBASE_APP_ID,
                            measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
                        }
                    :   require('./config').default;

firebase.initializeApp(config);

export const auth = firebase.auth();

export const createUser = (email, password) => auth.createUserWithEmailAndPassword(email, password);

export const signIn = (email, password) => auth.signInWithEmailAndPassword(email, password);

export const signOut = () => auth.signOut();

export default firebase;