FROM node:18.20.2-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including devDependencies like vite)
RUN npm install

# Copy rest of the code
COPY . .

# Build the application using Vite
RUN npm run build

# Optional: Remove devDependencies after build to shrink final image
RUN npm prune --production

# Expose the port your server listens on
EXPOSE 3001

# Start the server
CMD ["npm", "run", "server"]
