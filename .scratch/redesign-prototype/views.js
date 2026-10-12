import { tables, clients, programs } from './data.js';
import { icon, escape, button, pill, field, selectField, textarea, title, avatar, emptyState, chart, note } from './ui.js';

export function catalog(state, key = state.screen) {
  const config = tables[key];
  const headings = title(config.title, config.description, catalogActions(config, key));
  const body = `<section class="panel" aria-label="${config.title}">${catalogTabs(state, key)}${catalogToolbar(state, key)}${state.filters ? filters(state, key) : ''}<div id="table-region">${tableRegion(state, key)}</div></section>`;
  return `${headings}<div class="studio-content"><div>${body}${workspaceNote()}</div>${context(state, key)}</div>`;
}

function catalogActions(config, key) {
  const exportAction = key === 'garments' ? button('Eksport', 'export', '', 'download') : '';
  return exportAction + (config.add ? button(config.add, `add:${key}`, 'primary', key === 'media' ? 'upload' : 'plus') : '');
}

function catalogTabs(state, key) {
  const rows = tables[key].rows;
  const options = key === 'exercises' || key === 'foods' || key === 'templates' ? ['Barchasi','Faol','Nofaol'] : key === 'trainers' ? ['Barchasi','Nashr qilingan','Qoralama'] : [];
  if (!options.length) return '';
  return `<div class="tabs" aria-label="Holat bo‘yicha saralash">${options.map((label,index) => `<button class="tab ${state.tab === index ? 'active' : ''}" aria-pressed="${state.tab === index}" data-action="tab:${index}">${label}<span>${index ? rows.filter(x => x.status === label).length : rows.length}</span></button>`).join('')}</div>`;
}

function catalogToolbar(state, key) {
  const config = tables[key];
  const statusOptions = [...new Set(config.rows.map(x => x.status).filter(Boolean))];
  const status = config.columns.some(x => x[0] === 'status') ? `<select id="status-filter" class="select" aria-label="Holat bo‘yicha filtr"><option value="">Barcha holatlar</option>${statusOptions.map(x => `<option ${state.status === x ? 'selected' : ''}>${x}</option>`).join('')}</select>` : '';
  return `<div class="toolbar"><label class="search">${icon('search')}<input id="search" type="search" placeholder="${key === 'exercises' ? 'Mashq nomini qidiring…' : 'Qidirish…'}" aria-label="${config.title} ichida qidirish" value="${escape(state.query)}"></label>${status}${button('Filtrlar' + (state.muscle || state.equipment ? ' <span class="filter-count">•</span>' : ''), 'filters', '', 'filter')}<span class="count-label">${filteredRows(state,key).length} ta ${config.noun}</span></div>`;
}

function filters(state, key) {
  if (key !== 'exercises') return `<div class="filters"><label>Ko‘rinish<select id="sort-filter" class="select"><option value="asc">Nom bo‘yicha A–Z</option><option value="desc" ${state.sort === 'desc' ? 'selected' : ''}>Nom bo‘yicha Z–A</option></select></label>${button('Tozalash','reset','text','refresh')}</div>`;
  const select = (label, id, values, selected) => `<label>${label}<select class="select" id="${id}"><option value="">Barchasi</option>${values.map(x => `<option ${selected === x ? 'selected' : ''}>${x}</option>`).join('')}</select></label>`;
  return `<div class="filters">${select('Mushak guruhi','muscle-filter',['Oyoqlar','Ko‘krak','Orqa','Qorin','Yelkalar','Qo‘llar'],state.muscle)}${select('Jihoz','equipment-filter',['Shtanga','Gantel','Tana vazni'],state.equipment)}${select('Murakkablik','difficulty-filter',['Oson','O‘rta','Qiyin'],state.difficulty)}${button('Tozalash','reset','text','refresh')}</div>`;
}

export function filteredRows(state, key) {
  const tabs = ['','Faol','Nofaol'];
  const trainerTabs = ['','Nashr qilingan','Qoralama'];
  const selected = key === 'trainers' ? trainerTabs[state.tab] : tabs[state.tab];
  const matches = row => Object.values(row).join(' ').toLocaleLowerCase().includes(state.query.toLocaleLowerCase()) && (!state.status || row.status === state.status) && (!state.tab || row.status === selected) && (!state.muscle || row.muscle === state.muscle) && (!state.equipment || row.equipment === state.equipment) && (!state.difficulty || row.difficulty === state.difficulty);
  const rows = tables[key].rows.filter(matches);
  return state.sort ? rows.sort((a,b) => state.sort === 'asc' ? a.name.localeCompare(b.name) : b.name.localeCompare(a.name)) : rows;
}

