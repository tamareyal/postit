import { useCallback } from 'react';
import PostCard from './PostCard';
import type { PostCardProps } from './PostCard';
import EmptyFeed, { type EmptyFeedProps } from '../general/EmptyFeed';
import BottomLoadingIndicator from '../general/BottomLoadingIndicator';
import { toStaticImageUrl } from '../../services/imageService';
import { getTimeAgo } from '../../services/time';
import {
	extractApiErrorMessage,
	type Post,
	type PostsPageResponse,
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
};

const mapPostToCard = (post: Post): PostCardProps => ({
    postId: post._id,
    authorName: post.sender?.name || 'Unknown',
    authorAvatar: toStaticImageUrl(post.sender?.image) || DEFAULT_AVATAR,
    timeAgo: getTimeAgo(post.createdAt),
    title: post.title,
    content: post.content,
    image: toStaticImageUrl(post.image),
    likes: 0,
    comments: post.commentsCount ?? 0,
});

export default function Feed({
	fetchPage,
	pageLimit = DEFAULT_PAGE_LIMIT,
	refreshTrigger = 0,
	emptyStateProps,
	onCommentClick,
}: FeedProps) {
	
	const getPostId = useCallback((post: Post) => post._id, []);

	const mapPostsToCards = useCallback(async (pagePosts: Post[]) => {
		const populated = await populateSenders(pagePosts);
		return populated.map(mapPostToCard);
	}, []);

	const getPostsErrorMessage = useCallback(
		(err: unknown) => extractApiErrorMessage(err, 'Failed to load posts.'),
		[],
	);

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
					<PostCard key={post.postId || i} {...post} onCommentsClick={onCommentClick} />
				))
			)}

			<div ref={bottomRef} />
			{isLoadingMore && <BottomLoadingIndicator />}
		</>
	);
}
