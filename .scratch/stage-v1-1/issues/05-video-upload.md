# 05: Video yuklash

**What to build:** Trainer Coach'da bitta tus bo'lagidan katta mashg'ulot videosini yuklaydi, video bo'laklab yetib boradi, qayta ishlanadi va tayyor holatga o'tadi; kun faqat video yuklanib bo'lgach saqlanadi.
Sinov uchun yaratilgan dastur va video oxirida o'chiriladi.

**Blocked by:** 01 (Tayyorgarlik).

**Status:** resolved

- [x] Session scratchpad'da `ffmpeg` bilan ~30 soniyalik, ~20 MB test-pattern video yaratilgan; foydalanuvchining o'z videolari ishlatilmagan.
- [x] Coach'da "Stage test" mashg'ulot dasturi ochilgan, bitta kunga shu video qo'shilgan.
- [x] Network log'da kamida ikkita 8 MB tus bo'lagi va muvaffaqiyatli `complete` so'rovi ko'rilgan.
- [ ] Video yuklanib bo'lmaguncha kunni saqlab bo'lmagan; yuklangach saqlangan.
- [x] Qayta ishlash so'rovlarida video tayyor holatga o'tgan; o'tishga ketgan vaqt yozilgan.
- [x] "Stage test" dasturi o'chirilgan va ro'yxatda yo'qligi tekshirilgan.
- [x] Backend xatosi bo'lsa HTTP status, `title`, `code` va so'rov body'si bilan yozilgan.

## Comments

Yuklash tugagandan keyin kun saqlandi, lekin yuklash paytida saqlash tugmasi bosiladigan edi (navbatli saqlash, `docs/modules/coach.md`); navbatli saqlashning o'zi sinalmadi. Test videosi dastur o'chirilgandan keyin ham stage'da qolgan (hisobotda backend savoli).
