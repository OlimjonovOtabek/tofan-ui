import {icon,escape} from '../ui.js';
import {uuid,goals,levels,weekdays,splits,mealTypes,muscles,equipment,exerciseTypes,genders,profileFixture,workoutsFixture,mealsFixture,daysFixture,mealDetailsFixture,clientsFixture,catalogExercises,ownedExercises,catalogFoods,ownedFoods,dayRequest,mealRequest,profileRequest,nutrition} from './contract.mjs';
import {btn,field,select,empty,programsPage,programList,workoutPage,mealPage,clientsPage,clientList,clientPage,contentPage,contentList,profilePage,pickerRows} from './screens.js?v=2';

const clone=value=>structuredClone(value);
const params=new URLSearchParams(location.search);
const screenKeys=['programs','workout','meal','clients','client','content','profile'];
const state={
  screen:screenKeys.includes(params.get('screen'))?params.get('screen'):'programs',
  profile:clone(profileFixture),workouts:clone(workoutsFixture),mealPrograms:clone(mealsFixture),days:clone(daysFixture),mealDetails:clone(mealDetailsFixture),clients:clone(clientsFixture),
  catalogExercises:clone(catalogExercises),ownExercises:clone(ownedExercises),catalogFoods:clone(catalogFoods),ownFoods:clone(ownedFoods),
  query:'',programType:'workout',programStatus:'',planId:params.get('plan')||uuid(params.get('screen')==='meal'?20:10),dayId:params.get('day')||uuid(50),
  clientId:params.get('client')||uuid(900),report:'weight',contentType:'exercises',scenario:'normal',dirty:false,saving:false,saveFailed:false,mobileDay:params.has('day'),picker:null,
  changedDays:new Set(),newDays:new Set(),deletedDays:new Set(),requests:[],saved:null,
};
let activeDialog=null,dialogFocus,toastTimer,nextId=2000;
const nav=[['programs','Dasturlar','calendar'],['clients','Mijozlar','users'],['content','Kontent','folder'],['profile','Profil','user']];
const scenarios=[['normal','Oddiy holat'],['loading','Yuklanish'],['empty','Bo‘sh holat'],['error','Yuklash xatosi'],['saveerror','Saqlash xatosi'],['profilemissing','Trener kartasi yo‘q'],['pricemissing','Narx kiritilmagan'],['workoutmissing','Mashg‘ulot nashr qilinmagan'],['mealmissing','Menyu nashr qilinmagan']];
document.body.classList.toggle('capture',params.has('capture'));

function activeNav() {
  return ['workout','meal'].includes(state.screen)?'programs':state.screen==='client'?'clients':state.screen;
}

function navigation(mobile=false) {
  return nav.map(([key,label,glyph])=>`<a href="?screen=${key}" class="${mobile?'':'rail-link '}${activeNav()===key?'active':''}" ${activeNav()===key?'aria-current="page"':''}>${icon(glyph)}<span>${label}</span></a>`).join('');
}

function rail() {
  return `<aside class="rail"><a class="rail-brand" href="?screen=programs" aria-label="Tofan Coach"><img src="../logo.svg" alt=""><span>TOFAN</span></a><nav aria-label="Asosiy bo‘limlar">${navigation()}</nav><div class="rail-foot"><a href="./CONTRACT.md" aria-label="Prototip va API mosligi">${icon('help')}</a><a href="?screen=profile" aria-label="Trener profili"><span class="avatar">TD</span></a></div></aside>`;
}

function topbar() {
  return `<header class="topbar"><a class="top-brand" href="?screen=programs"><img src="../logo.svg" alt=""><span><strong>Tofan Coach</strong><small>Trener ish maydoni</small></span></a><div class="top-actions"><span class="pill blue">Dizayn prototipi</span><span class="locale">UZ</span><span class="separator"></span><a class="profile-trigger" href="?screen=profile"><span><b>${escape(state.profile.displayName)}</b><small>Namuna profil</small></span><i class="avatar">TD</i></a></div></header>`;
}

function render() {
  document.body.classList.toggle('editing',['workout','meal'].includes(state.screen));
  document.body.classList.toggle('focus-day',state.screen==='workout'&&state.mobileDay);
  const views={programs:programsPage,workout:workoutPage,meal:mealPage,clients:clientsPage,client:clientPage,content:contentPage,profile:profilePage};
  const footer='<footer class="page-foot"><span>Tofan Coach</span><span>Namuna ma’lumotlari · Desktop va mobil konsept</span></footer>';
  const model=state.screen==='programs'&&state.scenario==='empty'?{...state,workouts:[],mealPrograms:[]}:state;
  const page=state.scenario==='profilemissing'?`<section class="surface">${empty('Trener kartangiz hali yaratilmagan','Administrator trener kartangizni yaratishi kerak. Kartangiz yaratilgach ish maydonidan foydalana olasiz.','retry','Holatni qayta tekshirish','user')}</section>`:views[state.screen](model);
  document.getElementById('app').innerHTML=`${rail()}<div class="workspace">${topbar()}<main id="main" tabindex="-1">${page}${footer}</main></div><nav class="mobile-nav" aria-label="Mobil bo‘limlar">${navigation(true)}</nav>`;
  document.getElementById('review').innerHTML=`<span>Prototip holati</span><select id="scenario" aria-label="Namuna holatini tanlash">${scenarios.map(([value,label])=>`<option value="${value}" ${state.scenario===value?'selected':''}>${label}</option>`).join('')}</select><a href="./CONTRACT.md">API mosligi</a><button data-action="request-preview" style="font-size:9px;color:var(--muted)">So‘rovlar</button>`;
}

