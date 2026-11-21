# Yachiyo Claw Stronger Version (v0.0.27)

## Objective
Ship a more stable, competitive Android AI agent while preserving the unique Live2D personality, pink/liquid-glass aesthetic, and direct device-control focus.

## Debugging priorities
- Harden local model fallbacks and error recovery (LiteRT-LM / llama.cpp / GGUF).
- Improve continuous conversation reliability after API key / model list changes.
- Surface clearer failure reasons for PRoot sandbox, tool policy broker, and device backends.
- Validate Android 11/13/15-16 matrix for update path and agent loop.

## Competitor deltas
- Cherry Studio Mobile: multi-model side-by-side replies and polished UX density; keep Live2D + device agent as the differentiator.
- OpenClaw-style systems: stronger long-term memory, skill auto-persistence, and better MCP/skill hub integration.
- Preserve quirks: silver twin-tails Yachiyo, soft pink + liquid glass, quirky character responses, and native phone control.

## Ranked improvement paths
1. Stability + multi-model + memory (recommended)
2. UX polish only
3. Deep agent expansion (later)

## New graphics
Premium app icon: cute anime girl, silver-white twin-tails with red accents, soft pink and white liquid-glass style, subtle claw/AI circuit motif, rounded square. Keep the quirky charming personality. No text.
Target path: assets/brand/yachiyo-stronger-icon.png

## Next actions
- Add short “Stronger path” note to README.md
- Build debug APK via existing Actions or local Gradle
- Side-by-side test vs current preview
