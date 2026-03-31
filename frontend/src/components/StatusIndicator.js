// # Ścieżka: /workspaces/VEXTRO/frontend/src/components/StatusIndicator.js
import React from 'react';
import { Text, StyleSheet, Platform } from 'react-native'; // <--- DODANO Platform

const StatusIndicator = ({ status }) => {
  const statusMap = {
    sending: { symbol: '[ ]', color: '#444' },
    sent: { symbol: '[-]', color: '#BBB' },
    delivered: { symbol: '[=]', color: '#FFF' },
    read: { symbol: '[≡]', color: '#B026FF' },
  };

  const current = statusMap[status] || statusMap.sending;

  return (
    <Text style={[styles.text, { color: current.color }]}>
      {current.symbol}
    </Text>
  );
};

const styles = StyleSheet.create({
  text: {
    fontSize: 10,
    // Bezpieczne użycie Platform
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginLeft: 5,
    fontWeight: '900',
  },
});

export default StatusIndicator;