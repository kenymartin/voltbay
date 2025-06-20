// Get enterprise vendors directory
async getVendors(req: Request, res: Response) {
  try {
    const { city, state } = req.query

    const whereClause: any = {
      isEnterpriseVendor: true,
      role: 'ENTERPRISE_VENDOR'
    }

    if (city) {
      whereClause.locationCity = {
        contains: city as string,
        mode: 'insensitive'
      }
    }

    if (state) {
      whereClause.locationState = {
        contains: state as string,
        mode: 'insensitive'
      }
    }

    const vendors = await prisma.user.findMany({
      where: whereClause,
      select: {
        id: true,
        companyName: true,
        locationCity: true,
        locationState: true,
        avatar: true,
        createdAt: true,
        vendorProjects: {
          where: {
            status: 'completed'
          },
          select: {
            id: true
          }
        }
      },
      orderBy: {
        companyName: 'asc'
      }
    })

    const vendorsWithJobCount = vendors.map(vendor => ({
      id: vendor.id,
      companyName: vendor.companyName,
      locationCity: vendor.locationCity,
      locationState: vendor.locationState,
      avatar: vendor.avatar,
      completedJobs: vendor.vendorProjects.length,
      memberSince: vendor.createdAt
    }))

    res.json({
      success: true,
      data: vendorsWithJobCount
    })
  } catch (error) {
    console.error('Error fetching vendors:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors'
    })
  }
} 