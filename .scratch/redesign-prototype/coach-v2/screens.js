import {icon,escape} from '../ui.js';
import {goals,levels,weekdays,splits,mealTypes,muscles,equipment,sumNutrition,weightsFixture,adherenceFixture,dailyNutritionFixture} from './contract.mjs';

export function btn(label,action,style='',symbol='') {
  return `<button type="button" class="btn ${style}" data-action="${action}">${symbol?icon(symbol):''}${label}</button>`;
}

export function status(published) {
  return `<span class="pill ${published?'live':'draft'}">${published?'Nashr qilingan':'Qoralama'}</span>`;
}

export function avatar(client) {
  const colors=['sky','rose','sand','mint'];
  const index=Number(client.userId?.slice(-1)??0)%4;
  return `<span class="avatar ${colors[index]}" aria-hidden="true">${escape(client.firstName?.slice(0,1)??'T')}${escape(client.lastName?.slice(0,1)??'D')}</span>`;
}

export function date(value) {
  const [year,month,day]=value.slice(0,10).split('-');
  const months=['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'];
  return `${Number(day)} ${months[Number(month)-1]}, ${year}`;
}

export function range(plan) {
  if(plan.startDate.slice(0,7)===plan.endDate.slice(0,7))return `${Number(plan.startDate.slice(8,10))}–${date(plan.endDate)}`;
  return `${date(plan.startDate)} — ${date(plan.endDate)}`;
}

export function heading(title,description,actions='') {
  return `<header class="page-heading"><div><h1>${escape(title)}</h1><p>${description}</p></div>${actions?`<div class="actions">${actions}</div>`:''}</header>`;
}

export function banner(text) {
  return `<div class="info-banner">${icon('info')}<span>${text}</span></div>`;
}

function publicationNotice() {
  return banner('<span class="published-desktop">Bu dastur nashr qilingan. Saqlangan o‘zgarishlar faqat <b>kelajakdagi obunachilar</b> uchun qo‘llanadi. Mavjud mijozlarning nusxasi o‘zgarmaydi.</span><span class="published-mobile">Nashrdagi dastur. O‘zgarishlar <b>faqat yangi obunachilar</b> uchun qo‘llanadi.</span>');
}

export function field(label,name,value='',type='text',extra='') {
  return `<label class="field">${label}<input name="${name}" value="${escape(value)}" type="${type||'text'}" ${extra}></label>`;
}

export function select(label,name,options,value=1) {
  return `<label class="field">${label}<select name="${name}">${options.map((text,index)=>text?`<option value="${index}" ${Number(value)===index?'selected':''}>${text}</option>`:'').join('')}</select></label>`;
}

export function empty(title,description,action='retry',label='Qayta urinish',symbol='folder') {
  return `<div class="empty"><span class="empty-icon">${icon(symbol)}</span><h2>${title}</h2><p>${description}</p>${btn(label,action,'primary')}</div>`;
}

export function collectionState(state) {
  if(state.scenario==='loading') return `<div aria-busy="true" aria-label="Yuklanmoqda">${Array.from({length:4},()=>'<div class="skeleton-row"><span></span><span></span><span></span></div>').join('')}</div>`;
  if(state.scenario==='error') return empty('Ma’lumotni yuklab bo‘lmadi','Internet ulanishini tekshiring va qayta urinib ko‘ring.','retry','Qayta urinish','refresh');
  if(state.scenario==='empty'&&state.screen==='clients')return empty('Hali faol mijoz yo‘q','Administrator obuna bergan mijozlar shu yerda ko‘rinadi.','retry','Yangilash','users');
  if(state.scenario==='empty'&&state.screen==='content')return empty('Shaxsiy kontent hali yo‘q','Birinchi mashq yoki ovqatingizni yarating.',`create-content:${state.contentType}`,'Kontent yaratish','plus');
  if(state.scenario==='empty') return empty('Hali dastur yaratilmagan','Birinchi dasturingizni yarating va qoralamani to‘ldiring.','new-program','Dastur yaratish','plus');
  return null;
}

function programsFor(state) {
  const list=state.programType==='workout'?state.workouts:state.mealPrograms;
  return list.filter(item=>(state.programStatus===''||item.isPublished===(state.programStatus==='published'))&&(item.name??range(item)).toLowerCase().includes(state.query.toLowerCase()));
}

