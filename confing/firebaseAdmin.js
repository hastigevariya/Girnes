// // config/firebaseAdmin.js
// import admin from 'firebase-admin';
// import { readFileSync } from 'fs';


// const serviceAccount = JSON.parse(
//     readFileSync('./confing/girnes-e-com-firebase-adminsdk-fbsvc-470cd7e120.json', 'utf-8')
// );

// if (!admin.apps.length) {
//     admin.initializeApp({
//         credential: admin.credential.cert(serviceAccount),
//     });
// }

// export const messaging = admin.messaging();
import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();
const rawKey = process.env.FIREBASE_PRIVATE_KEY || "";
const privateKey = rawKey.replace(/\\n/g, '\n');
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            type: process.env.FIREBASE_TYPE,
            project_id: process.env.FIREBASE_PROJECT_ID,
            private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
            private_key: privateKey,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            client_id: process.env.FIREBASE_CLIENT_ID,
            auth_uri: process.env.FIREBASE_AUTH_URI,
            token_uri: process.env.FIREBASE_TOKEN_URI,
            auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
            client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
            universe_domain: process.env.FIREBASE_UNIVERSE_DOMAIN,
        }),
    });
    console.log('Firebase Admin initialized');
} else {
    console.log('Firebase Admin already initialized');
};

export const messaging = admin.messaging();
export const db = admin.firestore();
export const auth = admin.auth();

export default admin;
