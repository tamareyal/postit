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
  likedByCurrentUser?: boolean;
  comments: number;
  canManage?: boolean;
  onEdit?: (data: { title: string; content: string; imageFile?: File; removeImage?: boolean; originalImage?: string }) => void;
  onDelete?: () => void;
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
  canManage = false,
  onEdit,
  onDelete,
  onCommentsClick,
  onToggleLike,
}: PostCardProps) {
  const [liked, setLiked] = useState(likedByCurrentUser);
  const [likeCount, setLikeCount] = useState(likes);
  const [isTogglingLike, setIsTogglingLike] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editTitle, setEditTitle] = useState(title || '');
  const [editContent, setEditContent] = useState(content);
  const [editImageFile, setEditImageFile] = useState<File | undefined>();
  const [editImagePreview, setEditImagePreview] = useState<string | undefined>(image);
  const [removeImage, setRemoveImage] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const menuContainerRef = useRef<HTMLDivElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

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

  function handleEdit() {
    setIsMenuOpen(false);
    setIsEditMode(true);
    setEditImageFile(undefined);
    setEditImagePreview(image);
    setRemoveImage(false);
    setLocalError(null);
  }

  function handleUpdate() {
    setLocalError(null);

    const trimmedTitle = editTitle.trim();
    const trimmedContent = editContent.trim();

    if (!trimmedTitle || !trimmedContent) {
      setLocalError('Title and content are required.');
      return;
    }

    setIsEditMode(false);
    onEdit?.({
      title: trimmedTitle,
      content: trimmedContent,
      imageFile: editImageFile,
      removeImage,
      originalImage: image,
    });
  }

  function handleCancel() {
    setIsEditMode(false);
    setEditTitle(title || '');
    setEditContent(content);
    setEditImageFile(undefined);
    setEditImagePreview(image);
    setRemoveImage(false);
    setLocalError(null);
  }

  function handleImageSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (file) {
      setEditImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setEditImagePreview(previewUrl);
      setRemoveImage(false);
    }
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
        {isEditMode ? (
          <>
            <input
              type="text"
              className="form-control mb-2"
              placeholder="Post title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <textarea
              className="form-control mb-2"
              placeholder="What's on your mind?"
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
            />
            <input
              ref={imageInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: 'none' }}
            />
            <div className="d-flex gap-2 mb-2">
              <button
                type="button"
                className="btn btn-sm btn-outline-secondary"
                onClick={() => imageInputRef.current?.click()}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '4px' }}>image</span>
                Change Image
              </button>
              {editImagePreview && (
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => {
                    setEditImageFile(undefined);
                    setEditImagePreview(undefined);
                    setRemoveImage(true);
                  }}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', marginRight: '4px' }}>delete</span>
                  Remove Image
                </button>
              )}
            </div>
            {editImagePreview && (
              <div className="mb-2 position-relative d-inline-block">
                <img
                  src={editImagePreview}
                  alt="Preview"
                  style={{ maxWidth: '100%', height: 'auto', maxHeight: '200px' }}
                />
              </div>
            )}

            {localError && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-2" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                <span className="small fw-semibold">{localError}</span>
              </div>
            )}

            <div className="d-flex gap-2 mt-2">
              <button
                type="button"
                className="btn btn-sm btn-primary"
                onClick={handleUpdate}
              >
                Update
              </button>
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={handleCancel}
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            {editTitle && <p className="mb-2 text-dark fw-bold lh-base">{editTitle}</p>}
            <p className="mb-0 text-dark lh-base">{editContent}</p>
          </>
        )}
      </div>

      {/* Image */}
      {!isEditMode && editImagePreview && (
        <div className="w-100 bg-light" style={{ aspectRatio: '16/9' }}>
          <img
            src={editImagePreview}
            alt="Post media"
            className="w-100 h-100 object-fit-cover"
          />
        </div>
      )}

      {/* Actions */}
      {!isEditMode && (
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
      )}
    </article>
  );
}
