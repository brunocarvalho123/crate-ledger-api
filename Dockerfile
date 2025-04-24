# Use official Node image
FROM node:22

# Create app directory
WORKDIR /usr/src/app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy app source
COPY . .

# Build the TypeScript code
RUN npm run build

# Run the compiled code
CMD ["npm", "start"]

# Expose the port
EXPOSE 3000