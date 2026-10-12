const paths = {
  home:'M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1Z',
  dumbbell:'m6 6 12 12M3 7l4-4m10 18 4-4M2 10l8-8m4 20 8-8M5 13l8-8m-2 14 8-8',
  apple:'M12 7C6 3 2 8 4 14s5 8 8 6c3 2 6 0 8-6s-2-11-8-7Zm0 0c0-4 2-5 5-5m-5 5c-2-4-4-4-6-4',
  image:'M4 3h16a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM3 17l6-6 4 4 3-3 5 5M16 7h.01',
  users:'M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2M22 21v-2a4 4 0 0 0-3-3.87M16 3a4 4 0 0 1 0 8M9 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8',
  user:'M20 21v-2a7 7 0 0 0-14 0v2M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8',
  card:'M3 5h18v14H3ZM7 10a2 2 0 1 1 0 4m-1 2h4m4-6h4m-4 4h4',
  clock:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18M12 7v5l3 2',
  award:'M8 13 6 22l6-3 6 3-2-9M12 2a6 6 0 1 1 0 12 6 6 0 0 1 0-12',
  calendar:'M3 5h18v16H3ZM3 10h18M7 3v4m10-4v4M7 14h2m3 0h2m3 0h1M7 18h2m3 0h2',
  shirt:'M8 3 2 7l3 5 3-2v11h8V10l3 2 3-5-6-4c-2 3-6 3-8 0',
  file:'M14 2H4v20h16V8ZM14 2v6h6M8 12h8m-8 4h6',
  send:'m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13',
  folder:'M3 5h6l2 2h10v13H3Z',
  search:'M10 3a7 7 0 1 1 0 14 7 7 0 0 1 0-14m5 12 6 6',
  filter:'M3 5h18M6 12h12m-9 7h6M7 3v4m10 3v4m-5 3v4',
  plus:'M12 5v14M5 12h14',
  chevron:'m9 5 7 7-7 7',
  left:'m15 5-7 7 7 7',
  down:'m6 9 6 6 6-6',
  sort:'m8 8 4-4 4 4m-8 8 4 4 4-4M12 4v16',
  more:'M5 12h.01M12 12h.01M19 12h.01',
  edit:'m16 3 5 5-12 12-6 1 1-6 12-12Zm-2 2 5 5',
  trash:'M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7',
  video:'M3 5h12v14H3Zm12 5 6-4v12l-6-4',
  check:'m4 12 5 5L20 6',
  close:'m6 6 12 12M6 18 18 6',
  download:'M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5',
  upload:'M12 16V3m-5 5 5-5 5 5M4 16v5h16v-5',
  globe:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18M3 12h18M12 3c5 5 5 13 0 18-5-5-5-13 0-18',
  help:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18M9 9a3 3 0 1 1 4 3c-1 0-1 1-1 2M12 17h.01',
  eye:'M2 12c5-9 15-9 20 0-5 9-15 9-20 0Zm10-3a3 3 0 1 1 0 6 3 3 0 0 1 0-6',
  lock:'M5 10h14v11H5ZM8 10V6a4 4 0 0 1 8 0v4M12 14v3',
  logout:'M9 3H3v18h6m0-9h12m-5-5 5 5-5 5',
  menu:'M4 6h16M4 12h16M4 18h16',
  info:'M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18M12 11v6m0-10h.01',
  refresh:'M20 8a8 8 0 0 0-14-3L3 8m0-5v5h5m-4 8a8 8 0 0 0 14 3l3-3m0 5v-5h-5',
  copy:'M9 9h12v12H9ZM15 5V3H3v12h2',
};

export function icon(name) {
  if(name==='more') return '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1.25" fill="currentColor" stroke="none"/><circle cx="12" cy="12" r="1.25" fill="currentColor" stroke="none"/><circle cx="19" cy="12" r="1.25" fill="currentColor" stroke="none"/></svg>';
  return `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] ?? paths.file}"/></svg>`;
}

