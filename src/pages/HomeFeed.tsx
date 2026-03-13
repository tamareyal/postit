import { useState, useEffect, useRef } from 'react';
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
  fetchPosts,
  type ApiPost,
} from '../services/postService';
import { deleteUploadedImage, toStaticImageUrl, uploadPostImage } from '../services/imageService';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE';

const CURRENT_USER = {
  name: 'Alex Rivera',
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

const mapApiPostToCard = (post: ApiPost): PostCardProps => ({
  authorName: post.sender?.name || post.sender?.username || 'Unknown',
  authorAvatar: post.sender?.avatar || DEFAULT_AVATAR,
  timeAgo: getTimeAgo(post.createdAt),
  title: post.title,
  content: post.content,
  image: toStaticImageUrl(post.image),
  likes: 0,
  comments: 0,
});

export default function HomeFeed() {
  const { user, logout } = useAuth();
  const [posts, setPosts] = useState<PostCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [feedError, setFeedError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isActive = true;

    const loadPosts = async () => {
      setFeedError(null);
      try {
        const apiPosts = await fetchPosts();
        if (!isActive) return;
        setPosts(apiPosts.map(mapApiPostToCard));
      } catch (error) {
        if (!isActive) return;
        setFeedError(extractApiErrorMessage(error, 'Failed to load posts.'));
        setPosts([]);
      }
    };

    void loadPosts();

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (posts.length === 0) {
      setIsLoading(false);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoading) {
          setIsLoading(true);
          setTimeout(() => setIsLoading(false), 2000);
        }
      },
      { threshold: 1.0 } // 100% of the target div is visible for the callback to be executed
    );
    if (bottomRef.current) observer.observe(bottomRef.current);
    return () => observer.disconnect();
  }, [isLoading, posts.length]);

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

      const refreshedPosts = await fetchPosts();
      setPosts(refreshedPosts.map(mapApiPostToCard));
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
        userAvatar={CURRENT_USER.avatar}
        onLogout={logout}
      />
      <main className="container py-4" style={{ maxWidth: '640px' }}>
        <CreatePost
          userAvatar={CURRENT_USER.avatar}
          userName={user?.username || CURRENT_USER.name}
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
        {posts.length === 0 ? (
          <EmptyFeed />
        ) : (
          posts.map((post, i) => (
            <PostCard key={i} {...post} />
          ))
        )}
        <div ref={bottomRef} />
        {posts.length > 0 && isLoading && <BottomLoadingIndicator />}
      </main>
    </div>
  );
}
