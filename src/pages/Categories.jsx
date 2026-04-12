import { useEffect, useState } from 'react'
import SEO from '../components/SEO'
import { SectionHeading } from '../components/UI'
import CategoryCard from '../components/CategoryCard'
import { LoadingSpinner } from '../components/UI'
import { getCategories } from '../lib/supabase'

const FALLBACK_CATEGORIES = [
  { id: '1', name: 'Mandala Art', slug: 'mandala-art', description: 'Sacred geometry and meditative patterns for inner peace.', display_order: 1 },
  { id: '2', name: 'Janur Art', slug: 'janur-art', description: 'Traditional coconut leaf art reimagined with modern aesthetics.', display_order: 2 },
  { id: '3', name: 'DIY – Best Out of Waste', slug: 'diy-best-out-of-waste', description: 'Creative art from recycled and repurposed materials.', display_order: 3 },
  { id: '4', name: 'Thread Work', slug: 'thread-work', description: 'Intricate thread art on frames and boards.', display_order: 4 },
  { id: '5', name: 'Wall Arts', slug: 'wall-arts', description: 'Mandala and Warli art for your walls.', display_order: 5 },
  { id: '6', name: 'Home Décor', slug: 'home-decor', description: 'Handcrafted décor pieces for every space.', display_order: 6 },
  { id: '7', name: 'Abstract Paintings', slug: 'abstract-paintings', description: 'Expressive abstract compositions on canvas.', display_order: 7 },
  { id: '8', name: 'Mandalas on Abstract', slug: 'mandalas-on-abstract', description: 'Mandala patterns layered on abstract backgrounds.', display_order: 8 },
  { id: '9', name: 'Doodle Art', slug: 'doodle-art', description: 'Hand-drawn doodle compositions full of detail.', display_order: 9 },
  { id: '10', name: 'Ceramic Wall Décor', slug: 'ceramic-wall-decor', description: 'Painted and handcrafted ceramic wall pieces.', display_order: 10 },
  { id: '11', name: 'Frame Works', slug: 'frame-works', description: 'Custom framed art and mixed-media pieces.', display_order: 11 },
  { id: '12', name: 'Glue Gun Art', slug: 'glue-gun-art', description: 'Textured art created with glue gun techniques.', display_order: 12 },
  { id: '13', name: 'Dry Flower / Leaf Arrangements', slug: 'dry-flower-leaf-arrangements', description: 'Natural preserved flower and leaf compositions.', display_order: 13 },
  { id: '14', name: 'Event Background Decoration', slug: 'event-background-decoration', description: 'Natural and balloon backdrops for events.', display_order: 14 },
  { id: '15', name: 'Table Arrangements', slug: 'table-arrangements', description: 'Natural material table centerpieces.', display_order: 15 },
  { id: '16', name: 'Customized Drawings / Gifts', slug: 'customized-drawings-gifts', description: 'Personalized art and bespoke gift items.', display_order: 16 },
  { id: '17', name: 'T-Shirt Printing', slug: 't-shirt-printing', description: 'Hand-painted and printed art on t-shirts.', display_order: 17 },
  { id: '18', name: 'Bamboo Art', slug: 'bamboo-art', description: 'Eco-friendly art crafted from bamboo.', display_order: 18 },
  { id: '19', name: 'Coconut Shell Art', slug: 'coconut-shell-art', description: 'Creative art using coconut shells.', display_order: 19 },
  { id: '20', name: 'Jewellery Making', slug: 'jewellery-making', description: 'Handcrafted jewellery with artistic flair.', display_order: 20 },
]

export default function Categories() {
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getCategories()
      .then((data) => {
        setCategories(data?.length ? data : FALLBACK_CATEGORIES)
      })
      .catch(() => {
        setCategories(FALLBACK_CATEGORIES)
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SEO
        title="Art Categories"
        description="Browse 20+ art categories including Mandala Art, Janur Art, Wall Arts, Home Décor, and more by PraShree Arts."
        path="/categories"
      />

      {/* ── Header ── */}
      <section className="py-16 bg-surface border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            title="Art Categories"
            subtitle="Explore our complete collection of handcrafted art forms — each rooted in tradition and therapeutic practice."
          />
        </div>
      </section>

      {/* ── Grid ── */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {categories.map((cat, i) => (
                <CategoryCard key={cat.id} category={cat} index={i} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}
