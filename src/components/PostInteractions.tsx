import { useState, useEffect } from 'react';

interface Comment {
  id: string;
  name: string;
  body: string;
  createdAt: string;
}

interface Props {
  slug: string;
}

export default function PostInteractions({ slug }: Props) {
  const [likeCount, setLikeCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);
  const [likeLoading, setLikeLoading] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [name, setName] = useState('');
  const [body, setBody] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/likes/${slug}`)
      .then((r) => r.json())
      .then((data) => {
        setLikeCount(data.count);
        setHasLiked(data.hasLiked);
      })
      .catch(() => {});

    fetch(`/api/comments/${slug}`)
      .then((r) => r.json())
      .then(setComments)
      .catch(() => {});
  }, [slug]);

  const handleLike = async () => {
    if (likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await fetch(`/api/likes/${slug}`, { method: 'POST' });
      const data = await res.json();
      setLikeCount(data.count);
      setHasLiked(data.hasLiked);
    } catch {}
    setLikeLoading(false);
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || submitting) return;
    setSubmitting(true);
    setError('');

    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, body }),
      });
      if (!res.ok) throw new Error();
      const comment: Comment = await res.json();
      setComments([comment, ...comments]);
      setName('');
      setBody('');
    } catch {
      setError('送信に失敗しました。もう一度お試しください。');
    }
    setSubmitting(false);
  };

  return (
    <div className="post-interactions">
      {/* いいねボタン */}
      <div className="likes-area">
        <button
          onClick={handleLike}
          disabled={likeLoading}
          className={`like-btn${hasLiked ? ' liked' : ''}`}
          aria-label={hasLiked ? 'いいね済み' : 'いいね！'}
        >
          <span className="heart-icon">{hasLiked ? '❤️' : '🤍'}</span>
          <span className="like-count">{likeCount}</span>
        </button>
      </div>

      {/* コメント */}
      <div className="comments-section">
        <h2 className="comments-heading">💬 コメント</h2>

        <form onSubmit={handleComment} className="comment-form">
          <input
            type="text"
            placeholder="おなまえ（なくてもOK）"
            value={name}
            onChange={(e) => setName(e.target.value)}
            maxLength={50}
            className="comment-input"
          />
          <textarea
            placeholder="コメントをどうぞ！（500文字まで）"
            value={body}
            onChange={(e) => setBody(e.target.value)}
            maxLength={500}
            required
            rows={4}
            className="comment-textarea"
          />
          {error && <p className="comment-error">{error}</p>}
          <button type="submit" disabled={submitting} className="comment-submit">
            {submitting ? '送信中…' : '✉️ 送る'}
          </button>
        </form>

        <div className="comments-list">
          {comments.length === 0 ? (
            <p className="no-comments">まだコメントはありません。最初のコメントを書いてね！</p>
          ) : (
            comments.map((c) => (
              <div key={c.id} className="comment-item">
                <div className="comment-meta">
                  <span className="comment-name">✏️ {c.name}</span>
                  <span className="comment-date">
                    {new Date(c.createdAt).toLocaleDateString('ja-JP')}
                  </span>
                </div>
                <p className="comment-body">{c.body}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
