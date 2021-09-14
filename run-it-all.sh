#!/bin/bash

# TODO: Possibly build frontend here


docker-compose --file ./backend/docker-compose.yml --env-file ./.env up --build