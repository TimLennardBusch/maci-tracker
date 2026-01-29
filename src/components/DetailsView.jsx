export default function DetailsView({ entries }) {
  // Sort entries by date descending (newest first)
  const sortedEntries = [...entries]
    .filter(e => e.date) // Show all entries with date
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
        if (entry.evening_completed) return '✅'
        // If not completed, it means smoked
        return '🚬'
    }
    return '⏳'
  }

  const getStatusClass = (entry) => {
    if (typeof entry.evening_completed === 'boolean') {
      return entry.evening_completed ? 'details-status--success' : 'details-status--failed'
    }
    return 'details-status--pending'
  }
  
  const getCigaretteCount = (entry) => {
    if (entry.cigarettes_count > 0) return entry.cigarettes_count
    // Fallback if not logged but marked failed
    if (entry.evening_completed === false) return '?'
    return 0
  }

  return (
    <div className="details-view page-with-nav">
      <div className="container">
        <div className="page-header">
          <h1>📋 Verlauf</h1>
          <p className="subtitle">Deine Reise</p>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                     {/* Show count if smoked */}
                     {entry.evening_completed === false && (
                         <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#dc2626' }}>
                             {getCigaretteCount(entry)} Zig.
                         </span>
                     )}
                     <span className={`details-status ${getStatusClass(entry)}`}>
                        {getStatusIcon(entry)}
                     </span>
                  </div>
                </div>
                
                {entry.morning_goal && (
                  <p className="details-goal details-goal--bold">{entry.morning_goal}</p>
                )}
                
                {entry.reflection_note && (
                  <p className="details-reflection-text">{entry.reflection_note}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
