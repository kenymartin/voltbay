import { PrismaClient } from '@prisma/client'
import AuctionPaymentService from './auctionPaymentService'

const prisma = new PrismaClient()

export class AuctionScheduler {
  private static instance: AuctionScheduler
  private intervalId: NodeJS.Timeout | null = null
  private readonly CHECK_INTERVAL = 60000 // Check every minute

  private constructor() {}

  static getInstance(): AuctionScheduler {
    if (!AuctionScheduler.instance) {
      AuctionScheduler.instance = new AuctionScheduler()
    }
    return AuctionScheduler.instance
  }

  // Start the auction monitoring service
  start() {
    if (this.intervalId) {
      console.log('Auction scheduler already running')
      return
    }

    console.log('Starting auction scheduler...')
    this.intervalId = setInterval(async () => {
      await this.checkExpiredAuctions()
    }, this.CHECK_INTERVAL)

    // Run initial check
    this.checkExpiredAuctions()
  }

  // Stop the auction monitoring service
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
      console.log('Auction scheduler stopped')
    }
  }

  // Check for expired auctions and process them
  private async checkExpiredAuctions() {
    try {
      console.log('Checking for expired auctions...')

      // Find auctions that have ended but are still active
      const expiredAuctions = await prisma.product.findMany({
        where: {
          isAuction: true,
          status: 'ACTIVE',
          auctionEndDate: {
            lte: new Date()
          }
        },
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: { user: true }
          },
          owner: true
        }
      })

      console.log(`Found ${expiredAuctions.length} expired auctions`)

      for (const auction of expiredAuctions) {
        try {
          await this.processExpiredAuction(auction.id)
        } catch (error) {
          console.error(`Error processing expired auction ${auction.id}:`, error)
        }
      }

    } catch (error) {
      console.error('Error checking expired auctions:', error)
    }
  }

  // Process a single expired auction
  private async processExpiredAuction(auctionId: string) {
    try {
      const result = await AuctionPaymentService.handleExpiredAuction(auctionId)
      
      if (result.winner) {
        console.log(`Auction ${auctionId} ended with winner: ${result.winner.email} - $${result.amount}`)
        
        // Optionally, you could automatically initiate payment here
        // For now, we'll just notify the winner and wait for manual payment
        
      } else {
        console.log(`Auction ${auctionId} expired without valid bids`)
      }

    } catch (error) {
      console.error(`Failed to process expired auction ${auctionId}:`, error)
    }
  }

  // Manually trigger auction expiration check (for testing)
  async triggerCheck() {
    await this.checkExpiredAuctions()
  }

  // Get scheduler status
  getStatus() {
    return {
      running: this.intervalId !== null,
      checkInterval: this.CHECK_INTERVAL,
      nextCheck: this.intervalId ? new Date(Date.now() + this.CHECK_INTERVAL) : null
    }
  }

  // Process specific auction (manual trigger)
  async processAuction(auctionId: string) {
    try {
      const auction = await prisma.product.findUnique({
        where: { id: auctionId },
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: { user: true }
          }
        }
      })

      if (!auction) {
        throw new Error('Auction not found')
      }

      if (!auction.isAuction) {
        throw new Error('Product is not an auction')
      }

      if (auction.auctionEndDate && auction.auctionEndDate > new Date()) {
        throw new Error('Auction has not ended yet')
      }

      return await this.processExpiredAuction(auctionId)

    } catch (error) {
      console.error(`Error manually processing auction ${auctionId}:`, error)
      throw error
    }
  }

  // Get upcoming auction endings
  async getUpcomingEndings(hours: number = 24) {
    try {
      const endTime = new Date(Date.now() + hours * 60 * 60 * 1000)
      
      const upcomingAuctions = await prisma.product.findMany({
        where: {
          isAuction: true,
          status: 'ACTIVE',
          auctionEndDate: {
            gte: new Date(),
            lte: endTime
          }
        },
        include: {
          bids: {
            orderBy: { amount: 'desc' },
            take: 1,
            include: { user: true }
          },
          owner: {
            select: { id: true, email: true, firstName: true, lastName: true }
          }
        },
        orderBy: { auctionEndDate: 'asc' }
      })

      return upcomingAuctions.map(auction => ({
        id: auction.id,
        title: auction.title,
        endDate: auction.auctionEndDate,
        currentBid: auction.currentBid,
        minimumBid: auction.minimumBid,
        bidCount: auction.bids.length,
        highestBidder: auction.bids[0]?.user ? {
          id: auction.bids[0].user.id,
          email: auction.bids[0].user.email,
          name: `${auction.bids[0].user.firstName} ${auction.bids[0].user.lastName}`
        } : null,
        seller: {
          id: auction.owner.id,
          email: auction.owner.email,
          name: `${auction.owner.firstName} ${auction.owner.lastName}`
        }
      }))

    } catch (error) {
      console.error('Error getting upcoming auction endings:', error)
      throw error
    }
  }
}

// Export singleton instance
export const auctionScheduler = AuctionScheduler.getInstance()
export default AuctionScheduler 