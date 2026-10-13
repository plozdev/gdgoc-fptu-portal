FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG VITE_RECRUITMENT_URL=
ENV VITE_API_BASE_URL=""
ENV VITE_RECRUITMENT_URL=$VITE_RECRUITMENT_URL
RUN npm run build

FROM caddy:2-alpine
COPY Caddyfile /etc/caddy/Caddyfile
COPY --from=build /app/dist /srv
