# 02 — Trener profili va avatar yuklash

**What to build:** Trener yangi dizayndagi profil ekranida ko‘rinadigan ism, tavsif, oylik narx va avatarni o‘zgartirib saqlaydi. Rasm yuklashning progress, xato, qayta urinish va chiqishda kutish yoki bekor qilish oqimi aniq ishlaydi. Shared upload oqimining bekor qilish imkoniyati shu avatar tajribasi ichida tayyorlanadi va video uchun qayta ishlatiladi.

**Blocked by:** 01 — Dasturlar ish maydoni va navigatsiya.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Profil haqiqiy coach profile response’idan o‘qiladi; loading, xato/retry va mavjud ma’lumot holatlari farqlanadi.
- [ ] Ism, ixtiyoriy bio, rasm identifikatori va musbat oylik narx mavjud update kontrakti bilan saqlanadi. Whitespace-only ism rad etiladi, bo‘sh bio amaldagi mapper qoidasi bo‘yicha `null`ga aylanadi.
- [ ] Profile update payload’iga `isPublished`, role yoki boshqa tekshirilmagan maydon kiritilmaydi. Nashr holati ko‘rsatiladi va uni administrator boshqarishi tushuntiriladi.
- [ ] Yangi forma Signal Forms va mavjud Optimus adapterlariga mos; touched/invalid/disabled holatlari aniq. Mavjud app modeli uchun qo‘shimcha business cheklovi o‘ylab topilmaydi.
- [ ] Avatar formati JPG/JPEG, PNG yoki WebP; 10 MB gacha, bo‘sh bo‘lmagan fayl. Noto‘g‘ri fayl HTTP boshlanishidan oldin tushunarli xabar bilan rad etiladi.
- [ ] Avatar kategoriyasi bilan haqiqiy file upload bajariladi. Progress ko‘rinadi; noma’lum total uchun soxta foiz ko‘rsatilmaydi. Yakunlanganda tekshirilgan response’dan file ID olinadi.
- [ ] Tanlangan/yuklangan rasm preview’i ishlaydi; vaqtinchalik object URL va boshqa resurslar tozalanadi. Rasm xatosida avatar fallback ko‘rinadi.
- [ ] Yuklash xatosida ism, bio, narx va oldingi saqlangan avatar yo‘qolmaydi. Retry yangi upload so‘rovini boshlaydi; resumable upload yoki kafolatlangan background upload va’da qilinmaydi.
- [ ] Yuklash davomida panel ichidan chiqishda trener kutish yoki yuklashni bekor qilib chiqishni tanlaydi. Bekor qilish amaldagi HTTP ishini to‘xtatadi, progress holatini tozalaydi va kech kelgan callback’lar qoralamani o‘zgartirmaydi.
- [ ] Shared upload’ga zarur cancellation imkoniyati mavjud caller’lar bilan mos qo‘shiladi. Cancel oddiy muvaffaqiyat yoki backend failure deb talqin qilinmaydi; admin upload xulqi regressiyaga uchramaydi.
- [ ] Bir xil profil save yoki upload ikki marta parallel boshlanmaydi. Saqlash xatosida qiymatlar qoladi; muvaffaqiyatdan so‘ng ko‘rsatilgan profil server natijasiga mos yangilanadi.
- [ ] Saqlanmagan profil o‘zgarishlari bilan ichki navigatsiyada discard tasdig‘i bor. Brauzer tomonidan boshqariladigan unload cheklovlari yashirilmaydi va mobil tab yopilishida saqlash kafolati berilmaydi.
- [ ] Coach Workspace v2 ko‘rinishi, lokal Manrope, light/dark va UZ/RU/EN qo‘llanadi; mobil forma bir ustunli, submit va upload amallari qulay touch targetlarga ega.

## Verification

- [ ] Profile mapper/store testlari read/update maydonlarini, musbat narxni, xatoda qoralama saqlanishini va `isPublished`ning write payload’da yo‘qligini tekshiradi.
- [ ] Upload testlari kategoriya, real response shakli, progress, validation, cancel, kech callback va retry’ni tekshiradi. Testlar faqat UI kutubxonasi markup snapshot’ini takrorlamaydi.
- [ ] Shared upload’ning cancellation ishlatmaydigan mavjud caller’i uchun moslik isbotlanadi.
- [ ] Brauzerda rasm tanlash → upload → profil save, upload xatosi → retry va upload paytida kutish/bekor qilib chiqish oqimlari tekshiriladi.
- [ ] Repo lint, admin/coach testlari va builds hamda desktop/mobile, dark/light, uch tildagi vizual tekshiruvlar o‘tadi.

## Boundaries

Coach profilini yaratish, publish qilish yoki role berish endpointi qo‘shilmaydi. Bekor qilingan upload serverda allaqachon tugagan bo‘lsa, tekshirilmagan file cleanup endpointi chaqirilmaydi. Real upload response shakli API kontraktidan tekshiriladi; taxminiy ID ishlab chiqarilmaydi.

## Demo

Trener profilni o‘zgartiradi, avatar yuklaydi va saqlaydi. Ikkinchi urinishda upload paytida boshqa bo‘limga o‘tib, kutish yoki bekor qilib chiqish variantlarining natijasini ko‘radi.
