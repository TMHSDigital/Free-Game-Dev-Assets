---
id: metahuman
name: MetaHuman
url: https://www.metahuman.com
category: characters
subcategories: [characters, humanoid, rigged]
license: custom
commercial: true
attribution_required: false
formats: [Unreal]
tags: [unreal-engine, digital-humans, realistic, facial-animation, character-creator]
publisher: Epic Games
ue_versions: "5.6+"
added: 2026-10-13
verified: 2026-10-13
status: needs-review
---

# MetaHuman

Epic's framework for photoreal digital humans: MetaHuman Creator, MetaHuman Animator and Mesh to MetaHuman, which since Unreal Engine 5.6 run inside the engine rather than as a web app, plus plugins for Maya and Houdini. Characters come with face and body rigs, hair, clothing and Rig Logic facial animation. Epic's licensing page says MetaHuman is free under $1 million USD revenue and that MetaHumans "can be used with any engine or creative software", but Epic's own Content License still says acquired MetaHuman content is UE-Only. That conflict is recorded here and left unresolved.

## Notes

- Licence conflict, unresolved: the [MetaHuman licence page](https://www.metahuman.com/license) and its FAQ say characters and animation can be used in any engine, with no royalty outside Unreal, under the Unreal Engine EULA. The [Epic Content License](https://www.unrealengine.com/eula/content) MetaHuman Content Addendum says "MetaHuman Content that you acquire may only be used and shared as UE-Only Content." The Unreal Engine EULA says it supersedes the old MetaHuman Creator EULA for rights related to Licensed Technology, and also warns that "certain assets that we make available under separate agreements are available for use only with Unreal Engine". A plausible reading is that characters you author with the in-engine tools (5.6+) fall under the UE EULA and may leave Unreal, while MetaHuman content acquired from Epic or Fab under the Content License stays UE-Only. Epic does not state that split in one place, so `engine_lock` is left out and the entry stays `needs-review`
- Revenue condition: above $1 million USD annual gross revenue, rendering MetaHumans outside Unreal needs an Unreal Engine seat license, per the FAQ
- Royalties: MetaHuman characters and animation are Non-Engine Products under the UE EULA, so use in other engines does not trigger the Unreal royalty
- AI restriction in the UE EULA: MetaHuman characters and animation curves may not be used to build or train AI or machine learning models
- Trademark: the UE EULA grants no rights in the MetaHuman name or logo
- Export: Epic states cross-engine use is allowed, but no Epic page read on 2026-10-13 documented an FBX export path for 5.6+, so `formats` lists Unreal only. Add FBX once an Epic page confirms it
- MetaHuman 5.8 (June 2026) made "core MetaHuman libraries available as open source under MIT"; that covers code libraries, not the character content, and is not reflected in the fields above
- No redistribution: the Epic Content License says "you may not Distribute Licensed Content in source format to third parties except to employees, affiliates, and contractors who are utilizing the Licensed Content in good faith to develop a Project on your behalf". Do not commit MetaHuman source assets to a public repository

## Evidence

- Live [MetaHuman licence page](https://www.metahuman.com/license) (2026-10-13): "MetaHuman is included as part of your standard Unreal Engine license, meaning it’s free to use for anyone making under $1 million USD in revenue and Unreal Engine standard terms apply above that threshold."; "MetaHumans can be used with any engine or creative software."
- Same page, FAQ (2026-10-13): "Yes. The Unreal Engine EULA provides for MetaHuman characters and animation to be used across all engines and creative software, subject to applicable terms."; "If you make over $1 million USD in annual gross revenue and render MetaHuman characters and animation outside of Unreal Engine, you’ll need an Unreal Engine seat license; below that threshold, Unreal Engine is free to use."
- Same FAQ (2026-10-13): "MetaHuman characters and animation are classed as Non-Engine Products under the Unreal Engine EULA, so neither their use as linear media output or at runtime in games (or other interactive applications) using engines other than Unreal Engine triggers royalty obligations."
- Live [Unreal Engine FAQ](https://www.unrealengine.com/faq) (2026-10-13): "From Unreal Engine 5.6, your use of MetaHuman is included under the terms of your existing Unreal Engine license."
- Live [Epic Content License](https://www.unrealengine.com/eula/content) MetaHuman Content Addendum (2026-10-13): "MetaHuman Content includes both digital human characters created by your use of MetaHuman Creator and digital human characters created by or on behalf of Epic."; "MetaHuman Content that you acquire may only be used and shared as UE-Only Content."
- Live [Unreal Engine EULA](https://www.unrealengine.com/eula/unreal) (2026-10-13): "Such asset files remain Non-Engine Products even if included in Products that use or rely on other video game engines."; "Please note that certain assets that we make available under separate agreements are available for use only with Unreal Engine."
- Live [metahuman.com](https://www.metahuman.com) (2026-10-13): "Harness the power of MetaHuman Creator in Unreal Engine to make photoreal MetaHumans"; "We're also making core MetaHuman libraries available as open source under MIT for the first time."

## Related

- [paragon-characters](paragon-characters.md)
- [makehuman](makehuman.md)
- [mpfb](mpfb.md)
- [microsoft-rocketbox](microsoft-rocketbox.md)
- [mixamo](../animation/mixamo.md)
