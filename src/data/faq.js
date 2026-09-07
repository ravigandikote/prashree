/**
 * Frequently asked questions. Every answer here is drawn from something the
 * site already states — the catalogue, learn.js, the workshops page, the
 * studio tool. Facts in [[ ]] await Monica; never invent an answer, because
 * these are also published as FAQPage structured data to Google.
 *
 * Answers are plain text so they can go into JSON-LD verbatim; `link` renders
 * a "read more" under the answer.
 */

export const faqGroups = [
  {
    title: 'Buying an artwork',
    items: [
      {
        q: 'Can I buy an artwork directly on the website?',
        a: 'No — there is no checkout and no online payment. Every artwork page ends with an enquiry instead: you leave your details, and Monica contacts you personally to talk through the piece, any customisation, delivery and payment.',
        link: { to: '/products', label: 'Browse the collection' },
      },
      {
        q: 'What happens after I express interest?',
        a: 'Your enquiry reaches Monica directly. She follows up herself, usually by phone, to answer questions about the piece and agree the details with you. Nothing is charged or committed before that conversation.',
      },
      {
        q: 'The original I want has been sold. Can I still have it?',
        a: 'Yes. A sold original stays listed and is marked as sold, and fine-art prints of it can be made to order in the size you need. Each artwork page shows the print price range, and the enquiry button becomes an enquiry about a print.',
      },
      {
        q: 'Do you take custom commissions?',
        a: 'Yes. Commissions are shaped around your requirement — a size, a story, a space, an occasion. Tell Monica what you have in mind through any enquiry form and she will come back with what is possible.',
        link: { to: '/contact', label: 'Write to the studio' },
      },
      {
        q: 'How long does an artwork take to make?',
        a: 'Every piece is drawn entirely by hand, and each artwork page lists its own hand-drawing time — from around twelve hours for the smallest works to two hundred for the largest. A commission is quoted with its own timeline.',
      },
      {
        q: 'Do you deliver outside Bengaluru?',
        a: '[[Delivery, packing and shipping — within India and overseas — to be confirmed by Monica. Ask when you enquire and she will tell you what is possible for your piece and location.]]',
      },
      {
        q: 'What does the Vastu direction on each artwork mean?',
        a: 'Each piece carries a suggested wall direction, guided by Vastu and feng-shui, printed in its catalogue plate — for example an artwork for wealth is suggested for a north wall. It is a suggestion for placement, not a requirement, and you can filter the collection by direction.',
        link: { to: '/products', label: 'Filter by direction' },
      },
    ],
  },
  {
    title: 'Classes and workshops',
    items: [
      {
        q: 'What sessions does Monica teach?',
        a: 'Mandala art classes of two and a half to three hours, guided meditation practice of forty-five minutes with singing bowls, and three-hour Janur and DIY workshops. Classes run both online and in person; Janur workshops are in person.',
        link: { to: '/learn', label: 'See what she teaches' },
      },
      {
        q: 'Do I need any experience, or my own materials?',
        a: 'No experience is needed — sessions start at beginner level. All materials are provided for the mandala and Janur workshops; for meditation you need nothing but a quiet corner.',
      },
      {
        q: 'When is the next workshop?',
        a: 'The workshops page lists everything currently scheduled, with dates, timings and venue, and a button to reserve a spot. It is kept up to date by the studio.',
        link: { to: '/workshops', label: 'Upcoming workshops' },
      },
      {
        q: 'Can you run a session at our society, office or studio?',
        a: 'Yes. Monica conducts Janur art, sound healing and mandala art therapy sessions at your own venue — residential societies, corporate offices, and arts studios or space owners who host sessions for their own customers on an agreed revenue share.',
        link: { to: '/learn#doorstep', label: 'Doorstep sessions' },
      },
    ],
  },
  {
    title: 'Everything else',
    items: [
      {
        q: 'What is Janur art?',
        a: 'Janur is the traditional art of weaving and crafting with coconut leaves — taught from selecting and preparing the leaf through to a finished decorative or functional piece.',
        link: { to: '/about', label: 'About Monica' },
      },
      {
        q: 'Do you do event décor?',
        a: 'Yes. PraShree Events dresses occasions with natural, sustainable materials rather than plastic — from intimate gatherings to larger celebrations. Share your date, venue and guest count and Monica will come back with what she can do.',
        link: { to: '/events', label: 'PraShree Events' },
      },
      {
        q: 'Is the Mandala Studio free to use?',
        a: 'Yes. The drawing tool is free, runs entirely in your browser, and needs no sign-up. You can export your mandala as a print-ready PDF, a 300 DPI image, or a guides-only sheet to print and fill in by hand.',
        link: { to: '/studio', label: 'Open the studio' },
      },
      {
        q: 'How do I reach the studio?',
        a: 'Call or message +91 93534 64363, write to monica@prashreearts.com, or use any enquiry form on the site. The studio is at NeeRav Arts Village, Bengaluru.',
        link: { to: '/contact', label: 'Contact' },
      },
    ],
  },
]

/** Flat list — used for the FAQPage structured data. */
export const allFaqs = faqGroups.flatMap((g) => g.items)