export function programsPage(state) {
  return `${heading('Dasturlar','Mashg‘ulot va ovqatlanish rejalarini tayyorlang, tekshiring va nashr qiling.',btn(state.programType==='workout'?'Mashg‘ulot yaratish':'Ovqatlanish rejasi yaratish','new-program','primary','plus'))}<p class="section-label">Nashrdagi dasturlar</p>${publishedPair(state)}<div class="content-columns"><section class="surface"><div class="tabs">${['workout','meal'].map(type=>`<button class="tab ${state.programType===type?'active':''}" aria-pressed="${state.programType===type}" data-action="program-tab:${type}">${type==='workout'?'Mashg‘ulotlar':'Ovqatlanish'}<span class="tab-count">${type==='workout'?state.workouts.length:state.mealPrograms.length}</span></button>`).join('')}</div><div class="list-tools">${search('program-search',state.query,'Dastur qidirish…')}<select class="filter-select" id="program-status" aria-label="Dastur holati"><option value="">Barcha holatlar</option><option value="published" ${state.programStatus==='published'?'selected':''}>Nashr qilingan</option><option value="draft" ${state.programStatus==='draft'?'selected':''}>Qoralama</option></select></div><div id="program-list">${programList(state)}</div></section><aside><section class="surface readiness"><h2>Ishga tayyorgarlik</h2><p>Profil va nashrdagi dasturlaringiz holati.</p>${readiness(state)}</section><p class="aside-note">Nashrdagi har bir dastur turidan bittasi ko‘rinadi. Yangi dastur nashr qilinsa, oldingisi qoralamaga o‘tadi.</p></aside></div>`;
}

function publishedPair(state) {
  const workout=['workoutmissing','empty'].includes(state.scenario)?null:state.workouts.find(x=>x.isPublished);
  const meal=['mealmissing','empty'].includes(state.scenario)?null:state.mealPrograms.find(x=>x.isPublished);
  const first=workout?`<article class="surface live-workout"><div class="program-symbol">${icon('dumbbell')}</div><div class="live-content"><div class="program-top">statusPlaceholder<span class="small">${workout.dayCount} kunlik reja</span></div><span class="type-label">Mashg‘ulot dasturi</span><h2>${escape(workout.name)}</h2><div class="program-properties"><span>${icon('award')}${goals[workout.goal]}</span><span>${levels[workout.experienceLevel]}</span><span>${icon('home')}${workout.isHomeWorkout?'Uy sharoitida':'Sport zalida'}</span></div>${btn('Dastur ustida ishlash',`open-workout:${workout.id}`,'primary','edit')}</div></article>`.replace('statusPlaceholder',status(true)):`<article class="surface live-workout"><div class="live-content"><span class="pill draft">Nashr qilinmagan</span><h2 style="margin-top:15px">Mashg‘ulot rejasini tayyorlang</h2><p class="small" style="margin-bottom:20px">Mavjud qoralamani davom ettiring yoki yangi dastur yarating.</p>${btn('Mashg‘ulot yaratish','new:workout','primary','plus')}</div></article>`;
  const second=meal?`<article class="surface live-meal"><div class="program-top">${status(true)}<span class="small">${meal.mealCount} ta ovqatlanish</span></div><h2>${range(meal)}</h2><p class="meal-context">Shu sanalar oralig‘ida takrorlanadigan menyu. Har bir ovqatlanish vaqti va tarkibi bir joyda.</p><div class="actions">${btn('Menyuni tahrirlash',`open-meal:${meal.id}`,'','apple')}</div></article>`:`<article class="surface live-meal"><span class="pill draft">Nashr qilinmagan</span><h2>Ovqatlanish menyusi kerak</h2><p class="meal-context">Sana oralig‘ini belgilang va takrorlanadigan menyu tuzing.</p>${btn('Menyu yaratish','new:meal','','plus')}</article>`;
  return `<div class="paired-programs">${first}${second}</div>`;
}

function readiness(state) {
  const values=[['Profil va narx',state.scenario!=='pricemissing'&&state.profile.monthlyPrice>0,'profile',`${Number(state.profile.monthlyPrice).toLocaleString('uz-UZ')} so‘m / oy`],['Mashg‘ulot dasturi',state.scenario!=='workoutmissing'&&state.workouts.some(x=>x.isPublished),'programs','Nashrdagi mashg‘ulot'],['Ovqatlanish menyusi',state.scenario!=='mealmissing'&&state.mealPrograms.some(x=>x.isPublished),'programs','Nashrdagi ovqatlanish rejasi']];
  return values.map(([label,ready,target,description])=>`<button class="ready-item ${ready?'':'pending'}" data-action="navigate:${target}" style="width:100%;text-align:left"><span class="ready-check">${icon(ready?'check':'plus')}</span><span><b>${label}</b><small>${ready?description:'To‘ldirish kerak'}</small></span></button>`).join('');
}

