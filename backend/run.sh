#!/bin/bash

# AI-Pacman Backend Runner Script
# Usage: ./run.sh [command]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "${BLUE}================================================${NC}"
    echo -e "${BLUE}        AI-Pacman Backend Runner${NC}"
    echo -e "${BLUE}================================================${NC}"
    echo
}

print_usage() {
    echo -e "${YELLOW}Usage:${NC} ./run.sh [command]"
    echo
    echo -e "${GREEN}Commands:${NC}"
    echo "  api          Start the Flask API server (default)"
    echo "  pacman       Run Pacman game directly"
    echo "  gridworld    Run Gridworld demo"
    echo "  test         Run autograder tests"
    echo "  install      Install Python dependencies"
    echo "  help         Show this help message"
    echo
    echo -e "${GREEN}Examples:${NC}"
    echo "  ./run.sh                    # Start API server"
    echo "  ./run.sh api                # Start API server"
    echo "  ./run.sh pacman             # Run Pacman interactively"
    echo "  ./run.sh gridworld          # Run Gridworld demo"
    echo "  ./run.sh test               # Run all tests"
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
    echo -e "${GREEN}Using Python:${NC} $($PYTHON --version)"
}

install_deps() {
    echo -e "${YELLOW}Installing dependencies...${NC}"
    $PYTHON -m pip install -r requirements.txt
    echo -e "${GREEN}Dependencies installed successfully!${NC}"
}

run_api() {
    echo -e "${GREEN}Starting API server on http://localhost:5000${NC}"
    echo -e "${YELLOW}Press Ctrl+C to stop${NC}"
    echo
    $PYTHON api.py
}

run_pacman() {
    echo -e "${GREEN}Starting Pacman game...${NC}"
    shift_args="${@:2}"
    $PYTHON pacman.py $shift_args
}

run_gridworld() {
    echo -e "${GREEN}Starting Gridworld demo...${NC}"
    shift_args="${@:2}"
    $PYTHON gridworld.py $shift_args
}

run_tests() {
    echo -e "${GREEN}Running autograder tests...${NC}"
    $PYTHON autograder.py "$@"
}

# Main entry point
print_header
check_python

case "${1:-api}" in
    api)
        run_api
        ;;
    pacman)
        run_pacman "$@"
        ;;
    gridworld)
        run_gridworld "$@"
        ;;
    test)
        shift
        run_tests "$@"
        ;;
    install)
        install_deps
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
