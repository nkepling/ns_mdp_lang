#!/bin/zsh

# Stop the container if it's running
echo "Stopping the 'webgme' container..."
docker stop webgme

# Remove the container
echo "Removing the 'webgme' container..."
docker rm webgme

# Build the Docker image
echo "Building the Docker image 'webgme'..."
docker build -t webgme .

# Run the Docker container
echo "Running the Docker container 'webgme'..."
docker run -d -p 8888:8888 -v ~/dockershare:/dockershare --link mongo:mongo --name=webgme -e GME_ADMIN="admin:admin" webgme 

echo "Docker operations completed successfully!"

