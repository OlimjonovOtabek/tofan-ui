# Reliz kuni: admin panelda qilinadigan ishlar

Bu fayl reliz kuni (backend va panellar prod'ga birga chiqadigan kun) admin panelda qo'lda bajariladigan qadamlarni saqlaydi.
Deploy qadamlari [deployment.md](deployment.md) va [devops-handoff.md](devops-handoff.md) da.

## 1. Free cheklovlarini vaqtincha o'chirish

Manba: backend `docs/tariffs-v1.md`, 5-bo'lim, "Yoqish".

### Nega

Backend deploy bo'lishi bilan faol tarif obunasi yo'q har bir foydalanuvchi Free'ga tushadi va Free cheklovlari darhol ishlaydi.
Boshlang'ich qiymatlarda rejadagi birinchi 3 ta mashq videosi ochiq qoladi, ovqatlardan esa faqat nonushta.
Yopiq kontentni tushuntiradigan belgi ("VIP/Standard'da ochiladi") va tarif sotib olish ekrani faqat mobil ilovaning yangi versiyasida bor.
Yangi versiya do'konlarda chiqmaguncha foydalanuvchi videosi va ovqat tarkibi bo'sh qolgan rejani sababini bilmay ko'radi va tarif sotib ololmaydi.
Backend shu davr uchun kodni o'zgartirmasdan cheklovni o'chirib turishni tavsiya qiladi.

### Qachon

Backend prod'ga deploy bo'lgandan keyin darhol, agar mobil ilovaning tarifli yangi versiyasi do'konlarda hali yo'q bo'lsa.
Versiya allaqachon chiqqan bo'lsa, bu bo'limni o'tkazib yuboring.
Qaror biznesniki: kim bajarishini oldindan kelishib oling.

### Qadamlar

1. Admin panelda "Narxlar" > "Tofan tariflari" sahifasini oching.
2. Free kartasidagi joriy qiymatlarni yozib oling (skrinshot): "Mashq videolari" va "Ovqat turlari".
   Boshlang'ich qiymatlar: 3 ta mashq videosi va faqat "Nonushta", lekin admin ularni oldin o'zgartirgan bo'lishi mumkin.
3. Free kartasida "Tahrirlash" ni bosing.
4. "Mashq videolari limiti" da "Hammasi ochiq" ni yoqing.
5. "Ovqat turlari" da "Hamma ovqat ochiq" ni yoqing.
6. Boshqa maydonlarga tegmang va "Saqlash" ni bosing.
7. Kartada "Mashq videolari: Hammasi ochiq" va "Ovqat turlari: Hamma ovqat ochiq" chiqqanini tekshiring.

O'zgarish darhol barcha Free foydalanuvchilarga tegadi, yangi deploy yoki mobil reliz kerak emas.
Ovqat scan limitiga tegilmaydi: eski mobil ilova scan'ni serverda sanatmaydi.
Free imtiyoz matnlari ("Dastlabki 3 ta mashq videosi", "Faqat nonushta uchun ovqatlanish rejasi") o'zgarmaydi: ular faqat yangi mobil versiyadagi tarif ekranida ko'rinadi, u chiqqanda esa cheklov qaytariladi.

### Qaytarish

Mobil ilovaning yangi versiyasi do'konlarda chiqqan kuni:

1. Free kartasida "Tahrirlash" ni bosing.
2. "Mashq videolari limiti" da "Hammasi ochiq" ni o'chiring va 2-qadamda yozib olingan sonni kiriting (boshlang'ich: 3).
3. "Ovqat turlari" da "Hamma ovqat ochiq" ni o'chiring va yozib olingan turlarni tanlang (boshlang'ich: "Nonushta").
4. "Saqlash" ni bosing.
5. Kartada "Rejadagi birinchi 3 ta mashq videosi ochiq" va "Faqat tanlanganlar ochiq: Nonushta" chiqqanini tekshiring.
6. Free imtiyoz matnlari qaytarilgan qiymatlarga mos ekanini tekshiring.
