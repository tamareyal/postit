export default function BottomLoadingIndicator() {
  return (
    <div className="py-5 d-flex flex-column align-items-center justify-content-center gap-2">
      <div className="d-flex gap-2">
        <span className="pulse-dot pulse-dot-1" />
        <span className="pulse-dot pulse-dot-2" />
        <span className="pulse-dot pulse-dot-3" />
      </div>
      <p className="mb-0 fw-medium text-secondary" style={{ fontSize: '14px' }}>Loading more posts...</p>
    </div>
  );
}
