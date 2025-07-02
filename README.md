# Heroes of Barcadia - Digital Skeleton

This repository contains a minimal Python implementation providing the basic
building blocks for creating a virtual version of the board game "Heroes of
Barcadia." It is intended as a starting point so you can add your own artwork,
custom monsters, bosses, and networking code.

The `game.py` module defines classes for players, cups (health), monsters, and
dungeon tiles. The `Game` class demonstrates how to generate a random map,
handle dice rolls, and apply damage. Difficulty and monster damage are
variables, allowing you to tweak how challenging encounters are.

## Quick Start

1. Install Python 3.10 or later.
2. Run the example game loop:

```bash
python game.py
```

This will create two players and explore a randomly generated map in the
console.

## Customization

- **Art**: Replace the `art_path` fields in `Monster` instances with paths to
  your own artwork.
- **Monsters/Bosses**: Create new `Monster` objects with different `damage` and
  `difficulty` values to adjust how punishing each encounter is.
- **Networking/UI**: The code currently runs in the console. You can expand it
  by adding a server/client layer or integrating with a GUI library like
  Pygame, Godot, or a web framework.

Feel free to modify and extend the project to fit your group’s needs.
