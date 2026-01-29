import { useState, useEffect, useCallback } from 'react'
import { dailyEntriesApi } from './lib/supabase'
import Login from './components/Login'
import Dashboard from './components/Dashboard'
import MorningInput from './components/MorningInput'
import EveningCheck from './components/EveningCheck'
import AnalyticsChart from './components/AnalyticsChart'
import DetailsView from './components/DetailsView'
import BottomNav from './components/BottomNav'

// Demo user ID for simple password auth (replace with real auth if needed)
const DEMO_USER_ID = 'demo-user-001'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentView, setCurrentView] = useState('dashboard')
  const [isLoading, setIsLoading] = useState(true)
  const [streak, setStreak] = useState(0)
  const [todayEntry, setTodayEntry] = useState(null)
  const [weekEntries, setWeekEntries] = useState([])
  const [allEntries, setAllEntries] = useState([])
  const [yesterdayEntry, setYesterdayEntry] = useState(null)

  // Check if it's evening time (after 17:00)
  const isEvening = new Date().getHours() >= 17

  // Load data from Supabase
  const loadData = useCallback(async () => {
    try {
      const [today, history, currentStreak] = await Promise.all([
        dailyEntriesApi.getToday(DEMO_USER_ID),
        dailyEntriesApi.getHistory(DEMO_USER_ID, 30),
        dailyEntriesApi.getStreak(DEMO_USER_ID)
      ])

      setTodayEntry(today)
      setAllEntries(history)
      setStreak(currentStreak)

      // Find yesterday's entry from history
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const year = yesterday.getFullYear()
      const month = String(yesterday.getMonth() + 1).padStart(2, '0')
      const day = String(yesterday.getDate()).padStart(2, '0')
      const yesterdayStr = `${year}-${month}-${day}`
      
      const foundYesterday = history.find(e => e.date === yesterdayStr)
      setYesterdayEntry(foundYesterday || null)

      // Get week entries
      const weekStart = new Date()
      weekStart.setDate(weekStart.getDate() - 7)
      const weekData = history.filter(e => new Date(e.date) >= weekStart)
      setWeekEntries(weekData)
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Check auth on mount
  useEffect(() => {
    const savedAuth = localStorage.getItem('habit_auth')
    if (savedAuth === 'authenticated') {
      setIsAuthenticated(true)
    } else {
      setIsLoading(false)
    }
  }, [])

  // Load data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadData()
    }
  }, [isAuthenticated, loadData])

  // Handle login
  const handleLogin = () => {
    setIsAuthenticated(true)
  }

  // Handle logout
  const handleLogout = () => {
    localStorage.removeItem('habit_auth')
    setIsAuthenticated(false)
    setCurrentView('dashboard')
  }

  // Handle morning goal submission
  const handleMorningSubmit = async (goal) => {
    try {
      await dailyEntriesApi.setMorningGoal(DEMO_USER_ID, goal)
      await loadData()
      setCurrentView('dashboard')
    } catch (error) {
      console.error('Error saving morning goal:', error)
      throw error
    }
  }

  // Handle evening check submission
  const handleEveningSubmit = async (completed, reflection) => {
    try {
      await dailyEntriesApi.completeEvening(DEMO_USER_ID, completed, reflection)
      await loadData()
      // Stay on evening view to show success animation
    } catch (error) {
      console.error('Error saving evening check:', error)
      throw error
    }
  }

  // Handle popup completion (for today or yesterday)
  const handleCompletion = async (completed, reflection, date = null) => {
    try {
      if (date) {
        await dailyEntriesApi.completeEvening(DEMO_USER_ID, completed, reflection, date)
      } else {
        await dailyEntriesApi.completeEvening(DEMO_USER_ID, completed, reflection)
      }
      await loadData()
    } catch (error) {
      console.error('Error completing goal:', error)
    }
  }

  // Render loading state
  if (isLoading && isAuthenticated) {
    return (
      <div className="app">
        <div className="loading-container" style={{ minHeight: '100vh' }}>
          <div className="spinner"></div>
          <p>Wird geladen...</p>
        </div>
      </div>
    )
  }

  // Render login if not authenticated
  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />
  }

  // Render main app
  const renderView = () => {
    switch (currentView) {
      case 'morning':
        return (
          <MorningInput 
            onSubmit={handleMorningSubmit} 
            existingGoal={todayEntry?.morning_goal}
          />
        )
      case 'evening':
        if (!todayEntry?.morning_goal) {
          return (
            <div className="page-with-nav">
              <div className="container">
                <div className="card text-center" style={{ marginTop: 'var(--space-8)' }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>🌅</div>
                  <h2 style={{ marginBottom: 'var(--space-4)' }}>Zuerst ein Ziel setzen</h2>
                  <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-6)' }}>
                    Du musst zuerst ein Morgenziel setzen, bevor du den Abend-Check machen kannst.
                  </p>
                  <button 
                    onClick={() => setCurrentView('morning')}
                    className="btn btn--primary btn--large"
                  >
                    Ziel setzen
                  </button>
                </div>
              </div>
            </div>
          )
        }
        return (
          <EveningCheck 
            goal={todayEntry.morning_goal} 
            onSubmit={handleEveningSubmit}
          />
        )
      case 'analytics':
        return <AnalyticsChart entries={allEntries} currentStreak={streak} />
      case 'details':
        return <DetailsView entries={allEntries} />
      default:
        return (
          <Dashboard
            streak={streak}
            todayEntry={todayEntry}
            yesterdayEntry={yesterdayEntry}
            weekEntries={weekEntries}
            onNavigate={setCurrentView}
            onComplete={handleCompletion}
            isEvening={isEvening}
          />
        )
    }
  }

  return (
    <div className="app">
      {renderView()}
      <BottomNav currentView={currentView} onNavigate={setCurrentView} />
    </div>
  )
}

export default App
