import { useRef, useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

export default function CompletionPopup({ goal, isOpen, onClose, onComplete }) {
  const modalRef = useRef(null)
  const [reflection, setReflection] = useState('')
  
  // State for cigarette logging flow
  const [showCigInput, setShowCigInput] = useState(false)
  const [cigaretteCount, setCigaretteCount] = useState(1)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setReflection('') // Reset reflection
      setShowCigInput(false) // Reset flow
      setCigaretteCount(1)
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleCreateConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7']
    })
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#10b981', '#34d399', '#6ee7b7']
    })
  }

  const handleSuccess = () => {
    handleCreateConfetti()
    onComplete(true, reflection)
  }

  const handleFailureClick = () => {
    setShowCigInput(true)
  }

  const handleFailureConfirm = () => {
    onComplete(false, reflection, cigaretteCount)
  }

  if (!isOpen) return null

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        className="popup-modal" 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
      >
        {!showCigInput ? (
          <>
            <div className="popup-icon">🚭</div>
            <h2 className="popup-title">Heute rauchfrei?</h2>
            <p className="popup-goal">{goal}</p>
    
            {/* Reflection input */}
            <div className="popup-reflection">
              <textarea
                className="popup-reflection-input input textarea"
                placeholder="Wie fühlst du dich heute? (optional)..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={3}
              />
            </div>
    
            <div className="popup-actions">
              <button
                onClick={handleFailureClick}
                className="popup-btn popup-btn--danger"
              >
                <span className="popup-btn-icon">🚬</span>
                Leider nicht
              </button>
              
              <button
                onClick={handleSuccess}
                className="popup-btn popup-btn--success"
              >
                <span className="popup-btn-icon">🎉</span>
                Rauchfrei!
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="popup-icon">😢</div>
            <h2 className="popup-title">Rückfall erfassen</h2>
            <p className="popup-goal" style={{ fontSize: '1rem', marginBottom: '1rem' }}>
              Das ist okay. Wichtig ist, dass du ehrlich bist und weiter machst.
            </p>

            <div className="cigarette-input-container" style={{ margin: '2rem 0' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Anzahl Zigaretten:</label>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
                <button 
                  className="btn btn--secondary" 
                  onClick={() => setCigaretteCount(Math.max(1, cigaretteCount - 1))}
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  -
                </button>
                <span style={{ fontSize: '2rem', fontWeight: 700, minWidth: '3ch' }}>{cigaretteCount}</span>
                <button 
                  className="btn btn--secondary" 
                  onClick={() => setCigaretteCount(cigaretteCount + 1)}
                  style={{ width: '40px', height: '40px', padding: 0 }}
                >
                  +
                </button>
              </div>
            </div>

             {/* Reflection input for relapse */}
             <div className="popup-reflection">
              <textarea
                className="popup-reflection-input input textarea"
                placeholder="Was war der Auslöser? (Trigger)..."
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={2}
              />
            </div>

            <button 
              onClick={handleFailureConfirm}
              className="popup-btn popup-btn--danger"
              style={{ width: '100%' }}
            >
              Bestätigen
            </button>
          </>
        )}

        <button onClick={onClose} className="popup-close">
          Abbrechen
        </button>
      </div>
    </div>
  )
}
