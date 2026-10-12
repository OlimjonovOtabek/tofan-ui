# DevOps handoff: tofan-ui (admin + coach)

Sana: 2026-10-12. Maqsad: DevOps jamoasi nima o'zgarganini tushunib, admin yangilanishini va yangi coach panelini
deploy qila olishi. Batafsil qadamlar: `docs/deployment.md`. Coach funksiyalari: `docs/modules/coach.md`.

## 1. Qisqacha (TL;DR)

- Repo endi **Nx workspace**: `apps/admin` va `apps/coach` ikki alohida Angular ilova, umumiy kod `libs/core` va `libs/shared`.
- **Admin image'ga hech narsa o'zgarmadi.** `Dockerfile` upstream bilan bir xil, build natijasi hamon
  `dist/tofan-ui/browser`, nginx konfiguratsiyasi, env o'zgaruvchilari, port (8080) va `/healthz` o'sha.
- **Yangi: Coach panel.** Alohida image (`Dockerfile.coach`), build natijasi `dist/coach/browser`. Alohida host, stack service,
  image tag va tashqi TLS nginx server block kerak.
- Ikkala image bitta nginx shablonini ishlatadi (`nginx/default.conf.template`). Brauzer faqat `/api` ni ko'radi, CORS kerak emas.
- Reponi CI/Dependabot konfiguratsiyasi yo'q (upstream'da olib tashlangan). Build, test va lint avtomatik gate emas, qo'lda ishga tushiriladi.
- Docker image'lar bu hujjatni tayyorlashda **build qilib tekshirilmadi** (lokal Docker daemon o'chiq edi), 8-bo'limga qarang.

## 2. Nima o'zgardi (deploy nuqtai nazaridan)

