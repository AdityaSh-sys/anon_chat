import React from 'react';
import { Wifi, WifiOff, Loader } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  isReconnecting?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  isConnected, 
  isReconnecting = false 
}) => {
  if (isConnected) {
    return (
      <div className="flex items-center gap-1 text-green-300 text-xs">
        <Wifi size={12} />
        <span>Connected</span>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="flex items-center gap-1 text-yellow-300 text-xs">
        <Loader size={12} className="animate-spin" />
        <span>Reconnecting...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1 text-red-300 text-xs">
      <WifiOff size={12} />
      <span>Disconnected</span>
    </div>
  );
};