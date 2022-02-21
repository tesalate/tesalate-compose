#!/bin/bash
# https://www.stuartellis.name/articles/shell-scripting/#enabling-better-error-handling-with-set
set -Eeuo pipefail
if [ ! -f /data/mongo-init.flag ]; then
	echo "Starting replica set initialize"
	until mongo --host mongo-0 --eval "print(\"waited for connection\")"; do
		sleep 2
	done
	echo "~~~~~~~~ Connection finished ~~~~~~~~"

	echo "******** Creating replica set ********"

	mongo -u "$MONGO_INITDB_ROOT_USERNAME" -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase "admin" --host mongo-0 <<EOF
    rs.initiate(
      {
        _id : '$MONGO_REPLICA_SET_NAME',
        members: [
					{
							"_id": 0,
							"host": "mongo-0:27017",
							"priority": 3
					},
					{
							"_id": 1,
							"host": "mongo-1:27017",
							"priority": 2
					},
					{
							"_id": 2,
							"host": "mongo-2:27017",
							"priority": 1
					}
        ]
      }
    )
EOF
	echo "$(date)" >/data/mongo-init.flag
	echo "REPLICA SET '$MONGO_REPLICA_SET_NAME' HAS BEEN CREATED"
else
	echo "Replicaset already initialized"
fi
