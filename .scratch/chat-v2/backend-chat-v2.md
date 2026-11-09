# Chat — v2: rasm, fayl, ovozli va dumaloq video xabar

> 2026-11-08. Branch `chat-attachments`. **Kimlar uchun:** mobil (Flutter) va trener paneli (Angular).
> v1 ([chat-v1.md](chat-v1.md)) dagi hamma narsa o'z kuchida — bu hujjat faqat **yangi** narsalarni aytadi.
> Kod bilan ziddiyat chiqsa — kod haqiqat. Reja va sabablar: [chat-attachments-plan.md](chat-attachments-plan.md).
>
> Holat: lokal API'da to'liq yo'l (yuklash → yuborish → o'qish → faylni ochish) to'rt tur uchun ham tekshirilgan.
> Stage/prod serverda va haqiqiy telefon yozuvlari bilan hali sinalmagan.

## 0. Qisqacha

- Xabar endi 5 turdan biri: `kind` = **1** matn, **2** rasm, **3** fayl, **4** ovozli xabar, **5** dumaloq video.
- Yuborish **ikki qadam**: avval fayl `POST /files` ga yuklanadi → `fileId`, keyin xabar
  `POST /chat/conversations/{id}/messages` `{ "text": …, "attachments": [fileId, …] }`.
- Rasm va fayl: bitta xabarda **1–10 ta**, matn (izoh) ixtiyoriy. Ovoz va dumaloq video: **bitta**, **matnsiz**.
  Bitta xabarda turlarni aralashtirib bo'lmaydi (rasm + fayl — ikki xabar).
- Ovoz va video serverda qayta kodlanadi: hamma joyda bir xil o'ynaydi (iOS, Android, brauzer).
- Har faylning **imzoli `url`** i bor, u **har soat o'zgaradi** — keshni `fileId` bo'yicha saqlang.
- Matnli xabarlar avvalgidek ishlaydi; eski ilova `text` yuboraversa bo'ladi.

## 1. Fayl yuklash

`POST /files` (`multipart/form-data`: `file`, `category`) — javob `{ "data": "<fileId>" }`. 50 MB dan katta
fayl kerak bo'lmaydi, lekin uzilishga chidamli yuklash kerak bo'lsa — tus ([storage-module.md](storage-module.md),
"Davom ettiriladigan yuklash"), `complete` da xuddi shu `category`.

| Tur | `category` | Kengaytmalar | Maks | Server nima qiladi |
|---|---|---|---|---|
| Rasm | **8** `ChatImage` | `.jpg .jpeg .png .webp` | 10 MB | o'zgartirmaydi, eni/bo'yini o'lchaydi |
| Ovoz | **9** `ChatVoice` | `.m4a .mp4 .aac .ogg .opus .webm .mp3` | 20 MB | → `.m4a` (AAC mono), ≤ 15 daqiqa, to'lqin |
| Dumaloq video | **10** `ChatVideoNote` | `.mp4 .mov .webm` | 50 MB | → 480×480 `.mp4`, markazdan kvadrat kesiladi, ≤ 60 s |
| Fayl | **11** `ChatFile` | `.pdf .doc .docx .xls .xlsx .ppt .pptx .txt .csv .zip .rar .jpg .jpeg .png .webp .mp4 .mov` | 50 MB | o'zgartirmaydi |

- Fayl nomidagi kengaytma va faylning **ichidagi baytlar** mos bo'lishi shart (`.exe` → `.pdf` qilib bo'lmaydi).
- Ovoz/video yuklash so'rovi **bir necha soniya** davom etadi (server kodlaydi) — 60 s video uchun ~3–6 s.
  Shu vaqt ichida "yuborilmoqda" holatini ko'rsating.
- Yuklangan, lekin **24 soat ichida yuborilmagan** fayl o'chiriladi. Bitta fayl faqat **bir marta** yuboriladi.
- Faylni **faqat yuklagan odam** xabarga qo'sha oladi.

### 1.1 Mobil (Flutter) — tavsiyalar

- **Rasm:** `image_picker` da `imageQuality: 85`, `maxWidth/maxHeight: 2048`. Bu JPEG qilib beradi va telefon
  burilishini (EXIF) rasmning o'ziga "yopishtiradi" — server o'lchagan eni/bo'yi ekrandagisiga mos bo'ladi.
  HEIC yubormang (qabul qilinmaydi).
- **Ovoz:** `record` paketi, `AudioEncoder.aacLc`, `.m4a`, mono, 44.1/48 kHz. Bosib turib yozish, qo'yib yuborganda
  yuklash — Telegramdagidek. 1 soniyadan qisqa yozuvni yubormang.
- **Dumaloq video:** `camera`, old kamera, `ResolutionPreset.medium` (480p) — server baribir 480×480 qiladi,
  kattasi faqat yuklashni sekinlashtiradi. Ekranda kamera ko'rinishini `ClipOval` bilan doira qiling.
  60 soniyada yozishni o'zingiz to'xtating (server 61 s dan uzunini rad etadi).
