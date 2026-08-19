/**
 * Fallback connection entries (mirrors the Supabase `connections` seed).
 * Used when the database is unreachable or empty, so the page never renders
 * blank. Add new entries in the database via SQL/admin — or here for the
 * fallback. [[ ]] copy awaits Monica's descriptions.
 */
export const fallbackConnections = [
  {
    id: 'neerav',
    name: 'NeeRav Arts Village',
    role: 'Creative Director',
    description:
      'A space dedicated to nurturing creativity through residential workshops and events, in a serene natural setting.',
    url: null,
    logo_url: null,
  },
  {
    id: 'hef',
    name: 'HEF Community',
    role: 'Secretary',
    description: "[[Short description of the HEF community and Monica's work there.]]",
    url: null,
    logo_url: null,
  },
  {
    id: 'eat-raja',
    name: 'Eat Raja Sir',
    role: 'Social-service partnership',
    description: '[[Short description of this partnership.]]',
    url: null,
    logo_url: null,
  },
  {
    id: 'sampige',
    name: 'Sampige Foundation',
    role: 'Social-service partnership',
    description: '[[Short description of this partnership.]]',
    url: null,
    logo_url: null,
  },
]
