# Neva-Book Design System

## Two visual modes

### 1. Public website — Persuade
Goal: present Neva-Book as an established premium print/bookbinding workshop and move visitors toward a relevant product or service.

Visual language:
- deep navy surfaces;
- gold accents from the logo;
- warm ivory / paper neutrals;
- strong editorial typography;
- real product photography whenever available;
- generous whitespace;
- confident, established, material/print-oriented feel.

Avoid:
- generic blue/purple SaaS gradients;
- glassmorphism by default;
- excessive rounded cards;
- cards nested inside cards;
- meaningless badges/pills;
- fake “system” labels;
- startup-style jargon;
- visual effects that compete with products.

The six core product categories should be immediately understandable and image-led.

### 2. Photobook editor — Operate
Goal: help a customer finish a book quickly and confidently.

Priorities, in order:
1. active spread remains visible;
2. photos remain easy to browse;
3. current action/state is obvious;
4. layout/crop controls are close to the work;
5. timeline remains reachable;
6. next step is explicit;
7. visual decoration never steals workspace.

Do not apply the marketing site's gold-heavy styling to the editor unless explicitly requested.

## Editor layout contract

Desktop baseline:
- left: photo bank;
- center: active spread/workspace;
- right: spread/photo parameters + next-step action;
- bottom: spread timeline.

The editor shell must fit the browser viewport.
Independent panels scroll internally.
Photo count must never increase overall page height.
The active spread must auto-fit by both width and height.

## Interaction hierarchy

Primary actions:
- public product page: choose/order/start;
- editor spread stage: progress toward “Выбрать обложку”;
- cover stage: choose cover and proceed to order/review.

Secondary tools should not visually compete with the primary next-step action.

## Controls

- Button labels should describe the result: “Другая раскладка”, “Выбрать обложку”, not abstract verbs.
- Sliders show current numeric value when meaningful.
- Spacing control uses millimeters and is constrained to 1–5 mm.
- Zoom control applies to the selected photo crop only.
- Destructive or irreversible actions require clear affordance/confirmation.
- Disabled states must look disabled.

## Typography

Public site:
- editorial display face may be serif;
- supporting text should be calm and highly readable;
- clear scale contrast, not oversized text for its own sake.

Editor:
- compact sans-serif UI;
- prioritize scanability and density appropriate to a professional tool;
- no decorative display type in controls.

## Motion

Motion must serve feedback, spatial consistency, state indication, or preventing a jarring change.

Default interaction guidance:
- press feedback: subtle 100–160 ms;
- dropdown/select: 150–250 ms;
- normal UI motion: under 300 ms unless there is a concrete reason;
- prefer transform/opacity;
- avoid animation on repeated keyboard navigation;
- respect reduced motion;
- no bounce by default.

## Responsive behavior

Public site should adapt fluidly to mobile.

The photobook editor is desktop-first. On smaller widths:
- preserve active spread visibility;
- collapse or temporarily overlay secondary panels rather than shrinking the spread into unusability;
- do not simply stack all editor panels into a very tall page.

## Asset discipline

Use exact user-provided brand/product assets when available.
Never invent a replacement logo when the actual logo exists.
Temporary imagery must be clearly replaceable and must not become a hidden dependency.