export function programList(state) {
  const statusView=collectionState(state);
  if(statusView) return statusView;
  const rows=programsFor(state);
  if(!rows.length) return empty('Dastur topilmadi','Qidiruv yoki holat filtrini o‘zgartirib ko‘ring.','clear-search','Qidiruvni tozalash','search');
  const cells=rows.map(item=>`<tr><td>${programIdentity(item,state.programType)}</td><td>${state.programType==='workout'?`${item.dayCount} kun`:`${item.mealCount} ta`}</td><td>${status(item.isPublished)}</td><td><button class="row-open" data-action="open-${state.programType}:${item.id}">Ochish${icon('chevron')}</button></td></tr>`).join('');
  const mobile=rows.map(item=>`<button class="mobile-program" data-action="open-${state.programType}:${item.id}"><span class="mini-symbol ${state.programType==='meal'?'meal':''}">${icon(state.programType==='meal'?'apple':'dumbbell')}</span><span class="grow"><b>${escape(item.name??range(item))}</b>${status(item.isPublished)}<small>${state.programType==='workout'?`${item.dayCount} kun · ${levels[item.experienceLevel]} · ${item.isHomeWorkout?'Uyda':'Zalda'}`:`${item.mealCount} ta ovqatlanish · Takrorlanadigan menyu`}</small></span>${icon('chevron')}</button>`).join('');
  return `<table class="table desktop-programs"><thead><tr><th scope="col">Dastur</th><th scope="col">${state.programType==='workout'?'Kunlar':'Menyu'}</th><th scope="col">Holat</th><th scope="col">Amal</th></tr></thead><tbody>${cells}</tbody></table><div class="mobile-programs">${mobile}</div>`;
}

function programIdentity(item,type) {
  return `<div class="identity"><span class="mini-symbol ${type==='meal'?'meal':''}">${icon(type==='meal'?'apple':'dumbbell')}</span><button data-action="open-${type}:${item.id}"><b>${escape(item.name??range(item))}</b><small>${type==='workout'?`${goals[item.goal]} · ${item.isHomeWorkout?'Uy sharoitida':'Sport zalida'}`:'Sana oralig‘ida takrorlanadigan menyu'}</small></button></div>`;
}

export function search(id,value,placeholder) {
  return `<label class="search">${icon('search')}<input id="${id}" type="search" value="${escape(value)}" placeholder="${placeholder}" aria-label="${placeholder.replace('…','')}"></label>`;
}

export function workoutPage(state) {
  const plan=state.workouts.find(x=>x.id===state.planId);
  const days=state.days.filter(x=>x.workoutPlanId===state.planId).sort((a,b)=>a.displayOrder-b.displayOrder);
  const selected=days.find(x=>x.id===state.dayId)??days[0];
  const panel=`<aside class="surface day-panel"><h3>Dastur kunlari<span class="small">${days.length}</span></h3>${days.map(day=>dayButton(day,selected)).join('')}<div class="day-add">${btn('Kun qo‘shish','add-day','text wide','plus')}</div></aside>`;
  return `<div class="breadcrumb"><button data-action="navigate:programs">Dasturlar</button>${icon('chevron')}<b>${state.mobileDay?escape(plan.name):'Mashg‘ulot muharriri'}</b></div>${heading(plan.name,`${goals[plan.goal]} · ${levels[plan.experienceLevel]} · ${plan.isHomeWorkout?'Uy sharoitida':'Sport zalida'}`,!plan.isPublished?btn('Nashr qilish','publish:workout','','check'):'')}${plan.isPublished?publicationNotice():''}${saveError(state)}<div class="editor-layout workout-editor ${state.mobileDay?'day-focused':''}">${panel}<section class="surface selected-day">${selected?selectedDay(state,selected):empty('Birinchi kunni qo‘shing','Dastur kunlari orqali mashg‘ulot tartibini tuzing.','add-day','Kun qo‘shish','calendar')}</section></div>${saveBar(state)}`;
}

function dayButton(day,selected) {
  return `<button class="day-item ${day.id===selected?.id?'active':''}" data-action="day:${day.id}" aria-pressed="${day.id===selected?.id}"><span class="day-dot">${weekdays[day.dayOfWeek].slice(0,2)}</span><span><b>${escape(day.title)}</b><small>${weekdays[day.dayOfWeek]} · ${day.isRestDay?'Dam olish':`${day.exercises.length} ta mashq`}</small></span>${icon('chevron')}</button>`;
}

