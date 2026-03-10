'use client';

import { useState } from 'react';
import { useStore } from '@/store/useStore';

// Zone colors from Permen ATR BPN 11/2023
const getZoneColor = (zone: string): string => {
  const colors: Record<string, string> = {
    'P': '#FFBE00',
    'C': '#F05500',
    'I': '#690000',
    'HL': '#325F28',
    'H': '#416900',
    'BJ': '#EB1E1E',
    'BA': '#97DBF2',
    'S': '#7D197D',
    'W': '#FFA5FF',
    'T': '#D73700',
    'SP': '#00BCD4',
    'SD': '#8D6E63',
    'ST': '#607D8B',
    'SL': '#A1887F',
  };
  return colors[zone] || '#BDBDBD';
};

// Get kawasan status class
const getKawasanStatusClass = (value: any): string => {
  if (value === 'Ya' || value === 'YA' || value === '1' || value === 1 || value === true) return 'ya';
  if (value === 'Tidak' || value === 'TIDAK' || value === '0' || value === 0 || value === false) return 'tidak';
  return '';
};

// Format array values
const formatArrayValue = (value: any): string => {
  if (Array.isArray(value)) {
    if (value.length === 0) return '-';
    if (value.length === 1 && value[0] === '-') return '-';
    return value.join(', ');
  }
  return value || '-';
};

// Get display value
const getDisplayValue = (value: any): string => {
  if (value === null || value === undefined) return '-';
  if (Array.isArray(value)) {
    const filtered = value.filter((v) => v && v !== '-');
    return filtered.length > 0 ? filtered.join(', ') : '-';
  }
  return String(value);
};

