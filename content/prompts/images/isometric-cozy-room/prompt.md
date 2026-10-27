---
title: Isometric cozy room diorama
summary: A tiny 3D cut-away room on a floating base — soft clay materials, pastel colours and warm lamp light.
category: images
models: [Midjourney v7, GPT Image, Flux 1.1 Pro]
tags: [isometric, 3d, illustration, interior]
difficulty: intermediate
created: 2026-09-30
settings:
  Aspect ratio: "1:1"
  Look: Blender / clay render
blanks:
  room:
    label: Room
    default: home office
    placeholder: e.g. reading nook, bakery, recording studio
  time:
    label: Time of day
    default: morning
    options: [morning, evening]
notes:
  - List 4–6 props max — too many and the room turns to clutter.
  - Ask for "two walls visible" to keep the classic diorama angle.
results:
  - type: image
    file: day.jpg
    alt: An isometric pastel room with a desk, laptop, plant, bookshelf of colourful books, orange rug and a sunny window.
    model: Midjourney v7
    caption: morning
    placeholder: true
  - type: image
    file: night.jpg
    alt: The same isometric room at night with indigo walls, a purple rug, a glowing lamp and a moon in the window.
    model: Midjourney v7
    caption: evening
    placeholder: true
---
Isometric 3D illustration of a tiny cozy {{room}} as a cut-away diorama on a floating square base, two walls visible, soft pastel colour palette, a window with {{time}} light, a desk with a laptop, a potted plant, a bookshelf with colourful books and a warm desk lamp, smooth clay-like materials, soft global illumination, subtle ambient occlusion, clean gradient background, Blender render style, high detail --ar 1:1
