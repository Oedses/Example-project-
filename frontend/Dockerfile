FROM node:lts as build

WORKDIR /shared
COPY ./tmp .

WORKDIR /app
COPY ./ ./
RUN rm -R tmp
RUN yarn && \
    yarn run build

FROM nginx as run
WORKDIR /www/data
COPY --from=build /app/build ./
ADD ./server.conf /etc/nginx/conf.d/
RUN rm -f /etc/nginx/conf.d/default.conf