function selectedDay(state,day) {
  return `<div style="padding:0 20px"><button class="mobile-back" data-action="day-list">${icon('left')}Dastur kunlari</button></div><header class="selected-day-head"><div><h2>${escape(day.title)}</h2><p>${weekdays[day.dayOfWeek]} · ${splits[day.splitType]}</p></div><div class="actions">${btn('Kun sozlamalari',`edit-day:${day.id}`,'','filter')}</div></header>${day.isRestDay?empty('Tiklanish kuni','Bu kunda mashg‘ulot belgilanmagan.',`edit-day:${day.id}`,'Kun sozlamalari','calendar'):dayExercises(day)}${!day.isRestDay?`<footer class="editor-footer">${btn('Mashq qo‘shish',`pick:exercises:${day.id}`,'','plus')}<span class="small">Katalogdan yoki o‘z mashqlaringizdan tanlang</span></footer>`:''}`;
}

function dayExercises(day) {
  const head=`<div class="exercise-table-head"><span>Mashq</span><span>Set</span><span>Takror</span><span>Dam, s</span><span>Vazn, kg</span><span></span></div>`;
  if(!day.exercises.length) return empty('Mashqlar hali qo‘shilmagan','Mashq tanlang va set, takror, dam olish hamda vaznni belgilang.',`pick:exercises:${day.id}`,'Mashq tanlash','dumbbell');
  return head+day.exercises.map((entry,index)=>`<article class="exercise-entry"><div class="entry-title"><span class="entry-index">${String(index+1).padStart(2,'0')}</span><div><b>${escape(entry.exercise.nameUz)}</b><small>${escape(entry.exercise.name)}</small></div></div>${parameter('Set',entry.targetSets,'number',day.id,entry.id,'targetSets','min="1"')}${parameter('Takror',entry.targetReps,'text',day.id,entry.id,'targetReps')}${parameter('Dam olish, s',entry.restSeconds,'number',day.id,entry.id,'restSeconds','min="0"')}${parameter('Vazn, kg',entry.targetWeightKg??'','number',day.id,entry.id,'targetWeightKg','min="0" step="0.5" placeholder="Ixtiyoriy"')}<button class="remove-btn" data-action="remove-exercise:${day.id}:${entry.id}" aria-label="${escape(entry.exercise.nameUz)}ni rejadan olib tashlash">${icon('trash')}</button></article>`).join('');
}

function parameter(label,value,type,dayId,entryId,property,extra='') {
  return `<label class="parameter"><span>${label}</span><input type="${type}" value="${escape(value)}" data-day="${dayId}" data-entry="${entryId}" data-property="${property}" aria-label="${label}" ${extra}></label>`;
}

export function saveBar(state) {
  return `<div class="save-bar"><span class="save-status ${state.dirty?'dirty':''}"><i class="dot"></i><span id="dirty-label">${state.saving?'Saqlanmoqda…':state.dirty?'Saqlanmagan o‘zgarishlar':'Barcha o‘zgarishlar saqlangan'}</span></span><div class="actions">${btn('Bekor qilish','discard','text')}<button class="btn primary" data-action="save" ${!state.dirty||state.saving?'disabled':''}>${icon('check')}${state.saving?'Saqlanmoqda…':'Saqlash'}</button></div></div>`;
}

export function saveError(state) {
  return state.saveFailed?`<div class="error-message" role="alert">${icon('info')}<span>O‘zgarishlar saqlanmadi. Kiritgan ma’lumotlaringiz shu oynada saqlanib turibdi.</span>${btn('Qayta urinish','retry-save','','refresh')}</div>`:'';
}

