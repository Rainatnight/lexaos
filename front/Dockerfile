
FROM node:20-alpine

WORKDIR /app

# Копируем только манифесты сначала (кэш слоёв)
COPY package.json package-lock.json ./


RUN npm ci

COPY . .
COPY .env .env

EXPOSE 3000

CMD ["npm", "run", "dev"]
