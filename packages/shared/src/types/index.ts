// GeoJSON Types based on RFC 7946
export interface GeoJSONGeometry {
  type: 'Point' | 'MultiPoint' | 'LineString' | 'MultiLineString' | 'Polygon' | 'MultiPolygon';
  coordinates: any;
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: GeoJSONGeometry;
  properties: RDTRProperties;
}

export interface GeoJSONFeatureCollection {
  type: 'FeatureCollection';
  name?: string;
  crs?: {
    type: 'name';
    properties: { name: string };
  };
  features: GeoJSONFeature[];
}

// RDTR Specific Properties
export interface RDTRProperties {
  // Identitas Zona
  KODZON: string;
  NAMZON: string;
  KODSZN?: string;
  NAMSZN?: string;

  // Lokasi Administratif
  WADMPRV?: string;
  WADMKK?: string;
  WADMKC?: string;
  WADMKD?: string;
  WADMPPK?: string;

  // Kecamatan & Desa
  kecamatan?: string;
  desa?: string;

  // Parameter Bangunan
  KDB?: number | string;
  KLB?: number | string;
  KDH?: number | string;
  GSB?: number | string;
  KTGBGN?: number | string;

  // Kawasan
  KKOP_1?: string | number;
  LP2B_2?: number;
  KRB_03?: number;
  TOD_04?: string | number;
  TEB_05?: string | number;
  CAGBUD?: string;
  HANKAM?: string;
  PUSLIT?: string;
  TPZ_00?: string;
  PTBGMB?: string;
  MGRSAT?: string;
  RDBUMI?: string;
  KKARST?: string;
  RESAIR?: string;
  KSMPDN?: string;

  // Kegiatan
  KEGIATAN_DIIZINKAN?: string[];
  KEGIATAN_TERBATAS?: string[];
  KEGIATAN_BERSYARAT?: string[];
  KEGIATAN_TERBATAS_BERSYARAT?: string[];

  // Dokumen
  PP?: string;
  BT?: string;
  NOTHPR?: string;

  // Metadata
  LUASHA?: number;
  SHAPE_Length?: number;
  SHAPE_Area?: number;
  CITY_ID?: string;
  CITY_NAME?: string;
  OBJECTID?: number;
}

// API Response Types
export interface SummaryResponse {
  total_features: number;
  areas: AreaInfo[];
  zones: Record<string, ZoneInfo>;
  kecamatan: Record<string, number>;
  sub_zones: Record<string, number>;
  bounds: [number, number, number, number];
}

export interface AreaInfo {
  name: string;
  features: number;
}

export interface ZoneInfo {
  count: number;
  color: string;
}

export interface GeoJSONResponse {
  type: 'FeatureCollection';
  features: GeoJSONFeature[];
  returned: number;
  total: number;
}

// Province & Regency Types
export interface Province {
  name: string;
  code?: string;
  regencies: string[];
}

export interface Regency {
  name: string;
  province: string;
  rdtr_count: number;
}

export interface RDTRInfo {
  id: string;
  name: string;
  province: string;
  regency: string;
  feature_count: number;
  image_path?: string;
}

// Viewport Filter Type
export interface ViewportFilter {
  minx: number;
  miny: number;
  maxx: number;
  maxy: number;
}

// API Request Types
export interface GeoJSONRequest {
  area_name: string;
  viewport?: ViewportFilter;
  zones?: string[];
}

// Health Check
export interface HealthResponse {
  status: string;
  version: string;
  timestamp: string;
}

// Zone Colors (Permen ATR BPN 11/2023)
export const ZONE_COLORS: Record<string, string> = {
  // Zona Lindung (Protected Areas)
  'BA': '#97DBF2',      // Badan Air
  'HL': '#325F28',      // Hutan Lindung
  'LG': '#696900',      // Lindung Gambut
  'PS': '#05D7D7',      // Perlindungan Setempat

  // Zona Ruang Terbuka Hijau (Green Open Space)
  'RTH-1': '#37550A',   // Rimba Kota
  'RTH-2': '#416900',   // Taman Kota
  'RTH-3': '#468700',   // Taman Kecamatan
  'RTH-4': '#4BA500',   // Taman Kelurahan
  'RTH-5': '#50C300',   // Taman RW
  'RTH-6': '#55E100',   // Taman RT
  'RTH-7': '#5AFF00',   // Pemakaman
  'RTH-8': '#0F9100',   // Jalur Hijau

  // Zona Konservasi (Conservation)
  'CA': '#4646A5',      // Cagar Alam
  'CAL': '#5A5AC3',     // Cagar Alam Laut
  'SM': '#6E6EE1',      // Suaka Margasatwa
  'SML': '#8280FF',     // Suaka Margasatwa Laut
  'TN': '#8280FF',      // Taman Nasional
  'THR': '#A9B837',     // Taman Hutan Raya
  'TWA': '#E6A5FF',     // Taman Wisata Alam
  'TWL': '#C797FF',     // Taman Wisata Alam Laut

  // Zona Perumahan (Residential)
  'P': '#FFBE00',       // Perumahan Umum
  'P-1': '#FFBE00',     // Tanaman Pangan
  'P-2': '#FFC500',     // Perkebunan
  'P-3': '#FFCC00',     // Peternakan
  'P-4': '#FFD300',     // Perikanan

  // Zona Campuran/Komersial (Mixed/Commercial)
  'C': '#F05500',       // Campuran
  'C-1': '#F05500',     // Perdagangan
  'C-2': '#F06500',     // Jasa
  'C-3': '#F07500',     // Kawasan Industri

  // Zona Industri (Industrial)
  'I': '#690000',       // Industri
  'I-1': '#690000',     // Industri Kecil
  'I-2': '#7A0000',     // Industri Menengah

  // Zona Perkantoran (Office)
  'K': '#8B4513',       // Perkantoran

  // Zona Pariwisata (Tourism)
  'W': '#FFA5FF',       // Pariwisata

  // Zona Sosial/Pelayanan (Social/Services)
  'S': '#7D197D',       // Sosial
  'S-1': '#7D197D',     // Pendidikan
  'S-2': '#8B1E8B',     // Kesehatan
  'S-3': '#992399',     // Peribadatan

  // Zona Transportasi (Transportation)
  'T': '#D73700',       // Transportasi
  'T-1': '#D73700',     // Terminal
  'T-2': '#E54500',     // Stasiun
  'T-3': '#F35300',     // Pelabuhan

  // Zona Badan Jalan (Road)
  'BJ': '#EB1E1E',      // Badan Jalan
  'J': '#EB1E1E',       // Jalan

  // Zona Fasilitas Umum (Public Facilities)
  'F': '#4169E1',       // Fasilitas Umum

  // Zona Pertahanan & Keamanan (Defense)
  'HANKAM': '#2F4F4F',  // Hankam

  // Default
  'default': '#BDBDBD'
};

export default ZONE_COLORS;
