import { useRef } from 'react';

interface CreatePostProps {
  userAvatar?: string;
  userName?: string;
  onPost?: (content: string) => void;
}

export default function CreatePost({ userAvatar, userName = 'User', onPost }: CreatePostProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handlePost() {
    const value = textareaRef.current?.value.trim();
    if (value) {
      onPost?.(value);
      if (textareaRef.current) textareaRef.current.value = '';
    }
  }

  return (
    <div className="bg-white rounded-3 shadow-sm border p-4 mb-4">
      <div>
        <div className="d-flex gap-3">
          {/* Avatar */}
          <img
            src={userAvatar}
            alt={`${userName} avatar`}
            className="rounded-circle object-fit-cover flex-shrink-0"
            style={{ width: '40px', height: '40px' }}
          />

          {/* Content area */}
          <div className="flex-grow-1">
            <textarea
              ref={textareaRef}
              className="form-control border-0 shadow-none bg-transparent resize-none fs-5 p-0"
              placeholder="What's on your mind?"
              rows={3}
            />

            {/* Toolbar */}
            <div className="d-flex align-items-center justify-content-between pt-3 mt-2 border-top">
              <div className="d-flex gap-1">
                <button
                  type="button"
                  className="btn btn-light d-flex align-items-center gap-2 px-3 py-1 rounded-2"
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>image</span>
                  <span className="fw-medium" style={{ fontSize: '12px' }}>Photo</span>
                </button>
              </div>

              <button type="button" onClick={handlePost} className="btn btn-primary px-4 py-1 fw-semibold" style={{ fontSize: '14px' }}>
                Post
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
