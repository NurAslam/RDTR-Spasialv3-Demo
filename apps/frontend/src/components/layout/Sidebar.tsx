'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/store/useStore';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

export default function Sidebar() {
  const {
    provinces = [],
    kabupatens = [],
    selectedProvince = null,
    selectedKabupaten = null,
    rdtrList = [],
    leftSidebarCollapsed = false,
    setSelectedProvince,
    setSelectedKabupaten,
    setSelectedRDTR,
    resetSelection,
    toggleLeftSidebar,
  } = useStore();

  const [rdtrDropdownOpen, setRdtrDropdownOpen] = useState(false);

  const handleBackToGrid = () => {
    resetSelection();
  };

  const handleRdtrClick = (e: React.MouseEvent, rdtr: any) => {
    e.stopPropagation();
    setSelectedRDTR(rdtr);
    setRdtrDropdownOpen(false);
  };

  const handleStatsCardClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (rdtrList.length === 1) {
      // Auto-select the only RDTR
      setSelectedRDTR(rdtrList[0]);
    } else if (rdtrList.length > 1) {
      // Toggle dropdown to show all RDTRs
      setRdtrDropdownOpen(!rdtrDropdownOpen);
    }
  };

  useEffect(() => {
    // Update body class when sidebar collapses
    if (leftSidebarCollapsed) {
      document.body.classList.add('sidebar-collapsed');
    } else {
      document.body.classList.remove('sidebar-collapsed');
    }
  }, [leftSidebarCollapsed]);

  return (
    <>
      {/* Sidebar Show Button (shown when collapsed) */}
      <button
        className={`sidebar-show-btn ${leftSidebarCollapsed ? 'visible' : ''}`}
        onClick={toggleLeftSidebar}
        title="Show Sidebar"
      >
        <ChevronRight className="h-4 w-4" />
      </button>

      {/* Left Sidebar - Navigation */}
      <div
        className={`sidebar-left sidebar-nav ${leftSidebarCollapsed ? 'collapsed' : ''}`}
        id="sidebarLeft"
      >
        <div className="sidebar-header">
          <h2 className="sidebar-title">
            <i className="fas fa-compass"></i> Navigasi
          </h2>
          <button
            className="sidebar-toggle-btn"
            onClick={toggleLeftSidebar}
            title="Toggle Sidebar"
          >
            <ChevronLeft className="h-3 w-3" />
          </button>
        </div>

        <div className="sidebar-content">
          {/* Province Selector */}
          <div className="nav-section">
            <label className="nav-label">
              <i className="fas fa-globe"></i> Provinsi
            </label>
            <select
              className="nav-select"
              value={selectedProvince || ''}
              onChange={(e) => setSelectedProvince(e.target.value || null)}
            >
              <option value="">Pilih Provinsi</option>
              {provinces.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </select>
          </div>

          {/* Regency Selector */}
          <div className="nav-section">
            <label className="nav-label">
              <i className="fas fa-city"></i> Kabupaten/Kota
            </label>
            <select
              className="nav-select"
              value={selectedKabupaten || ''}
              onChange={(e) => setSelectedKabupaten(e.target.value || null)}
              disabled={!selectedProvince}
            >
              <option value="">
                {selectedProvince ? 'Pilih Kabupaten/Kota' : 'Pilih Provinsi Dahulu'}
              </option>
              {kabupatens.map((kab) => (
                <option key={kab.name} value={kab.name}>
                  {kab.name}
                </option>
              ))}
            </select>
          </div>

          {/* Stats Card */}
          {selectedKabupaten && rdtrList.length > 0 && (
            <div className="nav-section">
              <div
                className="nav-stats-card clickable"
                onClick={(e) => handleStatsCardClick(e)}
                title={rdtrList.length === 1 ? `Klik untuk buka: ${rdtrList[0].name}` : `Klik untuk lihat ${rdtrList.length} RDTR`}
              >
                <div className="nav-stat-item">
                  <div className="nav-stat-value">{rdtrList.length}</div>
                  <div className="nav-stat-label">RDTR Tersedia</div>
                </div>
                {rdtrList.length > 1 && (
                  <ChevronDown className={`nav-dropdown-icon ${rdtrDropdownOpen ? 'open' : ''}`} />
                )}
              </div>

              {/* RDTR Dropdown */}
              {rdtrDropdownOpen && rdtrList.length > 1 && (
                <div className="nav-rdtr-dropdown">
                  {rdtrList.map((rdtr) => (
                    <div
                      key={rdtr.id}
                      className="nav-rdtr-item"
                      onClick={(e) => handleRdtrClick(e, rdtr)}
                    >
                      <div className="nav-rdtr-name">{rdtr.name}</div>
                      <div className="nav-rdtr-meta">{rdtr.feature_count.toLocaleString('id-ID')} polygon</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
