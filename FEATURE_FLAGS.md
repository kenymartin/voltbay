# VoltBay Feature Flags System

## 🏁 Overview
This document describes the feature flags system implemented for safe deployment of new features.

## 🎯 Current Features

### 1. Industrial Quote System
- **Environment Variable**: `ENABLE_INDUSTRIAL_QUOTES`
- **Frontend Variable**: `VITE_ENABLE_INDUSTRIAL_QUOTES`
- **Status**: Development (disabled by default)
- **Description**: Allows buyers to request custom quotes from sellers for industrial-scale orders

### 2. ROI Simulator
- **Environment Variable**: `ENABLE_ROI_SIMULATOR`
- **Frontend Variable**: `VITE_ENABLE_ROI_SIMULATOR`
- **Status**: Development (disabled by default)
- **Description**: Interactive tool to calculate return on investment for solar installations

## 🔧 Usage

### Backend (API)
```typescript
import FeatureFlags from '../utils/featureFlags'

// Check if feature is enabled
if (FeatureFlags.industrialQuotes) {
  // Industrial quotes logic
}

if (FeatureFlags.roiSimulator) {
  // ROI simulator logic
}
```

### Frontend (React)
```typescript
import FeatureFlags from '../utils/featureFlags'

// Conditional rendering
{FeatureFlags.industrialQuotes && (
  <QuoteRequestButton />
)}

{FeatureFlags.roiSimulator && (
  <ROISimulatorLink />
)}
```

## 🚀 Deployment Strategy

1. **Development**: Features disabled by default
2. **Testing**: Enable via environment variables
3. **Staging**: Test with real data
4. **Production**: Gradual rollout

## 🔍 Testing Feature Flags

### API Endpoint
```
GET /api/feature-flags
```

Response:
```json
{
  "success": true,
  "data": {
    "features": {
      "industrialQuotes": false,
      "roiSimulator": false
    },
    "environment": "development",
    "timestamp": "2024-01-01T00:00:00.000Z"
  }
}
```

## 📁 File Structure

```
backend/api/
├── src/
│   ├── utils/featureFlags.ts          # Backend feature flags utility
│   ├── routes/featureFlags.ts         # Feature flags API endpoint
│   └── modules/
│       ├── quotes/                    # Industrial quotes module
│       └── roi-simulator/             # ROI simulator module
│
frontend/src/
├── utils/featureFlags.ts              # Frontend feature flags utility
├── components/
│   ├── quotes/                        # Quote-related components
│   └── roi-simulator/                 # ROI simulator components
└── pages/
    ├── quotes/                        # Quote pages
    └── roi-simulator/                 # ROI simulator pages
```

## 🛡️ Safety Features

- **Default disabled**: All new features are disabled by default
- **Environment-based**: Can be toggled per environment
- **Centralized management**: Single source of truth for feature status
- **Runtime checking**: No code changes needed to toggle features
- **Gradual rollout**: Can enable for specific users/environments

## 🔄 Branch Strategy

- **Feature Branch**: `feature/quote-system-and-roi-simulator`
- **Main Branch**: Stable, production-ready code
- **Merge Strategy**: Only merge when features are fully tested and stable 