export function tableRegion(state, key) {
  if (state.viewState === 'error') return emptyState('error','retry');
  if (state.viewState === 'empty') return emptyState('empty','retry');
  if (state.viewState === 'loading') return `<div aria-label="Ma’lumot yuklanmoqda" aria-busy="true">${Array.from({length:6},() => `<div class="skeleton-row"><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div><div class="skeleton"></div></div>`).join('')}</div>`;
  const rows = filteredRows(state,key);
  if (!rows.length) return emptyState('empty');
  const maxPage = Math.max(1,Math.ceil(rows.length/state.pageSize));
  state.page = Math.min(state.page,maxPage);
  const start = (state.page-1)*state.pageSize;
  const visible = rows.slice(start,start+state.pageSize);
  return `${tableMarkup(state,key,visible)}${pagination(state,rows.length,start,maxPage)}`;
}

function tableMarkup(state, key, rows) {
  const config = tables[key];
  const header = config.columns.map(([fieldName,label]) => `<th scope="col" ${fieldName === 'name' ? `aria-sort="${state.sort === 'desc' ? 'descending' : state.sort ? 'ascending' : 'none'}"` : ''}>${fieldName === 'name' ? `<button data-action="sort">${label}${icon('sort')}</button>` : label}</th>`).join('');
  const body = rows.map(row => `<tr>${config.columns.map(([fieldName]) => `<td>${cell(row,fieldName,config,key)}</td>`).join('')}<td><div class="row-actions">${row.video ? `<span title="Video mavjud" aria-label="Video mavjud">${icon('video')}</span>` : ''}<button class="icon-button" data-action="row:${key}:${row.id}" aria-label="${escape(row.name)} — ${['soldiers','accounts','sessions','garments'].includes(key) ? 'tafsilotlar' : 'tahrirlash'}">${icon(['soldiers','accounts','sessions','garments'].includes(key) ? 'eye' : 'edit')}</button><button class="icon-button" aria-label="${escape(row.name)} — boshqa amallar" aria-haspopup="menu" data-action="more:${key}:${row.id}">${icon('more')}</button></div></td></tr>`).join('');
  return `<div class="table-scroll"><table><caption hidden>${config.title} — namuna ma’lumotlari</caption><thead><tr>${header}<th scope="col"><span>Amallar</span></th></tr></thead><tbody>${body}</tbody></table></div>${mobileRecords(rows,config,key)}`;
}

function mobileRecords(rows,config,key) {
  return `<div class="mobile-records">${rows.map(row=>`<article class="mobile-record"><div class="mobile-record-heading">${cell(row,'name',config,key)}<button class="icon-button" aria-label="${escape(row.name)} — boshqa amallar" aria-haspopup="menu" data-action="more:${key}:${row.id}">${icon('more')}</button></div><dl class="mobile-record-facts">${config.columns.filter(x=>x[0]!=='name').map(([fieldName,label])=>`<div><dt>${label}</dt><dd>${cell(row,fieldName,config,key)}</dd></div>`).join('')}</dl></article>`).join('')}</div>`;
}

function cell(row, fieldName, config, key) {
  if (fieldName === 'name') return `<div class="cell-identity">${row.initials ? avatar(row.initials,row.tone) : `<span class="thumb ${row.tone ?? ''}">${icon(config.icon)}</span>`}<button class="row-name" data-action="row:${key}:${row.id}"><b>${escape(row.name)}</b><small>${escape(row.sub)}</small></button></div>`;
  if (fieldName === 'status') return pill(row.status);
  if (fieldName === 'difficulty') {
    const level = row.difficulty === 'Oson' ? 1 : row.difficulty === 'O‘rta' ? 2 : 3;
    return `<span class="difficulty" aria-hidden="true">${[1,2,3].map(n => `<i class="${n <= level ? 'on' : ''}"></i>`).join('')}</span>${escape(row.difficulty)}`;
  }
  return escape(row[fieldName] ?? '—');
}

