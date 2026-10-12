import {icon} from '../ui.js';

const params=new URLSearchParams(location.search);
const pick=(key,allowed,fallback)=>allowed.includes(params.get(key))?params.get(key):fallback;
const state={
  tab:pick('tab',['weight','workouts','nutrition'],'weight'),
  scenario:pick('scenario',['data','empty','error'],'data'),
  theme:pick('theme',['light','dark'],'light'),
  period:'',
  day:params.get('day')??'2026-10-09',
  dayOpen:params.get('open')==='1',
  status:'',
};
state.period=pick('period',['7','14','30','custom'],state.tab==='workouts'?'14':'7');

const months=['yan','fev','mar','apr','may','iyn','iyl','avg','sen','okt','noy','dek'];
const weekdays=['Du','Se','Ch','Pa','Ju','Sh','Ya'];
const weekdayNames=['Dushanba','Seshanba','Chorshanba','Payshanba','Juma','Shanba','Yakshanba'];
const day=value=>`${Number(value.slice(8,10))} ${months[Number(value.slice(5,7))-1]}`;
const weekdayOf=value=>(new Date(`${value}T00:00:00Z`).getUTCDay()+6)%7;
const number=value=>value.toLocaleString('uz-UZ');
const signed=(value,digits=1)=>`${value>0?'+':value<0?'−':''}${Math.abs(value).toFixed(digits)}`;

const client={firstName:'Aziz',lastName:'Demo',goal:'Vazn kamaytirish',currentWeightKg:82.4,targetWeightKg:76,heightCm:178,goalTargetDate:'2026-12-01',subscribedOnUtc:'2026-10-01',subscriptionEndsOnUtc:'2026-11-01'};
const weights=[['2026-10-01',84.2,null],['2026-10-02',84.0,null],['2026-10-03',83.7,'Ertalab, och qoringa'],['2026-10-04',83.9,null],['2026-10-05',83.5,null],['2026-10-06',83.2,null],['2026-10-07',82.8,'Mashg‘ulotdan keyin'],['2026-10-08',82.6,null],['2026-10-09',82.4,null]].map(([loggedDate,weightKg,note],index)=>({id:`w${index}`,loggedDate,weightKg,note}));
const adherence={fromDate:'2026-09-28',toDate:'2026-10-11',scheduledDays:10,completedDays:8,missedDays:2,restDays:4,adherencePercent:80,days:['done','done','rest','done','missed','done','rest','done','done','rest','missed','done','done','rest'].map((kind,index)=>({date:new Date(Date.UTC(2026,8,28+index)).toISOString().slice(0,10),isRestDay:kind==='rest',isMissed:kind==='missed'}))};
const sessionStatuses={1:['Davom etmoqda','blue'],2:['Bajarilgan','live'],3:['Tashlab ketilgan','draft']};
const sessions={totalCount:23,items:[['Yuqori tana','2026-10-10T07:12',2,58,6,18,4260,412],['Oyoqlar va qorin','2026-10-09T18:40',2,64,7,21,6120,468],['To‘liq tana','2026-10-07T07:05',2,52,6,17,3980,377],['Yuqori tana','2026-10-06T07:20',3,19,6,5,1140,121],['Oyoqlar va qorin','2026-10-05T18:31',2,61,7,20,5890,451],['To‘liq tana','2026-10-03T08:02',2,55,6,18,4105,390],['Yuqori tana','2026-10-01T07:15',2,57,6,18,4190,405],['Oyoqlar va qorin','2026-09-30T18:44',2,60,7,20,5760,446]].map(([planDayTitle,startedOnUtc,status,durationMinutes,exerciseCount,completedSetCount,totalVolumeKg,estimatedCaloriesBurned],index)=>({id:`s${index}`,planDayTitle,startedOnUtc,status,durationMinutes,exerciseCount,completedSetCount,totalVolumeKg,estimatedCaloriesBurned}))};
const nutrition=[['2026-10-09',1984,2100,132,140,198,230,58,65,4],['2026-10-08',2330,2100,121,140,262,230,81,65,5],['2026-10-07',1756,2100,104,140,187,230,52,65,3],['2026-10-06',2045,2100,138,140,214,230,63,65,4],['2026-10-05',0,2100,0,140,0,230,0,65,0],['2026-10-04',1890,0,118,0,201,0,60,0,4],['2026-10-03',2012,2100,129,140,221,230,61,65,4]].map(([date,consumedCalories,targetCalories,proteinGrams,targetProteinGrams,carbsGrams,targetCarbsGrams,fatGrams,targetFatGrams,mealsLogged])=>({date,consumedCalories,targetCalories,proteinGrams,targetProteinGrams,carbsGrams,targetCarbsGrams,fatGrams,targetFatGrams,mealsLogged}));
const mealTypes={1:'Nonushta',2:'Tushlik',3:'Kechki ovqat',4:'Yengil ovqat'};
const foodLogs=[['Suli yormasi',1,60,233,10.1,39.8,4.1],['Banan',1,120,107,1.3,27.4,0.4],['Tovuq ko‘kragi',2,180,297,55.8,0,6.5],['Guruch',2,200,260,5.4,56,0.6],['Olma',4,150,78,0.4,20.7,0.3],['Olma',4,150,78,0.4,20.7,0.3],['Baliq (losos)',3,160,333,32.6,0,21.4],['Sabzavotli salat',3,220,598,26,53.4,24.4]].map(([foodNameUz,mealType,quantityGrams,calories,proteinGrams,carbsGrams,fatGrams],index)=>({id:`l${index}`,foodNameUz,mealType,quantityGrams,calories,proteinGrams,carbsGrams,fatGrams}));

