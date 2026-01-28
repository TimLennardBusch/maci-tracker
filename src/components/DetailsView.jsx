export default function DetailsView({ entries }) {
  // Sort entries by date descending (newest first)
  const sortedEntries = [...entries]
    .filter(e => e.morning_goal) // Only show entries with goals
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const formatDate = (dateStr) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('de-DE', { 
      weekday: 'short',
      day: '2-digit', 
      month: '2-digit',
      year: '2-digit'
    })
  }

  const getStatusIcon = (entry) => {
    if (typeof entry.evening_completed === 'boolean') {
      return entry.evening_completed ? '✓' : '✗'
    }
    return '⏳'
  }

  const getStatusClass = (entry) => {
    if (typeof entry.evening_completed === 'boolean') {
      return entry.evening_completed ? 'details-status--success' : 'details-status--failed'
    }
    return 'details-status--pending'
  }

  return (
    <div className="details-view page-with-nav">
      <div className="container">
        <div className="page-header">
          <h1>📋 Verlauf</h1>
          <p className="subtitle">Deine Ziele & Reflexionen</p>
        </div>

        {sortedEntries.length === 0 ? (
          <div className="card text-center">
            <p style={{ color: 'var(--text-muted)' }}>
              Noch keine Einträge vorhanden.
            </p>
          </div>
        ) : (
          <div className="details-list">
            {sortedEntries.map((entry, index) => (
              <div 
                key={entry.date} 
                className="details-item card animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="details-header">
                  <span className="details-date">{formatDate(entry.date)}</span>
                  <span className={`details-status ${getStatusClass(entry)}`}>
                    {getStatusIcon(entry)}
                  </span>
                </div>
                
                <p className="details-goal">{entry.morning_goal}</p>
                
                {entry.reflection_note && (
                  <div className="details-reflection">
                    <span className="details-reflection-label">💭 Reflexion:</span>
                    <p className="details-reflection-text">{entry.reflection_note}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
