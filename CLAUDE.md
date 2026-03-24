# Barcadia

A multiplayer fantasy drinking board game inspired by [Heroes of Barcadia](https://barcadiaboardgame.com/) - but with our own original spin.

## Vision

Turn-based dungeon-crawling party game for 6-10 players. Each player's drink is their health bar (the "Liquid Life" concept). When you take damage, you drink IRL. Last one standing - or first to complete the objective - wins.

### Core Experience
- **Shared Map**: Settlers of Catan style - everyone sees the same board with all player positions
- **Drink Icons**: Each player has a visible drink meter showing their remaining "health"
- **Dice Combat**: D20 rolls determine battle outcomes
- **Room Hosting**: One player hosts, others join via code/link
- **Fantasy Theme**: Original characters, abilities, and world - not Barcadia's IP

## Characters (Original)

Each character has a unique passive or active ability. Ideas to develop:

| Class | Flavor | Ability Direction |
|-------|--------|-------------------|
| Rogue | Sneaky, dagger-wielding | Dodge/reroll mechanics |
| Knight | Tank, heavy armor | Damage reduction or reflect |
| Warlock | Dark pact caster | Risk/reward abilities (sacrifice health for power) |
| Wizard | Classic arcane | Manipulate dice or tiles |
| Bard | Charisma, music | Affect other players' rolls |
| Cleric | Holy healer | Restore drink levels (dangerous in a drinking game) |
| Berserker | Rage mode | Stronger when low health |
| Trickster | Chaos agent | Swap positions, steal loot |

## Game Mechanics

### Turn Flow
1. Roll movement dice
2. Move on shared map
3. Reveal tile (if unexplored)
4. Resolve encounter (monster, loot, trap, event)
5. End turn - next player

### Combat
- Player rolls D20 vs monster difficulty
- Win: defeat monster, gain rewards
- Lose: take damage (drink IRL), your drink icon decreases

### Win Condition
TBD - options:
- Collect X power-ups and defeat final boss
- Be last player standing
- First to reach the center/goal

## Technical Direction

### Distribution Priority
**Goal**: Friends can play without technical hassle or hosting costs.

#### Recommended: Web-Based with Peer-to-Peer
- **Frontend**: Browser-based (works everywhere, no install)
- **Networking**: WebRTC peer-to-peer via [PeerJS](https://peerjs.com/) or similar
- **Hosting**: Static site on GitHub Pages, Netlify, or Vercel (free)
- **How it works**: Host creates room, gets a code. Others enter code to connect directly to host's browser. No server needed.

#### Alternative: Desktop Executable
- **Framework**: Tauri (Rust + web frontend) or Electron
- **Networking**: Direct socket connections or WebRTC
- **Distribution**: Share `.exe`/`.app` via Discord

### Tech Stack (Suggested)
```
Frontend:  React or Svelte (component-based UI)
Styling:   Tailwind CSS
Networking: PeerJS (WebRTC wrapper) - P2P, no server
State:     Zustand or similar (sync game state across peers)
Build:     Vite
```

### Current State
- `game.py`: Python skeleton with basic classes (Cup, Player, Monster, Tile, Game)
- This is a starting point - likely migrating to web stack for easier distribution

## Development Commands

```bash
# Python prototype
python game.py

# Future web setup (once established)
npm install
npm run dev
npm run build
```

## File Structure (Planned)

```
/src
  /components    # UI components (Board, PlayerCard, DiceRoll, etc.)
  /game          # Core game logic (state, rules, combat)
  /network       # P2P connection handling
  /assets        # Character art, tile images, icons
  /audio         # Sound effects, music
/public          # Static files
```

## Design Principles

1. **Fun First**: Rules should create memorable moments, not spreadsheet optimization
2. **Accessible**: Anyone can join with a link - no accounts, no installs
3. **Original**: Inspired by Barcadia, but our own characters, art, and mechanics
4. **Flexible**: Support different drink types (alcohol optional - water/soda works)
5. **Visual**: Drink meters and player positions always visible to all

## Art Style

TBD - consider:
- Pixel art (easier to create, nostalgic)
- Hand-drawn/sketch style
- Low-poly 3D rendered to 2D

## Out of Scope (For Now)

- Mobile native apps
- Persistent accounts/progression
- Monetization
- AI opponents

## References

- [Heroes of Barcadia](https://barcadiaboardgame.com/) - Original inspiration
- [BoardGameGeek Entry](https://boardgamegeek.com/boardgame/341027/heroes-of-barcadia) - Mechanics reference
- [PeerJS Docs](https://peerjs.com/docs/) - P2P networking
