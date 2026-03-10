'use client';

import { useEffect } from 'react';
import { useStore } from '@/store/useStore';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import MapView from '@/components/map/MapView';
import GridView from '@/components/map/GridView';
import DetailPanel from '@/components/layout/DetailPanel';

export default function Home() {
  const { loadProvinces, loadSummary } = useStore();

  useEffect(() => {
    loadProvinces();
    loadSummary();
  }, [loadProvinces, loadSummary]);

  return (
    <>
      <Header />

      <div className="main-container" id="mainContainer">
        <Sidebar />

        <div className="center-section">
          <GridView />
          <MapView />
        </div>

        <DetailPanel />
      </div>
    </>
  );
}
