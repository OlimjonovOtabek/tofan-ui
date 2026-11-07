# Coach panelini yig'ish va serverga chiqarish

Bu hujjat faqat Coach panel (`apps/coach`) uchun.
Har bir buyruq nima qilishi yonida yozilgan.
Admin va landing uchun umumiy qadamlar `docs/deployment.md` da.
DevOps uchun umumiy xulosa `docs/devops-handoff.md` da.

## 1. Coach nima

Coach, trenerlar uchun veb panel.
Flutter `tofan_trainer` ilovasi bilan bir xil funksiyalar: Dashboard, Dasturlar, Mijozlar, Chat, Profil.
Statik Angular build, nginx orqali beriladi.
Backend bilan faqat `/api` orqali gaplashadi, chat uchun SignalR (`/api/hubs/chat`) ishlatadi.
Kirish uchun Keycloak'da realm role `trainer` va backend'da trener kartochkasi kerak.

## 2. Arxitektura

```
Brauzer
   |  https://coach.<domen>
   v
[ tashqi nginx ]   TLS, WebSocket header'lari, client_max_body_size 220m
   |
   v
[ tofan-coach:8080 ]   nginx:1.31-alpine, ichida statik build
   |-- /          -> index.html va assetlar (SPA fallback)
   |-- /api/...   -> API_UPSTREAM (prefiks /api olib tashlanadi), WebSocket ham o'tadi
   |-- /healthz   -> 200 ok
```

Image muhitga bog'liq emas.
API manzili image ichiga yozilmaydi, u ishga tushganda `API_UPSTREAM` env orqali beriladi.
Brauzer faqat o'z domenini ko'radi, shuning uchun backend'da CORS sozlash shart emas.

## 3. Talablar

- Docker (build va push qiladigan mashinada).
- Docker Hub (yoki boshqa registry) ga push huquqi: `docker login`.
- Server: Docker Swarm, tashqi tarmoq `tofan-net`, tashqi TLS nginx, certbot.
- DNS: coach uchun alohida host (masalan `coach.<domen>`).
- Backend `tofan-api` servisi `tofan-net` ichida `tofan-api:8080` nomi bilan ko'rinadi.
- Node faqat lokal tekshiruv uchun kerak (image ichida Node 24 ishlatiladi).

## 4. Lokal tekshiruv (deploy'dan oldin)

Repo ildizida bajariladi.

| Buyruq | Nima qiladi |
|---|---|
| `npm ci` | `package-lock.json` bo'yicha bog'liqliklarni aniq o'rnatadi |
| `npm run lint` | ESLint, "izoh yo'q" qoidasi va Sheriff chegaralarini tekshiradi. Xato bo'lsa deploy qilinmaydi |
| `npm run test:coach` | Coach Vitest testlarini ishga tushiradi |
| `npm run build:coach` | Production build: natija `dist/coach/browser` |
| `npm run start:coach` | Dev server, port 4300, lokal backend (`localhost:5179`) |
| `npm run start:coach:staging` | Dev server, staging backend'ga proxy |
| `npm run start:coach:prod` | Dev server, `api.peaktofan.com` ga proxy. Test ma'lumot yaratmang |

Deploy'dan oldin kamida `lint`, `test:coach`, `build:coach` o'tishi shart.
Admin va landing ham shu repoda bo'lgani uchun odatda `npm run lint`, `npm test`, `npm run test:landing`, `npm run build`, `npm run build:landing` ham o'tkaziladi.

## 5. Image yig'ish

Repo ildizida:

```bash
docker build -f Dockerfile.coach -t ejakhangir/tofan-coach:<tag> .
```

| Qism | Ma'nosi |
|---|---|
| `-f Dockerfile.coach` | Admin `Dockerfile` o'rniga coach faylini ishlatadi |
| `-t ejakhangir/tofan-coach:<tag>` | Image nomi va versiyasi. `<tag>` ni har deploy'da yangilang (`v1.0`, `v1.1`, ...) |
| `.` | Build konteksti: repo ildizi (`.dockerignore` keraksiz fayllarni chiqaradi) |

