import { useEffect, useState } from 'react';

export interface PostCardProps {
  postId?: string;
  authorName: string;
  authorAvatar?: string;
  timeAgo: string;
  title?: string;
  content: string;
  image?: string;
  likes: number;
  likedByCurrentUser?: boolean;
  comments: number;
  onCommentsClick?: (postId: string) => void;
  onMore?: () => void;
  onShare?: () => void;
  onToggleLike?: (postId: string) => Promise<number>;
}

export default function PostCard({
  postId,
  authorName,
  authorAvatar,
  timeAgo,
  title,
  content,
  image,
  likes,
  likedByCurrentUser = false,
  comments,
  onCommentsClick,
  onMore,
  onToggleLike,
}: PostCardProps) {
  const [liked, setLiked] = useState(likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(likes);
  const [isTogglingLike, setIsTogglingLike] = useState(false);

  useEffect(() => {
    setLiked(likedByCurrentUser);
  }, [likedByCurrentUser]);

  useEffect(() => {
    setLikeCount(likes);
  }, [likes]);

  async function handleLike() {
    if (!postId || !onToggleLike || isTogglingLike) return;

    const previousLiked = liked;
    const previousLikeCount = likeCount;
    const nextLiked = !previousLiked;

    setIsTogglingLike(true);
    setLiked(nextLiked);
    setLikeCount((prev) => (nextLiked ? prev + 1 : Math.max(prev - 1, 0)));

    try {
      const nextCount = await onToggleLike(postId);
      setLikeCount(nextCount);
    } catch {
      setLiked(previousLiked);
      setLikeCount(previousLikeCount);
    } finally {
      setIsTogglingLike(false);
    }
  }

  function formatCount(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  }

  return (
    <article className="bg-white rounded-3 shadow-sm border overflow-hidden mb-3">
      {/* Header */}
      <div className="p-3 d-flex align-items-center justify-content-between">
        <div className="d-flex align-items-center gap-3">
          <img
            src={authorAvatar}
            alt={`${authorName} profile picture`}
            className="rounded-circle object-fit-cover flex-shrink-0"
            style={{ width: '40px', height: '40px' }}
          />
          <div>
            <p className="mb-0 fw-bold" style={{ fontSize: '14px' }}>{authorName}</p>
            <p className="mb-0 text-secondary" style={{ fontSize: '12px' }}>{timeAgo}</p>
          </div>
        </div>
        <button
          className="btn btn-link text-secondary p-0 d-flex align-items-center"
          onClick={onMore}
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Body */}
      <div className="px-3 pb-3">
        {title && <p className="mb-2 text-dark fw-bold lh-base">{title}</p>}
        <p className="mb-0 text-dark lh-base">{content}</p>
      </div>

      {/* Image */}
      {image && (
        <div className="w-100 bg-light" style={{ aspectRatio: '16/9' }}>
          <img
            src={image}
            alt="Post media"
            className="w-100 h-100 object-fit-cover"
          />
        </div>
      )}

      {/* Actions */}
      <div className="px-3 py-2 border-top d-flex align-items-center gap-4">
        <button
          className={`btn btn-link p-0 d-flex align-items-center gap-2 text-decoration-none ${liked ? 'text-primary' : 'text-secondary'}`}
          onClick={handleLike}
          disabled={isTogglingLike}
        >
          <span className="material-symbols-outlined" style={{ fontVariationSettings: liked ? "'FILL' 1" : "'FILL' 0" }}>
            favorite
          </span>
          <span className="fw-semibold" style={{ fontSize: '14px' }}>{formatCount(likeCount)}</span>
        </button>

        <button
          className="btn btn-link p-0 d-flex align-items-center gap-2 text-secondary text-decoration-none"
          onClick={() => {
            if (postId) {
              onCommentsClick?.(postId);
            }
          }}
        >
          <span className="material-symbols-outlined">chat_bubble</span>
          <span className="fw-semibold" style={{ fontSize: '14px' }}>{formatCount(comments)}</span>
        </button>
      </div>
    </article>
  );
}
