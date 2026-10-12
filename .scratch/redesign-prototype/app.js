import { variants, adminNav, coachNav, tables, programs, clients } from './data.js';
import { icon, escape, button, pill, field, selectField, textarea, note } from './ui.js';
import { catalog, tableRegion, dashboard, coachPrograms, coachClients, clientDetail, profile, content, notification, programEditor, login, accountDetail, states, recordForm } from './views.js';

const params = new URLSearchParams(location.search);
document.body.classList.toggle('capture',params.get('capture')==='1');
const app = params.get('app') === 'coach' ? 'coach' : 'admin';
const screens = [...Object.keys(tables),'dashboard','programs','clients','content','profile','send','login','states','client','editor','account'];
const defaultScreen = app === 'coach' ? 'programs' : 'exercises';
const state = {
  variant: Object.hasOwn(variants,params.get('variant')) ? params.get('variant') : 'A',
  app, screen:screens.includes(params.get('screen')) ? params.get('screen') : defaultScreen,
  query:'',status:'',tab:0,filters:false,muscle:'',equipment:'',difficulty:'',sort:'',page:1,pageSize:6,
  viewState:'normal',contentTab:'exercises',client:Number(params.get('client'))||0,detailTab:0,
  notificationMode:'custom',program:params.get('program')||'workout-1',day:0,editorDays:{},editorTargets:{},
  profileName:'Trener Demo',profilePrice:'300000',profileBio:'Kuch mashqlari va muvozanatli ovqatlanish bo‘yicha trener.',exampleState:'empty',sourceTable:'accounts',record:null,
};
let toastTimer;
let dialogFocus;
let currentDialog = null;
let lastMenu = null;

function brand() {
  return `<a class="brand" href="?variant=${state.variant}&app=${state.app}&screen=${state.app==='coach'?'programs':'dashboard'}" title="Ish maydoniga qaytish"><img src="./logo.svg" alt=""><span class="brand-type"><strong>TOFAN</strong> <span>${state.app==='coach'?'Coach':'Admin'}</span></span></a>`;
}

function navigation() {
  return state.app==='coach' ? coachNav : adminNav;
}

function navLink([screen,label,glyph]) {
  const active = screen===state.screen || screen==='clients' && state.screen==='client' || screen==='programs' && state.screen==='editor' || screen===state.sourceTable && state.screen==='account';
  return `<a class="nav-link ${active?'active':''}" href="?variant=${state.variant}&app=${state.app}&screen=${screen}" ${active?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></a>`;
}

function sidebar() {
  const groups = navigation().map(group=>`<div class="nav-group"><p class="nav-label">${group.group}</p>${group.links.map(navLink).join('')}</div>`).join('');
  return `<aside class="sidebar" aria-label="Asosiy navigatsiya">${brand()}<div class="workspace-label">${icon(state.app==='coach'?'award':'folder')}<span>${state.app==='coach'?'Trener ish maydoni':'Boshqaruv maydoni'}</span><small>UZ</small></div><nav class="side-nav">${groups}</nav><div class="sidebar-foot"><a class="nav-link" href="?variant=${state.variant}&app=${state.app}&screen=login">${icon('logout')}<span>Kirish sahifasi</span></a><div class="user"><span class="avatar">${state.app==='coach'?'TD':'AD'}</span><div><b>${state.app==='coach'?'Trener Demo':'Admin Demo'}</b><small>Namuna profil</small></div>${icon('down')}</div></div></aside>`;
}

function topbar() {
  const label = tables[state.screen]?.title ?? ({dashboard:'Boshqaruv paneli',programs:'Dasturlar',clients:'Mijozlar',client:'Mijoz tafsilotlari',content:'Kontent',profile:'Profil',send:'Push yuborish',editor:'Dastur muharriri',states:'UI holatlari',account:'Profil tafsilotlari'}[state.screen]) ?? 'Ish maydoni';
  return `<header class="topbar"><button class="icon-button mobile-trigger" aria-label="Navigatsiyani ochish" data-action="mobile-menu">${icon('menu')}</button>${state.variant==='C'?brand():''}<div class="breadcrumb"><span>${tables[state.screen]?.group??(state.app==='coach'?'Trener ish maydoni':'Tofan')}</span>${icon('chevron')}<b>${label}</b></div><div class="top-actions"><span class="sample-label">Namuna ma’lumotlari</span><span class="language">UZ</span><a class="icon-button" href="./compare.html" aria-label="Dizaynlarni taqqoslash">${icon('help')}</a><span class="avatar">${state.app==='coach'?'TD':'AD'}</span></div></header>`;
}

