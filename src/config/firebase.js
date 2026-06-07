import admin from 'firebase-admin';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SERVICE_ACCOUNT_FILE = 'quesale-474c5-firebase-adminsdk-fbsvc-8b14575cc2.json';

// Initialize Firebase Admin SDK only if configured
const initFirebase = () => {
  const searchPaths = [
    // From current working directory (backend dir or project root)
    path.resolve(process.cwd(), SERVICE_ACCOUNT_FILE),
    path.resolve(process.cwd(), 'backend', SERVICE_ACCOUNT_FILE),
    // Relative to this config file: src/config/ -> ../../ -> backend/
    path.resolve(__dirname, '../..', SERVICE_ACCOUNT_FILE),
    // Relative to server entry: src/ -> ../
    path.resolve(__dirname, '..', SERVICE_ACCOUNT_FILE),
    // GOOGLE_APPLICATION_CREDENTIALS env var
    ...(process.env.GOOGLE_APPLICATION_CREDENTIALS
      ? [path.resolve(process.env.GOOGLE_APPLICATION_CREDENTIALS)]
      : []),
    // Fallback: walk up directories from cwd
    ...(() => {
      const walks = [];
      let dir = process.cwd();
      for (let i = 0; i < 4; i++) {
        walks.push(path.resolve(dir, SERVICE_ACCOUNT_FILE));
        dir = path.resolve(dir, '..');
      }
      return walks;
    })(),
  ];

  let serviceAccount = null;
  let foundPath = null;

  for (const servicePath of searchPaths) {
    if (fs.existsSync(servicePath)) {
      try {
        serviceAccount = JSON.parse(fs.readFileSync(servicePath, 'utf8'));
        foundPath = servicePath;
        break;
      } catch (e) {
        console.warn(`⚠️ Found service account file but JSON parse failed at ${servicePath}: ${e.message}`);
      }
    }
  }

  if (!serviceAccount && process.env.FIREBASE_PROJECT_ID) {
    serviceAccount = {
      type: process.env.FIREBASE_TYPE || 'service_account',
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL,
      client_id: process.env.FIREBASE_CLIENT_ID,
      auth_uri: process.env.FIREBASE_AUTH_URI || 'https://accounts.google.com/o/oauth2/auth',
      token_uri: process.env.FIREBASE_TOKEN_URI || 'https://oauth2.googleapis.com/token',
      auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_CERT_URL || 'https://www.googleapis.com/oauth2/v1/certs',
      client_x509_cert_url: process.env.FIREBASE_CLIENT_CERT_URL,
    };
    console.log('ℹ️ Using Firebase env vars for service account');
  }

  if (serviceAccount?.project_id) {
    try {
      if (admin.apps.length === 0) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount),
        });
        console.log(`✅ Firebase initialized successfully ${foundPath ? `using ${foundPath}` : 'using environment variables'}`);
      }
    } catch (error) {
      console.warn('⚠️ Firebase initialization failed:', error.message);
    }
  } else {
    console.warn('⚠️ Firebase service account not found. Firebase Auth will be unavailable.');
    console.warn(`   File searched as "${SERVICE_ACCOUNT_FILE}" in:`);
    searchPaths.forEach(p => console.warn(`   - ${p}`));
    if (!process.env.FIREBASE_PROJECT_ID) {
      console.warn('   Also tried FIREBASE_PROJECT_ID env var but it is not set.');
      console.warn('   To fix: place the service account JSON in the backend/ directory,');
      console.warn('   or set env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY');
      console.warn('   or set GOOGLE_APPLICATION_CREDENTIALS to the full path of the JSON file.');
    }
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
