# 🔧 Stage 1: Build the Next.js app
FROM node:20-alpine AS builder

# Встановлюємо робочий каталог
WORKDIR /app

# Копіюємо залежності
COPY package.json package-lock.json* ./

# Встановлюємо залежності
RUN npm install --legacy-peer-deps

# Копіюємо все решту
COPY . .

# Білдимо застосунок
RUN npm run build



# 🚀 Stage 2: Запуск білду
FROM node:20-alpine AS runner

# Встановлюємо робочий каталог
WORKDIR /app

# Копіюємо тільки те, що потрібно для запуску
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/next.config.js* ./  
COPY --from=builder /app/next-env.d.ts* ./   
COPY --from=builder /app/tsconfig.json* ./   

# Експортуємо порт (Next.js використовує 3000 за замовчуванням)
EXPOSE 3000

# Запуск
CMD ["npm", "run", "start"]