Dockerfile ikki bosqichli:

1. `node:24-slim`: `npm ci` keyin `npm run build:coach`. Natija `/app/dist/coach/browser`.
2. `nginx:1.31-alpine`: `nginx/default.conf.template` va `security-headers.inc` ni, hamda build natijasini nusxalaydi.
   Port `8080`, healthcheck `GET /healthz`.

Tag uchun `latest` ishlatmang, rollback qilish qiyinlashadi.
Tavsiya: semantik versiya yoki git qisqa hash (`git rev-parse --short HEAD`).

## 6. Lokal ishga tushirib tekshirish

```bash
docker run --rm -p 8081:8080 \
  -e API_UPSTREAM=http://host.docker.internal:5179 \
  ejakhangir/tofan-coach:<tag>
```

| Qism | Ma'nosi |
|---|---|
| `--rm` | To'xtatilganda konteynerni o'chiradi |
| `-p 8081:8080` | Mashinaning 8081 portini konteynerning 8080 portiga ulaydi (admin 8080 da bo'lsa to'qnashmaydi) |
| `-e API_UPSTREAM=...` | `/api/*` yo'naltiriladigan backend |

Tekshiruv:

```bash
curl -s http://localhost:8081/healthz
curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081/clients
curl -sI http://localhost:8081/ | grep -i cache-control
```

Kutilgan natija:

