import { useMemo, useRef } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface MapPickerProps {
  latitude: number;
  longitude: number;
  onLocationChange: (latitude: number, longitude: number) => void;
}

// Leaflet + OpenStreetMap tiles via WebView — free and keyless, unlike
// react-native-maps which needs a Google Maps API key on Android. Swappable
// for a native map later if the project adds Maps billing (product spec §7).
function buildMapHtml(latitude: number, longitude: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: true }).setView([${latitude}, ${longitude}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);

    let marker = L.marker([${latitude}, ${longitude}], { draggable: true }).addTo(map);

    function post(lat, lng) {
      window.ReactNativeWebView.postMessage(JSON.stringify({ latitude: lat, longitude: lng }));
    }

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      post(pos.lat, pos.lng);
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      post(e.latlng.lat, e.latlng.lng);
    });
  </script>
</body>
</html>`;
}

export function MapPicker({ latitude, longitude, onLocationChange }: MapPickerProps) {
  const webViewRef = useRef<WebView>(null);
  // Only regenerate the HTML (and re-center the map) on first mount — after
  // that, marker position updates come from the map's own drag/click
  // events, not from re-rendering the whole WebView.
  const html = useMemo(() => buildMapHtml(latitude, longitude), []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={["*"]}
        source={{ html }}
        style={styles.webview}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (typeof data.latitude === "number" && typeof data.longitude === "number") {
              onLocationChange(data.latitude, data.longitude);
            }
          } catch {
            // Ignore malformed messages from the WebView.
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 320, borderRadius: 12, overflow: "hidden" },
  webview: { flex: 1 },
});
