# Tofan UI/UX audit va redesign konseptlari

2026-10-09. Savol: Tofan admin va coach panellariga qaysi zamonaviy, professional, minimal yo‘nalish mos?

Uchta mustaqil vizual yo‘nalish bir xil ekranlar va namuna ma’lumotlari bilan taqqoslanadi. Bu tanlash uchun lokal interaktiv prototip; Angular ilovalari tahrirlanmagan. Foydalanuvchi alohida prototiplarni tayyorlashni tasdiqlagan.

## Hozirgi holat

Mavjud UI auditida Angular shablonlari, CSS, umumiy komponentlar va navigatsiya ko‘rildi. Ishlayotgan ilova yoki autentifikatsiyalangan jonli ekran tekshirilmagan. Quyidagi xulosalar koddan ko‘rinadigan tuzilish va uslublarga asoslangan; foydalanuvchi tadqiqoti yoki real foydalanuvchi sinovi natijasi emas.

| Topilma | Dalil | Taklif |
| --- | --- | --- |
| Admin va coach vizual tili turlicha | Admin `apps/admin/src/styles/layout/core.css` ichida JetBrains Mono, 14px va 1.2 line-height; coach `apps/coach/src/styles.css` ichida system sans-serif va 1.5 line-height | Umumiy sans-serif tipografiya, bir xil sarlavha va matn rollari |
| Admin navigatsiyasi kontent joyini kamaytiradi | `apps/admin/src/styles/layout/menu.css`: 20rem sidebar va tashqi oraliqlar; `responsive.css`: 22rem chap margin | A: 232px, B: 210px sidebar. C: bo‘limlar yuqorida |
| Dashboard ishni boshlashga yordam bermaydi | `dashboard-page.html`: faqat salomlashuv kartasi | Mavjud bo‘limlarga tezkor o‘tish. Tasdiqlanmagan analytics ko‘rsatkichlarini qo‘shmaslik |
| Filtrlar yuqori qismini band qiladi | `exercise-filters.html`: qidiruv, mushak, jihoz, jins, joy va faollik bir qatorda wrap qiladi | Qidiruv va holat doim ko‘rinadi; boshqa filtrlar alohida ochiladi |
| Qator amallari vizual raqobat yaratadi | `exercises-page.html`: tahrirlash, faollik va o‘chirish; `garments-page.html`: bir nechta holat amali | Asosiy ochish/tahrirlash ko‘rinadi; ikkilamchi va xavfli amallar menyuda |
| Login panellarida turli dizaynlar | Admin `login-page.html`: gradient chegara, 53px radius; coach: oddiy card | Umumiy brend va forma uslubi, panel turi aniq ko‘rsatiladi |
| Bo‘sh holatlar ko‘pincha yo‘nalish bermaydi | `libs/shared/src/components/data-table/data-table.html`: bo‘sh xabar matni | Qidiruvni tozalash, qayta urinish yoki ish maydoniga qaytish |

Saqlash kerak bo‘lgan kuchli jihatlar: umumiy server-paged table, umumiy form dialog, error uchun retry, uch tilga tarjima infratuzilmasi, coach mobil navigatsiyasi va responsive formalar.

## Uch yo‘nalish

| | A · Clarity | B · Precision | C · Studio |
| --- | --- | --- | --- |
| Asosiy maqsad | Muvozanat va ravshanlik | Ko‘p yozuv bilan tez ishlash | Yengil trener va kontent muhiti |
| Navigatsiya | Doimiy och sidebar | Ixcham to‘q sidebar | Yuqori bo‘limlar va ichki bo‘limlar |
| Tipografiya | Aptos / Segoe UI / system | Segoe UI / Helvetica Neue / Arial | Avenir Next / Aptos / Segoe UI |
| Asosiy rang | `#5054BD` | `#2366BA` | `#14796E` |
| Fon | `#F6F7F9` | `#EDF0F4` | `#F5F8F7` |
| Asosiy matn | `#202535` | `#223044` | `#263B37` |
| Ikkinchi darajali matn | `#626A7B` | `#616E80` | `#62736E` |
| Yengil aksent | `#EEEFFB` | `#EDF3FC` | `#E7F4EF` |
| Qator balandligi | 74px | 57px | 79px |
| Ko‘rib chiqiladigan trade-off | Sidebar uchun joy | Kichikroq matn, zichroq ekran | Vertikal joy va kengroq kartalar |

Fonts lokal tizimdan olinadi; tashqi font yoki rasm so‘rovlari yo‘q. Tofan mavjud SVG belgisi saqlangan. Kartalar va rasmlar real screenshotlardan iborat.

Dizayner tavsiyasi: universal boshlanish uchun A. Admin zichligi asosiy mezon bo‘lsa B, coach tajribasi asosiy mezon bo‘lsa C. Bu professional dizayn fikri, o‘lchangan usability natijasi emas. Yakuniy yo‘nalishni foydalanuvchi tanlaydi.

## Ekranlar qamrovi