function snapshot() {
  state.saved=clone({days:state.days,mealDetails:state.mealDetails,profile:state.profile});
  state.changedDays.clear();state.newDays.clear();state.deletedDays.clear();
  state.dirty=false;state.saveFailed=false;
}

function resetDraft() {
  if(state.saved) Object.assign(state,clone(state.saved));
  state.changedDays.clear();state.newDays.clear();state.deletedDays.clear();
  state.dirty=false;state.saveFailed=false;
}

function commitNavigation(screen,values={},writeHistory=true) {
  closeDialog();
  Object.assign(state,{screen,query:'',saveFailed:false,mobileDay:false},values);
  snapshot();
  const url=new URL(location.href);url.search=new URLSearchParams({screen});
  if(['workout','meal'].includes(screen)) url.searchParams.set('plan',state.planId);
  if(screen==='client') url.searchParams.set('client',state.clientId);
  if(writeHistory)history.pushState(null,'',url);
  render();window.scrollTo(0,0);
  document.getElementById('main').focus({preventScroll:true});
}

function navigate(screen,values={}) {
  if(state.dirty) return confirm('Saqlanmagan o‘zgarishlar','Saqlamasdan chiqsangiz, kiritgan o‘zgarishlar bekor qilinadi.','O‘zgarishlarni tashlash',()=>{resetDraft();commitNavigation(screen,values);});
  commitNavigation(screen,values);
}

function notify(message) {
  clearTimeout(toastTimer);document.getElementById('toast').textContent=message;
  toastTimer=setTimeout(()=>{document.getElementById('toast').textContent='';},3200);
}

function markDirty(dayId) {
  state.dirty=true;state.saveFailed=false;
  if(dayId) state.changedDays.add(dayId);
  const status=document.querySelector('.save-status');
  status?.classList.add('dirty');
  const label=document.getElementById('dirty-label');
  if(label)label.textContent='Saqlanmagan o‘zgarishlar';
  document.querySelector('[data-action=save]')?.removeAttribute('disabled');
}

function showDialog(title,description,body,kind='form',saveLabel='Saqlash') {
  dialogFocus=document.activeElement;
  activeDialog={kind};
  document.getElementById('app').inert=true;document.getElementById('review').inert=true;
  document.getElementById('overlay').innerHTML=`<div class="dialog-backdrop"><section class="dialog ${kind==='picker'?'picker':kind==='confirm'?'confirm':''}" role="dialog" aria-modal="true" aria-labelledby="dialog-title"><header class="dialog-head"><div><h2 id="dialog-title">${title}</h2><p>${description}</p></div><button class="icon-btn" data-action="close-dialog" aria-label="Oynani yopish">${icon('close')}</button></header><form id="dialog-form" class="dialog-body" novalidate>${body}<p class="dialog-error" id="dialog-error" role="alert"></p></form><footer class="dialog-foot">${kind==='picker'?'<span id="picker-count" class="picker-count">0 ta tanlandi</span>':''}<div class="actions">${btn('Bekor qilish','close-dialog')}<button class="btn ${kind==='confirm'?'danger':'primary'}" type="submit" form="dialog-form">${saveLabel}</button></div></footer></section></div>`;
  document.querySelector('.dialog input:not([type=file]),.dialog select,.dialog button')?.focus();
}

function closeDialog() {
  document.getElementById('overlay').innerHTML='';
  document.getElementById('app').inert=false;document.getElementById('review').inert=false;
  activeDialog=null;state.picker=null;dialogFocus?.focus({preventScroll:true});
}

function confirm(title,description,label,operation) {
  showDialog(title,'Amalni tasdiqlang',`<p style="font-size:13px;color:var(--muted);line-height:1.8">${description}</p>`,'confirm',label);
  activeDialog={kind:'confirm',operation};
}

