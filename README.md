# Turkey versus Person

A 10-second Thanksgiving stacking race. You're the Turkey Team: drag food from
the tray onto your stack as fast as you can. The computer's Person Team builds a
house at the same time. When the timer hits zero, the taller stack wins the
Building Trophy. Concept and title by Amelia.

## How to play

- Press **Play!** and pick Easy, Medium or Hard first if you like.
- After 3, 2, 1, GO! drag each food piece from the tray **up onto your stack**.
  Let go anywhere in the glowing area and it snaps on.
- A piece let go outside the glow falls off and doesn't count.
- Keyboard: **Space** or **Enter** places the next tray piece.
- A tie restarts the race.

## Run it locally

ES modules don't load from `file://`, so start a small local server in this
folder:

```bash
npx serve .
```

or

```bash
python3 -m http.server 8000
```

Then open the address it prints (for example http://localhost:8000).

## Put it online (GitHub Pages)

1. Create a public GitHub repo named `turkey-versus-person`.
2. Push these files to `main`.
3. In the repo go to Settings → Pages, set Source to "Deploy from a branch",
   branch `main`, folder `/ (root)`.
4. Share `https://<username>.github.io/turkey-versus-person/`.

All paths are relative, so it works under that subpath.

## Tuning

Everything worth tweaking after a playtest is in `js/config.js`: round length,
countdown speed, the difficulty table, pause beats, tray size, snap zone and
the tie message length.

## Files

```
index.html        single page, all screens
css/style.css
js/main.js        boot, screen state machine
js/config.js      tunable numbers
js/round.js       countdown, timer, end of round, tie/results
js/player.js      tray, drag-and-drop, keyboard fallback
js/computer.js    house-building opponent
js/stack.js       stack logic, wobble, zoom-out
js/art.js         every picture as inline SVG
js/audio.js       Web Audio sound effects, music, mute
js/storage.js     localStorage wrapper (safe when blocked)
```

Saved in the browser: difficulty, mute, best score, trophy count and whether the
how-to-play screen has been seen.
