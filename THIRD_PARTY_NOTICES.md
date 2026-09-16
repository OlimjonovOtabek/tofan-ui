# Third-Party Notices

This project contains source code adapted from the third-party projects listed below. Their
original copyright and permission notices are reproduced here as required by their licenses.

npm dependencies (Angular, Optimus UI, RxJS, etc.) are not listed here: the production build
collects their notices automatically into `dist/tofan-ui/3rdpartylicenses.txt`.

---

## Sakai NG

- Source: <https://github.com/primefaces/sakai-ng> (including its `sakai-assets` styles submodule)
- License: MIT

The application shell and its styles were adapted from Sakai NG: the SCSS layout was converted
to plain CSS and the components were rewritten. Adapted files:

- `src/styles/layout/*.css`
- `src/styles/tailwind.css`
- `src/app/core/layout/**` — topbar, sidebar, menu, theme configurator, layout and theme services
- `src/app/shared/components/logo/**` — placeholder logo artwork
- `src/app/shared/components/status-card/**`, `src/app/features/auth/pages/login-page/**` — page markup

```
The MIT License (MIT)

Copyright (c) 2018-2026 PrimeTek

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```

---

PrimeNG, PrimeFaces, PrimeReact, PrimeVue and PrimeFlex are trademarks of PrimeTek. This project
is not affiliated with or endorsed by PrimeTek.