- `ok`.
- `200` (SPA fallback: mavjud bo'lmagan yo'l ham `index.html` qaytaradi).
- `cache-control: no-cache` (yangi versiya darhol ko'rinishi uchun).

Brauzerda `http://localhost:8081` ni ochib, `trainer` roli bor akkaunt bilan kiring.

## 7. Registry'ga yuklash

```bash
docker login
docker push ejakhangir/tofan-coach:<tag>
```

| Buyruq | Nima qiladi |
|---|---|
| `docker login` | Registry'ga kirish (bir marta) |
| `docker push` | Image'ni registry'ga yuboradi, server shu yerdan oladi |

## 8. Serverga birinchi marta chiqarish

Hammasi serverda, admin stack'ga tegmasdan bajariladi.

### 8.1 Env

`/opt/tofan/env/tofan.env` fayliga qo'shing:

```bash
TOFAN_COACH_IMAGE=ejakhangir/tofan-coach:<tag>
```

Image tag'i shu yerda turadi, stack fayli o'zgarmaydi.

### 8.2 Stack fayli

`/opt/tofan/stacks/coach.yml`:

```yaml
services:
  tofan-coach:
    image: ${TOFAN_COACH_IMAGE}
    environment:
      API_UPSTREAM: http://tofan-api:8080
    networks:
      - tofan-net
    deploy:
      replicas: 1
      update_config:
        order: start-first
        failure_action: rollback
      restart_policy:
        condition: any
      resources:
        limits:
          memory: 64M

networks:
  tofan-net:
    external: true
```

| Qism | Ma'nosi |
|---|---|
| `image: ${TOFAN_COACH_IMAGE}` | Env'dagi tag olinadi |
| `API_UPSTREAM` | Coach nginx `/api` ni shu manzilga yuboradi |
| `order: start-first` | Yangi konteyner ishga tushib sog'lom bo'lgach eskisi o'chadi, uzilish bo'lmaydi |
| `failure_action: rollback` | Yangi versiya ko'tarilmasa avtomatik oldingisiga qaytadi |
| `memory: 64M` | Statik nginx uchun yetarli chegara |
| `external: true` | `tofan-net` oldindan mavjud tarmoq, shu yerda yaratilmaydi |

### 8.3 Deploy

```bash
cd /opt/tofan && set -a && . env/tofan.env && set +a \
  && docker stack deploy --with-registry-auth -c stacks/coach.yml tofan
```

| Qism | Ma'nosi |
|---|---|
| `set -a && . env/tofan.env && set +a` | Env fayldagi o'zgaruvchilarni shell'ga yuklaydi (stack fayli `${...}` ni shundan oladi) |
| `docker stack deploy` | Stack'ni yaratadi yoki yangilaydi |
| `--with-registry-auth` | Registry login ma'lumotini swarm tugunlariga uzatadi (private image uchun) |
| `-c stacks/coach.yml` | Stack fayli |
| `tofan` | Stack nomi (admin bilan bir xil, service nomi `tofan_tofan-coach`) |

Holatni ko'rish:

```bash
docker service ls | grep coach
docker service ps tofan_tofan-coach
docker service logs --tail 100 tofan_tofan-coach
```

`1/1` replika va holat `Running` bo'lishi kerak.

### 8.4 DNS

Coach hosti uchun A yozuv qo'shing va u server IP'siga qaragan bo'lsin (masalan `coach.<domen>`).
Sertifikat olishdan oldin DNS tarqalganini tekshiring: `dig +short coach.<domen>`.

### 8.5 Sertifikat

Mavjud sertifikatga yangi nom qo'shiladi.
`--expand` eski barcha nomlarni ham saqlaydi, shuning uchun hammasini qayta yozing:

```bash
docker run --rm \
  -v /opt/tofan/certbot/letsencrypt:/etc/letsencrypt \
  -v /opt/tofan/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot --expand \
  -d api.<domen> \
  -d admin.<domen> \
  -d coach.<domen>
```

Boshqa mavjud nomlarni ham (`id`, `portainer`, `pgadmin`, ...) ro'yxatga qo'shishni unutmang.
Aks holda ular sertifikatdan tushib qoladi.

### 8.6 Tashqi nginx

`/opt/tofan/nginx/conf.d/40-coach.conf`:

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name coach.<domen>;

    ssl_certificate     /etc/letsencrypt/live/api.<domen>/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.<domen>/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 220m;
    proxy_request_buffering off;

    add_header Strict-Transport-Security "max-age=31536000" always;

    resolver 127.0.0.11 valid=10s;
    set $coach http://tofan-coach:8080;

    location / {
        include /etc/nginx/conf.d/proxy_params.inc;
        proxy_pass $coach;
    }
}
```

| Qism | Ma'nosi |
|---|---|
| `client_max_body_size 220m` | Mashq videosi (200 MB gacha) yuklanishi uchun. Backend limiti bilan bir xil bo'lsin |
| `proxy_request_buffering off` | Katta fayl diskka yozilmay to'g'ridan-to'g'ri uzatiladi |
| `resolver 127.0.0.11` va `set $coach` | Docker DNS orqali nom qayta aniqlanadi, coach qayta ishga tushsa 502 bo'lmaydi |

Chat uchun WebSocket majburiy.
`proxy_params.inc` ichida quyidagilar bo'lishi kerak:

```nginx
proxy_http_version 1.1;
proxy_set_header Upgrade $http_upgrade;
proxy_set_header Connection $connection_upgrade;
```

`map $http_upgrade $connection_upgrade { default upgrade; '' close; }` `http` darajasida e'lon qilingan bo'lishi kerak.
Agar admin uchun shu allaqachon ishlayotgan bo'lsa, qayta qo'shish shart emas.

Konfiguratsiyani tekshirib qayta yuklash:

```bash
docker exec $(docker ps -qf name=tofan_nginx) nginx -t
docker service update --force tofan_nginx
```

| Buyruq | Nima qiladi |
|---|---|
| `nginx -t` | Sintaksisni tekshiradi. Xato bo'lsa keyingi qadamga o'tmang |
| `docker service update --force` | Tashqi nginx'ni qayta ishga tushiradi, yangi konfiguratsiya o'qiladi |

### 8.7 Keycloak

Trener foydalanuvchilarda realm role `trainer` bo'lishi kerak.
Backend'da ular uchun trener kartochkasi yaratilgan bo'lishi kerak.
Panel Keycloak sirlarini saqlamaydi va Keycloak Admin API'ga murojaat qilmaydi, image'ga hech qanday secret qo'shilmaydi.

## 9. Deploy'dan keyingi tekshiruv

```bash
curl -s https://coach.<domen>/healthz
curl -sI https://coach.<domen>/ | grep -i -E 'cache-control|x-frame|nosniff'
curl -s -o /dev/null -w "%{http_code}\n" https://coach.<domen>/clients
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://coach.<domen>/api/auth/refresh
```

| Buyruq | Kutilgan natija |
|---|---|
| `/healthz` | `ok` |
| `/` sarlavhalari | `cache-control: no-cache`, `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff` |
| `/clients` | `200` (SPA fallback) |
| `/api/auth/refresh` | `400` yoki `401` (so'rov backend'ga yetdi). `502` bo'lsa `API_UPSTREAM` yoki tarmoq xato |

Qo'lda tekshiruv (brauzerda, `trainer` akkaunti bilan):

1. Kirish: login ishlaydi, `admin` roli bilan kirishga urinish rad etiladi.
2. Dashboard va Profil ma'lumotlari yuklanadi.
3. Dasturlar: ro'yxat ochiladi, mashq dasturida kun videosi yuklash ishlaydi.
4. Mijozlar ro'yxati va mijoz tafsiloti ochiladi.
5. Chat: ikki sessiyada xabar yuborib, real vaqtda kelishini tekshiring. DevTools Network'da `/api/hubs/chat` `101 Switching Protocols` bo'lishi kerak.
6. Telefon kengligida pastki tab bar, desktopda chap sidebar ko'rinadi.

## 10. Yangilash (keyingi versiyalar)

Har yangi versiya uchun:

```bash
git pull
npm ci && npm run lint && npm run test:coach && npm run build:coach
docker build -f Dockerfile.coach -t ejakhangir/tofan-coach:<yangi-tag> .
docker push ejakhangir/tofan-coach:<yangi-tag>
```

Serverda:

```bash
cd /opt/tofan
sed -i 's#^TOFAN_COACH_IMAGE=.*#TOFAN_COACH_IMAGE=ejakhangir/tofan-coach:<yangi-tag>#' env/tofan.env
set -a && . env/tofan.env && set +a
docker stack deploy --with-registry-auth -c stacks/coach.yml tofan
```

`sed -i` env fayldagi tag qatorini almashtiradi.
`start-first` tufayli foydalanuvchilar uzilishni sezmaydi.
`index.html` `no-cache` bo'lgani uchun brauzer yangi hash'li fayllarni darhol oladi.

Eslatma: ochiq chat WebSocket ulanishlari konteyner almashganda uziladi.
SignalR klienti avtomatik qayta ulanadi.

## 11. Rollback

Oxirgi ishlagan tag'ni env'ga qaytaring va stack'ni qayta deploy qiling:

```bash
cd /opt/tofan
sed -i 's#^TOFAN_COACH_IMAGE=.*#TOFAN_COACH_IMAGE=ejakhangir/tofan-coach:<oldingi-tag>#' env/tofan.env
set -a && . env/tofan.env && set +a
docker stack deploy --with-registry-auth -c stacks/coach.yml tofan
```

Tezkor variant, Swarm'ning o'z rollback'i:

```bash
docker service rollback tofan_tofan-coach
```

Admin va landing service'lariga ta'sir qilmaydi.
Coach alohida service bo'lgani uchun uning nosozligi adminni to'xtatmaydi.

## 12. Muammolarni hal qilish

| Belgi | Ehtimoliy sabab | Nima qilish |
|---|---|---|
| `502 Bad Gateway` `/api` da | `API_UPSTREAM` noto'g'ri yoki `tofan-api` ko'rinmayapti | `docker service logs tofan_tofan-coach`, `API_UPSTREAM` va `tofan-net` ni tekshiring |
| Sahifa ochiladi, login `401/403` | Akkauntda `trainer` roli yoki trener kartochkasi yo'q | Keycloak role va backend kartochkasini tekshiring |
| Chat ulanmaydi, `/api/hubs/chat` 400/502 | Tashqi nginx `Upgrade`/`Connection` header'larini o'tkazmayapti | 8.6 bo'limidagi `proxy_params.inc` ni tekshiring |
| Chat ulanadi, tez uzilib qoladi | Tashqi nginx `proxy_read_timeout` juda qisqa | Tashqi nginx'da `proxy_read_timeout` ni oshiring (kamida 300s, coach ichki nginx'da 300s) |
| Video yuklashda `413` | Tashqi nginx `client_max_body_size` kichik | Tashqi nginx'da `220m` qiling |
| Video yuklash o'rtada uziladi | Timeout yoki buferlash | `proxy_request_buffering off` va timeout'larni tekshiring |
| Deploy'dan keyin eski versiya ko'rinadi | Brauzer `index.html` ni keshlagan (tashqi proxy keshi) | Tashqi proxy `index.html` ni keshlamasligini tekshiring, brauzerda hard refresh |
| Service `0/1` | Image tortilmadi yoki healthcheck yiqildi | `docker service ps --no-trunc tofan_tofan-coach` xato matnini ko'rsatadi |
| `docker push` `denied` | Registry'ga kirilmagan | `docker login` |
| Mijoz analitikasi vaqti noto'g'ri | Oraliq proksi `X-Time-Zone` ni olib tashlayapti | Proksi bu sarlavhani o'tkazsin |

## 13. Backend shartlari

Deploy'dan oldin backend (`api.peaktofan.com`, API v9.1) quyidagilarni berishi kerak:

- `/coach/dashboard`, `/coach/profile`, `/coach/earnings`, `/coach/earnings/payments`.
- `/coach/clients` va ichki yo'llar, `/coach/workout-programs`, `/coach/meal-programs`, `/coach/preview-videos`.
- `/diet/foods`, `/files`, `/files/videos`.
- `/chat/conversations` va SignalR hub `/hubs/chat`.
- Auth: `/auth/login`, `/auth/refresh`, `/auth/logout`.

Backend'ning so'rov limiti video uchun 200 MB, nginx limiti 220 MB.
Bittasini o'zgartirsangiz ikkalasini birga o'zgartiring.

## 14. Qisqa shpargalka

```bash
# 1. tekshirish
npm ci && npm run lint && npm run test:coach && npm run build:coach

