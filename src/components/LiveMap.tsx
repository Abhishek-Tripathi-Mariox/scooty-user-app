import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { WebView } from 'react-native-webview';
import { LIVE_PIN_ICON, STATION_ICON } from '../assets/mapIcons';
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
  // Fires with true while the user is touching the map — lets a parent
  // ScrollView pause its own scrolling so map pan/pinch stays smooth.
  onTouchActive?: (active: boolean) => void;
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
  .st-wrap { display: flex; flex-direction: column; align-items: center; }
  .st-img {
    width: 34px; height: 36px; object-fit: contain;
    filter: drop-shadow(0 2px 3px rgba(0,0,0,0.35));
  }
  .st-img.sel { transform: scale(1.2); filter: drop-shadow(0 0 4px rgba(252,76,2,0.9)); }
  .dist {
    margin-top: 2px; background: #ffffff; color: #111827;
    font: 700 10px/1.3 -apple-system, Roboto, sans-serif;
    padding: 1px 6px; border-radius: 8px; white-space: nowrap;
    border: 1px solid rgba(0,0,0,0.08); box-shadow: 0 1px 3px rgba(0,0,0,0.3);
  }
  .dist.sel { background: #fc4c02; color: #fff; border-color: #fc4c02; }
  /* The pin PNG has transparent padding around the artwork, so it is
     rendered larger and anchored at the pin's actual tip. It already has
     a baked-in 3D shadow — no extra CSS shadow needed. */
  .user-pin { width: 58px; height: 58px; object-fit: contain; }
</style>
</head>
<body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  var ICON_USER = '${LIVE_PIN_ICON}';
  var ICON_STATION = '${STATION_ICON}';

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
  var stationList = [];
  var userPos = null;
  var userInteracted = false;
  var programmaticMove = false;

  // Stop auto-fitting once the user pans/zooms the map themselves.
  map.on('dragstart', function(){ userInteracted = true; });
  map.on('zoomstart', function(){ if (!programmaticMove) userInteracted = true; });

  // Tell the app while a finger is on the map so the outer page scroll can
  // pause and map pan/pinch gestures stay smooth.
  document.addEventListener('touchstart', function(){
    post({ type: 'touch', active: true });
  }, { passive: true });
  document.addEventListener('touchend', function(e){
    if (!e.touches || e.touches.length === 0) post({ type: 'touch', active: false });
  }, { passive: true });
  document.addEventListener('touchcancel', function(){
    post({ type: 'touch', active: false });
  }, { passive: true });

  // Frame the view so the live location sits in the CENTRE of the map and
  // the nearby stations are visible around it. Each nearby station is
  // mirrored across the user's position so the bounds stay symmetric —
  // which keeps the user pinned exactly at the middle.
  function fitAll(){
    if (userInteracted || !stationList.length) return;
    var bounds;
    if (userPos){
      var sorted = stationList.slice().sort(function(a, b){
        return distKm(userPos.lat, userPos.lng, a.lat, a.lng) -
               distKm(userPos.lat, userPos.lng, b.lat, b.lng);
      });
      bounds = L.latLngBounds([[userPos.lat, userPos.lng]]);
      sorted.slice(0, 3).forEach(function(s){
        bounds.extend([s.lat, s.lng]);
        bounds.extend([2 * userPos.lat - s.lat, 2 * userPos.lng - s.lng]);
      });
    } else {
      bounds = L.latLngBounds(stationList.map(function(s){ return [s.lat, s.lng]; }));
    }
    programmaticMove = true;
    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 16 });
    setTimeout(function(){ programmaticMove = false; }, 900);
  }

  function distKm(aLat, aLng, bLat, bLng){
    var R = 6371;
    var toRad = function(v){ return v * Math.PI / 180; };
    var dLat = toRad(bLat - aLat);
    var dLng = toRad(bLng - aLng);
    var h = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng/2) * Math.sin(dLng/2);
    return 2 * R * Math.asin(Math.sqrt(h));
  }

  function distLabel(s){
    if (!userPos) return '';
    var km = distKm(userPos.lat, userPos.lng, s.lat, s.lng);
    var text = km < 10 ? km.toFixed(1) : String(Math.round(km));
    return '<div class="dist' + (s.selected ? ' sel' : '') + '">' + text + ' km</div>';
  }

  function stationIcon(s){
    var html = '<div class="st-wrap">' +
      '<img class="st-img' + (s.selected ? ' sel' : '') + '" src="' + ICON_STATION + '"/>' +
      distLabel(s) +
      '</div>';
    return L.divIcon({ className: '', html: html, iconSize: [70, 56], iconAnchor: [35, 36] });
  }

  function userIcon(){
    var html = '<img class="user-pin" src="' + ICON_USER + '"/>';
    // Anchor at the visible pin tip (accounts for the PNG's transparent padding).
    return L.divIcon({ className: '', html: html, iconSize: [58, 58], iconAnchor: [29, 53] });
  }

  function renderStations(){
    var seen = {};
    stationList.forEach(function(s){
      seen[s.id] = true;
      var existing = markers[s.id];
      if (existing){
        existing.setLatLng([s.lat, s.lng]);
        existing.setIcon(stationIcon(s));
      } else {
        var m = L.marker([s.lat, s.lng], { icon: stationIcon(s) }).addTo(map);
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

  function setStations(list){
    stationList = list || [];
    renderStations();
    fitAll();
  }

  function setUser(lat, lng){
    if (lat == null || lng == null){
      userPos = null;
      if (userMarker){ map.removeLayer(userMarker); userMarker = null; }
      renderStations();
      return;
    }
    userPos = { lat: lat, lng: lng };
    if (userMarker) userMarker.setLatLng([lat, lng]);
    else userMarker = L.marker([lat, lng], { icon: userIcon(), interactive: false, zIndexOffset: 1000 }).addTo(map);
    // refresh station labels so distances are measured from the live position
    renderStations();
    fitAll();
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
  onTouchActive,
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
      // The map fits itself around the user + nearby stations (fitAll),
      // so no explicit centring is needed here.
      post({ type: 'user', lat: coords.latitude, lng: coords.longitude });
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
        nestedScrollEnabled
        androidLayerType="hardware"
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'ready') {
              setReady(true);
            } else if (msg.type === 'selectStation' && onSelectStation) {
              const match = (stations || []).find((s) => stationKey(s) === msg.id);
              if (match) onSelectStation(match);
            } else if (msg.type === 'touch') {
              onTouchActive?.(!!msg.active);
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
