import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { google } from 'googleapis';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SERVER_ROOT = path.resolve(__dirname, '../..');

const DRIVE_SCOPES = ['https://www.googleapis.com/auth/drive'];

/** Resolve the Service Account JSON key path safely inside the server directory. */
export function resolveKeyFilePath() {
  const configured = process.env.GOOGLE_APPLICATION_CREDENTIALS || './drive-service-account.json';
  return path.isAbsolute(configured)
    ? configured
    : path.resolve(SERVER_ROOT, configured);
}

/**
 * Parse raw JSON string from process.env.GOOGLE_SERVICE_ACCOUNT_JSON (for cloud hosting
 * such as Render/Railway where secret files are injected as environment variables).
 */
export function parseServiceAccountEnvCredentials() {
  const raw = (process.env.GOOGLE_SERVICE_ACCOUNT_JSON || '').trim();
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.private_key === 'string') {
      parsed.private_key = parsed.private_key.replace(/\\n/g, '\n');
    }
    return parsed;
  } catch (err) {
    throw new Error(`Invalid GOOGLE_SERVICE_ACCOUNT_JSON environment variable: ${err.message}`);
  }
}

/** Determine active authentication mode: 'oauth2' if full OAuth env vars exist, else 'service-account'. */
export function getDriveAuthMode() {
  if (
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_REFRESH_TOKEN
  ) {
    return 'oauth2';
  }
  return 'service-account';
}

export function getRootFolderId() {
  const rootId = (process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID || process.env.GOOGLE_DRIVE_FOLDER_ID || '').trim();
  if (!rootId) {
    throw new Error('GOOGLE_DRIVE_ROOT_FOLDER_ID is not set in server/.env');
  }
  return rootId;
}

/**
 * Create an authenticated Google Drive v3 client.
 * Priority:
 *  1. OAuth2 env credentials (GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET + GOOGLE_REFRESH_TOKEN)
 *  2. GOOGLE_SERVICE_ACCOUNT_JSON env var (raw JSON string for Render/Railway deployment)
 *  3. Local Service Account JSON key file on disk (./drive-service-account.json)
 */
export function getDriveClient() {
  if (getDriveAuthMode() === 'oauth2') {
    const oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    oauth2Client.setCredentials({
      refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
    });
    return google.drive({ version: 'v3', auth: oauth2Client });
  }

  const envCredentials = parseServiceAccountEnvCredentials();
  if (envCredentials) {
    const auth = new google.auth.GoogleAuth({
      credentials: envCredentials,
      scopes: DRIVE_SCOPES,
    });
    return google.drive({ version: 'v3', auth });
  }

  const keyFile = resolveKeyFilePath();
  if (!fs.existsSync(keyFile)) {
    throw new Error(
      `Service Account credentials not found. Set GOOGLE_SERVICE_ACCOUNT_JSON or place key file at: ${keyFile}`
    );
  }

  const auth = new google.auth.GoogleAuth({
    keyFile,
    scopes: DRIVE_SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

/** Read non-sensitive service account metadata (only client_email, never private key). */
export function getServiceAccountEmail() {
  try {
    const envCredentials = parseServiceAccountEnvCredentials();
    if (envCredentials?.client_email) return envCredentials.client_email;

    const keyFile = resolveKeyFilePath();
    if (!fs.existsSync(keyFile)) return null;
    const parsed = JSON.parse(fs.readFileSync(keyFile, 'utf8'));
    return parsed.client_email || null;
  } catch {
    return null;
  }
}
