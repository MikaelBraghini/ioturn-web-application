# Estágio 1: Builder - Onde instalamos as dependências e construímos o projeto
FROM node:18-alpine AS builder
# Define o diretório de trabalho dentro do container
WORKDIR /app

# Copia os arquivos de gerenciamento de pacotes
COPY package*.json ./

# Instala as dependências de produção
RUN npm install

# Copia o resto do código da aplicação
COPY . .

# Constrói a aplicação Next.js para produção
RUN npm run build

# Estágio 2: Runner - A imagem final que será executada
FROM node:18-alpine
WORKDIR /app

# Define a variável de ambiente para produção
ENV NODE_ENV=production

# Copia os artefatos da build do estágio 'builder'
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Expõe a porta que o Next.js utiliza
EXPOSE 3000

# Comando para iniciar a aplicação
CMD ["npm", "start"]