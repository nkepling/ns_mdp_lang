# https://github.com/nodejs/docker-node/blob/3b038b8a1ac8f65e3d368bedb9f979884342fdcb/6.9/Dockerfile
FROM node:18

# RUN apt-get update

# Install git
RUN apt-get install -y git

RUN mkdir /usr/app

WORKDIR /usr/app

# copy app source
ADD . /usr/app/

# Install the node-modules.
RUN npm install

# Webgme is a peer-dependency and needs to be installed explicitly.
RUN npm install webgme

# Set environment variable in order to use ./config/config.docker.js.
# This could be passed at launch to if multiple ones needed
ENV NODE_ENV docker

EXPOSE 8888

CMD ["npm", "start"]