function href(values) {
  const next={tab:state.tab,scenario:state.scenario,theme:state.theme,period:values.tab&&values.tab!==state.tab?'':state.period,...values};
  return `?${new URLSearchParams(Object.entries(next).filter(([,value])=>value!==''&&value!==false&&value!==undefined)).toString()}`;
}

function periodControl() {
  const options=[['7','7 kun'],['14','14 kun'],['30','30 kun'],['custom','Boshqa']];
  const custom=state.period==='custom'?`<div class="period-custom"><label>dan<input type="date" value="2026-10-01"></label><label>gacha<input type="date" value="2026-10-09"></label></div>`:'';
  return `<div class="period"><div class="segmented" role="group" aria-label="Hisobot davri">${options.map(([key,label])=>`<a href="${href({period:key})}" class="${state.period===key?'active':''}" aria-pressed="${state.period===key}">${label}</a>`).join('')}</div>${custom}</div>`;
}

function blockState(title,text,glyph) {
  if(state.scenario==='error') return `<div class="block-state" role="alert"><span class="state-icon error">${icon('info')}</span><h3>${title} yuklanmadi</h3><p>Qolgan bloklar ochiq. Faqat shu qismni qayta yuklash mumkin.</p><a class="btn" href="${href({scenario:'data'})}">${icon('refresh')}Qayta urinish</a></div>`;
  if(state.scenario==='empty') return `<div class="block-state"><span class="state-icon">${icon(glyph)}</span><h3>${text[0]}</h3><p>${text[1]}</p></div>`;
  return '';
}

function weightChart(points,target) {
  const compact=matchMedia('(max-width:700px)').matches;
  const width=compact?360:900,height=compact?210:260,left=compact?34:44,right=width-(compact?18:24),bottom=height-34,top=14;
  const values=points.map(point=>point.weightKg);
  const lo=Math.floor(Math.min(...values)-.5),hi=Math.ceil(Math.max(...values)+.5);
  const x=index=>left+index*(right-left)/(points.length-1),y=value=>bottom-(value-lo)/(hi-lo)*(bottom-top);
  const steps=hi-lo;
  const grid=Array.from({length:steps+1},(_,index)=>{const value=lo+index;return `<line class="grid" x1="${left}" y1="${y(value)}" x2="${right}" y2="${y(value)}"/><text x="0" y="${y(value)+4}">${value.toFixed(0)}</text>`;}).join('');
  const line=points.map((point,index)=>`${x(index)},${y(point.weightKg)}`).join(' ');
  const every=compact?2:1;
  const labels=points.map((point,index)=>index%every===0?`<text class="x" x="${x(index)}" y="${height-8}" text-anchor="middle">${day(point.loggedDate)}</text>`:'').join('');
  const inRange=target>=lo&&target<=hi;
  const goal=inRange?`<line class="target" x1="${left}" y1="${y(target)}" x2="${right}" y2="${y(target)}"/><text class="target-label" x="${right}" y="${y(target)-7}" text-anchor="end">Maqsad ${target} kg</text>`:`<text class="target-label" x="${right}" y="${bottom-8}" text-anchor="end">↓ Maqsad ${target} kg</text>`;
  return `<svg class="chart weight-chart" viewBox="0 0 ${width} ${height}" role="img" aria-label="Vazn ${values[0]} kg dan ${values.at(-1)} kg gacha o‘zgardi. Maqsad ${target} kg.">${grid}<polygon class="area" points="${left},${bottom} ${line} ${right},${bottom}"/><polyline points="${line}"/>${points.map((point,index)=>`<circle cx="${x(index)}" cy="${y(point.weightKg)}" r="${index===points.length-1?5:3.5}"/>`).join('')}${goal}${labels}</svg>`;
}