function createProgram(type) {
  const body=type==='workout'?`<div class="fields">${field('Dastur nomi','name','','text','required')}${select('Maqsad','goal',goals,2)}${select('Tajriba darajasi','experienceLevel',levels,2)}</div><label class="inline-check">Uy sharoitidagi mashg‘ulot<input name="isHomeWorkout" type="checkbox"></label>`:`<div class="fields">${field('Boshlanish sanasi','startDate','2026-10-09','date','required')}${field('Tugash sanasi','endDate','2026-10-15','date','required')}</div><p class="small" style="margin-top:20px;line-height:1.8">Menyu shu sana oralig‘ida takrorlanadi. Ovqatlanish tarkibini keyingi ekran orqali tuzasiz.</p>`;
  showDialog(type==='workout'?'Yangi mashg‘ulot dasturi':'Yangi ovqatlanish rejasi','Avval asosiy parametrlarni belgilang.',body,'program','Yaratish va davom etish');
  activeDialog={kind:'program',type};
}

function editDay(id) {
  const day=state.days.find(x=>x.id===id);
  const body=`<div class="fields">${field('Kun nomi','title',day?.title??'','','required')}${select('Hafta kuni','dayOfWeek',weekdays,day?.dayOfWeek??1)}${select('Split turi','splitType',splits,day?.splitType??1)}</div><label class="inline-check">Dam olish kuni<input name="isRestDay" type="checkbox" ${day?.isRestDay?'checked':''}></label>${day?'<div style="padding-top:10px">'+btn('Kunni olib tashlash',`delete-day:${day.id}`,'text','trash')+'</div>':''}`;
  showDialog(day?'Kun sozlamalari':'Yangi dastur kuni','Kun nomi va mashg‘ulot turini belgilang.',body,'day');
  activeDialog={kind:'day',id};
}

function editMeal(id) {
  const meal=state.mealDetails[state.planId].meals.find(x=>x.id===id);
  const body=`<div class="fields">${field('Sarlavha','title',meal?.title??'','','required')}${select('Ovqatlanish turi','mealType',mealTypes,meal?.mealType??1)}${field('Rejalashtirilgan vaqt','plannedTime',meal?.plannedTime?.slice(0,5)??'','time')}</div>${meal?'<div style="margin-top:20px">'+btn('Ovqatlanishni olib tashlash',`delete-meal:${id}`,'text','trash')+'</div>':''}`;
  showDialog(meal?'Ovqatlanish sozlamalari':'Ovqatlanish qo‘shish','Vaqtni belgilash ixtiyoriy.',body,'meal');
  activeDialog={kind:'meal',id};
}

function editDates() {
  const plan=state.mealDetails[state.planId];
  showDialog('Sana oralig‘i','Menyu shu sana oralig‘ida takrorlanadi.',`<div class="fields">${field('Boshlanish sanasi','startDate',plan.startDate,'date','required')}${field('Tugash sanasi','endDate',plan.endDate,'date','required')}</div>`,'dates');
  activeDialog={kind:'dates'};
}

function openPicker(kind,target) {
  state.picker={kind,target,source:'catalog',query:'',selected:new Set()};
  const body=`<div class="picker-tabs"><button type="button" data-action="picker-source:catalog" class="active" aria-pressed="true">Umumiy katalog</button><button type="button" data-action="picker-source:own" aria-pressed="false">${kind==='exercises'?'Mening mashqlarim':'Mening ovqatlarim'}</button></div><label class="search">${icon('search')}<input type="search" id="picker-search" placeholder="${kind==='exercises'?'Mashq':'Ovqat'} nomini qidiring…" aria-label="Katalog ichida qidirish"></label><div id="picker-rows">${pickerRows(state)}</div>`;
  showDialog(kind==='exercises'?'Mashq tanlash':'Ovqat tanlash','Bir nechta yozuvni tanlab, rejaga birga qo‘shing.',body,'picker','Tanlanganlarni qo‘shish');
  activeDialog={kind:'picker'};
}

function switchPickerSource(source) {
  state.picker.source=source;state.picker.query='';
  document.getElementById('picker-search').value='';
  document.querySelectorAll('[data-action^="picker-source:"]').forEach(button=>{const active=button.dataset.action.endsWith(source);button.classList.toggle('active',active);button.setAttribute('aria-pressed',String(active));});
  document.getElementById('picker-rows').innerHTML=pickerRows(state);
}

function createContent(type,id) {
  const item=state[type==='exercises'?'ownExercises':'ownFoods'].find(x=>x.id===id);
  const body=type==='exercises'?exerciseForm(item):foodForm(item);
  showDialog(item?'Kontentni tahrirlash':type==='exercises'?'Mashq yaratish':'Ovqat yaratish','Faqat o‘zingiz yaratgan kontent uchun.',body,'content');
  activeDialog={kind:'content',type,id};
}

