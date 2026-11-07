# 04: Coach panel: VIP price

**What to build:**
Trainer narx sahifasida ixtiyoriy VIP narxini kiritadi va VIP o'quvchilar chat qila olishini tushuntiradigan izohni ko'radi.
Profilda narx "200 000 so'm · VIP 400 000" ko'rinishida chiqadi.
Ism, bio, havola, rasm yoki narx saqlanganda VIP price o'chmaydi.
Matnlar Flutter ilovasidan olinadi.

**Blocked by:** 01

**Status:** ready-for-agent

- [ ] Narx sahifasida "VIP narxi (ixtiyoriy)" maydoni va izoh, 0 rad etiladi, bo'sh `null`.
- [ ] Profil narx yorlig'i VIP bo'lsa uni qo'shib ko'rsatadi.
- [ ] Service testi: profil yangilash tanasida `vipMonthlyPrice` har doim bor.
- [ ] Store testi: ism, bio, havola va rasm saqlanganda joriy VIP price o'tkaziladi.
- [ ] Backend 4-ssenariysi stage'da `stage-coach` bilan o'tdi.
- [ ] Coach moduli hujjati yangilangan.
- [ ] `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach` va `build:landing` o'tadi.
- [ ] Stage'da qo'lda E2E o'tdi, PR `main`ga merge qilindi, prod'ga hech narsa chiqmadi.