function weightTab() {
  const first=weights[0].weightKg,last=weights.at(-1).weightKg,change=last-first;
  const remaining=client.currentWeightKg-client.targetWeightKg;
  const rows=weights.map((point,index)=>({point,previous:weights[index-1]})).reverse().slice(0,5).map(({point,previous})=>{const delta=previous?point.weightKg-previous.weightKg:0;return `<tr><td>${day(point.loggedDate)}<small>${weekdayNames[weekdayOf(point.loggedDate)]}</small></td><td><b>${point.weightKg.toFixed(1)} kg</b></td><td><span class="delta ${delta<0?'down':delta>0?'up':''}">${previous?`${signed(delta)} kg`:'—'}</span></td><td class="note">${point.note??'—'}</td></tr>`;}).join('');
  const body=blockState('Vazn tarixi',['Vazn tarixi hali yo‘q','Mijoz vaznini kiritganida grafik va yozuvlar shu yerda ko‘rinadi.'],'clock')||`${weightChart(weights,client.targetWeightKg)}<div class="stat-row"><div><span>Davr boshi</span><b>${first.toFixed(1)} kg</b></div><div><span>Davr oxiri</span><b>${last.toFixed(1)} kg</b></div><div><span>O‘zgarish</span><b class="delta ${change<0?'down':'up'}">${signed(change)} kg</b></div><div><span>Yozuvlar</span><b>${weights.length} ta</b></div></div><h3 class="sub-title">So‘nggi yozuvlar</h3><table class="table report-table"><thead><tr><th scope="col">Sana</th><th scope="col">Vazn</th><th scope="col">O‘zgarish</th><th scope="col">Izoh</th></tr></thead><tbody>${rows}</tbody></table>`;
  return `<div class="report-layout"><section class="surface"><header class="card-head"><div><h2>Vazn o‘zgarishi</h2><p class="small">1–9 okt, 2026</p></div>${periodControl()}</header><div class="card-body">${body}</div></section><aside class="surface weight-summary"><h3>Hozirgi vazn</h3><div class="weight-value">${client.currentWeightKg} <small>kg</small></div><p class="small">Profil bo‘yicha</p><div class="goal-box"><span>Maqsadgacha qoldi</span><b>${remaining.toFixed(1)} kg</b></div><div class="section-divider"><div class="fact-pair"><span>Maqsad vazn</span><b>${client.targetWeightKg} kg</b></div><div class="fact-pair"><span>Maqsad sanasi</span><b>${day(client.goalTargetDate)}, 2026</b></div><div class="fact-pair"><span>Bo‘y</span><b>${client.heightCm} sm</b></div><div class="fact-pair"><span>Obuna boshlangan</span><b>${day(client.subscribedOnUtc)}, 2026</b></div></div></aside></div>`;
}

function calendar() {
  const cells=adherence.days.map(item=>{const kind=item.isRestDay?'rest':item.isMissed?'missed':'done';const label={done:'Bajarilgan',missed:'Qoldirilgan',rest:'Dam olish'}[kind];return `<div class="cal-day ${kind}" title="${day(item.date)} · ${label}"><span>${Number(item.date.slice(8,10))}</span>${icon(kind==='done'?'check':kind==='missed'?'close':'clock')}<small>${label}</small></div>`;}).join('');
  return `<div class="cal-head">${weekdays.map(name=>`<span>${name}</span>`).join('')}</div><div class="cal-grid">${cells}</div><div class="legend"><span class="done">Bajarilgan</span><span class="missed">Qoldirilgan</span><span class="rest">Dam olish</span></div>`;
}

