/**
 * PraShree Events content — single source for the /events page.
 * Occasions and materials come from the supplied sub-brand banner;
 * [[ ]] marks copy awaiting Monica's review.
 */

export const eventsContent = {
  meta: {
    title: 'PraShree Events — Natural & Sustainable Event Décor, Bengaluru',
    description:
      'Natural, sustainable event décor in Bengaluru — birthdays, mehandi, baby showers, weddings — styled by hand in janur, gunny, bamboo, flowers, and clay.',
  },
  hero: {
    eyebrow: 'Natural · Sustainable · Event Décor',
    title: 'PraShree Events',
    script: 'Stories told in leaf & jute',
    sub: 'Handmade backdrops and table settings from natural materials — designed, built, and installed by PraShree Arts.',
  },
  intro: [
    'Every celebration has a story, and PraShree Events tells it in leaf and jute. Monica and her team design décor the way she makes art — by hand, from natural materials, shaped around the people the day is for.',
    'Instead of plastic and foam, your backdrop is woven, tied, and arranged from janur, gunny, bamboo, fresh flowers, and clay — beautiful on the day, gentle on the venue, and kinder to what comes after.',
  ],
  occasions: [
    { name: 'Birthdays', line: 'Playful, personal backdrops that grow up with the guest of honour.' },
    { name: 'Anniversaries', line: 'Quiet, elegant settings for milestones worth pausing for.' },
    { name: 'Mehandi', line: 'Lush, traditional greens and marigold moments for the mehandi day.' },
    { name: 'Housewarming', line: 'Natural, auspicious touches that make a new house feel blessed.' },
    { name: 'Baby Showers', line: 'Soft, handmade décor for the gentlest of celebrations.' },
    { name: 'Weddings', line: 'Full-scale natural styling, from mandap accents to table trails.' },
  ],
  process: [
    { title: 'Tell us the occasion', line: 'Share the date, venue, guest count, and the feeling you want the room to have.' },
    { title: 'A design in natural materials', line: 'Monica proposes a look built from leaf, jute, bamboo, flowers, and clay — shaped to your space and budget.' },
    { title: 'We set up, you celebrate', line: 'The team installs on the day and clears gently after, so you only host.' },
  ],
  materialsNote:
    'Janur · Gunny · Bamboo · Flowers · Clay — everything we build is natural first: woven and tied rather than glued and moulded, reusable where possible, and easy on the venue.',
  closing: 'One story, told in leaf and jute — tell us yours.',
}

export const WHATSAPP_NUMBER = '919353464363'

export function whatsappLink(message) {
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`
}
