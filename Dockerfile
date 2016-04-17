FROM node:5

# Create app directory
RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

# Install app dependencies
COPY package.json /usr/src/app/
RUN npm install --production

# Bundle app source
COPY . /usr/src/app

ENV NODE_ENV production
ENV PORT 80

CMD ["npm", "run", "startProduction" ]
