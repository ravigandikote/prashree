/**
 * PraShree Events content — single source for the /events page.
 * Copy is verbatim from prashree-events-website-content.md (repo root).
 */

export const eventsContent = {
  meta: {
    title: 'PraShree Events — Natural & Sustainable Event Décor, Bengaluru',
    description:
      'Hand-made event décor in Janur, gunny, bamboo and flowers for birthdays, anniversaries, Mehandi and housewarmings. By PraShree Arts, Bengaluru.',
  },
  hero: {
    eyebrow: 'Natural · Sustainable · Event Décor',
    title: 'PraShree Events',
    script: 'Stories told in leaf & jute',
    sub: 'Earthy, hand-made décor for the days that matter — built from Janur, gunny, bamboo, flowers and clay, not plastic.',
  },
  intro: [
    'PraShree Events is the décor wing of PraShree Arts. Before the studio, there was the events floor — years of setting up birthdays, anniversaries and Mehandi evenings, sometimes with a full team, sometimes single-handed. We are bringing that back, with one clear promise: décor that feels like it grew from the occasion rather than arrived in a carton.',
    'We work with Janur (young coconut leaf), gunny and jute, bamboo, cane, fresh flowers, terracotta and hand-lettered boards. Every backdrop, arch and table piece is shaped by hand at NeeRav Arts Village and set up by our team on the day. What we build looks warm in photographs, smells of the garden, and leaves almost nothing behind for the landfill.',
  ],
  occasions: [
    { name: 'Birthdays', line: "For toddlers or turning-fifty, without a single balloon if you'd rather not." },
    { name: 'Anniversaries', line: 'Intimate home setups and garden dinners.' },
    { name: 'Mehandi & Haldi', line: 'Marigold, Janur and jute in full colour.' },
    { name: 'Housewarming & Griha Pravesh', line: 'Thoranam, rangoli and entrance décor.' },
    { name: 'Baby showers & naming ceremonies', line: 'Soft botanical settings.' },
    { name: 'Weddings, engagements & receptions', line: 'Small weddings — mandap and stage in natural materials.' },
    { name: 'Corporate & community gatherings', line: 'Welcome arches, stage dressing, signage.' },
  ],
  process: [
    { title: 'Tell us the occasion', line: 'Share the occasion, date, venue and rough guest count — on WhatsApp or the form below.' },
    { title: 'Mood board in two days', line: 'We share a mood board and a quote within two days.' },
    { title: 'We build, set up, and clear', line: 'Our team builds off-site, sets up on the day and clears everything after.' },
  ],
  materialsNote:
    "Our first choice is always natural: Janur, gunny, bamboo, cane, palm fronds, flowers, clay and cotton. If you want balloons, we'll do them well — but we'll show you what leaf and jute can do first.",
  closing: "Whatever the story, our team will be there to make the décor tell it. Write to us and let's begin.",
}

export const WHATSAPP_NUMBER = '919353464363'

export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
