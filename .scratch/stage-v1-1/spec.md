Status: ready-for-agent

# Stage v1.1: 6-bo'lim sinovlari (Tariff narxi, Benefit, VIP narx, video, push)

Manba: "Stage v1.1: backend javoblari" (2026-11-08), 6-bo'lim "Stage'da endi sinash mumkin", va shu kungi grilling.

## Problem Statement

Backend Stage v1.1 javobida beshta ishni stage'da sinash mumkinligini aytdi va xato chiqsa javob kodi va `title` bilan yozishni so'radi.
Bu ishlar admin va Coach panellarida yozilgan, unit testlardan o'tgan, lekin haqiqiy stage API bilan oxirigacha hech kim sinamagan:

- Coach.stage'da push: token ro'yxatdan o'tishi, ochiq va yopiq tab'ga push, admin'dan yuborilgan push.
- Standard va VIP Tariff narxini saqlash, `Tariff.PaidPriceRequired` xatosi.
- Benefit qo'shish va o'chirish.
- Coach'da VIP narx.
- Video yuklash.

Sinalmagan holda bular reliz kuni prod'ga backend bilan birga chiqadi, va xato bo'lsa birinchi bo'lib foydalanuvchi ko'radi.
Stage'ni boshqa jamoalar ham ishlatadi, shuning uchun sinov stage ma'lumotini buzib qoldirmasligi kerak.

## Solution

Agent beshta ishni end-to-end, foydalanuvchi ko'radigan yo'l bilan, brauzerda sinaydi va natijani bitta hisobotga yozadi.

- Admin qismi (Tariff narxi, Benefit) lokal admin panelda, stage API'ga ulangan holda sinaladi.
- Coach qismi (VIP narx, video, push) deploy qilingan `coach.stage.peaktofan.com` da sinaladi, chunki push sozlamasi aynan shu image ichidagi env'dan keladi.
- Har o'zgartirilgan qiymat oldin yozib olinadi va sinovdan keyin tiklanadi, sinov uchun yaratilgan narsalar o'chiriladi.
- Frontend xatosi shu branch'da test bilan tuzatiladi; backend xatosi kod, `title`, `code` va so'rov body'si bilan hisobotga yoziladi.
- Natija `.scratch/stage-v1-1/test-report.md` ga yoziladi va backend'ga yuboriladi.

## User Stories

1. As an admin, I want to save a new price for the Standard Tariff, so that the price Soldiers pay changes without a backend deploy.
2. As an admin, I want to save a new price for the VIP Tariff, so that the VIP price changes the same way.
3. As an admin, I want the saved Tariff price to come back after a page reload, so that I know the backend stored it and the page is not showing a local copy.
4. As an admin, I want the form to stop a zero price on a Standard or VIP Tariff before it is sent, so that I am told at once why it cannot be saved.
5. As an admin, I want the backend to refuse a zero price on a paid Tariff with `Tariff.PaidPriceRequired`, so that the rule holds even when the form is bypassed.
6. As an admin, I want the backend's refusal shown in my language, so that I understand it without reading a code.
7. As an admin, I want the Free Tariff to stay free, so that nobody is charged for it by mistake.
8. As an admin, I want to add a Benefit to a Tariff in three languages, so that Soldiers read what the Tariff gives in their language.
9. As an admin, I want to reorder the Benefits of a Tariff, so that the most important line is first.
10. As an admin, I want to remove a Benefit from a Tariff, so that an outdated promise disappears.
11. As an admin, I want the Benefits to come back after a reload in the order I saved them, so that I know the backend stored the order.
12. As an admin, I want an empty Benefit line blocked, so that Soldiers never see a blank row.
13. As an admin, I want a Benefit longer than 200 characters blocked, so that the line fits the mobile card.
14. As an admin, I want to add, reorder and remove a Benefit on a Trainer's Standard Tier, so that the same editor works for Tiers as for Tariffs.
15. As a Trainer, I want to set a VIP price in Coach, so that I can sell the VIP Tier.
16. As a Trainer, I want my profile row to show the VIP price next to the monthly price, so that I see what Soldiers see.
17. As a Trainer, I want to clear the VIP price, so that I stop new VIP sales while current VIP subscribers keep chat until their subscription ends.
18. As a Trainer, I want a VIP price of zero refused before saving, so that I cannot sell VIP for free by mistake.
19. As an admin, I want the Trainers list to show a Trainer's VIP price, so that I can check what a Trainer charges.
20. As a Trainer, I want to upload a workout video larger than one upload chunk, so that long exercise videos reach the backend in pieces.
21. As a Trainer, I want to see the video move from processing to ready, so that I know Soldiers can play it.
22. As a Trainer, I want to save a workout day only after every video finished uploading, so that a day never points at a missing video.
23. As a Trainer, I want Coach to register my browser for push after I allow notifications, so that I get messages from Tofan.
24. As a Trainer, I want a push to show while the Coach tab is open, so that I notice it while I work.
25. As a Trainer, I want a push to reach me as a system notification while the Coach tab is closed, so that I do not miss it.
26. As an admin, I want to send a push to one user by ID and have it arrive, so that I can reach a Trainer directly.
27. As a Trainer, I want signing out to stop pushes to that browser, so that a shared computer does not keep my notifications.
28. As a backend developer, I want every failure reported with the HTTP code, `title`, `code` and request body, so that I can reproduce it without asking.
29. As a backend developer, I want the report to list the values that were changed and the time they were restored, so that I can explain any odd row other teams saw on stage.
30. As a mobile developer using stage, I want test values to stay only for a few minutes and be restored, so that my own testing is not disturbed.
31. As the frontend developer, I want a frontend bug found during the run fixed with a test in the same branch, so that the fix ships with the release.
32. As the frontend developer, I want the current branch committed before the run, so that fixes made during the run are separate commits that are easy to review.

