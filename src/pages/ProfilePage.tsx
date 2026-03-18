import { useState, useCallback, useEffect, useRef, type FormEvent } from 'react';
import * as z from 'zod';
import Header, { PageType } from '../components/general/header';
import Feed from '../components/posts/Feed';
import { deleteUploadedImage, uploadPostImage } from '../services/imageService';
import { useAuth } from '../context/AuthContext';
import { getUserAvatarById, DEFAULT_AVATAR, updateUserProfile } from '../services/userService';
import { fetchPostsPageByUserId, getPostsCountByUserId } from '../services/postService';
import { toStaticImageUrl } from '../services/imageService';

const usernameSchema = z
  .string()
  .min(3, 'Username must be at least 3 characters')
  .max(20, 'Username is too long');


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
  const [removeAvatar, setRemoveAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [postsCount, setPostsCount] = useState<number | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const originalAvatarRef = useRef<string | null>(null);

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
  const avatarSrc = removeAvatar ? DEFAULT_AVATAR : (avatarPreview ?? profileAvatar);
  const avatarDisplayUrl =
    typeof avatarSrc === 'string' && avatarSrc.startsWith('blob:')
      ? avatarSrc
      : (toStaticImageUrl(avatarSrc) || avatarSrc);

  const isDeletableUploadedPath = (path?: string | null) => {
    if (!path) return false;
    if (path === DEFAULT_AVATAR) return false;
    if (path.startsWith('http://') || path.startsWith('https://')) return false;
    if (path.startsWith('blob:')) return false;
    return true;
  };

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
    setLocalError(null);
    setError(null);

    const trimmed = displayName.trim();
    const parsed = usernameSchema.safeParse(trimmed);
    if (!parsed.success) {
      setLocalError(parsed.error.issues[0]?.message ?? 'Invalid username');
      return;
    }

    setIsSaving(true);
    try {
      let imagePath: string | undefined;
      if (avatarFile) {
        const uploadRes = await uploadPostImage(avatarFile);
        imagePath = uploadRes.path;
      }
      const newName = trimmed || user.username;
      const imagePayload =
        imagePath ? { image: imagePath } : removeAvatar ? { image: '' } : {};

      await updateUserProfile(user.id, {
        name: newName,
        ...imagePayload,
      });

      // Delete the previous uploaded avatar if it was replaced or removed.
      const original = originalAvatarRef.current;
      const shouldDeleteOriginal = Boolean(original && (imagePath || removeAvatar));
      if (shouldDeleteOriginal && original && isDeletableUploadedPath(original)) {
        const filename = original.split('/').pop();
        if (filename) {
          try {
            await deleteUploadedImage(filename);
          } catch {
            // Ignore delete errors
          }
        }
      }
      updateUser({
        username: newName,
        ...(imagePath ? { avatar: imagePath } : removeAvatar ? { avatar: undefined } : {}),
      });
      if (imagePath) setProfileAvatar(imagePath);
      if (removeAvatar) setProfileAvatar(DEFAULT_AVATAR);
      setRefreshTrigger((prev) => prev + 1);
      setAvatarFile(null);
      setAvatarPreview(null);
      setRemoveAvatar(false);
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
    setRemoveAvatar(false);
    setLocalError(null);
    setError(null);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setRemoveAvatar(false);
    setLocalError(null);
    e.target.value = '';
  };

  const startEditing = () => {
    originalAvatarRef.current = (user?.avatar && user.avatar.trim() ? user.avatar : profileAvatar) || null;
    setIsEditing(true);
    setError(null);
    setLocalError(null);
    setAvatarFile(null);
    setAvatarPreview(null);
    setRemoveAvatar(false);
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
                    {(avatarPreview || (profileAvatar && profileAvatar !== DEFAULT_AVATAR && !removeAvatar)) && (
                      <button
                        type="button"
                        className="btn btn-light btn-sm position-absolute bottom-0 start-0 rounded-circle border border-white border-3 d-flex align-items-center justify-content-center"
                        style={{ width: '36px', height: '36px' }}
                        title="Remove profile photo"
                        aria-label="Remove profile photo"
                        onClick={() => {
                          setAvatarFile(null);
                          setAvatarPreview(null);
                          setRemoveAvatar(true);
                        }}
                      >
                        <span className="material-symbols-outlined text-danger" style={{ fontSize: '20px' }}>
                          delete
                        </span>
                      </button>
                    )}
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
                      onChange={(e) => {
                        setDisplayName(e.target.value);
                        if (localError) setLocalError(null);
                      }}
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
                      onClick={startEditing}
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

              {(localError || error) && (
                <div className="alert alert-danger py-2 px-3 mb-2 small" role="alert">
                  {localError || error}
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
            refreshTrigger={refreshTrigger}
            onCommentClick={onCommentsClick}
          />
        </div>
      </main>
    </div>
  );
}
