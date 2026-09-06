import React from 'react';
import { Landmark } from 'lucide-react';

interface BankLogoProps {
  bankName: string;
  size?: number;
}

export const BankLogo: React.FC<BankLogoProps> = ({ bankName, size = 44 }) => {
  const name = bankName.toLowerCase();

  // CANARA BANK
  if (name.includes('canara')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#004A8F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 74, 143, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 100 100" fill="none">
          {/* Canara Bank Iconic Interlocking Triangles in Cyan & Yellow */}
          <polygon points="15,75 50,20 85,75" fill="#FFCC00" />
          <polygon points="25,85 50,38 75,85" fill="#00A0E3" opacity="0.95" />
          <polygon points="35,68 50,42 65,68" fill="#004A8F" />
        </svg>
      </div>
    );
  }

  // BANK OF BARODA
  if (name.includes('baroda')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#F37021',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(243, 112, 33, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 100 100" fill="none">
          {/* Baroda Sun Emblem with rays */}
          <circle cx="50" cy="50" r="38" stroke="#ffffff" strokeWidth="6" />
          <path
            d="M50 20 L50 80 M20 50 L80 50 M29 29 L71 71 M29 71 L71 29"
            stroke="#ffffff"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="50" cy="50" r="14" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // HDFC BANK
  if (name.includes('hdfc')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#004C8F',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 76, 143, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100" fill="none">
          {/* HDFC Geometric Red & Blue Cross */}
          <rect x="12" y="12" width="76" height="76" rx="8" fill="#004C8F" />
          <rect x="36" y="18" width="28" height="64" fill="#ED232A" />
          <rect x="18" y="36" width="64" height="28" fill="#ED232A" />
          <rect x="36" y="36" width="28" height="28" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // STATE BANK OF INDIA (SBI)
  if (name.includes('sbi') || name.includes('state bank')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#00A1E0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(0, 161, 224, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.72} height={size * 0.72} viewBox="0 0 100 100" fill="none">
          {/* SBI Famous Blue Keyhole Token */}
          <circle cx="50" cy="50" r="42" fill="#ffffff" />
          <circle cx="50" cy="46" r="16" fill="#00A1E0" />
          <rect x="44" y="46" width="12" height="46" fill="#00A1E0" />
        </svg>
      </div>
    );
  }

  // ICICI BANK
  if (name.includes('icici')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#B02A30',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(176, 42, 48, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100" fill="none">
          {/* ICICI Orange/Red 'i' emblem */}
          <circle cx="50" cy="30" r="12" fill="#F58220" />
          <path d="M38 52 C38 48, 62 48, 62 52 L62 82 C62 88, 38 88, 38 82 Z" fill="#ffffff" />
        </svg>
      </div>
    );
  }

  // AXIS BANK
  if (name.includes('axis')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#861F41',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(134, 31, 65, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100" fill="none">
          {/* Axis Bank Maroon Triangle 'A' */}
          <polygon points="50,15 88,85 64,85 50,54 36,85 12,85" fill="#ffffff" />
          <polygon points="50,28 72,75 58,75 50,58 42,75 28,75" fill="#861F41" />
        </svg>
      </div>
    );
  }

  // KOTAK MAHINDRA BANK
  if (name.includes('kotak')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#ED1B24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(237, 27, 36, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100" fill="none">
          {/* Kotak Infinity Curve */}
          <path
            d="M32 50 C22 36, 14 64, 32 64 C46 64, 54 36, 68 36 C86 36, 78 64, 68 64 C54 64, 46 36, 32 50 Z"
            stroke="#ffffff"
            strokeWidth="9"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </div>
    );
  }

  // PUNJAB NATIONAL BANK (PNB)
  if (name.includes('pnb') || name.includes('punjab')) {
    return (
      <div
        style={{
          width: size,
          height: size,
          borderRadius: size * 0.22,
          background: '#A20A3A',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 2px 8px rgba(162, 10, 58, 0.25)',
          flexShrink: 0
        }}
      >
        <svg width={size * 0.7} height={size * 0.7} viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="38" stroke="#FFD200" strokeWidth="6" fill="none" />
          <path d="M35 30 L50 65 L65 30" stroke="#ffffff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        </svg>
      </div>
    );
  }

  // DEFAULT / GENERIC BANK
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size * 0.22,
        background: 'rgba(226, 195, 153, 0.15)',
        border: '1px solid rgba(226, 195, 153, 0.3)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--primary)',
        flexShrink: 0
      }}
    >
      <Landmark size={size * 0.52} />
    </div>
  );
};
