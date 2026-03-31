#!/bin/bash
# VEXTRO Premium Tunnel Script
# Odpala: Backend + WebApp + Expo (LAN) + Tunel Pinggy
# Usage: bash scripts/dev-tunnel.sh

echo ""
echo "  ██╗   ██╗███████╗██╗  ██╗████████╗██████╗  ██████╗ "
echo "  ██║   ██║██╔════╝╚██╗██╔╝╚══██╔══╝██╔══██╗██╔═══██╗"
echo "  ██║   ██║█████╗   ╚███╔╝    ██║   ██████╔╝██║   ██║"
echo "  ╚██╗ ██╔╝██╔══╝   ██╔██╗    ██║   ██╔══██╗██║   ██║"
echo "   ╚████╔╝ ███████╗██╔╝ ██╗   ██║   ██║  ██║╚██████╔╝"
echo "    ╚═══╝  ╚══════╝╚═╝  ╚═╝   ╚═╝   ╚═╝  ╚═╝ ╚═════╝ "
echo ""
echo "  🚀 PREMIUM TUNNEL MODE"
echo "  ======================="
echo ""

# Cleanup
pkill -f "ssh.*pinggy" 2>/dev/null
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

# 3. Start Expo (LAN mode)
echo "  📱 Starting Mobile (Expo LAN)..."
cd /workspaces/VEXTRO/frontend
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.18.2 npx expo start --lan &
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

# 5. Start Pinggy tunnel
echo ""
echo "  🌐 Uruchamiam tunel Pinggy..."
TUNNEL_OUTPUT=$(nohup ssh -p 443 -o StrictHostKeyChecking=no -R0:localhost:8081 a.pinggy.io 2>&1 &
sleep 10
cat /proc/$!/fd/1 2>/dev/null)

# Extract URL
nohup ssh -p 443 -o StrictHostKeyChecking=no -R0:localhost:8081 a.pinggy.io > /tmp/vextro_tunnel.txt 2>&1 &
TUNNEL_PID=$!
sleep 12
TUNNEL_URL=$(grep -oE "https://[a-zA-Z0-9.-]+\.pinggy\.(link|io)" /tmp/vextro_tunnel.txt | head -1)

echo ""
echo "  =========================================="
echo "  🔳 VEXTRO TUNNEL ACTIVE"
echo ""
echo "  📱 Wpisz w Expo Go (Enter URL manually):"
echo "     $TUNNEL_URL"
echo ""
echo "  🌐 WebApp: http://localhost:5173"
echo "  🖥️  Backend: http://localhost:5050"
echo "  =========================================="
echo ""
echo "  Press Ctrl+C to stop all services."

# Wait for any process to exit
cleanup() {
    echo "  🛑 Shutting down VEXTRO..."
    kill $BACKEND_PID $WEB_PID $EXPO_PID $TUNNEL_PID 2>/dev/null
    pkill -f "ssh.*pinggy" 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

wait
