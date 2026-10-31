export default function StatCard({ label, value, icon, color = 'var(--accent)' }) {
  return (
    <div className="stat-card">
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div>
          <div className="stat-value" style={{ color }}>{value}</div>
          <div className="stat-label">{label}</div>
        </div>
        {icon && (
          <span style={{ fontSize: '1.5rem', opacity: 0.7 }}>{icon}</span>
        )}
      </div>
    </div>
  );
}
