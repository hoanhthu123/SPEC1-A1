# The Healing Web

A generative p5.js sketch: a leaf is torn in two, and spider threads grow across the tear
until the halves are pulled back together. Each reload makes a different leaf and web.

## Run

Serve the folder with any static server and open http://localhost:5173. For example:

```bash
python -m http.server 5173
```

(Python is only used here as a simple local web server. The artwork itself is p5.js / JavaScript.)

Press **R** for a new web without reloading.

## Files

| File | What it is |
| --- | --- |
| `index.html` | The page. It loads p5.js and `sketch.js`. |
| `sketch.js` | **Main sketch, simple version** (beginner level, fully commented). |
| `sketch-v2-advanced.js` | An extended version with cutting, spiders and paper texture. Not used by default. To try it, change `sketch.js` to `sketch-v2-advanced.js` in `index.html`. |
| `LICENSE` | Full text of the GNU General Public License v3 (the license of this project). |
| `licenses/p5.js-LGPL-2.1.txt` | Full text of the GNU Lesser General Public License v2.1 (the license of p5.js). |

## Authorship and use of AI

- The concept (a leaf repaired by spider silk), the colour palette and the first draft of the code are by the author.
- The code was simplified, debugged and commented with help from an AI assistant (Claude, by Anthropic).
  The main fixes, each marked with a `FIX:` comment in `sketch.js`, were:
  - a random seed on every reload,
  - threads anchored inside the leaf so they stay visible,
  - the thread colour no longer being overwritten by a second `stroke()` call.
- `sketch-v2-advanced.js` was mostly written by the AI assistant.
- TODO (author): review and edit the AI-assisted code in your own way, and add your own comments,
  before submitting or publishing.

## License

Copyright (C) 2026 The Healing Web author

This program is free software: you can redistribute it and/or modify it under the terms of the
GNU General Public License as published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without
even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See
[LICENSE](LICENSE) for the full text.

SPDX identifier: `GPL-3.0-or-later`

## Third-party open-source code

| Software | Used for | License | Source |
| --- | --- | --- | --- |
| [p5.js](https://p5js.org) 1.9.4 | Drawing, `random()`, `noise()` | GNU LGPL v2.1, see [licenses/p5.js-LGPL-2.1.txt](licenses/p5.js-LGPL-2.1.txt) | https://github.com/processing/p5.js, loaded from https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js |
| [JetBrains Mono](https://www.jetbrains.com/lp/mono/) | Font of the text in the frame | SIL Open Font License 1.1 | https://github.com/JetBrains/JetBrainsMono, loaded from Google Fonts |

p5.js is loaded from a CDN and is not copied into this project. Its LGPL v2.1 license is compatible
with this project's GPL v3 license. No other open-source code was copied into this project.
