import mysql from 'mysql2';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

dotenv.config();

let isConnected = false;

const isAiven = process.env.DB_SSL === 'true' || (process.env.DB_HOST && process.env.DB_HOST.includes('aivencloud.com'));

// Resolve CA certificate path relative to the project root (process.cwd()).
// Using process.cwd() instead of import.meta.url/__dirname keeps this working
// both in dev (tsx, real ESM) and in the production build (esbuild bundles
// this to CJS, where import.meta.url is empty and __dirname doesn't exist).
const caPath = process.env.DB_SSL_CA
  ? path.resolve(process.cwd(), process.env.DB_SSL_CA)
  : path.resolve(process.cwd(), 'backend/config/ca.pem');

let sslConfig: any = undefined;
if (isAiven) {
  if (fs.existsSync(caPath)) {
    // Strict verification using Aiven's CA certificate
    sslConfig = {
      ca: fs.readFileSync(caPath, 'utf8'),
      rejectUnauthorized: true,
    };
    console.log('🔒 Using CA certificate for strict SSL verification: ' + caPath);
  } else {
    // Fallback: encrypted connection without certificate verification
    sslConfig = { rejectUnauthorized: false };
    console.log('⚠️  No CA certificate found at ' + caPath + ' — connecting with SSL but without certificate verification. Set DB_SSL_CA in .env or place ca.pem in backend/config/ to enable strict verification.');
  }
}

const db = mysql.createConnection({
  host: process.env.DB_HOST || 'mysql-1d245307-harishkumar636r-d0ff.d.aivencloud.com',
  user: process.env.DB_USER || 'avnadmin',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'defaultdb',
  port: Number(process.env.DB_PORT) || 24703,
  ssl: sslConfig,
} as any);

db.connect((err) => {
  if (err) {
    console.log("❌ MySQL Connection Status: Disconnected / Local Standby");
    console.log("   Reason: " + err.code + " — " + err.message);
    isConnected = false;
  } else {
    console.log("✅ MySQL Connected Successfully to " + (process.env.DB_NAME || 'okgip_db'));
    isConnected = true;
  }
});

export const queryAsync = (sql: string, params: any[] = []): Promise<any> => {
  return new Promise((resolve, reject) => {
    if (!db || !isConnected) {
      return resolve(null);
    }
    db.query(sql, params, (err, results) => {
      if (err) {
        console.error('MySQL Query Error:', err.message);
        return resolve(null);
      }
      resolve(results);
    });
  });
};

export { isConnected };
export default db;