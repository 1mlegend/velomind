FROM node:18-slim

RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY prisma ./prisma
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate

COPY . .
RUN npm run build

EXPOSE 3001

CMD npx prisma db push --accept-data-loss && node dist/index.js
