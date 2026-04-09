FROM node:22-alpine AS build
WORKDIR /app
COPY FetchDesk.Client.React/package*.json ./
RUN npm install
COPY FetchDesk.Client.React ./
ARG VITE_API_BASE_URL=http://localhost:5000
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
RUN npm run build

FROM nginx:alpine AS runtime
WORKDIR /usr/share/nginx/html
COPY --from=build /app/dist ./
COPY FetchDesk.Client.React/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
