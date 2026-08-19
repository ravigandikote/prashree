import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import SEO from '../components/SEO'
import { SectionHeading, LoadingSpinner, EmptyState } from '../components/UI'
import { getPublishedPosts } from '../lib/supabase'
import { formatDate } from '../lib/format'

export default function Blog() {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getPublishedPosts()
      .then((data) => setPosts(data || []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false))
  }, [])

  return (
    <>
      <SEO
        title="Blog"
        description="Stories from Monica Prakash's practice — mandala art, Janur craft, teaching, and the life of the studio."
        path="/blog"
      />

      <section className="bg-white pt-16 md:pt-24 pb-12">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            align="left"
            eyebrow="Blog"
            title="Notes from the studio"
            subtitle="Monica's stories about her artworks, her practice, and the people she makes with."
            className="mb-0"
          />
        </div>
      </section>

      <section className="bg-white pb-20 md:pb-28">
        <div className="max-w-content mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <LoadingSpinner />
          ) : posts.length > 0 ? (
            <div className="border-t border-mist">
              {posts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3, delay: Math.min(i * 0.05, 0.2) }}
                  className="border-b border-mist"
                >
                  <Link
                    to={`/blog/${post.slug}`}
                    className="grid md:grid-cols-12 gap-6 md:gap-10 py-10 no-underline group"
                  >
                    {post.cover_image && (
                      <div className="md:col-span-4 overflow-hidden bg-paper aspect-[3/2]">
                        <img
                          src={post.cover_image}
                          alt=""
                          loading="lazy"
                          className="w-full h-full object-cover treat-grayscale"
                        />
                      </div>
                    )}
                    <div className={post.cover_image ? 'md:col-span-8' : 'md:col-span-12'}>
                      <p className="text-small text-ash">
                        {formatDate(post.published_at)}
                        {post.tags?.length > 0 && (
                          <span className="ml-3 uppercase tracking-label">
                            {post.tags.join(' · ')}
                          </span>
                        )}
                      </p>
                      <h2 className="font-display text-h2 text-ink mt-2 group-hover:underline decoration-1 underline-offset-4">
                        {post.title}
                      </h2>
                      {post.excerpt && (
                        <p className="text-graphite mt-3 max-w-2xl">{post.excerpt}</p>
                      )}
                    </div>
                  </Link>
                </motion.article>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Stories are on their way"
              message="Monica's first posts are being written. Check back soon."
            />
          )}
        </div>
      </section>
    </>
  )
}
