import React from 'react';
import { BRASAO_ARUJA_BASE64 } from '../assets/brasaoBase64';

interface BrasaoProps {
  className?: string;
  size?: number;
}

export const BrasaoAruja: React.FC<BrasaoProps> = ({ className = 'w-24 h-auto', size }) => {
  return (
    <img
      src={BRASAO_ARUJA_BASE64}
      alt="Brasão Oficial do Município de Arujá"
      style={size ? { width: `${size}px`, height: 'auto' } : undefined}
      className={`object-contain select-none ${className}`}
      loading="eager"
      crossOrigin="anonymous"
    />
  );
};
