export interface CommentCardProps {
	userName: string;
	userAvatar?: string;
	content: string;
	timeAgo: string;
}

export default function CommentCard({ userName, userAvatar, content, timeAgo }: CommentCardProps) {
	return (
		<article className="bg-white rounded-3 border p-3 d-flex align-items-start gap-3">
			<img
				src={userAvatar}
				alt={`${userName} profile picture`}
				className="rounded-circle object-fit-cover flex-shrink-0"
				style={{ width: '36px', height: '36px' }}
			/>

			<div className="min-w-0">
				<div className="d-flex align-items-center gap-2 mb-1">
					<p className="fw-semibold text-dark mb-0" style={{ fontSize: '14px' }}>{userName}</p>
					<span className="text-muted small">{timeAgo}</span>
				</div>
				<p className="mb-0 text-dark" style={{ fontSize: '14px' }}>{content}</p>
			</div>
		</article>
	);
}
