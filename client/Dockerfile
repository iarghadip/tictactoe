FROM node:20-alpine AS builder

WORKDIR /app

ARG VITE_NAKAMA_KEY
ARG VITE_NAKAMA_HOST
ARG VITE_NAKAMA_PORT
ARG VITE_NAKAMA_SSL

ENV VITE_NAKAMA_KEY=$VITE_NAKAMA_KEY
ENV VITE_NAKAMA_HOST=$VITE_NAKAMA_HOST
ENV VITE_NAKAMA_PORT=$VITE_NAKAMA_PORT
ENV VITE_NAKAMA_SSL=$VITE_NAKAMA_SSL

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM jonasal/nginx-certbot:latest

COPY --from=builder /app/dist /usr/share/nginx/html

ARG VITE_NAKAMA_HOST
COPY nginx.conf /etc/nginx/user_conf.d/default.conf.template
RUN envsubst '${VITE_NAKAMA_HOST}' \
        < /etc/nginx/user_conf.d/default.conf.template \
        > /etc/nginx/user_conf.d/default.conf \
    && rm /etc/nginx/user_conf.d/default.conf.template