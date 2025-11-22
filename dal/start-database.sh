docker run -d \
  --name salavat-madrese-db \
  -e POSTGRES_USER="postgres" \
  -e POSTGRES_PASSWORD="Super3ecretPassword" \
  -e POSTGRES_DB="pgdb" \
  -p "54368":5432 \
  docker.arvancloud.ir/postgres