function pagination(state, total, start, maxPage) {
  const pages = Array.from({length:maxPage},(_,i) => `<button data-action="page:${i+1}" class="${state.page === i+1 ? 'active' : ''}" ${state.page === i+1 ? 'aria-current="page"' : ''} aria-label="${i+1}-sahifa">${i+1}</button>`).join('');
  return `<footer class="pagination"><span>${total} tadan ${start+1}–${Math.min(start+state.pageSize,total)} ko‘rsatilmoqda</span><div class="pages"><button data-action="page:${state.page-1}" ${state.page === 1 ? 'disabled' : ''} aria-label="Oldingi sahifa">${icon('left')}</button>${pages}<button data-action="page:${state.page+1}" ${state.page === maxPage ? 'disabled' : ''} aria-label="Keyingi sahifa">${icon('chevron')}</button></div><label>Har sahifada <select id="page-size" class="page-size">${[6,12,24].map(n=>`<option ${state.pageSize === n ? 'selected' : ''}>${n}</option>`).join('')}</select></label></footer>`;
}

function context(state, key) {
  const config = tables[key];
  const rows = config.rows;
  return `<aside class="studio-context" aria-label="Katalog haqida"><div class="context-block"><h3>Katalog tarkibi</h3><div class="context-stat"><span>Jami ${config.noun}</span><b>${rows.length}</b></div><div class="context-stat"><span>Faol</span><b>${rows.filter(x => ['Faol','Nashr qilingan','Faollashtirilgan'].includes(x.status)).length}</b></div>${key === 'exercises' ? `<div class="context-stat"><span>Videosi bor</span><b>${rows.filter(x => x.video).length}</b></div>` : ''}</div><div class="context-block"><h3>Ish jarayoni</h3><p>Nom orqali qidiring. Kam ishlatiladigan parametrlarni “Filtrlar” ichidan toping.</p></div><a class="context-link" href="?variant=${state.variant}&app=admin&screen=${key === 'exercises' ? 'media' : 'exercises'}">${icon(key === 'exercises' ? 'image' : 'dumbbell')}${key === 'exercises' ? 'Media fayllarni ochish' : 'Mashqlar katalogi'}</a></aside>`;
}

export function workspaceNote() {
  return `<div class="workspace-note"><span>Tofan ish maydoni</span><span>Prototip · namuna ma’lumotlari</span></div>`;
}

export function dashboard(state) {
  const shortcuts = [['exercises','Mashqlar katalogi','Mashqlar, jihozlar va videolar','dumbbell'],['trainers','Trenerlar','Trener kartalari va obunalar','award'],['garments','NFC futbolkalar','Mahsulot va faollashtirish','shirt']];
  const links = shortcuts.map(([screen,name,description,glyph]) => `<a class="list-row" href="?variant=${state.variant}&app=admin&screen=${screen}"><span class="thumb">${icon(glyph)}</span><span class="grow"><b>${name}</b><small>${description}</small></span>${icon('chevron')}</a>`).join('');
  return `${title('Ish maydoningiz','Katalog va foydalanuvchilar bilan ishlashni boshlang.')}<div class="overview"><div class="overview-intro"><div><h2>Har bir ish o‘z joyida.</h2><p>Katalog, trenerlar va foydalanuvchilar uchun yagona boshqaruv maydoni.</p></div><div class="actions">${button('Mashqlarni boshqarish','navigate:exercises','primary','dumbbell')}</div></div><section class="panel"><div class="panel-header"><h2>Tezkor o‘tish</h2></div>${links}</section></div><div class="mini-stats">${[['exercises','Mashqlar'],['foods','Ovqatlar'],['trainers','Trenerlar']].map(([key,label]) => `<a class="mini-stat" href="?variant=${state.variant}&app=admin&screen=${key}"><span>${label}</span><strong>${tables[key].rows.length}</strong><span>Namuna katalogida</span></a>`).join('')}</div><section class="panel link-list"><div class="panel-header"><h2>Foydalanuvchilar bilan ishlash</h2><span class="small">Kerakli bo‘limga tez o‘ting</span></div><a class="list-row" href="?variant=${state.variant}&app=admin&screen=accounts">${icon('card')}<span class="grow">Hisoblar va rollar</span>${icon('chevron')}</a><a class="list-row" href="?variant=${state.variant}&app=admin&screen=send">${icon('send')}<span class="grow">Bildirishnoma yuborish</span>${icon('chevron')}</a></section>${workspaceNote()}`;
}

