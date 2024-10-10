FROM node:lts

WORKDIR /app
COPY . .

RUN npm i --no-audit --unsafe-perm

CMD ["npm", "start"]