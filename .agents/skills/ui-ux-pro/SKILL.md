---
name: ui-ux-pro
description: Expert UI/UX engineering guidelines for building polished, modern web interfaces with Tailwind CSS, Lucide icons, and Framer Motion micro-interactions. Activate whenever designing or implementing frontend components, views, or layouts.
---

# UI/UX Pro Design & Motion Guidelines

When building or refactoring UI components, adhere to these aesthetic and animation principles:

## 1. Visual Aesthetics & Hierarchy
- **Typography & Rhythm**: High contrast headlines (`font-semibold tracking-tight`), muted subtitles (`text-muted-foreground text-sm`).
- **Surface Elevation**: Layered neutral surfaces (`bg-background`, `bg-card`, `border-border/60`) with subtle backdrop blurs (`backdrop-blur-md`).
- **Color Accents**: Clean emerald/indigo accents for active badges, status indicators, and call-to-actions.

## 2. Framer Motion Animation Standards
All dynamic components must use Framer Motion (`framer-motion`) following these rules:

### Standard Spring Physics
Never use linear transitions for UI elements. Use natural spring physics:
- **Snappy Micro-interactions (Buttons, Badges, Toggles)**:
  `{ type: "spring", stiffness: 400, damping: 25 }`
- **Surface Transitions (Modals, Drawers, Dropdowns)**:
  `{ type: "spring", stiffness: 300, damping: 30 }`
- **Page & View Transitions**:
  `{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }`

### Core Motion Patterns
1. **Interactive States**:
   - Use `whileHover={{ scale: 1.015 }}` and `whileTap={{ scale: 0.98 }}` on primary cards and buttons.
2. **Mount / Unmount Transitions**:
   - Always wrap conditional views, modals, and tooltips in `<AnimatePresence mode="wait">`.
   - Standard fade-and-slide preset:
     ```tsx
     initial={{ opacity: 0, y: 8 }}
     animate={{ opacity: 1, y: 0 }}
     exit={{ opacity: 0, y: -8 }}
     transition={{ duration: 0.15 }}
     ```
3. **List Staggering**:
   - When rendering lists (e.g., project cards, triage groups, token tables), stagger child items:
     ```tsx
     const containerVariants = {
       hidden: { opacity: 0 },
       show: {
         opacity: 1,
         transition: { staggerChildren: 0.05 }
       }
     };
     ```
4. **Layout Continuity**:
   - Use `layout` and `layoutId="activeTab"` for moving focus indicators, tab pills, and filter buttons.
5. **Accessibility**:
   - Honor reduced motion using `useReducedMotion()`.
