# Backup Strategy

## MongoDB

Backup:
mongodump --uri=$MONGO_URI

Restore:
mongorestore --uri=$MONGO_URI <backup-folder>

## Redis Persistence

RDB:
- Snapshot-based
- Faster
- Possible data loss window

AOF:
- Append-only file
- Safer
- Larger size

Production: Enable both RDB + AOF.