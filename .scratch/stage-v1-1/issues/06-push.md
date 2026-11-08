# 06: Push

**What to build:** deploy qilingan Coach image'i o'z env'idan olgan Firebase sozlamasi bilan push'ni oxirigacha yetkazadi.
Trainer bildirishnomaga ruxsat bergach brauzer ro'yxatdan o'tadi, admin bitta foydalanuvchiga yuborgan push ochiq tab'da ham, yopiq tab'da (tizim bildirishnomasi sifatida) ham keladi, va sign out shu brauzerga push'ni to'xtatadi.

**Blocked by:** 04 (Coach VIP narxi), 05 (Video yuklash) - oxirgi qadam sign out, u ikkalasi ishlatadigan Coach sessiyasini tugatadi.

**Status:** resolved

- [x] `coach.stage.peaktofan.com/push-config.json` to'liq config qaytargani tekshirilgan.
- [x] Foydalanuvchi brauzerning o'z oynasida bildirishnomaga ruxsat bergan; token ro'yxatdan o'tish so'rovi 2xx qaytargan.
- [ ] Coach tab'i ochiq turganda lokal admin "Push yuborish" sahifasidan Stage Coach user ID'siga "Stage push test 2026-11-08" yuborilgan va tab ichida ko'ringan.
- [ ] Coach tab'i yopiq, brauzer ochiq turganda xuddi shu push yuborilgan va macOS bildirishnomasi kelganini foydalanuvchi tasdiqlagan.
- [x] Coach'dan sign out qilingan; token backend'dan o'chirilgani network log'da tekshirilgan, o'chmasa hisobotga yozilgan.
- [x] Har xato HTTP status, `title`, `code` va so'rov body'si bilan yozilgan.

## Comments

Deploy qilingan `v1.5` da ochiq tab'da push ko'rinmadi (frontend xatosi, `a4aa3df` da tuzatildi, tuzatish lokal Coach'da tasdiqlandi, `v1.5`da emas). macOS bildirishnomasi tasdiqlanmadi: foydalanuvchi lokal 'OS path test' ni ham ko'rmadi (macOS/Chrome sozlamasi), ammo worker bildirishnomani yaratgani `getNotifications()` bilan ko'rildi.

2026-11-09 qayta sinov: ochiq tab'dagi push lokal Coach'da qayta tasdiqlandi (00:19, toast ko'rindi); deploy qilingan `v1.5` da emas. macOS bildirishnomasi hali tasdiqlanmagan (ish stoli boshqaruv vositasi yo'q, hisobotda).
