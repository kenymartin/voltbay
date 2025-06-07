const express = require('express')
const cors = require('cors')

const app = express()
const PORT = 5001

// Basic middleware
app.use(cors())
app.use(express.json())

// Simple wallet routes
app.get('/api/wallet/test', (req, res) => {
  res.json({ success: true, message: 'Wallet routes working' })
})

app.get('/api/wallet/balance', (req, res) => {
  res.json({
    success: true,
    data: {
      wallet: {
        id: 'mock-wallet-id',
        balance: 0,
        lockedBalance: 0,
        availableBalance: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    }
  })
})

app.get('/api/wallet/stats', (req, res) => {
  res.json({
    success: true,
    data: { 
      stats: {
        balance: 0,
        lockedBalance: 0,
        availableBalance: 0,
        totalDeposits: 0,
        totalPurchases: 0,
        transactionCount: 0
      }
    }
  })
})

app.get('/api/wallet/transactions', (req, res) => {
  res.json({
    success: true,
    data: {
      transactions: [],
      pagination: {
        page: 1,
        limit: 20,
        total: 0,
        totalPages: 0
      }
    }
  })
})

app.get('/health', (req, res) => {
  res.json({ success: true, message: 'Minimal server healthy' })
})

app.listen(PORT, () => {
  console.log(`Minimal server running on port ${PORT}`)
}) 