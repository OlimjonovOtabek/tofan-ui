# 01 — Dasturlar ish maydoni va navigatsiya

**What to build:** Trener panelni ochganda tasdiqlangan Coach Workspace v2 ish maydonida nashrdagi mashg‘ulot, ovqatlanish menyusi, qoralamalar va profil tayyorligini haqiqiy API ma’lumotlari bilan ko‘radi. Desktopdagi nomlangan navigatsiya va mobil pastki navigatsiya orqali Dasturlar, Mijozlar, Kontent va Profilga o‘tadi. Yangi theme va tipografiya shu ishlaydigan oqim orqali joriy qilinadi.

**Blocked by:** None — can start immediately.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Panelning boshlang‘ich ekrani Dasturlar. Desktopda Coach Workspace v2 navigatsiyasi va keng ish maydoni, mobil ekranlarda to‘rtta bo‘limli pastki navigatsiya ishlaydi.
- [ ] Tasdiqlangan prototipning ranglari, layout’i, radiuslari, tipografiya o‘lchamlari, og‘irliklari va oraliqlari saqlanadi. Manrope font oilasi kelishilgan o‘zgarish sifatida qo‘llanadi; matn metrikalari qayta vizual tekshiriladi.
- [ ] Manrope ilova ichidan yuklanadi, lotin va kirill yozuvlarini qoplaydi; runtime tashqi font servisiga bog‘lanmaydi. Font litsenziyasi asset bilan saqlanadi.
- [ ] Light va dark ko‘rinishlar Optimus theme tokenlari orqali tayyorlanadi. Rejimni almashtirishning mavjud mexanizmi saqlanadi; tokenlar admin panelini tasodifan qayta bezamaydi.
- [ ] Barcha yangi sarlavha, tugma, yordamchi matn, holat va accessibility label UZ/RU/EN tarjimalariga ega. Ruscha uzun matnlar mobil ekranlarda sig‘adi.
- [ ] Nashrdagi mashg‘ulot va ovqatlanish rejasi o‘z summary API’laridan olinadi. Har bir dastur turi uchun backend bergan `isPublished` holati ishlatiladi.
- [ ] Profil/narx, mashg‘ulot va ovqatlanish tayyorligi mavjud response’lardan hosil qilinadi. Bu ko‘rinish backend obuna berishga ruxsat berdi degan kafolat sifatida ko‘rsatilmaydi.
- [ ] Narx yoki nashrdagi dastur yetishmasa, foydalanuvchi kerakli ishga olib boruvchi aniq amalni ko‘radi. Bo‘sh ro‘yxat birinchi dastur yaratishga yo‘naltiradi.
- [ ] Mashg‘ulot va ovqatlanish yuklash/xato holatlari mustaqil: birining xatosi ikkinchisining muvaffaqiyatli ma’lumotini yashirmaydi. Retry tegishli ma’lumotni qayta yuklaydi.
- [ ] Dastur ro‘yxatlari array kontraktiga mos ishlaydi. Qidiruv va holat filtri natijasi to‘g‘ri; mavjud bo‘lmagan server paging yoki aggregate dashboard endpointi qo‘shilmaydi.
- [ ] Hisob, til va mavzu amallari topilishi oson va klaviatura bilan ishlaydi. Aktiv bo‘lim va mobil safe-area to‘g‘ri ko‘rsatiladi.
- [ ] Mavjud login, trainer-role va trener-kartasi admission oqimlari saqlanadi. Login, ruxsat yo‘q va trener kartasi yo‘q ekranlari yangi tipografiya/theme bilan mos ko‘rinadi; identity siyosati o‘zgartirilmaydi.
- [ ] Prototip fixture’lari, namuna login va review boshqaruvlari production oqimiga ko‘chirilmaydi. Komponent HTTP servisni bevosita chaqirmaydi; ma’lumot mavjud store/service/ApiClient yo‘nalishida keladi.

## Verification

- [ ] Mavjud testlarni moslashtirish yoki focused test bilan ikkala listning muvaffaqiyat/xato kombinatsiyalari, readiness va qidiruv/filtr xulqi tekshiriladi.
- [ ] 360, 390, 430 va 1440 px ekranlar, UZ/RU/EN va light/dark kombinatsiyalarida navigatsiya, fokus, kontrast va sahifa overflow tekshiriladi.
- [ ] Repo talab qilgan lint, admin va coach testlari hamda ikkala build bajariladi. Boshlang‘ich mavjud xatolar bilan ushbu o‘zgarishdan kelgan xatolar ajratib qayd etiladi.
- [ ] Desktop va mobil vizual dalillar tasdiqlangan v2 etalon bilan solishtiriladi; font sababli zarur bo‘lgan vizual farqlar qayd etiladi.

## Boundaries

Bu ticket yangi backend, analytics ko‘rsatkichlari yoki auth migratsiyasini yaratmaydi. Mavjud lokal ishlar saqlanadi. Nashr amallarining yangi tasdiqlash oqimi 08-ticketda, keyingi feature ekranlari esa o‘z ticketlarida bajariladi.

## Demo

Trener mavjud hisob bilan panelni ochadi, nashrdagi juftlik va qoralamalarni ko‘radi, dastur turini/holatini filtrlaydi, til va light/dark rejimni almashtiradi, desktop hamda telefonda bo‘limlar orasida o‘tadi.
