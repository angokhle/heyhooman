/**
 * @OnlyCurrentDoc  (asks Google for access to this one sheet only, not all your files)
 *
 * Hey Hooman survey: receives answers from heyhooman.in and saves each one
 * as a row in the "Responses" tab of the Google Sheet this script belongs to.
 *
 * Setup steps are in the repo README. After any change to this file, publish
 * it again with Deploy > Manage deployments > Edit > Version: New version, so
 * the web address stays the same.
 */

const SHEET_NAME = 'Responses';

const HEADERS = [
  'Submitted at',
  'Source',
  'Q1 What I miss most',
  'Q2 Sounds like me',
  'Q3 Found a stress-free place?',
  'Q3 Place they use',
  'Q4 Area',
  'Q5 Drive time',
  'Q6 Would pay for 90 min',
  'Q7 How often',
  'Phone',
  'Email',
  'OK to contact',
  'Seconds to complete',
];

function doPost(e) {
  try {
    const data = JSON.parse((e && e.postData && e.postData.contents) || '{}');

    // Hidden field that people never see. If it is filled in, a bot sent this.
    // Reply as if it worked so the bot does not retry.
    if (data.website) return reply_({ ok: true });

    if (data.survey !== 'hey-hooman-chennai-v1') {
      return reply_({ ok: false, error: 'unknown survey' });
    }

    const a = data.answers || {};
    const row = [
      new Date(),
      text_(data.source, 30),
      list_(a.q1),
      list_(a.q2),
      list_(a.q3),
      text_(data.existingPlace, 100),
      list_(a.q4),
      list_(a.q5),
      list_(a.q6),
      list_(a.q7),
      text_(data.phone, 25),
      text_(data.email, 120),
      data.contactConsent === true ? 'Yes' : 'No',
      Number.isFinite(Number(data.elapsedSec)) ? Math.round(Number(data.elapsedSec)) : '',
    ];

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      sheet_().appendRow(row);
    } finally {
      lock.releaseLock();
    }
    return reply_({ ok: true });
  } catch (err) {
    console.error(err);
    return reply_({ ok: false, error: 'could not save' });
  }
}

// Opening the web address in a browser shows a "running" message, so you can check it is live.
// The results page (heyhooman.in/results) asks for ?view=summary&key=... and gets the answers back,
// but only with the right key, and never with phone numbers or emails.
// Set the key in Project Settings > Script Properties as RESULTS_KEY.
function doGet(e) {
  const p = (e && e.parameter) || {};
  if (p.view === 'summary') {
    const key = PropertiesService.getScriptProperties().getProperty('RESULTS_KEY');
    if (!key || String(p.key || '') !== key) return reply_({ ok: false, error: 'wrong key' });
    return reply_({ ok: true, rows: summaryRows_() });
  }
  return reply_({ ok: true, message: 'Hey Hooman survey endpoint is running.' });
}

function summaryRows_() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
  if (!sheet || sheet.getLastRow() < 2) return [];
  const values = sheet.getRange(2, 1, sheet.getLastRow() - 1, HEADERS.length).getValues();
  return values.map(r => ({
    at: Object.prototype.toString.call(r[0]) === '[object Date]' ? r[0].toISOString() : String(r[0]),
    source: String(r[1] || ''),
    q1: String(r[2] || ''), q2: String(r[3] || ''), q3: String(r[4] || ''), place: String(r[5] || ''),
    q4: String(r[6] || ''), q5: String(r[7] || ''), q6: String(r[8] || ''), q7: String(r[9] || ''),
    signedUp: Boolean(r[10] || r[11]) && r[12] === 'Yes',
    seconds: r[13] === '' ? null : Number(r[13]),
  }));
}

function sheet_() {
  const book = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = book.getSheetByName(SHEET_NAME);
  if (!sheet) sheet = book.insertSheet(SHEET_NAME);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
  }
  return sheet;
}

// Joins a list of chosen answers into one cell, e.g. "Sniffing new places, A calm place to chill".
function list_(value) {
  if (!Array.isArray(value)) return '';
  return safe_(value.slice(0, 8).map(v => String(v).slice(0, 80)).join(', '));
}

function text_(value, max) {
  if (value === undefined || value === null) return '';
  return safe_(String(value).trim().slice(0, max));
}

// Stops typed text being read as a formula (and keeps "+91..." phone numbers as text).
function safe_(s) {
  return /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
}

function reply_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
