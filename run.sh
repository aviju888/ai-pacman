#!/bin/bash

# AI-Pacman Full Stack Runner
# Usage: ./run.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${CYAN}================================================${NC}"
    echo -e "${CYAN}     AI-Pacman: Reinforcement Learning Demo${NC}"
    echo -e "${CYAN}================================================${NC}"
    echo
}

print_usage() {
    echo -e "${YELLOW}Usage:${NC} ./run.sh [command]"
    echo
    echo -e "${GREEN}Commands:${NC}"
    echo "  dev            Start both backend and frontend in development mode"
    echo "  backend        Start only the Flask API server"
    echo "  frontend       Start only the frontend dev server"
    echo "  install        Install all dependencies (Python + npm)"
    echo "  pacman         Run Pacman game directly (no web interface)"
    echo "  gridworld      Run Gridworld demo directly"
    echo "  test           Run autograder tests"
    echo "  help           Show this help message"
    echo
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./run.sh dev              # Start full stack development"
    echo "  ./run.sh backend          # Start API server only"
    echo "  ./run.sh frontend         # Start frontend only"
    echo "  ./run.sh install          # Install all dependencies"
    echo
    echo -e "${GREEN}Quick Start:${NC}"
    echo "  1. ./run.sh install       # First time setup"
    echo "  2. ./run.sh dev           # Start the demo"
    echo "  3. Open http://localhost:3000 in your browser"
    echo
}

check_python() {
    if command -v python3 &> /dev/null; then
        PYTHON=python3
    elif command -v python &> /dev/null; then
        PYTHON=python
    else
        echo -e "${RED}Error: Python is not installed${NC}"
        exit 1
    fi
    echo -e "${GREEN}Python:${NC} $($PYTHON --version)"
}

check_node() {
    if ! command -v node &> /dev/null; then
        echo -e "${RED}Error: Node.js is not installed${NC}"
        echo "Please install Node.js from https://nodejs.org/"
        exit 1
    fi
    echo -e "${GREEN}Node.js:${NC} $(node --version)"
}

install_backend() {
    echo -e "${YELLOW}Installing backend dependencies...${NC}"
    cd "$SCRIPT_DIR/backend"
    $PYTHON -m pip install -r requirements.txt
    echo -e "${GREEN}Backend dependencies installed!${NC}"
}

install_frontend() {
    echo -e "${YELLOW}Installing frontend dependencies...${NC}"
    cd "$SCRIPT_DIR/frontend"
    npm install
    echo -e "${GREEN}Frontend dependencies installed!${NC}"
}

install_all() {
    check_python
    check_node
    install_backend
    install_frontend
    echo
    echo -e "${GREEN}All dependencies installed successfully!${NC}"
    echo -e "Run ${CYAN}./run.sh dev${NC} to start the development servers."
}

run_backend() {
    echo -e "${GREEN}Starting Flask API server on http://localhost:5000${NC}"
    cd "$SCRIPT_DIR/backend"
    $PYTHON api.py
}

run_frontend() {
    echo -e "${GREEN}Starting frontend dev server on http://localhost:3000${NC}"
    cd "$SCRIPT_DIR/frontend"
    npm run dev
}

run_dev() {
    echo -e "${GREEN}Starting development servers...${NC}"
    echo -e "${YELLOW}Backend:${NC} http://localhost:5000"
    echo -e "${YELLOW}Frontend:${NC} http://localhost:3000"
    echo
    echo -e "${CYAN}Press Ctrl+C to stop both servers${NC}"
    echo

    # Start backend in background
    cd "$SCRIPT_DIR/backend"
    $PYTHON api.py &
    BACKEND_PID=$!

    # Give backend time to start
    sleep 2

    # Start frontend in foreground
    cd "$SCRIPT_DIR/frontend"
    npm run dev &
    FRONTEND_PID=$!

    # Wait for either to exit
    trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
    wait
}

run_pacman() {
    echo -e "${GREEN}Starting Pacman game...${NC}"
    cd "$SCRIPT_DIR/backend"
    shift_args="${@:2}"
    $PYTHON pacman.py $shift_args
}

run_gridworld() {
    echo -e "${GREEN}Starting Gridworld demo...${NC}"
    cd "$SCRIPT_DIR/backend"
    shift_args="${@:2}"
    $PYTHON gridworld.py $shift_args
}

run_tests() {
    echo -e "${GREEN}Running autograder tests...${NC}"
    cd "$SCRIPT_DIR/backend"
    $PYTHON autograder.py "$@"
}

# Main entry point
print_header

case "${1:-help}" in
    dev)
        check_python
        check_node
        run_dev
        ;;
    backend)
        check_python
        run_backend
        ;;
    frontend)
        check_node
        run_frontend
        ;;
    install)
        install_all
        ;;
    pacman)
        check_python
        run_pacman "$@"
        ;;
    gridworld)
        check_python
        run_gridworld "$@"
        ;;
    test)
        check_python
        shift
        run_tests "$@"
        ;;
    help|--help|-h)
        print_usage
        ;;
    *)
        echo -e "${RED}Unknown command: $1${NC}"
        print_usage
        exit 1
        ;;
esac
