export default function Modal({ open, title, onClose, children }) {
    if (!open) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-box" onClick={(e) => e.stopPropagation()}>
                <div className="modal-title">{title}</div>
                {children}
            </div>
        </div>
    );
}