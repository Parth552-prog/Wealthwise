export default function StatCard({ label, value, variant = '', hint }) {
    return (
        <div className={`stat-card ${variant}`}>
            <div className="stat-label">{label}</div>
            <div className="stat-value">{value}</div>
            {hint && <div className="stat-hint">{hint}</div>}
        </div>
    );
}