export function coachPrograms() {
  const column = (type,label,glyph) => `<section class="panel"><header class="panel-header"><div class="cell-identity"><span class="thumb ${type === 'meal' ? 'sand' : 'mint'}">${icon(glyph)}</span><div><h2>${label}</h2><p>${programs.filter(x=>x.type===type).length} ta dastur</p></div></div>${button('Qo‘shish',`program-add:${type}`,'','plus')}</header>${programs.filter(x=>x.type===type).map(programItem).join('')}</section>`;
  return `${title('Dasturlar','Mashg‘ulot va ovqatlanish rejalarini bir joyda boshqaring.',button('Yangilash','program-refresh','','refresh'))}<div class="program-grid">${column('workout','Mashg‘ulot dasturlari','dumbbell')}${column('meal','Ovqatlanish rejalari','apple')}</div>${note('To‘liq dastur uchun mashg‘ulot va ovqatlanish rejasi birgalikda kerak.')}${workspaceNote()}`;
}

function programItem(program) {
  return `<article class="program-item"><div class="program-art ${program.type === 'meal' ? 'meal' : ''}">${icon(program.type === 'meal' ? 'apple' : 'dumbbell')}<small>${program.place}</small></div>${pill(program.status)}<h3>${escape(program.name)}</h3><div class="program-meta"><span>${program.meta}</span><span>·</span><span>${program.place}</span></div><div class="actions">${button('Tahrirlash',`program-open:${program.id}`,'','edit')}${program.status === 'Qoralama' ? button('Nashr qilish',`publish:${program.id}`,'text','check') : '<span class="small">Foydalanuvchilarga ko‘rinadi</span>'}</div></article>`;
}

export function coachClients(state) {
  return `${title('Mijozlar','Obuna muddati va har bir mijozning natijalarini ko‘ring.')}<div class="client-grid">${clients.map((client,index)=>`<button class="panel client-card" data-action="client:${index}">${avatar(client.initials,client.tone)}<h3>${client.name}</h3><p>${client.goal}</p><footer><span>Obuna: ${client.expires}</span><span class="pill accent">${client.weight} kg</span></footer></button>`).join('')}</div>${workspaceNote()}`;
}

export function clientDetail(state) {
  const client = clients[state.client] ?? clients[0];
  const tabs = ['Vazn tarixi','Mashg‘ulotlar','Ovqatlanish'];
  const body = state.detailTab === 1 ? workoutReport() : state.detailTab === 2 ? nutritionReport() : weightReport(client);
  return `${button('Mijozlarga qaytish','navigate:clients','text','left')}<div class="profile-head" style="margin-top:20px">${avatar(client.initials,client.tone)}<div><h1>${client.name}</h1><p>${client.goal} · Obuna ${client.expires} gacha</p></div></div><div class="tabs" style="padding-left:0;margin-bottom:24px">${tabs.map((label,index)=>`<button class="tab ${state.detailTab===index?'active':''}" data-action="detail-tab:${index}" aria-pressed="${state.detailTab===index}">${label}</button>`).join('')}</div>${body}${workspaceNote()}`;
}

function weightReport(client) {
  const graph = client === clients[0] ? chart() : `<div class="empty-state" style="min-height:200px"><h3>Vazn tarixi kiritilmagan</h3><p>Bu namuna mijoz uchun tarix mavjud emas.</p></div>`;
  return `<div class="content-grid"><section class="panel panel-padding"><div class="title-row"><h2>Vazn o‘zgarishi</h2><p class="small">01–09 okt, 2026</p></div>${graph}</section><aside class="panel panel-padding"><h3>Hozirgi vazn</h3><div class="metric">${client.weight}<small> kg</small></div><p class="small">Maqsad: ${client.target} kg</p><div class="info-note">${icon('info')}<span>Natijalar namuna sifatida ko‘rsatilgan.</span></div></aside></div>`;
}

