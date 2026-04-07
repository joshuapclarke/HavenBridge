#!/usr/bin/env bash
# HavenBridge — Start both backend and frontend
# Usage: ./start.sh

set -e

CYAN='\033[0;36m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; WHITE='\033[1;37m'; DIM='\033[2m'; NC='\033[0m'

echo ""
echo -e "  ${CYAN}HavenBridge - Starting...${NC}"
echo ""

# Install frontend dependencies if needed
if [ ! -d "frontend/node_modules" ]; then
    echo -e "  ${YELLOW}Installing frontend dependencies...${NC}"
    (cd frontend && npm install)
else
    echo -e "  ${GREEN}Frontend dependencies already installed.${NC}"
fi

# Kill any leftover processes on our ports
kill_port() {
    local port=$1
    local pid
    pid=$(lsof -ti :"$port" 2>/dev/null || true)
    if [ -n "$pid" ]; then
        kill -9 $pid 2>/dev/null || true
    fi
}

kill_port 5149
kill_port 5173
sleep 1

# Start backend in background
echo -e "  ${YELLOW}Starting backend API (http://localhost:5149)...${NC}"
(cd HavenBridge.Api && dotnet run) &
BACKEND_PID=$!

sleep 3

# Start frontend in background
echo -e "  ${YELLOW}Starting frontend (http://localhost:5173)...${NC}"
(cd frontend && npm run dev) &
FRONTEND_PID=$!

echo ""
echo -e "  ${GREEN}Both servers running!${NC}"
echo -e "  ${WHITE}Frontend:  http://localhost:5173${NC}"
echo -e "  ${WHITE}Backend:   http://localhost:5149${NC}"
echo -e "  ${WHITE}Database:  MySQL (localhost:3306/havenbridge)${NC}"
echo ""
echo -e "  ${DIM}Press Ctrl+C to stop both servers.${NC}"
echo ""

cleanup() {
    echo ""
    echo -e "  ${YELLOW}Shutting down...${NC}"
    kill $FRONTEND_PID 2>/dev/null || true
    kill $BACKEND_PID 2>/dev/null || true
    wait $FRONTEND_PID 2>/dev/null || true
    wait $BACKEND_PID 2>/dev/null || true
    echo -e "  ${GREEN}Stopped.${NC}"
}

trap cleanup EXIT INT TERM

wait $BACKEND_PID
