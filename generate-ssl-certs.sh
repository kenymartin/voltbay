#!/bin/bash

# Create certs directory
mkdir -p frontend/certs

# Generate self-signed SSL certificate for development
openssl req -x509 -newkey rsa:4096 -keyout frontend/certs/key.pem -out frontend/certs/cert.pem -days 365 -nodes -subj "/C=US/ST=Development/L=Development/O=VoltBay/OU=Development/CN=localhost"

echo "✅ SSL certificates generated successfully!"
echo "📁 Certificates saved to: frontend/certs/"
echo "🔒 You can now run the app with HTTPS at: https://localhost:3000"
echo ""
echo "⚠️  Note: Your browser will show a security warning for self-signed certificates."
echo "   Click 'Advanced' → 'Proceed to localhost (unsafe)' to continue."
echo ""
echo "🚀 Run: npm run dev" 