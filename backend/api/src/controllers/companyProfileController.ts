import { Request, Response } from 'express'
import { PrismaClient } from '@prisma/client'
import { logger } from '../utils/logger'

const prisma = new PrismaClient()

export const getCompanyProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        phone: true,
        email: true,
        avatar: true,
        locationCity: true,
        locationState: true,
        specialties: true,
        certifications: true,
        businessLicense: true,
        createdAt: true,
        vendorProjects: true
      }
    })
    if (!user) return res.status(404).json({ success: false, message: 'Company not found' })
    res.json({ success: true, data: user })
  } catch (error) {
    logger.error('Error fetching company profile:', error)
    res.status(500).json({ success: false, message: 'Error fetching company profile' })
  }
}

export const getMyCompanyProfile = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        companyName: true,
        phone: true,
        email: true,
        avatar: true,
        locationCity: true,
        locationState: true,
        specialties: true,
        certifications: true,
        businessLicense: true,
        createdAt: true,
        vendorProjects: true
      }
    })

    if (!user) {
      return res.status(404).json({ success: false, message: 'Company profile not found for the current user.' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    logger.error('Error fetching my company profile:', error)
    res.status(500).json({ success: false, message: 'Error fetching company profile' })
  }
};

export const updateCompanyProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.params
    const { 
      firstName, 
      lastName, 
      companyName, 
      phone, 
      email, 
      avatar, 
      locationCity, 
      locationState, 
      specialties, 
      certifications,
      businessLicense
    } = req.body
    
    const user = await prisma.user.update({
      where: { id },
      data: {
        firstName,
        lastName,
        companyName,
        phone,
        email,
        avatar,
        locationCity,
        locationState,
        specialties,
        certifications,
        businessLicense
      }
    })
    res.json({ success: true, data: user })
  } catch (error) {
    logger.error('Error updating company profile:', error)
    res.status(500).json({ success: false, message: 'Error updating company profile' })
  }
}

// Note: Document upload/listing functions removed as CompanyDocument model doesn't exist in schema
// These would need to be implemented with a proper CompanyDocument model if needed 