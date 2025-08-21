# Use Node.js LTS
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy source code
COPY . .

# Start app
CMD ["npm", "start"]

EXPOSE 3000