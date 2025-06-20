/**
 * Feature Flags Utility - Frontend
 * Centralized management of feature toggles for React components
 */

export class FeatureFlags {
  /**
   * Check if Industrial Quote System is enabled
   */
  static get industrialQuotes(): boolean {
    return import.meta.env.VITE_ENABLE_INDUSTRIAL_QUOTES === 'true'
  }

  /**
   * Check if ROI Simulator is enabled
   */
  static get roiSimulator(): boolean {
    return import.meta.env.VITE_ENABLE_ROI_SIMULATOR === 'true'
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

  /**
   * Debug: Log all feature flags (development only)
   */
  static logFlags(): void {
    if (import.meta.env.DEV) {
      console.log('🏁 Feature Flags:', this.getAll())
    }
  }
}

export default FeatureFlags 