function sessionsBlock() {
  const empty=blockState('Seanslar',['Bu davrda seans yo‘q','Davr yoki holat filtrini o‘zgartirib ko‘ring.'],'calendar');
  if(empty) return empty;
  const rows=sessions.items.map(item=>{const [label,tone]=sessionStatuses[item.status];return `<tr><td><b>${item.planDayTitle}</b><small>${day(item.startedOnUtc)} · ${item.startedOnUtc.slice(11,16)}</small></td><td><span class="pill ${tone}">${label}</span></td><td>${item.durationMinutes} daq</td><td>${item.exerciseCount} mashq · ${item.completedSetCount} set</td><td>${number(item.totalVolumeKg)} kg</td><td>${item.estimatedCaloriesBurned} kcal</td></tr>`;}).join('');
  const cards=sessions.items.map(item=>{const [label,tone]=sessionStatuses[item.status];return `<article class="session-card"><header><div><b>${item.planDayTitle}</b><small>${day(item.startedOnUtc)} · ${item.startedOnUtc.slice(11,16)}</small></div><span class="pill ${tone}">${label}</span></header><dl><div><dt>Davomiylik</dt><dd>${item.durationMinutes} daq</dd></div><div><dt>Setlar</dt><dd>${item.completedSetCount}</dd></div><div><dt>Hajm</dt><dd>${number(item.totalVolumeKg)} kg</dd></div><div><dt>Kcal</dt><dd>${item.estimatedCaloriesBurned}</dd></div></dl></article>`;}).join('');
  return `<table class="table report-table sessions-table"><thead><tr><th scope="col">Mashg‘ulot</th><th scope="col">Holat</th><th scope="col">Davomiylik</th><th scope="col">Bajarilgan</th><th scope="col">Hajm</th><th scope="col">Sarflangan</th></tr></thead><tbody>${rows}</tbody></table><div class="session-cards">${cards}</div><footer class="list-foot"><span class="small">${sessions.totalCount} tadan ${sessions.items.length} tasi ko‘rsatilgan</span><button class="btn">${icon('down')}Yana yuklash</button></footer>`;
}

function workoutsTab() {
  const adherenceBody=blockState('Rejaga amal qilish',['Reja ma’lumoti hali yo‘q','Mijozga dastur biriktirilgach, kunlar shu yerda ko‘rinadi.'],'calendar');
  const kpis=adherenceBody?'':`<div class="kpi-strip"><div class="kpi main"><span>Bajarilish</span><b>${adherence.adherencePercent}<small>%</small></b><div class="progress"><span style="width:${adherence.adherencePercent}%"></span></div></div><div class="kpi"><span>Bajarilgan</span><b>${adherence.completedDays}<small> / ${adherence.scheduledDays} kun</small></b></div><div class="kpi"><span>Qoldirilgan</span><b class="warn">${adherence.missedDays}<small> kun</small></b></div><div class="kpi"><span>Dam olish</span><b>${adherence.restDays}<small> kun</small></b></div></div>`;
  return `<section class="surface report-block"><header class="card-head"><div><h2>Rejaga amal qilish</h2><p class="small">28 sen – 11 okt, 2026</p></div>${periodControl()}</header>${adherenceBody||`${kpis}<div class="card-body">${calendar()}</div>`}</section><section class="surface report-block"><header class="card-head"><div><h2>Seanslar</h2><p class="small">Mijoz boshlagan mashg‘ulotlar</p></div><select class="filter-select" aria-label="Seans holati"><option value="">Barcha holatlar</option><option>Bajarilgan</option><option>Davom etmoqda</option><option>Tashlab ketilgan</option></select></header>${sessionsBlock()}</section>`;
}

function intake(consumed,target,unit) {
  if(target<=0) return {text:`${number(consumed)} ${unit}`,note:'Maqsad belgilanmagan',width:0,over:false};
  const over=consumed>target;
  return {text:`${number(consumed)} / ${number(target)} ${unit}`,note:over?`+${number(consumed-target)} ${unit} ortiq`:`${Math.round(consumed/target*100)}%`,width:Math.min(100,consumed/target*100),over};
}

