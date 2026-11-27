/**
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

// Opening the web address in a browser shows this, so you can check it is live.
function doGet() {
  return reply_({ ok: true, message: 'Hey Hooman survey endpoint is running.' });
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
