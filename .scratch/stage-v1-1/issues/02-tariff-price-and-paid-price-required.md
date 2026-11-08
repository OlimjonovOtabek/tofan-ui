# 02: Tariff narxi va `Tariff.PaidPriceRequired`

**What to build:** admin Standard va VIP Tariff narxini o'zgartirib saqlay oladi va narx sahifa yangilangandan keyin ham saqlanib turadi.
Pullik Tariff'ga 0 narx ikki qatlamda to'xtatiladi: avval forma, keyin backend `Tariff.PaidPriceRequired` bilan; backend javobi kodi va `title` bilan hisobotga yoziladi.
Sinovdan keyin narxlar asl holiga qaytadi.

**Blocked by:** 01 (Tayyorgarlik).

**Status:** resolved

- [x] Standard va VIP Tariff'ning asl narxlari vaqti bilan hisobotga yozilgan.
- [x] Har biri +1 000 so'm qilib saqlangan, sahifa yangilangandan keyin yangi narx ko'ringan (read-back).
- [x] Standard yoki VIP'ga 0 narx kiritilganda forma saqlashni to'xtatgan va xato matni admin tilida chiqqan.
- [x] Kirilgan admin sahifasidan o'z tokeni bilan `price: 0` li bitta `PUT` yuborilgan; HTTP status, `title`, `code` va so'rov body'si hisobotga yozilgan; `code` `Tariff.PaidPriceRequired` bo'lishi kutiladi.
- [x] Agar backend 0 narxni qabul qilsa: narx darhol tiklangan va bu backend xatosi sifatida yozilgan.
- [x] Free Tariff narxiga tegilmagan.
- [x] Ikkala narx asl qiymatga qaytarilgan va read-back bilan tekshirilgan, tiklash vaqti yozilgan.

## Comments

So'rov maydoni `monthlyPrice` (spec'da `price`); `code` alohida maydon emas, `title` ichida keladi (`Tariff.PaidPriceRequired`).
