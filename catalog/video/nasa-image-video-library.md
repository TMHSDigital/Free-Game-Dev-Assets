---
id: nasa-image-video-library
name: NASA Image and Video Library
url: https://images.nasa.gov
publisher: NASA
category: video
subcategories: [images, video, audio]
license: custom
commercial: unknown
attribution_required: true
attribution_string: "NASA"
formats: [JPG, MP4, WAV, TIFF]
tags: [government, space, audio, video, endorsement-trap]
verified: 2026-10-04
status: needs-review
---

# NASA Image and Video Library

Searchable NASA stills, video, and audio (launch audio, mission clips, press kits). This is not a CC0 SFX pack. US government NASA media is generally not copyrighted in the United States, with three traps that keep this out of `active`: (1) `images.nasa.gov` returned a JS shell with no license sentence on 2026-08-24, so the grant is the Brand Center guidelines, not the library UI; (2) the commercial section talks about editorial use in "published works that are not promotional" plus a ban on implying NASA endorsement, which does not clearly cover shipping media inside a commercial game; (3) third-party stills on NASA pages stay with their marked owners. [nasa-3d-resources](../3d/nasa-3d-resources.md) is the 3D sibling and is `active` on the same guidelines. This library entry stays `needs-review` until a game-use sentence exists or counsel reads the promotional clause.

## Notes

- Terms: [NASA Images and Media Usage Guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/)
- NASA insignia, worm, and employee likenesses on cover art or ads need extra clearance. Merchandise has its own approvals page
- "generally are not subject to copyright" includes "audio, video" and 3D texture/polygon files. That is a US copyright statement, not a worldwide trademark waiver
- Do not put the meatball on a store page. Do not write "official NASA game"
- Still open (re-checked 2026-10-04): the guidelines are unchanged on the points that matter. They still never mention games or software products; the commercial section still pairs "used editorially within published works that are not promotional in nature" with the no-endorsement rule; and third-party material is still mixed in item by item ("NASA occasionally uses copyright-protected material of third parties"), so each item's credit line has to be checked. `commercial` stays `unknown` until NASA says whether a commercial game counts, or counsel reads the clause
- Checklist: guidelines page loaded, commercial not an explicit game grant, attribution requested, not a marketplace, NASA is the supplier, not blocklisted, catalog claims no rights

## Evidence

- Live guidelines (2026-08-24): "images, audio, video ... generally are not subject to copyright in the United States"
- Live guidelines, COMMERCIAL USE (2026-08-24): "must not explicitly or implicitly convey NASA's endorsement"
- Live guidelines (2026-08-24): "used editorially within published works that are not promotional in nature"
- Live `images.nasa.gov` (2026-08-24): HTTP 200, no license quote in the fetched body (SPA)
- Live [guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/) (2026-10-04): "NASA content – images, audio, video, and media files used in the rendition of 3-dimensional models, such as texture maps and polygon data in any format – generally are not subject to copyright in the United States."; "NASA should be acknowledged as the source of the material."
- Same page (2026-10-04): "NASA occasionally uses copyright-protected material of third parties with permission on its website. Those images will be marked identified as copyright protected with the name of the copyright holder. NASA's use does not convey any rights to others to use the same material."
- Same page, COMMERCIAL USE (2026-10-04): "NASA imagery can be generally used editorially within published works that are not promotional in nature."; "If the NASA material is to be used for commercial purposes, including advertisements, it must not explicitly or implicitly convey NASA's endorsement of commercial goods or services."
- Same page, Media including Identifiable Persons (2026-10-04): "using the media for commercial purposes may infringe that person's right of privacy or publicity, and permission should be obtained from the person."

## Related

- [nasa-3d-resources](../3d/nasa-3d-resources.md)
- [nasadem](../environment/nasadem.md)
- [../3d/smithsonian-open-access](../3d/smithsonian-open-access.md)
- [../audio/kenney-sci-fi-sounds](../audio/kenney-sci-fi-sounds.md)
- [../video/destockd](destockd.md)
