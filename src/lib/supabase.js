import { initializeApp } from 'firebase/app'
import { getDatabase, ref, get, set, update, push } from 'firebase/database'

// Firebase configuration
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

// User ID for simple auth
const USER_ID = 'demo-user-001'

// DB Prefix from env or default
const DB_PREFIX = import.meta.env.VITE_DB_PREFIX || 'maci'
const ENTRIES_PATH = `${DB_PREFIX}_dailyEntries`
const LOGS_PATH = `${DB_PREFIX}_cigaretteLogs`
const SETTINGS_PATH = `${DB_PREFIX}_userSettings`

// Helper: Format date as YYYY-MM-DD
const formatDate = (date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const getDateKey = (date) => formatDate(date).replace(/-/g, '_')

// API
export const dailyEntriesApi = {
  // Log a cigarette instantly
  async logCigarette(userId = USER_ID) {
    const timestamp = new Date().toISOString()
    const today = formatDate(new Date())
    const todayKey = getDateKey(new Date())
    
    // 1. Add to logs collection
    const logsRef = ref(db, `${LOGS_PATH}/${userId}`)
    await push(logsRef, {
      timestamp,
      date: today
    })
    
    // 2. Update daily entry count
    const entryRef = ref(db, `${ENTRIES_PATH}/${userId}/${todayKey}`)
    const snapshot = await get(entryRef)
    
    let currentCount = 0
    let existingData = {}
    
    if (snapshot.exists()) {
      existingData = snapshot.val()
      currentCount = existingData.cigarettes_count || 0
    }
    
    const updates = {
      ...existingData,
      user_id: userId,
      date: today,
      cigarettes_count: currentCount + 1,
      evening_completed: false, // Automatically fail the day if smoking
      updated_at: timestamp
    }
    
    if (!existingData.created_at) {
      updates.created_at = timestamp
    }
    
    await set(entryRef, updates)
    return updates
  },
  
  // Get all cigarette logs for stats
  async getCigaretteLogs(userId = USER_ID) {
    const logsRef = ref(db, `${LOGS_PATH}/${userId}`)
    try {
      const snapshot = await get(logsRef)
      if (!snapshot.exists()) return []
      return Object.values(snapshot.val())
    } catch (error) {
      console.error('Error fetching logs:', error)
      return []
    }
  },

  // Get today's entry
  async getToday(userId = USER_ID) {
    const today = getDateKey(new Date())
    const entryRef = ref(db, `${ENTRIES_PATH}/${userId}/${today}`)
    
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

  // Set morning goal (Motivation)
  async setMorningGoal(userId = USER_ID, goal) {
    const today = getDateKey(new Date())
    const entryRef = ref(db, `${ENTRIES_PATH}/${userId}/${today}`)
    
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
  // cigarettesCount: optional override
  async completeEvening(userId = USER_ID, completed, reflectionNote = null, dateKey = null, cigarettesCount = null) {
    const today = dateKey ? formatDate(new Date(dateKey)) : getDateKey(new Date())
    const entryDateKey = dateKey ? dateKey.replace(/-/g, '_') : today
    
    const entryRef = ref(db, `${ENTRIES_PATH}/${userId}/${entryDateKey}`)
    
    try {
      const updates = {
        evening_completed: completed, // true = Rauchfrei, false = Geraucht
        updated_at: new Date().toISOString()
      }
      
      if (reflectionNote) {
        updates.reflection_note = reflectionNote
      }
      
      // If manually overriding count (e.g. forgot to log)
      if (cigarettesCount !== null) {
        updates.cigarettes_count = parseInt(cigarettesCount)
      } else if (completed === true) {
        // If marked as rauchfrei (completed=true), ensure count is 0
         updates.cigarettes_count = 0
      }
      
      await update(entryRef, updates)
      
      const snapshot = await get(entryRef)
      return snapshot.val()
    } catch (error) {
      console.error('Error completing evening check:', error)
      throw error
    }
  },

  // Get history stats
  async getHistory(userId = USER_ID, days = 30) {
    const entriesRef = ref(db, `${ENTRIES_PATH}/${userId}`)
    
    try {
      const snapshot = await get(entriesRef)
      if (!snapshot.exists()) return []
      
      const data = snapshot.val()
      const entries = Object.entries(data).map(([key, value]) => ({
        ...value,
        date: key.replace(/_/g, '-')
      }))
      
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)
      
      return entries
        .filter(e => new Date(e.date) >= startDate)
        .sort((a, b) => new Date(b.date) - new Date(a.date)) // Newest first
    } catch (error) {
      console.error('Error getting history:', error)
      return []
    }
  },

  // Calculate smoke-free streak
  async getStreak(userId = USER_ID) {
    try {
      // Logic: Count consecutive days with evening_completed = true OR no cigarettes_count
      const history = await this.getHistory(userId, 365)
      if (!history || history.length === 0) return 0
      
      // Sort newest first
      const sorted = history.sort((a, b) => new Date(b.date) - new Date(a.date))
      
      let streak = 0
      const today = new Date()
      today.setHours(0,0,0,0)
      
      // Check today status
      const todayStr = formatDate(today)
      const todayEntry = sorted.find(e => e.date === todayStr)
      
      // If today we smoked, streak is 0
      if (todayEntry && (todayEntry.evening_completed === false || (todayEntry.cigarettes_count && todayEntry.cigarettes_count > 0))) {
        return 0
      }
      
      // If today is smoke-free so far (or not entered), we continue checking from yesterday
      // BUT if we are building the "Current Streak", usually implies full completed days? 
      // For "Rauchfrei seit X Tagen", we usually count full days + today if currently clean
      // Let's count consecutive clean days backwards from yesterday (or today if entry exists and is clean)
      
      let startCheckDate = new Date(today)
      
      if (todayEntry && todayEntry.evening_completed === true) {
         streak = 1 // Today counts
         startCheckDate.setDate(startCheckDate.getDate() - 1) 
      } else {
         // Today no entry yet, or entry exists but not "completed" flag (maybe just morning goal)
         // Check if logs exist for today? If logs exist, streak broken.
         if (todayEntry && todayEntry.cigarettes_count > 0) return 0
         
         // If no smoking today, check yesterday
         // Streak starts from yesterday
         startCheckDate.setDate(startCheckDate.getDate() - 1)
      }
      
      while (true) {
        const checkDateStr = formatDate(startCheckDate)
        const entry = sorted.find(e => e.date === checkDateStr)
        
        // A day counts if:
        // 1. Entry exists AND evening_completed is true
        // OR 2. No entry exists? (Assumption: No news is no smoking?? Or do we require confirmation?)
        // Strict approach: Must have entry confirming no smoking.
        // User said: "habit tracker" logic. 
        
        if (entry && entry.evening_completed === true) {
          streak++
        } else {
          // Break if day is missing or failed
          // If day is missing, streak usually breaks in habit trackers
          break 
        }
        startCheckDate.setDate(startCheckDate.getDate() - 1)
      }
      
      return streak
    } catch (error) {
      console.error('Error calculating streak:', error)
      return 0
    }
  },
  
  // Get time of last cigarette for exact timing
  async getLastCigaretteTime(userId = USER_ID) {
    try {
      // 1. Check exact logs first (most accurate)
      const logsRef = ref(db, `${LOGS_PATH}/${userId}`)
      // Query last item... Firebase realtime DB sorting is tricky with simpler SDK usage.
      // Just fetch all logs (not too many expected per user ideally) or limit query if possible
      // Using simple fetch for now
      const logs = await this.getCigaretteLogs(userId)
      if (logs.length > 0) {
        // Sort logs desc
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        return new Date(logs[0].timestamp)
      }
      
      // 2. If no logs, fallback to daily entries with evening_completed = false
      const history = await this.getHistory(userId, 365)
      const smokedDays = history.filter(e => e.evening_completed === false || e.cigarettes_count > 0)
      
      if (smokedDays.length > 0) {
        // Sort newest
        smokedDays.sort((a,b) => new Date(b.date) - new Date(a.date))
        const lastDay = smokedDays[0]
        // Assume end of day if we don't know time? Or noon? 
        // Let's assume 23:59 of that day to be safe/conservative for health tracking
        const date = new Date(lastDay.date)
        date.setHours(23, 59, 59)
        return date
      }
      
      // 3. Never smoked (in tracked history)
      return null
    } catch (e) {
      console.error(e)
      return null
    }
  }
}

export { db, ref, get, set, update }
