#!/usr/bin/env bash
set -e

export JAVA_HOME=/nix/store/z8k0md5rbj2m415705kpb4fihp8kcd11-openjdk-headless-21.0.7+6
export PATH=$JAVA_HOME/bin:$PATH

JDBC_URL="jdbc:postgresql://${PGHOST}:${PGPORT}/${PGDATABASE}"

echo "Starting ZeroFuel Spring Boot backend on port 8080..."
echo "Database: $JDBC_URL"

exec java -jar /home/runner/workspace/backend/target/zerofuel-backend-0.1.0-SNAPSHOT.jar \
  --spring.datasource.url="$JDBC_URL" \
  --spring.datasource.username="$PGUSER" \
  --spring.datasource.password="$PGPASSWORD" \
  --server.port=8080
