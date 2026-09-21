# Neva-Book Product Context

## Brand

Neva-Book is a Saint Petersburg print and bookbinding business founded in 2003.

Primary product/service directions on the public website:
1. Изготовление фотокниг
2. Печать на холсте
3. Переплёт книг
4. Реставрация книг
5. Сувениры
6. Подарочные наборы

The business is broader than photobooks; do not position Neva-Book as a single-product SaaS service.

## Brand assets

The user-provided Neva-Book logo is authoritative and must be shown intact when requested. It includes the book/Neva illustration, the “Нева-Бук” wordmark, and the lower service line. Do not substitute an invented SVG or an approximation.

Public website palette should derive from the logo: deep navy, gold, and warm light neutrals.

## Public header

Approved direction:
- dark header;
- full Neva-Book logo at left;
- “Основано в 2003 году” associated with the brand area;
- right side contains a phone placeholder and “Контакты” button;
- avoid extra navigation clutter unless later approved.

## Photobook product flow

The photobook product page should contain:
- work/gallery examples;
- calculator;
- size choice: 20×20 or 30×30;
- cover choice: photo cover or fabric cover;
- visual preview changes when a cover option changes;
- spread count: 5–15;
- default spread count: 10;
- live total;
- actions: “Конструктор” and “Работа с дизайнером”.

Current price rules:
- base: 2500 ₽ for 5 spreads;
- fabric cover: +700 ₽;
- 30×30: +1500 ₽;
- each spread above 5: +150 ₽;
- designer service: +4000 ₽.

“Конструктор” goes to the photobook editor.
“Работа с дизайнером” adds 4000 ₽ and proceeds to a contact form carrying the selected configuration and total.

## Photobook editor

The native NevaBook 1.1 application is the functional reference. SmartAlbums may inform usability patterns, but must not override NevaBook mechanics.

Approved/expected editor capabilities include:
- photo bank with used/unused state;
- auto layout;
- alternate layout for current spread;
- multiple ranked layout variants;
- drag photo into a frame;
- swap already-used photos;
- reposition crop inside frame;
- reset/center crop;
- zoom slider while cropping;
- adjustable photo spacing 1–5 mm;
- timeline of spreads;
- undo/redo;
- cover-selection step after spreads.

Spread count:
- hard maximum: 15;
- accepted UI choices/range: 5–15;
- product calculator starts at 10.

For 20×20 production:
- inner production spread: 406×206 mm before trim;
- final: 400×200 mm after 3 mm trim;
- cover production size: 466×246 mm.

Client web editor should not expose operator/production export controls. Production rendering/export is server-side.

## Cover selection

After editing spreads, the primary next action is “Выбрать обложку”.

Cover catalog groups currently include:
- Свадебное
- Детское
- День рождения
- Семейное
- Путешествия
- Минимализм

The catalog is expected to evolve into real 466×246 mm cover previews.

## Platform

Current architecture:
- Next.js public web + editor;
- ASP.NET Core API;
- PostgreSQL;
- S3-compatible storage;
- Amvera deployment;
- n8n planned for CRM / Telegram workflows.

Public pages should be SEO-friendly.
Editor/account/checkout/admin/project surfaces should not be treated as SEO landing pages.

## UX priority

The user evaluates work visually and iteratively. Prefer visible, testable UI changes over abstract architecture. For major visual changes, produce a clear proposed composition before broad implementation when practical.
