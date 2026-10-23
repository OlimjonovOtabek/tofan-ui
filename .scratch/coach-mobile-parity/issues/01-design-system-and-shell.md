# 01 Design system and shell

Status: resolved

Port the mobile design system and replace the coach shell.

- Colors from `lib/core/theme/color/palette.dart` as coach CSS tokens for light and dark, and the Optimus preset mapped onto them.
- Inter variable font, self-hosted; type scale from `base_style_theme.dart` and `title_theme.dart`.
- Radii, heights and paddings from `dimensions.dart` (button 54/48/40 and radius 16, input 48/44 and radius 14, card radius 20 and padding 16, hero radius 24, tag radius 8, segmented 44 with radius 14/10).
- Mobile SVG icons as a coach icon sprite and `coach-icon` component.
- Coach UI primitives in `apps/coach/src/app/core/ui`, one per mobile component that the screens use: button styles, card, section card, section header, tag, segmented control, filter chip, choice chips, option tile, stat tile, metric tile, tile pair, numbered tile, empty state, note, avatar, count pill, info row, switch row, linear progress, shimmer, action sheet, confirm sheet, text input sheet, app bar with back.
- Shell: sidebar with Dashboard, Programs, Clients, Chat, Profile on desktop; floating bottom tab bar (66px, radius 34, blur, active pill) at phone width; theme light, dark or system.
- Plural support in `core/i18n` so the mobile ICU plural texts can be ported.

