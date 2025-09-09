
# Use an official Node.js runtime as the base image
FROM node:22-alpine AS build

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# Copy package.json and pnpm-lock.yaml to the container
COPY package.json pnpm-lock.yaml ./

COPY .docker.env ./.env

# Install Node.js dependencies
RUN pnpm install --frozen-lockfile

# Copy the entire project to the container
COPY . .

# Build the React project to static files (VITE_API_URL will be injected)
RUN npm run build


# Stage 2: Serve with Nginx
FROM nginx:stable-perl

# Nginx configuration for SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build output to Nginx folder
COPY --from=build /app/dist /usr/share/nginx/html

# Expose the port the app runs on
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