- **Fayl:** `file_picker`, ro'yxatdagi kengaytmalar bilan cheklang (`allowedExtensions`).

### 1.2 Angular (trener paneli)

- Rasm/fayl — `<input type="file">`, `accept` da yuqoridagi kengaytmalar.
- Ovoz — `MediaRecorder` (`audio/webm;codecs=opus` Chrome'da, Safari'da `audio/mp4`). Faylga mos nom bering:
  `voice.webm` yoki `voice.m4a` — server kengaytmaga qarab tekshiradi, keyin `.m4a` ga o'giradi.
- Dumaloq video yozish panelda **shart emas** — faqat ko'rsatish (pastda). Yozilsa ham `MediaRecorder` webm bo'ladi va server o'giradi.

## 2. Xabar yuborish

```
POST /chat/conversations/{id}/messages
{ "text": "Bugungi natijam", "attachments": ["9a0c…", "41b2…"] }
```

- `text` — ixtiyoriy, agar `attachments` bo'lsa. Bo'shliqlar olib tashlanadi; matnsiz xabarda javobda `""` keladi.
- `attachments` — `fileId` lar, **ko'rsatish tartibida**. Yo'q yoki `[]` — oddiy matnli xabar (v1 kabi).
- Javob, `MessageReceived` eventi va `GET …/messages` elementi bir xil shaklda:

```jsonc
{
  "id": "…",
  "conversationId": "…",
  "senderUserId": "…",
  "kind": 4,                         // 1 matn, 2 rasm, 3 fayl, 4 ovoz, 5 dumaloq video
  "text": "",                        // matnsiz xabarda bo'sh satr (hech qachon null emas)
  "sentOnUtc": "2026-11-08T18:20:11.5Z",
  "attachments": [                   // matnli xabarda []
    {
      "fileId": "…",
      "url": "/files/…/content?expires=1794164400&signature=…",  // API manziliga qo'shing
      "fileName": "voice.m4a",
      "contentType": "audio/mp4",
      "sizeBytes": 83215,
      "durationSeconds": 10,         // ovoz, video; boshqalarda null
      "width": null,                 // rasm, video
      "height": null,
      "waveform": [0, 12, 40, …]     // faqat ovoz: 64 ta son, 0–100
    }
  ]
}
```

**Eski ilovalar uchun:** `text` va `lastMessageText` hech qachon `null` bo'lmaydi — matnsiz xabarda `""`. v1 modeli
(`String`) buzilmaydi; eski ilova media xabarni shunchaki bo'sh pufakcha qilib ko'rsatadi. Turini `kind` dan biling.

## 3. Ko'rsatish

| `kind` | Qanday |
|---|---|
| 2 rasm | `width/height` dan nisbatni olib joyni oldindan ajrating (sakramasin). 1 ta — to'liq kenglikda, 2–10 ta — albom (Telegram to'ri). Bosilganda to'liq ekran galereya. `text` — rasm ostida izoh |
| 3 fayl | Ikonka (kengaytma bo'yicha), `fileName`, hajm ("1.2 MB"). Bosilganda yuklab olib ochiladi. `/content` fayl nomini `Content-Disposition` da beradi |
| 4 ovoz | Play tugmasi, `waveform` ustunlari (64 ta, balandlik = qiymat %), `durationSeconds` ("0:10"). O'ynayotganda o'tgan qism rangli. Tezlik (1x/1.5x/2x) — mijozda |
| 5 dumaloq video | Doira (`ClipOval`), ~200 px. Ro'yxatda ovozsiz avtomatik o'ynasin, bosilganda ovoz bilan boshidan. Atrofida progress halqa. `durationSeconds` burchakda |

- `url` nisbiy — oldiga API manzilini qo'shing. Video/ovoz uchun ham shu `url`: server `Range` ni qo'llaydi,
  fayllar `+faststart` bilan — yuklanib ulgurmasdan o'ynay boshlaydi.
- **Kesh:** `url` har soat o'zgaradi. Rasm keshi kaliti — `fileId` (`CachedNetworkImage(cacheKey: fileId)`),
  ovoz/video ham `fileId` nomi bilan diskka saqlansin. Muddati o'tgan `url` — `400 StoredFile.LinkInvalid`:
  xabarlarni `GET …/messages` bilan qayta oling.
- Imzosiz `/files/{id}/content` chat fayllari uchun ishlamaydi — faqat javobdagi `url`.

## 4. Suhbatlar ro'yxati

`GET /chat/conversations` elementiga **`lastMessageKind`** qo'shildi (1–5, xabar bo'lmasa `null`).
`lastMessageText` — matn/izoh; izohsiz faylda — fayl nomi; izohsiz rasm, ovoz, videoda — `""`.
Ko'rsatish (o'z tilingizda):