export function escape(value) {
  return String(value ?? '').replace(/[&<>"']/g, character => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[character]));
}

export function button(label, action, kind = '', glyph = '') {
  return `<button type="button" class="btn ${kind}" data-action="${action}">${glyph ? icon(glyph) : ''}${label}</button>`;
}

export function pill(value) {
  const success = ['Faol', 'Nashr qilingan', 'Faollashtirilgan'];
  const danger = ['Bloklangan', 'Bekor qilingan'];
  const style = success.includes(value) ? 'success' : danger.includes(value) ? 'danger' : value === 'Qoralama' || value === 'Yangi' ? 'warning' : '';
  return `<span class="pill ${style}"><span class="status-dot"></span>${escape(value)}</span>`;
}

export function field(label, name, value = '', type = 'text', wide = false) {
  return `<label class="field ${wide ? 'wide' : ''}">${label}<input name="${name}" type="${type}" value="${escape(value)}" ${type === 'number' ? 'min="0" step="any"' : ''}></label>`;
}

export function selectField(label, name, options, wide = false) {
  return `<label class="field ${wide ? 'wide' : ''}">${label}<select name="${name}">${options.map(x => `<option>${escape(x)}</option>`).join('')}</select></label>`;
}

export function textarea(label, name, value = '') {
  return `<label class="field wide">${label}<textarea name="${name}">${escape(value)}</textarea></label>`;
}

export function title(name, description, actions = '') {
  return `<header class="page-heading"><div><h1>${name}</h1><p>${description}</p></div>${actions ? `<div class="actions">${actions}</div>` : ''}</header>`;
}

export function avatar(initials, tone = '') {
  return `<span class="avatar ${tone}" aria-hidden="true">${escape(initials)}</span>`;
}

export function emptyState(kind, retry = 'reset') {
  const options = {
    empty: ['search', 'Natija topilmadi', 'Qidiruv matnini yoki filtrlarni o‘zgartirib ko‘ring.', 'Filtrlarni tozalash'],
    error: ['refresh', 'Ma’lumotni yuklab bo‘lmadi', 'Birozdan so‘ng qayta urinib ko‘ring.', 'Qayta urinish'],
    forbidden: ['lock', 'Bu sahifaga ruxsat yo‘q', 'Huquqlaringizni tekshirish uchun administratorga murojaat qiling.', 'Boshqaruv paneliga qaytish'],
    onboarding: ['user', 'Trener kartangiz hali yaratilmagan', 'Administrator trener kartangizni yaratganidan so‘ng ish boshlashingiz mumkin.', 'Kirish sahifasiga qaytish'],
    notfound: ['folder', 'Sahifa topilmadi', 'Sahifa ko‘chirilgan bo‘lishi mumkin. Ish maydoniga qayting.', 'Boshqaruv paneliga qaytish'],
  };
  const [glyph, heading, text, label] = options[kind] ?? options.empty;
  return `<div class="empty-state"><span class="state-icon">${icon(glyph)}</span><h2>${heading}</h2><p>${text}</p><div class="actions">${button(label, retry, 'primary')}</div></div>`;
}

export function chart() {
  return `<svg class="chart" viewBox="0 0 580 200" role="img" aria-label="Namuna vazn tarixi: 1 oktabrda 84.2 kilogramm, 9 oktabrda 82.4 kilogramm"><line x1="40" y1="35" x2="565" y2="35"/><line x1="40" y1="85" x2="565" y2="85"/><line x1="40" y1="135" x2="565" y2="135"/><line x1="40" y1="185" x2="565" y2="185"/><text x="4" y="39">85</text><text x="4" y="89">84</text><text x="4" y="139">83</text><text x="4" y="189">82</text><polyline points="40,75 115,94 190,84 265,111 340,130 415,125 490,145 565,165"/><circle cx="565" cy="165" r="5"/></svg><div class="chart-labels"><span>01 okt</span><span>03 okt</span><span>05 okt</span><span>07 okt</span><span>09 okt</span></div>`;
}

export function note(text) {
  return `<div class="info-note">${icon('info')}<span>${text}</span></div>`;
}
