import { useEffect, useRef, useState } from 'react';

export interface PostCardProps {
  postId?: string;
  postImagePath?: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  timeAgo: string;
  title?: string;
  content: string;
  image?: string;
  likes: number;
  comments: number;
  canManage?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
  onCommentsClick?: (postId: string) => void;
  onMore?: () => void;
  onShare?: () => void;
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
  comments,
  canManage = false,
  onEdit,
  onDelete,
  onCommentsClick,
}: PostCardProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!menuContainerRef.current) return;
      if (!menuContainerRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  function handleLike() {
    setLiked((prev) => !prev);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  }

  function handleEdit() {
    setIsMenuOpen(false);
    onEdit?.();
  }

  function handleDelete() {
    setIsMenuOpen(false);
    onDelete?.();
  }

  function formatCount(n: number) {
    return n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
  }

  return (
    <article className="bg-white rounded-3 shadow-sm border overflow-hidden mb-3">
      {/* Header */}
      <div className="p-3 d-flex align-items-center justify-content-between position-relative">
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
        {canManage && (
          <div ref={menuContainerRef} className="position-relative">
            <button
              className="btn btn-link text-secondary p-0 d-flex align-items-center text-decoration-none"
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Post options"
            >
              <span className="material-symbols-outlined">more_vert</span>
            </button>

            {isMenuOpen && (
              <div className="position-absolute top-100 end-0 mt-1 bg-white border rounded-3 shadow-sm p-1" style={{ minWidth: '140px', zIndex: 5 }}>
                <button
                  type="button"
                  className="dropdown-item post-options-item d-flex align-items-center gap-2 rounded-2"
                  onClick={handleEdit}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  className="dropdown-item post-options-item d-flex align-items-center gap-2 rounded-2 text-danger"
                  onClick={handleDelete}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        )}
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