function exerciseForm(item) {
  const names=`<div class="fields">${field('O‘zbekcha nom','nameUz',item?.nameUz??'','','required')}${field('Русское название','nameRu',item?.nameRu??'','','required')}${field('English name','name',item?.name??'','','required')}</div>`;
  const attributes=`<div class="section-divider"><h3>Mashq parametrlari</h3><div class="fields">${select('Mushak guruhi','muscleGroup',muscles,item?.muscleGroup??1)}${select('Jihoz','equipmentType',equipment,item?.equipmentType??3)}${select('Murakkablik','difficulty',levels,item?.difficulty??2)}${select('Mashq turi','type',exerciseTypes,item?.type??1)}${select('Jins','gender',genders,item?.gender??0)}</div><label class="inline-check">Uy sharoitida<input type="checkbox" name="isHomeExercise" ${item?.isHomeExercise?'checked':''}></label><label class="inline-check">Bir nechta mushak guruhi<input type="checkbox" name="isCompound" ${item?.isCompound?'checked':''}></label></div>`;
  return names+attributes+`<label class="field">Bajarish ko‘rsatmasi<textarea name="instructions">${escape(item?.instructions??'')}</textarea></label><div class="section-divider"><label class="upload-box">${icon('upload')}<b>Mashq videosi</b><input type="file" name="video" accept=".mp4,.m4v,.mov,.webm"><small>MP4, M4V, MOV yoki WebM · 200 MB gacha.<br>Bu prototipda fayl yuklanmaydi.</small></label></div>`;
}

function foodForm(item) {
  return `<div class="fields">${field('Ovqat nomi','name',item?.name??'','','required')}${field('Porsiya, g','servingSizeGrams',item?.servingSizeGrams??100,'number','min="0.1" step="0.1" required')}${field('Porsiyadagi kaloriya, kcal','caloriesPerServing',item?.caloriesPerServing??0,'number','min="0" required')}${field('Oqsil, g','proteinGrams',item?.proteinGrams??0,'number','min="0" step="0.1" required')}${field('Uglevod, g','carbsGrams',item?.carbsGrams??0,'number','min="0" step="0.1" required')}${field('Yog‘, g','fatGrams',item?.fatGrams??0,'number','min="0" step="0.1" required')}${field('Tola, g — ixtiyoriy','fiberGrams',item?.fiberGrams??'','number','min="0" step="0.1"')}</div>`;
}

function publish(type) {
  if(state.dirty) return notify('Nashr qilishdan oldin o‘zgarishlarni saqlang.');
  const list=type==='workout'?state.workouts:state.mealPrograms;
  const plan=list.find(x=>x.id===state.planId);
  const hasItems=type==='workout'?state.days.some(x=>x.workoutPlanId===plan.id&&x.exercises.length):state.mealDetails[plan.id].meals.some(x=>x.items.length);
  if(!hasItems) return notify('Dastur bo‘sh. Avval tarkibini to‘ldiring.');
  const prior=list.find(x=>x.isPublished&&x.id!==plan.id);
  confirm(prior?'Nashrdagi dastur almashtiriladi':'Dasturni nashr qilish',`${prior?'Oldingi nashrdagi dastur qoralamaga o‘tadi. ':''}Yangi obunachilar shu dastur nusxasini oladi. Mavjud mijozlar nusxasi o‘zgarmaydi.`,'Nashr qilish',()=>{
    state.requests.push({method:'POST',path:`/coach/${type==='workout'?'workout':'meal'}-programs/${plan.id}/publish`});
    list.forEach(x=>{x.isPublished=x.id===plan.id;});closeDialog();render();notify('Namuna dastur nashr qilindi.');
  });
}

function validateEditor() {
  if(state.screen==='workout') return state.days.filter(x=>x.workoutPlanId===state.planId).every(day=>day.title.trim()&&day.exercises.every(x=>Number(x.targetSets)>=1&&x.targetReps.trim()&&Number(x.restSeconds)>=0&&(x.targetWeightKg===null||Number(x.targetWeightKg)>=0)));
  const plan=state.mealDetails[state.planId];
  return plan.startDate&&plan.endDate&&plan.meals.every(meal=>meal.title.trim()&&meal.items.every(item=>Number(item.quantityGrams)>0));
}

function saveRequests() {
  if(state.screen==='meal') return [{method:'PUT',path:`/diet/meal-plans/${state.planId}`,body:mealRequest(state.mealDetails[state.planId])}];
  const changed=state.days.filter(x=>state.changedDays.has(x.id));
  const writes=changed.map(day=>({method:state.newDays.has(day.id)?'POST':'PUT',path:state.newDays.has(day.id)?'/workout-plan-days':`/workout-plan-days/${day.id}`,body:state.newDays.has(day.id)?{workoutPlanId:day.workoutPlanId,...dayRequest(day)}:dayRequest(day)}));
  return [...writes,...[...state.deletedDays].map(id=>({method:'DELETE',path:`/workout-plan-days/${id}`}))];
}