export function mealPage(state) {
  const plan=state.mealDetails[state.planId];
  const summary=state.mealPrograms.find(x=>x.id===state.planId);
  const total=sumNutrition(plan.meals.flatMap(x=>x.items));
  return `<div class="breadcrumb"><button data-action="navigate:programs">Dasturlar</button>${icon('chevron')}<b>Ovqatlanish muharriri</b></div>${heading('Ovqatlanish menyusi',range(plan),btn('Sana oralig‘i','edit-dates','','calendar')+(!summary.isPublished?btn('Nashr qilish','publish:meal','','check'):''))}${banner('<b>Takrorlanadigan menyu.</b> Shu sana oralig‘ida bir xil menyu qo‘llanadi.'+(summary.isPublished?' Nashrdagi rejadagi o‘zgarishlar faqat yangi obunachilarga ta’sir qiladi.':''))}${saveError(state)}<div class="meal-workspace"><div>${plan.meals.map(meal=>mealBlock(meal)).join('')}<div style="margin-top:20px">${btn('Ovqatlanish qo‘shish','add-meal','wide','plus')}</div></div><aside><section class="surface nutrition-total"><div><h3>Menyu jami</h3><div class="calorie-value" id="total-calories">${Math.round(total.calories).toLocaleString('uz-UZ')} <small>kcal</small></div><p class="small">Tarkib bo‘yicha hisoblangan</p></div><div><div class="macro-bar" aria-hidden="true"><i style="flex:${total.proteinGrams*4}"></i><i style="flex:${total.carbsGrams*4}"></i><i style="flex:${total.fatGrams*9}"></i></div>${macroRows(total)}</div></section><section class="surface surface-pad" style="margin-top:18px"><h3>Sana oralig‘i</h3><div style="display:grid;gap:14px;margin-top:17px">${field('Boshlanish','startDate',plan.startDate,'date','data-plan-field="startDate"')}${field('Tugash','endDate',plan.endDate,'date','data-plan-field="endDate"')}</div></section><p class="aside-note">Miqdorlar grammda kiritiladi. Kaloriya va makrolar tanlangan ovqat porsiyasi asosida hisoblanadi.</p></aside></div>${saveBar(state)}`;
}

function mealBlock(meal) {
  const total=sumNutrition(meal.items);
  return `<section class="surface meal-block"><header class="meal-heading"><div class="identity"><span class="mini-symbol meal">${icon('apple')}</span><div><b>${escape(meal.title)}</b><small>${mealTypes[meal.mealType]}</small></div></div><div class="actions"><span class="planned-time">${meal.plannedTime?.slice(0,5)??'Vaqt belgilanmagan'}</span><button class="icon-btn" data-action="edit-meal:${meal.id}" aria-label="${escape(meal.title)} sozlamalari">${icon('edit')}</button></div></header>${meal.items.map(item=>mealFood(meal,item)).join('')}${!meal.items.length?'<p class="small" style="padding:22px 24px">Ovqat hali qo‘shilmagan.</p>':''}<footer class="meal-footer">${btn('Ovqat qo‘shish',`pick:foods:${meal.id}`,'text','plus')}<span class="meal-totals">${Math.round(total.calories)} kcal · O ${total.proteinGrams.toFixed(1)} · U ${total.carbsGrams.toFixed(1)} · Y ${total.fatGrams.toFixed(1)}</span></footer></section>`;
}

function mealFood(meal,item) {
  return `<article class="meal-food"><div class="food-name"><b>${escape(item.foodNameUz||item.foodName)}</b><small>${Math.round(item.calories)} kcal · O ${item.proteinGrams.toFixed(1)} g / U ${item.carbsGrams.toFixed(1)} g / Y ${item.fatGrams.toFixed(1)} g</small></div><label class="quantity"><input type="number" value="${item.quantityGrams}" min="0.1" step="0.1" data-meal="${meal.id}" data-food="${item.id}" aria-label="${escape(item.foodName)} miqdori">g</label><button class="remove-btn" data-action="remove-food:${meal.id}:${item.id}" aria-label="${escape(item.foodName)}ni menyudan olib tashlash">${icon('trash')}</button></article>`;
}

function macroRows(total) {
  return [['Oqsil','proteinGrams',''],['Uglevod','carbsGrams','carbs'],['Yog‘','fatGrams','fat']].map(([label,key,style])=>`<div class="macro-row"><span><i class="macro-dot ${style}"></i>${label}</span><b>${total[key].toFixed(1)} g</b></div>`).join('');
}

export function clientsPage(state) {
  return `${heading('Mijozlar','Faol obunachilaringiz va ularning shaxsiy hisobotlari.')}<section class="surface"><div class="list-tools">${search('client-search',state.query,'Mijozni qidiring…')}<span class="small" style="margin-left:auto">${state.clients.length} ta mijoz</span></div><div id="client-list">${clientList(state)}</div></section>`;
}

