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

export default function AnalyticsChart({ entries }) {
  // Process data for the last 30 days
  const getLast30Days = () => {
    const days = []
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      days.push(date)
    }
    
    return days
  }

  const days = getLast30Days()
  
  const getEntryForDate = (date) => {
    const dateStr = date.toISOString().split('T')[0]
    return entries.find(e => e.date === dateStr)
  }

  // Calculate cumulative success rate
  const cumulativeData = days.map((date, index) => {
    const relevantDays = days.slice(0, index + 1)
    const completed = relevantDays.filter(d => {
      const entry = getEntryForDate(d)
      return entry?.evening_completed === true
    }).length
    const total = relevantDays.filter(d => {
      const entry = getEntryForDate(d)
      // Only count as tracked if it's explicitly true or false (boolean)
      return typeof entry?.evening_completed === 'boolean'
    }).length
    
    return total > 0 ? Math.round((completed / total) * 100) : null
  })

  const labels = days.map(date => {
    return date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })
  })

  const data = {
    labels,
    datasets: [
      {
        label: 'Erfolgsrate',
        data: cumulativeData,
        borderColor: 'rgb(99, 102, 241)',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 2,
        pointHoverRadius: 6,
        pointBackgroundColor: 'rgb(99, 102, 241)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
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
        max: 100,
        grid: {
          color: 'rgba(226, 232, 240, 0.5)',
          drawTicks: false
        },
        ticks: {
          stepSize: 20, // Only show 0%, 20%, 40%, 60%, 80%, 100%
          callback: function(value) {
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
          <p className="subtitle">Die letzten 30 Tage</p>
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
