#!/bin/bash

echo "🔑 Generating JWT ES256 Key Pairs..."
echo "========================================="

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Create temp directory for keys
mkdir -p temp_keys

# Generate Access Token Keys
echo -e "${BLUE}📝 Generating Access Token Keys...${NC}"
openssl ecparam -genkey -name prime256v1 -noout -out temp_keys/access-private.pem 2>/dev/null
openssl ec -in temp_keys/access-private.pem -pubout -out temp_keys/access-public.pem 2>/dev/null

# Generate Refresh Token Keys  
echo -e "${BLUE}📝 Generating Refresh Token Keys...${NC}"
openssl ecparam -genkey -name prime256v1 -noout -out temp_keys/refresh-private.pem 2>/dev/null
openssl ec -in temp_keys/refresh-private.pem -pubout -out temp_keys/refresh-public.pem 2>/dev/null

# Function to convert PEM to single line
pem_to_single_line() {
    sed ':a;N;$!ba;s/\n/\\n/g' "$1"
}

# Read keys and convert to single line format
ACCESS_PRIVATE_KEY=$(pem_to_single_line temp_keys/access-private.pem)
ACCESS_PUBLIC_KEY=$(pem_to_single_line temp_keys/access-public.pem)
REFRESH_PRIVATE_KEY=$(pem_to_single_line temp_keys/refresh-private.pem)
REFRESH_PUBLIC_KEY=$(pem_to_single_line temp_keys/refresh-public.pem)

# Create .env.keys file
echo -e "${GREEN}📄 Creating .env.keys file...${NC}"

cat > .env.keys << EOF
# JWT Configuration for auth (access token)
JWT_ACCESS_TOKEN_EXPIRATION_TIME=900
JWT_ACCESS_TOKEN_PRIVATE_KEY="${ACCESS_PRIVATE_KEY}"
JWT_ACCESS_TOKEN_PUBLIC_KEY="${ACCESS_PUBLIC_KEY}"

# JWT Configuration for auth (refresh token)  
JWT_REFRESH_TOKEN_EXPIRATION_TIME=604800
JWT_REFRESH_TOKEN_PRIVATE_KEY="${REFRESH_PRIVATE_KEY}"
JWT_REFRESH_TOKEN_PUBLIC_KEY="${REFRESH_PUBLIC_KEY}"
EOF

# Set proper permissions
chmod 600 .env.keys

# Clean up temp directory
rm -rf temp_keys

echo -e "${GREEN}✅ JWT Keys Generated Successfully!${NC}"
echo "========================================="
echo -e "${YELLOW}Files created:${NC}"
echo "  📄 .env.keys                 (Environment variables)"
echo ""
echo -e "${YELLOW}Expiration times set:${NC}"
echo "  🕐 Access Token:  900 seconds (15 minutes)"
echo "  🕐 Refresh Token: 604800 seconds (7 days)"
echo ""
echo -e "${RED}⚠️  Security Notes:${NC}"
echo "  • Keep .env.keys secure and never commit to git"
echo "  • Add .env.keys to .gitignore"
echo "  • Use environment variables in production"
echo ""
echo -e "${GREEN}🚀 Ready to use in your application!${NC}"

# Show sample usage
echo ""
echo -e "${BLUE}📖 Sample .env file usage:${NC}"
echo "----------------------------------------"
echo "# Copy content from .env.keys to your .env file"
echo "# Or source it: source .env.keys"
echo ""
echo -e "${BLUE}📋 Verification (if needed):${NC}"
echo "----------------------------------------"
echo "# Keys are embedded in .env.keys file"
echo "# Use openssl to verify from environment variables"