function studioNav() {
  if(state.app==='coach') return `<nav class="studio-nav" aria-label="Bo‘limlar">${coachNav[0].links.map(navLink).join('')}</nav>`;
  const groups=studioGroups();
  return `<nav class="studio-nav" aria-label="Bo‘limlar">${groups.map(group=>{
    const active=group.screens.includes(state.screen);
    return `<a class="nav-link ${active?'active':''}" href="?variant=${state.variant}&app=admin&screen=${group.screens[0]}">${icon(group.icon)}<span>${group.name}</span></a>`;
  }).join('')}</nav>`;
}

function studioGroups() {
  return [
    {name:'Asosiy',icon:'home',screens:['dashboard']},
    {name:'Katalog',icon:'folder',screens:['exercises','foods','media']},
    {name:'Foydalanuvchilar',icon:'users',screens:['soldiers','accounts','sessions']},
    {name:'Trenerlar',icon:'award',screens:['trainers','subscriptions']},
    {name:'Mahsulotlar',icon:'shirt',screens:['garments']},
    {name:'Bildirishnomalar',icon:'send',screens:['templates','send']},
  ];
}

function studioSubnav() {
  if(state.app==='coach') return '';
  const group=studioGroups().find(x=>x.screens.includes(state.screen));
  if(!group || group.screens.length<2) return '';
  return `<nav class="studio-subnav" aria-label="${group.name} bo‘limlari">${adminNav.flatMap(x=>x.links).filter(x=>group.screens.includes(x[0])).map(navLink).join('')}</nav>`;
}

function mobileNav() {
  const nav = state.app==='coach' ? coachNav[0].links : [['dashboard','Asosiy','home'],['exercises','Katalog','dumbbell'],['accounts','Hisoblar','users'],['trainers','Trenerlar','award']];
  return `<nav class="mobile-bottom" aria-label="Mobil navigatsiya">${nav.map(([screen,label,glyph])=>`<a href="?variant=${state.variant}&app=${state.app}&screen=${screen}" class="${screen===state.screen?'active':''}" ${screen===state.screen?'aria-current="page"':''}>${icon(glyph)}${label}</a>`).join('')}</nav>`;
}

function pageView() {
  if (tables[state.screen]) return catalog(state);
  const views = {dashboard,programs:coachPrograms,clients:coachClients,client:clientDetail,content,profile,send:notification,editor:programEditor,account:accountDetail,states};
  return (views[state.screen]??dashboard)(state);
}

function render() {
  document.body.dataset.variant = state.variant;
  document.body.classList.toggle('switcher-login',state.screen==='login');
  document.title = `Tofan ${state.app==='coach'?'Coach':'Admin'} — ${variants[state.variant].name}`;
  document.getElementById('app').innerHTML = state.screen==='login' ? login(state) : `${sidebar()}<div class="shell-main">${topbar()}${studioNav()}<main id="main" tabindex="-1">${studioSubnav()}${pageView()}</main></div>${mobileNav()}`;
  renderSwitcher();
  attachSearch();
  setFilterPressed();
}

function renderSwitcher() {
  const options = ['A','B','C'].map(key=>`<button class="variant-button ${key===state.variant?'active':''}" aria-pressed="${key===state.variant}" data-action="variant:${key}">${key} · ${variants[key].name}</button>`).join('');
  const select = `<select id="app-switch" class="switch-select" aria-label="Admin yoki Coach"><option value="admin" ${state.app==='admin'?'selected':''}>Admin</option><option value="coach" ${state.app==='coach'?'selected':''}>Coach</option></select>`;
  document.getElementById('switcher').innerHTML = `<span class="switch-label"><b>Dizayn tanlovi</b>Interaktiv prototip</span><button class="switch-arrow" data-action="cycle:-1" aria-label="Oldingi variant">${icon('left')}</button>${options}<button class="switch-arrow" data-action="cycle:1" aria-label="Keyingi variant">${icon('chevron')}</button><span class="switch-divider"></span>${select}<a class="review-link" href="./compare.html">Taqqoslash</a><button class="review-link" data-action="navigate:states">UI holatlari</button>`;
}

