import { useEffect, useRef } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

export default function AnalyticsChart({ entries, currentStreak = 0 }) {
  // Milestone streak numbers (same as WeekOverview)
  const milestones = [5, 10, 25, 50, 100, 150, 200, 365]

  // Process data for the last 14 days + 7 future days
  const getDateRange = () => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // 14 days ago until 7 days in the future (21 total days)
    for (let i = 13; i >= -7; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push(date)
    }
    
    return days
  }

  const days = getDateRange()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  
  const getEntryForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entries.find(e => e.date === dateStr)
  }

  // Calculate projected streak for future days
  const getProjectedStreak = (date) => {
    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0)
    
    const daysFromToday = Math.round((targetDate - today) / (1000 * 60 * 60 * 24))
    
    if (daysFromToday <= 0) return null
    
    return currentStreak + daysFromToday
  }

  // Check if a streak is a milestone
  const isMilestone = (streak) => {
    return streak && milestones.includes(streak)
  }

  // Calculate daily success rate (cumulative up to that day)
  const dailyData = days.map((date) => {
    if (date > today) {
      return null
    }
    
    const relevantEntries = entries.filter(e => {
      const entryDate = new Date(e.date)
      entryDate.setHours(0, 0, 0, 0)
      return entryDate <= date && typeof e.evening_completed === 'boolean'
    })
    
    const completed = relevantEntries.filter(e => e.evening_completed === true).length
    const total = relevantEntries.length
    
    return total > 0 ? Math.round((completed / total) * 100) : null
  })

  // Create point colors - highlight milestones with diamond color
  const pointBackgroundColors = days.map((date) => {
    const projectedStreak = getProjectedStreak(date)
    if (isMilestone(projectedStreak)) {
      return 'rgb(56, 189, 248)' // Cyan/diamond color for milestones
    }
    return 'rgb(139, 92, 246)' // Default purple
  })

  // Create point radius - larger for milestones
  const pointRadii = days.map((date) => {
    const projectedStreak = getProjectedStreak(date)
    if (isMilestone(projectedStreak)) {
      return 7 // Larger for milestones
    }
    return 4 // Default size
  })

  const labels = days.map(date => {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Erfolgsrate',
        data: dailyData,
        borderColor: 'rgb(139, 92, 246)',
        backgroundColor: 'rgba(139, 92, 246, 0.1)',
        fill: true,
        tension: 0.4,
        borderWidth: 3,
        pointRadius: pointRadii,
        pointHoverRadius: 12,
        pointBackgroundColor: pointBackgroundColors,
        pointBorderColor: '#fff',
        pointBorderWidth: 3,
        spanGaps: true,
      }
    ]
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          label: function(context) {
            const index = context.dataIndex
            const date = days[index]
            const projectedStreak = getProjectedStreak(date)
            
            if (projectedStreak && isMilestone(projectedStreak)) {
              return `💎 Meilenstein: Tag ${projectedStreak} Streak!`
            }
            if (context.parsed.y === null) return 'Keine Daten'
            return `Erfolgsrate: ${context.parsed.y}%`
          }
        }
      }
    },
    scales: {
      x: {
        display: true,
        grid: {
          display: false
        },
        ticks: {
          maxTicksLimit: 7,
          color: '#94a3b8',
          font: {
            size: 10
          }
        }
      },
      y: {
        display: true,
        min: 0,
        max: 110,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawTicks: false
        },
        ticks: {
          stepSize: 20,
          callback: function(value) {
            if (value > 100) return ''
            return value + '%'
          },
          color: '#94a3b8',
          font: {
            size: 10
          }
        }
      }
    }
  }

  // Calculate stats
  const totalDays = entries.filter(e => typeof e.evening_completed === 'boolean').length
  const completedDays = entries.filter(e => e.evening_completed === true).length
  const successRate = totalDays > 0 ? Math.round((completedDays / totalDays) * 100) : 0

  return (
    <div className="analytics page-with-nav">
      <div className="container">
        <div className="page-header">
          <h1>📊 Dein Fortschritt</h1>
          <p className="subtitle">Die letzten 14 Tage</p>
        </div>

        <div className="card analytics-card animate-fade-in">
          <h3 className="analytics-title">Erfolgsrate über Zeit</h3>
          <div className="chart-container">
            <Line data={data} options={options} />
          </div>
        </div>

        <div className="stats-grid stats-grid--compact animate-fade-in" style={{ animationDelay: '0.1s' }}>
          <div className="stat-card">
            <div className="stat-value">{totalDays}</div>
            <div className="stat-label">Getrackte Tage</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{successRate}%</div>
            <div className="stat-label">Erfolgsrate</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{totalDays - completedDays}</div>
            <div className="stat-label">Verpasste Tage</div>
          </div>
        </div>
      </div>
    </div>
  )
}
