import { useCallback } from 'react';
import CommentCard, { type CommentCardProps } from './CommentCard';
import EmptyFeed, { type EmptyFeedProps } from '../general/EmptyFeed';
import BottomLoadingIndicator from '../general/BottomLoadingIndicator';
import { toStaticImageUrl } from '../../services/imageService';
import { getTimeAgo } from '../../services/time';
import { DEFAULT_AVATAR } from '../../services/userService';
import { type PaginatedFetchParams, usePaginatedFeed } from '../general/usePaginatedFeed';
import {
	extractCommentsErrorMessage,
	populateCommentSenders,
	type Comment,
	type CommentsPageResponse,
} from '../../services/commentsService';

const DEFAULT_PAGE_LIMIT = 10;

export type CommentsFeedProps = {
	fetchPage: (params: PaginatedFetchParams) => Promise<CommentsPageResponse>;
	pageLimit?: number;
	refreshTrigger?: number;
	emptyStateProps?: EmptyFeedProps;
};

const mapCommentToCard = (comment: Comment): CommentCardProps => ({
		userName: comment.sender?.name || 'Unknown',
		userAvatar: toStaticImageUrl(comment.sender?.image) || DEFAULT_AVATAR,
		content: comment.message || '',
		timeAgo: getTimeAgo(comment.createdAt),
});






export default function CommentsFeed({
	fetchPage,
	pageLimit = DEFAULT_PAGE_LIMIT,
	refreshTrigger = 0,
	emptyStateProps,
}: CommentsFeedProps) {
	const getCommentId = useCallback((comment: Comment) => comment._id, []);

	const mapCommentsToCards = useCallback(async (comments: Comment[]) => {
		const populated = await populateCommentSenders(comments);
		return populated.map(mapCommentToCard);
	}, []);

	const getCommentsErrorMessage = useCallback(
		(err: unknown) => extractCommentsErrorMessage(err),
		[],
	);

	const {
		items,
		isInitialLoading,
		isLoadingMore,
		error,
		bottomRef,
	} = usePaginatedFeed<Comment, CommentCardProps>({
		fetchPage,
		pageLimit,
		refreshTrigger,
		getItemId: getCommentId,
		mapPageData: mapCommentsToCards,
		getErrorMessage: getCommentsErrorMessage,
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
						<span className="visually-hidden">Loading comments…</span>
					</div>
				</div>
			) : items.length === 0 ? (
				<EmptyFeed
					icon="forum"
					title="No comments yet"
					description="Be the first one to start the conversation."
					{...emptyStateProps}
				/>
			) : (
				<div className="d-flex flex-column gap-2">
					{items.map((comment, i) => (
						<CommentCard key={i} {...comment} />
					))}
				</div>
			)}

			<div ref={bottomRef} />
			{isLoadingMore && <BottomLoadingIndicator />}
		</>
	);
}
