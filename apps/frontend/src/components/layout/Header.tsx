'use client';

import { useStore } from '@/store/useStore';

export default function Header() {
  const { summary = null } = useStore();

  const totalRDTR = summary?.areas.length || 0;
  const totalFeatures = summary?.total_features || 0;

  return (
    <header className="header">
      <div className="header-right">
        <div className="header-stats">
          <div className="stat-item">
            <i className="fas fa-layer-group"></i>
            <span>{totalRDTR}</span>
          </div>
          <div className="stat-item">
            <i className="fas fa-map"></i>
            <span>{totalFeatures.toLocaleString('id-ID')}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
