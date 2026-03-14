export type EmptyFeedProps = {
	title?: string;
	description?: string;
	icon?: string;
	className?: string;
};

export default function EmptyFeed({
	title = 'There is no content to display',
	description = 'Upload or wait for other users to post content.',
	icon = 'dashboard',
	className = '',
}: EmptyFeedProps) {
	return (
		<div className={`rounded-3 border border-2 border-secondary-subtle border-dashed p-5 py-5 text-center bg-white ${className}`.trim()}>
			<span className="material-symbols-outlined d-inline-block text-secondary opacity-50 mb-3" style={{ fontSize: '64px' }}>
				{icon}
			</span>
			<h2 className="h5 fw-medium text-secondary mb-2">{title}</h2>
			<p className="text-muted mb-0">{description}</p>
		</div>
	);
}