export function clientList(state) {
  if(collectionState(state)) return collectionState(state);
  const rows=state.clients.filter(client=>`${client.firstName} ${client.lastName}`.toLowerCase().includes(state.query.toLowerCase()));
  if(!rows.length) return empty('Mijoz topilmadi','Ismni tekshiring yoki qidiruvni tozalang.','clear-search','Qidiruvni tozalash','search');
  const desktop=rows.map(client=>`<tr><td><div class="identity">${avatar(client)}<button data-action="open-client:${client.userId}"><b>${client.firstName} ${client.lastName}</b><small>${goals[client.goal]??'Maqsad belgilanmagan'}</small></button></div></td><td>${client.currentWeightKg===null?'—':`${client.currentWeightKg} kg`}</td><td>${client.targetWeightKg===null?'—':`${client.targetWeightKg} kg`}</td><td>${date(client.subscriptionEndsOnUtc)}</td><td><button class="row-open" data-action="open-client:${client.userId}">Hisobot${icon('chevron')}</button></td></tr>`).join('');
  const mobile=rows.map(client=>`<button class="mobile-program" data-action="open-client:${client.userId}">${avatar(client)}<span class="grow"><b>${client.firstName} ${client.lastName}</b><span class="small">${goals[client.goal]}</span><small>${client.currentWeightKg??'—'} ${client.currentWeightKg===null?'':'kg ·'} Obuna ${date(client.subscriptionEndsOnUtc)} gacha</small></span>${icon('chevron')}</button>`).join('');
  return `<table class="table desktop-clients"><thead><tr><th scope="col">Mijoz</th><th scope="col">Vazn</th><th scope="col">Maqsad vazni</th><th scope="col">Obuna tugashi</th><th scope="col">Hisobot</th></tr></thead><tbody>${desktop}</tbody></table><div class="mobile-clients">${mobile}</div>`;
}

export function clientPage(state) {
  const client=state.clients.find(x=>x.userId===state.clientId);
  return `<div class="breadcrumb"><button data-action="navigate:clients">Mijozlar</button>${icon('chevron')}<b>Shaxsiy hisobot</b></div><div class="client-profile-head">${avatar(client)}<div><h1>${client.firstName} ${client.lastName}</h1><p>${goals[client.goal]} · Obuna ${date(client.subscriptionEndsOnUtc)} gacha</p></div><span class="pill blue">Faol obuna</span></div><div class="tabs" style="padding:0">${[['weight','Vazn'],['workouts','Mashg‘ulot'],['nutrition','Ovqatlanish']].map(([key,label])=>`<button class="tab ${state.report===key?'active':''}" data-action="report:${key}" aria-pressed="${state.report===key}">${label}</button>`).join('')}</div>${reportBody(state,client)}`;
}

function reportBody(state,client) {
  if(state.report==='workouts') return adherenceReport(state);
  if(state.report==='nutrition') return nutritionReport(state);
  const hasHistory=client.userId===state.clients[0].userId;
  const graph=state.scenario==='error'?empty('Vazn tarixini yuklab bo‘lmadi','Profil ma’lumotlari ochiq. Vazn tarixini qayta yuklash mumkin.','retry','Qayta urinish','refresh'):hasHistory&&state.scenario!=='empty'?weightChart(weightsFixture):empty('Vazn tarixi hali yo‘q','Mijoz vaznini kiritganida shu yerda ko‘rinadi.','navigate:clients','Mijozlarga qaytish','clock');
  return `<div class="report-layout"><section class="surface surface-pad"><div style="display:flex;justify-content:space-between;align-items:center;gap:10px"><h2>Vazn o‘zgarishi</h2><span class="small">01–09 okt, 2026</span></div>${graph}</section><aside class="surface weight-summary"><h3>Hozirgi vazn</h3><div class="weight-value">${client.currentWeightKg??'—'} <small>${client.currentWeightKg===null?'':'kg'}</small></div><p class="small">${client.currentWeightKg===null?'Vazn kiritilmagan':'Profil bo‘yicha'}</p><div class="section-divider"><div class="fact-pair"><span>Maqsad</span><b>${client.targetWeightKg??'—'} kg</b></div><div class="fact-pair"><span>Boshlanish</span><b>${date(client.subscribedOnUtc)}</b></div></div></aside></div>`;
}

