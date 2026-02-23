# Usa uma imagem oficial do Node.js
FROM node:18

# Cria o diretório de trabalho dentro do servidor
WORKDIR /usr/src/app

# Copia os arquivos de dependências
COPY package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código do seu back-end
COPY . .

# Expõe a porta que seu servidor usa
EXPOSE 3000

# Comando para rodar o servidor
CMD ["node", "server.js"]