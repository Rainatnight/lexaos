# Используем полноценный Node образ (Debian), Alpine иногда вызывает проблемы с native модулями
FROM node:20-bullseye

# Создаём рабочую папку
WORKDIR /app

# Копируем package.json и package-lock.json для кэширования слоёв
COPY package.json package-lock.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем весь проект в контейнер
COPY . .

# Пробрасываем порт, на котором слушает бек
EXPOSE 5000

# Устанавливаем переменные окружения (если нужно)
# ENV MONGO_URI="mongodb://mongo:27017/lexaos" PORT=5000

# Команда запуска сервера
CMD ["yarn", "dev"]
