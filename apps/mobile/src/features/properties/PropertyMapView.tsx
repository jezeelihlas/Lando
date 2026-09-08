import { useMemo } from "react";
import { StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";

interface PropertyMapViewProps {
  latitude: number;
  longitude: number;
}

// Read-only counterpart to the seller wizard's MapPicker: same free/keyless
// Leaflet + OpenStreetMap approach, but no drag/click handlers — just a
// marker for the property itself (nearby-place pins aren't geocoded on the
// buyer side, only their distances are, so only the property location is
// plotted here).
function buildMapHtml(latitude: number, longitude: number): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
    .leaflet-control-zoom { display: none; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map', { zoomControl: false, dragging: true, scrollWheelZoom: false }).setView([${latitude}, ${longitude}], 15);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
      maxZoom: 19,
    }).addTo(map);
    L.marker([${latitude}, ${longitude}]).addTo(map);
  </script>
</body>
</html>`;
}

export function PropertyMapView({ latitude, longitude }: PropertyMapViewProps) {
  const html = useMemo(() => buildMapHtml(latitude, longitude), [latitude, longitude]);

  return (
    <View style={styles.container}>
      <WebView originWhitelist={["*"]} source={{ html }} style={styles.webview} scrollEnabled={false} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { height: 180, borderRadius: 16, overflow: "hidden" },
  webview: { flex: 1 },
});
