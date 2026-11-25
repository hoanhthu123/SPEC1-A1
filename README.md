# LOOK INSIDE THE WITLING  

**Look Inside the Witling Program Version 1.0 24/11/2026**

## Usage notes

This program is a generative artwork made with p5.js. A leaf is torn down the middle. Thin threads grow across the tear and slowly stitch the two halves back together, while small circles flow along the leaf veins from the bubbles around the edge (chemical elements such as H₂O, CO₂, N₂ and city icons) back to the wound, carrying what is needed to heal it. Every time the artwork starts, the leaf colour, veins, threads and bubble labels are different.

The user can use the keyboard and the two round buttons in the bottom-right corner of the screen:

| Control | What it does |
| --- | --- |
| **R** key | Grows a new leaf with new colours, veins and threads, and the healing starts again (*see other living support one*). |
| **T** key | Reverses the process: the wound opens again, the threads snap, and the circles flow back from the wound to the bubbles (*see one living supports others*). Press **T** again to heal. |
| **I** key or **i** button | Opens the project information (names, course, and the idea behind the project). |
| **?** button | Opens the "How to Use" window. |
| **Esc** key | Closes any open window. |

## Installation instructions

Unzip `COMM2754-26t3-s3980573-A1-LookInsideTheWitling-Compilation.zip`. Users should start a web server in the root directory (the folder that contains `index.html`) and then open `index.html` through that server in their browser to see the results. The program is written only in HTML, CSS and JavaScript (p5.js); it does not use Python or any other language.

**Easiest way (VS Code):** install the "Live Server" extension, right-click `index.html` and choose
**Open with Live Server**. The artwork opens in the browser automatically.

**Other ways to start a local web server** (use any one; they only serve the files and are not part of the program):

- Node.js: `npx serve`, then open the address it shows.
- Python: `python -m http.server 5173`, then open http://localhost:5173.

A web server is needed because the browser blocks loading the icons in the `img/` folder when `index.html` is opened directly from the file system (double-click). No other dependencies or plug-in installation is required. An internet connection is needed to load p5.js and the Sarabun font.

### Files

| File | What it is |
| --- | --- |
| `index.html` | The page. It loads p5.js, `sketch.js`, `script.js`, `style.css` and the Sarabun font, and holds the text of the two pop-up windows. |
| `sketch.js` | The p5.js sketch: the torn leaf, veins, threads, bubbles, moving circles, and the **R** / **T** keys. |
| `script.js` | Opens and closes the two pop-up windows (**i** / **?** buttons, **I** and **Esc** keys). |
| `style.css` | Layout and style of the page, the round buttons and the pop-up windows. |
| `img/1.png` to `img/14.png` | Icons shown inside some of the bubbles. |
| `LICENSE` | Full text of the GNU General Public License v3 (the license of this project). |
| `licenses/p5.js-LGPL-2.1.txt` | Full text of the GNU Lesser General Public License v2.1 (the license of p5.js). |

## Documentation

Link to online documentation here: https://hoanhthu123.github.io/S3980573-Spec1-A1w5-OnlineDocument/   

Link to online artwork: https://hoanhthu123.github.io/s3980573-SPEC1-A1w5-P5jsArtwork/  

## License information

Look Inside the Witling is licensed under the GPL 3.0 license (GPL-3.0-or-later). See the
[LICENSE](LICENSE) file for more details.

Copyright (C) 2026 Hoang Anh Thu, Hoang Cong Tien

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version. This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
FITNESS FOR A PARTICULAR PURPOSE.

### Third-party open-source code and assets

| Software / asset | Used for | License | Source |
| --- | --- | --- | --- |
| [p5.js](https://p5js.org) 1.9.4 | Drawing, `random()`, `noise()` | GNU LGPL v2.1, see [licenses/p5.js-LGPL-2.1.txt](licenses/p5.js-LGPL-2.1.txt) | https://github.com/processing/p5.js, loaded from https://cdn.jsdelivr.net/npm/p5@1.9.4/lib/p5.min.js |
| [Sarabun](https://fonts.google.com/specimen/Sarabun) | Font of all text on the page and in the bubbles | SIL Open Font License 1.1 | Loaded from Google Fonts |
| Icons in `img/` | Icons inside the bubbles | TODO: license | TODO: where the icons come from (own drawings, or the website they were downloaded from) |

p5.js and Sarabun are loaded from the internet and are not copied into this project. The LGPL v2.1 license of p5.js is compatible with this project's GPL v3 license. No other open-source code was
copied into this project.

## Credits

Look Inside the Witling was created by **Hoang Anh Thu** (group
**DoubleHoang** include **Hoang Anh Thu**  and **Hoang Cong Tien** ) for the course COMM2754 Digital Media Specialization 1, Digital Media Program,
School of Communication and Design, RMIT University Vietnam, Saigon South Campus.

Contact: anhthuhoang2107@gmail.com or s3980573@rmit.edu.vn

The project responds to the UN Sustainable Development Goal 11 (Sustainable Cities and Communities)
and is inspired by Pawlyn, M. (2010), 'Using Nature's Genius in Architecture', TEDSalon London.

### Use of AI

- The concept (a torn leaf healed by threads and by resources flowing through its veins), the colour palettes, the bubble labels and icons, the texts, and the first draft of the code are by the authors.
- The code was simplified, debugged, extended and commented with help from an AI assistant (Claude, by Anthropic). With AI help the authors added: the moving circles along the veins and the bubble lines, the **T** key that reverses the process (wound opens, threads snap) and other code-checking.
