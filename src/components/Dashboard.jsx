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
  isEvening,
  onLogCigarette 
}) {
  const [showCompletionPopup, setShowCompletionPopup] = useState(false)
  const [popupGoal, setPopupGoal] = useState('')
  const [popupDate, setPopupDate] = useState(null)
  
  // New state for cigarette log popup
  const [showSadPopup, setShowSadPopup] = useState(false)

  const hasMorningGoal = todayEntry?.morning_goal
  const hasCompletedEvening = typeof todayEntry?.evening_completed === 'boolean'
  const hasYesterdayPending = yesterdayEntry?.morning_goal && typeof yesterdayEntry?.evening_completed !== 'boolean'
  
  // Calculate money saved (Example: 8€ per day)
  const moneySaved = streak * 8

  const openCompletionPopup = (goal, date = null) => {
    setPopupGoal(goal)
    setPopupDate(date)
    setShowCompletionPopup(true)
  }

  const handlePopupComplete = (completed, reflection, cigaretteCount = null) => {
    onComplete(completed, reflection, popupDate, cigaretteCount)
    setShowCompletionPopup(false)
  }
  
  const handleLogClick = () => {
    // Show sad popup
    setShowSadPopup(true)
    // Trigger log after delay or immediately? User wants popup to appear. 
    // "Popup soll mit traurigem Smiley erscheinen und dazu soll stehen..."
    // "Anzahl an Loggs soll als Basis dienen"
    // So we log it.
    if (onLogCigarette) {
      onLogCigarette()
    }
    
    // Auto close sad popup after 3 seconds
    setTimeout(() => {
      setShowSadPopup(false)
    }, 3000)
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
          title="Status bestätigen"
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
          ✅
        </button>
      )
    }
    
    return (
      <button 
        onClick={handleClick}
        className="status-icon status-icon--failed"
        title="Status ändern"
      >
        🚬
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
            <p className="greeting-time" style={{ maxWidth: '250px', lineHeight: '1.4' }}>
              "{['Jeder rauchfreie Tag ist ein Sieg.', 
                 'Deine Gesundheit dankt es dir.', 
                 'Du bist stärker als das Verlangen.',
                 'Freiheit beginnt im Kopf.',
                 'Rauchen ist keine Belohnung.'
                ][Math.floor(Math.random() * 5)]}"
            </p>
          </div>
          {/* Cigarette Log Button */}
          <button 
             className="btn btn--secondary btn--icon" 
             onClick={handleLogClick}
             title="Zigarette geraucht loggen"
             style={{ background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca' }}
          >
            +🚬
          </button>
        </div>

        {/* Rauchfrei Streak Section */}
        <StreakBadge streak={streak} size="compact" label="Rauchfrei seit" />

        {/* Money Saved Card */}
        <div className="card money-card animate-fade-in mb-4" style={{ background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #10b981' }}>
          <div className="money-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: '#047857', fontWeight: 600 }}>Geld gespart</p>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#065f46' }}>{moneySaved} €</p>
            </div>
            <div style={{ fontSize: '2rem' }}>💰</div>
          </div>
        </div>

        {/* CATCH-UP BOX: Yesterday's Goal */}
        {hasYesterdayPending && (
          <div className="card goal-card goal-card--compact goal-card--warning animate-fade-in mb-4">
            <div className="goal-card-header">
              <h2 className="goal-card-title goal-card-title--warning">Gestern rauchfrei?</h2>
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
              🌅 Tagesziel setzen
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
        
        {/* Sad Popup (Inline Modal) */}
        {showSadPopup && (
          <div className="popup-overlay" style={{ background: 'rgba(0,0,0,0.8)' }}>
             <div className="popup-modal animate-slide-up" onClick={() => setShowSadPopup(false)}>
               <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😢</div>
               <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#dc2626' }}>
                 Schade!
               </h2>
               <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: 1.5 }}>
                 Dein Gesundheitsfortschritt setzt sich leider zurück.
               </p>
               <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '1rem' }}>
                 (Tippe zum Schließen)
               </p>
             </div>
          </div>
        )}
      </div>
    </div>
  )
}
