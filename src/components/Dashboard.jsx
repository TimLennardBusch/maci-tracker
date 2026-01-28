import { useState } from 'react'
import StreakBadge from './StreakBadge'
import WeekOverview from './WeekOverview'
import CompletionPopup from './CompletionPopup'

export default function Dashboard({ 
  streak, 
  todayEntry, 
  yesterdayEntry,
  weekEntries, 
  onNavigate,
  onComplete,
  isEvening 
}) {
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [popupGoal, setPopupGoal] = useState('')
  const [popupDate, setPopupDate] = useState(null)

  const hasMorningGoal = todayEntry?.morning_goal
  // Only consider it completed if it is explicitly true or false (boolean), not null, undefined or empty string
  const hasCompletedEvening = typeof todayEntry?.evening_completed === 'boolean'
  
  // Check if yesterday has a goal but no completion status (null, undefined, or empty string)
  const hasYesterdayPending = yesterdayEntry?.morning_goal && typeof yesterdayEntry?.evening_completed !== 'boolean'

  const openCompletionPopup = (goal, date = null) => {
    setPopupGoal(goal)
    setPopupDate(date)
    setShowCompletionPopup(true)
  }

  const handlePopupComplete = (completed) => {
    onComplete(completed, null, popupDate) // Pass date if it's yesterday
    setShowCompletionPopup(false)
  }

  return (
    <div className="dashboard page-with-nav">
      <div className="container container--narrow">
        {/* Header - simplified, no duplicate badge */}
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1 className="greeting">Moin, Tim!</h1>
          </div>
        </div>

        {/* Compact Streak Section */}
        <StreakBadge streak={streak} size="compact" />

        {/* CATCH-UP BOX: Yesterday's Goal */}
        {hasYesterdayPending && (
          <div className="card goal-card goal-card--compact animate-fade-in mb-4" style={{ borderLeft: '4px solid var(--warning-500)' }}>
            <div className="goal-card-header">
              <h2 className="goal-card-title" style={{ color: 'var(--warning-600)' }}>Gestriges Ziel offen</h2>
              <button 
                onClick={() => openCompletionPopup(yesterdayEntry.morning_goal, yesterdayEntry.date)}
                className="status status--pending cursor-pointer"
                title="Jetzt nachholen"
              >
                <span>⏳ Offen</span>
              </button>
            </div>
            
            <div className="goal-row">
              <p className="goal-text goal-text--inline">{yesterdayEntry.morning_goal}</p>
            </div>
          </div>
        )}

        {/* Today's Goal */}
        <div className="card goal-card goal-card--compact animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="goal-card-header">
            <h2 className="goal-card-title">Heutiges Ziel</h2>
            {hasMorningGoal && (
              <>
                {hasCompletedEvening ? (
                  <span className={`status ${todayEntry.evening_completed ? 'status--success' : 'status--failed'}`}>
                    {todayEntry.evening_completed ? '✓ Geschafft' : '✗ Nicht geschafft'}
                  </span>
                ) : (
                  <button 
                    onClick={() => openCompletionPopup(todayEntry.morning_goal)}
                    className="status status--pending cursor-pointer"
                  >
                    <span>⏳ Offen</span>
                  </button>
                )}
              </>
            )}
          </div>
          
          {hasMorningGoal ? (
            <div className="goal-row">
              <p className="goal-text goal-text--inline">{todayEntry.morning_goal}</p>
              <button 
                onClick={() => onNavigate('morning')}
                className="btn btn--icon btn--ghost"
                title="Ziel bearbeiten"
              >
                ✏️
              </button>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('morning')}
              className="btn btn--primary btn--full"
            >
              🌅 Morgenziel setzen
            </button>
          )}

          {/* Evening Action - only show if goal exists and not completed AND it's evening */}
          {hasMorningGoal && !hasCompletedEvening && isEvening && (
            <button 
              onClick={() => openCompletionPopup(todayEntry.morning_goal)}
              className="btn btn--success btn--full mt-4"
            >
              🌙 Abend-Check durchführen
            </button>
          )}
        </div>

        {/* Week Overview */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <WeekOverview entries={weekEntries} />
        </div>

        {/* Completion Popup */}
        <CompletionPopup 
          isOpen={showCompletionPopup}
          goal={popupGoal}
          onClose={() => setShowCompletionPopup(false)}
          onComplete={handlePopupComplete}
        />
      </div>
    </div>
  )
}
