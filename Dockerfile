FROM node:22-alpine3.19
RUN mkdir -p /opt/app
WORKDIR /opt/app
COPY package.json yarn.lock .
RUN yarn install
COPY . .
CMD [ "npm", "start"]
