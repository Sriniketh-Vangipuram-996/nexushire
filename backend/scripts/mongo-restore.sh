#!/bin/bash

if [ -z "$1" ]; then
  echo "Usage: ./mongo-restore.sh <backup-folder>"
  exit 1
fi

mongorestore --uri="$MONGO_URI" $1