import { useState, useEffect } from 'react';
import { User, Calendar, Tag, AlertCircle, PlusCircle, CheckCircle } from 'lucide-react';

export default function Blog() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New post form state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [tags, setTags] = useState('');
  const [formSuccess, setFormSuccess] = useState(null);
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/blogs');
      if (!res.ok) throw new Error('Failed to fetch blog posts');
      const data = await res.json();
      setBlogs(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Could not load articles. Reconnecting to database...');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchBlogs();
  }, []);

  const handleCreateBlog = async (e) => {
    e.preventDefault();
    if (!title || !content) {
      setFormError('Title and content are required.');
      return;
    }

    setSubmitting(true);
    setFormError(null);
    setFormSuccess(null);

    const postTags = tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [];

    try {
      const res = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title,
          content,
          author: author || undefined,
          tags: postTags
        })
      });

      if (!res.ok) {
        throw new Error('Failed to create article');
      }

      const data = await res.json();
      setFormSuccess(data.message || 'Article published successfully!');
      setTitle('');
      setContent('');
      setAuthor('');
      setTags('');
      fetchBlogs(); // Reload blog list
    } catch (err) {
      setFormError(err.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container-width animate-fade-in" style={{ paddingTop: '4rem' }}>
      
      <style dangerouslySetInnerHTML={{__html: `
        .blog-layout {
          display: grid;
          grid-template-columns: 1.7fr 1fr;
          gap: 3rem;
          margin-bottom: 5rem;
        }
        .blog-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .blog-card {
          padding: 2.5rem;
        }
        .blog-meta {
          display: flex;
          gap: 1.5rem;
          color: var(--text-muted);
          font-size: 0.85rem;
          margin: 0.75rem 0 1.5rem 0;
          flex-wrap: wrap;
        }
        .meta-item {
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }
        .blog-tag {
          font-size: 0.75rem;
          background: rgba(59, 130, 246, 0.12);
          border: 1px solid rgba(59, 130, 246, 0.2);
          color: var(--primary);
          padding: 0.2rem 0.5rem;
          border-radius: 4px;
          font-weight: 600;
        }
        .blog-content {
          color: var(--text-secondary);
          line-height: 1.7;
          font-size: 0.95rem;
          white-space: pre-wrap;
        }
        @media (max-width: 960px) {
          .blog-layout {
            grid-template-columns: 1fr !important;
            gap: 2.5rem !important;
          }
        }
      `}} />

      <div className="text-center">
        <h1 className="section-title">Rancom Engineering Blog</h1>
        <p className="section-subtitle">
          Discover professional field insights, technological audits, server infrastructure analyses, and development resources.
        </p>
      </div>

      <div className="blog-layout">
        
        {/* Blog Posts list */}
        <section>
          {loading ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
              Loading latest articles...
            </div>
          ) : error ? (
            <div className="glass" style={{ padding: '2rem', borderLeft: '4px solid #ef4444', borderRadius: '8px', color: '#fca5a5', display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <AlertCircle />
              <div>
                <p style={{ fontWeight: 600 }}>Connection Notice</p>
                <p style={{ fontSize: '0.9rem' }}>{error}</p>
              </div>
            </div>
          ) : blogs.length === 0 ? (
            <div style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '3rem' }}>
              No articles found.
            </div>
          ) : (
            <div className="blog-list">
              {blogs.map((post) => (
                <article key={post._id} className="premium-card blog-card">
                  <h2 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'white', lineHeight: '1.3' }}>{post.title}</h2>
                  
                  <div className="blog-meta">
                    <span className="meta-item">
                      <User size={14} />
                      <span>{post.author}</span>
                    </span>
                    <span className="meta-item">
                      <Calendar size={14} />
                      <span>{new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </span>
                    {post.tags && post.tags.length > 0 && (
                      <span className="meta-item">
                        <Tag size={14} />
                        <span style={{ display: 'flex', gap: '0.25rem' }}>
                          {post.tags.map((tag, idx) => (
                            <span key={idx} className="blog-tag">{tag}</span>
                          ))}
                        </span>
                      </span>
                    )}
                  </div>

                  <p className="blog-content">{post.content}</p>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Create post form */}
        <aside>
          <div className="glass" style={{ padding: '2.5rem', borderRadius: '16px', border: '1px solid var(--border-color)', position: 'sticky', top: '100px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'white', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <PlusCircle size={20} style={{ color: 'var(--primary)' }} /> Publish Article
            </h3>

            {formSuccess && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: 'var(--accent)', background: 'rgba(16, 185, 129, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(16,185,129,0.2)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <CheckCircle size={18} />
                <span>{formSuccess}</span>
              </div>
            )}

            {formError && (
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', color: '#f87171', background: 'rgba(239, 68, 68, 0.1)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(239,68,68,0.2)', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600 }}>
                <AlertCircle size={18} />
                <span>{formError}</span>
              </div>
            )}

            <form onSubmit={handleCreateBlog}>
              <div className="form-group">
                <label>Article Title</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Telecom Handover Methods"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Author Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., Engineering Team"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Tags (Comma separated)</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g., 5G, Antenna, RF"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Content Body</label>
                <textarea 
                  className="form-input" 
                  placeholder="Write the full body content of your technical article here..."
                  required
                  style={{ minHeight: '180px' }}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                />
              </div>

              <button 
                type="submit" 
                className="btn btn-primary" 
                style={{ width: '100%', padding: '0.8rem 1rem', fontSize: '0.95rem' }}
                disabled={submitting}
              >
                {submitting ? 'Publishing...' : 'Publish Article'}
              </button>
            </form>
          </div>
        </aside>

      </div>

    </div>
  );
}