function weightChart(points) {
  const values=points.map(x=>x.weightKg),lo=Math.floor(Math.min(...values)),hi=Math.ceil(Math.max(...values));
  const pos=points.map((point,index)=>[40+index*520/(points.length-1),215-(point.weightKg-lo)/(hi-lo)*185]);
  const lines=Array.from({length:4},(_,index)=>{const value=lo+(hi-lo)*index/3,y=215-index*185/3;return `<line x1="40" y1="${y}" x2="560" y2="${y}"/><text x="2" y="${y+4}">${value.toFixed(1)}</text>`;}).join('');
  return `<svg class="chart" viewBox="0 0 580 250" role="img" aria-label="Namuna vazn tarixi: ${values[0]} kilogrammdan ${values.at(-1)} kilogrammgacha">${lines}<polyline points="${pos.map(x=>x.join(',')).join(' ')}"/>${pos.map(([x,y])=>`<circle cx="${x}" cy="${y}" r="3.5"/>`).join('')}</svg><div class="chart-labels"><span>01 okt</span><span>03 okt</span><span>05 okt</span><span>07 okt</span><span>09 okt</span></div>`;
}

function adherenceReport(state) {
  if(state.clientId!==state.clients[0].userId) return `<section class="surface" style="margin-top:24px">${empty('Mashg‘ulot tarixi hali yo‘q','Bu namuna mijoz uchun mashg‘ulot hisoboti mavjud emas.','navigate:clients','Mijozlarga qaytish','calendar')}</section>`;
  const report=adherenceFixture;
  return `<div class="report-layout"><section class="surface surface-pad"><h2>Rejaga amal qilish</h2><p class="small" style="margin-top:6px">${range({startDate:report.fromDate,endDate:report.toDate})}</p><div class="report-days">${report.days.map(day=>`<div class="report-day ${day.isMissed?'missed':day.isRestDay?'rest':''}"><span>${day.date.slice(-2)} okt</span>${icon(day.isMissed?'close':day.isRestDay?'clock':'check')}<span>${day.isMissed?'Qoldirilgan':day.isRestDay?'Dam olish':'Bajarilgan'}</span></div>`).join('')}</div></section><aside class="surface surface-pad"><h3>Bajarilish</h3><div class="weight-value">${report.adherencePercent}<small>%</small></div><p class="small">${report.scheduledDays} kundan ${report.completedDays} tasi bajarilgan</p><div class="progress"><span style="width:${report.adherencePercent}%"></span></div><p class="small">${report.missedDays} ta kun qoldirilgan</p></aside></div>`;
}

function nutritionReport(state) {
  if(state.clientId!==state.clients[0].userId) return `<section class="surface" style="margin-top:24px">${empty('Ovqatlanish hisoboti hali yo‘q','Mijoz ovqatlanish kundaligini to‘ldirganda hisoboti paydo bo‘ladi.','navigate:clients','Mijozlarga qaytish','apple')}</section>`;
  const report=dailyNutritionFixture;
  return `<div class="report-layout"><section class="surface surface-pad"><h2>Ovqatlanish hisoboti</h2><p class="small" style="margin-top:5px">${date(report.date)} · ${report.mealsLogged} ta ovqatlanish</p><div class="weight-value">${report.consumedCalories.toLocaleString('uz-UZ')} <small>/ ${report.targetCalories.toLocaleString('uz-UZ')} kcal</small></div><div class="progress"><span style="width:${Math.min(100,report.consumedCalories/report.targetCalories*100)}%"></span></div>${[['Oqsil','proteinGrams','targetProteinGrams'],['Uglevod','carbsGrams','targetCarbsGrams'],['Yog‘','fatGrams','targetFatGrams']].map(([name,key,target])=>`<div class="macro-row"><span>${name}</span><b>${report[key]} / ${report[target]} g</b></div>`).join('')}</section><aside class="surface surface-pad"><h3>Hisobot haqida</h3><p class="small" style="margin-top:12px;line-height:1.8">Hisoblangan iste’mol va mijozning maqsad qiymatlari birga ko‘rsatiladi. Bu ma’lumot shu mijozning ovqatlanish kundaligiga tegishli.</p></aside></div>`;
}

export function contentPage(state) {
  const createLabel=state.contentType==='exercises'?'Mashq yaratish':'Ovqat yaratish';
  return `${heading('Mening kontentim','O‘zingiz yaratgan mashqlar va ovqatlar. Katalogdan tanlash dastur muharririda.',btn(createLabel,`create-content:${state.contentType}`,'primary','plus'))}<div class="tabs" style="padding:0;margin-bottom:20px">${[['exercises','Mashqlar'],['foods','Ovqatlar']].map(([type,label])=>`<button class="tab ${state.contentType===type?'active':''}" data-action="content-tab:${type}">${label}<span class="tab-count">${state[type==='exercises'?'ownExercises':'ownFoods'].length}</span></button>`).join('')}</div><div style="margin-bottom:22px">${search('content-search',state.query,'Kontent qidirish…')}</div><div id="content-list">${contentList(state)}</div>`;
}

