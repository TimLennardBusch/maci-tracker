export default function WeekOverview({ entries }) {
  const getDaysOfWeek = () => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Start from Monday of current week
    const dayOfWeek = today.getDay()
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
    const monday = new Date(today)
    monday.setDate(today.getDate() + mondayOffset)
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday)
      date.setDate(monday.getDate() + i)
      days.push(date)
    }
    
    return days
  }

  const days = getDaysOfWeek()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const dayLabels = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

  const getEntryForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entries.find(e => e.date === dateStr)
  }

  const getDayStatus = (date, entry) => {
    // Timezone fix: use local date string comparison
    const dateStr = date.toISOString().split('T')[0]
    const todayStr = new Date().toISOString().split('T')[0] // Careful: this is UTC, need local fix too?
    
    // Better date comparison using local time
    const checkDate = new Date(dateStr)
    checkDate.setHours(0,0,0,0)
    
    const todayDate = new Date()
    todayDate.setHours(0,0,0,0)
    
    const isFuture = checkDate > todayDate
    const isToday = checkDate.getTime() === todayDate.getTime()
    
    if (isFuture) return 'future'
    if (isToday) {
      if (!entry) return 'today-empty'
      // treat as pending if not explicitly boolean true/false
      if (typeof entry.evening_completed !== 'boolean') return 'today-pending'
      return entry.evening_completed ? 'today-completed' : 'today-failed'
    }
    
    if (!entry) return 'empty'
    // treat as pending if not explicitly boolean true/false
    if (typeof entry.evening_completed !== 'boolean') return 'pending' 
    return entry.evening_completed ? 'completed' : 'failed'
  }

  const getDayClasses = (status) => {
    const classes = ['day-cell']
    
    switch (status) {
      case 'completed':
      case 'today-completed':
        classes.push('day-cell--completed')
        break
      case 'failed':
      case 'today-failed':
      case 'empty':
        classes.push('day-cell--failed')
        break
      case 'today-pending':
      case 'today-empty':
        classes.push('day-cell--today', 'day-cell--pending')
        break
      case 'pending':
        classes.push('day-cell--pending')
        break
      default:
        break
    }
    
    if (status.startsWith('today')) {
      classes.push('day-cell--today')
    }
    
    return classes.join(' ')
  }

  const getDayIcon = (status) => {
    switch (status) {
      case 'completed':
      case 'today-completed':
        return '✓'
      case 'failed':
      case 'today-failed':
        return '✗'
      case 'pending':
      case 'today-pending':
      case 'today-empty':
        return '•'
      default:
        return ''
    }
  }

  return (
    <div className="week-overview card">
      <h3 className="week-overview-title">Diese Woche</h3>
      <div className="week-grid">
        {days.map((date, index) => {
          const entry = getEntryForDate(date)
          const status = getDayStatus(date, entry)
          
          return (
            <div 
              key={date.toISOString()} 
              className={getDayClasses(status)}
              title={entry?.morning_goal || ''}
            >
              <span className="day-label">{dayLabels[index]}</span>
              <span>{getDayIcon(status)}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
