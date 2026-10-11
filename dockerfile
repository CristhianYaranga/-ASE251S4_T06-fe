# =========================
# Etapa 1: Build Angular
# =========================
FROM node:20 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

# =========================
# Etapa 2: NGINX
# =========================
FROM nginx:alpine

# Copiamos los archivos estáticos generados por Vite
COPY --from=build /app/dist /usr/share/nginx/html

# NUEVA LÍNEA: Copiamos tu configuración del puente de NGINX
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80