| Qism | Admin | Coach (yangi) |
|---|---|---|
| Dockerfile | `Dockerfile` (o'zgarmagan) | `Dockerfile.coach` |
| Build buyrug'i | `npm run build` (`nx build admin`) | `npm run build:coach` (`nx build coach`) |
| Build natijasi | `dist/tofan-ui/browser` | `dist/coach/browser` |
| Tavsiya etilgan image | `ejakhangir/tofan-admin:<tag>` | `ejakhangir/tofan-coach:<tag>` |
| Base image (build) | `node:24-slim` | `node:24-slim` |
| Base image (runtime) | `nginx:1.31-alpine` | `nginx:1.31-alpine` |
| Port / health | `8080`, `GET /healthz` -> `ok` | `8080`, `GET /healthz` -> `ok` |
| Kirish roli (Keycloak) | realm role `admin` | realm role `trainer` + backend'da trainer kartochkasi |
| Lokal portdagi tekshiruv | `-p 8080:8080` | `-p 8081:8080` |

Runtime env (ikkala image uchun bir xil):

| Env | Default | Vazifasi |
|---|---|---|
| `API_UPSTREAM` | `http://tofan-api:8080` | `/api/*` yo'naltiriladigan backend (prefiks olib tashlanadi) |
| `NGINX_RESOLVER` | `127.0.0.11` | Docker DNS; backend qayta ishga tushganda 502 bermasligi uchun |

Boshqa o'zgarmaganlar: `nginx/default.conf.template`, `nginx/security-headers.inc`, `.dockerignore`, `client_max_body_size 220m`
(backend'ning 200 MB video limiti bilan mos), keshlash siyosati (`index.html` no-cache, hash'li `*.js`/`*.css` bir yil immutable).

## 3. Deploy tartibi

### 3.1 Admin (yangilash)

Mavjud jarayon o'zgarmaydi. Yangi tag bilan build qilib, `TOFAN_ADMIN_IMAGE` ni almashtirib `docker stack deploy` (`start-first`).

```bash
docker build -t ejakhangir/tofan-admin:<tag> .
docker push ejakhangir/tofan-admin:<tag>
```

Eslatma: admin kodi Nx'ga ko'chirilgan (manba `apps/admin`, umumiy kod `libs/*`), lekin chiqish artefakti va image tarkibi bir xil.
Yangi admin build'i ichida ham o'zgarishlar bor (upstream bilan merge: Angular 22.2.1, nginx 1.31, tooling yangilanishlari, mashq
atributlarini `libs/shared` ga ko'chirish), shuning uchun regressiya smoke testi tavsiya etiladi (6-bo'lim).

### 3.2 Coach (birinchi marta)

1. Image yig'ish va push:

   ```bash
   docker build -f Dockerfile.coach -t ejakhangir/tofan-coach:<tag> .
   docker push ejakhangir/tofan-coach:<tag>
   ```

2. Docker Swarm'da alohida service qo'shing (admin stack'ga tegmasdan), masalan `tofan-coach`, `tofan-net` tarmog'ida,
   `API_UPSTREAM=http://tofan-api:8080`, `update_config: order: start-first`, image tag'i env orqali (`TOFAN_COACH_IMAGE`).
3. Tashqi TLS nginx'da yangi server block va sertifikat: alohida host (masalan `coach.<domen>`), upstream `tofan-coach:8080`.
   Admin'dagi block'ni shablon sifatida oling; `client_max_body_size` kamida `220m` bo'lsin (mashq videosi yuklanadi).
4. DNS yozuvi.
5. Keycloak'da trainer foydalanuvchilarga realm role `trainer` berilganini tekshiring.

Rollback: coach service image tag'ini oxirgi ishlagan `tofan-coach` tag'iga qaytaring. Admin service'ga tegilmaydi.
Coach alohida service bo'lgani uchun uning nosozligi adminga ta'sir qilmaydi.

## 4. Backend bilan bog'liq shartlar (deploy'dan oldin tekshiring)

- Coach quyidagi endpoint'larga tayanadi: `/coach/profile`, `/coach/clients`, `/coach/workout-programs`, `/coach/meal-programs`,
  `/coach/exercises`, `/diet/foods`, `/diet/custom-foods`, `/exercises` va klient analitikasi. Kontrakt staging Swagger bo'yicha
  yozilgan, lekin **deploy qilinadigan muhitda endpoint mavjudligi tekshirilmagan**.
- **Ma'lum backend muammosi:** staging'da `PUT /coach/meal-programs/{id}` 500 qaytaradi (`UpdateMyMealProgramCommand`).
  Ovqatlanish dasturini saqlash backend tuzatilguncha ishlamaydi. Bu frontend deploy'ini to'smaydi, lekin foydalanuvchi shuni sezadi.
- Fayl yuklash: profil rasmi (JPG/PNG/WebP, 10 MB gacha) va mashq videosi. Ikkalasi `/api` orqali o'tadi, nginx timeout
  300s, request buffering o'chiq.
- Klient analitikasi so'rovlariga brauzer `X-Time-Zone` sarlavhasini yuboradi; oraliq proksi bu sarlavhani olib tashlamasligi kerak.
- Tokenlar backend orqali olinadi (`/auth/login`, `/auth/refresh`, `/auth/logout`). Panel Keycloak Admin API'ga murojaat qilmaydi
  va hech qanday secret saqlamaydi, shuning uchun panel image'iga Keycloak sirlarini qo'shish kerak emas.

## 5. Kuzatilgan xavflar va tavsiyalar

| # | Daraja | Topilma | Tavsiya |
|---|---|---|---|
| 1 | Past | `nginx/default.conf.template` dagi hash regex `-[A-Za-z0-9]{8}\.(js\|css)$` hash ichida `-` yoki `_` bor fayllarni ushlamaydi (masalan `chunk-C4W1w1j-.js`, `chunk-CWs_Jr4v.js`). Joriy build'da admin'da 36 faylning 10 tasi, coach'da 17 ning 4 tasi immutable keshga tushmaydi. Ish buzilmaydi (fayllar baribir beriladi), faqat qaytib kirganda ortiqcha yuklanadi. | Regex'ni `-[A-Za-z0-9_-]{8}\.(js\|css)$` ga o'zgartirish (ikkala image uchun bitta fayl). Alohida kichik PR. |
| 2 | Past | `.dockerignore` `graphify-out/` (~29 MB), `.scratch/`, `.agents/`, `.nx/` ni chiqarib tashlamaydi. Lokal `docker build` kontekstini shishiradi; CI'da toza clone bo'lsa ta'sir yo'q. | Shu papkalarni `.dockerignore` ga qo'shish. |
| 3 | O'rta | Repoda CI yo'q (upstream `ab49935` CI va Dependabot'ni olib tashlagan). Lint/test/build gate qo'lda. | Pipeline'da kamida `npm ci`, `npm run lint`, `npm test`, `npm run test:coach`, `npm run build`, `npm run build:coach` ishga tushiring. |
| 4 | Past | `Dockerfile` ichida `nx build` ishlaydi. Container ichida Nx daemon/kesh xatti-harakati tekshirilmagan. | Birinchi build'da logni ko'ring; kerak bo'lsa `NX_DAEMON=false` bering. |
| 5 | Ma'lumot | `Dockerfile` va `Dockerfile.coach` deyarli bir xil, faqat build buyrug'i va `dist` yo'li farq qiladi. | Hozircha o'zgartirish shart emas; ikkalasida ham nginx tag'ini birga yangilang. |

## 6. Deploy'dan keyingi smoke test

Admin va coach uchun alohida:

```bash
curl -s https://<host>/healthz                      # ok
curl -sI https://<host>/ | grep -i -E 'cache-control|x-frame|nosniff'
curl -s -o /dev/null -w '%{http_code}\n' https://<host>/some/deep/link   # 200 (SPA fallback)
curl -s -o /dev/null -w '%{http_code}\n' https://<host>/api/health       # backend'ning mavjud health yo'liga moslang
```

Qo'lda tekshiruv:

1. Admin: `admin` roli bilan kirish, Mashqlar va Garments ro'yxati ochilishi, bitta fayl yuklash.
2. Coach: `trainer` roli va trainer kartochkasi bor foydalanuvchi bilan kirish. Kartochkasi yo'q trainer uchun backend profil ma'lumotini bermaydi, bu holatda xatti-harakatni ham ko'rib qo'ying.
3. Coach: Profil ma'lumotini o'qish, Dasturlar va Mijozlar ro'yxati ochilishi.
4. `admin` roli bilan coach'ga kirishga urinish rad etilishi (va aksincha).

## 7. Upstream va fork farqi (nima qilindi)

- **Upstream:** `jakhangir-esanov/tofan-ui` (`upstream/main`). **Fork:** `OlimjonovOtabek/tofan-ui` (`origin/main`).
- Fork `upstream/main` ni to'liq o'z ichiga oladi (merge `2416b61`); upstream'da forkda yo'q commit yo'q. Umumiy ajdod: `ab49935`.
- Fork'da upstream'da yo'q **to'rtta mazmunli commit**:

| Commit | Mazmuni |
|---|---|
| `c2e94a8` refactor! | Admin panelni Nx workspace'ga ko'chirish: `src/` -> `apps/admin/src`, umumiy kod `libs/core`, `libs/shared`; Nx 23.3, Sheriff chegaralari |
| `7ac1e1b` feat(coach) | Coach panel: profil, dasturlar (mashg'ulot va ovqatlanish muharrirlari), kontent (mashq va ovqatlar), mijozlar va hisobotlar |
| `4ae5d77` docs | Nx workspace, coach panel va enum sxemasi hujjatlari |
| `988bc4c` chore(scratch) | Coach spetsifikatsiyalari, qayta dizayn ticketlari, prototip (`.scratch/`, ish vaqtiga ta'sir qilmaydi) |

- Hajm (taxminan): ikkala tomon orasida 786 fayl o'zgargan (+22 524 / -515 qator, ko'pi `src/` -> `apps/admin` ko'chirishi); `apps/coach` da 235 fayl, shundan 45 tasi test.
- Upstream tarafidan olingan va fork'ga merge qilingan: Angular 22.2.1, tooling yangilanishlari, `nginx` 1.31-alpine, `@types/node`,
  xavfsizlik bump'lari (`source-map-js`, `proxy-addr`, `brace-expansion`, `ip-address`), CI/Dependabot konfiguratsiyasini olib tashlash.
- `trainers` (admin) bo'limi upstream'da ham bor; fork'ga to'liq kirgan.
- **E'tibor:** `upstream/garment-drops` branch'ida 3 ta commit bor (raqamlangan drop'lardan ko'ylak yaratish, 500 tagacha bitta saqlash,
  variant/o'lcham/egasi/raqam oralig'i bo'yicha filtr va eksport) va ular `upstream/main` ga ham, forkka ham kirmagan. Bu ishlar deploy'ga kirmaydi.
  Agar ular tayyor bo'lsa, ularni Nx tuzilmasiga (`apps/admin/src/app/features/garments`) qayta qo'llash kerak bo'ladi, to'g'ridan-to'g'ri merge fayl yo'llari tufayli to'qnashadi.

## 8. Tekshiruv holati (halol hisobot)

| Tekshiruv | Natija |
|---|---|
| `npm run build` va `npm run build:coach` | Nx keshdan muvaffaqiyatli; `dist/tofan-ui/browser` (2.7 MB) va `dist/coach/browser` (2.1 MB) mavjud. Bu toza qayta build emas, kesh hit. |
| `docker build` (admin va coach) | **Bajarilmadi**: lokal Docker daemon ishlamayapti. Image build'i birinchi marta CI/serverda tekshiriladi. |
| `docker run` + `/healthz` | Bajarilmadi (yuqoridagi sabab). |
| Jonli backend bilan coach smoke test | Bajarilmadi; vakolatli non-production muhit va trainer akkaunti kerak. |
| Lint / unit testlar | Bu hujjat uchun qayta ishga tushirilmadi. Qoidaga ko'ra deploy'dan oldin `npm run lint`, `npm test`, `npm run test:coach` o'tishi shart. |

## 9. Tezkor havolalar

- Deploy qadamlari, sertifikat va tashqi nginx: `docs/deployment.md`
- Coach funksiyalari va API cheklovlari: `docs/modules/coach.md`
- Arxitektura va qarorlar: `docs/architecture.md`
- Backend kontrakti: `docs/backend-contract.md`
