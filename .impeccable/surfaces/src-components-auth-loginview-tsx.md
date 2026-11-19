---
version: 1
slug: "src-components-auth-loginview-tsx"
primary_target: "src/components/auth/LoginView.tsx"
related_targets: []
---

## Surface
Login screen · Operate.

## Audience and job
ButuanEV cashiers, battery releasing officers, branch personnel, and administrators open the role-based workspace for branch operations.

## Task and content
Enter a work email and password, choose a preview role and branch, then continue. Role descriptions update with the selected role; Administrator uses all branches. The frontend is a UI preview: credentials are not verified by a server.

## Constraints
Keep the existing ButuanEV logo, navy / green / cyan palette, accessible form labels, password visibility control, validation, role choices, branch behavior, and preview-only disclosure. No backend authentication is added.

## Chosen direction
Electric Livery: an assertive, full-bleed brand canvas with a broad two-color livery band and a clean, immediately usable login form. The livery is the memorable first-view move; the role preview remains the functional center of the interaction.

## Direction contract
THESIS: Replace the generic split panel with a full-brand livery surface. Make ButuanEV's colors own the first impression while keeping sign-in unmistakable.
OWN-WORLD: Use the existing ButuanEV navy (#002353), green (#248D1F) and cyan (#06BAD1), real logo on its white field, and the project's Plus Jakarta Sans / DM Sans pairing. Form controls remain high-contrast and conventional; the band uses solid green with a cyan edge, never a gradient.
STORY: Staff recognize the ButuanEV workspace, enter their account, select a role and branch, then continue to the existing preview. The page clearly says that credentials are not verified by a server.
FIRST VIEWPORT: At desktop, a navy canvas fills the viewport. The compact logo lockup sits upper left; the 56px headline and operating copy lead on the left. A wide green livery band with a cyan lower edge sweeps through the right half behind a light 480px login surface. Email and password occupy the first form group, role and branch align beneath, the role description follows, and the full-width Continue action stays visible. At phone widths, the band becomes a short horizontal field above the form; all controls stack without horizontal scrolling.
FORM: Electric Livery, assigned lead at position 5 in the second roll hand; the no-answer fallback selected it. Seed reference: seed:a67cc23134aeed59.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved decisions
None. Authentication remains a frontend preview as already disclosed in the UI.
