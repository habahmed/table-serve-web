# ---------- Stage 1: Build the React App ----------
# Use an official Node.js image to build the app
FROM node:18-alpine as build

# Set working directory inside the container
WORKDIR /app

# Copy dependency files first (for better caching)
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of your project files
COPY . .

# Build the React app for production
RUN npm run build



# ---------- Stage 2: Serve with Nginx ----------
# Use a lightweight nginx image to serve static files
FROM nginx:alpine

# Copy build output from Stage 1 to nginx html directory
COPY --from=build /app/build /usr/share/nginx/html

# Expose port 80 so Docker can map it
EXPOSE 80

# Start nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]

