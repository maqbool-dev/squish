# ---- Stage 1: build the static site with Node ----
FROM node:22-alpine AS build
WORKDIR /app

# Copy only the manifests first so Docker can cache the install layer.
# (If your code changes but dependencies don't, this step is reused.)
COPY package*.json ./
RUN npm ci

# Now copy the rest of the source and build.
COPY . .
RUN npm run build
# -> produces /app/dist (plain HTML/CSS/JS)

# ---- Stage 2: serve the built files with Nginx ----
FROM nginx:alpine AS serve

# Use our config (SPA fallback + caching) instead of the default.
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy ONLY the build output from stage 1 — Node and node_modules are left behind.
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
