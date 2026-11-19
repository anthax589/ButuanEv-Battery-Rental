# DESIGN.md - ButuanEV Battery Rental System

## Design Overview
**Mode**: Operate (visitor completes tasks - fleet monitoring and battery rental management)
**Color Palette**: ButuanEV navy, cyan, and green over cool slate neutrals
**Primary Audience**: EV fleet operators, riders, system administrators
**Success Metrics Context**: Swap throughput < 3min, NPS > 30, uptime > 99.5%

---

## 1. Color System

### Brand Colors
- **Navy `#002353`** (`--logo-secondary`): Main actions, dark banners, headings, and navigation structure.
- **Cyan `#06BAD1`** (`--logo-primary`): Brand highlight. Use the darker accessible companion `#00778A` (`--logo-primary-strong`) for text, icons, and focus outlines on light surfaces.
- **Green `#248D1F`** (`--logo-accent`): Brand identity accent. Use the darker accessible companion `#1F751A` (`--logo-accent-strong`) for white-on-color controls and active navigation.

### Cool Neutral Range
- `slate-50` `#F6F9FC`: page canvas and quiet backgrounds.
- `slate-100` `#EEF3F8`: subtle grouping and hover surfaces.
- `slate-200` `#DCE6F0` / `slate-300` `#C4D2E0`: borders and dividers.
- `slate-400` `#5D748A` through `slate-600` `#3C5570`: secondary labels and body text.
- `slate-700` `#294561` through `slate-950` `#061B37`: headings, navigation, and high-contrast surfaces.

### Color Roles
- **Primary actions**: deep navy; use green for completed, available, or confirm actions.
- **Selection and focus**: cyan, with the darker companion for visible text/icon contrast.
- **Success and availability**: green.
- **Critical / warning**: preserve red and amber for battery, maintenance, and payment risk states.
- **Informational status**: a dark cyan ramp rather than unrelated electric blue.
- **Surfaces**: white cards over cool, lightly tinted slate backgrounds.

### Semantic Colors
- **Red**: critical SOC, damaged equipment, and destructive actions.
- **Amber**: low SOC, maintenance, and degraded conditions.
- Both remain distinct from brand green and cyan so operational states stay clear.

---

## 2. Typography Hierarchy

| Size | Weight | Line Height | Usage |
|------|--------|-------------|-------|
| `text-xs` | `font-medium` / `font-semibold` | - | Labels, badges, secondary text |
| `text-sm` | `font-medium` / `font-semibold` | - | Section labels, meta text |
| `text-base` / `text-sm` | `font-bold` | `tracking-tight` | Headings, metric labels |
| `text-xl` | `font-bold` | `tracking-tight` | Page section headers |
| `text-2xl` | `font-bold` | - | Metric values in summary cards |
| `text-3xl` | `font-black` / `font-extrabold` | - | Major headlines (welcome banner "Battery & EV Unit Daily Management") |

### Font Family
- **font-display**: Used for all headings and major text (`font-display` class)
- **font-mono**: Used for IDs, codes, technical details (`font-mono` class)

### Tracking & Weight Overrides
- `uppercase tracking-wider`: Section labels, category filters
- `font-semibold`: Primary button text, interactive elements
- `font-bold`: Metric values, headings, strong labels

---

## 3. Component Specifications

### 3.1 Welcome Banner (Operational Quick-Start)
- **Background**: `bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 rounded-xl p-5 md:p-6 text-white shadow-sm`
- **Border**: `border-b border-slate-700/50`
- **Layout**: Flex container `flex flex-col md:flex-row md:items-center justify-between gap-4`
- **Padding**: `p-5 md:p-6` (mobile/desktop spacing)
- **Child elements**:
  - Left: Branch breadcrumb `text-xs uppercase tracking-wider font-semibold text-slate-400`, heading `text-xl md:text-2xl font-bold tracking-tight mt-1 font-display`, paragraph `text-xs text-slate-300 mt-1 max-w-xl`
  - Right: CTA buttons `inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-50 rounded-lg transition-colors shadow-sm cursor-pointer`