function meter(consumed,target,unit) {
  const value=intake(consumed,target,unit);
  return `<div class="meter ${value.over?'over':''} ${target<=0?'no-target':''}"><span style="width:${value.width}%"></span></div>`;
}

function nutritionDays() {
  return nutrition.map(item=>{const value=intake(item.consumedCalories,item.targetCalories,'kcal');const logged=item.mealsLogged>0;return `<a class="nutri-day ${item.date===state.day?'active':''}" href="${href({day:item.date,open:'1'})}" aria-current="${item.date===state.day}"><span class="nutri-date"><b>${day(item.date)}</b><small>${weekdayNames[weekdayOf(item.date)]}</small></span><span class="nutri-main">${logged?`<b>${value.text}</b>${meter(item.consumedCalories,item.targetCalories,'kcal')}<small>O ${item.proteinGrams} · U ${item.carbsGrams} · Y ${item.fatGrams} g</small>`:'<span class="small">Yozuv yo‘q</span>'}</span><span class="nutri-side">${logged?`<span class="${value.over?'over-text':'small'}">${value.note}</span><small>${item.mealsLogged} ta ovqatlanish</small>`:''}</span>${icon('chevron')}</a>`;}).join('');
}

function diary() {
  const selected=nutrition.find(item=>item.date===state.day)??nutrition[0];
  const head=`<header class="card-head diary-head"><a class="mobile-back-link" href="${href({day:selected.date})}">${icon('left')}Kunlar</a><div><h2>Kundalik · ${day(selected.date)}</h2><p class="small">${weekdayNames[weekdayOf(selected.date)]} · ${selected.mealsLogged} ta ovqatlanish</p></div></header>`;
  if(state.scenario==='error') return `${head}${blockState('Kundalik',[],'apple')}`;
  if(selected.mealsLogged===0) return `${head}<div class="block-state"><span class="state-icon">${icon('apple')}</span><h3>Bu kunda yozuv yo‘q</h3><p>Mijoz shu kun uchun ovqat kiritmagan.</p></div>`;
  const kcal=intake(selected.consumedCalories,selected.targetCalories,'kcal');
  const macros=[['Oqsil','proteinGrams','targetProteinGrams','protein'],['Uglevod','carbsGrams','targetCarbsGrams','carbs'],['Yog‘','fatGrams','targetFatGrams','fat']].map(([label,key,target,tone])=>{const value=intake(selected[key],selected[target],'g');return `<div class="macro ${tone}"><span>${label}</span><b>${value.text}</b>${meter(selected[key],selected[target],'g')}</div>`;}).join('');
  const groups=Object.entries(mealTypes).map(([type,label])=>{const logs=foodLogs.filter(log=>log.mealType===Number(type));if(!logs.length) return '';return `<section class="diary-group"><h3>${label}<small>${logs.reduce((sum,log)=>sum+log.calories,0)} kcal</small></h3>${logs.map(log=>`<div class="diary-row"><span><b>${log.foodNameUz}</b><small>O ${log.proteinGrams} · U ${log.carbsGrams} · Y ${log.fatGrams} g</small></span><span class="qty">${log.quantityGrams} g</span><b class="kcal">${log.calories} kcal</b></div>`).join('')}</section>`;}).join('');
  return `${head}<div class="diary-total"><div class="weight-value">${number(selected.consumedCalories)} <small>${selected.targetCalories>0?`/ ${number(selected.targetCalories)} kcal`:'kcal'}</small></div><p class="${kcal.over?'over-text':'small'}">${kcal.note}</p>${meter(selected.consumedCalories,selected.targetCalories,'kcal')}<div class="macros">${macros}</div></div>${groups}`;
}

