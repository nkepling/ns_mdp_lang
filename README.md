# NS-MDP Webgme implementation
## Installation
First, install the p2 following:
- [NodeJS](https://nodejs.org/en/) (LTS recommended)
- [MongoDB](https://www.mongodb.com/)
- [Docker](https://www.docker.com/)


## Docker instructions: 
```(bash)
# Clone the repository:
git clone https://github.com/nkepling/ns_mdp_lang

# We are running mongo in a separate container. To run mongo:
docker pull mongo
docker run -d -v ~/dockershare/db:/data/db --name mongo mongo'

# Build and run the Docker container:
docker build -t webgme .
docker run -d -p 8888:8888 -v ~/dockershare:/dockershare --link mongo:mongo --name=webgme webgme
```

Finally, navigate to http://localhost:8888 to start using NS-MDP !



