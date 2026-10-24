# Exercise 1.1

This application generates a random UUID when it starts and prints it with a timestamp every five seconds.

# what i used

- Node.js
- Docker
- Kubernetes
- k3d

# Docker image

docker build -t log-output:1.1 .

# Deploy to Kubernetes

Import the image into the local k3d cluster:

k3d image import log-output:1.1 -c k3s-default

Create deployment:

kubectl create deployment log-output --image=log-output:1.1

Set the image pull policy:

kubectl patch deployment log-output -p '{"spec":{"template":{"spec":{"containers":[{"name":"log-output","imagePullPolicy":"IfNotPresent"}]}}}}'

# application logs

kubectl logs -f deployment/log-output
The application prints a timestamp and the same UUID every five seconds.
