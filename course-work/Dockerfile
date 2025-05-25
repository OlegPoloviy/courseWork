# 🌱 Етап 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Копіюємо файли залежностей для кращого кешування шарів
COPY package*.json ./
COPY yarn.lock* ./

# Встановлюємо залежності (використовуємо yarn якщо є yarn.lock)
RUN if [ -f yarn.lock ]; then yarn install --frozen-lockfile; else npm ci --legacy-peer-deps; fi

# Копіюємо увесь код
COPY . .

RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Компілюємо TypeScript
RUN if [ -f yarn.lock ]; then yarn build; else npm run build; fi

# 🚀 Етап 2: Runtime stage
FROM node:20-alpine AS production

# Створюємо non-root користувача для безпеки
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

WORKDIR /app

# Встановлюємо тільки production залежності
COPY package*.json ./
COPY yarn.lock* ./

RUN if [ -f yarn.lock ]; then \
        yarn install --frozen-lockfile --production && yarn cache clean; \
    else \
        npm ci --only=production --legacy-peer-deps && npm cache clean --force; \
    fi

# Генеруємо Prisma клієнт для production
RUN if [ -f prisma/schema.prisma ]; then npx prisma generate; fi

# Копіюємо зібраний код з builder stage
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Копіюємо prisma схему якщо є
COPY --chown=nestjs:nodejs prisma* ./prisma/

# Копіюємо package.json для метаданих
COPY --chown=nestjs:nodejs package.json ./

# Перемикаємося на non-root користувача
USER nestjs

# Виставляємо порт
EXPOSE 3001

# Перевіряємо здоров'я застосунку
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node --eval "const http = require('http'); http.get('http://localhost:3000/health', (res) => { process.exit(res.statusCode === 200 ? 0 : 1) }).on('error', () => process.exit(1))"

# Запускаємо NestJS застосунок
CMD ["node", "dist/main"]