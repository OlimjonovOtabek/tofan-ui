import { variants, descriptions } from './data.js';

const slugs={A:'clarity',B:'precision',C:'studio'};
const traits={
  A:['Doimiy och navigatsiya','Muvozanatli ma’lumot zichligi','Ravshan jadvallar va formalar'],
  B:['To‘q va ixcham navigatsiya','Zichroq qatorlar va ro‘yxatlar','Ishga yo‘naltirilgan tuzilma'],
  C:['Yuqori bo‘lim navigatsiyasi','Keng tipografiya va kontekst','Mobil kartalar va trener muhiti'],
};
const palettes={A:['#ffffff','#eeeffb','#5054bd'],B:['#172638','#edf0f4','#2366ba'],C:['#ffffff','#e7f4ef','#14796e']};
const viewUrls={admin:'app=admin&screen=exercises',coach:'app=coach&screen=programs',mobile:'app=admin&screen=exercises',login:'app=admin&screen=login'};

function render(view) {
  document.getElementById('variants').classList.toggle('mobile-view',view==='mobile');
  document.getElementById('variants').innerHTML=Object.entries(variants).map(([key,variant])=>{
    const url=`./?variant=${key}&${viewUrls[view]}`;
    const image=`./${slugs[key]}-${view}.png`;
    return `<article class="variant-card" style="--card-accent:${variant.color}"><header class="variant-card-header"><h2><span>${key}</span>${variant.name}</h2><span class="swatches" aria-hidden="true">${palettes[key].map(color=>`<i style="background:${color}"></i>`).join('')}</span></header><p class="variant-subtitle">${variant.description}</p><a class="screenshot" href="${url}" aria-label="${variant.name} prototipini ochish"><img src="${image}" alt="${variant.name} — ${view==='mobile'?'mobil':view==='coach'?'coach dasturlari':view==='login'?'kirish sahifasi':'admin katalogi'} dizayni"></a><div class="variant-card-body"><p class="variant-description">${descriptions[key]}</p><ul>${traits[key].map(text=>`<li>${text}</li>`).join('')}</ul><div class="variant-actions"><a href="${url}">Variantni sinash</a><a href="${image}" target="_blank" rel="noopener">Kattalashtirish</a></div></div></article>`;
  }).join('');
  for(const button of document.querySelectorAll('[data-view]')) {
    const active=button.dataset.view===view;
    button.classList.toggle('active',active);
    button.setAttribute('aria-pressed',String(active));
  }
}

document.querySelectorAll('[data-view]').forEach(button=>button.addEventListener('click',()=>render(button.dataset.view)));
render('admin');
