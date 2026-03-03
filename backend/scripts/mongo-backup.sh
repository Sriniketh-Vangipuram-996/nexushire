#!/bin/bash

DATE=$(date +%F-%H-%M)
BACKUP_DIR="./backups/$DATE"

mkdir -p $BACKUP_DIR

mongodump --uri="$MONGO_URI" --out=$BACKUP_DIR

echo "Mongo backup completed at $BACKUP_DIR"