### 3.2 Summary Cards Grid (11 Required Metrics)
- **Container**: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3`
- **Individual card**: `bg-white p-3.5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow`
- **Card structure**:
  - Top: `flex items-center justify-between text-slate-500 text-xs` (label + icon)
  - Bottom: `mt-2 flex items-baseline justify-between` (value `text-2xl font-bold font-mono text-slate-900` + subtitle `text-[10px] text-slate-400 font-medium`)
- **Icon sizing**: `w-4 h-4 text-slate-400` / `text-slate-600` / `text-slate-500` depending on metric type
- **Hover effect**: `shadow-sm hover:shadow-md transition-shadow` on card container

### 3.3 Important Alerts Strip
- **Grid**: `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs`
- **Alert card**: `p-3 rounded-lg border` (conditional: `bg-slate-50 border-slate-200` / `bg-red-50/80 border-red-200` for critical SOC)
- **Icon**: `w-4 h-4 text-slate-600` / `text-red-600` / `text-slate-500` depending on alert type
- **Count display**: `font-mono font-bold text-slate-700` (formerly text-red-700, preserved semantic red only for count)
- **Label text**: `text-slate-700` / `text-slate-600` for alert category names
- **Action buttons**: `px-2 py-0.5 rounded text-[10px] font-medium bg-red-600 hover:bg-red-500 text-white cursor-pointer` (Dock to Charge primary action)

### 3.4 Two-Column Layout
- **Left panel** (Active Rentals): `lg:col-span-2 bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs`
  - Header: `px-5 py-4 border-b border-slate-200 flex items-center justify-between`
  - Title: `font-bold text-slate-900 text-sm font-display`
  - Subtitle: `text-xs text-slate-500`
  - Table: `w-full text-left border-collapse text-xs` with `bg-slate-50 text-slate-500 border-b border-slate-200 font-medium` headers
  - Table rows: `hover:bg-slate-50/80 transition-colors`
  - Status badges: `px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-800` (Paid) / `bg-slate-100 text-slate-600` (Unpaid)
  - Action buttons: `px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-md transition-colors cursor-pointer`

- **Right panel** (Recent Activities): `bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs`
  - Header: `px-5 py-4 border-b border-slate-200 flex items-center justify-between`
  - Title: `font-bold text-slate-900 text-sm font-display`
  - Subtitle: `text-xs text-slate-500`
  - Activity feed: `p-4 space-y-3.5 max-h-[380px] overflow-y-auto divide-y divide-slate-100 text-xs`
  - Activity type: `font-semibold text-xs text-slate-700`
  - Timestamp: `text-[10px] text-slate-400 font-mono shrink-0`
  - Description: `text-slate-600 text-xs mt-1 leading-relaxed`
  - Footer meta: `flex items-center gap-2 text-[10px] text-slate-400 mt-1`

### 3.5 Tables (Rental Details, Payment Status)
- **Header row**: `bg-slate-50 text-slate-500 border-b border-slate-200 font-medium`
- **Cell padding**: `px-4 py-2.5` (data cells), `px-4 py-3` (header cells)
- **Text sizes**: `font-medium text-slate-900` (driver names), `font-mono text-slate-800` (codes), `text-slate-600 text-[11px]` (dates/branches)
- **Status badges**: `px-2 py-0.5 rounded text-[10px] font-semibold` with background/text combos
- **Payment status**: `bg-slate-100 text-slate-800` (Paid) / `bg-slate-100 text-slate-600` (Unpaid)

### 3.6 Navigation Elements
- **Section buttons**: `text-xs text-slate-700 hover:text-slate-800 font-semibold inline-flex items-center gap-1 cursor-pointer`
- **View All buttons**: Same pattern with count and chevron
- **Tab switching**: Consistent visual treatment across all tab-nav elements

### 3.7 Activities Feed Items
- **Type badge**: `font-semibold text-xs text-slate-700` (unified color, previously conditional by type)
- **Timestamp**: `text-[10px] text-slate-400 font-mono shrink-0`
- **Description**: `text-slate-600 text-xs mt-1 leading-relaxed`
- **Meta line**: `flex items-center gap-2 text-[10px] text-slate-400 mt-1` (By · · Branch)

---

## 4. Design Patterns & Decisions

### 4.1 Palette Commitment
- **Brand palette**: ButuanEV navy `#002353`, cyan `#06BAD1`, and green `#248D1F` lead the interface.
- **Cool tinted neutrals**: the slate utility ramp shifts toward navy for consistent text and surface hierarchy.
- **Semantic states**: red and amber retain critical and caution meanings; cyan replaces unrelated informational blue; green carries success.