function workoutReport() {
  const completed = ['Dushanba — yuqori tana','Chorshanba — oyoqlar','Juma — to‘liq tana'];
  return `<div class="content-grid"><section class="panel"><div class="panel-header"><h2>Mashg‘ulotlar tarixi</h2><span class="small">Namuna hafta</span></div>${completed.map((name,index)=>`<div class="list-row"><span class="thumb mint">${icon('check')}</span><div class="grow"><b>${name}</b><small>${index+5} okt, 2026 · 45 daqiqa</small></div>${pill(index===2?'Tugagan':'Bajarilgan')}</div>`).join('')}</section><section class="panel panel-padding"><h3>Rejaga amal qilish</h3><div class="metric">75<small>%</small></div><p class="small">4 kundan 3 tasi bajarilgan</p><div class="progress"><span style="width:75%"></span></div></section></div>`;
}

function nutritionReport() {
  return `<div class="content-grid"><section class="panel panel-padding"><h2>Ovqatlanish hisoboti</h2><p class="small" style="margin-top:6px">09 okt, 2026 · Namuna kun</p><div class="metric">1 840 <small>/ 2 100 kcal</small></div><div class="progress"><span style="width:87%"></span></div><div class="mini-stats">${[['Oqsil','124 / 140 g'],['Uglevod','218 / 250 g'],['Yog‘','58 / 65 g']].map(([label,value])=>`<div class="mini-stat"><span>${label}</span><strong style="font-size:16px">${value}</strong></div>`).join('')}</div></section><section class="panel"><div class="panel-header"><h3>Ovqatlanish kundaligi</h3></div>${['Suli yormasi','Tovuq ko‘kragi','Yunon yogurti'].map(name=>`<div class="list-row">${icon('apple')}<span>${name}</span></div>`).join('')}</section></div>`;
}

export function profile(state) {
  return `${title('Trener profili','Mijozlar ko‘radigan kartangizni tahrirlang.')}<div class="content-grid"><form id="profile-form" class="panel panel-padding"><div class="profile-head">${avatar('TD','mint')}<div><h2>${escape(state.profileName)}</h2><p>Namuna trener kartasi</p></div></div><div class="form-grid">${field('Ko‘rinadigan ism','name',state.profileName)}${field('Oylik narx, so‘m','price',state.profilePrice,'number')}${textarea('O‘zingiz haqingizda','bio',state.profileBio)}<label class="field wide">Profil rasmi<input type="file" name="photo" accept="image/jpeg,image/png,image/webp"><small>JPG, PNG yoki WebP</small></label></div><div class="form-footer"><button class="btn primary" type="submit">${icon('check')}O‘zgarishlarni saqlash</button></div></form><aside class="panel panel-padding"><h3>Profil ko‘rinishi</h3><div style="margin:20px 0">${pill('Nashr qilingan')}</div><p class="small">Ism, rasm, tavsif va oylik narx trener kartangizda ko‘rinadi.</p>${note('Bu prototipda saqlash faqat shu oynadagi namuna profilni yangilaydi.')}</aside></div>${workspaceNote()}`;
}

export function content(state) {
  const body = catalog({...state, screen:state.contentTab === 'foods' ? 'foods' : 'exercises'},state.contentTab === 'foods' ? 'foods' : 'exercises');
  return `<div class="tabs" style="padding-left:0;margin-bottom:24px"><button class="tab ${state.contentTab==='exercises'?'active':''}" data-action="content-tab:exercises">Mashqlar</button><button class="tab ${state.contentTab==='foods'?'active':''}" data-action="content-tab:foods">Ovqatlar</button></div>${body}`;
}

