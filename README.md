# Tower of Babel — Two-Player Game-Based Japanese Learning Demo

Build a working demo of a two-player web game called **Tower of Babel**. The game is a "from-ge" (フロムゲー) style cooperative puzzle climber where two players collaborate to assemble Japanese sentences. The point is to demonstrate the information-gap mechanic and the three pedagogical tiers (vocabulary → particles → construction).

This is a **demo**, not a full production game. Prioritize getting one playable floor per tier (1, 31, 61) working end-to-end over polish. After the demo works, extend to more floors.

## Routing

Use App Router dynamic segments:

```
app/
  layout.tsx
  page.tsx                    → landing page with "Start at Floor 1" + floor selector
  Game/
    [floor]/
      page.tsx                → renders the floor matching the route param
```

So `localhost:3000/Game/1` loads floor 1, `localhost:3000/Game/31` loads floor 31, etc.

## Players

Two players, color-coded throughout the UI:

- **Player 1** (`#03AED2` — cyan blue)
- **Player 2** (`#FCB7C7` — pink)

Each player has their own pickup state, throw cooldown, and score contribution. Show both players' colors clearly on every screen so it's always obvious whose piece is whose.

For demo input on a single keyboard:
- Player 1: `AD` to move left and right, `w` to pick up / throw, `s` to drop
- Player 2: `left-arrow,right-arrow` to move left and right, `up-arrow` to pick up / throw, `down-arrow` to drop

## Game mechanics by tier

### Tier 1: Vocabulary (Floors 1–30)

- The **English word** is displayed large at the center of the screen.
- **Puzzle pieces** are scattered around the play area, each carrying one Japanese word (the correct answer + dummies from the same semantic genre).
- **Both players** can pick up any piece.
- A player picks up a piece, walks to the **goal zone** at the bottom-center, and throws.
- If the thrown piece is the correct Japanese word, the floor completes and the game advances to the next floor. If wrong, the piece returns to its starting position and play continues.

Data shape:
```ts
{
  floor: 1,
  tier: "vocabulary",
  JP: "猫",
  EN: "cat",
  dummies: ["犬", "猿", "鳥"]   // same-genre distractors
}
```

### Tier 2: Particles (Floors 31–60)

- A partly-complete sentence is shown at the center, with **particles replaced by underscores or blank slots**.
- Puzzle pieces carry particles (`の`, `は`, `を`, `が`, `に`, `で`, `へ`, etc.) — the correct ones plus dummies.
- **Both players** can pick up any piece.
- Players throw particle pieces into the **specific blank** they belong to (each blank is its own goal zone).
- The floor completes when all blanks are filled correctly.

Data shape:
```ts
{
  floor: 31,
  tier: "particles",
  JP: "猫のお腹はふわふわ",
  EN: "a cat's belly is super soft",
  incomplete: ["猫", "_", "お腹", "_", "ふわふわ"],   // _ = blank slot
  answer: ["の", "は"],                                // in slot order
  dummies: ["を", "が", "に", "で"]
}
```

### Tier 3: Construction (Floors 61–100)

- The full sentence is **completely blank** — every position is a slot.
- This is where the **information-gap mechanic** is most explicit. The two players have **complementary roles**:
  - One player can only pick up **vocabulary pieces** (nouns, verbs, adjectives).
  - The other player can only pick up **particle pieces**.
- **Roles swap every 10 floors** to ensure both players practice both sides:
  - Floors 61–70: Player 1 = vocab, Player 2 = particles
  - Floors 71–80: Player 1 = particles, Player 2 = vocab
  - Floors 81–90: Player 1 = vocab, Player 2 = particles
  - Floors 91–100: Player 1 = particles, Player 2 = vocab
- Pieces a player cannot pick up should appear visually dimmed for that player.
- The floor completes when all slots are filled with the correct piece in the correct order.

