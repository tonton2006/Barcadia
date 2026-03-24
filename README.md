# Barcadia - Dungeon Drinking Game

A multiplayer fantasy drinking board game inspired by Heroes of Barcadia. Your drink is your health bar - take damage, take a drink!

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- npm (comes with Node.js)

## Quick Start

```bash
# 1. Clone the repo
git clone https://github.com/tonton2006/Barcadia.git
cd Barcadia

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Then open http://localhost:5173 in your browser.

## How to Play

1. Add 2-6 players
2. Click "Start Game"
3. Click adjacent tiles to move and explore
4. When you hit a monster, roll the D20
5. Win = defeat the monster, Lose = take damage (drink IRL!)
6. Last player standing wins

## Tech Stack

- **React 18** + TypeScript
- **Tailwind CSS** for styling
- **Zustand** for state management
- **Vite** for fast dev/build

## Development

```bash
npm run dev      # Start dev server
npm run build    # Production build
npm run preview  # Preview production build
```

## Project Structure

```
src/
  components/    # React UI components
  game/          # Core game logic
    types.ts     # TypeScript interfaces
    store.ts     # Zustand game state
  App.tsx        # Main app component
  main.tsx       # Entry point
```

## Legacy Python Version

The original Python prototype is still available in `game.py` for reference.

```bash
python game.py
```

## Roadmap

- [ ] P2P multiplayer with PeerJS
- [ ] Character classes with unique abilities
- [ ] Loot and treasure system
- [ ] Sound effects and music
- [ ] Custom artwork
