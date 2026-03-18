import { useState, useCallback, useEffect } from 'react';
import Header, { PageType } from '../components/general/header';
import CreatePost from '../components/posts/CreatePost';
import Feed from '../components/posts/Feed';
import CommentsPage from './CommentsPage';
import ProfilePage from './ProfilePage';
import {
  createPost,
  deletePost,
  extractApiErrorMessage,
  fetchPostsPage,
  searchPosts
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
  const [feedError, setFeedError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
<<<<<<< HEAD
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
=======
  const [activeSearch, setActiveSearch] = useState<string>("");
  const [selectedCommentsPostId, setSelectedCommentsPostId] = useState<string | null>(getCommentsPostIdFromUrl);
>>>>>>> 16463c3e86506c7ade58d6957cbe2e92fbf96ad7

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
    params: { limit: number; cursor: string | null; queryHash: string | null; signal?: AbortSignal }
  ) => {
    if (activeSearch.trim()) {
      return searchPosts(activeSearch, params.limit, params.cursor, params.queryHash, params.signal);
    }
    return fetchPostsPage(params.limit, params.cursor, params.queryHash, params.signal);
  }, [activeSearch]);

  const handleSearch = (query: string) => {
    setActiveSearch(query);
  };

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

  const handleDeletePost = useCallback(async (postId: string, imagePath?: string) => {
    setFeedError(null);

    try {
      await deletePost(postId);

      const imageFilename = imagePath?.split('/').pop();
      if (imageFilename) {
        try {
          await deleteUploadedImage(imageFilename);
        } catch {
          // Silently fail on image deletion
        }
      }

      setRefreshTrigger(prev => prev + 1);
    } catch (err) {
      console.error('Error deleting post:', err);
      setFeedError(extractApiErrorMessage(err, 'Failed to delete post.'));
    }
  }, []);

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
<<<<<<< HEAD
        onSettings={goToProfile}
        onLogoClick={goHome}
=======
        onSearch={handleSearch}
>>>>>>> 16463c3e86506c7ade58d6957cbe2e92fbf96ad7
      />
      <main className="container py-4" style={{ maxWidth: '640px' }}>
        {!activeSearch && (
          <CreatePost
            onPost={handleNewPost}
            isSubmitting={isSubmitting}
            errorMessage={postError}
          />
        )}
        {feedError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            <span className="small fw-semibold">{feedError}</span>
          </div>
        )}
        <Feed
         key={activeSearch}
         fetchPage={fetchPage}
         refreshTrigger={refreshTrigger}
         emptyStateProps={{
            title: activeSearch ? "No matches found" : "There is no content to display",
            description: activeSearch ? "Try a different search query." : "Upload or wait for other users to post content."
          }}
         onCommentClick={handleOpenComments}
         onDeletePost={handleDeletePost}
         />
      </main>
    </div>
  );
}
