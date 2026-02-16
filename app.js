/******************************************************
 * KONFIGURASJON / KONSTANTER
 ******************************************************/

const START_CENTER = [58.15, 8.0];   // Agder (Kristiansand)
const START_ZOOM = 11;
const RADIUS_METERS = 5000;          // Radius for filtrering
const RADIUS_KM = RADIUS_METERS / 1000;


/******************************************************
 * KARTOPPSETT
 ******************************************************/

// 1️⃣ Opprett kart
const map = L.map("map").setView(START_CENTER, START_ZOOM);

// Basiskart (OpenStreetMap)
const osm = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
  maxZoom: 19,
  attribution: "&copy; OpenStreetMap"
}).addTo(map);

// Layer control
const baseLayers = { "OpenStreetMap": osm };
const overlays = {};
const layerControl = L.control.layers(baseLayers, overlays).addTo(map);

// Fjellskygge / hillshade (OGC WMS overlay)
const fjellskygge = L.tileLayer.wms("https://wms.geonorge.no/skwms1/wms.fjellskygge", {
  layers: "fjellskygge",
  format: "image/png",
  transparent: true,
  opacity: 0.35,          // juster 0.2–0.6 etter smak
  attribution: "Kartverket / GeoNorge"
});

// Legg i layer control (av/på)
layerControl.addOverlay(fjellskygge, "Terrengskygge (Fjellskygge WMS)");

// Valgfritt: slå på som default
fjellskygge.addTo(map);
fjellskygge.bringToFront();



// Eksternt OGC-lag (Kartverket WMS)
const kartverketWms = L.tileLayer.wms(
  "https://wms.geonorge.no/skwms1/wms.topo4",
  {
    layers: "topo4_WMS",
    format: "image/png",
    transparent: true,
    attribution: "Kartverket / GeoNorge"
  }
);

layerControl.addOverlay(kartverketWms, "Kartverket WMS (Topo4)");
kartverketWms.addTo(map);


/******************************************************
 * STYLING OG HJELPEFUNKSJONER
 ******************************************************/

// Kategoriser etter antall plasser
function categoryFromPlasser(plasser) {
  if (plasser < 100) return "Små";
  if (plasser <= 300) return "Middels";
  return "Store";
}

// Stil for alle tilfluktsrom (grå bakgrunnslag)
function styleAll() {
  return { radius: 4, color: "#666", fillColor: "#666", weight: 1, fillOpacity: 0.25 };
}

// Stil for filtrerte tilfluktsrom
function styleFromPlasser(plasser) {
  if (plasser < 100)
    return { radius: 5, color: "#2c7bb6", fillColor: "#2c7bb6", fillOpacity: 0.8 };
  if (plasser <= 300)
    return { radius: 7, color: "#fdae61", fillColor: "#fdae61", fillOpacity: 0.8 };
  return { radius: 9, color: "#d7191c", fillColor: "#d7191c", fillOpacity: 0.8 };
}

// Finn nærmeste tilfluktsrom ved hjelp av Turf
function findNearestShelter(clickLatLng, data) {
  const clickPoint = turf.point([clickLatLng.lng, clickLatLng.lat]);

  let best = null;
  let bestDistKm = Infinity;

  for (const f of data.features) {
    const shelterPoint = turf.point(f.geometry.coordinates);
    const dKm = turf.distance(clickPoint, shelterPoint, { units: "kilometers" });

    if (dKm < bestDistKm) {
      bestDistKm = dKm;
      best = f;
    }
  }

  return { feature: best, distKm: bestDistKm };
}


/******************************************************
 * GLOBALE VARIABLER
 ******************************************************/

let sheltersData = null;
let clickMarker = null;
let nearestLine = null;
let nearestMarker = null;
let filterCircle = null;


/******************************************************
 * FILTER-LAG (innen radius)
 ******************************************************/

const filteredLayer = L.geoJSON(null, {
  pointToLayer: (feature, latlng) => {
    const plasser = Number(feature?.properties?.plasser);
    return L.circleMarker(latlng, styleFromPlasser(plasser));
  }
});

layerControl.addOverlay(filteredLayer, "Tilfluktsrom (innen radius)");


