FROM node:lts

WORKDIR /shared
COPY ./tmp .

WORKDIR /app
COPY . .
RUN rm -R tmp

RUN npm i --no-audit --unsafe-perm

CMD ["npm", "start"]