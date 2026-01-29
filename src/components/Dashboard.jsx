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
  const hasCompletedEvening = typeof todayEntry?.evening_completed === 'boolean'
  const hasYesterdayPending = yesterdayEntry?.morning_goal && typeof yesterdayEntry?.evening_completed !== 'boolean'

  const openCompletionPopup = (goal, date = null) => {
    setPopupGoal(goal)
    setPopupDate(date)
    setShowCompletionPopup(true)
  }

  const handlePopupComplete = (completed, reflection) => {
    onComplete(completed, reflection, popupDate)
    setShowCompletionPopup(false)
  }

  // Render status icon button - ALWAYS clickable to edit
  const StatusBadge = ({ completed, isPending, onClick, goal, date }) => {
    const handleClick = () => {
      openCompletionPopup(goal, date)
    }

    if (isPending) {
      return (
        <button 
          onClick={handleClick}
          className="status-icon status-icon--pending"
          title="Ziel bestätigen"
        >
          ⏳
        </button>
      )
    }
    
    if (completed === true) {
      return (
        <button 
          onClick={handleClick}
          className="status-icon status-icon--success"
          title="Status ändern"
        >
          ✓
        </button>
      )
    }
    
    return (
      <button 
        onClick={handleClick}
        className="status-icon status-icon--failed"
        title="Status ändern"
      >
        ✗
      </button>
    )
  }

  return (
    <div className="dashboard page-with-nav">
      <div className="container container--narrow">
        {/* Header */}
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1 className="greeting">Moin, Tim!</h1>
          </div>
        </div>

        {/* Compact Streak Section */}
        <StreakBadge streak={streak} size="compact" />

        {/* CATCH-UP BOX: Yesterday's Goal */}
        {hasYesterdayPending && (
          <div className="card goal-card goal-card--compact goal-card--warning animate-fade-in mb-4">
            <div className="goal-card-header">
              <h2 className="goal-card-title goal-card-title--warning">Gestriges Ziel</h2>
              <StatusBadge 
                isPending={true}
                goal={yesterdayEntry.morning_goal}
                date={yesterdayEntry.date}
              />
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
              <StatusBadge 
                completed={todayEntry.evening_completed}
                isPending={!hasCompletedEvening}
                goal={todayEntry.morning_goal}
                date={null}
              />
            )}
          </div>
          
          {hasMorningGoal ? (
            <div className="goal-row">
              <div className="goal-input-display">
                <span className="goal-text-content">{todayEntry.morning_goal}</span>
                <button 
                  onClick={() => onNavigate('morning')}
                  className="btn btn--icon btn--ghost edit-btn"
                  title="Ziel bearbeiten"
                >
                  ✎
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => onNavigate('morning')}
              className="btn btn--primary btn--full"
            >
              🌅 Morgenziel setzen
            </button>
          )}
        </div>

        {/* Week Overview */}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <WeekOverview entries={weekEntries} currentStreak={streak} />
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
