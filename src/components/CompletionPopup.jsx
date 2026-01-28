import { useRef, useEffect } from 'react'
import confetti from 'canvas-confetti'

export default function CompletionPopup({ goal, isOpen, onClose, onComplete }) {
  const modalRef = useRef(null)

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])

  const handleCreateConfetti = () => {
    // Left side burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.1, y: 0.8 },
      colors: ['#6366f1', '#10b981', '#fbbf24']
    })
    
    // Right side burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { x: 0.9, y: 0.8 },
      colors: ['#6366f1', '#10b981', '#fbbf24']
    })
  }

  if (!isOpen) return null

  return (
    <div className="modal-overlay animate-fade-in" onClick={onClose}>
      <div 
        className="modal-content animate-slide-up" 
        onClick={e => e.stopPropagation()}
        ref={modalRef}
      >
        <div className="modal-header">
          <div className="modal-icon">🎯</div>
          <h2 className="modal-title">Hast du dein Ziel erreicht?</h2>
        </div>

        <div className="modal-goal-display">
          {goal}
        </div>

        <div className="modal-actions">
          <button
            onClick={() => {
              handleCreateConfetti()
              onComplete(true)
            }}
            className="btn btn--success btn--large btn--full"
          >
            ✓ Geschafft!
          </button>
          
          <button
            onClick={() => onComplete(false)}
            className="btn btn--secondary btn--large btn--full"
          >
            ✗ Leider nicht
          </button>
        </div>

        <button onClick={onClose} className="modal-close-btn">
          Abbrechen
        </button>
      </div>
    </div>
  )
}