export function notification(state) {
  const preview = `<aside class="panel panel-padding"><h3>Xabar ko‘rinishi</h3><p class="small" style="margin-top:8px">Yuborishdan oldin tekshiring.</p><div class="preview-notification"><div class="notification-brand"><b>TOFAN</b><span>hozir</span></div><strong id="preview-title">Mashg‘ulot vaqti</strong><p id="preview-body">Bugungi rejangizni davom ettiring.</p></div>${note('Prototip. Hech qanday xabar yuborilmaydi.')}</aside>`;
  return `${title('Push yuborish','Qabul qiluvchi va xabar matnini tekshiring.')}<div class="content-grid"><form class="panel panel-padding" id="notification-form"><div class="form-section"><h3>Qabul qiluvchi</h3><div class="form-grid">${field('Foydalanuvchi ID','recipient','demo-user-01','text',true)}${selectField('Xabar turi','type',['Umumiy','Mashg‘ulot','Ovqatlanish'],true)}</div></div><div class="form-section"><h3>Xabar</h3><div class="tabs" style="padding-left:0;margin-bottom:20px"><button type="button" class="tab ${state.notificationMode==='custom'?'active':''}" data-action="notification-mode:custom">Erkin matn</button><button type="button" class="tab ${state.notificationMode==='template'?'active':''}" data-action="notification-mode:template">Shablondan</button></div><div class="form-grid">${state.notificationMode==='template' ? selectField('Shablon','template',tables.templates.rows.map(x=>x.name),true) : field('Sarlavha','notificationTitle','Mashg‘ulot vaqti','text',true)+textarea('Xabar matni','notificationBody','Bugungi rejangizni davom ettiring.')}</div></div><div class="form-footer"><button class="btn primary" type="submit">${icon('eye')}Xabarni tekshirish</button></div></form>${preview}</div>${workspaceNote()}`;
}

export function programEditor(state) {
  const program = programs.find(x=>x.id===state.program) ?? programs[0];
  const isMeal = program.type === 'meal';
  return `${button('Dasturlarga qaytish','navigate:programs','text','left')}<div style="margin-top:20px">${title(program.name,isMeal?'Ovqatlanish rejasi · 09–15 okt, 2026':'Mashg‘ulot dasturi · Sport zalida',button('O‘zgarishlarni saqlash','editor-save','primary','check'))}</div>${program.status==='Nashr qilingan'?note('Nashr qilingan dasturdagi o‘zgarishlar keyingi mashg‘ulotlar uchun qo‘llanadi.'):''}<div class="day-nav" style="margin-top:22px">${['Du','Se','Ch','Pa','Ju','Sh','Ya'].map((day,index)=>`<button class="day ${state.day===index?'active':''}" aria-pressed="${state.day===index}" data-action="day:${index}">${day}<small>${index+9} okt</small></button>`).join('')}</div><div class="content-grid"><section class="panel"><header class="panel-header"><div><h2>${isMeal?'Kunlik ovqatlanish':'Kunlik mashg‘ulot'}</h2><p>${['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'][state.day]}</p></div>${pill(state.day===1?'Dam olish kuni':program.status)}</header>${editorItems(state,isMeal)}<footer class="panel-footer">${button(isMeal?'Ovqat qo‘shish':'Mashq qo‘shish',`picker:${isMeal?'foods':'exercises'}`,'text','plus')}</footer></section><aside class="panel panel-padding"><h3>${isMeal?'Ovqatlanish parametrlari':'Kun parametrlari'}</h3><div class="stack" style="margin-top:20px">${field('Kun nomi','dayName',isMeal?'Muvozanatli kun':'Yuqori tana')}${isMeal?field('Kaloriya maqsadi, kcal','calorieTarget','2100','number'):selectField('Split turi','split',['Yuqori tana','Oyoqlar','To‘liq tana'])}${isMeal?'':`<label class="switch-field">Dam olish kuni<input type="checkbox" name="restDay" ${state.day===1?'checked':''}></label>`}</div></aside></div>${workspaceNote()}`;
}

function editorItems(state, meal) {
  if (state.day===1 && !meal) return `<div class="empty-state" style="min-height:240px"><span class="state-icon">${icon('calendar')}</span><h2>Dam olish kuni</h2><p>Bu kunga mashg‘ulot belgilanmagan.</p></div>`;
  const source=meal ? tables.foods.rows : tables.exercises.rows;
  const ids=state.editorDays[`${state.program}:${state.day}`] ?? source.slice(0,3).map(x=>x.id);
  const rows=ids.map(id=>source.find(x=>x.id===id)).filter(Boolean);
  if(!rows.length) return `<div class="empty-state" style="min-height:200px"><h3>Bu kun uchun ${meal?'ovqat':'mashq'} qo‘shilmagan</h3><p>Quyidagi tugma orqali katalogdan tanlang.</p></div>`;
  return rows.map(row=>`<article class="editor-exercise"><span class="thumb ${row.tone}">${icon(meal?'apple':'dumbbell')}</span><div class="grow"><b>${row.name}</b><small>${meal?'Nonushta / tushlik':row.muscle}</small></div>${meal?target('Miqdor, g','100',state,row.id):target('Set','3',state,row.id)+target('Takror','12',state,row.id)+target('Dam, s','60',state,row.id)}<button class="icon-button" data-action="editor-remove:${row.id}" aria-label="${escape(row.name)}ni rejadan olish">${icon('trash')}</button></article>`).join('');
}

