# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
expo start          # Start Expo dev server
expo run:ios        # Run on iOS simulator/device
expo run:android    # Run on Android emulator/device
expo start --web    # Run in web browser
```

No test runner, linter, or formatter is configured.

## Architecture

**Expo SDK 54 / React Native 0.81 / React 19 / TypeScript** — portrait-only mobile blackjack game.

### Navigation

No routing library. `Root.tsx` uses state-based screen switching:

```
index.tsx → Root.tsx (screen: 'MENU' | 'GAME' | 'SETTINGS')
                ├── MainMenu.tsx   — entry screen, spinning Ace card
                ├── App.tsx        — full game (monolithic, ~1200 lines)
                └── SettingsScreen.tsx — language/volume controls
```

`Root.tsx` owns shared state (language, musicVolume, gameVolume) and passes it down via props. No Redux/Context — all state management uses React hooks.

### Game Logic (App.tsx)

Game status flow: `BETTING → PLAYING → DEALER_TURN → GAME_OVER → BETTING`

- **Betting phase**: Chip tray with denominations (5/10/50/100/200/500/1000). Higher chips unlock at bankroll thresholds (`minBalance`). Chips animate flying into the pot.
- **Playing phase**: Hit, Stand, Double Down, Split actions on player hands.
- **Dealer turn**: Automated card draws with delays.
- **Game over**: Results calculated, payouts applied, bankruptcy overlay at $0.

Core types are in `types.ts`. Deck is a 4-deck shoe (208 cards) created/shuffled in `utils/gameLogic.ts`.

### Animation Patterns

Heavy use of React Native `Animated` API with `useNativeDriver: true`. Key patterns:
- Card entrance: staggered translateY with Easing (Card.tsx)
- Chip flying: AnimatedValueXY from chip tray to pot (App.tsx)
- MainMenu spinning card: continuous rotateY loop

### Responsive Sizing

Uses `Dimensions.get('window')` — cards shrink on small devices (<380px width). Card dimensions: 72x100 default, 56x80 small.

## Color Theme

| Usage | Color |
|-------|-------|
| Background (felt green) | `#064e3b` |
| Gold (bankroll, titles) | `#FFD700` |
| Amber (buttons) | `#f59e0b` |
| Settings background | `#065f46` |

## Localization

All UI text changes must include **both Turkish and English** variants. The app supports two languages controlled by the `language` prop passed from `Root.tsx` (`'tr'` | `'en'`). When adding or modifying any user-facing string:

- Add the Turkish (`tr`) string
- Add the English (`en`) string
- Never hardcode a single language — always use both options

Example pattern:
```ts
const labels = {
  tr: { deal: 'DAĞIT', hit: 'ÇEK', stand: 'DUR' },
  en: { deal: 'DEAL', hit: 'HIT', stand: 'STAND' },
};
```
Always use Context7 MCP when I need library/API documentation, code generation, setup or configuration steps without me having to explicitly ask.

Always use the Expo MCP server (`expo`) throughout development — for Expo/React Native API lookups, SDK compatibility checks, EAS build info, and package-related questions.


## Config Notes

- Path alias: `@/*` maps to `./*` (tsconfig)
- New Architecture enabled (`newArchEnabled: true` in app.json)
- ES modules (`"type": "module"` in package.json)
- Uses `lottie-react-native` for animations