### 4.2 Refinement Over Redesign
- **Preserved incumbent identity**: All functional flows, data displays, and interaction patterns kept intact
- **No factual copy changes**: All labels, copy, and data structures remain unchanged
- **Brand color extension**: Recolored shared utility ramps to match the supplied logo without changing layout or behavior

### 4.3 Operate-Mode Priorities
- **Scanability**: Clear hierarchy, consistent card patterns, scannable metric grid
- **Consistency**: Unified border radiuses (`rounded-lg`, `rounded-xl`), consistent spacing (`p-3.5`, `gap-3`), uniform hover states
- **Native expectations**: Standard table patterns, button interactions, form-like elements
- **Real usage scene**: Designed for 18:00-22:00 peak hours operation, dark-on-light contrast, clear alert visibility

### 4.4 Design Tokens Captured
- **Logo colors**: `--logo-secondary`, `--logo-primary`, `--logo-primary-strong`, `--logo-accent`, `--logo-accent-strong`.
- **Tailwind ramps**: brand-tinted `slate`, `emerald`, `blue`, and `cyan` utilities in `src/index.css`.
- **Spacing scale**: `p-3.5`, `p-5`, `p-4`, `py-4`, `px-5`, `gap-3`, `gap-4`, `gap-2`
- **Border radius**: `rounded-lg` (cards/buttons), `rounded-xl` (section containers), `rounded-md` (action buttons)
- **Shadow system**: `shadow-sm`, `shadow-xs`, no large shadows on primary surfaces
- **Transition**: `transition-colors`, `transition-shadow`, `transition-all` where applicable

### 4.5 Accessibility Considerations
- **Color contrast**: dark slate text on light surfaces; use the strong cyan and green companions for small text and white-on-color controls.
- **Focus states**: high-contrast cyan outline from `--logo-primary-strong`.
- **Text scaling**: `text-[10px]` / `text-[11px]` used for smallUI elements, scalable with browser zoom
- **Semantic color usage**: red for critical alerts, amber for caution, green for success, and cyan for information and focus.

---

## 5. Design System Notes

### 5.1 What Was Polished
- Shared slate, green, cyan, and informational ramps now follow the ButuanEV logo palette
- Consistent card designs with hover shadow effects
- Unified text color hierarchy (5 levels: slate-400 through slate-900)
- Standardized button and badge patterns
- Improved visual depth with subtle shadows and gradients

### 5.2 What Was Preserved (by design decision)
- **All functional logic**: Rental workflows, data filtering, state management
- **All component structures**: Tables, modals, forms, navigation patterns
- **All data displays**: Metrics, alerts, tables, activity feeds
- **Operational meaning**: Red for critical/SOC danger, amber for caution, green for success, cyan for information
- **All copy and labels**: No copy changes made

### 5.6 Future Design Extensions
- **INVENTORY views**: Can reference this DESIGN.md for palette consistency
- **MODAL designs**: Can adopt button/badge patterns from this spec
- **REPORTS view**: Uses the shared brand-tinted neutral and status ramps
- **MOBILE responsiveness**: All patterns are mobile-first by construction (sidebar collapse, grid columnStacking)

### 5.7 Design-Driven Technical Debt Reduction
- **Eliminates**: Inconsistent Tailwind color classes scattered across components
- **Reduces**: Cognitive load for new developers learning the codebase
- **Enhances**: Design-to-development hand-off with documented token system
- **Supports**: Future theming or palette updates with documented foundation