function target(label,value,state,id) {
  const key=`${state.program}:${state.day}:${id}:${label}`;
  return `<label class="target-label">${label}<input class="target-input" type="number" min="0" value="${escape(state.editorTargets[key]??value)}" data-target="${key}"></label>`;
}

export function login(state) {
  const story = `<div class="login-story"><a class="brand" href="./compare.html"><img src="./logo.svg" alt=""><span class="brand-type"><strong>TOFAN</strong><span>${state.app==='coach'?'Coach':'Admin'}</span></span></a><div><h2>Harakatga<br>tartib bering.</h2><p>Mashqlar, rejalar va odamlar. Barchasi bitta ravshan ish maydonida.</p><div class="login-graphic" aria-hidden="true">${[28,48,42,72,63,92,84,120].map(height=>`<span style="height:${height}px"></span>`).join('')}</div></div><small>Tofan fitness ekotizimi</small></div>`;
  return `<main id="main" class="login-layout" style="padding:0;max-width:none;margin:0">${story}<div class="login-form-wrap"><form class="login-form" id="login-form"><span class="pill accent" style="margin-bottom:18px">${state.app==='coach'?'Trener ish maydoni':'Admin ish maydoni'}</span><h1>Xush kelibsiz</h1><p>Hisobingiz orqali ish maydoniga kiring.</p>${field('Foydalanuvchi nomi','username','','text')}${field('Parol','password','','password')}<p class="form-error" id="login-error" role="alert"></p><button type="submit" class="btn primary">Kirish ${icon('chevron')}</button><div class="login-foot">Prototipni sinash uchun istalgan namuna matnini kiriting.</div></form></div></main>`;
}

export function accountDetail(state) {
  const row = tables[state.sourceTable]?.rows.find(x=>x.id===state.record) ?? tables.accounts.rows[0];
  const isSoldier = state.sourceTable==='soldiers';
  const data = [['Hisob','@aziz.demo'],['Email','aziz@example.test'],['Rol','Foydalanuvchi'],['Ro‘yxatdan o‘tgan','01 okt, 2026'],['Namuna ID','demo-user-01'],['Telefon','Kiritilmagan']];
  return `${button('Ro‘yxatga qaytish',`navigate:${state.sourceTable??'accounts'}`,'text','left')}<div class="profile-head" style="margin-top:20px">${avatar(row.initials??'AD',row.tone)}<div><h1>${escape(row.name)}</h1><p>Namuna profil</p></div>${pill(row.status??'Faol')}</div><div class="content-grid"><section class="panel panel-padding"><h2>${isSoldier?'Fitnes profili':'Hisob ma’lumotlari'}</h2><dl class="detail-facts" style="margin-top:24px">${data.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>${isSoldier?`<div class="form-section"><h3>Vazn tarixi</h3>${chart()}</div>`:''}</section><aside class="stack"><section class="panel panel-padding"><h3>Tezkor amallar</h3><div class="stack" style="margin-top:16px">${button('Kirishlar jurnali','navigate:sessions','','clock')}${button('Bildirishnoma','navigate:send','','send')}${button(isSoldier?'Hisob kartasi':'Soldier profili',`related:${isSoldier?'accounts':'soldiers'}`,'','user')}</div></section><section class="panel panel-padding"><h3>Hisob holati</h3><p class="small" style="margin:12px 0 18px">Bu amallar prototipda faqat tasdiqlash oynasini namoyish qiladi.</p>${button('Hisobni bloklash','account-block','','lock')}</section></aside></div>${workspaceNote()}`;
}

