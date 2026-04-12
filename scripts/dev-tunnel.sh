#!/bin/bash
# VEXTRO Pure LAN Start Script
# Odpala: Backend + WebApp + Expo (LAN, Cache Purged)
# Usage: bash scripts/dev-tunnel.sh

echo ""
echo "  ██╗   ██╗███████╗██╗  ██╗████████╗██████╗  ██████╗ "
echo "  ██║   ██║██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔═══██╗"
echo "  ██║   ██║█████╗   ╚███╔╝    ██║   ██████╔╝██║   ██║"
echo "  ╚██╗ ██╔╝██╔══╝   ██╔██╗    ██║   ██╔══██╗██║   ██║"
echo "   ╚████╔╝ ███████╗██╔╝ ██╗   ██║   ██║  ██║╚██████╔╝"
echo "    ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ "
echo ""
echo "  🚀 PURE LAN MODE (NATIVE ROUTING)"
echo "  ================================="
echo ""

# Cleanup
pkill -f "nodemon" 2>/dev/null

# 1. Start Backend
echo "  🖥️  Starting Backend (port 5050)..."
cd /workspaces/VEXTRO
npm run dev:backend &
BACKEND_PID=$!
sleep 3

# 2. Start WebApp
echo "  🌐 Starting WebApp (port 5173)..."
npm run dev:web &
WEB_PID=$!
sleep 2

# 3. Start Expo (LAN mode + Purge Cache)
echo "  📱 Starting Mobile (Expo LAN)..."
cd /workspaces/VEXTRO/frontend
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.18.2 npx expo start --lan -c &
EXPO_PID=$!

# 4. Wait for Metro
echo "  ⏳ Czekam na Metro Bundler..."
for i in $(seq 1 90); do
    if curl -s http://localhost:8081/status 2>/dev/null | grep -q "packager-status:running"; then
        echo "  ✅ Metro Bundler ONLINE!"
        break
    fi
    sleep 2
done

echo ""
echo "  =========================================="
echo "  🔳 VEXTRO LAN ENVIRONMENT ACTIVE"
echo ""
echo "  🌐 WebApp: http://192.168.18.2:5173"
echo "  🖥️  Backend: http://192.168.18.2:5050"
echo "  📱 Expo URL do zeskanowania:"
echo "     exp://192.168.18.2:8081"
echo "  =========================================="
echo ""
echo "  Press Ctrl+C to stop all services."

# Wait for any process to exit
cleanup() {
    echo "  🛑 Shutting down VEXTRO processes..."
    kill $BACKEND_PID $WEB_PID $EXPO_PID 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

wait