Data shape:
```ts
{
  floor: 61,
  tier: "construction",
  JP: "猫は可愛いのでもふもふしたい!",
  EN: "cats are cute, so I want to fluf them!",
  incomplete: ["_", "_", "_", "_", "_"],
  answer: ["猫", "は", "可愛い", "ので", "もふもふしたい!"],
  vocab_pieces: ["猫", "可愛い", "もふもふしたい!"],
  particle_pieces: ["は", "ので"],
  dummies: {
    vocab: ["犬", "嬉しい", "走りたい!"],
    particle: ["を", "が", "から"]
  }
}
```

## File structure

```
app/
  layout.tsx
  page.tsx                          # landing
  Game/[floor]/page.tsx             # floor renderer (delegates to tier component)
components/
  game/
    Floor.tsx                       # routes by tier to the right component
    VocabularyFloor.tsx             # tier 1
    ParticleFloor.tsx               # tier 2
    ConstructionFloor.tsx           # tier 3
    PuzzlePiece.tsx                 # draggable piece, carries a word/particle
    GoalZone.tsx                    # drop zone (single goal for tier 1, multi for tier 2/3)
    PlayerCursor.tsx                # WASD / arrow-key controlled cursor with player color
    HUD.tsx                         # floor number, tier label, both players' colors
data/
  floors.ts                         # typed Floor[] array
store/
  gameStore.ts                      # Zustand: current floor, players, pieces, goals
types/
  index.ts                          # Floor, Piece, Player, Tier types
```

## Demo data — at minimum populate these floors

To prove the mechanics work, populate **at least these 9 floors**:

- **Vocabulary:** floors 1, 2, 3
- **Particles:** floors 31, 32, 33
- **Construction:** floors 61, 71 (to show the role swap), 81

Use this seed content (extend with your own as needed):

| Floor | JP | EN |
|---|---|---|
| 1 | 猫 | cat |
| 2 | 犬 | dog |
| 3 | 鳥 | bird |
| 31 | 猫のお腹はふわふわ | a cat's belly is super soft |
| 32 | 犬が公園で走る | the dog runs in the park |
| 33 | 鳥は空を飛ぶ | the bird flies in the sky |
| 61 | 猫は可愛いのでもふもふしたい! | cats are cute, so I want to fluf them! |
| 71 | 犬と公園に行きたい | I want to go to the park with my dog |
| 81 | 鳥の歌を聞くのが好き | I love listening to birds sing |

## Visual style

- **Pixel-art / arcade aesthetic.** Chunky 8-bit feel, no rounded smooth corners. Tailwind defaults are fine; no need to source pixel-art sprites for this demo.
- **High contrast.** Dark background, bright player colors, crisp white text for Japanese.
- **Furigana over kanji** on tier 1 only (helps with vocabulary recognition). Tier 2 and 3 should not have furigana — learners need to recognize kanji at those tiers.
- **Clear floor indicator** in the top-left: `FLOOR 31 / 100  ·  PARTICLES`.
- **Tier color accent:** vocabulary = cyan, particles = yellow, construction = magenta.

## Acceptance criteria

The demo is "done" when:

1. `npm run dev` starts the app without errors.
2. Visiting `/Game/1` shows a working vocabulary floor where two players (split keyboard) can each pick up pieces, throw them at the goal, and advance to floor 2 on a correct throw.
3. Visiting `/Game/31` shows a working particle floor with multiple blank slots.
4. Visiting `/Game/61` shows a working construction floor where Player 1 can only pick up vocabulary pieces and Player 2 can only pick up particle pieces.
5. Visiting `/Game/71` shows the role swap (Player 1 = particles, Player 2 = vocab).
6. The HUD always shows both players' colors and the current floor number / tier label.

## Out of scope for this demo

- Real-time networking (single-screen split keyboard is fine)
- Sound effects
- Save / progress persistence beyond URL routing
- Floor selection menu beyond a basic list on the landing page
- Mobile controls
- More than 9 populated floors (the framework should support 100, but only 9 need data)

Build it. Start with the type definitions and the floor data, then the Zustand store, then the Floor router component, then the three tier components in order (Vocabulary → Particles → Construction). Test each tier before moving to the next.
