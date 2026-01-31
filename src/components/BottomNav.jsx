import { useState } from 'react'

export default function BottomNav({ currentView, onNavigate, onLogCigarette }) {
  const [showPopup, setShowPopup] = useState(false)
  
  const navItems = [
    { id: 'dashboard', icon: <HomeIcon />, label: 'Home' },
    { id: 'health', icon: <HeartIcon />, label: 'Körper' },
    { id: 'log-cigarette', icon: <CigaretteIcon />, label: '', isCenter: true },
    { id: 'analytics', icon: <ChartIcon />, label: 'Stats' },
    { id: 'calculator', icon: <ClockIcon />, label: 'Lebenszeit' }
  ]

  const handleClick = (item) => {
    if (item.id === 'log-cigarette') {
      // Show popup first
      setShowPopup(true)
      // Then log
      if (onLogCigarette) {
        onLogCigarette()
      }
      // Auto-hide popup after 2.5 seconds
      setTimeout(() => {
        setShowPopup(false)
      }, 2500)
    } else {
      onNavigate(item.id)
    }
  }

  return (
    <>
      <nav className="bottom-nav">
        <ul className="nav-list">
          {navItems.map(item => (
            <li key={item.id} className={`nav-item ${item.isCenter ? 'nav-item--center' : ''}`}>
              <button
                onClick={() => handleClick(item)}
                className={`nav-link ${currentView === item.id ? 'nav-link--active' : ''} ${item.isCenter ? 'nav-link--center' : ''}`}
              >
                <span className={`nav-icon ${item.isCenter ? 'nav-icon--center' : ''}`}>{item.icon}</span>
                {item.label && <span>{item.label}</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* Sad Popup when logging cigarette */}
      {showPopup && (
        <div className="popup-overlay" style={{ background: 'rgba(0,0,0,0.8)' }} onClick={() => setShowPopup(false)}>
           <div className="popup-modal animate-slide-up">
             <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😢</div>
             <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '1rem', color: '#dc2626' }}>
               Zigarette geloggt
             </h2>
             <p style={{ fontSize: '1.1rem', color: '#4b5563', lineHeight: 1.5 }}>
               Dein Gesundheitsfortschritt setzt sich zurück.
             </p>
             <p style={{ fontSize: '0.9rem', color: '#9ca3af', marginTop: '1rem' }}>
               (Tippe zum Schließen)
             </p>
           </div>
        </div>
      )}
    </>
  )
}

// Clean SVG Icons
function HomeIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}

function HeartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  )
}

function ChartIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
      <path d="M22 12A10 10 0 0 0 12 2v10z"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function CigaretteIcon() {
  return (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="14" width="18" height="4" rx="1"/>
      <line x1="18" y1="14" x2="18" y2="18"/>
      <path d="M18 9c0-2.5 2-2.5 2-5"/>
      <path d="M14 9c0-2.5 2-2.5 2-5"/>
    </svg>
  )
}
