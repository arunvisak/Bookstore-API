# Use official Node.js image
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package files and install dependencies
COPY package*.json ./
RUN npm install

# Copy the rest of your project files
COPY . .

# Expose the app port
EXPOSE 3000

# Start the app
CMD ["node", "index.js"]