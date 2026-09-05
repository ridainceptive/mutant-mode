# MUTANT MODE

A 5×4 neon mutant slot built on the [Ape Church game template](https://github.com/ape-church/ape-church-game-template).

## Local

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Play

1. Set an APE bet and spin count in the HUD panel.
2. Place the bet (`playGame` currently mocks the on-chain transaction).
3. Press **Spin** for each planned result.
4. After the last spin: Play Again, Rewatch, or Change Bet.

Wild: Mutation Ooze. Scatter: Jackpot crate (pays anywhere). 20 paylines.

## Ape Church submission

Game files live in `components/my-game/` while developing against this template (`app/page.tsx` imports that path). Assets and `metadata.json` already use the `mutant-mode` name.

Before opening a PR on [ape-church-game-submissions](https://github.com/ape-church/ape-church-game-submissions):

- Replace `YOUR_TELEGRAM_USERNAME` and the zero payout address in `metadata.json`
- Move components to `components/games/mutant-mode/`
- Move assets to `public/submissions/mutant-mode/`
- Copy metadata to `submissions/inceptive/mutant-mode/metadata.json`

## Docs

- https://docs.ape.church/building/build-a-game
- `docs/GAME-HUD.md`
- `SKILL.md`
