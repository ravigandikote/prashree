/**
 * The Studio is a list of activities. Each entry is one screen; new ones
 * join this list. `image` is a photo/artwork thumb (shown with the house
 * grayscale-at-rest treatment); `glyph` names a drawn thumbnail in
 * StudioHub for activities we have no photograph of yet.
 */
export const STUDIO_ACTIVITIES = [
  {
    key: 'sound-healing',
    title: 'Sound healing',
    line: 'Sit with singing bowls tuned to the chakras, then rain stick, ocean drum, a gong, and a slow raga alaap.',
    meta: '5 to 15 minutes · works with headphones or a quiet room',
    to: '/studio/sound-healing',
    glyph: 'bowl',
  },
  {
    key: 'mandala',
    title: 'Generate a mandala',
    line: 'Draft a mandala the way Monica teaches it: paper, centre, circles, radial lines, patterns — then print it and fill it by hand.',
    meta: 'Drawing tool · export as PDF, PNG or SVG',
    to: '/studio/mandala',
    image: '/images/products/thumbs/ananda.jpg',
  },
]
