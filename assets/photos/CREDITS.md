# Photography

Both images are from Unsplash under the [Unsplash License](https://unsplash.com/license):
free for commercial use, no attribution required. Credit is given below anyway,
as good practice — you can remove it without any licensing consequence.

| File | Role | Source |
|---|---|---|
| `hero-dark-2400.jpg` / `-1400` / `-800` | Homepage hero, **dark theme** | Pawel Czerwinski — "Blue light on black background" · https://unsplash.com/photos/eSBLv4Sg9r4 |
| `privacy-2000.jpg` / `privacy-1200.jpg` / `privacy-700.jpg` | "Private by design" band | "Dark hallway leading to office with desk and lamp" · https://unsplash.com/photos/TmzDwJAyQuA |
| `hero-light-2400.jpg` / `-1400` / `-800` | Homepage hero, **light theme** | "Photography of white concrete stairs" · https://unsplash.com/photos/R-wQExeiGrc |
| `about-2000.jpg` / `-1200` / `-700` | "We run our own company on AICOS" band | "People working late in a modern office at night" · https://unsplash.com/photos/v6JKMaqAwZE |

## Why these two

The craft rule applied here is *one decisive photo beats five mediocre ones*.
Several bright corporate-stock candidates (meeting rooms, people at laptops) were
downloaded and rejected — they read as exactly the generic stock register the
redesign exists to escape.

- **Hero** — near-black across the top third, where the nav and headline sit, with a
  blue field rising behind the approval console. The blue is close to `--accent`
  (#2563EB), so the photograph and the design system agree rather than compete.
- **Privacy band** — a frosted glass partition with a lit room beyond. Visible but
  not readable, which is the literal argument of that section.

## Replacing them

Drop a replacement in at the same three widths and filenames and nothing else needs
to change. To regenerate derivatives from a new source:

```sh
sips -Z 2400 source.jpg --out hero-2400.jpg
sips -Z 1400 source.jpg --out hero-1400.jpg
sips -Z 800  source.jpg --out hero-800.jpg
```

The hero wants a frame that is dark at the top and quiet in the centre — the headline
sits there. The band wants something dark enough to carry white text on its left half.
