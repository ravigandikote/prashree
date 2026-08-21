/**
 * Fallback for the two current recurring workshops (mirrors the Supabase
 * seed in migrations/20260821_workshop_events.sql) so the page never
 * renders blank if the database is unreachable. The database is the
 * source of truth once seeded — Monica manages it at /admin/workshops.
 */
export const fallbackWorkshops = [
  {
    id: 'janur-sunday',
    title: 'Janur Art Workshop',
    description:
      'Hands-on coconut-leaf art — from first weave to a finished piece you take home. All materials provided.',
    schedule: 'Every Sunday · 10 am – 12 pm',
    venue: 'Eco Cottage, Kalyan Nagar, Bengaluru',
    flyer_url: null,
    is_active: true,
    display_order: 1,
  },
  {
    id: 'mandala-sunday',
    title: 'Mandala Art Therapy Workshop',
    description:
      'Therapeutic mandala drawing with Monica — centre, circles, and patterns at a calm, guided pace. All materials provided.',
    schedule: 'Every Sunday · 3 – 5 pm',
    venue: 'Eco Cottage, Kalyan Nagar, Bengaluru',
    flyer_url: null,
    is_active: true,
    display_order: 2,
  },
]