| Panel | Prototipdagi ekranlar |
| --- | --- |
| Admin | Boshqaruv paneli, mashqlar, ovqatlar, media, Soldierlar, hisoblar, kirishlar jurnali, trenerlar, trener obunalari, NFC futbolkalar, bildirishnoma shablonlari, push formasi |
| Tafsilotlar | Hisob/Soldier profili, NFC mahsulot tafsilotlari, media ko‘rish oynasi |
| Coach | Dasturlar, mashg‘ulot muharriri, ovqatlanish muharriri, mijozlar, mijoz tafsilotlari, kontent katalogi, profil |
| Umumiy | Admin va coach login, bo‘sh natija, yuklanish, xato/retry, ruxsat yo‘q, 404, trener kartasi yo‘q |
| Form patternlar | Mashq va uch tildagi nom, ovqat va oziq qiymatlari, media tanlash, trener kartasi, obuna, NFC futbolka, bildirishnoma shabloni, yangi dastur, xabar ko‘rish va o‘chirish/nashr tasdiqlashi |

## Tekshirish

- Desktop: 1440px kenglikda uch variant bo‘yicha 66 ekran kombinatsiyasi ochildi; barcha tekshirilgan sahifalarda sarlavha bor va sahifa bo‘ylab gorizontal overflow yo‘q.
- Mobil: 390 × 844 o‘lchamda shu 66 kombinatsiya tekshirildi; sahifa bo‘ylab gorizontal overflow yo‘q. Bo‘lim tabs alohida gorizontal surilishi mumkin.
- 19 ta asosiy interaksiya tekshiruvi: qidiruv, bo‘sh natija, nofaol tab, paging, mushak filtri, forma ochilishi, bo‘sh nom validatsiyasi, fokus tiklanishi, yozuv qo‘shish, amallar menyusi, o‘chirish tasdiqlashi, yozuv o‘chirish, dastur muharriri, qiymatning kunlar o‘rtasida saqlanishi, tanlangan mashq qo‘shilishi, olib tashlashning saqlanishi, ovqat rejasi maydonlari, ovqat rejasi yaratish va Escape.
- Uch variantning asosiy matn, muted matn, primary tugma va status rang juftliklari hisoblandi: barchasi kamida 4.5:1.
- Lighthouse snapshot: C coach dasturlari desktop — Accessibility 100, Best Practices 100. C admin katalogi mobil — Accessibility 100, Best Practices 100. Bu ko‘rsatilgan ekranlar uchun avtomatik natija; butun tizim WCAG sertifikati emas.
- Brauzerda tekshirilgan jarayonlarda console error/warning qayd etilmadi.
- JavaScript modullari syntax checkdan o‘tdi. Asosiy Angular kodi o‘zgarmagani uchun Angular build/test natijasi sifatida ko‘rsatilmaydi.
- Har bir variant uchun admin, coach, login va mobil screenshot ko‘rib chiqildi va galereyaga joylandi.

Vizual tekshiruv natijasida C yuqori navigatsiyasi guruhlandi, mobil jadvallar kartalarga almashtirildi, ovqat kartasidagi mayda matn kontrasti va brend havolasining accessible name mosligi tuzatildi.

## Chegaralar va keyingi bosqich

Namuna ma’lumotlari va o‘zgarishlar brauzer xotirasida. Yangilanganda dastlabki holat qaytadi. Login autentifikatsiya qilmaydi, yuborish xabar jo‘natmaydi, fayl tanlash upload qilmaydi. Backend, real hisoblar va maxfiy ma’lumotlar ishlatilmagan.

Bu to‘liq backend integratsiyasi yoki barcha entity holatlarini nusxalash emas; dizayn yo‘nalishi va takrorlanadigan UI/UX patternlarni tanlash uchun qamrov. Uch tilga yoziladigan nom formasi ko‘rsatilgan, ammo prototip interfeysi o‘zbekcha. RU/EN, dark mode, real ma’lumotning juda uzun qiymatlari va barcha backend xatolari tanlangan dizaynning Angular implementatsiyasi bosqichida tekshiriladi.

Tanlovdan keyin umumiy palette, spacing, typography va radius Optimus UI theme tokenlariga ko‘chiriladi. Keyin shared table/form va shell, undan so‘ng feature ekranlari kichik, reviewable o‘zgarishlar bilan moslashtiriladi. Mavjud server paging, store/service yo‘nalishi, backend avtorizatsiyasi va domain qoidalari saqlanadi. Angularga qo‘llashda talab qilingan lint, admin/coach tests va builds alohida bajariladi. Rollback: har bir kichik UI diffni qaytarish; API va ma’lumot migratsiyasi kerak emas.

## Ishga tushirish

Repo ildizidan:

```sh
python3 -m http.server 4780 --bind 127.0.0.1 --directory .scratch/redesign-prototype
```

Galereya: `http://127.0.0.1:4780/compare.html`.

Variant: `http://127.0.0.1:4780/?variant=A&app=admin&screen=exercises` (`A`, `B`, `C`).

Coach: `http://127.0.0.1:4780/?variant=C&app=coach&screen=programs`.

Pastdagi switcher orqali variant/panel almashtiriladi. Chap/o‘ng klaviatura strelkalari variantni aylantiradi; matn maydonida bu shortcut ishlamaydi. Mobil ko‘rinish oynani kichraytirish orqali tekshiriladi. Galereyadagi “Mobil ko‘rinish” real 390px screenshotlarni ko‘rsatadi.
