import { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_AVATAR, getUserAvatarById } from '../../services/userService';
import { toStaticImageUrl } from '../../services/imageService';

interface CreateCommentProps {
	onPost?: (content: string) => Promise<void> | void;
	isSubmitting?: boolean;
	errorMessage?: string | null;
}

export default function CreateComment({ onPost, isSubmitting = false, errorMessage }: CreateCommentProps) {
	const { user } = useAuth();
	const [content, setContent] = useState('');
	const [localError, setLocalError] = useState<string | null>(null);
	const [profileAvatar, setProfileAvatar] = useState<string>(DEFAULT_AVATAR);
	const isPostDisabled = isSubmitting || !content.trim();

	useEffect(() => {
		getUserAvatarById(user?.id).then(setProfileAvatar);
	}, [user?.id]);

	const userName = user?.username || 'Unknown User';
	const userAvatar = user?.avatar ?? profileAvatar;
	const userAvatarUrl = toStaticImageUrl(userAvatar) || userAvatar;
  

	async function handlePostComment() {
		setLocalError(null);

		const trimmedContent = content.trim();
		if (!trimmedContent) {
			setLocalError('Comment cannot be empty.');
			return;
		}

		try {
			await onPost?.(trimmedContent);
			setContent('');
		} catch {
		}
	}

	return (
		<div className="bg-white rounded-3 shadow-sm border p-3 mb-3">
			<div className="d-flex gap-3">
				<img
					src={userAvatarUrl}
					alt={`${userName} avatar`}
					className="rounded-circle object-fit-cover flex-shrink-0"
					style={{ width: '36px', height: '36px' }}
				/>

				<div className="flex-grow-1">
					<textarea
						className="form-control border-0 shadow-none bg-transparent resize-none p-0"
						placeholder="Write a comment..."
						rows={2}
						value={content}
						onChange={(e) => setContent(e.target.value)}
						disabled={isSubmitting}
					/>

					{(localError || errorMessage) && (
						<div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mt-2 mb-0" role="alert">
							<span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
							<span className="small fw-semibold">{localError || errorMessage}</span>
						</div>
					)}

					<div className="d-flex justify-content-end pt-2 mt-2 border-top">
						<button
							type="button"
							onClick={handlePostComment}
							disabled={isPostDisabled}
							className="btn btn-primary px-4 py-1 fw-semibold"
							style={{ fontSize: '14px' }}
						>
							{isSubmitting ? 'Posting...' : 'Post'}
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
