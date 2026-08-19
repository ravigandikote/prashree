/**
 * Learn-with-Monica offerings. Facts marked [[ ]] are placeholders awaiting
 * Monica's copy — never invent durations, prices, or requirements.
 */

export const offerings = [
  {
    title: 'Mandala Art Classes',
    format: 'Online & in-person',
    description:
      'Therapeutic mandala drawing — sacred geometry as a meditative practice. Monica teaches pattern, symmetry, and the calm, deliberate process behind every monochrome mandala.',
    duration: '[[Duration — e.g. 4 sessions of 90 minutes]]',
    needs: '[[What you’ll need — e.g. fine-liner pens, A4 sketchbook, compass]]',
  },
  {
    title: 'Meditation Practice',
    format: 'Online & in-person',
    description:
      'Guided meditation sessions woven through the art practice — stillness, breath, and focus, with sound accompaniment from singing bowls.',
    duration: '[[Duration — e.g. weekly 45-minute sessions]]',
    needs: 'Nothing but a quiet corner.',
  },
  {
    title: 'Janur & DIY Workshops',
    format: 'In-person',
    description:
      'Hands-on workshops in Janur (coconut-leaf) art and other DIY art forms — traditional craft taught from first weave to finished piece.',
    duration: '[[Duration — varies by workshop]]',
    needs: 'All materials provided.',
  },
]

/* In-person workshop programmes hosted at NeeRav Arts Village */
export const workshops = [
  {
    title: 'Mandala Art Therapy — Beginner',
    description: 'Discover the meditative power of mandala creation. Learn basic patterns, symmetry, and the therapeutic approach to sacred geometry.',
    duration: '2 Days',
    type: 'Residential',
    capacity: '15 participants',
    highlights: ['Basic mandala patterns', 'Therapeutic techniques', 'Materials provided', 'Certificate of completion'],
  },
  {
    title: 'Advanced Mandala Workshop',
    description: 'Deepen your mandala practice with complex patterns, layering techniques, and large-format compositions for experienced artists.',
    duration: '3 Days',
    type: 'Residential',
    capacity: '10 participants',
    highlights: ['Complex patterns', 'Large format work', 'Mixed media mandala', 'Portfolio review'],
  },
  {
    title: 'Janur Art (Coconut Leaf Art)',
    description: 'Learn the traditional art of weaving and crafting with coconut leaves. Create functional and decorative pieces from nature.',
    duration: '2 Days',
    type: 'Residential',
    capacity: '12 participants',
    highlights: ['Leaf selection & prep', 'Weaving techniques', 'Functional art pieces', 'Sustainability focus'],
  },
  {
    title: 'Mixed Media Art Retreat',
    description: 'A comprehensive art retreat covering multiple art forms — warli, abstract, doodle, and mixed media on various surfaces.',
    duration: '5 Days',
    type: 'Residential',
    capacity: '8 participants',
    highlights: ['Multiple art forms', 'Various surfaces', 'Personal mentoring', 'Art exhibition'],
  },
  {
    title: 'Corporate Team Art Workshop',
    description: 'Custom-designed workshops for corporate teams. Use art as a tool for team building, stress relief, and creative thinking.',
    duration: 'Customizable',
    type: 'On-site / Residential',
    capacity: '20-50 participants',
    highlights: ['Team building', 'Stress management', 'Custom themes', 'Group art project'],
  },
  {
    title: 'Kids & Family Art Workshop',
    description: 'Fun, age-appropriate art activities for children and families. Explore DIY crafts, doodles, and simple mandala patterns.',
    duration: '1 Day',
    type: 'At NeeRav Arts Village',
    capacity: '20 participants',
    highlights: ['Age-appropriate activities', 'Family bonding', 'DIY crafts', 'Take-home creations'],
  },
]

/* Sessions Monica conducts at the host's own venue */
export const doorstepAudiences = [
  {
    icon: 'Building2',
    title: 'Residential Societies',
    description:
      'Sound healing sessions in your society club house — a calm evening of singing bowls and guided stillness for residents, arranged with your association.',
    subject: 'Doorstep sessions — residential society',
  },
  {
    icon: 'Briefcase',
    title: 'Corporate Offices',
    description:
      'Mandala Art Therapy and sound healing for your teams, at your office — designed to relieve workplace stress and reset focus, for small groups or whole floors.',
    subject: 'Doorstep sessions — corporate office',
  },
  {
    icon: 'Handshake',
    title: 'Studios & Space Owners',
    description:
      'Run these sessions for your own customers. Art studios and space owners can host Janur Art, Mandala Art Therapy, or sound healing on an agreed revenue share.',
    subject: 'Doorstep sessions — studio / space partnership',
  },
]
