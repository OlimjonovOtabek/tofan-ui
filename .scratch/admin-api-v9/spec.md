Status: ready-for-agent

# Admin panel: API v9.1 ga moslashish

Manba: backend hand-off `handoff-angular-v9.md` (2026-10-19, API `v9.1`, image `ejakhangir/tofan:v9.1`), `api.peaktofan.com` Swagger va grilling qarorlari (2026-10-21).

## Problem Statement

Backend `v8.9` dan `v9.1` ga o'tdi va yangi serverga ko'chdi (`api.peaktofan.com`).
Admin panel hali eski kontrakt bilan ishlaydi.
Video himoyasi yoqilgach, `videoFileId` dan yasalgan imzosiz havolalar `400 StoredFile.LinkInvalid` beradi va admin video'larni ko'ra olmay qoladi.
Trenerlar ro'yxatida trenerning `slug` i ko'rinmaydi.
Lokal ishlashda panelni yangi API'ga ulaydigan proxy yo'q, kontrakt manbai sifatida eski Swagger ko'rsatilgan.

## Solution

- Video faqat backend bergan imzoli `videoUrl` bilan ochiladi: mashqni tahrirlash oynasida pleyer, media sahifasida mashqqa bog'langan video'lar.
- Mashqqa bog'lanmagan video'lar uchun backend'dan `GET /files` javobiga `contentUrl` qo'shish so'raladi; ungacha ular eski usulda ochiladi va xato bo'lsa mavjud `previewFailed()` holati ko'rinadi.
- Trenerlar ro'yxatida «Havola» ustuni: `slug` oddiy matn sifatida (havolasiz, nusxalashsiz, tahrirlashsiz).
- `proxy.prod.conf.json`, `npm run start:prod`, `npm run start:coach:prod`; CLAUDE.md va AGENTS.md da kontrakt manbai `api.peaktofan.com/swagger`.
- Ish `feat/admin-api-v9` worktree'sida, oldingi commit qilinmagan komissiya ishi bilan birga; oxirida `main` ga lokal `--no-ff` merge.

## Qarorlar

| # | Mavzu | Qaror |
|---|---|---|
| 1 | Worktree | `.claude/worktrees/admin-api-v9`, `main` dan; komissiya ishi stash orqali ko'chirildi, asosiy papka toza (coach agenti ishlaydi) |
| 2 | Media video | bog'langan video `/exercises` dagi `videoUrl` bilan; bog'lanmagani uchun backend'dan `contentUrl` so'raladi |
| 3 | Mashq video | tahrirlash oynasida saqlangan video pleyeri; yangi yuklanganda yashiriladi; ro'yxatda pleyer yo'q |
| 4 | `slug` | faqat ro'yxatda matn; admin so'rovlarida `slug` yo'q, uni trener o'zi o'zgartiradi; `peaktofan.com/t/<slug>` ni faqat mobil ochadi |
| 5 | Ovqatlar | kod o'zgarishi yo'q: `source` filtri, «Manba» ustuni, birlik maydonlari, `isVerified` allaqachon bor; tarjimalar mavjud formada tuzatiladi |
| 6 | Obuna berish | allaqachon bor (`subscription-grant-dialog`), o'zgarish yo'q |
| 7 | Proxy | `start:staging` eski serverda qoladi (relizdan keyin stage); yangi `proxy.prod.conf.json` |
| 8 | E2E login | foydalanuvchi brauzerda o'zi kiradi, parol yozilmaydi |
| 9 | Commit va merge | har tiket alohida commit, `main` ga lokal `--no-ff` merge, push yo'q |

## Out of Scope

- Trener paneli (`/coach/*`) o'zgarishlari: boshqa agent qiladi.
- Ochiq trener sahifasi `peaktofan.com/t/<slug>` va NFC sayti.
- Ovqat tarjimasi ko'rib chiqilganini belgilaydigan alohida maydon.
