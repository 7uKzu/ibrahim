# Happy Birthday, Ibrahim 👽🎉

A birthday site for Ibbi. It is plain HTML/CSS/JS with no build step.

Live at **https://7uKzu.github.io/ibrahim/**

## Editing

- **Friends' wishes**: open `messages.js`, copy one line, and change the text and name.
- **Birthday date, your name, cake message**: edit the `CONFIG` block at the top of `script.js`.
- **Music (optional)**: add a file called `assets/song.mp3`. A 🎵 button appears automatically and starts off.

## Expiry

The site closes itself at 12:00 AM on 31 October (`LIVE_UNTIL` in the `CONFIG` block of `script.js`). Set it to `null` to keep the site up. To fully take it down, turn off GitHub Pages in Settings → Pages.

## Testing the countdown

Add `?now=` to the URL to pretend it's a different moment. For example, `index.html?now=2026-10-25T12:00` shows the countdown.

## Publishing

In the repo, go to Settings → Pages, then choose Source: *Deploy from a branch* → `main` / `(root)`.

Original, uncompressed media is kept in `assets/originals/`.
