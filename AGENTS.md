# Neva-Book Agent Operating Guide

This repository contains the Neva-Book public website, photobook editor, API, and production-related integration code.

## Source of truth

Before changing UI, read:
1. `PRODUCT.md` — durable product/business truth.
2. `DESIGN.md` — visual and interaction system.
3. The relevant skill under `.agents/skills/`.

User-approved product behavior wins over generic design advice.

## Agent routing

### Neva UX Director
Use `.agents/skills/neva-ux-director/SKILL.md` first for:
- new flows;
- editor layout changes;
- page hierarchy;
- multi-step journeys;
- ambiguous UI requests;
- deciding which specialist should act next.

### Neva Visual Taste
Use `.agents/skills/neva-visual-taste/SKILL.md` for:
- public website art direction;
- landing/product pages;
- typography, composition, spacing, imagery;
- premium brand presentation;
- redesign of marketing surfaces.

Do not use it to change the photobook editor's business logic.

### Neva Interaction Design
Use `.agents/skills/neva-interaction-design/SKILL.md` for:
- buttons, sliders, drag/drop, crop/zoom;
- hover/press/focus states;
- transitions and micro-interactions;
- perceived responsiveness;
- motion review.

## Immutable working rules

- The native NevaBook 1.1 application is the functional reference for the photobook editor.
- Do not remove or redesign approved editor mechanics merely for visual novelty.
- The public website and the editor are separate visual modes.
- Public site: Neva-Book dark navy / gold / warm-light identity.
- Editor: preserve its existing dark professional workspace palette unless the user explicitly asks to change it.
- Never replace, redraw, crop, simplify, or reinterpret the user-provided Neva-Book logo without explicit approval.
- Prefer one clear primary action per step.
- Avoid card-inside-card layouts, unnecessary pills, fake metadata, decorative technical jargon, and generic AI/SaaS aesthetics.
- Optimize desktop editor usability first, then adapt deliberately for smaller screens.
- Never let photo lists, timelines, or sidebars increase the document height enough to push the active spread out of the viewport.
- UI state that matters to production must be explicit and serializable.

## Required change process

For substantial UI work:
1. State the user goal and the current surface mode: `Persuade` (marketing) or `Operate` (editor/tool).
2. Preserve approved product constraints.
3. Shape information architecture before styling.
4. Implement.
5. Check desktop + small-laptop behavior.
6. Check keyboard/focus/accessibility where applicable.
7. Check empty/loading/error/overflow states.
8. Run repository CI before merging.

Do not perform broad redesigns when the request is a narrow correction.
