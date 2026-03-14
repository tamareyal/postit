import { useState, useCallback } from 'react';
import Header, { PageType } from '../components/general/header';
import CreatePost from '../components/posts/CreatePost';
import Feed from '../components/posts/Feed';
import { useAuth } from '../context/AuthContext';
import {
  createPost,
  extractApiErrorMessage,
  fetchPostsPage,
} from '../services/postService';
import { deleteUploadedImage, uploadPostImage } from '../services/imageService';

const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE';
const CURRENT_USER = {
  name: 'Unknown User',
  avatar: DEFAULT_AVATAR,
};

export default function HomeFeed() {
  const { user, logout } = useAuth();

  // Post submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const fetchPage = useCallback(async (
    params: { limit: number; cursor: string | null; queryHash: string | null }
  ) => fetchPostsPage(params.limit, params.cursor, params.queryHash), []);

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

  return (
    <div className="min-vh-100 bg-light">
      <Header
        page={PageType.Home}
      />
      <main className="container py-4" style={{ maxWidth: '640px' }}>
        <CreatePost
          userName={user?.username || CURRENT_USER.name}
          userAvatar={user?.avatar || CURRENT_USER.avatar}
          onPost={handleNewPost}
          isSubmitting={isSubmitting}
          errorMessage={postError}
        />
        <Feed fetchPage={fetchPage} refreshTrigger={refreshTrigger} />
      </main>
    </div>
  );
}