async function saveEditor() {
  if(state.saving||!state.dirty) return;
  if(!validateEditor()) return notify('Nom va parametrlarni tekshiring. Set kamida 1, takror matni va musbat miqdor kerak.');
  state.saving=true;render();
  await new Promise(resolve=>setTimeout(resolve,350));
  state.saving=false;
  if(state.scenario==='saveerror') {state.saveFailed=true;render();return;}
  state.requests.push(...saveRequests());
  refreshSummaries();snapshot();render();notify('Namuna o‘zgarishlari saqlandi.');
}

function refreshSummaries() {
  state.workouts.forEach(plan=>{plan.dayCount=state.days.filter(x=>x.workoutPlanId===plan.id).length;});
  state.mealPrograms.forEach(plan=>{const details=state.mealDetails[plan.id];if(details){plan.startDate=details.startDate;plan.endDate=details.endDate;plan.mealCount=details.meals.length;}});
}

function updateExercise(target) {
  const day=state.days.find(x=>x.id===target.dataset.day);
  const entry=day?.exercises.find(x=>x.id===target.dataset.entry);
  if(!entry) return;
  const key=target.dataset.property;
  entry[key]=key==='targetReps'?target.value:key==='targetWeightKg'&&target.value===''?null:Number(target.value);
  markDirty(day.id);
}

function updateQuantity(target) {
  const plan=state.mealDetails[state.planId];
  const meal=plan.meals.find(x=>x.id===target.dataset.meal);
  const item=meal.items.find(x=>x.id===target.dataset.food);
  const food=[...state.catalogFoods,...state.ownFoods].find(x=>x.id===item.foodId);
  const amount=Number(target.value);
  if(!Number.isFinite(amount)||amount<=0) {target.setCustomValidity('Miqdor musbat bo‘lishi kerak.');return;}
  target.setCustomValidity('');item.quantityGrams=amount;Object.assign(item,nutrition(food,amount));markDirty();
  const focus={meal:target.dataset.meal,food:target.dataset.food};
  render();document.querySelector(`[data-meal="${focus.meal}"][data-food="${focus.food}"]`)?.focus({preventScroll:true});
}

function updateSearch(target) {
  state.query=target.value;
  const outputs={'program-search':['program-list',programList],'client-search':['client-list',clientList],'content-search':['content-list',contentList]};
  const output=outputs[target.id];if(output)document.getElementById(output[0]).innerHTML=output[1](state);
}

function openWorkDay(id) {
  state.dayId=id;state.mobileDay=true;render();
  const url=new URL(location.href);url.searchParams.set('day',id);history.replaceState(null,'',url);
  if(innerWidth<=700)window.scrollTo(0,0);
}

function removeExercise(dayId,id) {
  const day=state.days.find(x=>x.id===dayId);
  day.exercises=day.exercises.filter(x=>x.id!==id);markDirty(dayId);render();
  notify('Mashq rejadan olindi. Saqlash bilan tasdiqlang.');
}

function removeDay(id) {
  confirm('Dastur kunini olib tashlash','Bu kun va uning mashqlari dasturdan olinadi. O‘zgarish Saqlash orqali tasdiqlanadi.','Kunni olib tashlash',()=>{
    if(!state.newDays.has(id))state.deletedDays.add(id);
    state.newDays.delete(id);state.changedDays.delete(id);state.days=state.days.filter(x=>x.id!==id);markDirty();closeDialog();render();
  });
}

function removeMeal(id) {
  confirm('Ovqatlanishni olib tashlash','Tarkibdagi ovqatlar ham menyudan olinadi.','Olib tashlash',()=>{
    const plan=state.mealDetails[state.planId];plan.meals=plan.meals.filter(x=>x.id!==id);markDirty();closeDialog();render();
  });
}

function removeFood(mealId,id) {
  const meal=state.mealDetails[state.planId].meals.find(x=>x.id===mealId);meal.items=meal.items.filter(x=>x.id!==id);markDirty();render();
}

function deleteOwnedFood(id) {
  confirm('O‘z ovqatingizni o‘chirish','Mavjud dasturda ishlatilayotgan ovqatni backend o‘chirishga ruxsat bermasligi mumkin.','O‘chirish',()=>{
    const inUse=Object.values(state.mealDetails).some(plan=>plan.meals.some(meal=>meal.items.some(item=>item.foodId===id)));
    if(inUse){closeDialog();notify('Bu namuna ovqat menyuda ishlatilgan. Avval menyudan olib tashlang.');return;}
    state.requests.push({method:'DELETE',path:`/diet/custom-foods/${id}`});state.ownFoods=state.ownFoods.filter(x=>x.id!==id);closeDialog();render();notify('Namuna ovqat o‘chirildi.');
  });
}

