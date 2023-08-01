# Use the official Node.js LTS (Long Term Support) Alpine image as the base image
FROM node:lts-alpine

# Install simple http server for serving static content
RUN npm install -g http-server

# Set the working directory inside the container
WORKDIR /app

# Copy both 'package.json' and 'package-lock.json' (if available)
COPY package*.json ./

# Install project dependencies
RUN npm install

# Copy project files and folders to the current working directory (i.e., 'app' folder)
COPY . .

# Build app for production with minification
RUN npm run build

# Expose the port that your Vue.js application listens on during development (port 5173)
EXPOSE 5173

# Command to start the Vue.js application using the http-server on port 5173
CMD ["http-server", "dist", "-p", "5173"]
 