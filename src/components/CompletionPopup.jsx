import { useRef, useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

export default function CompletionPopup({ goal, isOpen, onClose, onComplete }) {
  const modalRef = useRef(null)
  const [reflection, setReflection] = useState('')

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
      setReflection('') // Reset reflection when popup opens
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
      colors: ['#6366f1', '#10b981', '#fbbf24']
    })
    
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.6 },
      colors: ['#6366f1', '#10b981', '#fbbf24']
    })
  }

  const handleSuccess = () => {
    handleCreateConfetti()
    onComplete(true, reflection)
  }

  const handleFailure = () => {
    onComplete(false, reflection)
  }

  if (!isOpen) return null

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div 
        className="popup-modal" 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="popup-icon">🎯</div>
        <h2 className="popup-title">Ziel erreicht?</h2>
        <p className="popup-goal">{goal}</p>

        {/* Reflection input */}
        <div className="popup-reflection">
          <textarea
            className="popup-reflection-input input textarea"
            placeholder="Reflexion des Tages (optional)..."
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            rows={3}
          />
        </div>

        <div className="popup-actions">
          <button
            onClick={handleFailure}
            className="popup-btn popup-btn--danger"
          >
            <span className="popup-btn-icon">✗</span>
            Leider nicht
          </button>
          
          <button
            onClick={handleSuccess}
            className="popup-btn popup-btn--success"
          >
            <span className="popup-btn-icon">✓</span>
            Geschafft
          </button>
        </div>

        <button onClick={onClose} className="popup-close">
          Abbrechen
        </button>
      </div>
    </div>
  )
}
