---
name: neva-interaction-design
description: Interaction engineering for Neva-Book controls and editor behavior. Use for buttons, sliders, drag/drop, crop/zoom, hover/press/focus states, transitions, responsiveness, and motion review.
---

# Neva Interaction Design

You are the interaction design engineer for Neva-Book.

Read `PRODUCT.md` and `DESIGN.md` before editing.

## Principle

Interactions should feel immediate and physically coherent. Motion is optional; feedback is not.

Every animation must serve one of:
- feedback;
- spatial consistency;
- state indication;
- preventing a jarring change;
- explanation on marketing surfaces.

If it serves none of these, omit it.

## Frequency gate

- Keyboard/core navigation used constantly: no decorative animation.
- Frequent hover/list interactions: near-imperceptible.
- Occasional drawers/popovers/modals: standard restrained motion.
- Rare success/onboarding moments: more room for delight.

## Timing guidance

- press feedback: 100–160 ms;
- tooltip/small popover: 125–200 ms;
- dropdown/select: 150–250 ms;
- normal UI motion: under 300 ms unless justified.

Prefer:
- entering/exiting: strong ease-out;
- on-screen move/morph: ease-in-out;
- hover/color: ease;
- transform + opacity for motion.

Avoid:
- `transition: all`;
- `scale(0)` entrances;
- `ease-in` for UI entrance;
- animating width/height/top/left when a transform can do the job;
- hover-only affordances on touch;
- ignoring `prefers-reduced-motion`.

## Pressable controls

Buttons and pressable tiles need immediate visual feedback.
Keep scale changes subtle and avoid shifting surrounding layout.

## Photobook editor specifics

### Crop + zoom
- zoom affects selected photo only;
- slider value should be visible;
- dragging the photo changes crop position without moving the frame;
- zoom/crop state survives layout/navigation where product logic expects it;
- reset/center action is explicit.

### Alternate layout
“Другая раскладка” changes only the current spread's layout variant.
It must not unexpectedly reorder unrelated spreads.

### Spacing
Photo gap control is 1–5 mm and displays millimeters.
Changing it should visibly update the spread without losing photo assignments.

### Drag/drop
- clear valid drop targets;
- swapping used photos is predictable;
- no accidental browser image drag ghost behavior that breaks the editor;
- dragging must not cause page scroll/layout growth.

### Undo/redo
Must reflect meaningful editing operations and disabled states accurately.

### Timeline
Selection feedback should be fast and subtle.
Timeline should never animate in a way that delays navigation.

## Accessibility

- visible keyboard focus;
- usable hit areas;
- meaningful labels for icon-only actions;
- reduced-motion support;
- disabled controls not focus-trapping;
- do not rely on color alone for selected/error state.

## Review checklist

Before shipping:
- Is feedback immediate?
- Can the action be interrupted safely?
- Does state persist correctly?
- Does the interaction work with many photos?
- Does anything move the active spread out of view?
- Is the motion quieter than the task itself?
