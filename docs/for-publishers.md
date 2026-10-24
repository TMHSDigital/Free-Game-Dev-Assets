# For publishers

If you make one of the libraries, packs or tools in this catalog, this page says what the catalog records about it and how to change that. You do not need to read the contributor guide.

## What an entry records

Each source has one page with:

- a link to your own page, never a mirror; nothing you publish is rehosted or downloaded through the catalog;
- the licence as the catalog reads it, with the commercial stance and whether credit is required;
- an Evidence section that quotes your licence page word for word, with the date it was read;
- a `verified` date, the last time someone read your licence at the source;
- your publisher name, where you have more than one entry.

The catalog's reading is not legal advice, and it is only as current as the verified date. The quotes stay your words.

## Fix a fact

Open a [Correction](https://github.com/TMHSDigital/Free-Game-Dev-Assets/issues/new?template=correction.yml) issue and choose "I publish this source". Quote the live page that shows the right fact. A wrong licence claim is treated as worse than a missing entry, so these are handled first. You can also edit the entry file and open a pull request.

## Hear about re-reads

Licences are re-read in monthly batches, oldest first. To see when yours is re-read, follow the [re-verified feed](https://tmhsdigital.github.io/Free-Game-Dev-Assets/reverified.xml) or watch the repository.

## Preview images

An entry may show your page's own preview image (`og:image`), resized to 640 pixels wide, with a caption naming you and the licence it is shown under. The rules are narrow:

- only `active` entries under an open licence get one; custom licences never do;
- tools and fonts get one only from an image a maintainer has checked, because a program's licence does not cover its logo or social card;
- a CC-BY image is captioned with your credit line.

To remove yours, or to suggest a better image, open a [Correction](https://github.com/TMHSDigital/Free-Game-Dev-Assets/issues/new?template=correction.yml) issue and choose "I publish this source". The maintainer sets `preview: none` and the image is deleted on the next run.

## List your own work

You are welcome to add your own sources. Say that you publish it, write the entry as a third party would (facts your page states, no comparisons or ranking language), and start it at `needs-review` so a maintainer re-reads the licence before it goes `active`. A free tier of a paid product is listed as the free tier only. The [New source](https://github.com/TMHSDigital/Free-Game-Dev-Assets/issues/new?template=new-source.yml) form has a box to say you are the publisher.

## Link to your entry

Each entry has a stable address:

```text
https://tmhsdigital.github.io/Free-Game-Dev-Assets/entry/<id>/
```

The `<id>` is the entry's file name, for example `kenney` for `catalog/3d/kenney.md`.
