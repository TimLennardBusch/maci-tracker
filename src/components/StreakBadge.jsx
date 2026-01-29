export default function StreakBadge({ streak, size = 'normal', label = "Rauchfrei seit" }) {
  const isCompact = size === 'compact'
  
  if (isCompact) {
    return (
      <div className="card streak-section--compact streak-card animate-fade-in" style={{ 
        background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
        border: '1px solid #16a34a'
      }}>
        <div className="streak-compact-row">
          <div className="streak-number streak-number--compact" style={{ 
            background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent'
          }}>
            {streak}
          </div>
          <div className="streak-compact-info">
            <span className="streak-label--compact">{label}</span>
            <span className="streak-message">
              {streak === 0 ? 'Heute ist Tag 1!' : `${streak} Tag${streak > 1 ? 'en' : ''}!`}
            </span>
          </div>
          <div style={{ fontSize: '2.5rem', marginLeft: 'auto' }}>
            🚭
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="streak-badge">
      <span className="fire-emoji">🚭</span>
      <span>{streak} Tage Rauchfrei</span>
    </div>
  )
}
