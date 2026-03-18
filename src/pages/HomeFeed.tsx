import { useState, useCallback, useEffect } from 'react';
import Header, { PageType } from '../components/general/header';
import CreatePost from '../components/posts/CreatePost';
import Feed from '../components/posts/Feed';
import CommentsPage from './CommentsPage';
import ProfilePage from './ProfilePage';
import {
  createPost,
  extractApiErrorMessage,
  fetchPostsPage,
} from '../services/postService';
import { deleteUploadedImage, uploadPostImage } from '../services/imageService';

const COMMENTS_POST_ID_PARAM = 'commentsPostId';
const PROFILE_PATH = '/profile';

type RouteView = 'home' | 'profile' | 'comments';

/** Derives the current view and optional comments post id from the URL (pathname + search). */
function getRouteFromUrl(): { view: RouteView; commentsPostId: string | null } {
  const pathname = window.location.pathname;
  const params = new URLSearchParams(window.location.search);
  const commentsPostId = params.get(COMMENTS_POST_ID_PARAM);

  if (commentsPostId) return { view: 'comments', commentsPostId };
  if (pathname === PROFILE_PATH) return { view: 'profile', commentsPostId: null };
  return { view: 'home', commentsPostId: null };
}

function getInitialRoute() {
  return getRouteFromUrl();
}

export default function HomeFeed() {
  const initial = getInitialRoute();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [selectedCommentsPostId, setSelectedCommentsPostId] = useState<string | null>(
    initial.view === 'comments' ? initial.commentsPostId : null
  );
  const [showProfile, setShowProfile] = useState(initial.view === 'profile');

  const goHome = useCallback(() => {
    setShowProfile(false);
    setSelectedCommentsPostId(null);
    window.history.pushState({}, '', '/');
  }, []);

  const goToProfile = useCallback(() => {
    setSelectedCommentsPostId(null);
    setShowProfile(true);
    window.history.pushState({}, '', PROFILE_PATH);
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      const route = getRouteFromUrl();
      setSelectedCommentsPostId(route.view === 'comments' ? route.commentsPostId : null);
      setShowProfile(route.view === 'profile');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const fetchPage = useCallback(async (
    params: { limit: number; cursor: string | null; queryHash: string | null }
  ) => fetchPostsPage(params.limit, params.cursor, params.queryHash), []);

  const handleOpenComments = useCallback((postId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set(COMMENTS_POST_ID_PARAM, postId);
    const path = window.location.pathname;
    const nextUrl = params.toString() ? `${path}?${params.toString()}` : path;
    window.history.pushState({}, '', nextUrl);
    setSelectedCommentsPostId(postId);
  }, []);

  const handleNewPost = async (data: { title: string; content: string; imageFile?: File }) => {
    setIsSubmitting(true);
    setPostError(null);

    let uploadedPath: string | undefined;
    let postCreated = false;

    try {
      if (data.imageFile) {
        const uploadResponse = await uploadPostImage(data.imageFile);
        uploadedPath = uploadResponse.path;
      }

      await createPost({
        title: data.title,
        content: data.content,
        ...(uploadedPath ? { image: uploadedPath } : {}),
      });
      postCreated = true;

      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      if (uploadedPath && !postCreated) {
        const uploadedFilename = uploadedPath.split('/').pop();
        if (uploadedFilename) {
          try {
            await deleteUploadedImage(uploadedFilename);
          } catch {}
        }
      }

      setPostError(extractApiErrorMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (selectedCommentsPostId) {
    return (
      <CommentsPage
        postId={selectedCommentsPostId}
        onGoHome={goHome}
        onGoToProfile={goToProfile}
      />
    );
  }

  if (showProfile) {
    return (
      <ProfilePage
        onBack={goHome}
        onLogoClick={goHome}
        onCommentsClick={handleOpenComments}
      />
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <Header
        page={PageType.Home}
        onSettings={goToProfile}
        onLogoClick={goHome}
      />
      <main className="container py-4" style={{ maxWidth: '640px' }}>
        <CreatePost
          onPost={handleNewPost}
          isSubmitting={isSubmitting}
          errorMessage={postError}
        />
        <Feed
          fetchPage={fetchPage}
          refreshTrigger={refreshTrigger}
          onCommentClick={handleOpenComments}
        />
      </main>
    </div>
  );
}
