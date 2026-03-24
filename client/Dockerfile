FROM node:18-alpine AS build

ARG SERVER_KEY

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm install

COPY . .

COPY .env.example .env
RUN sed -i "s/REACT_APP_NAKAMA_KEY=.*/REACT_APP_NAKAMA_KEY=\"${SERVER_KEY}\"/g" .env

RUN npm run build

FROM nginx:stable-alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]