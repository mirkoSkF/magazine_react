FROM node:18-alpine
WORKDIR /app

# Installiamo le dipendenze basandoci sul package.json
COPY package*.json ./
RUN npm install

# Esponiamo la porta di Vite
EXPOSE 5173

# Avviamo in modalità sviluppo con host 0.0.0.0 per rendere
# il container accessibile dall'esterno
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173"]