import type { ChangeEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_AVATAR, getUserAvatarById } from '../../services/userService';
import { toStaticImageUrl } from '../../services/imageService';

interface CreatePostProps {
  onPost?: (data: { title: string; content: string; imageFile?: File }) => Promise<void> | void;
  isSubmitting?: boolean;
  errorMessage?: string | null;
}

export default function CreatePost({ onPost, isSubmitting = false, errorMessage }: CreatePostProps) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedImage, setSelectedImage] = useState<File | undefined>();
  const [localError, setLocalError] = useState<string | null>(null);
  const [profileAvatar, setProfileAvatar] = useState<string>(DEFAULT_AVATAR);

  useEffect(() => {
    getUserAvatarById(user?.id).then(setProfileAvatar);
  }, [user?.id]);

  const userName = user?.username || 'Unknown User';
  const userAvatar = user?.avatar ?? profileAvatar;
  const userAvatarUrl = toStaticImageUrl(userAvatar) || userAvatar;

  function handleImageSelect(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    setSelectedImage(file);
  }

  async function handlePost() {
    setLocalError(null);

    const trimmedTitle = title.trim();
    const value = textareaRef.current?.value.trim();

    if (!trimmedTitle || !value) {
      setLocalError('Title and content are required.');
      return;
    }

    try {
      await onPost?.({ title: trimmedTitle, content: value, imageFile: selectedImage });
      setTitle('');
      setSelectedImage(undefined);
      if (textareaRef.current) textareaRef.current.value = '';
    } catch {}
  }

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4 mb-4">
      <div>
        <div className="d-flex gap-3">
          {/* Avatar */}
          <img
            src={userAvatarUrl}
            alt={`${userName} avatar`}
            className="rounded-circle object-fit-cover flex-shrink-0"
            style={{ width: '40px', height: '40px' }}
          />

          {/* Content area */}
          <div className="flex-grow-1">
            <input
              type="text"
              className="form-control border-0 shadow-none bg-transparent fs-5 p-0 mb-2 fw-semibold"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={isSubmitting}
            />
            <textarea
              ref={textareaRef}
              className="form-control border-0 shadow-none bg-transparent resize-none fs-5 p-0"
              placeholder="What's on your mind?"
              rows={3}
              disabled={isSubmitting}
            />

            {selectedImage && (
              <p className="small text-muted mb-0 mt-2">Selected image: {selectedImage.name}</p>
            )}

            {(localError || errorMessage) && (
              <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mt-3 mb-0" role="alert">
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
                <span className="small fw-semibold">{localError || errorMessage}</span>
              </div>
            )}

            {/* Toolbar */}
            <div className="d-flex align-items-center justify-content-between pt-3 mt-2 border-top">
              <div className="d-flex gap-1">
                <label
                  className="btn btn-light d-flex align-items-center gap-2 px-3 py-1 rounded-2 mb-0"
                  htmlFor="post-image-input"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>image</span>
                  <span className="fw-medium" style={{ fontSize: '12px' }}>Photo</span>
                </label>
                <input
                  id="post-image-input"
                  type="file"
                  className="d-none"
                  accept="image/*"
                  onChange={handleImageSelect}
                  disabled={isSubmitting}
                />
              </div>

              <button type="button" onClick={handlePost} disabled={isSubmitting} className="btn btn-primary px-4 py-1 fw-semibold" style={{ fontSize: '14px' }}>
                {isSubmitting ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