| `lastMessageKind` | `lastMessageText` | Ro'yxatda |
|---|---|---|
| 2 | `""` / izoh | "📷 Rasm" / "📷 izoh" |
| 3 | fayl nomi / izoh | "📎 plan.pdf" |
| 4 | `""` | "🎤 Ovozli xabar" |
| 5 | `""` | "⚪ Video xabar" |

## 5. Push

v1 dagi kabi. `body` media uchun: `📷 Rasm` (izoh bo'lsa `📷 izoh`), `📎 {fayl nomi}`, `🎤 Ovozli xabar`,
`⚪ Video xabar`. Push faqat o'zbekcha (bitta matn hamma tilga) — ilova ochilganda ro'yxat o'z tilida ko'rinadi.

## 5.1 "Ovoz yozmoqda…" (SignalR)

v1 dagi `Typing` o'rniga yangi hub metodi **`Activity(conversationId, activity)`** va event **`UserActivity`**.

| `activity` | Qachon chaqiriladi | Suhbatdosh ko'radi |
|---|---|---|
| **1** `Typing` | matn maydonida yozayotganda | "yozmoqda…" |
| **2** `RecordingVoice` | ovoz yozish tugmasi bosib turilganda | "🎤 ovoz yozmoqda…" |
| **3** `RecordingVideo` | dumaloq video yozilayotganda | "⚪ video yozmoqda…" |
| **4** `Uploading` | rasm/fayl/ovoz/video yuklanayotganda (`POST /files` tugaguncha) | "yuklamoqda…" |

```jsonc
// UserActivity — faqat suhbatdoshga
{ "conversationId": "…", "userId": "…", "activity": 2 }
```

- Qoidalar `Typing` bilan bir xil (chat-v1.md 2.3): faoliyat davom etayotganda **3 soniyada bir martadan ko'p
  emas** chaqiring, to'xtaganda hech narsa yubormang. Suhbatdosh **5 soniya** yangi `UserActivity` kelmasa
  yoki shu odamdan `MessageReceived` kelsa yozuvni o'chiradi. Yangi `activity` kelsa — eskisini almashtiradi.
- Ruxsat bo'lmasa (suhbat a'zosi emas, obuna tugagan) yoki `activity` noma'lum bo'lsa event jimgina
  yuborilmaydi — `invoke` xato qaytarmaydi (`Typing` dagidek).
- **Eski ilovalar uchun:** `Typing(conversationId)` ishlayveradi, `activity = 1` da server eski `UserTyping`
  eventini ham yuboradi. Yangi ilova faqat `Activity` chaqirsin va faqat `UserActivity` ni tinglasin.

```ts
// Angular
connection.on('UserActivity', (a: UserActivity) => this.store.showActivity(a)); // 5 s dan keyin o'chadi
const sendActivity = throttle((activity: ChatActivity) => connection.invoke('Activity', conversationId, activity), 3000);
```

```dart
// Flutter
connection.on('UserActivity', (args) => store.showActivity(UserActivity.fromJson(args![0] as Map<String, dynamic>)));
await connection.invoke('Activity', args: [conversationId, 2]); // ovoz yozilayotganda, 3 s da bir marta
```

## 6. Xatolar (yangi)

| Status | `title` | Qachon |
|---|---|---|
| `400` | `StoredFile.UnsupportedContent` | Kengaytma bu `category` uchun emas |
| `400` | `StoredFile.ContentMismatch` | Fayl ichi kengaytmaga mos emas |
| `400` | `StoredFile.TooLarge` | Hajm chegaradan katta |
| `400` | `StoredFile.MediaUnreadable` | Ovoz/video/rasmni o'qib bo'lmadi (buzuq yozuv) |
| `400` | `StoredFile.MediaTooLong` | Ovoz > 15 daqiqa, video > 60 s |
| `400` | `StoredFile.LinkInvalid` | `url` eskirgan — xabarlarni qayta oling |
| `404` | `Chat.AttachmentNotFound` | `fileId` yo'q, chat fayli emas, boshqa odamniki yoki 24 soatda o'chib ketgan — qayta yuklang |
| `409` | `Chat.AttachmentAlreadyUsed` | Bu fayl allaqachon yuborilgan |
| `400` | `Chat.AttachmentsMixed` | Bitta xabarda rasm va fayl (yoki boshqa turlar) aralash |
| `400` | `Chat.RecordingNotAlone` | Ovoz/video bilan matn yoki bittadan ko'p |
| `400` | `General.Validation` | Na matn, na attachment; 10 tadan ko'p; bir `fileId` ikki marta |

## 7. Yo'q (keyinroq)

Xabarni tahrirlash/o'chirish, forward, reply, galereyadagi videoni inline pleerda ko'rsatish (hozircha fayl
sifatida, `kind` 3), rasm preview (blur).