export default function DetailPanel() {
  const { view, selectedFeature, selectedCoords, activeDetailTab = 'identitas', setActiveDetailTab } = useStore();
  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    izin: false,
    terbatas: false,
    bersyarat: false,
    terbatasBersyarat: false,
  });

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Only show on map view
  if (view !== 'map') return null;

  const feature = selectedFeature;

  return (
    <div className="sidebar-right">
      <div className="sidebar-header">
        <h2>
          <i className="fas fa-info-circle"></i> Detail Polygon
        </h2>
      </div>

      <div className="sidebar-content">
        {/* Welcome State */}
        {!feature ? (
          <div className="welcome-state" id="detailWelcome">
            <div className="welcome-icon">
              <i className="fas fa-mouse-pointer"></i>
            </div>
            <h3>Klik Area di Peta</h3>
            <p>Klik pada polygon di peta untuk melihat detail informasi lengkap</p>
          </div>
        ) : (
          <div className="detail-content" id="detailContent">
            {/* Header Card */}
            <div className="detail-header-card">
              <div className="detail-header-icon">
                <i className="fas fa-layer-group"></i>
              </div>
              <div className="detail-header-info">
                <div className="detail-header-subtitle">Sub Zona</div>
                <div className="detail-header-title" id="infoTitle">
                  {feature.NAMSZN || feature.NAMZON || feature.NAMOBJ || '-'}
                </div>
                <div className="detail-header-badges">
                  <div className="detail-header-badge" id="infoZoneBadge">
                    {feature.KODZON || '-'}
                  </div>
                  <div className="detail-header-badge" id="infoSubZoneBadge">
                    {feature.KODSZN || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* Coordinate Info */}
            {selectedCoords && (
              <div className="coord-info-card">
                <div className="coord-info-title">
                  <i className="fas fa-map-marker-alt"></i>
                  Koordinat yang Dipilih
                </div>
                <div className="coord-info-grid">
                  <div className="coord-item">
                    <span className="coord-label">Latitude</span>
                    <span className="coord-value" id="infoLat">
                      {selectedCoords.lat.toFixed(6)}
                    </span>
                  </div>
                  <div className="coord-item">
                    <span className="coord-label">Longitude</span>
                    <span className="coord-value" id="infoLng">
                      {selectedCoords.lng.toFixed(6)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Info Grid */}
            {feature.WADMKC && (
              <div className="quick-info-grid">
                <div className="quick-info-card">
                  <div className="quick-info-icon">
                    <i className="fas fa-map-marker-alt"></i>
                  </div>
                  <div className="quick-info-content">
                    <div className="quick-info-value" id="infoKecamatan">
                      {feature.WADMKC}
                    </div>
                    <div className="quick-info-label">Kecamatan</div>
                  </div>
                </div>
              </div>
            )}

            {/* Nested Tabs */}
            <div className="nested-tabs-container">
              <div className="nested-tabs-header">
                <button
                  className={`nested-tab-btn ${activeDetailTab === 'identitas' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('identitas')}
                >
                  <i className="fas fa-tag"></i>
                  <span>Identitas</span>
                </button>
                <button
                  className={`nested-tab-btn ${activeDetailTab === 'lokasi' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('lokasi')}
                >
                  <i className="fas fa-map-marker-alt"></i>
                  <span>Lokasi</span>
                </button>
                <button
                  className={`nested-tab-btn ${activeDetailTab === 'parameter' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('parameter')}
                >
                  <i className="fas fa-building"></i>
                  <span>Parameter</span>
                </button>
                <button
                  className={`nested-tab-btn ${activeDetailTab === 'kegiatan' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('kegiatan')}
                >
                  <i className="fas fa-tasks"></i>
                  <span>Kegiatan</span>
                </button>
                <button
                  className={`nested-tab-btn ${activeDetailTab === 'kawasan' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('kawasan')}
                >
                  <i className="fas fa-shield-alt"></i>
                  <span>Kawasan</span>
                </button>
                <button
                  className={`nested-tab-btn ${activeDetailTab === 'dokumen' ? 'active' : ''}`}
                  onClick={() => setActiveDetailTab('dokumen')}
                >
                  <i className="fas fa-file-contract"></i>
                  <span>Dokumen</span>
                </button>
              </div>

              <div className="nested-tabs-content">
                {/* Tab: Identitas */}
                <div
                  className={`nested-tab-content ${activeDetailTab === 'identitas' ? 'active' : ''}`}
                  id="nested-tab-identitas"
                >
                  <div className="nested-tab-panel">
                    <div className="info-grid">
                      <div className="info-item-half">
                        <span className="info-label-small">Kode Zona</span>
                        <span className="info-value-highlight" id="infoKodZon">
                          {feature.KODZON || '-'}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Nama Zona</span>
                        <span className="info-value" id="infoNamZon">
                          {feature.NAMZON || '-'}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Kode Sub Zona</span>
                        <span className="info-value-highlight" id="infoKodSzn">
                          {feature.KODSZN || '-'}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Nama Sub Zona</span>
                        <span className="info-value" id="infoNamSzn">
                          {feature.NAMSZN || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab: Lokasi */}
                <div
                  className={`nested-tab-content ${activeDetailTab === 'lokasi' ? 'active' : ''}`}
                  id="nested-tab-lokasi"
                >
                  <div className="nested-tab-panel">
                    <div className="info-grid">
                      <div className="info-item-full">
                        <span className="info-label-small">Provinsi</span>
                        <span className="info-value" id="infoProvinsi">
                          {feature.WADMPR || feature.CITY_NAME?.replace('Kab. ', 'Kabupaten ')?.replace('Kota ', 'Kota ') || '-'}
                        </span>
                      </div>
                      <div className="info-item-full">
                        <span className="info-label-small">Kabupaten/Kota</span>
                        <span className="info-value" id="infoKabupaten">
                          {feature.CITY_NAME || feature.WADMKK || '-'}
                        </span>
                      </div>
                      <div className="info-item-full">
                        <span className="info-label-small">Kecamatan</span>
                        <span className="info-value" id="infoKecDetail">
                          {feature.WADMKC || '-'}
                        </span>
                      </div>
                      <div className="info-item-full">
                        <span className="info-label-small">Desa/Kelurahan</span>
                        <span className="info-value" id="infoDesa">
                          {feature.WADMKD || '-'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab: Parameter */}
                <div
                  className={`nested-tab-content ${activeDetailTab === 'parameter' ? 'active' : ''}`}
                  id="nested-tab-parameter"
                >
                  <div className="nested-tab-panel">
                    <div className="info-grid">
                      <div className="info-item-half">
                        <span className="info-label-small">KDB</span>
                        <span className="info-value" id="infoKDB">
                          {getDisplayValue(feature.KDB)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">KLB</span>
                        <span className="info-value" id="infoKLB">
                          {getDisplayValue(feature.KLB)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">KDH</span>
                        <span className="info-value" id="infoKDH">
                          {getDisplayValue(feature.KDH)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">GSB</span>
                        <span className="info-value" id="infoGSB">
                          {getDisplayValue(feature.GSB)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Ketinggian Bangunan</span>
                        <span className="info-value" id="infoKTGBGN">
                          {feature.KTGBGN ? `${feature.KTGBGN} meter` : getDisplayValue(feature.KTB)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab: Kegiatan */}
                <div
                  className={`nested-tab-content ${activeDetailTab === 'kegiatan' ? 'active' : ''}`}
                  id="nested-tab-kegiatan"
                >
                  <div className="nested-tab-panel">
                    <div className="activities-group">
                      <div className={`activity-subsection ${collapsedSections.izin ? 'collapsed' : ''}`}>
                        <div
                          className="activity-subsection-title"
                          onClick={() => toggleSection('izin')}
                        >
                          <span className="activity-title-text">
                            <i className="fas fa-check-circle"></i> Kegiatan Yang Diizinkan
                          </span>
                          <i className={`fas fa-chevron-down activity-toggle-icon ${collapsedSections.izin ? 'rotated' : ''}`}></i>
                        </div>
                        <div className={`activity-section ${collapsedSections.izin ? 'collapsed' : ''}`} id="activityIzin">
                          {Array.isArray(feature.KEGIATAN_DIIZINKAN) && feature.KEGIATAN_DIIZINKAN.length > 0 &&
                          feature.KEGIATAN_DIIZINKAN[0] !== '-' ? (
                            feature.KEGIATAN_DIIZINKAN.map((item: string, i: number) => (
                              <div key={i} className="activity-item">{item}</div>
                            ))
                          ) : (
                            <span className="activity-empty">Tidak ada data</span>
                          )}
                        </div>
                      </div>
                      <div className={`activity-subsection ${collapsedSections.terbatas ? 'collapsed' : ''}`}>
                        <div
                          className="activity-subsection-title"
                          onClick={() => toggleSection('terbatas')}
                        >
                          <span className="activity-title-text">
                            <i className="fas fa-exclamation-triangle"></i> Kegiatan Terbatas
                          </span>
                          <i className={`fas fa-chevron-down activity-toggle-icon ${collapsedSections.terbatas ? 'rotated' : ''}`}></i>
                        </div>
                        <div className={`activity-section ${collapsedSections.terbatas ? 'collapsed' : ''}`} id="activityTerbatas">
                          {Array.isArray(feature.KEGIATAN_TERBATAS) && feature.KEGIATAN_TERBATAS.length > 0 &&
                          feature.KEGIATAN_TERBATAS[0] !== '-' ? (
                            feature.KEGIATAN_TERBATAS.map((item: string, i: number) => (
                              <div key={i} className="activity-item">{item}</div>
                            ))
                          ) : (
                            <span className="activity-empty">Tidak ada data</span>
                          )}
                        </div>
                      </div>
                      <div className={`activity-subsection ${collapsedSections.bersyarat ? 'collapsed' : ''}`}>
                        <div
                          className="activity-subsection-title"
                          onClick={() => toggleSection('bersyarat')}
                        >
                          <span className="activity-title-text">
                            <i className="fas fa-clipboard-check"></i> Kegiatan Bersyarat
                          </span>
                          <i className={`fas fa-chevron-down activity-toggle-icon ${collapsedSections.bersyarat ? 'rotated' : ''}`}></i>
                        </div>
                        <div className={`activity-section ${collapsedSections.bersyarat ? 'collapsed' : ''}`} id="activityBersyarat">
                          {Array.isArray(feature.KEGIATAN_BERSYARAT) && feature.KEGIATAN_BERSYARAT.length > 0 &&
                          feature.KEGIATAN_BERSYARAT[0] !== '-' ? (
                            feature.KEGIATAN_BERSYARAT.map((item: string, i: number) => (
                              <div key={i} className="activity-item">{item}</div>
                            ))
                          ) : (
                            <span className="activity-empty">Tidak ada data</span>
                          )}
                        </div>
                      </div>
                      {feature.KEGIATAN_TERBATAS_BERSYARAT && (
                        <div className={`activity-subsection ${collapsedSections.terbatasBersyarat ? 'collapsed' : ''}`}>
                          <div
                            className="activity-subsection-title"
                            onClick={() => toggleSection('terbatasBersyarat')}
                          >
                            <span className="activity-title-text">
                              <i className="fas fa-exclamation-circle"></i> Kegiatan Terbatas Bersyarat
                            </span>
                            <i className={`fas fa-chevron-down activity-toggle-icon ${collapsedSections.terbatasBersyarat ? 'rotated' : ''}`}></i>
                          </div>
                          <div className={`activity-section ${collapsedSections.terbatasBersyarat ? 'collapsed' : ''}`} id="activityTerbatasBersyarat">
                            {Array.isArray(feature.KEGIATAN_TERBATAS_BERSYARAT) &&
                            feature.KEGIATAN_TERBATAS_BERSYARAT.length > 0 &&
                            feature.KEGIATAN_TERBATAS_BERSYARAT[0] !== '-' ? (
                              feature.KEGIATAN_TERBATAS_BERSYARAT.map((item: string, i: number) => (
                                <div key={i} className="activity-item">{item}</div>
                              ))
                            ) : (
                              <span className="activity-empty">Tidak ada data</span>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab: Kawasan */}
                <div
                  className={`nested-tab-content ${activeDetailTab === 'kawasan' ? 'active' : ''}`}
                  id="nested-tab-kawasan"
                >
                  <div className="nested-tab-panel">
                    <div className="info-grid">
                      <div className="info-item-half">
                        <span className="info-label-small">Kawasan Konservasi</span>
                        <span
                          className={`info-value kawasan-status ${getKawasanStatusClass(feature.KKOP_1)}`}
                          id="infoKkop1"
                        >
                          {getDisplayValue(feature.KKOP_1)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Lahan Pangan Berkelanjutan</span>
                        <span
                          className={`info-value kawasan-status ${getKawasanStatusClass(feature.LP2B_2)}`}
                          id="infoLp2b2"
                        >
                          {getDisplayValue(feature.LP2B_2)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Kawasan Rawan Bencana</span>
                        <span
                          className={`info-value kawasan-status ${getKawasanStatusClass(feature.KRB_03)}`}
                          id="infoKrb03"
                        >
                          {getDisplayValue(feature.KRB_03)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Transit Oriented Development</span>
                        <span
                          className={`info-value kawasan-status ${getKawasanStatusClass(feature.TOD_04)}`}
                          id="infoTod04"
                        >
                          {getDisplayValue(feature.TOD_04)}
                        </span>
                      </div>
                      <div className="info-item-half">
                        <span className="info-label-small">Tata Edisi Bangunan</span>
                        <span
                          className={`info-value kawasan-status ${getKawasanStatusClass(feature.TEB_05)}`}
                          id="infoTeb05"
                        >
                          {getDisplayValue(feature.TEB_05)}
                        </span>
                      </div>
                      {feature.CAGBUD && (
                        <div className="info-item-half">
                          <span className="info-label-small">Cagar Budaya</span>
                          <span
                            className={`info-value kawasan-status ${getKawasanStatusClass(feature.CAGBUD)}`}
                            id="infoCagbud"
                          >
                            {getDisplayValue(feature.CAGBUD)}
                          </span>
                        </div>
                      )}
                      {feature.HANKAM && (
                        <div className="info-item-half">
                          <span className="info-label-small">Hankam</span>
                          <span
                            className={`info-value kawasan-status ${getKawasanStatusClass(feature.HANKAM)}`}
                            id="infoHankam"
                          >
                            {getDisplayValue(feature.HANKAM)}
                          </span>
                        </div>
                      )}
                      <div className="info-item-full">
                        <span className="info-label-small">REMARK</span>
                        <span className="info-value kawasan-status" id="infoRemark">
                          {feature.Keterangan && Array.isArray(feature.Keterangan) && feature.Keterangan.length > 0
                            ? feature.Keterangan.join(', ')
                            : getDisplayValue(feature.Remark || feature.REMARK || '-')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tab: Dokumen */}
                <div
                  className={`nested-tab-content ${activeDetailTab === 'dokumen' ? 'active' : ''}`}
                  id="nested-tab-dokumen"
                >
                  <div className="nested-tab-panel">
                    {feature.PP || feature.BT || feature.NOTHPR ? (
                      <div className="pdf-links-section">
                        {feature.PP && (
                          <a
                            href={feature.PP}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-link-card"
                          >
                            <div className="pdf-link-icon">
                              <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className="pdf-link-info">
                              <div className="pdf-link-title">Peraturan Pemerintah</div>
                              <div className="pdf-link-desc">Dokumen PP RDTR</div>
                            </div>
                            <i className="fas fa-external-link-alt pdf-link-arrow"></i>
                          </a>
                        )}
                        {feature.BT && (
                          <a
                            href={feature.BT}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="pdf-link-card"
                          >
                            <div className="pdf-link-icon">
                              <i className="fas fa-file-pdf"></i>
                            </div>
                            <div className="pdf-link-info">
                              <div className="pdf-link-title">Buku Teknis</div>
                              <div className="pdf-link-desc">Dokumen BT RDTR</div>
                            </div>
                            <i className="fas fa-external-link-alt pdf-link-arrow"></i>
                          </a>
                        )}
                        {feature.NOTHPR && (
                          <div className="keterangan-section">
                            <div className="keterangan-header">
                              <i className="fas fa-info-circle"></i>
                              Nomor Peraturan
                            </div>
                            <div className="keterangan-content">
                              <p className="text-sm">{feature.NOTHPR}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="activity-empty">Tidak ada dokumen tersedia</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
