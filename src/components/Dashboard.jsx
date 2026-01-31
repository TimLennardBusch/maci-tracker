import { useState } from 'react'
import WeekOverview from './WeekOverview'
import CompletionPopup from './CompletionPopup'

export default function Dashboard({ 
  streak, 
  todayEntry, 
  yesterdayEntry,
  weekEntries,
  allEntries,
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

  // Today's cigarette count
  const todayCigarettes = todayEntry?.cigarettes_count || 0
  const todaySmoked = todayCigarettes > 0
  
  // Yesterday smoked?
  const yesterdaySmoked = yesterdayEntry?.cigarettes_count > 0 || yesterdayEntry?.evening_completed === false
  
  // Calculate 30-day stats
  const entries30Days = allEntries || []
  const daysWithCigs = entries30Days.filter(e => e.cigarettes_count && e.cigarettes_count > 0)
  const totalCigs30Days = daysWithCigs.reduce((sum, e) => sum + (e.cigarettes_count || 0), 0)
  const avgPerDay = daysWithCigs.length > 0 ? totalCigs30Days / daysWithCigs.length : 0
  
  // Money calculations (0.35€ per cigarette)
  const PRICE_PER_CIG = 0.35
  const todayMoneyCost = (todayCigarettes * PRICE_PER_CIG).toFixed(2)
  const last30DaysCost = (totalCigs30Days * PRICE_PER_CIG).toFixed(2)
  const potentialSavingsToday = (avgPerDay * PRICE_PER_CIG).toFixed(2)

  const openCompletionPopup = (goal, date = null) => {
    setPopupGoal(goal)
    setPopupDate(date)
    setShowCompletionPopup(true)
  }

  const handlePopupComplete = (completed, reflection, cigaretteCount = null) => {
    onComplete(completed, reflection, popupDate, cigaretteCount)
    setShowCompletionPopup(false)
  }

  return (
    <div className="dashboard page-with-nav">
      <div className="container container--narrow">
        {/* Bereich 1: Begrüßung */}
        <div className="dashboard-header animate-fade-in">
          <div>
            <h1 className="greeting">Hallo, Maciek!</h1>
            <p className="greeting-time" style={{ maxWidth: '250px', lineHeight: '1.4' }}>
              "{['Jeder rauchfreie Tag ist ein Sieg.', 
                 'Deine Gesundheit dankt es dir.', 
                 'Du bist stärker als das Verlangen.',
                 'Freiheit beginnt im Kopf.',
                 'Rauchen ist keine Belohnung.'
                ][Math.floor(Math.random() * 5)]}"
            </p>
          </div>
        </div>

        {/* Bereich 2: Dynamischer Status */}
        <div className="card status-card animate-fade-in mb-4">
          {todaySmoked ? (
            // Heute geraucht - Anzahl zeigen
            <div className="status-content status-content--bad">
              <div className="status-icon-large">🚬</div>
              <div className="status-info">
                <p className="status-label">Heute geraucht</p>
                <p className="status-value status-value--danger">{todayCigarettes} Zigaretten</p>
              </div>
            </div>
          ) : yesterdaySmoked ? (
            // Gestern geraucht, heute noch nicht
            <div className="status-content status-content--warning">
              <div className="status-icon-large">💪</div>
              <div className="status-info">
                <p className="status-label" style={{ color: '#f59e0b', fontWeight: 700, fontSize: '1.25rem' }}>
                  HEUTE RAUCHFREI WERDEN
                </p>
                <p className="status-subtitle">Du schaffst das!</p>
              </div>
            </div>
          ) : (
            // Rauchfrei seit X Tagen
            <div className="status-content status-content--good">
              <div className="status-icon-large">🌟</div>
              <div className="status-info">
                <p className="status-label">Rauchfrei seit</p>
                <p className="status-value status-value--success">{streak} Tagen</p>
              </div>
            </div>
          )}
        </div>

        {/* Bereich 3: Geld-Berechnung */}
        <div className={`card money-card animate-fade-in mb-4 ${todaySmoked ? 'money-card--bad' : 'money-card--good'}`}>
          {todaySmoked ? (
            // Geld verschwendet heute
            <div className="money-content">
              <div className="money-main">
                <p className="money-label" style={{ color: '#b91c1c' }}>Heute verschwendet</p>
                <p className="money-value" style={{ color: '#dc2626' }}>{todayMoneyCost} €</p>
              </div>
              <div className="money-secondary">
                <span style={{ fontSize: '1.5rem' }}>💸</span>
                <p style={{ fontSize: '0.875rem', color: '#991b1b' }}>
                  In den letzten 30 Tagen: <strong>{last30DaysCost} €</strong>
                </p>
              </div>
            </div>
          ) : (
            // Sparpotential heute
            <div className="money-content">
              <div className="money-main">
                <p className="money-label" style={{ color: '#047857' }}>Du sparst heute</p>
                <p className="money-value" style={{ color: '#059669' }}>{potentialSavingsToday} €</p>
              </div>
              <div className="money-secondary">
                <span style={{ fontSize: '1.5rem' }}>💰</span>
                <p style={{ fontSize: '0.875rem', color: '#065f46' }}>
                  Wenn du heute nicht rauchst!
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Bereich 4: Wochenübersicht */}
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
