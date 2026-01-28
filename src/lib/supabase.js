import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set, update, query, orderByChild, equalTo } from 'firebase/database'

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)
const db = getDatabase(app)

// User ID for simple auth (demo mode)
const USER_ID = 'demo-user-001'

// Helper: Format date as YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0]

// Helper: Get today's date key (Firebase doesn't allow dots in keys)
const getDateKey = (date) => formatDate(date).replace(/-/g, '_')

// Daily Entries API
export const dailyEntriesApi = {
  // Get today's entry
  async getToday(userId = USER_ID) {
    const today = getDateKey(new Date())
    const entryRef = ref(db, `dailyEntries/${userId}/${today}`)
    
    try {
      const snapshot = await get(entryRef)
      if (snapshot.exists()) {
        return { ...snapshot.val(), date: formatDate(new Date()) }
      }
      return null
    } catch (error) {
      console.error('Error getting today entry:', error)
      return null
    }
  },

  // Set morning goal
  async setMorningGoal(userId = USER_ID, goal) {
    const today = getDateKey(new Date())
    const entryRef = ref(db, `dailyEntries/${userId}/${today}`)
    
    try {
      const snapshot = await get(entryRef)
      const existingData = snapshot.exists() ? snapshot.val() : {}
      
      const data = {
        ...existingData,
        user_id: userId,
        date: formatDate(new Date()),
        morning_goal: goal,
        updated_at: new Date().toISOString()
      }
      
      if (!existingData.created_at) {
        data.created_at = new Date().toISOString()
      }
      
      await set(entryRef, data)
      return data
    } catch (error) {
      console.error('Error saving morning goal:', error)
      throw error
    }
  },

  // Complete evening check
  async completeEvening(userId = USER_ID, completed, reflectionNote = null) {
    const today = getDateKey(new Date())
    const entryRef = ref(db, `dailyEntries/${userId}/${today}`)
    
    try {
      const updates = {
        evening_completed: completed,
        updated_at: new Date().toISOString()
      }
      
      if (reflectionNote) {
        updates.reflection_note = reflectionNote
      }
      
      await update(entryRef, updates)
      
      const snapshot = await get(entryRef)
      return snapshot.val()
    } catch (error) {
      console.error('Error completing evening check:', error)
      throw error
    }
  },

  // Get entries for analytics (last N days)
  async getHistory(userId = USER_ID, days = 30) {
    const entriesRef = ref(db, `dailyEntries/${userId}`)
    
    try {
      const snapshot = await get(entriesRef)
      if (!snapshot.exists()) return []
      
      const data = snapshot.val()
      const entries = Object.entries(data).map(([key, value]) => ({
        ...value,
        date: key.replace(/_/g, '-') // Convert back to YYYY-MM-DD
      }))
      
      // Filter to last N days and sort
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      return entries
        .filter(e => new Date(e.date) >= startDate)
        .sort((a, b) => new Date(a.date) - new Date(b.date))
    } catch (error) {
      console.error('Error getting history:', error)
      return []
    }
  },

  // Calculate current streak
  async getStreak(userId = USER_ID) {
    try {
      const history = await this.getHistory(userId, 365) // Get up to 1 year
      
      if (!history || history.length === 0) return 0
      
      // Filter only completed entries
      const completedEntries = history
        .filter(e => e.evening_completed === true)
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // newest first
      
      if (completedEntries.length === 0) return 0
      
      let streak = 0
      let currentDate = new Date()
      currentDate.setHours(0, 0, 0, 0)
      
      // Check if today is completed, if not start from yesterday
      const today = formatDate(currentDate)
      const todayCompleted = completedEntries.find(e => e.date === today)
      
      if (!todayCompleted) {
        currentDate.setDate(currentDate.getDate() - 1)
      }
      
      // Count consecutive days
      for (const entry of completedEntries) {
        const expectedDate = formatDate(currentDate)
        
        if (entry.date === expectedDate) {
          streak++
          currentDate.setDate(currentDate.getDate() - 1)
        } else if (entry.date < expectedDate) {
          break
        }
      }
      
      return streak
    } catch (error) {
      console.error('Error calculating streak:', error)
      return 0
    }
  }
}

export { db, ref, get, set, update }
