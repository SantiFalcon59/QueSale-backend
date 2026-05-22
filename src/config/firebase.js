import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin SDK only if configured
const initFirebase = () => {
  // Try to find the service account JSON in multiple locations
  const possiblePaths = [
    path.resolve(process.cwd(), 'quesale-474c5-firebase-adminsdk-fbsvc-8b14575cc2.json'),
    path.resolve(process.cwd(), 'backend', 'quesale-474c5-firebase-adminsdk-fbsvc-8b14575cc2.json'),
    path.resolve(__dirname, '../..', 'quesale-474c5-firebase-adminsdk-fbsvc-8b14575cc2.json'),
  ];

  let serviceAccount = null;
  let foundPath = null;

  for (const servicePath of possiblePaths) {
    if (fs.existsSync(servicePath)) {
      serviceAccount = JSON.parse(fs.readFileSync(servicePath, 'utf8'));
      foundPath = servicePath;
      break;
    }
  }

  if (!serviceAccount && process.env.FIREBASE_PROJECT_ID) {
    serviceAccount = {
      type: process.env.FIREBASE_TYPE,
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI,
      token_uri: process.env.FIREBASE_TOKEN_URI,
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL,
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
  }

  if (serviceAccount?.project_id) {
    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log('✅ Firebase initialized successfully', foundPath ? `using ${foundPath}` : 'using environment variables');
      }
    } catch (error) {
      console.warn('⚠️ Firebase initialization skipped:', error.message);
    }
  } else {
    console.warn('⚠️ Firebase configuration not found. Skipping Firebase initialization.');
    console.warn('Expected service account at:', possiblePaths.join('\n  '));
  }
};

initFirebase();

let auth = null;
try {
  if (admin.apps.length > 0) {
    auth = admin.auth();
  }
} catch (error) {
  console.warn('⚠️ Firebase auth not available:', error.message);
}

export { auth };
export default admin;
