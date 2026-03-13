import { useState, useEffect, useRef, useCallback } from 'react';
import type { AxiosError } from 'axios';
import Header, { PageType } from '../components/general/header';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import EmptyFeed from '../components/posts/emptyFeed';
import type { PostCardProps } from '../components/posts/PostCard';
import BottomLoadingIndicator from '../components/general/BottomLoadingIndicator';
import { useAuth } from '../context/AuthContext';
import {
  createPost,
  extractApiErrorMessage,
  fetchPostsPage,
  type Post,
} from '../services/postService';
import { deleteUploadedImage, toStaticImageUrl, uploadPostImage } from '../services/imageService';
import { populateSenders } from '../services/userService';

const PAGE_LIMIT = 10;

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE';
const CURRENT_USER = {
  name: 'Unknown User',
  avatar: DEFAULT_AVATAR,
};

const getTimeAgo = (dateString?: string) => {
  if (!dateString) return 'Just now';

  const createdAt = new Date(dateString);
  if (Number.isNaN(createdAt.getTime())) return 'Just now';

  const seconds = Math.floor((Date.now() - createdAt.getTime()) / 1000);
  if (seconds < 60) return 'Just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const mapPostToCard = (post: Post): PostCardProps => ({
  authorName: post.sender?.name || 'Unknown',
  authorAvatar: toStaticImageUrl(post.sender?.image) || DEFAULT_AVATAR,
  timeAgo: getTimeAgo(post.createdAt),
  title: post.title,
  content: post.content,
  image: toStaticImageUrl(post.image),
  likes: 0,
  comments: 0,
});

export default function HomeFeed() {
  const { user, logout } = useAuth();

  // Paging and feed states
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFeedLoading, setIsFeedLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Post submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const isFetchingRef = useRef(false);
  const seenIdsRef = useRef(new Set<string>());

  const loadPosts = useCallback(async (cursor: string | null) => {
    if (isFetchingRef.current) return;
    isFetchingRef.current = true;

    const isFirstPage = cursor === null;

    if (isFirstPage) {
      setIsFeedLoading(true);
      setFeedError(null);
      seenIdsRef.current.clear();
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await fetchPostsPage(PAGE_LIMIT, cursor);
      const populated = await populateSenders(res.data);

      const newCards = populated
        .filter(post => !seenIdsRef.current.has(post._id))
        .map(post => {
          seenIdsRef.current.add(post._id);
          return mapPostToCard(post);
        });

      if (isFirstPage) {
        setPosts(newCards);
      } else {
        setPosts(prev => [...prev, ...newCards]);
      }

      setNextCursor(res.nextCursor);
      setHasMore(res.nextCursor !== null);

      isFetchingRef.current = false;

      if (isFirstPage) setIsFeedLoading(false);
      else setIsLoadingMore(false);
    
    } catch (err) {
      const status = (err as AxiosError).response?.status;
      isFetchingRef.current = false;

      if (isFirstPage) setIsFeedLoading(false);
      else setIsLoadingMore(false);

      if (!isFirstPage && status === 400) {
        // Stale cursor — reset and restart from first page
        seenIdsRef.current.clear();
        setNextCursor(null);
        setHasMore(true);
        void loadPosts(null);
        return;
      }

      if (isFirstPage) {
        setFeedError(extractApiErrorMessage(err, 'Failed to load posts.'));
        setPosts([]);
      }

      setHasMore(false);
    }
  }, []);

  useEffect(() => {
    void loadPosts(null);
  }, [loadPosts]);

  useEffect(() => {
    if (!hasMore || posts.length === 0) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isFetchingRef.current) {
          void loadPosts(nextCursor);
        }
      },
      { threshold: 1.0 }
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [hasMore, nextCursor, loadPosts, posts.length]);

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

      void loadPosts(null);
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

  return (
    <div className="min-vh-100 bg-light">
      <Header
        page={PageType.Home}
        userName={user?.username || CURRENT_USER.name}
        userAvatar={user?.avatar || CURRENT_USER.avatar}
        onLogout={logout}
      />
      <main className="container py-4" style={{ maxWidth: '640px' }}>
        <CreatePost
          userName={user?.username || CURRENT_USER.name}
          userAvatar={user?.avatar || CURRENT_USER.avatar}
          onPost={handleNewPost}
          isSubmitting={isSubmitting}
          errorMessage={postError}
        />
        {feedError && (
          <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3" role="alert">
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
            <span className="small fw-semibold">{feedError}</span>
          </div>
        )}
        {isFeedLoading ? (
          <div className="d-flex justify-content-center py-5">
            <div className="spinner-border text-secondary" role="status">
              <span className="visually-hidden">Loading posts…</span>
            </div>
          </div>
        ) : posts.length === 0 ? (
          <EmptyFeed />
        ) : (
          posts.map((post, i) => (
            <PostCard key={i} {...post} />
          ))
        )}
        <div ref={bottomRef} />
        {isLoadingMore && <BottomLoadingIndicator />}
      </main>
    </div>
  );
}
