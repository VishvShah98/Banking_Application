# Use the official Node.js image as the base image
FROM node:latest

# Set the working directory inside the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Expose the port on which your Node.js application is listening (replace 3000 with your actual port)
EXPOSE 3000

# Start the Node.js application
CMD ["node", "index.js"]
