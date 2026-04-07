#!/usr/bin/env bash
# HavenBridge — Reset the MySQL database
# Drops and recreates the database so it gets re-seeded from CSV files on next startup.
# Usage: ./reset-db.sh

set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; DIM='\033[2m'; NC='\033[0m'

echo ""
echo -e "  ${CYAN}HavenBridge - Database Reset (MySQL)${NC}"
echo ""

# Stop the backend if running
BACKEND_PID=$(pgrep -f "HavenBridge.Api" 2>/dev/null || true)
if [ -n "$BACKEND_PID" ]; then
    echo -e "  ${YELLOW}Stopping running backend...${NC}"
    kill $BACKEND_PID 2>/dev/null || true
    sleep 2
fi

# Read connection details from appsettings.json
CONFIG_PATH="HavenBridge.Api/appsettings.json"
if [ ! -f "$CONFIG_PATH" ]; then
    echo -e "  ${RED}ERROR - Cannot find $CONFIG_PATH${NC}"
    exit 1
fi

# Parse connection string from JSON (works with macOS and Linux)
CONN_STR=$(python3 -c "
import json, sys
with open('$CONFIG_PATH') as f:
    print(json.load(f)['ConnectionStrings']['DefaultConnection'])
" 2>/dev/null || node -e "
const fs = require('fs');
const cfg = JSON.parse(fs.readFileSync('$CONFIG_PATH','utf8'));
console.log(cfg.ConnectionStrings.DefaultConnection);
" 2>/dev/null)

if [ -z "$CONN_STR" ]; then
    echo -e "  ${RED}ERROR - Could not parse connection string from $CONFIG_PATH${NC}"
    exit 1
fi

# Parse key=value pairs from connection string
SERVER="localhost"
PORT="3306"
USER="root"
PASSWORD=""
DATABASE="havenbridge"

IFS=';' read -ra PARTS <<< "$CONN_STR"
for part in "${PARTS[@]}"; do
    key=$(echo "$part" | cut -d'=' -f1 | tr '[:upper:]' '[:lower:]' | xargs)
    val=$(echo "$part" | cut -d'=' -f2- | xargs)
    case "$key" in
        server)   SERVER="$val" ;;
        port)     PORT="$val" ;;
        user)     USER="$val" ;;
        password) PASSWORD="$val" ;;
        database) DATABASE="$val" ;;
    esac
done

echo -e "  ${YELLOW}Dropping and recreating database '$DATABASE'...${NC}"

# Find mysql executable
MYSQL_CMD=$(command -v mysql 2>/dev/null || true)
if [ -z "$MYSQL_CMD" ]; then
    # Common Homebrew locations on macOS
    for candidate in \
        /usr/local/mysql/bin/mysql \
        /opt/homebrew/bin/mysql \
        /usr/local/bin/mysql \
        /opt/homebrew/opt/mysql/bin/mysql \
        /opt/homebrew/opt/mysql-client/bin/mysql; do
        if [ -x "$candidate" ]; then
            MYSQL_CMD="$candidate"
            break
        fi
    done
fi

if [ -z "$MYSQL_CMD" ]; then
    echo -e "  ${RED}ERROR - Could not find 'mysql'. Install MySQL and add it to PATH.${NC}"
    echo -e "  ${DIM}  macOS: brew install mysql${NC}"
    echo -e "  ${DIM}  Linux: sudo apt install mysql-client${NC}"
    exit 1
fi

MYSQL_ARGS=(-h "$SERVER" -P "$PORT" -u "$USER")
if [ -n "$PASSWORD" ]; then
    MYSQL_ARGS+=("--password=$PASSWORD")
fi

if "$MYSQL_CMD" "${MYSQL_ARGS[@]}" -e \
    "DROP DATABASE IF EXISTS \`$DATABASE\`; CREATE DATABASE \`$DATABASE\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>/dev/null; then
    echo -e "  ${GREEN}OK - Database '$DATABASE' reset successfully.${NC}"
else
    echo -e "  ${RED}ERROR - MySQL command failed. Is MySQL running and are your credentials correct?${NC}"
    echo -e "  ${DIM}    Connection: ${SERVER}:${PORT} as $USER${NC}"
    exit 1
fi

echo ""
echo -e "  ${GREEN}Done! The database will be re-created from CSV seed data${NC}"
echo -e "  ${GREEN}the next time you start the backend.${NC}"
echo ""