function handleAction(action,value,id) {
  const actions={
    navigate:()=>navigate(value), 'open-workout':()=>navigate('workout',{planId:value,dayId:state.days.find(x=>x.workoutPlanId===value)?.id??null}),
    'open-meal':()=>navigate('meal',{planId:value}), 'open-client':()=>navigate('client',{clientId:value,report:'weight'}),
    'program-tab':()=>{state.programType=value;state.query='';render();},'clear-search':()=>{state.query='';state.programStatus='';render();},
    'new-program':()=>createProgram(state.programType),new:()=>createProgram(value),day:()=>openWorkDay(value),
    'day-list':()=>{state.mobileDay=false;render();},'add-day':()=>editDay(),'edit-day':()=>editDay(value),'delete-day':()=>removeDay(value),
    pick:()=>openPicker(value,id),'picker-source':()=>switchPickerSource(value),
    'remove-exercise':()=>removeExercise(value,id),'add-meal':()=>editMeal(),'edit-meal':()=>editMeal(value),
    'delete-meal':()=>removeMeal(value),'remove-food':()=>removeFood(value,id),'edit-dates':editDates,
    save:()=>void saveEditor(),'retry-save':()=>{state.scenario='normal';void saveEditor();},
    discard:()=>confirm('O‘zgarishlarni bekor qilish','Oxirgi saqlangan holat tiklanadi.','Bekor qilish',()=>{resetDraft();closeDialog();render();}),
    publish:()=>publish(value),report:()=>{state.report=value;render();},'content-tab':()=>{state.contentType=value;state.query='';render();},
    'create-content':()=>createContent(value),'edit-content':()=>createContent(value,id),'delete-food':()=>deleteOwnedFood(value),
    'close-dialog':closeDialog,retry:()=>{state.scenario='normal';render();},'request-preview':showRequests,
  };
  actions[action]?.();
}

document.addEventListener('click',event=>{
  if(!(event.target instanceof Element))return;
  const action=event.target.closest('[data-action]');
  if(action){const [key,value,id]=action.dataset.action.split(':');handleAction(key,value,id);return;}
  const link=event.target.closest('a[href^="?screen="]');
  if(link){event.preventDefault();navigate(new URL(link.href).searchParams.get('screen'));}
});

document.addEventListener('input',event=>{
  const target=event.target;if(!(target instanceof HTMLInputElement||target instanceof HTMLTextAreaElement))return;
  if(target.dataset.day)updateExercise(target);
  if(['program-search','client-search','content-search'].includes(target.id))updateSearch(target);
  if(target.id==='picker-search'){state.picker.query=target.value;document.getElementById('picker-rows').innerHTML=pickerRows(state);}
  if(target.form?.id==='profile-form'&&target.type!=='file'){state.profile[target.name]=target.name==='monthlyPrice'?Number(target.value):target.value;markDirty();}
});

document.addEventListener('change',event=>{
  const target=event.target;if(!(target instanceof HTMLInputElement||target instanceof HTMLSelectElement))return;
  if(target.id==='scenario'){state.scenario=target.value;render();}
  if(target.id==='program-status'){state.programStatus=target.value;document.getElementById('program-list').innerHTML=programList(state);}
  if(target.dataset.select){const selected=state.picker.selected;if(target.checked)selected.add(target.value);else selected.delete(target.value);document.getElementById('picker-count').textContent=`${selected.size} ta tanlandi`;}
  if(target.dataset.food)updateQuantity(target);
  if(target.dataset.planField){state.mealDetails[state.planId][target.dataset.planField]=target.value;markDirty();}
});

function formValues(form) {
  return new FormData(form);
}

function submitDialog(values) {
  const dialog=activeDialog;
  if(dialog.kind==='confirm'){dialog.operation();return;}
  if(dialog.kind==='view'){closeDialog();return;}
  if(dialog.kind==='picker'){applyPicker();return;}
  const handlers={program:()=>saveProgram(values,dialog),day:()=>saveDay(values,dialog),meal:()=>saveMeal(values,dialog),content:()=>saveContent(values,dialog),dates:()=>saveDates(values)};
  handlers[dialog.kind]?.();
}

function saveDates(values) {
  if(!requireValue(values,'startDate','Boshlanish sanasini kiriting.')||!requireValue(values,'endDate','Tugash sanasini kiriting.'))return;
  Object.assign(state.mealDetails[state.planId],{startDate:String(values.get('startDate')),endDate:String(values.get('endDate'))});
  markDirty();closeDialog();render();
}

function requireValue(values,key,message) {
  if(String(values.get(key)??'').trim())return true;
  document.getElementById('dialog-error').textContent=message;document.querySelector(`#dialog-form [name="${key}"]`)?.focus();return false;
}