## Implementation Decisions

- Environment:
  - Admin runs locally with the staging proxy (`npm run start:staging`), already signed in as `stage-admin`; its code for Tariffs and Benefits is the same as the stage admin image `v2.3`.
  - Coach is the deployed `coach.stage.peaktofan.com` (image `v1.5`), signed in as `stage-coach`; the user confirmed this host in chat, and the password comes from the local stage credentials file, never from chat or the repository.
- Order of the run: Tariff price and `Tariff.PaidPriceRequired`, then Benefits, then the Coach VIP price, then the video upload, and push last.
- Before the run the current branch is committed as one commit with no co-author line; fixes found during the run are separate commits; merge and PR come after the run.
- Data rule: every value is read and written into the report before it changes, restored right after its check, and read back after the restore.
  Objects made for the test (Benefit rows, the "Stage test" workout program, its video) are deleted.
  Nobody is told in advance; changes last minutes and the report carries their times.
- Tariff price: Standard and VIP each go up by 1 000 so'm, are saved, read back after a reload, and go back to the original.
- `Tariff.PaidPriceRequired`: first the form's own block on a zero price; then one `PUT` with `price: 0` sent by `fetch` from the signed-in admin page with its own token.
  The expected answer is a refusal with `code` `Tariff.PaidPriceRequired`; its HTTP status and `title` are recorded.
  If the backend accepts it, that is a backend bug: the price is restored at once and the bug is reported.
- Benefits: in the Standard Tariff and in Stage Coach's Standard Tier, one "Stage test" Benefit in three languages is added, saved and read back, moved, then removed and saved; the empty and the 201-character line are checked as UI blocks.
- Coach VIP price: record the monthly and VIP prices; set VIP to 400 000 and read back, with the profile row showing the VIP part; clear the field and check the body sends `vipMonthlyPrice: null`; try 0 and expect the UI refusal; check the admin Trainers list shows the VIP price; restore.
- Video: a generated test-pattern video of about 30 seconds and 20 MB, made with `ffmpeg` in the session scratchpad (never the user's own videos), uploaded into one day of a new "Stage test" workout program.
  It must cross at least two 8 MB tus chunks, pass `complete`, and reach the ready state in the processing poll; then the program is deleted.
- Push:
  1. Sign in to Coach on stage; the user allows notifications in the browser's own prompt; the token registration request must answer 2xx.
  2. With the Coach tab open, the local admin "Send push" page sends "Stage push test 2026-11-08" to Stage Coach's user ID; it must show inside the tab.
  3. With the tab closed and the browser open, the same send must raise a macOS notification, which the user confirms.
  4. Sign out of Coach; the token must be removed on the backend, checked in the network log, and reported if it is not.
- Failure rule: a frontend bug is fixed in the branch with a test and the step is re-run; a backend bug is recorded with HTTP status, `title`, `code` and request body, with no workaround in the panel; a failed step stops only its own item.

## Testing Decisions

- The test seam is the end user's: the two panels in a real browser against the real stage API.
  The network log is read to check request bodies and status codes; nothing is mocked.
- The single exception is the `Tariff.PaidPriceRequired` request, sent from the signed-in page itself, because the form never lets a zero price reach the backend.
- A check passes on what the user would see or what the backend stored (a read-back after reload), never on the panel's local state.
- Any frontend fix made during the run gets a unit test at the existing seam of its feature: store tests that mock the feature service, mapper tests, model rule tests, and component tests on inputs and rendered output.
  Prior art: the Tariffs store and draft tests, the shared Benefits model tests, the Coach pricing and video upload store tests.
- After any fix the full set runs: `lint`, `test`, `test:coach`, `test:landing`, `build`, `build:coach`, `build:landing`.

## Out of Scope

- Paying an order: Click and Payme are not configured on stage.
- Resuming an interrupted video upload and the in-browser video compression.
- The deployed stage admin image itself (`v2.3`): its domain is not known to the panel docs, and the Tariff and Benefit code under test matches the local build.
- Checking the mobile apps; Benefits and prices are checked through the panels' own read-back only.
- Production, the release-day Firebase env, and the Google Cloud key restrictions (backend tasks).
- `userName` and `referenceName` on payment orders, still waiting for the backend.

## Further Notes

- The run needs the user twice: allowing notifications in the browser prompt, and confirming the macOS notification for the closed tab.
- The report goes to `.scratch/stage-v1-1/test-report.md`, written in Uzbek, one item per section: steps, expected and actual result, errors with code and `title`, original and restored values with times.
- The earlier local push check (local Coach, stage API, `tofan-dev`) passed; this run checks the deployed image's `push-config.json` path end to end.
- Stage test Soldier for anything that needs a Soldier: "Otabek Olimjonov".
