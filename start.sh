#!/bin/bash

echo "Starting HACKX 2025 Application..."
echo

echo "Installing client dependencies..."
cd client
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install client dependencies"
    exit 1
fi

echo
echo "Installing server dependencies..."
cd ../server
npm install
if [ $? -ne 0 ]; then
    echo "Failed to install server dependencies"
    exit 1
fi

echo
echo "Starting servers..."
echo "Server will run on http://localhost:5000"
echo "Client will run on http://localhost:3000"
echo
echo "Press Ctrl+C to stop both servers"

# Start server in background
npm start &
SERVER_PID=$!

# Start client in background
cd ../client
npm start &
CLIENT_PID=$!

echo "Both servers are starting..."
echo "Server PID: $SERVER_PID"
echo "Client PID: $CLIENT_PID"

# Wait for both processes
wait $SERVER_PID $CLIENT_PID
