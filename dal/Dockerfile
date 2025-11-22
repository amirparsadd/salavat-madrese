# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package.json package-lock.json ./

# Install project dependencies
RUN npm install

# Copy the rest of the project files to the container
COPY . .

# Expose the port that the server will listen on
EXPOSE 3000

# Start the application
CMD [ "npm", "run", "start"]