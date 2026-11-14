import assert from 'node:assert/strict';
import test from 'node:test';
import {
  createRateLimiter,
  getLeadIntakeConfig,
  LeadValidationError,
  normalizeLeadPayload,
} from '../server/leads-core.mjs';

const version = 'aureum-leads-privacy-v1';
const validEnvironment = {
  AUREUM_LEADS_ENABLED: 'true',
  AUREUM_LEADS_PRIVACY_APPROVED: 'true',
  AUREUM_LEADS_PRIVACY_NOTICE_VERSION: version,
  AUREUM_LEADS_RETENTION_DAYS: '30',
  BLOB_READ_WRITE_TOKEN: 'test-token',
};

function payload(overrides = {}) {
  return {
    submissionId: 'f8c7a7d4-6b5e-4f6b-9a1c-7d4f2a8b6c10',
    name: 'Ana Silva',
    email: 'ana@example.com',
    phone: '',
    destination: 'Portugal',
    objective: 'Estudos',
    message: 'Gostaria de entender as opções.',
    consent: true,
    privacyNoticeVersion: version,
    locale: 'pt',
    sourcePath: '/destinos/portugal/',
    ...overrides,
  };
}

test('lead intake stays disabled unless every privacy and retention gate is satisfied', () => {
  assert.equal(getLeadIntakeConfig(validEnvironment, '').enabled, false);
  assert.equal(getLeadIntakeConfig({ ...validEnvironment, AUREUM_LEADS_PRIVACY_APPROVED: 'false' }, version).enabled, false);
  assert.equal(getLeadIntakeConfig({ ...validEnvironment, AUREUM_LEADS_RETENTION_DAYS: '' }, version).enabled, false);
  assert.equal(getLeadIntakeConfig({ ...validEnvironment, AUREUM_LEADS_PRIVACY_NOTICE_VERSION: 'old' }, version).enabled, false);
  assert.equal(getLeadIntakeConfig(validEnvironment, version).enabled, true);
});

test('server accepts email-only, phone-only and combined contact details', () => {
  assert.equal(normalizeLeadPayload(payload(), version).email, 'ana@example.com');
  assert.equal(normalizeLeadPayload(payload({ email: '', phone: '+351912345678' }), version).phone, '+351912345678');
  const both = normalizeLeadPayload(payload({ phone: '+5511999999999' }), version);
  assert.equal(both.email, 'ana@example.com');
  assert.equal(both.phone, '+5511999999999');
});

test('server rejects missing contact, invalid email, invalid E.164 and missing consent', () => {
  assert.throws(() => normalizeLeadPayload(payload({ email: '', phone: '' }), version), LeadValidationError);
  assert.throws(() => normalizeLeadPayload(payload({ email: 'not-an-email' }), version), /e-mail/i);
  assert.throws(() => normalizeLeadPayload(payload({ phone: '11999999999' }), version), /telefone/i);
  assert.throws(() => normalizeLeadPayload(payload({ consent: false }), version), /autorização/i);
});

test('server requires the currently approved privacy notice version', () => {
  assert.throws(() => normalizeLeadPayload(payload({ privacyNoticeVersion: 'old' }), version), /privacidade/i);
  assert.throws(() => normalizeLeadPayload(payload(), ''), /privacidade/i);
});

test('server sanitizes bounded text and excludes unapproved locale values', () => {
  const lead = normalizeLeadPayload(payload({
    name: '  Ana\u0000 Silva  ',
    message: 'Linha 1\r\nLinha 2',
    locale: 'xx',
    sourcePath: '//external.example/path',
  }), version);
  assert.equal(lead.name, 'Ana Silva');
  assert.equal(lead.message, 'Linha 1\nLinha 2');
  assert.equal(lead.locale, 'pt');
  assert.equal(lead.sourcePath, null);
});

test('rate limiter blocks bursts and releases the bucket after its window', () => {
  let now = 1000;
  const allowed = createRateLimiter(2, 1000, () => now);
  assert.equal(allowed('client'), true);
  assert.equal(allowed('client'), true);
  assert.equal(allowed('client'), false);
  now += 1001;
  assert.equal(allowed('client'), true);
});
