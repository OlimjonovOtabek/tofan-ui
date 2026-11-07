# 04: Coach panel: VIP price

**What to build:**
Trainer narx sahifasida ixtiyoriy VIP narxini kiritadi va VIP o'quvchilar chat qila olishini tushuntiradigan izohni ko'radi.
Profilda narx "200 000 so'm · VIP 400 000" ko'rinishida chiqadi.
Ism, bio, havola, rasm yoki narx saqlanganda VIP price o'chmaydi.
Matnlar Flutter ilovasidan olinadi.

**Blocked by:** 01

**Status:** resolved

- [x] Narx sahifasida "VIP narxi (ixtiyoriy)" maydoni va izoh, 0 rad etiladi, bo'sh `null`.
- [x] Profil narx yorlig'i VIP bo'lsa uni qo'shib ko'rsatadi.
- [x] Service testi: profil yangilash tanasida `vipMonthlyPrice` har doim bor.
- [x] Store testi: ism, bio, havola va rasm saqlanganda joriy VIP price o'tkaziladi.
- [ ] Backend 4-ssenariysi stage'da `stage-coach` bilan o'tdi.
- [x] Coach moduli hujjati yangilangan.
- [x] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.

## Answer

The coach profile update always carries `vipMonthlyPrice` (number or `null`), and `toCoachProfileChange` copies the current VIP price from the loaded profile, so every save keeps it.
The pricing page has the optional VIP field and note from the Flutter app (zero refused, empty is `null`), and the profile price row appends `· VIP {price}` in the existing format, for example `200 000 UZS / oy · VIP 400 000`.
Code is in commit `0621310`.
The stage scenario 4 box stays open because nobody here has the `stage-coach` password.
