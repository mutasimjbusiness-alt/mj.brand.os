// ═══════════════════════════════════════════════════════════════
//  MJ BRAND OS — CONFIGURATION TEMPLATE
//  ★ Copy this file and rename it to "config.js"
//  ★ Then fill in YOUR real values below
// ═══════════════════════════════════════════════════════════════

const MJ_CONFIG = {

  brand: {
    name:       'Your Brand Name',
    tagline:    'Your Tagline',
    ownerName:  'Your Name',
    ownerRole:  'Your Role',
    email:      'your@email.com',
    whatsapp:   '201000000000',
    location:   'Your City',
    availability: 'Accepting new projects',
  },

  admin: {
    password:   '',   // ← Put your admin password here
  },

  license: {
    key:          '',
    approvalCode: '',
    trialDays:    3,
  },

  emailjs: {
    publicKey:    '',  // ← From https://emailjs.com
    serviceId:    '',
    templateId:   '',
  },

  ai: {
    enabled:    false,
    apiKey:     '',    // ← Your Anthropic API key (or leave empty)
    model:      'claude-sonnet-4-6',
    maxTokens:  320,
  },

  storage: {
    dbName:    'mj_v5_idb',
    dbVersion: 1,
    storeName: 'imgs',
  },

  system: {
    version:      '2.0.0',
    autosaveMs:   2500,
    defaultLang:  'en',
    defaultTheme: 'dark',
  },
};

if (typeof Object.freeze === 'function') {
  Object.freeze(MJ_CONFIG);
  Object.freeze(MJ_CONFIG.brand);
  Object.freeze(MJ_CONFIG.admin);
  Object.freeze(MJ_CONFIG.license);
  Object.freeze(MJ_CONFIG.emailjs);
  Object.freeze(MJ_CONFIG.ai);
  Object.freeze(MJ_CONFIG.storage);
  Object.freeze(MJ_CONFIG.system);
}