export function contentList(state) {
  if(collectionState(state)) return `<section class="surface">${collectionState(state)}</section>`;
  const exercises=state.contentType==='exercises';
  const rows=state[exercises?'ownExercises':'ownFoods'].filter(item=>(item.nameUz??item.name).toLowerCase().includes(state.query.toLowerCase()));
  if(!rows.length) return `<section class="surface">${empty('Kontent topilmadi','Qidiruvni tozalang yoki yangi kontent yarating.',`create-content:${state.contentType}`,'Kontent yaratish','plus')}</section>`;
  return `<div class="content-grid">${rows.map(item=>`<article class="content-card"><div class="content-preview">${icon(exercises?'dumbbell':'apple')}${exercises&&item.videoFileId?`<span class="video-hint">${icon('video')}Video mavjud</span>`:''}</div><h3>${escape(item.nameUz??item.name)}</h3><p>${exercises?`${muscles[item.muscleGroup]} · ${equipment[item.equipmentType]}`:`${item.servingSizeGrams} g · ${item.caloriesPerServing} kcal`}</p><footer><span class="small">O‘zim yaratgan</span>${btn('Tahrirlash',`edit-content:${state.contentType}:${item.id}`,'','edit')}${!exercises?btn('O‘chirish',`delete-food:${item.id}`,'text','trash'):''}</footer></article>`).join('')}</div>`;
}

export function profilePage(state) {
  const profile=state.profile;
  return `${heading('Trener profili','Mijozlarga ko‘rinadigan ma’lumotlar va oylik narx.')}<div class="content-columns"><form class="surface surface-pad" id="profile-form"><div class="client-profile-head"><span class="avatar mint">TD</span><div><h2>${escape(profile.displayName)}</h2><p>${profile.isPublished?'Profil nashr qilingan':'Profil hali nashr qilinmagan'}</p></div></div><div class="fields">${field('Ko‘rinadigan ism','displayName',profile.displayName,'text','required')}${field('Oylik narx, so‘m','monthlyPrice',state.scenario==='pricemissing'?0:profile.monthlyPrice,'number','min="1" required')}<label class="field wide">O‘zingiz haqingizda<textarea name="bio">${escape(profile.bio??'')}</textarea></label><label class="field wide">Profil rasmi<input type="file" name="photo" accept=".jpg,.jpeg,.png,.webp"><small>JPG, PNG yoki WebP · 10 MB gacha. Prototipda yuklanmaydi.</small></label></div><p id="profile-error" class="dialog-error" role="alert"></p><div class="section-divider actions" style="justify-content:flex-end"><button class="btn primary" type="submit">${icon('check')}Profilni saqlash</button></div></form><aside class="surface surface-pad"><h3>Katalogdagi holat</h3><div style="margin:15px 0">${status(profile.isPublished)}</div><p class="small" style="line-height:1.8">Profilni nashr qilish administrator tomonidan boshqariladi. Ism, tavsif, rasm va oylik narxni shu yerdan o‘zgartirasiz.</p></aside></div>`;
}

export function pickerRows(state) {
  const source=state.picker.kind==='exercises'?(state.picker.source==='own'?state.ownExercises:state.catalogExercises):(state.picker.source==='own'?state.ownFoods:state.catalogFoods);
  const rows=source.filter(item=>(item.nameUz??item.name).toLowerCase().includes(state.picker.query.toLowerCase()));
  if(!rows.length) return `<div class="empty" style="min-height:180px"><h3>Natija topilmadi</h3><p>Boshqa nom bilan qidiring yoki manbani almashtiring.</p></div>`;
  return rows.map(item=>`<label class="picker-row"><span class="mini-symbol ${state.picker.kind==='foods'?'meal':''}">${icon(state.picker.kind==='foods'?'apple':'dumbbell')}</span><span class="grow"><b>${escape(item.nameUz??item.name)}</b><small>${state.picker.kind==='exercises'?`${muscles[item.muscleGroup]} · ${equipment[item.equipmentType]}`:`${item.servingSizeGrams} g · ${item.caloriesPerServing} kcal`}</small></span><input type="checkbox" value="${item.id}" data-select="${item.id}" aria-label="${escape(item.nameUz??item.name)}ni tanlash" ${state.picker.selected.has(item.id)?'checked':''}></label>`).join('');
}
