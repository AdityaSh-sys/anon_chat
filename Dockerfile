FROM node:18.20.2-alpine3.19

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of the code
COPY . .

# Build frontend using Vite
RUN npm run build

# Remove dev dependencies to reduce size
RUN npm prune --production

# Railway will auto-inject PORT, so don't hardcode
EXPOSE 3001

# Start the server (serves frontend + handles WS)
CMD ["npm", "run", "server"]
