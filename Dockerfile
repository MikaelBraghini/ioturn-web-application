# Dockerfile Padrão para Next.js

# 1. Estágio de Build: Compilar a aplicação
FROM node:20-alpine AS builder

# Define o diretório de trabalho dentro do contêiner
WORKDIR /app

# Copia os arquivos de dependência e instala (aproveitando o cache do Docker)
COPY package*.json ./
RUN npm ci

# Copia o resto do código da aplicação
COPY . .

# Executa o build da aplicação Next.js
RUN npm run build

# 2. Estágio de Produção: Servir a aplicação compilada
FROM node:20-alpine AS runner

WORKDIR /app

# Cria um usuário e grupo não-root para segurança
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Copia apenas os artefatos necessários do estágio de build
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Define o usuário não-root
USER nextjs

# Expõe a porta que o Next.js usa
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]