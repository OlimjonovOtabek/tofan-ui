# Admin va Coach panellarini serverga chiqarish

Backend `DEPLOYMENT.md` (Hetzner, Docker Swarm, `tofan-net`, tashqi nginx + Let's Encrypt) davomi.
Bu yerda faqat panelga tegishli qadamlar. Manzil namunasi: `https://admin.157.90.117.20.sslip.io`.

## Tuzilma

```
Brauzer
   |  https://admin.157.90.117.20.sslip.io
   v
[ tashqi nginx ]  TLS, 30-admin.conf
   |
   v
[ tofan-admin:8080 ]  nginx:1.29-alpine, image ichidagi statik build
   |-- /            -> index.html va assetlar (SPA fallback)
   |-- /api/...     -> http://tofan-api:8080/...  (prefiks olib tashlanadi)
   |-- /healthz     -> 200 ok
```

Panel `apiBaseUrl: '/api'` bilan yig'iladi va API'ga o'z domeni orqali murojaat qiladi. Brauzer
uchun manba bitta bo'lgani sababli **CORS kerak emas**: backend'da `Cors__AllowedOrigins`
sozlanmaydi. API manzili image ichiga yozilmaydi, bitta image har qanday muhitda ishlaydi.

## Image

| Fayl                          | Vazifasi                                                            |
| ----------------------------- | ------------------------------------------------------------------- |
| `Dockerfile`                  | `node:24-slim` da `npm ci` + `npm run build`, keyin nginx           |
| `Dockerfile.coach`            | Coach app’ni alohida image qilib yig‘adi (`dist/coach/browser`)      |
| `Dockerfile.landing`          | Landing'ni SSR Node server image qilib yig'adi (`dist/landing`, port 4000) |
| `nginx/default.conf.template` | SPA, kesh, `/api` proxy; ishga tushganda env bilan to'ldiriladi     |
| `nginx/security-headers.inc`  | `nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy`               |
| `.dockerignore`               | `node_modules`, `dist`, `.git` va hujjatlarni kontekstdan chiqaradi |

Muhit o'zgaruvchilari (standart qiymatlar bilan):

| O'zgaruvchi      | Standart                | Vazifasi                                                     |
| ---------------- | ----------------------- | ------------------------------------------------------------ |
| `API_UPSTREAM`   | `http://tofan-api:8080` | `/api` so'rovlari uzatiladigan backend                       |
| `NGINX_RESOLVER` | `127.0.0.11`            | Docker ichki DNS; konteyner IP'si o'zgarsa ham 502 bo'lmaydi |

Kesh: `index.html` — `no-cache` (yangi deploy darhol ko'rinadi), hash'li `*.js`/`*.css` — bir yil
`immutable`. `client_max_body_size 220m` backend'ning so'rov limiti bilan bir xil (video fayl 200 MB).

Yig'ish va yuklash (o'z kompyuteringizda, repo papkasida):

```bash
docker build -t ejakhangir/tofan-admin:v1.0 .
docker push ejakhangir/tofan-admin:v1.0
```

Lokal tekshirish: `docker run --rm -p 8080:8080 -e API_UPSTREAM=http://host.docker.internal:5179 ejakhangir/tofan-admin:v1.0`.

## Coach image

Coach alohida build output va image oladi. U alohida host name, stack service, env image tag’i va
external TLS nginx server block bilan chiqarilishi mumkin. Admin `Dockerfile` va admin stack’i
o‘zgarmaydi.

```bash
docker build -f Dockerfile.coach -t ejakhangir/tofan-coach:v1.0 .
docker run --rm -p 8081:8080 -e API_UPSTREAM=http://host.docker.internal:5179 ejakhangir/tofan-coach:v1.0
```

Rollback: coach service image tag’ini oxirgi ishlagan `tofan-coach` tag’iga qaytaring. Admin service
image’iga tegilmaydi.

## Landing image

Landing (`peaktofan.com`) nginx emas, Angular SSR Express server bilan ishlaydi: `/`, `/ru`, `/en` build vaqtida prerender qilinadi, boshqa manzillar 404 sahifa bilan server'da render qilinadi.
API'ga murojaat qilmaydi, shuning uchun `API_UPSTREAM` kerak emas.

```bash
docker build -f Dockerfile.landing -t ejakhangir/tofan-landing:v1.0 .
docker run --rm -p 4000:4000 ejakhangir/tofan-landing:v1.0
curl -s http://localhost:4000/healthz   # ok
```

SSR faqat `angular.json` dagi `security.allowedHosts` ro'yxatidagi host'larga javob beradi (`peaktofan.com`, `www.peaktofan.com`, localhost).
Tashqi nginx `Host` header'ini o'zgartirmasdan uzatishi kerak (`proxy_set_header Host $host;`).



### 1. Env

`/opt/tofan/env/tofan.env` ga qo'shing:

```bash
TOFAN_ADMIN_IMAGE=ejakhangir/tofan-admin:v1.0
```

### 2. Stack fayli

`/opt/tofan/stacks/admin.yml`:

```yaml
services:
  tofan-admin:
    image: ${TOFAN_ADMIN_IMAGE}
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

```bash
cd /opt/tofan && set -a && . env/tofan.env && set +a \
  && docker stack deploy --with-registry-auth -c stacks/admin.yml tofan
```

### 3. Sertifikat

Mavjud sertifikatga yangi nomni qo'shish (`--expand`, barcha eski nomlar ham qayta sanab o'tiladi):

```bash
docker run --rm \
  -v /opt/tofan/certbot/letsencrypt:/etc/letsencrypt \
  -v /opt/tofan/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot -w /var/www/certbot --expand \
  -d api.157.90.117.20.sslip.io \
  -d id.157.90.117.20.sslip.io \
  -d portainer.157.90.117.20.sslip.io \
  -d pgadmin.157.90.117.20.sslip.io \
  -d admin.157.90.117.20.sslip.io
```

### 4. Tashqi nginx

`/opt/tofan/nginx/conf.d/30-admin.conf`:

```nginx
server {
    listen 443 ssl;
    http2 on;
    server_name admin.157.90.117.20.sslip.io;

    ssl_certificate     /etc/letsencrypt/live/api.157.90.117.20.sslip.io/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/api.157.90.117.20.sslip.io/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

    client_max_body_size 220m;
    proxy_request_buffering off;

    add_header Strict-Transport-Security "max-age=31536000" always;

    resolver 127.0.0.11 valid=10s;
    set $admin http://tofan-admin:8080;

    location / {
        include /etc/nginx/conf.d/proxy_params.inc;
        proxy_pass $admin;
    }
}
```

Coach paneli chat uchun WebSocket (SignalR, `/api/hubs/chat`) ishlatadi. Tashqi nginx `proxy_params.inc`
ichida `proxy_http_version 1.1;`, `proxy_set_header Upgrade $http_upgrade;` va
`proxy_set_header Connection $connection_upgrade;` bo'lishi kerak (`map $http_upgrade $connection_upgrade`
`http` darajasida e'lon qilinadi).

```bash
docker exec $(docker ps -qf name=tofan_nginx) nginx -t
docker service update --force tofan_nginx
```

### 5. Tekshirish

```bash
curl -s https://admin.157.90.117.20.sslip.io/healthz
curl -s -o /dev/null -w "%{http_code}\n" https://admin.157.90.117.20.sslip.io/exercises
curl -s -o /dev/null -w "%{http_code}\n" -X POST https://admin.157.90.117.20.sslip.io/api/auth/refresh
```

Kutilgan natija: `ok`, `200` (SPA fallback), `400` yoki `401` (so'rov backend'ga yetdi; `502` bo'lsa
`tofan-api` nomi yoki tarmoq noto'g'ri).

## Yangilash

Yangi teg bilan image yig'ing, `TOFAN_ADMIN_IMAGE` ni o'zgartiring va 2-qadamdagi `stack deploy` ni
qayta bajaring. `start-first` tufayli uzilish bo'lmaydi.

## Ochiq qolgan xavfsizlik bandlari

Panel ochiq internetga chiqishi bilan backend `deferred.md` dagi bandlar (90 kunlik token, brute force
himoyasi yo'qligi, `GET/DELETE /files` da admin tekshiruvi yo'qligi) muhimroq bo'ladi —
[roadmap](roadmap.md#productionga-chiqishdan-oldin-backend-deferredmd).
