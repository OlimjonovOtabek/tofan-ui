# 08 — Dasturlarni nashr qilish va almashtirish

**What to build:** Trener tayyor va saqlangan mashg‘ulot yoki ovqatlanish qoralamasini nashr qiladi. Agar shu turdan boshqa dastur nashrda bo‘lsa, almashtirish oqibatini tasdiqlaydi. Muvaffaqiyatdan keyin ro‘yxat, nashrdagi juftlik va tegishli holatlar haqiqiy backend natijasi bilan mos yangilanadi.

**Blocked by:** 05 — Mashg‘ulot dasturi va kun muharriri; 07 — Takrorlanadigan ovqatlanish menyusi.

**Status:** ready-for-agent

## Acceptance criteria

- [ ] Mashg‘ulot va meal publication har biri o‘zining mavjud publish operatsiyasidan foydalanadi. Tekshirilmagan activate, unpublish, role yoki subscription-grant endpointi chaqirilmaydi.
- [ ] Nashrdagi dastur bo‘lmagan holda dastlabki publication va nashrdagi dastur bor holda replacement alohida tushunarli oqimga ega.
- [ ] Replacement tasdig‘ida yangi dastur nomi yoki meal sana oralig‘i va oldingi nashrdagi dastur qoralamaga o‘tishi ko‘rsatiladi. Cancel hech qanday publish request yubormaydi.
- [ ] Tasdiq va doimiy published notice o‘zgarishlar kelajakdagi obunachilar uchun ekanligini, mavjud mijozlar nusxasi o‘zgarmasligini tushuntiradi.
- [ ] Dirty, saving yoki saqlanmagan failed/pending o‘zgarish bor paytda publication bajarilmaydi. Foydalanuvchiga oldin saqlash yoki qolgan failure’ni hal qilish amali ko‘rsatiladi.
- [ ] 06-ticket kun holatlarini boyitganda publication guard shu holatlar bilan mos ishlaydi; yangi per-day status umumiy dirty himoyasini chetlab o‘tmaydi.
- [ ] Backend bo‘sh dastur yoki boshqa business sabab bilan publication’ni rad etsa, tegishli class/confirmed code bo‘yicha actionable xabar ko‘rsatiladi. Bo‘sh dasturni tayyor deb soxta nashr holatiga o‘tkazilmaydi.
- [ ] Publish request davomida duplicate submit va qayta tasdiq oldi olinadi. Xatoda qoralama tarkibi va oldingi nashrdagi dastur holati saqlanadi.
- [ ] Muvaffaqiyatli publication’dan keyin tegishli summary list backenddan qayta o‘qiladi. Faqat lokal badge almashtirish bilan success yakunlanmaydi.
- [ ] Har turdan bitta published dastur backend response’iga mos ko‘rinadi. Oldingi dasturga alohida frontend unpublish write yuborilmaydi.
- [ ] Publish muvaffaqiyatli, keyingi list refresh failed bo‘lsa, ikki natija adashtirilmaydi: publication bekor bo‘ldi deb ko‘rsatilmaydi, refresh retry taklif qilinadi. Retry publish’ni takrorlamaydi.
- [ ] Profil va mavjud published summary’lar asosidagi readiness yangilanadi; bu frontend subscription eligibility kafolati deb e’lon qilinmaydi.
- [ ] Published notice desktop va mobil muharrirda topilishi oson. Confirmation fokusi, Escape/cancel, fokus tiklanishi, UZ/RU/EN va light/dark holatlari to‘g‘ri.

## Verification

- [ ] Focused testlar initial publication, replacement confirm/cancel, dirty/pending block va duplicate submit’ni tekshiradi.
- [ ] Backend empty-program failure, publish success → refresh failure → faqat reload retry va serverdan eski/yangi holatlarning mos kelishi isbotlanadi.
- [ ] Mashg‘ulot ham, ovqatlanish ham ayni semantikani saqlashi test qilinadi; birining publication’i ikkinchi turdagi published holatni o‘zgartirmaydi.
- [ ] Brauzerda ikki workout qoralamasidan biri nashr qilinadi, keyin boshqasi bilan almashtiriladi; meal uchun ham shu oqim ko‘rsatiladi.
- [ ] Repo lint, admin/coach testlari va builds, mobil/desktop, ikkala theme va uch til tekshiriladi.

## Boundaries

Coach obuna bermaydi, narx yoki profil publish holatini shu oqimda o‘zgartirmaydi. Subscription nusxalash qoidasi backendga tegishli. Frontend atomiklik yoki mavjud mijozlarga retroaktiv yangilashni va’da qilmaydi.

## Demo

Trener saqlangan qoralamani nashr qiladi, nashrdagi juftlik yangilanadi. Keyingi dastur nashrida replacement tasdig‘ini bekor qiladi, keyin tasdiqlab eski dastur qoralamaga qaytganini ko‘radi.
