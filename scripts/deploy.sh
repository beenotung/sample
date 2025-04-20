#!/bin/bash
set -e
set -o pipefail

source ./scripts/config

if [ -z "$server" ]; then
  echo "Error: 'server' must be set in config"
  exit 1
fi

if [ -z "$project_dir" ]; then
  echo "Error: 'project_dir' must be set in config"
  exit 1
fi

if [ -z "$pm2_name" ]; then
  echo "Error: 'pm2_name' must be set in config"
  exit 1
fi

npm run build

rsync -SavLP \
  package.json \
	dist \
	"$server:${project_dir}"

ssh "$server" "
  source ~/.nvm/nvm.sh && \
  cd ${project_dir} && \
	pnpm install --prod && \
	cp .env dist && \
	cd dist && \
	npx knex migrate:latest && \
	pm2 restart ${pm2_name}
"
