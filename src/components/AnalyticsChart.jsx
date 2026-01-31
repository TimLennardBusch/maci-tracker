import { useState, useEffect } from 'react'
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
import { Bar } from 'react-chartjs-2'
import { dailyEntriesApi } from '../lib/supabase'

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
  const [allLogs, setAllLogs] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadAllData()
  }, [])

  const loadAllData = async () => {
    try {
      setLoading(true)
      const logs = await dailyEntriesApi.getCigaretteLogs()
      setAllLogs(logs)
    } catch (error) {
      console.error('Error loading logs:', error)
    } finally {
      setLoading(false)
    }
  }

  // Process data for the last 14 days
  const getDateRange = () => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    // Last 14 days
    for (let i = 13; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push(date)
    }
    
    return days
  }

  const days = getDateRange()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Get cigarettes count for each day from entries
  const getCigarettesForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    const entry = entries.find(e => e.date === dateStr)
    return entry?.cigarettes_count || 0
  }

  const dailyData = days.map(date => getCigarettesForDate(date))

  const labels = days.map(date => {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  })

  // Create gradient colors based on value
  const barColors = dailyData.map(value => {
    if (value === 0) return 'rgba(16, 185, 129, 0.8)' // Green for 0
    if (value <= 5) return 'rgba(251, 191, 36, 0.8)' // Yellow for low
    return 'rgba(239, 68, 68, 0.8)' // Red for high
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Zigaretten',
        data: dailyData,
        backgroundColor: barColors,
        borderColor: barColors.map(c => c.replace('0.8', '1')),
        borderWidth: 1,
        borderRadius: 6,
        borderSkipped: false,
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
            const value = context.parsed.y
            if (value === 0) return '🌟 Rauchfrei!'
            return `🚬 ${value} Zigaretten`
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
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawTicks: false
        },
        ticks: {
          stepSize: 5,
          color: '#94a3b8',
          font: {
            size: 10
          }
        }
      }
    }
  }

  // Calculate stats
  const daysWithData = entries.filter(e => e.cigarettes_count !== undefined)
  const totalCigarettes = entries.reduce((sum, e) => sum + (e.cigarettes_count || 0), 0)
  const avgPerWeek = daysWithData.length > 0 
    ? Math.round((totalCigarettes / daysWithData.length) * 7)
    : 0
  
  // Total ever from all logs
  const totalEver = allLogs.length

  return (
    <div className="analytics page-with-nav">
      <div className="container">
        <div className="page-header">
          <h1>📊 Statistik</h1>
          <p className="subtitle">Dein Rauchverhalten</p>
        </div>

        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
          </div>
        ) : (
          <>
            <div className="card analytics-card animate-fade-in">
              <h3 className="analytics-title">Zigaretten pro Tag</h3>
              <div className="chart-container">
                <Bar data={data} options={options} />
              </div>
            </div>

            <div className="stats-grid stats-grid--compact animate-fade-in" style={{ animationDelay: '0.1s' }}>
              <div className="stat-card">
                <div className="stat-value">{avgPerWeek}</div>
                <div className="stat-label">Ø pro Woche</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{totalEver}</div>
                <div className="stat-label">Gesamt erfasst</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{currentStreak}</div>
                <div className="stat-label">Rauchfreie Tage</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{daysWithData.length}</div>
                <div className="stat-label">Getrackte Tage</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
