import { createSign } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join } from 'node:path';

const ANALYTICS_HOST = 'https://analyticsdata.googleapis.com';
const ANALYTICS_PROPERTIES_URL = `${ANALYTICS_HOST}/v1beta/properties`;
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const READONLY_SCOPE = 'https://www.googleapis.com/auth/analytics.readonly';
const JWT_GRANT_TYPE = 'urn:ietf:params:oauth:grant-type:jwt-bearer';
const TOKEN_LIFETIME_SECONDS = 3600;
const TOKEN_REFRESH_MARGIN_SECONDS = 300;
const MILLISECONDS_PER_SECOND = 1000;
const DEFAULT_KEY_FILE = join(homedir(), '.config', 'tofan', 'ga4-key.json');
const DEFAULT_PROPERTY_ID = '553445328';
const REPORT_METHODS = new Set(['runReport', 'batchRunReports', 'runRealtimeReport']);
const ROUTE_PREFIX = '/api/ga4/';
const UNAVAILABLE_STATUS = 503;
const NOT_FOUND_STATUS = 404;
const UNAVAILABLE_CODE = 'Analytics.Unavailable';
const LOG_PREFIX = '[ga4-proxy]';

export const GA4_PROXY_CONTEXT = '/api/ga4';

let cachedToken = null;
let pendingToken = null;

export function ga4ProxyEntry() {
  return {
    target: ANALYTICS_HOST,
    secure: true,
    changeOrigin: true,
    bypass: answerAnalyticsRequest,
  };
}

async function answerAnalyticsRequest(req, res) {
  const method = reportMethodOf(req);
  if (method === null) {
    writeJson(res, NOT_FOUND_STATUS, {
      title: UNAVAILABLE_CODE,
      detail: `Unknown route ${req.url}`,
    });
    return req.url;
  }
  try {
    const body = await readBody(req);
    const upstream = await callAnalytics(method, body);
    await relay(res, upstream);
  } catch (error) {
    reportFailure(res, error instanceof Error ? error.message : String(error));
  }
  return req.url;
}

function reportMethodOf(req) {
  const path = (req.url ?? '').split('?')[0];
  if (req.method !== 'POST' || !path.startsWith(ROUTE_PREFIX)) {
    return null;
  }
  const method = path.slice(ROUTE_PREFIX.length);
  return REPORT_METHODS.has(method) ? method : null;
}

async function callAnalytics(method, body) {
  const propertyId = process.env['TOFAN_GA4_PROPERTY_ID'] ?? DEFAULT_PROPERTY_ID;
  return fetch(`${ANALYTICS_PROPERTIES_URL}/${propertyId}:${method}`, {
    method: 'POST',
    headers: {
      authorization: `Bearer ${await accessToken()}`,
      'content-type': 'application/json',
    },
    body,
  });
}

async function relay(res, upstream) {
  const text = await upstream.text();
  if (upstream.ok) {
    res.statusCode = upstream.status;
    res.setHeader('content-type', 'application/json');
    res.end(text);
    return;
  }
  reportFailure(res, `Google answered ${upstream.status}: ${googleMessageOf(text)}`);
}

function reportFailure(res, detail) {
  console.error(`${LOG_PREFIX} ${detail}`);
  writeJson(res, UNAVAILABLE_STATUS, { title: UNAVAILABLE_CODE, detail });
}

function googleMessageOf(text) {
  try {
    return JSON.parse(text)?.error?.message ?? text;
  } catch {
    return text;
  }
}

function writeJson(res, status, body) {
  res.statusCode = status;
  res.setHeader('content-type', 'application/problem+json');
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (chunk) => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

async function accessToken() {
  if (cachedToken !== null && cachedToken.expiresAt > nowSeconds() + TOKEN_REFRESH_MARGIN_SECONDS) {
    return cachedToken.value;
  }
  pendingToken ??= requestToken().finally(() => {
    pendingToken = null;
  });
  return pendingToken;
}

async function requestToken() {
  const key = await readServiceAccountKey();
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({ grant_type: JWT_GRANT_TYPE, assertion: signedAssertion(key) }),
  });
  const answer = await response.json();
  if (!response.ok || typeof answer.access_token !== 'string') {
    throw new Error(`Google token request failed with ${response.status}`);
  }
  cachedToken = { value: answer.access_token, expiresAt: nowSeconds() + answer.expires_in };
  return cachedToken.value;
}

async function readServiceAccountKey() {
  const path = process.env['TOFAN_GA4_KEY_FILE'] ?? DEFAULT_KEY_FILE;
  try {
    return JSON.parse(await readFile(path, 'utf8'));
  } catch {
    throw new Error(`Service account key not readable at ${path}`);
  }
}

function signedAssertion(key) {
  const issuedAt = nowSeconds();
  const unsigned = [
    base64Url({ alg: 'RS256', typ: 'JWT' }),
    base64Url({
      iss: key.client_email,
      scope: READONLY_SCOPE,
      aud: TOKEN_URL,
      iat: issuedAt,
      exp: issuedAt + TOKEN_LIFETIME_SECONDS,
    }),
  ].join('.');
  const signer = createSign('RSA-SHA256');
  signer.update(unsigned);
  return `${unsigned}.${signer.sign(key.private_key, 'base64url')}`;
}

function base64Url(value) {
  return Buffer.from(JSON.stringify(value)).toString('base64url');
}

function nowSeconds() {
  return Math.floor(Date.now() / MILLISECONDS_PER_SECOND);
}
