// import { Theme } from '@react-navigation/native';

// const colors: {
//   primary: string;
//   background: string;
//   card: string;
//   text: string;
//   border: string;
//   notification: string;
//   success: string;
//   error: string;
//   searchBorder: string;
//   button: string;
//   lightTextColor: string;
// } = {
//   primary: '#185BE5',
//   button: '#152D5E',
//   background: '#FFFFFF',
//   card: '#F2F2F2',
//   text: '#000000',
//   lightTextColor: '#585858',
//   border: '#ADADAD',
//   notification: '',
//   success: '#32a852',
//   error: '#D50000',
//   searchBorder: '#DFE2E8',
// };

// export default colors;


export const lightColors = {
  primary: '#185BE5',
  button: '#152D5E',
  background: '#F8FAFC', // Premium light background
  card: '#FFFFFF',      // Premium white cards
  text: '#1E293B',      // Premium dark slate text
  lightTextColor: '#64748B',
  border: '#E2E8F0',
  notification: '#F8F9FA',
  success: '#32a852',
  error: '#D50000',
  searchBorder: '#DFE2E8',
  icon: '#64748B',
  secondaryText: '#94A3B8',
  iconBox: '#F1F5F9',
  sheetBackground: '#FFFFFF',
  modalOverlay: 'rgba(15, 23, 42, 0.5)',
  divider: '#F1F5F9',
};

export const darkColors = {
  primary: '#60A5FA', // Premium Radiant Blue
  button: '#3B82F6',
  background: '#0F172A', // Deep Slate Dark
  card: '#1E293B',      // Medium Slate Card
  text: '#F8FAFC',      // Clean White Text
  lightTextColor: '#94A3B8', // Slate Secondary
  border: '#334155',
  notification: '#1E293B',
  success: '#10B981',
  error: '#EF4444',
  searchBorder: '#334155',
  icon: '#CBD5E1',
  secondaryText: '#94A3B8',
  iconBox: '#334155',
  sheetBackground: '#1E293B',
  modalOverlay: 'rgba(0, 0, 0, 0.7)',
  divider: '#334155',
};

export const darkMapStyle = [
  { "elementType": "geometry", "stylers": [{ "color": "#334155" }] },
  { "elementType": "labels.text.fill", "stylers": [{ "color": "#f1f5f9" }] },
  { "elementType": "labels.text.stroke", "stylers": [{ "color": "#0f172a" }, { "weight": 2 }] },
  { "featureType": "administrative", "elementType": "geometry.stroke", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "landscape.man_made", "elementType": "geometry.fill", "stylers": [{ "color": "#475569" }] },
  { "featureType": "landscape.natural", "elementType": "geometry.fill", "stylers": [{ "color": "#334155" }] },
  { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#cbd5e1" }] },
  { "featureType": "poi.park", "elementType": "geometry.fill", "stylers": [{ "color": "#1e293b" }] },
  { "featureType": "road", "elementType": "geometry", "stylers": [{ "color": "#64748b" }] },
  { "featureType": "road.highway", "elementType": "geometry.fill", "stylers": [{ "color": "#94a3b8" }] },
  { "featureType": "road.highway", "elementType": "geometry.stroke", "stylers": [{ "color": "#475569" }] },
  { "featureType": "road.arterial", "elementType": "geometry.fill", "stylers": [{ "color": "#475569" }] },
  { "featureType": "road.local", "elementType": "geometry.fill", "stylers": [{ "color": "#475569" }] },
  { "featureType": "transit.line", "elementType": "geometry", "stylers": [{ "color": "#94a3b8" }] },
  { "featureType": "transit.station", "elementType": "geometry", "stylers": [{ "color": "#475569" }] },
  { "featureType": "water", "elementType": "geometry.fill", "stylers": [{ "color": "#1e293b" }] }
];

const colors = lightColors; // Backward compatibility for any remaining direct imports
export default colors;