export function states(state) {
  const choices = [['empty','Bo‘sh'],['error','Xato'],['loading','Yuklanish'],['forbidden','Ruxsat yo‘q'],['notfound','404'],['onboarding','Trener kartasi yo‘q']];
  return `${title('Interfeys holatlari','Bo‘sh, yuklanish va xato ekranlarining ko‘rinishi.')}<section class="panel"><div class="tabs">${choices.map(([key,label])=>`<button class="tab ${state.exampleState===key?'active':''}" data-action="example-state:${key}">${label}</button>`).join('')}</div>${state.exampleState==='loading'?tableRegion({...state,viewState:'loading'},'exercises'):emptyState(state.exampleState,'state-return')}</section>${workspaceNote()}`;
}

export function recordForm(key, row) {
  const name = row?.name ?? '';
  const localized = `<div class="form-section"><h3>Nom va tillar</h3><div class="form-grid">${field('O‘zbekcha nom','name',name,'text',true)}${field('Русское название','nameRu','')}${field('English name','nameEn',row?.sub??'')}</div></div>`;
  const attributes = `<div class="form-section"><h3>Mashq parametrlari</h3><div class="form-grid">${selectField('Mushak guruhi','muscle',['Oyoqlar','Ko‘krak','Orqa','Qorin','Yelkalar','Qo‘llar'])}${selectField('Jihoz','equipment',['Shtanga','Gantel','Tana vazni'])}${selectField('Murakkablik','difficulty',['Oson','O‘rta','Qiyin'])}${selectField('Tur','type',['Kuch','Kardio'])}${selectField('Jins','gender',['Barchasi','Erkak','Ayol'])}</div><label class="switch-field">Uy sharoitida<input name="home" type="checkbox"></label><label class="switch-field">Bir nechta mushak guruhi<input name="compound" type="checkbox"></label></div>`;
  const upload = `<div class="form-section"><h3>Video</h3><label class="upload">${icon('upload')}<span>Video faylni tanlang</span><input type="file" name="video" accept="video/*"></label></div>`;
  if (key==='exercises') return localized+attributes+`<div class="form-section">${textarea('Bajarish ko‘rsatmasi','instructions','')}</div>`+upload;
  if (key==='foods') return localized+`<div class="form-section"><h3>Oziq qiymatlari</h3><div class="form-grid">${field('Porsiya, g','serving','100','number')}${field('Kaloriya, kcal','calories','165','number')}${field('Oqsil, g','protein','31','number')}${field('Uglevod, g','carbs','0','number')}${field('Yog‘, g','fat','3.6','number')}${field('Shtrix-kod','barcode','')}</div></div>`;
  if (key==='media') return `<div class="form-grid">${field('Fayl nomi','name',name,'text',true)}${selectField('Kategoriya','category',['Mashq videosi','Trener rasmi'],true)}<label class="upload field wide">${icon('upload')}Fayl tanlash<input type="file" name="file"></label></div>`;
  if (key==='trainers') return `<div class="form-grid">${field('Foydalanuvchi ID','userId','demo-user-03','text',true)}${field('Ko‘rinadigan ism','name',name,'text',true)}${field('Oylik narx, so‘m','price','300000','number',true)}${textarea('Trener haqida','bio',row?.sub??'')}</div>`;
  if (key==='subscriptions') return `<div class="form-grid">${selectField('Trener','trainer',tables.trainers.rows.map(x=>x.name),true)}${field('Foydalanuvchi ID','name',row?.client??'demo-user-01','text',true)}${field('Boshlanish','start','2026-10-09','date')}${field('Tugash','end','2026-11-09','date')}</div>`;
  if (key==='garments') return `<div class="form-grid">${field('Seriya raqami','name',name,'text',true)}${field('Model','model','Tofan Classic')}${selectField('O‘lcham','size',['S','M','L','XL'])}${field('Rang','color','#202535','color')}${field('Ishlab chiqarilgan sana','date','2026-10-09','date')}</div>`;
  return `<div class="form-grid">${field('Shablon nomi','name',name,'text',true)}${selectField('Tur','type',['Umumiy','Mashg‘ulot','Ovqatlanish'],true)}${textarea('O‘zbekcha xabar','body',row?.sub??'')}${textarea('Русский текст','bodyRu','')}${textarea('English message','bodyEn','')}</div>`;
}
