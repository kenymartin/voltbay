// Utility to completely clear all authentication state
export const clearAllAuthState = () => {
  console.log('🔧 Clearing all authentication state...')
  
  // Clear localStorage
  localStorage.clear()
  
  // Clear sessionStorage  
  sessionStorage.clear()
  
  // Clear all cookies
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/;domain=localhost")
    document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/")
  })
  
  // Clear any axios default headers
  try {
    delete (window as any).axios?.defaults?.headers?.common?.Authorization
  } catch (e) {}
  
  console.log('🔧 Authentication state cleared')
}

// Function to restart the app cleanly
export const restartApp = () => {
  clearAllAuthState()
  
  // Force a hard reload to clear any cached state
  window.location.replace(window.location.origin + '/login')
} 