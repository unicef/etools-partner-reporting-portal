#!/bin/bash

set -e

export DB_DUMP_LOCATION=/tmp/psql_data/db_dump.bz2

echo "*** RESTORING DATABASE $POSTGRES_DB ***"
#bzcat $DB_DUMP_LOCATION | nice pg_restore --verbose  -U $POSTGRES_USER -F t -d $POSTGRES_DB
bzcat $DB_DUMP_LOCATION | nice pg_restore --verbose  -U $POSTGRES_USER -F c -d $POSTGRES_DB

echo "*** DATABASE CREATED ***"
