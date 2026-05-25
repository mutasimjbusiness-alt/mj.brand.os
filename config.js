// ═══════════════════════════════════════════════════════════════
//  MJ BRAND OS — CONFIGURATION FILE
//  ★ This is the ONLY file you need to edit to set up your system.
//  All settings below control the behavior, branding, and
//  credentials for your Brand OS installation.
// ═══════════════════════════════════════════════════════════════

const MJ_CONFIG = {

  // ─── BRAND IDENTITY ────────────────────────────────────────
  // These values populate the system on first load.
  // After first setup, changes are saved to browser storage.
  brand: {
    name:       'MJ Brand System',
    tagline:    'Strategic Brand Architecture Studio',
    ownerName:  'Mohamed J.',
    ownerRole:  'Brand Strategist & Identity Designer',
    email:      'hello@mjbrandsystem.com',
    whatsapp:   '201000000000',         // Country code + number, no symbols
    location:   'Cairo, Egypt',
    availability: 'Accepting new projects',
  },

  // ─── ADMIN ACCESS ──────────────────────────────────────────
  // Password required to enter Admin Mode.
  // Change this to your own secure password before deploying.
  admin: {
    password:   'MJ-ADMIN-2026',
  },

  // ─── LICENSE & ACTIVATION ──────────────────────────────────
  // License key that buyers enter to activate the system.
  // Set your own key. The approval code unlocks full access.
  license: {
    key:          'gNE73&1+$9n7',
    approvalCode: 'MJ-APPROVED-2026',
    trialDays:    3,                    // Days of trial before lock
  },

  // ─── EMAIL SERVICE (EmailJS) ───────────────────────────────
  // Used for the contact form and license activation emails.
  // Sign up at https://www.emailjs.com/ and paste your IDs.
  // Leave as empty strings to disable email features.
  emailjs: {
    publicKey:    '6HKinFYf-RgDqrY0M',
    serviceId:    'service_pz2p57i',
    templateId:   'template_6m19bmo',
  },

  // ─── AI ASSISTANT (Optional) ───────────────────────────────
  // Embedded AI Brand Strategist powered by Anthropic Claude.
  // Leave apiKey empty to disable the AI assistant entirely.
  // ⚠️ WARNING: This key is visible in client-side code.
  //    For production, route calls through a backend proxy.
  ai: {
    enabled:    true,
    apiKey:     '',                      // Your Anthropic API key
    model:      'claude-sonnet-4-6',
    maxTokens:  320,
  },

  // ─── DEFAULT SERVICES ──────────────────────────────────────
  // The six service blocks displayed in the system.
  // Edit titles, descriptions, and sub-services here.
  services: {
    'brand-strategy': {
      num: '01',
      title: 'Brand Strategy',
      titleAr: 'استراتيجية العلامة التجارية',
      cat: 'Strategy',
      catAr: 'استراتيجية',
      chips: ['Positioning', 'Research', 'Messaging'],
      chipsAr: ['التموضع', 'البحث', 'الرسائل'],
      overview: 'The intellectual backbone of every brand — purpose, position, and competitive edge.',
      overviewAr: 'الركيزة الفكرية لكل علامة — الغرض والموقع والميزة التنافسية.',
      desc: 'Brand strategy is the foundation that makes everything else work. Before a color is chosen or a logo is drawn, we establish who this brand is, who it serves, and why it is the only logical choice in its category.',
      descAr: 'استراتيجية العلامة هي الأساس الذي يجعل كل شيء آخر يعمل. قبل اختيار لون أو رسم شعار، نحدد من هي هذه العلامة، من تخدم، ولماذا هي الخيار المنطقي الوحيد في فئتها.',
    },
    'naming': {
      num: '02',
      title: 'Naming & Verbal Identity',
      titleAr: 'التسمية والهوية اللفظية',
      cat: 'Verbal',
      catAr: 'لفظي',
      chips: ['Naming', 'Tone of Voice', 'Storytelling'],
      chipsAr: ['التسمية', 'اللهجة', 'رواية القصص'],
      overview: 'From naming strategy to tone, messaging, and brand story — the words that define the brand.',
      overviewAr: 'من استراتيجية التسمية إلى اللهجة والرسائل وقصة العلامة.',
      desc: 'Language is strategy made audible. The right name is not memorable because it is clever — it is memorable because it communicates position instantly and distinctively.',
      descAr: 'اللغة هي الاستراتيجية مسموعة. الاسم الصحيح لا يُحفظ لأنه ذكي — بل لأنه ينقل موقعاً فوريًا ومميزًا.',
    },
    'logo': {
      num: '03',
      title: 'Logo Design / Redesign',
      titleAr: 'تصميم الشعار / إعادة التصميم',
      cat: 'Logo',
      catAr: 'شعار',
      chips: ['Concept', 'System', 'Responsive'],
      chipsAr: ['المفهوم', 'النظام', 'التجاوب'],
      overview: 'From concept to system. Full logo development with responsive variants and usage guidelines.',
      overviewAr: 'من المفهوم إلى النظام. تطوير شعار كامل مع متغيرات متجاوبة وإرشادات استخدام.',
      desc: "A logo is not a brand. But it is the brand's most concentrated expression — the mark that must work across every scale, medium, and context without losing its authority.",
      descAr: 'الشعار ليس علامة. لكنه التعبير الأكثر تكثيفاً للعلامة — يجب أن يعمل عبر كل مقياس ووسيط وسياق دون أن يفقد سلطته.',
    },
    'visual-identity': {
      num: '04',
      title: 'Visual Identity System',
      titleAr: 'نظام الهوية البصرية',
      cat: 'Visual',
      catAr: 'بصري',
      chips: ['Color', 'Typography', 'Iconography'],
      chipsAr: ['الألوان', 'الخطوط', 'الأيقونات'],
      overview: 'A complete visual language — color, type, layout, iconography, and image style.',
      overviewAr: 'لغة بصرية متكاملة — الألوان والخطوط والتخطيط والأيقونوغرافيا وأسلوب الصور.',
      desc: 'Visual identity is the architecture of perception. Every element — from the primary color to the grid system — is designed to communicate personality, authority, and distinctiveness.',
      descAr: 'الهوية البصرية هي هندسة الإدراك. كل عنصر — من اللون الأساسي إلى نظام الشبكة — مصمم لنقل الشخصية والسلطة والتميز.',
    },
    'guidelines': {
      num: '05',
      title: 'Brand Guidelines',
      titleAr: 'دليل العلامة التجارية',
      cat: 'Guidelines',
      catAr: 'إرشادات',
      chips: ['Usage Rules', "Do & Don't", 'Digital Brand Book'],
      chipsAr: ['قواعد الاستخدام', 'صح وخطأ', 'الكتاب الرقمي'],
      overview: "The rulebook for consistency. Usage, do's & don'ts, the complete digital brand book.",
      overviewAr: 'دليل الاتساق. الاستخدام والصواب والخطأ والكتاب الرقمي الكامل للعلامة.',
      desc: 'Brand guidelines are not a design exercise — they are a strategic document. They codify every decision into rules that ensure the brand is applied consistently.',
      descAr: 'إرشادات العلامة ليست تمريناً تصميمياً — إنها وثيقة استراتيجية. تُقنن كل قرار في قواعد تضمن تطبيق العلامة باتساق.',
    },
    'applications': {
      num: '06',
      title: 'Brand Applications',
      titleAr: 'تطبيقات العلامة التجارية',
      cat: 'Applications',
      catAr: 'تطبيقات',
      chips: ['Stationery', 'Social', 'Packaging'],
      chipsAr: ['القرطاسية', 'السوشيال', 'التغليف'],
      overview: 'Stationery, social media, packaging, web UI, and collateral — every brand touchpoint.',
      overviewAr: 'القرطاسية ووسائل التواصل والتغليف وواجهة الويب والضمانات — كل نقطة تواصل للعلامة.',
      desc: 'The proof of a brand system is in its application. We take every identity decision and translate it into real-world touchpoints.',
      descAr: 'الاختبار الحقيقي لنظام العلامة هو في تطبيقه. نأخذ كل قرار هوية ونترجمه إلى نقاط تواصل في العالم الحقيقي.',
    },
  },

  // ─── DEFAULT PRICING ───────────────────────────────────────
  // Three pricing tiers shown on the Pricing page.
  pricing: {
    defaultCurrency: 'egp',
    packages: [
      {
        name: 'Essentials',
        priceEgp: 15000,
        priceUsd: 300,
        sub: 'One-time project',
        featured: false,
        features: [
          { text: 'Brand Strategy Brief', included: true },
          { text: 'Logo Design (3 Concepts)', included: true },
          { text: 'Color & Typography System', included: true },
          { text: 'Business Card Design', included: true },
          { text: 'Brand Guidelines (10 pages)', included: true },
          { text: 'Social Media Templates', included: false },
          { text: 'Brand Film / Motion', included: false },
        ],
      },
      {
        name: 'Identity System',
        priceEgp: 28000,
        priceUsd: 600,
        sub: 'Full brand identity',
        featured: true,
        features: [
          { text: 'Full Brand Strategy Document', included: true },
          { text: 'Logo Suite (All Variations)', included: true },
          { text: 'Complete Visual Language', included: true },
          { text: 'Stationery Design', included: true },
          { text: 'Brand Guidelines (30+ pages)', included: true },
          { text: 'Social Media Template Pack', included: true },
          { text: 'Brand Film / Motion', included: false },
        ],
      },
      {
        name: 'Brand OS',
        priceEgp: 55000,
        priceUsd: 1200,
        sub: 'Complete brand system',
        featured: false,
        features: [
          { text: 'Full Brand Strategy & Positioning', included: true },
          { text: 'Complete Identity System', included: true },
          { text: 'Tone of Voice & Messaging Guide', included: true },
          { text: 'Full Stationery & Collateral', included: true },
          { text: 'Brand Guidelines (50+ pages)', included: true },
          { text: 'Social Media System', included: true },
          { text: 'Brand Film / Motion Assets', included: true },
        ],
      },
    ],
  },

  // ─── INDEXEDDB SETTINGS ────────────────────────────────────
  storage: {
    dbName:    'mj_v5_idb',
    dbVersion: 1,
    storeName: 'imgs',
  },
  // Personal cloud (single owner — same data on all devices after login)
  supabase: {
    enabled:       true,
    url:           'https://iqzzuyprmqsopzkegmoh.supabase.co',
    anonKey:       'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlxenp1eXBybXFzb3B6a2VnbW9oIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1Njg0MzMsImV4cCI6MjA5MjE0NDQzM30.vBmziYb6v8DBjzkS1sF0jnDT9D-rh-G1PcF9neRe8Xk',
    bucket:        'mj-media',
    appStateTable: 'mj_app_state',
    stateKey:      'mj_system_state',
    ownerEmail:    'gmoatasem205@gmail.com',
  },
  // ─── SYSTEM ────────────────────────────────────────────────
  system: {
    version:      '2.0.0',
    autosaveMs:   2500,               // Auto-save delay in milliseconds
    defaultLang:  'en',               // 'en' or 'ar'
    defaultTheme: 'dark',             // 'dark' or 'light'
  },
};

// ─── FREEZE CONFIG (prevent accidental mutation) ──────────
if (typeof Object.freeze === 'function') {
  Object.freeze(MJ_CONFIG);
  Object.freeze(MJ_CONFIG.brand);
  Object.freeze(MJ_CONFIG.admin);
  Object.freeze(MJ_CONFIG.license);
  Object.freeze(MJ_CONFIG.emailjs);
  Object.freeze(MJ_CONFIG.ai);
  Object.freeze(MJ_CONFIG.storage);
  Object.freeze(MJ_CONFIG.supabase);
  Object.freeze(MJ_CONFIG.system);
}
