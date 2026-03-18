import { useCallback } from 'react';
import PostCard from './PostCard';
import type { PostCardProps } from './PostCard';
import EmptyFeed, { type EmptyFeedProps } from '../general/EmptyFeed';
import BottomLoadingIndicator from '../general/BottomLoadingIndicator';
import { toStaticImageUrl } from '../../services/imageService';
import { useAuth } from '../../context/AuthContext';
import { getTimeAgo } from '../../services/time';
import {
	extractApiErrorMessage,
	type Post,
	type PostsPageResponse,
	togglePostLike,
} from '../../services/postService';
import { populateSenders } from '../../services/userService';
import { type PaginatedFetchParams, usePaginatedFeed } from '../general/usePaginatedFeed';

const DEFAULT_PAGE_LIMIT = 10;
const DEFAULT_AVATAR = 'https://lh3.googleusercontent.com/aida-public/AB6AXuDfPoFUpebbN2taTRobHHqF74CWcKDso39TvrI1cuBorcRpX-wo_G_4fJ8-nzIC1836IGOtHKqV8BNvHOn4qvGvZUqdafJZ2F4JeyMcg22UbfBRX5C187Tv8UxusqMna6WvS9vNmPvGNZDNvV3wjj3lR7NXFUjlFA4kAYqM_VCh5rKfh7Fgl4MRW0tMX5zDz0Hz1HPZhtqxJLaT5BHkFotCAGEwwL3tShxqB8NnWkzTNKK0f2Cfz3FwVO8m2Gvvyzlm1uBQfGy9PnE';

export type FeedFetchParams = PaginatedFetchParams;

export type FeedProps = {
	fetchPage: (params: FeedFetchParams) => Promise<PostsPageResponse>;
	pageLimit?: number;
	refreshTrigger?: number;
	emptyStateProps?: EmptyFeedProps;
	onCommentClick?: (postId: string) => void;
	onDeletePost?: (postId: string, imagePath?: string) => void;
	onEditPost?: (postId: string, data: { title: string; content: string; imageFile?: File; removeImage?: boolean; originalImage?: string }) => void;
};

const mapPostToCard = (post: Post, currentUserId?: string): PostCardProps => {
	const likesList = Array.isArray(post.likes) ? post.likes : [];

	return {
		postId: post._id,
		authorName: post.sender?.name || 'Unknown',
		authorAvatar: toStaticImageUrl(post.sender?.image) || DEFAULT_AVATAR,
		timeAgo: getTimeAgo(post.createdAt),
		title: post.title,
		content: post.content,
		image: toStaticImageUrl(post.image),
		likes: likesList.length,
		likedByCurrentUser: !!currentUserId && likesList.includes(currentUserId),
		comments: post.commentsCount ?? 0,
		canManage: !!currentUserId && post.sender_id === currentUserId,
	};
};

export default function Feed({
	fetchPage,
	pageLimit = DEFAULT_PAGE_LIMIT,
	refreshTrigger = 0,
	emptyStateProps,
	onCommentClick,
	onDeletePost,
	onEditPost,
}: FeedProps) {
	const { user } = useAuth();
	
	const getPostId = useCallback((post: Post) => post._id, []);

	const mapPostsToCards = useCallback(async (pagePosts: Post[]) => {
		const populated = await populateSenders(pagePosts);
		return populated.map((post) => mapPostToCard(post, user?.id));
	}, [user?.id]);

	const getPostsErrorMessage = useCallback(
		(err: unknown) => extractApiErrorMessage(err, 'Failed to load posts.'),
		[],
	);

	const handleToggleLike = useCallback(async (postId: string) => {
		return togglePostLike(postId);
	}, []);

	const {
		items: posts,
		isInitialLoading,
		isLoadingMore,
		error,
		bottomRef,
	} = usePaginatedFeed<Post, PostCardProps>({
		fetchPage,
		pageLimit,
		refreshTrigger,
		getItemId: getPostId,
		mapPageData: mapPostsToCards,
		getErrorMessage: getPostsErrorMessage,
	});

	return (
		<>
			{error && (
				<div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mb-3" role="alert">
					<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
					<span className="small fw-semibold">{error}</span>
				</div>
			)}

			{isInitialLoading ? (
				<div className="d-flex justify-content-center py-5">
					<div className="spinner-border text-secondary" role="status">
						<span className="visually-hidden">Loading posts…</span>
					</div>
				</div>
			) : posts.length === 0 ? (
				<EmptyFeed {...emptyStateProps} />
			) : (
				posts.map((post, i) => (
					<PostCard
						key={post.postId || i}
						{...post}
						onEdit={post.postId ? (data) => void onEditPost?.(post.postId as string, data) : undefined}
						onDelete={post.postId ? () => void onDeletePost?.(post.postId as string, post.postImagePath) : undefined}
						onCommentsClick={onCommentClick}
						onToggleLike={handleToggleLike}
					/>
				))
			)}

			<div ref={bottomRef} />
			{isLoadingMore && <BottomLoadingIndicator />}
		</>
	);
}
