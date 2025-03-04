# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install project dependencies with the legacy-peer-deps flag
RUN npm install --legacy-peer-deps

# Install nodemon globally
RUN npm install -g nodemon

# Copy the rest of the project files to the working directory
COPY . .

# Expose the port the application will run on
EXPOSE 8080

# Command to run the application with nodemon
CMD ["nodemon", "--watch", ".", "--exec", "npm", "run", "dev"]