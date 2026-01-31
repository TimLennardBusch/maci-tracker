import { useState, useEffect } from 'react'
import { dailyEntriesApi } from '../lib/supabase'

export default function LifeCalculator() {
  const [cigarettesPerDay, setCigarettesPerDay] = useState(0)
  const [yearsToSmoke, setYearsToSmoke] = useState(10)
  const [loading, setLoading] = useState(true)
  
  // Load 30-day average on mount
  useEffect(() => {
    loadDailyAverage()
  }, [])

  const loadDailyAverage = async () => {
    try {
      setLoading(true)
      const history = await dailyEntriesApi.getHistory('demo-user-001', 30)
      
      // Calculate average cigarettes per day
      const daysWithData = history.filter(e => e.cigarettes_count !== undefined && e.cigarettes_count > 0)
      
      if (daysWithData.length > 0) {
        const total = daysWithData.reduce((sum, e) => sum + (e.cigarettes_count || 0), 0)
        const average = Math.round(total / daysWithData.length)
        setCigarettesPerDay(average)
      } else {
        setCigarettesPerDay(10) // Default fallback
      }
    } catch (error) {
      console.error('Error loading average:', error)
      setCigarettesPerDay(10) // Fallback
    } finally {
      setLoading(false)
    }
  }

  // Calculate lost life time in days
  // Formula: (cigarettes per day * 0.18 hours * years * 365) / 24
  const calculateLostDays = () => {
    const lostHours = cigarettesPerDay * 0.18 * yearsToSmoke * 365
    const lostDays = lostHours / 24
    return Math.round(lostDays)
  }

  const lostDays = calculateLostDays()
  const lostYears = (lostDays / 365).toFixed(1)
  const lostMonths = Math.round(lostDays / 30)

  return (
    <div className="calculator-page page-with-nav">
      <div className="container">
        <div className="page-header">
          <h1>⏳ Lebenszeitrechner</h1>
          <p className="subtitle">Wie viel Lebenszeit verlierst du?</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <div className="calculator-content animate-fade-in">
            {/* Input Fields */}
            <div className="card calculator-inputs">
              <div className="input-group">
                <label htmlFor="cigarettes">Zigaretten pro Tag</label>
                <input
                  id="cigarettes"
                  type="number"
                  className="input"
                  value={cigarettesPerDay}
                  onChange={(e) => setCigarettesPerDay(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  max="100"
                />
                <span className="input-hint">Basierend auf deinem 30-Tage Durchschnitt</span>
              </div>

              <div className="input-group" style={{ marginTop: 'var(--space-4)' }}>
                <label htmlFor="years">Jahre die ich weiterrauchen möchte</label>
                <input
                  id="years"
                  type="number"
                  className="input"
                  value={yearsToSmoke}
                  onChange={(e) => setYearsToSmoke(Math.max(0, parseInt(e.target.value) || 0))}
                  min="0"
                  max="100"
                />
              </div>
            </div>

            {/* Result */}
            <div className="card calculator-result" style={{ marginTop: 'var(--space-4)' }}>
              <div className="result-header">
                <span className="result-icon">💀</span>
                <h3>Verlorene Lebenszeit</h3>
              </div>
              
              <div className="result-value">
                <span className="result-number">{lostDays}</span>
                <span className="result-unit">Tage</span>
              </div>

              <div className="result-alternatives">
                <div className="alt-stat">
                  <span className="alt-value">{lostMonths}</span>
                  <span className="alt-label">Monate</span>
                </div>
                <div className="alt-divider"></div>
                <div className="alt-stat">
                  <span className="alt-value">{lostYears}</span>
                  <span className="alt-label">Jahre</span>
                </div>
              </div>

              <p className="result-note">
                Basierend auf 0,18 Stunden Lebenszeitverlust pro Zigarette
              </p>
            </div>

            {/* Motivation Card */}
            <div className="card motivation-card" style={{ marginTop: 'var(--space-4)', background: 'linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%)', border: '1px solid #10b981' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
                <span style={{ fontSize: '2rem' }}>🌱</span>
                <div>
                  <p style={{ fontWeight: 600, color: '#047857' }}>Jeder rauchfreie Tag zählt!</p>
                  <p style={{ fontSize: '0.875rem', color: '#065f46' }}>
                    Du sparst {(cigarettesPerDay * 0.18 / 24 * 60).toFixed(0)} Minuten Lebenszeit pro rauchfreiem Tag.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
