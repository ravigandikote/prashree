import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { marked } from 'marked'
import DOMPurify from 'dompurify'
import SEO from '../components/SEO'
import { LoadingSpinner, EmptyState } from '../components/UI'
import Button from '../components/Button'
import { getPostBySlug } from '../lib/supabase'
import { formatDate } from '../lib/format'

export default function BlogPost() {
  const { slug } = useParams()
  return <PostView key={slug} slug={slug} />
}

function PostView({ slug }) {
  const [post, setPost] = useState(null)
  const [notFound, setNotFound] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    getPostBySlug(slug)
      .then((data) => { if (!cancelled) setPost(data) })
      .catch(() => { if (!cancelled) setNotFound(true) })
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [slug])

  if (loading) return <LoadingSpinner />
  if (notFound || !post) {
    return (
      <section className="py-24">
        <EmptyState title="Post not found" message="This story doesn't exist or isn't published." />
        <div className="text-center">
          <Button to="/blog" variant="link">
            <ArrowLeft size={14} /> All posts
          </Button>
        </div>
      </section>
    )
  }

  const html = DOMPurify.sanitize(marked.parse(post.body || ''))

  return (
    <>
      <SEO
        title={post.title}
        description={post.excerpt || `${post.title} — from Monica Prakash's studio journal.`}
        path={`/blog/${slug}`}
      />

      <article className="bg-white py-16 md:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-small text-graphite hover:text-ink no-underline transition-colors"
          >
            <ArrowLeft size={14} aria-hidden="true" /> All posts
          </Link>

          <header className="mt-8">
            <p className="text-small text-ash">
              {formatDate(post.published_at)}
              {post.tags?.length > 0 && (
                <span className="ml-3 uppercase tracking-label">{post.tags.join(' · ')}</span>
              )}
            </p>
            <h1 className="font-display text-display-sm md:text-display text-ink mt-3">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="font-display text-h3 text-graphite italic mt-4">{post.excerpt}</p>
            )}
          </header>

          {post.cover_image && (
            <div className="mt-10 overflow-hidden bg-paper">
              <img src={post.cover_image} alt="" className="w-full object-cover" />
            </div>
          )}

          {/* Serif reading body */}
          <div
            className="prose-post mt-10"
            // Body is authored only by the signed-in admin and sanitized above
            dangerouslySetInnerHTML={{ __html: html }}
          />

          <hr className="hairline mt-14" />
          <p className="text-small text-graphite mt-6">
            — Monica Prakash, PraShree Arts
          </p>
        </div>
      </article>
    </>
  )
}
