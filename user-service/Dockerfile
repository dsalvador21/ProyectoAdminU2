# Dockerfile
FROM node:18

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto del código
COPY . .

# Exponer el puerto (lo mismo que usa Express)
EXPOSE 3000

# Comando por defecto
CMD ["npm", "start"]
