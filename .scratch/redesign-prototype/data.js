export const variants = {
  A: { name: 'Clarity', description: 'Sokin, ravshan va tartibli', color: '#5054bd' },
  B: { name: 'Precision', description: 'Ixcham va ishga yo‘naltirilgan', color: '#2366ba' },
  C: { name: 'Studio', description: 'Yengil va keng ish maydoni', color: '#14796e' },
};

export const adminNav = [
  { group: 'Ish maydoni', links: [['dashboard', 'Boshqaruv paneli', 'home']] },
  { group: 'Katalog', links: [['exercises', 'Mashqlar', 'dumbbell'], ['foods', 'Ovqatlar', 'apple'], ['media', 'Media fayllar', 'image']] },
  { group: 'Foydalanuvchilar', links: [['soldiers', 'Soldierlar', 'users'], ['accounts', 'Hisoblar', 'card'], ['sessions', 'Kirishlar jurnali', 'clock']] },
  { group: 'Trenerlar va mahsulotlar', links: [['trainers', 'Trenerlar', 'award'], ['subscriptions', 'Trener obunalari', 'calendar'], ['garments', 'NFC futbolkalar', 'shirt']] },
  { group: 'Bildirishnomalar', links: [['templates', 'Shablonlar', 'file'], ['send', 'Push yuborish', 'send']] },
];

export const coachNav = [
  { group: 'Trener ish maydoni', links: [['programs', 'Dasturlar', 'calendar'], ['clients', 'Mijozlar', 'users'], ['content', 'Kontent', 'folder'], ['profile', 'Profil', 'user']] },
];

