---
id: cmu-mocap
name: CMU Graphics Lab Motion Capture Database
url: http://mocap.cs.cmu.edu
category: animation
subcategories: [mocap]
license: custom
commercial: true
attribution_required: false
formats: [BVH]
tags: [academic, mocap, research]
added: 2026-07-19
verified: 2026-10-23
status: active
---

# CMU Graphics Lab Motion Capture Database

Free human motion clips from Carnegie Mellon Graphics Lab. Site grant is "free for all uses" with no separate commercial carve-out and no attribution requirement on the pages loaded on 2026-08-24. Raw academic capture. Expect cleanup and retargeting before engine import.

## Notes

- Homepage points at cgspeed BVH conversions for Max/MotionBuilder
- ASF/AMC scale note on FAQs: multiply by 0.056444 to get meters
- FAQs cover format and markers, not a second license document
- Pair with [accad-mocap](accad-mocap.md) / [rokoko-vision](rokoko-vision.md) when you need cleaner modern clips
- DAHOX `cmu-mocap-gltf` is a format conversion of this grant, not a second license. Prefer this primary if you need the original terms.
- The site serves plain http only (https refused on 2026-10-22), so the entry `url` stays `http://`

## Evidence

- Live homepage (2026-08-24): "This dataset of motions is free for all uses."
- Live homepage (2026-10-23): "This dataset of motions is free for all uses." is still the headline statement
- Live homepage, footer terms (2026-10-23): "This data is free for use in research projects. You may include this data in commercially-sold products, but you may not resell this data directly, even in converted form."
- Same footer (2026-10-23): asks that published papers send their citation to the project email; no credit requirement is stated for products

## Related

- [accad-mocap](accad-mocap.md)
- [rokoko-vision](rokoko-vision.md)
- [mixamo](mixamo.md)
