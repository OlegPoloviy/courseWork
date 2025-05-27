# 🔧 Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

# Встановлюємо робочий каталог
WORKDIR /app

# Додаємо необхідні залежності для Alpine
RUN apk add --no-cache python3 make g++

# Копіюємо файли залежностей
COPY package.json package-lock.json* ./

# Встановлюємо залежності (без --silent щоб бачити помилки)
RUN npm install --legacy-peer-deps

# Копіюємо код
COPY . .

# Білдимо застосунок
RUN npm run build

# 🚀 Stage 2: Production runner
FROM node:20-alpine AS runner

WORKDIR /app

# Копіюємо необхідні файли
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Експортуємо порт
EXPOSE 3000

# Встановлюємо змінні середовища
ENV NODE_ENV=production
ENV PORT=3000

# Запуск
CMD ["npm", "start"]