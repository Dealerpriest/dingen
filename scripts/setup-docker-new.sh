#!/bin/bash


# Function to display commands
exe() { echo "\$ $@" ; "$@" ; }
say() { echo '#############'; echo "\$ $@" ; echo '#############';}

curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

say 'Installing docker compose'
exe curl -L "https://github.com/docker/compose/releases/download/1.26.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
say 'Giving docker compose permission to execute'
exe chmod +x /usr/local/bin/docker-compose

say 'Creating a directory for mounting docker persistent volumes'
exe mkdir ~/docker-persistence
say 'Give ownership to container user (UID 1001) and docker group'
exe chown 1001:docker ~/docker-persistence/
say 'Give read & write access to groups attached to folder'
exe chmod g+rw ~/docker-persistence