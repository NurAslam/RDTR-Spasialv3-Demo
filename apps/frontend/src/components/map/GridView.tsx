'use client';

import { useStore } from '@/store/useStore';

export default function GridView() {
  const { view, rdtrList = [], selectedProvince = null, selectedKabupaten = null, setSelectedRDTR } = useStore();

  if (view !== 'grid') return null;

  // Helper function to get image path for RDTR
  const getRDTRImagePath = (rdtrName: string) => {
    if (!selectedKabupaten) return null;
    // Path: /images/{Kabupaten}/{RDTR Name}.png
    return `/images/${encodeURIComponent(selectedKabupaten)}/${encodeURIComponent(rdtrName)}.png`;
  };

  return (
    <div className="rdtr-grid-view">
      <div className="grid-header">
        <h2 id="gridTitle">
          <i className="fas fa-th-large"></i> {selectedKabupaten || 'Pilih RDTR'}
        </h2>
        <p className="grid-subtitle">
          {selectedProvince && selectedKabupaten
            ? `${selectedProvince} - ${selectedKabupaten}`
            : 'Pilih provinsi dan kabupaten/kota untuk melihat RDTR yang tersedia'}
        </p>
      </div>

      <div className="rdtr-grid-wrapper">
        <div className="rdtr-grid" id="rdtrGrid">
          {rdtrList.length === 0 ? (
            <div className="grid-empty-state">
              <i className="fas fa-arrow-left"></i>
              <p>Pilih kabupaten/kota untuk melihat RDTR yang tersedia</p>
            </div>
          ) : (
            rdtrList.map((rdtr) => (
              <div
                key={rdtr.id}
                className="rdtr-card"
                onClick={() => setSelectedRDTR(rdtr)}
              >
                <div className="rdtr-card-image">
                  <img
                    src={getRDTRImagePath(rdtr.name) || ''}
                    alt={rdtr.name}
                    className="rdtr-card-img"
                    onError={(e) => {
                      // Fallback to placeholder if image not found
                      (e.currentTarget as HTMLImageElement).style.display = 'none';
                      (e.currentTarget.nextElementSibling as HTMLElement)?.classList.remove('hidden');
                    }}
                    onLoad={(e) => {
                      // Hide placeholder when image loads
                      const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                      if (placeholder) placeholder.classList.add('hidden');
                    }}
                  />
                  <div className="rdtr-card-placeholder">
                    <i className="fas fa-map-marked-alt"></i>
                  </div>
                </div>
                <div className="rdtr-card-info">
                  <div className="rdtr-card-title">{rdtr.name}</div>
                  <div className="rdtr-card-meta">
                    {rdtr.feature_count.toLocaleString('id-ID')} features
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
