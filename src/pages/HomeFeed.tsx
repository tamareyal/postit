import { useState, useCallback } from 'react';
import Header, { PageType } from '../components/general/header';
import CreatePost from '../components/posts/CreatePost';
import Feed from '../components/posts/Feed';
import {
  createPost,
  extractApiErrorMessage,
  fetchPostsPage,
  searchPosts
} from '../services/postService';
import { deleteUploadedImage, uploadPostImage } from '../services/imageService';

export default function HomeFeed() {
  // Post submission states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [activeSearch, setActiveSearch] = useState<string>("");

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
        onSearch={handleSearch}
      />
      <main className="container py-4" style={{ maxWidth: '640px' }}>
        {!activeSearch && (
          <CreatePost
            onPost={handleNewPost}
            isSubmitting={isSubmitting}
            errorMessage={postError}
          />
        )}
        <Feed
         key={activeSearch}
         pageLimit={5}
         fetchPage={fetchPage} 
         refreshTrigger={refreshTrigger}
         emptyStateProps={{
            title: activeSearch ? "No matches found" : "Feed is empty",
            description: activeSearch ? "Try a different search query." : "Post something to start!"
          }}
         />
      </main>
    </div>
  );
}