function updateUrl() {
  const url = new URL(location.href);
  url.search = new URLSearchParams({variant:state.variant,app:state.app,screen:state.screen});
  if (state.screen==='editor') url.searchParams.set('program',state.program);
  if (state.screen==='client') url.searchParams.set('client',String(state.client));
  history.replaceState(null,'',url);
}

function resetFilters() {
  Object.assign(state,{query:'',status:'',tab:0,muscle:'',equipment:'',difficulty:'',page:1,viewState:'normal'});
}

function navigate(screen) {
  closeDialog();
  state.screen=screen;
  state.filters=false;
  state.sort='';
  resetFilters();
  updateUrl();
  document.body.classList.remove('nav-open');
  render();
  window.scrollTo(0,0);
  document.getElementById('main')?.focus({preventScroll:true});
}

function changeVariant(key) {
  closeDialog();
  state.variant=key;
  updateUrl();
  render();
  document.querySelector(`[data-action="variant:${key}"]`)?.focus({preventScroll:true});
}

function notify(message) {
  clearTimeout(toastTimer);
  document.getElementById('toast').textContent=message;
  toastTimer=setTimeout(()=>{document.getElementById('toast').textContent='';},3500);
}

function currentTable() {
  return state.screen==='content' ? state.contentTab : state.screen;
}

function attachSearch() {
  document.getElementById('search')?.addEventListener('input',event=>{
    state.query=event.target.value;
    state.page=1;
    document.getElementById('table-region').innerHTML=tableRegion(state,currentTable());
  });
}

function setFilterPressed() {
  document.querySelector('[data-action="filters"]')?.setAttribute('aria-expanded',String(state.filters));
}

function showDialog(heading,description,body,saveLabel='Saqlash',kind='record') {
  closeMenu();
  dialogFocus=document.activeElement;
  currentDialog={kind};
  document.getElementById('app').inert=true;
  document.getElementById('switcher').inert=true;
  document.getElementById('overlay').innerHTML=`<div class="dialog-backdrop ${kind==='confirm'?'confirm':''}"><section class="dialog" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="dialog-header"><div><h2 id="dialog-title">${heading}</h2><p>${description}</p></div><button class="icon-button" data-action="dialog-close" aria-label="Oynani yopish">${icon('close')}</button></header><form class="dialog-content" id="dialog-form">${body}<p class="form-error" id="dialog-error" role="alert"></p></form><footer class="dialog-footer">${button('Bekor qilish','dialog-close')}<button type="submit" form="dialog-form" class="btn ${kind==='confirm'?'danger':'primary'}">${saveLabel}</button></footer></section></div>`;
  document.querySelector('.dialog input:not([type=file]),.dialog select,.dialog button')?.focus();
}

function closeDialog() {
  if (!currentDialog) return;
  document.getElementById('overlay').innerHTML='';
  document.getElementById('app').inert=false;
  document.getElementById('switcher').inert=false;
  currentDialog=null;
  dialogFocus?.focus({preventScroll:true});
}

function openRecord(key,id) {
  const row = tables[key].rows.find(x=>x.id===id);
  if (['soldiers','accounts','sessions'].includes(key) && row) return openAccount(key,row);
  if (key==='garments' && row) return garmentDetails(row);
  if (key==='media' && row) return mediaDetails(row);
  const config=tables[key];
  showDialog(row?'Tahrirlash':config.add,'Namuna ma’lumotlari · o‘zgarishlar faqat shu oynada',recordForm(key,row));
  currentDialog={kind:'record',key,id};
  for (const attribute of ['muscle','equipment','difficulty']) {
    const control=document.querySelector(`#dialog-form [name="${attribute}"]`);
    if(control && row?.[attribute]) control.value=row[attribute];
  }
}

function openAccount(key,row) {
  state.sourceTable=key;
  state.record=row.id;
  navigate('account');
}