/******************************************************
 * DATAFLYT:
 * 1) Hent GeoJSON (statisk fil)
 * 2) Tegn alle tilfluktsrom
 * 3) Ved klikk:
 *      - Filtrer innen radius
 *      - Finn nærmeste
 *      - Oppdater UI
 ******************************************************/

fetch("data/mine_data2.geojson")
  .then((response) => {
    if (!response.ok) throw new Error("HTTP error " + response.status);
    return response.json();
  })
  .then((data) => {
    sheltersData = data;

    // Tegn alle tilfluktsrom (bakgrunnslag)
    const tilfluktsromLayer = L.geoJSON(data, {
      pointToLayer: (feature, latlng) =>
        L.circleMarker(latlng, styleAll()),
      onEachFeature: (feature, layer) => {
        const p = feature.properties || {};
        const kategori = categoryFromPlasser(Number(p.plasser));

        layer.bindPopup(`
          <b>Tilfluktsrom (${kategori})</b><br>
          Adresse: ${p.adresse ?? "(mangler)"}<br>
          Plasser: ${p.plasser ?? "(mangler)"}<br>
          Romnr: ${p.romnr ?? "(mangler)"}
        `);
      }
    });

    tilfluktsromLayer.addTo(map);
    layerControl.addOverlay(tilfluktsromLayer, "Tilfluktsrom (GeoJSON)");
    map.fitBounds(tilfluktsromLayer.getBounds());

    // Hovedinteraksjon: klikk i kartet
    map.on("click", (e) => {
      if (!sheltersData) return;

      const clickPoint = turf.point([e.latlng.lng, e.latlng.lat]);

      // --- A) Radius-filter ---
      if (filterCircle) map.removeLayer(filterCircle);
      filterCircle = L.circle(e.latlng, { radius: RADIUS_METERS }).addTo(map);

      const filtered = {
        type: "FeatureCollection",
        features: sheltersData.features.filter((f) => {
          const pt = turf.point(f.geometry.coordinates);
          const dKm = turf.distance(clickPoint, pt, { units: "kilometers" });
          return dKm <= RADIUS_KM;
        })
      };

      // Oppdater resultatlista i UI (høyre panel)
      const resultsDiv = document.getElementById("resultsList");
      if (resultsDiv) {
      if (filtered.features.length === 0) {
        resultsDiv.innerHTML = `<i>Ingen funn innen ${RADIUS_METERS} m.</i>`;
        } else {
      const items = filtered.features
      .map((f) => {
        const p = f.properties || {};
        return `<li><b>${p.adresse ?? "Ukjent adresse"}</b> — ${p.plasser ?? "?"} plasser (romnr ${p.romnr ?? "?"})</li>`;
      })
      .join("");

        resultsDiv.innerHTML = `<ul>${items}</ul>`;
  }
}


      filteredLayer.clearLayers();
      filteredLayer.addData(filtered).addTo(map);

      // --- B) Nærmeste tilfluktsrom ---
      const { feature, distKm } = findNearestShelter(e.latlng, sheltersData);
      if (!feature) return;

      const distMeters = Math.round(distKm * 1000);
      const p = feature.properties || {};

      const nearestText = document.getElementById("nearestText");
      if (nearestText) {
        nearestText.innerHTML = `
          Avstand: <b>${distMeters} m</b><br>
          Adresse: <b>${p.adresse ?? "(mangler)"}</b><br>
          Plasser: ${p.plasser ?? "?"}<br>
          Romnr: ${p.romnr ?? "?"}
        `;
      }

      if (clickMarker) map.removeLayer(clickMarker);
      clickMarker = L.circleMarker(e.latlng, { radius: 6 }).addTo(map);

      const nearestLatLng = L.latLng(
        feature.geometry.coordinates[1],
        feature.geometry.coordinates[0]
      );

      if (nearestMarker) map.removeLayer(nearestMarker);
      nearestMarker = L.circleMarker(nearestLatLng, { radius: 8 }).addTo(map);

      if (nearestLine) map.removeLayer(nearestLine);
      nearestLine = L.polyline([e.latlng, nearestLatLng]).addTo(map);
    });

    console.log("Lastet:", data.features.length, "tilfluktsrom");
  })
  .catch((error) => {
    console.error("Feil ved lasting av GeoJSON:", error);
  });
