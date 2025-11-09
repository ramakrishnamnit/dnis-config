# syntax=docker/dockerfile:1.6

ARG NODE_VERSION=20

FROM node:${NODE_VERSION}-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:${NODE_VERSION}-alpine AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ARG VITE_APP_ENV=production
ENV VITE_APP_ENV=${VITE_APP_ENV}
ARG CONTEXT_PATH=dnis-config
ENV VITE_CONTEXT_PATH=${CONTEXT_PATH}
RUN npm run build -- --mode ${VITE_APP_ENV}

FROM nginx:1.27-alpine AS runner
ARG CONTEXT_PATH=dnis-config
ENV CONTEXT_PATH=${CONTEXT_PATH}
ENV VITE_CONTEXT_PATH=${CONTEXT_PATH}
RUN rm -rf /usr/share/nginx/html/*
COPY docker/nginx/default.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html/${CONTEXT_PATH}
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

