# https://github.com/nodejs/docker-node/blob/3b038b8a1ac8f65e3d368bedb9f979884342fdcb/6.9/Dockerfile
FROM node:18


# Use python base image with a specific version


# RUN apt-get update

# Install git, python3 and pip
RUN apt-get update && apt-get install -y \
    git \
    python3-full \
    python3-pip

# Confirm the Python version
# RUN python3 --version && pip3 --version

RUN mkdir /usr/app

WORKDIR /usr/app

# copy app source
ADD . /usr/app/

# Install the node-modules.
RUN npm install

# Webgme is a peer-dependency and needs to be installed explicitly. & Plotly.js is a peer dependency of webgme-bindings
RUN npm install webgme
RUN npm install webgme-bindings --save
RUN npm install plotly.js-dist


#Create pyhton virtual environment
RUN python3 -m venv venv

# Install the python requirements
RUN ./venv/bin/pip install --no-cache-dir webgme-bindings
RUN ./venv/bin/pip install --no-cache-dir git+https://github.com/scope-lab-vu/ns_gym.git

# Add the python virtual environment to the path
ENV PATH="/usr/app/venv/bin:${PATH}"

# Set environment variable in order to use ./config/config.docker.js.
# This could be passed at launch to if multiple ones needed
ENV NODE_ENV=docker

EXPOSE 8888

CMD ["npm", "start"]