export const tables = {
  exercises: {
    title: 'Mashqlar katalogi', description: 'Mashqlarni tartibga keltiring va katalogni boshqaring.', noun: 'mashq', add: 'Mashq qo‘shish', icon: 'dumbbell', group: 'Katalog',
    columns: [['name','Mashq'],['muscle','Mushak guruhi'],['equipment','Jihoz'],['difficulty','Murakkablik'],['status','Holat']],
    rows: [
      { name: 'Shtanga bilan o‘tirib turish', sub: 'Barbell squat', muscle: 'Oyoqlar', equipment: 'Shtanga', difficulty: 'O‘rta', status: 'Faol', video: true, tone: 'blue' },
      { name: 'Gantel bilan ko‘krak pressi', sub: 'Dumbbell bench press', muscle: 'Ko‘krak', equipment: 'Gantel', difficulty: 'O‘rta', status: 'Faol', video: true, tone: 'sand' },
      { name: 'Turnikda tortilish', sub: 'Pull-up', muscle: 'Orqa', equipment: 'Tana vazni', difficulty: 'Qiyin', status: 'Faol', video: true, tone: 'mint' },
      { name: 'Planka', sub: 'Plank', muscle: 'Qorin', equipment: 'Tana vazni', difficulty: 'Oson', status: 'Faol', video: false, tone: 'blue' },
      { name: 'Gantel bilan yelka pressi', sub: 'Dumbbell shoulder press', muscle: 'Yelkalar', equipment: 'Gantel', difficulty: 'O‘rta', status: 'Faol', video: true, tone: 'sand' },
      { name: 'Bisepsni bukish', sub: 'Biceps curl', muscle: 'Qo‘llar', equipment: 'Gantel', difficulty: 'Oson', status: 'Nofaol', video: false, tone: 'mint' },
      { name: 'Yerdan ko‘tarilish', sub: 'Push-up', muscle: 'Ko‘krak', equipment: 'Tana vazni', difficulty: 'Oson', status: 'Faol', video: true, tone: 'blue' },
      { name: 'Shtangani tortish', sub: 'Deadlift', muscle: 'Orqa', equipment: 'Shtanga', difficulty: 'Qiyin', status: 'Faol', video: true, tone: 'sand' },
      { name: 'Yon planka', sub: 'Side plank', muscle: 'Qorin', equipment: 'Tana vazni', difficulty: 'O‘rta', status: 'Nofaol', video: false, tone: 'mint' },
    ],
  },
  foods: {
    title: 'Ovqatlar katalogi', description: 'Porsiya va oziq qiymatlarini bir joyda boshqaring.', noun: 'ovqat', add: 'Ovqat qo‘shish', icon: 'apple', group: 'Katalog',
    columns: [['name','Ovqat'],['serving','Porsiya'],['calories','Kaloriya'],['macros','Oqsil / uglevod / yog‘'],['status','Holat']],
    rows: [
      { name:'Tovuq ko‘kragi',sub:'Chicken breast',serving:'100 g',calories:'165 kcal',macros:'31 / 0 / 3.6 g',status:'Faol',tone:'sand' },
      { name:'Suli yormasi',sub:'Oatmeal',serving:'100 g',calories:'389 kcal',macros:'16.9 / 66.3 / 6.9 g',status:'Faol',tone:'mint' },
      { name:'Banan',sub:'Banana',serving:'100 g',calories:'89 kcal',macros:'1.1 / 22.8 / 0.3 g',status:'Faol',tone:'sand' },
      { name:'Yunon yogurti',sub:'Greek yogurt',serving:'100 g',calories:'59 kcal',macros:'10 / 3.6 / 0.4 g',status:'Faol',tone:'blue' },
      { name:'Jigarrang guruch',sub:'Brown rice',serving:'100 g',calories:'123 kcal',macros:'2.7 / 25.6 / 1 g',status:'Faol',tone:'sand' },
      { name:'Avokado',sub:'Avocado',serving:'100 g',calories:'160 kcal',macros:'2 / 8.5 / 14.7 g',status:'Nofaol',tone:'mint' },
    ],
  },
  media: {
    title:'Media fayllar',description:'Mashq videolari va rasmlarni boshqaring.',noun:'fayl',add:'Fayl yuklash',icon:'image',group:'Katalog',
    columns:[['name','Fayl'],['category','Kategoriya'],['size','Hajmi'],['date','Yuklangan sana']],
    rows:[
      {name:'squat-demo.mp4',sub:'video/mp4',category:'Mashq videosi',size:'12.4 MB',date:'08 okt, 2026',tone:'blue'},
      {name:'press-demo.mp4',sub:'video/mp4',category:'Mashq videosi',size:'8.7 MB',date:'07 okt, 2026',tone:'sand'},
      {name:'trainer-demo.webp',sub:'image/webp',category:'Trener rasmi',size:'248 KB',date:'07 okt, 2026',tone:'mint'},
      {name:'plank-demo.mp4',sub:'video/mp4',category:'Mashq videosi',size:'6.2 MB',date:'06 okt, 2026',tone:'blue'},
    ],
  },
  soldiers: {
    title:'Soldierlar',description:'Foydalanuvchi profillari va fitnes maqsadlarini ko‘ring.',noun:'soldier',icon:'users',group:'Foydalanuvchilar',
    columns:[['name','Soldier'],['goal','Maqsad'],['weight','Hozirgi vazn'],['target','Maqsad vazni'],['date','Ro‘yxatdan o‘tgan']],
    rows:[
      {name:'Aziz Demo',sub:'@aziz.demo',goal:'Vazn kamaytirish',weight:'82.4 kg',target:'76 kg',date:'01 okt, 2026',initials:'AD',tone:'sky'},
      {name:'Madina Demo',sub:'@madina.demo',goal:'Sog‘lom turmush',weight:'58.6 kg',target:'58 kg',date:'29 sen, 2026',initials:'MD',tone:'rose'},
      {name:'Jasur Demo',sub:'@jasur.demo',goal:'Mushak oshirish',weight:'74.2 kg',target:'80 kg',date:'27 sen, 2026',initials:'JD',tone:'sand'},
      {name:'Nodira Demo',sub:'@nodira.demo',goal:'Vazn kamaytirish',weight:'67.1 kg',target:'62 kg',date:'25 sen, 2026',initials:'ND',tone:'mint'},
    ],
  },
  accounts: {
    title:'Hisoblar',description:'Hisob holati, rollar va bog‘langan profillar.',noun:'hisob',icon:'card',group:'Foydalanuvchilar',
    columns:[['name','Hisob'],['email','Email'],['role','Rol'],['status','Holat'],['date','Yaratilgan sana']],
    rows:[
      {name:'Aziz Demo',sub:'@aziz.demo',email:'aziz@example.test',role:'Foydalanuvchi',status:'Faol',date:'01 okt, 2026',initials:'AD',tone:'sky'},
      {name:'Madina Demo',sub:'@madina.demo',email:'madina@example.test',role:'Foydalanuvchi',status:'Faol',date:'29 sen, 2026',initials:'MD',tone:'rose'},
      {name:'Trener Demo',sub:'@trener.demo',email:'trener@example.test',role:'Trener',status:'Faol',date:'25 sen, 2026',initials:'TD',tone:'mint'},
      {name:'Nodira Demo',sub:'@nodira.demo',email:'nodira@example.test',role:'Foydalanuvchi',status:'Bloklangan',date:'22 sen, 2026',initials:'ND',tone:'sand'},
    ],
  },
  sessions: {
    title:'Kirishlar jurnali',description:'Hisoblarga bog‘langan kirish seanslarini tekshiring.',noun:'seans',icon:'clock',group:'Foydalanuvchilar',
    columns:[['name','Hisob'],['date','Kirish vaqti'],['expires','Amal qilish muddati'],['status','Holat']],
    rows:[
      {name:'demo-user-01',sub:'Namuna hisob identifikatori',date:'09 okt, 09:42',expires:'09 okt, 21:42',status:'Faol'},
      {name:'demo-user-02',sub:'Namuna hisob identifikatori',date:'09 okt, 09:18',expires:'09 okt, 21:18',status:'Faol'},
      {name:'demo-user-03',sub:'Namuna hisob identifikatori',date:'08 okt, 18:24',expires:'09 okt, 06:24',status:'Tugagan'},
      {name:'demo-user-04',sub:'Namuna hisob identifikatori',date:'08 okt, 14:10',expires:'09 okt, 02:10',status:'Bekor qilingan'},
    ],
  },
  trainers: {
    title:'Trenerlar',description:'Trener kartalari va katalogdagi ko‘rinishni boshqaring.',noun:'trener',add:'Trener qo‘shish',icon:'award',group:'Trenerlar',
    columns:[['name','Trener'],['price','Oylik narx'],['status','Holat'],['date','Yaratilgan sana']],
    rows:[
      {name:'Trener Demo A',sub:'Kuch mashqlari va funksional trening',price:'300 000 so‘m',status:'Nashr qilingan',date:'01 okt, 2026',initials:'TA',tone:'sky'},
      {name:'Trener Demo B',sub:'Vazn boshqaruvi va ovqatlanish',price:'250 000 so‘m',status:'Nashr qilingan',date:'28 sen, 2026',initials:'TB',tone:'rose'},
      {name:'Trener Demo C',sub:'Uy sharoitida mashg‘ulotlar',price:'200 000 so‘m',status:'Qoralama',date:'26 sen, 2026',initials:'TC',tone:'mint'},
    ],
  },
  subscriptions: {
    title:'Trener obunalari',description:'Obuna muddati va foydalanuvchi bog‘lanishlarini ko‘ring.',noun:'obuna',add:'Obuna berish',icon:'calendar',group:'Trenerlar',
    columns:[['name','Trener'],['client','Foydalanuvchi'],['date','Boshlanish'],['expires','Tugash'],['status','Holat']],
    rows:[
      {name:'Trener Demo A',sub:'Namuna obuna',client:'demo-user-01',date:'01 okt, 2026',expires:'01 noy, 2026',status:'Faol',initials:'TA',tone:'sky'},
      {name:'Trener Demo B',sub:'Namuna obuna',client:'demo-user-02',date:'28 sen, 2026',expires:'28 okt, 2026',status:'Faol',initials:'TB',tone:'rose'},
      {name:'Trener Demo A',sub:'Namuna obuna',client:'demo-user-03',date:'01 sen, 2026',expires:'01 okt, 2026',status:'Tugagan',initials:'TA',tone:'sky'},
    ],
  },
  garments: {
    title:'NFC futbolkalar',description:'Mahsulot holati va faollashtirish muddatlarini boshqaring.',noun:'futbolka',add:'Futbolka qo‘shish',icon:'shirt',group:'Mahsulotlar',
    columns:[['name','Seriya raqami'],['model','Model / o‘lcham'],['date','Ishlab chiqarilgan'],['status','Holat'],['expires','Muddati']],
    rows:[
      {name:'DEMO-NFC-001',sub:'Namuna mahsulot',model:'Tofan Classic / M',date:'01 okt, 2026',status:'Faollashtirilgan',expires:'01 okt, 2027',tone:'blue'},
      {name:'DEMO-NFC-002',sub:'Namuna mahsulot',model:'Tofan Classic / L',date:'01 okt, 2026',status:'Yangi',expires:'—',tone:'sand'},
      {name:'DEMO-NFC-003',sub:'Namuna mahsulot',model:'Tofan Sport / XL',date:'28 sen, 2026',status:'Faollashtirilgan',expires:'28 sen, 2027',tone:'mint'},
      {name:'DEMO-NFC-004',sub:'Namuna mahsulot',model:'Tofan Sport / S',date:'25 sen, 2026',status:'Bloklangan',expires:'—',tone:'blue'},
    ],
  },
  templates: {
    title:'Bildirishnoma shablonlari',description:'Xabar matnlari, tillar va faollikni boshqaring.',noun:'shablon',add:'Shablon qo‘shish',icon:'file',group:'Bildirishnomalar',
    columns:[['name','Shablon'],['type','Tur'],['languages','Tillar'],['status','Holat'],['date','Yangilangan']],
    rows:[
      {name:'Mashg‘ulot vaqti',sub:'Bugungi rejangizni davom ettiring.',type:'Mashg‘ulot',languages:'UZ / RU / EN',status:'Faol',date:'08 okt, 2026',tone:'blue'},
      {name:'Ovqatlanish eslatmasi',sub:'Ovqatlanish kundaligini to‘ldiring.',type:'Ovqatlanish',languages:'UZ / RU / EN',status:'Faol',date:'07 okt, 2026',tone:'mint'},
      {name:'Xush kelibsiz',sub:'Tofan bilan ilk qadamni boshlang.',type:'Umumiy',languages:'UZ / RU / EN',status:'Nofaol',date:'06 okt, 2026',tone:'sand'},
    ],
  },
};

