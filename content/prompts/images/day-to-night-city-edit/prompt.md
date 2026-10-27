---
title: Day-to-night city edit
summary: Re-light a daytime skyline photo as night — lit windows, stars and glowing reflections, same composition.
category: images
models: [GPT Image, Gemini 2.5 Flash Image, Flux Kontext]
tags: [edit, photo, city, image-to-image]
difficulty: intermediate
created: 2026-09-18
settings:
  Input: Your daytime photo
  Mode: Image edit
blanks:
  sky:
    label: Night sky
    default: navy-to-violet gradient
notes:
  - Works best on photos with a clear skyline and some water or wet ground for reflections.
  - Add "keep people and cars unchanged" for street-level photos.
results:
  - type: before-after
    before: day.jpg
    after: night.jpg
    alt: A city skyline by the water in daylight, and the same skyline at night with lit windows, stars and reflections.
    beforeLabel: Day
    afterLabel: Night
    model: Gemini 2.5 Flash Image
    placeholder: true
---
Edit this photo of a city skyline so it looks like it was taken at night. Keep the buildings, composition and camera angle exactly the same. Turn the sky into a deep {{sky}} with a few stars and a soft moon, light up roughly half of the windows in warm yellow, add glowing reflections of the lights on the water, and lower the overall exposure while keeping detail in the shadows. Photorealistic, no new buildings, no text.
