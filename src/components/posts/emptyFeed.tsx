export default function EmptyFeed() {
	return (
		<div className="rounded-3 border border-2 border-secondary-subtle border-dashed p-5 py-5 text-center bg-white">
			<span className="material-symbols-outlined d-inline-block text-secondary opacity-50 mb-3" style={{ fontSize: '64px' }}>
				dashboard
			</span>
			<h2 className="h5 fw-medium text-secondary mb-2">There is no content to display</h2>
			<p className="text-muted mb-0">Upload or wait for other users to post content.</p>
		</div>
	);
}
