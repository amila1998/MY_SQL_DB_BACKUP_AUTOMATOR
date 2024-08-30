# Use an official Node.js runtime as a parent image
FROM node:18

# Set the working directory inside the container
WORKDIR /usr/src/app

# Install MariaDB client tools (including mysqldump)
RUN apt-get update && apt-get install -y mariadb-client

# Copy package.json and package-lock.json to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Make the script executable
RUN chmod +x /usr/src/app/index.js

# Expose the backup directory as a volume
VOLUME /bk

# Start the script using CMD
CMD ["npm", "start"]
