import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { fetchCoordsIfAllowed, type Coords } from '../utils/location';

export type MapStation = {
  id?: string;
  _id?: string;
  name?: string;
  address?: string;
  coordinates?: { latitude: number; longitude: number } | null;
};

const DEFAULT_CENTER = { latitude: 28.5355, longitude: 77.391 };

export type LiveMapProps<T extends MapStation = MapStation> = {
  stations?: T[] | null;
  selectedStationId?: string | null;
  onSelectStation?: (station: T) => void;
  initialCenter?: Coords | null;
  style?: ViewStyle | ViewStyle[];
  centerOnUser?: boolean;
};

type Marker = {
  id: string;
  lat: number;
  lng: number;
  selected: boolean;
  name: string;
  address: string;
};

const stationKey = (s: MapStation) => s._id || s.id || '';

function buildHtml(initialLat: number, initialLng: number) {
  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
<style>
  html, body, #map { height: 100%; margin: 0; padding: 0; background: #e6e9ee; }
  .station-pin { width: 30px; height: 38px; }
  .user-dot {
    width: 16px; height: 16px; border-radius: 8px;
    background: #2563eb; border: 3px solid #fff; box-shadow: 0 0 0 4px rgba(37,99,235,0.25);
  }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var post = function(msg){
    if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
      window.ReactNativeWebView.postMessage(JSON.stringify(msg));
    }
  };
  var map = L.map('map', { zoomControl: false, attributionControl: false }).setView([${initialLat}, ${initialLng}], 14);
  L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    crossOrigin: true,
  }).addTo(map);

  var markers = {};
  var userMarker = null;

  function pinIcon(selected){
    var color = selected ? '#fc4c02' : '#16a34a';
    var html = '<svg class="station-pin" viewBox="0 0 30 38" xmlns="http://www.w3.org/2000/svg">' +
      '<path d="M15 0C7 0 0 6.5 0 14.5 0 25 15 38 15 38s15-13 15-23.5C30 6.5 23 0 15 0z" fill="' + color + '"/>' +
      '<circle cx="15" cy="14" r="6" fill="#fff"/>' +
      '</svg>';
    return L.divIcon({ className: '', html: html, iconSize: [30,38], iconAnchor: [15,38] });
  }

  function userIcon(){
    return L.divIcon({ className: '', html: '<div class="user-dot"></div>', iconSize: [16,16], iconAnchor: [8,8] });
  }

  function setStations(list){
    var seen = {};
    list.forEach(function(s){
      seen[s.id] = true;
      var existing = markers[s.id];
      if (existing){
        existing.setLatLng([s.lat, s.lng]);
        existing.setIcon(pinIcon(!!s.selected));
      } else {
        var m = L.marker([s.lat, s.lng], { icon: pinIcon(!!s.selected) }).addTo(map);
        if (s.name) m.bindPopup('<b>' + s.name + '</b>' + (s.address ? '<br/>' + s.address : ''));
        m.on('click', function(){
          post({ type: 'selectStation', id: s.id });
        });
        markers[s.id] = m;
      }
    });
    Object.keys(markers).forEach(function(k){
      if (!seen[k]){ map.removeLayer(markers[k]); delete markers[k]; }
    });
  }

  function setUser(lat, lng){
    if (lat == null || lng == null){
      if (userMarker){ map.removeLayer(userMarker); userMarker = null; }
      return;
    }
    if (userMarker) userMarker.setLatLng([lat, lng]);
    else userMarker = L.marker([lat, lng], { icon: userIcon(), interactive: false }).addTo(map);
  }

  function setCenter(lat, lng, zoom){
    if (lat == null || lng == null) return;
    map.flyTo([lat, lng], zoom || map.getZoom(), { duration: 0.6 });
  }

  document.addEventListener('message', function(e){ handle(e.data); });
  window.addEventListener('message', function(e){ handle(e.data); });

  function handle(raw){
    try {
      var msg = typeof raw === 'string' ? JSON.parse(raw) : raw;
      if (!msg || !msg.type) return;
      if (msg.type === 'stations') setStations(msg.payload || []);
      else if (msg.type === 'user') setUser(msg.lat, msg.lng);
      else if (msg.type === 'center') setCenter(msg.lat, msg.lng, msg.zoom);
    } catch (err) {}
  }

  post({ type: 'ready' });
</script>
</body>
</html>`;
}

export function LiveMap<T extends MapStation = MapStation>({
  stations,
  selectedStationId,
  onSelectStation,
  initialCenter,
  style,
  centerOnUser = true,
}: LiveMapProps<T>) {
  const webRef = useRef<WebView | null>(null);
  const [ready, setReady] = useState(false);
  const center = initialCenter ?? DEFAULT_CENTER;

  const markers = useMemo<Marker[]>(() => {
    return (stations || [])
      .filter(
        (s) =>
          typeof s.coordinates?.latitude === 'number' &&
          typeof s.coordinates?.longitude === 'number',
      )
      .map((s) => ({
        id: stationKey(s) || `${s.coordinates!.latitude},${s.coordinates!.longitude}`,
        lat: s.coordinates!.latitude,
        lng: s.coordinates!.longitude,
        selected: !!selectedStationId && stationKey(s) === selectedStationId,
        name: s.name || '',
        address: s.address || '',
      }));
  }, [stations, selectedStationId]);

  const html = useMemo(() => buildHtml(center.latitude, center.longitude), [center.latitude, center.longitude]);

  const post = (msg: object) => {
    webRef.current?.injectJavaScript(`handle(${JSON.stringify(JSON.stringify(msg))}); true;`);
  };

  useEffect(() => {
    if (!ready) return;
    post({ type: 'stations', payload: markers });
  }, [markers, ready]);

  useEffect(() => {
    if (!ready || !centerOnUser) return;
    let cancelled = false;
    void (async () => {
      const coords = await fetchCoordsIfAllowed();
      if (cancelled || !coords) return;
      post({ type: 'user', lat: coords.latitude, lng: coords.longitude });
      post({ type: 'center', lat: coords.latitude, lng: coords.longitude, zoom: 15 });
    })();
    return () => {
      cancelled = true;
    };
  }, [ready, centerOnUser]);

  useEffect(() => {
    if (!ready || !initialCenter) return;
    post({ type: 'center', lat: initialCenter.latitude, lng: initialCenter.longitude, zoom: 15 });
  }, [ready, initialCenter?.latitude, initialCenter?.longitude]);

  return (
    <View style={[styles.container, style]} pointerEvents="box-none">
      <WebView
        ref={webRef}
        originWhitelist={['*']}
        source={{ html }}
        style={styles.map}
        javaScriptEnabled
        domStorageEnabled
        scalesPageToFit={false}
        scrollEnabled={false}
        bounces={false}
        androidLayerType="hardware"
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'ready') {
              setReady(true);
            } else if (msg.type === 'selectStation' && onSelectStation) {
              const match = (stations || []).find((s) => stationKey(s) === msg.id);
              if (match) onSelectStation(match);
            }
          } catch {
            // ignore malformed messages
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#e6e9ee',
  },
});
