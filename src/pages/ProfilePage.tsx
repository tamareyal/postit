import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import Header, { PageType } from '../components/general/header';
import Feed from '../components/posts/Feed';
import { uploadPostImage } from '../services/imageService';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarById, DEFAULT_AVATAR, updateUserProfile } from '../services/userService';
import { fetchPostsPageByUserId, getPostsCountByUserId } from '../services/postService';
import { toStaticImageUrl } from '../services/imageService';


interface ProfilePageProps {
  onBack?: () => void;
  onLogoClick?: () => void;
  onCommentsClick?: (postId: string) => void;
}

export default function ProfileFeed({ onBack, onLogoClick, onCommentsClick }: ProfilePageProps) {
  const { user, updateUser } = useAuth();
  const [profileAvatar, setProfileAvatar] = useState<string>(DEFAULT_AVATAR);
  const [displayName, setDisplayName] = useState(user?.username ?? '');
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [postsCount, setPostsCount] = useState<number | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    getUserAvatarById(user?.id).then(setProfileAvatar);
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id) {
      setPostsCount(null);
      return;
    }
    getPostsCountByUserId(user.id)
      .then(setPostsCount)
      .catch(() => setPostsCount(null));
  }, [user?.id]);

  useEffect(() => {
    setDisplayName(user?.username ?? '');
  }, [user?.username]);

  const userName = displayName || 'Unknown User';
  const avatarSrc = avatarPreview ?? profileAvatar;
  const avatarDisplayUrl =
    typeof avatarSrc === 'string' && avatarSrc.startsWith('blob:')
      ? avatarSrc
      : (toStaticImageUrl(avatarSrc) || avatarSrc);

  const fetchPage = useCallback(
    async (params: { limit: number; cursor: string | null; queryHash: string | null }) => {
      if (!user?.id) {
        return { data: [], nextCursor: null, queryHash: '' };
      }
      return fetchPostsPageByUserId(params.limit, params.cursor, params.queryHash, user.id);
    },
    [user?.id],
  );

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setError(null);
    setIsSaving(true);
    try {
      let imagePath: string | undefined;
      if (avatarFile) {
        const uploadRes = await uploadPostImage(avatarFile);
        imagePath = uploadRes.path;
      }
      await updateUserProfile(user.id, {
        name: displayName.trim() || user.username,
        ...(imagePath ? { image: imagePath } : {}),
      });
      const newName = displayName.trim() || user.username;
      updateUser({
        username: newName,
        ...(imagePath ? { avatar: imagePath } : {}),
      });
      if (imagePath) setProfileAvatar(imagePath);
      setAvatarFile(null);
      setAvatarPreview(null);
      setIsEditing(false);
    } catch (err) {
      setError('Failed to update profile. Please try again.');
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setDisplayName(user?.username ?? '');
    setAvatarFile(null);
    setAvatarPreview(null);
    setError(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    e.target.value = '';
  };

  return (
    <div className="bg-light min-vh-100">
      <Header
        page={PageType.Profile}
        onSettings={() => void 0}
        onLogoClick={onLogoClick ?? onBack}
      />

      <main className="container py-4" style={{ maxWidth: '640px' }}>
        <div className="card shadow-sm border-0 mb-4 p-4">
          <div className="row align-items-center">
            {/* Avatar Column */}
            <div className="col-md-4 text-center mb-3 mb-md-0">
              <div className="position-relative d-inline-block">
                <img
                  src={avatarDisplayUrl}
                  alt={`${userName} profile picture`}
                  className="rounded-circle border"
                  style={{ width: '150px', height: '150px', objectFit: 'cover' }}
                />
                {isEditing && (
                  <>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="d-none"
                      onChange={handleAvatarFileChange}
                    />
                    <button
                      type="button"
                      className="btn btn-primary btn-sm position-absolute bottom-0 end-0 rounded-circle border border-white border-3 d-flex align-items-center justify-content-center"
                      style={{ width: '36px', height: '36px' }}
                      title="Change profile photo"
                      aria-label="Change profile photo"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                        photo_camera
                      </span>
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* User Info Column */}
            <div className="col-md-8">
              <div className="d-flex flex-column flex-md-row align-items-center mb-3 flex-wrap gap-2">
                {isEditing ? (
                  <form
                    className="d-flex flex-column flex-md-row align-items-center flex-wrap gap-2"
                    onSubmit={(e) => {
                      e.preventDefault();
                      void handleSave(e);
                    }}
                  >
                    <input
                      type="text"
                      className="form-control fw-bold"
                      style={{ maxWidth: '280px', fontSize: '1.25rem' }}
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      placeholder="Your name"
                    />
                    <div className="d-flex align-items-center gap-1">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}
                        title="Save"
                        aria-label="Save"
                        disabled={isSaving}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          check
                        </span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-light btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}
                        title="Cancel"
                        aria-label="Cancel"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                          close
                        </span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <h2 className="fw-bold mb-0 me-2">{userName}</h2>
                    <button
                      type="button"
                      className="btn btn-light btn-sm d-flex align-items-center justify-content-center rounded-circle p-0"
                      style={{ width: '32px', height: '32px' }}
                      title="Edit profile"
                      aria-label="Edit profile"
                      onClick={() => setIsEditing(true)}
                    >
                      <span className="material-symbols-outlined text-secondary" style={{ fontSize: '20px' }}>
                        edit
                      </span>
                    </button>
                    <button type="button" className="btn btn-light btn-sm ms-1">
                      <i className="bi bi-three-dots"></i>
                    </button>
                  </>
                )}
              </div>

              {error && (
                <div className="alert alert-danger py-2 px-3 mb-2 small" role="alert">
                  {error}
                </div>
              )}

              <hr className="d-md-none" />

              <div className="row text-center text-md-start">
                <div className="col-3">
                  <div className="fw-bold fs-5">{postsCount ?? '—'}</div>
                  <div className="small text-uppercase text-muted" style={{ fontSize: '0.7rem' }}>
                    Posts
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <Feed
            fetchPage={fetchPage}
            onCommentClick={onCommentsClick}
          />
        </div>
      </main>
    </div>
  );
}