function garmentDetails(row) {
  const facts = [['Seriya raqami',row.name],['Model',row.model],['Holat',row.status],['Ishlab chiqarilgan',row.date],['Muddati',row.expires]];
  showDialog('Futbolka tafsilotlari','Namuna mahsulot',`<dl class="detail-facts">${facts.map(([label,value])=>`<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl>${note('NFC tokenlari va haqiqiy egalar prototipda ishlatilmagan.')}`,'Yopish','view');
}

function mediaDetails(row) {
  showDialog('Faylni ko‘rish',escape(row.name),`<div class="empty-state" style="min-height:220px"><span class="state-icon">${icon('video')}</span><h3>${escape(row.name)}</h3><p>Bu namuna fayl. Haqiqiy video yuklanmagan.</p></div><dl class="detail-facts"><div><dt>Tur</dt><dd>${row.sub}</dd></div><div><dt>Hajm</dt><dd>${row.size}</dd></div></dl>`,'Yopish','view');
}

function closeMenu() {
  document.querySelector('.more-menu')?.remove();
  lastMenu=null;
}

function menuItems(key,row) {
  const edit = [button('Tahrirlash',`row:${key}:${row.id}`,'','edit')];
  if (['accounts','soldiers','sessions'].includes(key)) return [button('Profilni ko‘rish',`row:${key}:${row.id}`,'','user'),button('ID nusxalash',`copy:${key}:${row.id}`,'','copy')];
  if (key==='subscriptions') return [button('Obunani yakunlash',`end:${key}:${row.id}`,'','calendar')];
  if (key==='garments') return [button('Tafsilotlar',`row:${key}:${row.id}`,'','eye'),...(row.status==='Yangi'?[button('O‘chirish',`delete:${key}:${row.id}`,'destructive','trash')]:[])];
  if (key==='trainers') return [button('Tahrirlash',`row:${key}:${row.id}`,'','edit'),button(row.status==='Qoralama'?'Nashr qilish':'Nashrdan olish',`toggle:${key}:${row.id}`,'','eye')];
  if (key==='media') return [button('Ko‘rish',`row:${key}:${row.id}`,'','eye'),button('ID nusxalash',`copy:${key}:${row.id}`,'','copy'),button('O‘chirish',`delete:${key}:${row.id}`,'destructive','trash')];
  return [...edit,...(key==='exercises'?[button(row.status==='Faol'?'Faolsizlantirish':'Faollashtirish',`toggle:${key}:${row.id}`,'','eye')]:[]),button('O‘chirish',`delete:${key}:${row.id}`,'destructive','trash')];
}

function showMenu(key,id,target) {
  closeMenu();
  const row=tables[key].rows.find(x=>x.id===id);
  const rect=target.getBoundingClientRect();
  const menu=document.createElement('div');
  menu.className='more-menu';
  menu.setAttribute('role','menu');
  menu.innerHTML=menuItems(key,row).join('');
  menu.style.left=`${Math.min(innerWidth-205,Math.max(10,rect.right-190))}px`;
  menu.style.top=`${Math.min(innerHeight-240,rect.bottom+5)}px`;
  document.body.append(menu);
  menu.querySelectorAll('button').forEach(x=>x.setAttribute('role','menuitem'));
  menu.querySelector('button').focus();
  lastMenu=target;
}

function confirmAction(heading,text,operation) {
  showDialog(heading,'Tasdiqlash',`<p>${text}</p>${note('Prototip: haqiqiy ma’lumot o‘zgarmaydi.')}`,'Tasdiqlash','confirm');
  currentDialog={kind:'confirm',operation};
}

function deleteRecord(key,id) {
  const row=tables[key].rows.find(x=>x.id===id);
  confirmAction('Yozuvni o‘chirish',`“${escape(row.name)}” namuna ro‘yxatidan o‘chiriladi. Davom etasizmi?`,()=>{
    tables[key].rows=tables[key].rows.filter(x=>x.id!==id);
    render();
    notify('Namuna yozuv o‘chirildi.');
  });
}

function toggleRecord(key,id) {
  const row=tables[key].rows.find(x=>x.id===id);
  row.status=key==='trainers' ? row.status==='Nashr qilingan'?'Qoralama':'Nashr qilingan' : row.status==='Faol'?'Nofaol':'Faol';
  closeMenu();
  render();
  notify('Namuna yozuv holati yangilandi.');
}

function programDialog(type) {
  const body=type==='workout'?`<div class="form-grid">${field('Dastur nomi','name','','text',true)}${selectField('Maqsad','goal',['Vazn kamaytirish','Mushak oshirish','Sog‘lom turmush'])}${selectField('Tajriba','experience',['Boshlang‘ich','O‘rta','Yuqori'])}</div><label class="switch-field">Uy sharoitida<input type="checkbox" name="home"></label>`:`<div class="form-grid">${field('Boshlanish sanasi','start','2026-10-09','date')}${field('Tugash sanasi','end','2026-10-15','date')}</div>`;
  showDialog(type==='workout'?'Mashg‘ulot dasturi':'Ovqatlanish rejasi','Yangi namuna dastur',body);
  currentDialog={kind:'program',type};
}

function openPicker(key) {
  const body=tables[key].rows.map(row=>`<label class="list-row"><span class="thumb">${icon(tables[key].icon)}</span><span class="grow">${row.name}</span><input type="radio" name="pick" value="${row.id}"></label>`).join('');
  showDialog(key==='foods'?'Ovqat tanlash':'Mashq tanlash','Namuna katalogi',body,'Rejaga qo‘shish','picker');
  currentDialog={kind:'picker',key};
}

function switchApp(value) {
  state.app=value;
  navigate(value==='coach'?'programs':'exercises');
}

function cycle(direction) {
  const keys=['A','B','C'];
  changeVariant(keys[(keys.indexOf(state.variant)+Number(direction)+3)%3]);
}

function copyRecord(key,id) {
  navigator.clipboard?.writeText(id).then(()=>notify('Namuna ID nusxalandi.'),()=>notify(`Namuna ID: ${id}`));
  closeMenu();
}

function basicAction(action,value) {
  const handlers={
    variant:()=>changeVariant(value),cycle:()=>cycle(value),navigate:()=>navigate(value),
    filters:()=>{state.filters=!state.filters;render();},reset:()=>{resetFilters();render();},
    tab:()=>{state.tab=Number(value);state.page=1;render();},sort:()=>{state.sort=state.sort==='asc'?'desc':'asc';render();},
    page:()=>{state.page=Number(value);render();},'dialog-close':closeDialog,
    'mobile-menu':()=>document.body.classList.toggle('nav-open'),
    'content-tab':()=>{state.contentTab=value;resetFilters();render();},
    'detail-tab':()=>{state.detailTab=Number(value);render();},
    'example-state':()=>{state.exampleState=value;render();},
    'notification-mode':()=>{state.notificationMode=value;render();},
    retry:()=>{state.viewState='normal';resetFilters();render();notify('Namuna ma’lumotlari qayta yuklandi.');},
    'state-return':()=>navigate(state.exampleState==='onboarding'?'login':state.app==='coach'?'programs':'dashboard'),
  };
  if(!handlers[action]) return false;
  handlers[action]();
  return true;
}

function secondaryAction(action,value,id,target) {
  const handlers={
    row:()=>openRecord(value,id),add:()=>openRecord(value),more:()=>showMenu(value,id,target),
    delete:()=>deleteRecord(value,id),toggle:()=>toggleRecord(value,id),copy:()=>copyRecord(value,id),
    client:()=>{state.client=Number(value);state.detailTab=0;navigate('client');},
    related:()=>{state.sourceTable=value;state.record=tables[value].rows[0].id;navigate('account');},
    'program-add':()=>programDialog(value),'program-open':()=>{state.program=value;state.day=0;navigate('editor');},
    publish:()=>publishProgram(value),day:()=>{state.day=Number(value);render();},picker:()=>openPicker(value),
    'editor-save':()=>notify('Namuna reja saqlandi.'),'editor-remove':()=>removeEditorEntry(value),
    'program-refresh':()=>notify('Namuna dasturlar yangilandi.'),export:exportGarments,
    'account-block':()=>confirmAction('Hisobni bloklash','Namuna hisob uchun bloklash holatini tasdiqlang.',()=>notify('Bloklash tasdiqlandi — bu faqat prototip.')),
    end:()=>endSubscription(value,id),
  };
  handlers[action]?.();
}

function publishProgram(id) {
  const program=programs.find(x=>x.id===id);
  confirmAction('Dasturni nashr qilish',`“${escape(program.name)}” namuna dasturi nashr qilingan holatga o‘tadi.`,()=>{program.status='Nashr qilingan';render();notify('Namuna dastur nashr qilindi.');});
}

function endSubscription(key,id) {
  const row=tables[key].rows.find(x=>x.id===id);
  confirmAction('Obunani yakunlash','Namuna obuna tugagan holatga o‘tadi.',()=>{row.status='Tugagan';render();notify('Namuna obuna yakunlandi.');});
}

function exportGarments() {
  const rows=tables.garments.rows.map(x=>`${x.name}\t${x.model}\t${x.status}`);
  const blob=new Blob(['Seriya\tModel\tHolat\n'+rows.join('\n')],{type:'text/plain;charset=utf-8'});
  const link=document.createElement('a');
  link.href=URL.createObjectURL(blob);
  link.download='tofan-demo-garments.txt';
  link.click();
  setTimeout(()=>URL.revokeObjectURL(link.href),1000);
  notify('Namuna mahsulotlar eksport qilindi.');
}

document.addEventListener('click',event=>{
  const target=event.target.closest('[data-action]');
  if(!target) {
    if(!event.target.closest('.more-menu')) closeMenu();
    if(event.target.classList.contains('dialog-backdrop')) closeDialog();
    return;
  }
  const [action,value,id]=target.dataset.action.split(':');
  if(!basicAction(action,value)) secondaryAction(action,value,id,target);
});

document.addEventListener('change',event=>{
  const {id,value}=event.target;
  const filterIds={'status-filter':'status','muscle-filter':'muscle','equipment-filter':'equipment','difficulty-filter':'difficulty','sort-filter':'sort'};
  if(filterIds[id]) {state[filterIds[id]]=value;state.page=1;render();}
  if(id==='page-size') {state.pageSize=Number(value);state.page=1;render();}
  if(id==='app-switch') switchApp(value);
  if(event.target.name==='template') updateTemplatePreview(value);
});

document.addEventListener('input',event=>{
  if(event.target.dataset.target) state.editorTargets[event.target.dataset.target]=event.target.value;
  if(event.target.name==='notificationTitle') document.getElementById('preview-title').textContent=event.target.value||'Sarlavha';
  if(event.target.name==='notificationBody') document.getElementById('preview-body').textContent=event.target.value||'Xabar matni';
});

function updateTemplatePreview(value) {
  const template=tables.templates.rows.find(x=>x.name===value);
  document.getElementById('preview-title').textContent=template.name;
  document.getElementById('preview-body').textContent=template.sub;
}

document.addEventListener('submit',event=>{
  event.preventDefault();
  const values=new FormData(event.target);
  const handlers={'dialog-form':()=>saveDialog(values),'login-form':()=>loginSubmit(values),'profile-form':()=>saveProfile(values),'notification-form':()=>previewNotification(values)};
  handlers[event.target.id]?.();
});

function saveDialog(values) {
  const dialog=currentDialog;
  if(!dialog) return;
  if(dialog.kind==='confirm') {closeDialog();dialog.operation();return;}
  if(dialog.kind==='view') {closeDialog();return;}
  if(dialog.kind==='picker') return savePicker(values,dialog);
  if(!(dialog.kind==='program' && dialog.type==='meal') && !String(values.get('name')??'').trim()) {
    document.getElementById('dialog-error').textContent='Nomni kiriting.';
    document.querySelector('#dialog-form [name=name]')?.focus();
    return;
  }
  if(dialog.kind==='program') saveProgram(values,dialog);
  else saveRecord(values,dialog);
  closeDialog();
  render();
  notify('Namuna ma’lumotlari saqlandi.');
}

function savePicker(values,dialog) {
  const id=values.get('pick');
  if(!id) {document.getElementById('dialog-error').textContent='Bitta yozuvni tanlang.';return;}
  const row=tables[dialog.key].rows.find(x=>x.id===id);
  const dayKey=`${state.program}:${state.day}`;
  const entries=editorEntries();
  if(!entries.includes(row.id)) entries.push(row.id);
  state.editorDays[dayKey]=entries;
  closeDialog();
  render();
  notify(`${row.name} tanlandi. Namuna reja yangilandi.`);
}

function editorEntries() {
  const program=programs.find(x=>x.id===state.program)??programs[0];
  const source=program.type==='meal'?tables.foods:tables.exercises;
  return [...(state.editorDays[`${state.program}:${state.day}`]??source.rows.slice(0,3).map(x=>x.id))];
}

function removeEditorEntry(id) {
  state.editorDays[`${state.program}:${state.day}`]=editorEntries().filter(x=>x!==id);
  render();
  notify('Yozuv namuna rejadan olindi.');
}

function saveRecord(values,dialog) {
  const config=tables[dialog.key];
  const old=config.rows.find(x=>x.id===dialog.id);
  const row=old??{id:`demo-${Date.now()}`,status:'Faol',tone:'blue',sub:'Yangi namuna yozuv'};
  row.name=String(values.get('name')).trim();
  for(const property of ['muscle','equipment','difficulty','model','category']) {
    if(values.has(property)) row[property]=String(values.get(property));
  }
  if(values.has('nameEn')) row.sub=String(values.get('nameEn'));
  if(dialog.key==='trainers') {row.price=`${Number(values.get('price')).toLocaleString('uz')} so‘m`;row.sub=String(values.get('bio'));row.status=old?.status??'Qoralama';}
  if(dialog.key==='foods') Object.assign(row,{serving:`${values.get('serving')} g`,calories:`${values.get('calories')} kcal`,macros:`${values.get('protein')} / ${values.get('carbs')} / ${values.get('fat')} g`});
  if(!old) config.rows.unshift(row);
  resetFilters();
}

function saveProgram(values,dialog) {
  const meal=dialog.type==='meal';
  programs.push({id:`${dialog.type}-${Date.now()}`,type:dialog.type,name:meal?`${values.get('start')} – ${values.get('end')}`:String(values.get('name')),status:'Qoralama',meta:meal?'Ovqatlanish rejasi':'0 kun',place:meal?'Yangi reja':values.has('home')?'Uy sharoitida':'Sport zalida'});
}

function loginSubmit(values) {
  if(!values.get('username')||!values.get('password')) {document.getElementById('login-error').textContent='Foydalanuvchi nomi va parolni kiriting.';return;}
  navigate(state.app==='coach'?'programs':'dashboard');
  notify('Prototip ish maydoni ochildi.');
}

function saveProfile(values) {
  if(!String(values.get('name')).trim()) {notify('Profil nomini kiriting.');return;}
  state.profileName=String(values.get('name'));
  state.profilePrice=String(values.get('price'));
  state.profileBio=String(values.get('bio'));
  render();
  notify('Namuna profil saqlandi.');
}

function previewNotification(values) {
  if(!String(values.get('recipient')).trim()) {notify('Qabul qiluvchi IDni kiriting.');return;}
  const heading=document.getElementById('preview-title').textContent;
  const body=document.getElementById('preview-body').textContent;
  showDialog('Xabarni tekshirish','Bu prototip xabar yubormaydi.',`<p class="small">Qabul qiluvchi: ${escape(values.get('recipient'))}</p><div class="preview-notification"><strong>${escape(heading)}</strong><p>${escape(body)}</p></div>`,'Tayyor','view');
}

function trapDialogKey(event) {
  if(event.key!=='Tab') return;
  const controls=[...document.querySelectorAll('.dialog button,.dialog input,.dialog select,.dialog textarea')].filter(x=>!x.disabled);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first) {event.preventDefault();last.focus();}
  else if(!event.shiftKey&&document.activeElement===last) {event.preventDefault();first.focus();}
}

document.addEventListener('keydown',event=>{
  if(event.key==='Escape') {closeDialog();const focus=lastMenu;closeMenu();focus?.focus();document.body.classList.remove('nav-open');return;}
  if(currentDialog) {trapDialogKey(event);return;}
  if(lastMenu) return;
  if(!(event.target instanceof Element)) return;
  if(event.target.closest('input,textarea,select,[contenteditable=true]')) return;
  if(event.key==='ArrowLeft'||event.key==='ArrowRight') {event.preventDefault();cycle(event.key==='ArrowLeft'?-1:1);}
});

render();
