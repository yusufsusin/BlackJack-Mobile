# BlackJack Mobile

A professional Blackjack game built with React Native and Expo, featuring a modern design and smooth animations.

## 🚀 Key Features

- **Advanced Betting Experience**: A smart betting system where chips automatically center themselves in the pot area and shift dynamically as new denominations are added.
- **Fluid Animations**: High-performance animations using the `Animated` API for flying chips, card dealing, and pot "pop" effects.
- **Game Mechanics**: Full implementation of standard Blackjack rules, including Split, Double Down, Dealer hitting on soft 17, and more.
- **Dynamic Chip Availability**: Higher-value chips ($200, $500, and $1000) automatically appear in the menu as your total wealth (Cash + Current Bet) increases.
- **Bankruptcy Protection**: An automatic bonus system that grants $1,000 if your balance and current bet both hit zero, ensuring the game never stops.

## 🛠️ Tech Stack

- **Framework**: [React Native](https://reactnative.dev/) with [Expo](https://expo.dev/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **State Management**: React Hooks (`useState`, `useCallback`, `useRef`)
- **Animations**: `Animated` API with Native Driver support
- **UI/UX**: Custom-designed casino-themed components

## 📦 Installation & Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the application:
   ```bash
   npx expo start
   ```

3. Open the app via the Expo Go app by scanning the QR code, or use an iOS/Android emulator.

## 🎮 How to Play

1. **Place Your Bet**: Click on any chip at the bottom to add it to the pot. If you want to undo a bet, simply click the chips already in the pot.
2. **Deal**: Press the "DEAL" button to start the hand.
3. **Make Your Move**: Choose to Hit, Stand, Double Down, or Split based on your hand's value.
4. **Win**: Beat the dealer's hand without busting to increase your bankroll!

---
*Developed as a hobby project to showcase modern React Native development.*
