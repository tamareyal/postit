import { useState, useEffect, useRef } from 'react';
import Header, { PageType } from '../components/general/header';
import CreatePost from '../components/posts/CreatePost';
import PostCard from '../components/posts/PostCard';
import type { PostCardProps } from '../components/posts/PostCard';
import BottomLoadingIndicator from '../components/general/BottomLoadingIndicator';

const INITIAL_POSTS: PostCardProps[] = [
  {
    authorName: 'Sarah Jenkins',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDMMsUSUux0kGmQdhW57bIlVyTGA517Hd92yeOk2p07hL_q71BavuqT_t23WVTkkycWnGJYYGI1cElgChAYyk__PHi_lwpHbg-45nLygaNR67sMIT92kktMk1AvQS3P9iWb4f9IICsUcQaCKJQ4q81b4ejtglJwNMgnYoCoD9wKBEdEJwTzKTWhQpqvJA3cdmPFWLCBhfIJHZu-oLLz1sDWGNxdTuqOUw_X1lPcvqLwtX3qYyTZj2YLODzBScwfKNmzgpIFDW31coo',
    timeAgo: '2 hours ago',
    content: 'Just reached the summit of Mt. Rainier! The view from up here is absolutely breathtaking. Highly recommend this trail for anyone looking for a challenge. 🏔️✨',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuALf2xcLbeLRzDGPbGw_MwYEjf7SeQcOOKudmMgq1xGFVngjOkXNkJ5LQD_iZ8TxqNA8-ghVTvAL5peFO4E_NvVtp8nTiNJuNKjPBVVFJ5fFeTxLnhCmbocwf917oKgeIx818MdmjR_pG4BqTbFzlmrXMiblUPiWd8kpuGLmPMNdc8Z0vZpAWjG5wTVWxBKw3FLhAd4uxuQQ8zhLeOoEgxSSBLMxl4fCRhjavUmFU0ldrG4wYODLtqWk-b6NW8muUmu1EAuakwpM1c',
    likes: 1200,
    comments: 48,
  },
  {
    authorName: 'Marcus Chen',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBGRMdc8Qx_VvWnXKVQ-Q_LoJojtE0J7gnURzWaoe5YS4VWX7yn80DtFMufvbONKTFFPR9NLjUlw1OOd8hZWDdi5zI_taQ7Yi3hpWL_IxxNC27ioUMM1GLrUsLbVN-9ygJVXXi857mDjUP4exwSuG4B-KyZcaSpDgMK0ATisoNuqvfWqeV658oXjnpB39AndXPctmd20-MTESGdn72Qn9sJcdk4ZF6wnb452zOOVxt34Br_2j2PW2omkblC_wVBMl16HphRDYnC_4s',
    timeAgo: '5 hours ago',
    content: 'Started a new project today using the latest AI models. The speed of iteration is mind-blowing! Can\'t wait to share more soon. 🖥️🚀 #buildinpublic #tech',
    likes: 856,
    comments: 12,
  },
  {
    authorName: 'Elena Rodriguez',
    authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE',
    timeAgo: 'Yesterday',
    content: 'Morning coffee by the lake. Best way to start the weekend.',
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMwzJhHxVEJc43SZtdVGOBKyEJGMDcQMVp3Q1vOnxWdkIqleTaTvlXtHvupKLOlMH6Jq7AY2ZJpK9bkTdCdG7E6PZjX8vOJKBipBjx0hMfwZbqkrpU7HbObOPbDwtFUTc2c-PNzJM7wfT5WLMv_FrSPamDvPk8mH3BVjjEqBFNQYpZ7EiKwRGJj3yO0KCKVxKG4WpEj1L2RWTPgaqJMpLkifFalzJnw5PGIKXQrY9bC7aKTL8rrJmM7J1KhVSFUVD2xjvtT4rA',
    likes: 2400,
    comments: 156,
  },
];

const CURRENT_USER = {
  name: 'Alex Rivera',
  avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE',
};

export default function HomeFeed() {
  const [posts, setPosts] = useState<PostCardProps[]>(INITIAL_POSTS);
  const [isLoading, setIsLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, [isLoading]);

  function handleNewPost(content: string) {
    const newPost: PostCardProps = {
      authorName: CURRENT_USER.name,
      authorAvatar: CURRENT_USER.avatar,
      timeAgo: 'Just now',
      content,
      likes: 0,
      comments: 0,
    };
    setPosts((prev) => [newPost, ...prev]);
  }

  return (
    <div className="min-vh-100 bg-light">
      <Header
        page={PageType.Home}
        userName={CURRENT_USER.name}
        userAvatar={CURRENT_USER.avatar}
      />
      <main className="container py-4" style={{ maxWidth: '640px' }}>
        <CreatePost
          userAvatar={CURRENT_USER.avatar}
          userName={CURRENT_USER.name}
          onPost={handleNewPost}
        />
        {posts.map((post, i) => (
          <PostCard key={i} {...post} />
        ))}
        <div ref={bottomRef} />
        {isLoading && <BottomLoadingIndicator />}
      </main>
    </div>
  );
}
