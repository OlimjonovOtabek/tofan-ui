# 04: Coach VIP narxi

**What to build:** Trainer Coach'da VIP narxini qo'yadi, olib tashlaydi va 0 kiritsa rad etiladi; qo'yilgan VIP narx profil qatorida va admin Trainers ro'yxatida ko'rinadi.
Sinov deploy qilingan `coach.stage.peaktofan.com` da `stage-coach` hisobi bilan o'tadi va oxirida narxlar asl holiga qaytadi.

**Blocked by:** 01 (Tayyorgarlik).

**Status:** resolved

- [x] `coach.stage.peaktofan.com` ga `stage-coach` bilan kirilgan; parol faqat lokal stage credentials faylidan olingan, chatga yoki repoga yozilmagan.
- [x] Stage Coach'ning asl oylik va VIP narxi vaqti bilan hisobotga yozilgan.
- [x] VIP narx 400 000 qilib saqlangan, sahifa yangilangandan keyin ko'ringan, profil qatorida VIP qismi chiqqan.
- [x] VIP maydoni bo'shatib saqlanganda so'rov body'sida `vipMonthlyPrice: null` ketgani network log'da ko'rilgan.
- [x] VIP narxga 0 kiritilganda UI saqlashni rad etgan, so'rov ketmagan.
- [x] VIP narx qo'yilganda admin Trainers ro'yxatida ko'ringan.
- [x] Oylik va VIP narx asl qiymatga qaytarilgan va read-back bilan tekshirilgan, tiklash vaqti yozilgan.

## Comments

VIP narx asl qiymati allaqachon 400 000 bo'lgani uchun saqlash va read-back 410 000 bilan o'tkazildi, 400 000 tiklash qadami bo'ldi.
