import { useState } from 'react'

export default function MorningInput({ onSubmit, existingGoal }) {
  const [goal, setGoal] = useState(existingGoal || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!goal.trim()) return

    setIsSubmitting(true)
    try {
      await onSubmit(goal.trim())
    } catch (error) {
      console.error('Error saving goal:', error)
    }
    setIsSubmitting(false)
  }

  return (
    <div className="morning-input page-with-nav">
      <div className="container">
        <div className="card morning-card animate-slide-up">
          <div className="morning-icon">🌅</div>
          <h2 className="morning-title">Guten Morgen!</h2>
          <p className="morning-subtitle">
            Worauf möchtest du dich heute konzentrieren?
          </p>

          <form onSubmit={handleSubmit} className="morning-form">
            <div className="input-group">
              <label htmlFor="goal">Dein Fokus heute</label>
              <textarea
                id="goal"
                className="input textarea"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="z.B. Rauchfrei bleiben, tief atmen, Sport machen..."
                rows={4}
                required
              />
            </div>

            <button 
              type="submit" 
              className="btn btn--primary btn--large btn--full"
              disabled={isSubmitting || !goal.trim()}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner" style={{ width: 20, height: 20, borderWidth: 2 }}></span>
                  Wird gespeichert...
                </>
              ) : existingGoal ? (
                '✓ Fokus aktualisieren'
              ) : (
                '✓ Fokus festlegen'
              )}
            </button>
          </form>

          {existingGoal && (
            <p className="mt-4 text-center" style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-sm)' }}>
              Du kannst deinen Fokus jederzeit anpassen
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
