// config/firebaseAdmin.js
import admin from 'firebase-admin';
import { readFileSync } from 'fs';


const serviceAccount = JSON.parse(
    readFileSync('./confing/girnes-e-com-firebase-adminsdk-fbsvc-470cd7e120.json', 'utf-8')
);

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export const messaging = admin.messaging();