function nutritionTab() {
  const empty=blockState('Ovqatlanish hisoboti',['Ovqatlanish hisoboti hali yo‘q','Mijoz kundalikni to‘ldirganda kunlar shu yerda paydo bo‘ladi.'],'apple');
  const logged=nutrition.filter(item=>item.mealsLogged>0);
  const average=key=>Math.round(logged.reduce((sum,item)=>sum+item[key],0)/logged.length);
  const summary=`<div class="kpi-strip"><div class="kpi"><span>O‘rtacha iste’mol</span><b>${number(average('consumedCalories'))}<small> kcal</small></b></div><div class="kpi"><span>Kundalik yuritilgan</span><b>${logged.length}<small> / ${nutrition.length} kun</small></b></div><div class="kpi"><span>O‘rtacha oqsil</span><b>${average('proteinGrams')}<small> g</small></b></div><div class="kpi"><span>Maqsaddan oshgan</span><b class="warn">${nutrition.filter(item=>item.targetCalories>0&&item.consumedCalories>item.targetCalories).length}<small> kun</small></b></div></div>`;
  const list=`<section class="surface nutri-list"><header class="card-head"><div><h2>Kunlar</h2><p class="small">3–9 okt, 2026</p></div>${periodControl()}</header>${empty||`${summary}<div class="nutri-days">${nutritionDays()}</div>`}</section>`;
  return `<div class="nutri-layout ${state.dayOpen?'day-open':''}">${list}<section class="surface diary">${state.scenario==='empty'?`<header class="card-head"><div><h2>Kundalik</h2></div></header><div class="block-state"><span class="state-icon">${icon('apple')}</span><h3>Kun tanlanmagan</h3><p>Hisobotda kun paydo bo‘lgach, uning kundaligi shu yerda ochiladi.</p></div>`:diary()}</section></div>`;
}

function shell(content) {
  const nav=[['Dasturlar','calendar',false],['Mijozlar','users',true],['Kontent','folder',false],['Profil','user',false]];
  const links=mobile=>nav.map(([label,glyph,active])=>`<a href="./?screen=${glyph==='users'?'clients':'programs'}" class="${mobile?'':'rail-link '}${active?'active':''}">${icon(glyph)}<span>${label}</span></a>`).join('');
  return `<aside class="rail"><a class="rail-brand" href="./" aria-label="Tofan Coach"><img src="../logo.svg" alt=""><span>TOFAN</span></a><nav aria-label="Asosiy bo‘limlar">${links(false)}</nav><div class="rail-foot"><span class="avatar">TD</span></div></aside><div class="workspace"><header class="topbar"><a class="top-brand" href="./"><img src="../logo.svg" alt=""><span><strong>Tofan Coach</strong><small>Trener ish maydoni</small></span></a><div class="top-actions"><span class="pill blue">Dizayn prototipi</span><span class="locale">UZ</span><span class="separator"></span><span class="profile-trigger"><span><b>Trener Demo</b><small>Namuna profil</small></span><i class="avatar">TD</i></span></div></header><main id="main">${content}</main></div><nav class="mobile-nav" aria-label="Asosiy bo‘limlar">${links(true)}</nav>`;
}

function page() {
  const tabs=[['weight','Vazn'],['workouts','Mashg‘ulot'],['nutrition','Ovqatlanish']];
  const body={weight:weightTab,workouts:workoutsTab,nutrition:nutritionTab}[state.tab]();
  return `<div class="breadcrumb"><a href="./?screen=clients">Mijozlar</a>${icon('chevron')}<b>Shaxsiy hisobot</b></div><div class="client-profile-head"><span class="avatar sky">AD</span><div><h1>${client.firstName} ${client.lastName}</h1><p>${client.goal} · Obuna ${day(client.subscriptionEndsOnUtc)}, 2026 gacha</p></div><span class="pill blue">Faol obuna</span></div><div class="tabs report-tabs">${tabs.map(([key,label])=>`<a class="tab ${state.tab===key?'active':''}" href="${href({tab:key})}" aria-current="${state.tab===key}">${label}</a>`).join('')}</div>${body}`;
}

function review() {
  const group=(label,key,options)=>`<div><span>${label}</span>${options.map(([value,text])=>`<a href="${href({[key]:value})}" class="${state[key]===value?'active':''}">${text}</a>`).join('')}</div>`;
  return `<b>Prototip holati</b>${group('Holat','scenario',[['data','Ma’lumot bor'],['empty','Bo‘sh'],['error','Xato']])}${group('Mavzu','theme',[['light','Yorug‘'],['dark','Qorong‘i']])}`;
}

document.documentElement.dataset.theme=state.theme;
document.getElementById('app').innerHTML=shell(page());
document.getElementById('review').innerHTML=review();
