/**
 * Feature Flags Utility
 * Centralized management of feature toggles
 */

export class FeatureFlags {
  /**
   * Check if Industrial Quote System is enabled
   */
  static get industrialQuotes(): boolean {
    // Temporarily enabled for testing - will be controlled by env vars in production
    return process.env.ENABLE_INDUSTRIAL_QUOTES === 'true' || process.env.NODE_ENV === 'development'
  }

  /**
   * Check if ROI Simulator is enabled
   */
  static get roiSimulator(): boolean {
    // Temporarily enabled for testing - will be controlled by env vars in production
    return process.env.ENABLE_ROI_SIMULATOR === 'true' || process.env.NODE_ENV === 'development'
  }

  /**
   * Get all feature flags status
   */
  static getAll(): Record<string, boolean> {
    return {
      industrialQuotes: this.industrialQuotes,
      roiSimulator: this.roiSimulator
    }
  }

  /**
   * Check if any quote-related features are enabled
   */
  static get anyQuoteFeatures(): boolean {
    return this.industrialQuotes || this.roiSimulator
  }
}

export default FeatureFlags 