'use client'

import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const API_BASE_URL = 'https://services.niftytrader.in/webapi/option/oi-pcr-data'
const headers = {
  "Accept": "application/json, text/plain, */*",
  "Authorization": "Basic bmlmdHlhcGl1c2VyOm5pZnR5YXBpdXNlckAyMTEwIw==",
  "User-Agent": "Mozilla/5.0"
}

export default function Home() {
  const [bankniftyData, setBankniftyData] = useState([])
  const [niftyData, setNiftyData] = useState([])
  const [overallData, setOverallData] = useState([])
  const [lastUpdated, setLastUpdated] = useState('')

  useEffect(() => {
    const fetchDataAndUpdate = async () => {
      const bankniftyResult = await fetchData('bankniftypcr')
      const niftyResult = await fetchData('niftypcr')

      if (bankniftyResult && niftyResult) {
        const processedBanknifty = processData(bankniftyResult)
        const processedNifty = processData(niftyResult)
        const processedOverall = processOverallData(processedBanknifty, processedNifty)

        setBankniftyData(processedBanknifty)
        setNiftyData(processedNifty)
        setOverallData(processedOverall)
        setLastUpdated(new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }))
      }
    }

    fetchDataAndUpdate()
    const interval = setInterval(fetchDataAndUpdate, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchData = async (type) => {
    try {
      const response = await axios.get(`${API_BASE_URL}?type=${type}&expiry=`, { headers })
      return response.data.result.oiDatas
    } catch (error) {
      console.error(`Error fetching ${type} data:`, error)
      return null
    }
  }

  const processData = (data) => {
    let rollingHigh = -Infinity
    let rollingLow = Infinity

    return data.map(item => {
      const pcr = parseFloat(item.pcr)
      rollingHigh = Math.max(rollingHigh, pcr)
      rollingLow = Math.min(rollingLow, pcr)

      const bearishness = ((pcr - rollingHigh) / rollingHigh) * 100
      const bullishness = ((pcr - rollingLow) / rollingLow) * 100
      const sentiment = (bullishness + bearishness) / 2

      return {
        time: item.time,
        sentiment,
        pcr,
      }
    })
  }

  const processOverallData = (bankniftyData, niftyData) => {
    return bankniftyData.map((item, index) => ({
      time: item.time,
      sentiment: (item.sentiment + niftyData[index].sentiment) / 2,
    }))
  }

  const createChartData = (data, label, color) => ({
    labels: data.map(d => d.time),
    datasets: [
      {
        label,
        data: data.map(d => d.sentiment),
        borderColor: color,
        backgroundColor: color,
        fill: false,
      },
    ],
  })

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Market Sentiment Analysis',
      },
    },
    scales: {
      y: {
        min: -40,
        max: 40,
        ticks: {
          stepSize: 20,
        },
      },
    },
  }

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-24 bg-gray-100">
      <div className="w-full max-w-7xl">
        <h1 className="text-4xl font-bold mb-4 text-center">Market Sentiment Analysis</h1>
        <p className="text-xl mb-8 text-center">Last updated: {lastUpdated}</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
            <h2 className="text-2xl font-semibold mb-4">Bank Nifty Sentiment</h2>
            <Line options={chartOptions} data={createChartData(bankniftyData, 'Bank Nifty', '#4299E1')} />
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
            <h2 className="text-2xl font-semibold mb-4">Nifty Sentiment</h2>
            <Line options={chartOptions} data={createChartData(niftyData, 'Nifty', '#48BB78')} />
          </div>
        </div>
        
        <div className="mt-8">
          <div className="bg-white p-6 rounded-lg shadow-md h-[400px]">
            <h2 className="text-2xl font-semibold mb-4">Overall Market Sentiment</h2>
            <Line options={chartOptions} data={createChartData(overallData, 'Overall', '#9F7AEA')} />
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Current Sentiment Values</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SentimentValue title="Bank Nifty" data={bankniftyData[bankniftyData.length - 1]} />
            <SentimentValue title="Nifty" data={niftyData[niftyData.length - 1]} />
            <SentimentValue title="Overall" data={overallData[overallData.length - 1]} />
          </div>
        </div>

        <div className="mt-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Sentiment Legend</h2>
          <div className="flex flex-col md:flex-row justify-around">
            <LegendItem color="#dc3545" label="Bearish (-40 to -10)" />
            <LegendItem color="#ffc107" label="Neutral (-10 to 10)" />
            <LegendItem color="#28a745" label="Bullish (10 to 40)" />
          </div>
        </div>
      </div>
    </main>
  )
}

const SentimentValue = ({ title, data }) => {
  const sentiment = data?.sentiment || 0
  const [classification, color] = classifySentiment(sentiment)

  return (
    <div>
      <h3 className="text-xl font-semibold">{title} Sentiment:</h3>
      <p>Value: {sentiment.toFixed(2)}</p>
      <p className={`font-bold ${color}`}>Classification: {classification}</p>
    </div>
  )
}

const LegendItem = ({ color, label }) => (
  <div className="flex items-center mb-2 md:mb-0">
    <div className="w-4 h-4 rounded-full mr-2" style={{ backgroundColor: color }}></div>
    <span>{label}</span>
  </div>
)

const classifySentiment = (value) => {
  if (value < -10) return ['Bearish', 'text-red-600']
  if (value > 10) return ['Bullish', 'text-green-600']
  return ['Neutral', 'text-yellow-600']
}