for (const table of Object.values(tables)) {
  table.rows.forEach((row, index) => { row.id = `${table.noun}-${index + 1}`; });
}

export const clients = [
  {name:'Aziz Demo',initials:'AD',tone:'sky',goal:'Vazn kamaytirish',weight:'82.4',target:'76',expires:'01 noy, 2026'},
  {name:'Madina Demo',initials:'MD',tone:'rose',goal:'Sog‘lom turmush',weight:'58.6',target:'58',expires:'28 okt, 2026'},
  {name:'Jasur Demo',initials:'JD',tone:'sand',goal:'Mushak oshirish',weight:'74.2',target:'80',expires:'04 noy, 2026'},
  {name:'Nodira Demo',initials:'ND',tone:'mint',goal:'Vazn kamaytirish',weight:'67.1',target:'62',expires:'25 okt, 2026'},
];

export const programs = [
  {id:'workout-1',name:'Kuch va muvozanat',type:'workout',status:'Nashr qilingan',meta:'3 kun',place:'Sport zalida'},
  {id:'workout-2',name:'Uyda faol harakat',type:'workout',status:'Qoralama',meta:'4 kun',place:'Uy sharoitida'},
  {id:'meal-1',name:'09–15 okt, 2026',type:'meal',status:'Nashr qilingan',meta:'Ovqatlanish rejasi',place:'7 kun'},
  {id:'meal-2',name:'16–22 okt, 2026',type:'meal',status:'Qoralama',meta:'Ovqatlanish rejasi',place:'7 kun'},
];

export const descriptions = {
  A:'Doimiy och sidebar, ravshan jadvallar va o‘ngdan ochiladigan formalar. Har kuni katalog bilan ishlash uchun.',
  B:'To‘q navigatsiya, qisqaroq qatorlar va tez skanerlash uchun zichroq ma’lumot. Ko‘p yozuvli admin jarayonlari uchun.',
  C:'Yuqori navigatsiya, keng tipografiya va kontekst paneli. Trener va mijoz bilan ishlash uchun yengilroq muhit.',
};