function saveProgram(values,dialog) {
  const id=uuid(nextId++),createdOnUtc=new Date().toISOString();
  if(dialog.type==='workout'){
    if(!requireValue(values,'name','Dastur nomini kiriting.'))return;
    const body={name:String(values.get('name')).trim(),goal:Number(values.get('goal')),experienceLevel:Number(values.get('experienceLevel')),isHomeWorkout:values.has('isHomeWorkout')};
    state.requests.push({method:'POST',path:'/coach/workout-programs',body});state.workouts.unshift({id,...body,isPublished:false,dayCount:0,createdOnUtc});
    closeDialog();navigate('workout',{planId:id,dayId:null});return;
  }
  if(!requireValue(values,'startDate','Boshlanish sanasini kiriting.')||!requireValue(values,'endDate','Tugash sanasini kiriting.'))return;
  const body={startDate:String(values.get('startDate')),endDate:String(values.get('endDate')),meals:[]};
  state.requests.push({method:'POST',path:'/coach/meal-programs',body});state.mealPrograms.unshift({id,startDate:body.startDate,endDate:body.endDate,isPublished:false,mealCount:0,createdOnUtc});
  state.mealDetails[id]={id,userId:state.profile.userId,...body,isActive:true,source:5,createdOnUtc};closeDialog();navigate('meal',{planId:id});
}

function saveDay(values,dialog) {
  if(!requireValue(values,'title','Kun nomini kiriting.'))return;
  const existing=state.days.find(x=>x.id===dialog.id);
  const day=existing??{id:uuid(nextId++),workoutPlanId:state.planId,displayOrder:state.days.filter(x=>x.workoutPlanId===state.planId).length,exercises:[]};
  const update=()=>{
    Object.assign(day,{title:String(values.get('title')).trim(),dayOfWeek:Number(values.get('dayOfWeek')),splitType:Number(values.get('splitType')),isRestDay:values.has('isRestDay')});
    if(day.isRestDay)day.exercises=[];
    if(!existing){state.days.push(day);state.newDays.add(day.id);}
    markDirty(day.id);state.dayId=day.id;state.mobileDay=true;closeDialog();render();
  };
  if(values.has('isRestDay')&&day.exercises.length)return confirm('Dam olish kuniga almashtirish','Bu kundagi mashqlar olib tashlanadi.','Almashtirish',update);
  update();
}

function saveMeal(values,dialog) {
  if(!requireValue(values,'title','Sarlavhani kiriting.'))return;
  const plan=state.mealDetails[state.planId],existing=plan.meals.find(x=>x.id===dialog.id);
  const meal=existing??{id:uuid(nextId++),mealPlanId:plan.id,displayOrder:plan.meals.length,items:[]};
  Object.assign(meal,{title:String(values.get('title')).trim(),mealType:Number(values.get('mealType')),plannedTime:values.get('plannedTime')?`${values.get('plannedTime')}:00`:null});
  if(!existing)plan.meals.push(meal);markDirty();closeDialog();render();
}

function applyPicker() {
  const picker=state.picker;
  if(!picker.selected.size){document.getElementById('dialog-error').textContent='Kamida bitta yozuvni tanlang.';return;}
  const source=picker.kind==='exercises'?[...state.catalogExercises,...state.ownExercises]:[...state.catalogFoods,...state.ownFoods];
  for(const id of picker.selected){const item=source.find(x=>x.id===id);if(picker.kind==='exercises')addExercise(picker.target,item);else addFood(picker.target,item);}
  if(picker.kind==='exercises')markDirty(picker.target);else markDirty();closeDialog();render();notify('Tanlangan yozuvlar qo‘shildi. Saqlash bilan tasdiqlang.');
}

function addExercise(dayId,item) {
  const day=state.days.find(x=>x.id===dayId);
  day.isRestDay=false;day.exercises.push({id:uuid(nextId++),exercise:{id:item.id,name:item.name,nameRu:item.nameRu,nameUz:item.nameUz},targetSets:3,targetReps:'8-12',restSeconds:60,targetWeightKg:null,displayOrder:day.exercises.length});
}

function addFood(mealId,food) {
  const meal=state.mealDetails[state.planId].meals.find(x=>x.id===mealId),quantityGrams=food.servingSizeGrams;
  meal.items.push({id:uuid(nextId++),mealPlanMealId:meal.id,foodId:food.id,foodName:food.name,foodNameUz:food.nameUz??food.name,foodNameRu:food.nameRu??food.name,quantityGrams,...nutrition(food,quantityGrams),estimatedCost:null});
}