# 2. image
docker build -f Dockerfile.coach -t ejakhangir/tofan-coach:<tag> .
docker run --rm -p 8081:8080 -e API_UPSTREAM=http://host.docker.internal:5179 ejakhangir/tofan-coach:<tag>
docker push ejakhangir/tofan-coach:<tag>

# 3. server
cd /opt/tofan && set -a && . env/tofan.env && set +a \
  && docker stack deploy --with-registry-auth -c stacks/coach.yml tofan

# 4. tekshiruv
curl -s https://coach.<domen>/healthz

# 5. rollback
docker service rollback tofan_tofan-coach
```

## 15. Tekshirilmagan joylar

- `docker build` va `docker run` bu hujjat uchun mening mashinamda ishga tushirilmadi, buyruqlar `Dockerfile.coach` va `nginx/default.conf.template` asosida yozildi. Birinchi build'da logni ko'ring.
- Server yo'llari (`/opt/tofan/...`), stack va nginx fayl nomlari (`coach.yml`, `40-coach.conf`) admin uchun mavjud `docs/deployment.md` namunasidan olingan. Serveringizdagi haqiqiy nomlarga moslang.
- `docker service rollback` nomi stack nomiga bog'liq: `docker service ls` bilan haqiqiy service nomini tekshiring.
