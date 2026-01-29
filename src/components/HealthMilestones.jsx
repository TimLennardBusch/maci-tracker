import { useState, useEffect } from 'react'
import { dailyEntriesApi } from '../lib/supabase'

export default function HealthMilestones() {
  const [timeSince, setTimeSince] = useState(null)
  const [loading, setLoading] = useState(true)

  // Milestones definition in minutes
  const MILESTONES = [
    { id: 'start', minutes: 0, title: 'Der Start', desc: 'Deine Reise beginnt jetzt.' },
    { id: '20m', minutes: 20, title: '20 Minuten', desc: 'Puls und Blutdruck normalisieren sich.' },
    { id: '8h', minutes: 8 * 60, title: '8 Stunden', desc: 'Kohlenmonoxid-Gehalt im Blut sinkt auf Normalwert.' },
    { id: '24h', minutes: 24 * 60, title: '24 Stunden', desc: 'Herzinfarktrisiko beginnt zu sinken.' },
    { id: '48h', minutes: 48 * 60, title: '48 Stunden', desc: 'Geruchs- und Geschmackssinn verbessern sich.' },
    { id: '72h', minutes: 72 * 60, title: '3 Tage', desc: 'Atmen fällt leichter, Energie steigt.' },
    { id: '2w', minutes: 14 * 24 * 60, title: '2 Wochen', desc: 'Kreislauf stabilisiert sich, Lungenfunktion verbessert sich.' },
    { id: '3m', minutes: 90 * 24 * 60, title: '3 Monate', desc: 'Husten und Kurzatmigkeit nehmen ab.' },
    { id: '1y', minutes: 365 * 24 * 60, title: '1 Jahr', desc: 'Das Risiko einer koronaren Herzkrankheit ist halbiert.' },
    { id: '5y', minutes: 5 * 365 * 24 * 60, title: '5 Jahre', desc: 'Schlaganfallrisiko ist vergleichbar mit dem eines Nichtrauchers.' },
    { id: '10y', minutes: 10 * 365 * 24 * 60, title: '10 Jahre', desc: 'Lungenkrebsrisiko ist halbiert.' },
    { id: '15y', minutes: 15 * 365 * 24 * 60, title: '15 Jahre', desc: 'Das Risiko für Herzkrankheiten ist wie bei einem Nie-Raucher.' }
  ]

  useEffect(() => {
    loadData()
    // Update timer every minute
    const interval = setInterval(() => {
      // Just re-trigger calc if we had a last date
      // Ideally we store lastDate in state, but logic is inside loadData currently.
      // Let's refactor slightly to separate fetch and calc.
      if (lastCigDate) {
         updateTimeSince(lastCigDate)
      }
    }, 60000)
    return () => clearInterval(interval)
  }, [])

  const [lastCigDate, setLastCigDate] = useState(null)

  const loadData = async () => {
    try {
      setLoading(true)
      const date = await dailyEntriesApi.getLastCigaretteTime()
      if (date) {
        setLastCigDate(date)
        updateTimeSince(date)
      } else {
        // No cigarette ever logged -> Maybe suggest setting start date? 
        // Or assume straight away if never logged? 
        // If "habit" data exists but no logs, getLastCigaretteTime handles it.
        // If nothing at all, maybe user just started?
        setLastCigDate(null)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const updateTimeSince = (date) => {
    const now = new Date()
    const diffMs = now - date
    const diffMins = Math.floor(diffMs / 60000)
    setTimeSince(diffMins)
  }

  // Determine which 3 milestones to show
  const getVisibleMilestones = () => {
    if (timeSince === null) {
      // Case: No data / fresh start
      return [MILESTONES[0], MILESTONES[1], MILESTONES[2]]
    }

    // Find index of last achieved milestone
    // Milestone achieved if timeSince >= milestone.minutes
    let achievedIndex = -1
    for (let i = 0; i < MILESTONES.length; i++) {
      if (timeSince >= MILESTONES[i].minutes) {
        achievedIndex = i
      } else {
        break
      }
    }

    if (achievedIndex === -1) {
      // Nothing achieved yet (e.g. < 20 mins? actually start is 0, so usually index 0 is always achieved if started)
      // If timeSince >= 0, index 0 is achieved.
      return [MILESTONES[0], MILESTONES[1], MILESTONES[2]]
    }

    // "Letzter Punkt der Vergangenheit" -> n-1
    // "Aktueller Meilenstein" -> n (Achieved)
    // "Nächster Meilenstein" -> n+1
    
    // User logic: "1. letzter Punkt der Vergangenheit, 2. aktueller Meilenstein, 3. nächster Meilenstein."
    
    // If I just started (index 0):
    // Past: null? -> User says: "Wenn noch kein meilen stein erreicht... 1. Start... "
    // If I have achieved index 0 ("Start"):
    // Past: - 
    // Current: Start
    // Next: 20m
    
    // Let's try to center on "Next Goal" or "Current Achievement"?
    // Usually "Aktueller Meilenstein" is the one I HAVE. 
    
    // Logic:
    // Slot 1: achievedIndex - 1 (if exists)
    // Slot 2: achievedIndex
    // Slot 3: achievedIndex + 1
    
    const prev = achievedIndex > 0 ? MILESTONES[achievedIndex - 1] : null
    const curr = MILESTONES[achievedIndex]
    const next = achievedIndex < MILESTONES.length - 1 ? MILESTONES[achievedIndex + 1] : null
    
    // Fill up if at boundaries
    if (!prev) {
      // We are at start [Start, 20m, 8h]
      return [curr, next, MILESTONES[achievedIndex + 2]].filter(Boolean)
    }
    
    if (!next) {
      // We are at end [10y, 15y, null] -> [5y, 10y, 15y]
      return [MILESTONES[achievedIndex - 2], prev, curr].filter(Boolean)
    }
    
    return [prev, curr, next]
  }

  const visibleMilestones = getVisibleMilestones()

  // Calculate progress to next milestone
  const getProgressToNext = () => {
    if (timeSince === null) return 0
    
    // Find next unachieved
    const nextMilestone = MILESTONES.find(m => m.minutes > timeSince)
    if (!nextMilestone) return 100 // Finished
    
    const prevMilestone = MILESTONES[[...MILESTONES].reverse().find(m => m.minutes <= timeSince)?.id] || MILESTONES[0]
    // Actually simpler: find index of next
    const nextIndex = MILESTONES.findIndex(m => m.minutes > timeSince)
    const prevIndex = nextIndex > 0 ? nextIndex - 1 : 0
    
    const start = MILESTONES[prevIndex].minutes
    const end = MILESTONES[nextIndex].minutes
    const current = timeSince
    
    if (end === start) return 0
    
    const progress = ((current - start) / (end - start)) * 100
    return Math.min(100, Math.max(0, progress))
  }
  
  // Format readable duration
  const formatDuration = (mins) => {
    if (mins < 60) return `${Math.floor(mins)} Min`
    const hours = Math.floor(mins / 60)
    if (hours < 24) return `${hours} Std`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days} T`
    if (days < 365) return `${Math.floor(days / 30)} Mon` // Rough
    return `${Math.floor(days / 365)} Jahre`
  }

  return (
    <div className="health-page page-with-nav">
       <div className="container">
        <div className="page-header">
          <h1>🫁 Körper-Erholung</h1>
          <p className="subtitle">Dein Heilungsprozess</p>
        </div>

        {loading ? (
          <div className="loading-container"><div className="spinner"></div></div>
        ) : (
          <div className="timeline-container animate-fade-in">
            {/* Connection Line */}
            <div className="timeline-line"></div>
            
            {visibleMilestones.map((ms, index) => {
              const isAchieved = timeSince !== null && timeSince >= ms.minutes
              const isCurrent = visibleMilestones[1].id === ms.id // Middle one is "Current" by definition of view logic
              
              // Special case: If we are at very start [Start, 20m, 8h], Start is current achieved.
              // Logic check:
              // Start (0m) -> Achieved.
              // 20m -> Next. 
              // View: [Start, 20m, 8h]
              // Start is "Current Achieved". 
              
              let statusClass = ''
              if (isAchieved) statusClass = 'timeline-item--achieved'
              if (ms.minutes > timeSince) statusClass = 'timeline-item--locked'
              
              // Specific styles for positions
              // 1. Past (top)
              // 2. Current (middle/focus)
              // 3. Next (bottom)
              
              return (
                <div key={ms.id} className={`timeline-item ${statusClass} timeline-item--pos-${index}`}>
                  <div className="timeline-marker">
                    {isAchieved ? '✓' : (index === 1 && !isAchieved ? '⏳' : '🔒')}
                  </div>
                  <div className="timeline-content card">
                    <div className="timeline-header">
                      <h3 className="timeline-title">{ms.title}</h3>
                      {index === 2 && !isAchieved && (
                        <span className="timeline-eta">noch {formatDuration(ms.minutes - timeSince)}</span>
                      )}
                    </div>
                    <p className="timeline-desc">{ms.desc}</p>
                    
                    {/* Progress bar only for the "Next" one effectively? 
                        Or if we are strictly between Past and Next.
                        Actually if we display [Past, Current(Achieved), Next],
                        the progress is happening towards Next.
                        
                        If index 1 is "Current Achieved", then progress is happening between 1 and 2.
                        So maybe show progress bar under Next? Or between?
                     */}
                  </div>
                </div>
              )
            })}
            
            {/* Global Progress Indicator (Optional) */}
             {visibleMilestones[2] && timeSince !== null && timeSince < visibleMilestones[2].minutes && (
               <div className="progress-floating">
                  <div className="progress-label">Fortschritt zu {visibleMilestones[2].title}</div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: `${getProgressToNext()}%` }}></div>
                  </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  )
}