function saveContent(values,dialog) {
  if(!requireValue(values,'name','Nomni kiriting.'))return;
  if(dialog.type==='exercises'&&(!requireValue(values,'nameUz','O‘zbekcha nomni kiriting.')||!requireValue(values,'nameRu','Ruscha nomni kiriting.')))return;
  const list=state[dialog.type==='exercises'?'ownExercises':'ownFoods'],existing=list.find(x=>x.id===dialog.id);
  const body=dialog.type==='exercises'?exerciseValues(values,existing):foodValues(values);
  if(!body)return;
  const id=existing?.id??uuid(nextId++);
  state.requests.push({method:existing?'PUT':'POST',path:existing?`${dialog.type==='exercises'?'/coach/exercises':'/diet/custom-foods'}/${id}`:dialog.type==='exercises'?'/coach/exercises':'/coach/foods',body});
  if(existing)Object.assign(existing,body);else list.unshift({id,...body,...(dialog.type==='exercises'?{isActive:true}:{userId:state.profile.userId,createdOnUtc:new Date().toISOString()})});
  closeDialog();render();notify('Namuna kontent saqlandi.');
}

function exerciseValues(values,existing) {
  const file=values.get('video');
  if(file instanceof File&&file.size){document.getElementById('dialog-error').textContent='Fayl tanlandi. Bu dizayn prototipida video serverga yuklanmaydi; faylsiz saqlang.';return null;}
  return {name:String(values.get('name')).trim(),nameUz:String(values.get('nameUz')).trim(),nameRu:String(values.get('nameRu')).trim(),muscleGroup:Number(values.get('muscleGroup')),equipmentType:Number(values.get('equipmentType')),difficulty:Number(values.get('difficulty')),type:Number(values.get('type')),gender:Number(values.get('gender')),isCompound:values.has('isCompound'),isHomeExercise:values.has('isHomeExercise'),instructions:String(values.get('instructions')).trim()||null,videoFileId:existing?.videoFileId??null};
}

function foodValues(values) {
  const keys=['servingSizeGrams','caloriesPerServing','proteinGrams','carbsGrams','fatGrams'];
  const numbers=Object.fromEntries(keys.map(key=>[key,Number(values.get(key))]));
  if(numbers.servingSizeGrams<.1||keys.some(key=>!Number.isFinite(numbers[key])||numbers[key]<0)){document.getElementById('dialog-error').textContent='Porsiya kamida 0.1 g, oziq qiymatlari esa manfiy bo‘lmasligi kerak.';return null;}
  return {name:String(values.get('name')).trim(),...numbers,fiberGrams:values.get('fiberGrams')===''?null:Number(values.get('fiberGrams'))};
}

async function saveProfile(form) {
  const values=formValues(form);
  if(!String(values.get('displayName')).trim()||Number(values.get('monthlyPrice'))<1){document.getElementById('profile-error').textContent='Ism va musbat oylik narxni kiriting.';return;}
  const file=values.get('photo');
  if(file instanceof File&&file.size){document.getElementById('profile-error').textContent='Rasm tanlandi. Bu prototipda serverga yuklash yo‘q.';return;}
  if(state.scenario==='saveerror'){document.getElementById('profile-error').textContent='Profil saqlanmadi. Kiritgan qiymatlaringiz saqlanib turibdi.';return;}
  Object.assign(state.profile,{displayName:String(values.get('displayName')),bio:String(values.get('bio')),monthlyPrice:Number(values.get('monthlyPrice'))});
  state.requests.push({method:'PUT',path:'/coach/profile',body:profileRequest(state.profile)});snapshot();render();notify('Namuna profil saqlandi.');
}

function showRequests() {
  const output=state.requests.length?JSON.stringify(state.requests,null,2):'Hali o‘zgarish saqlanmagan. Muharrirda o‘zgartiring va Saqlashni bosing.';
  showDialog('API shartnomasiga mos so‘rovlar','Faqat preview. Bu so‘rovlar serverga yuborilmagan.',`<pre style="font:11px/1.7 ui-monospace,monospace;white-space:pre-wrap;word-break:break-word;margin:0">${escape(output)}</pre>`,'view','Yopish');
}

document.addEventListener('submit',event=>{
  event.preventDefault();
  if(event.target.id==='dialog-form')submitDialog(formValues(event.target));
  if(event.target.id==='profile-form')void saveProfile(event.target);
});

document.addEventListener('keydown',event=>{
  if(event.key==='Escape'){closeDialog();return;}
  if(!activeDialog||event.key!=='Tab')return;
  const controls=[...document.querySelectorAll('.dialog button,.dialog input,.dialog select,.dialog textarea')].filter(x=>!x.disabled);
  const first=controls[0],last=controls.at(-1);
  if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
  if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
});

window.addEventListener('beforeunload',event=>{if(state.dirty){event.preventDefault();event.returnValue='';}});
window.addEventListener('popstate',()=>{
  const url=new URL(location.href),screen=url.searchParams.get('screen')??'programs';
  if(state.dirty){history.pushState(null,'',`?screen=${state.screen}`);navigate(screen);return;}
  commitNavigation(screenKeys.includes(screen)?screen:'programs',{planId:url.searchParams.get('plan')??state.planId,clientId:url.searchParams.get('client')??state.clientId},false);
});

snapshot();render();
