import { useCallback, useState } from 'react';
import Header, { PageType } from '../components/general/header';
import CreateComment from '../components/comments/CreateComment';
import CommentsFeed from '../components/comments/CommentsFeed';
import {
	createComment,
	extractCommentsErrorMessage,
	fetchCommentsPageByPostId,
} from '../services/commentsService';

interface CommentsPageProps {
	postId?: string;
	onGoHome?: () => void;
	onGoToProfile?: () => void;
}

export default function CommentsPage({ postId, onGoHome, onGoToProfile }: CommentsPageProps) {
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [commentError, setCommentError] = useState<string | null>(null);
	const [refreshTrigger, setRefreshTrigger] = useState(0);

	const fetchPage = useCallback(async (
		params: { limit: number; cursor: string | null; queryHash: string | null; signal?: AbortSignal }
	) => {
		if (!postId) {
			return { data: [], nextCursor: null, queryHash: '' };
		}

		return fetchCommentsPageByPostId(postId, params.limit, params.cursor, params.queryHash, params.signal);
	}, [postId]);

	const handleCreateComment = async (content: string) => {
		setIsSubmitting(true);
		setCommentError(null);

		try {
			if (!postId) {
				throw new Error('Missing post ID for comment creation.');
			}

			await createComment({
				post_id: postId,
				message: content,
			});

			setRefreshTrigger((prev) => prev + 1);
		} catch (error) {
			setCommentError(extractCommentsErrorMessage(error));
			throw error;
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="min-vh-100 bg-light">
			<Header
			page={PageType.Comments}
			onLogoClick={onGoHome}
			onSettings={onGoToProfile}
		/>

			<main className="container py-4" style={{ maxWidth: '640px' }}>
				<CreateComment
					onPost={handleCreateComment}
					isSubmitting={isSubmitting}
					errorMessage={commentError}
				/>

				<CommentsFeed fetchPage={fetchPage} refreshTrigger={refreshTrigger} />
			</main>
		</div>
	);
}
