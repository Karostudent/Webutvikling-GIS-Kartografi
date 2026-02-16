# 🇳🇴 Tilfluktsrom – Interaktivt Webkart

## TL;DR
Dette prosjektet er et interaktivt webkart bygget med Leaflet som visualiserer offentlige tilfluktsrom i Norge. Løsningen kombinerer statiske GeoJSON-data med eksterne OGC WMS-tjenester fra Kartverket, og implementerer romlig filtrering og nærmeste-nabo-analyse direkte i nettleseren ved hjelp av Turf.js. Prosjektet demonstrerer håndtering av koordinatsystemer, datatransformasjon og klientbasert romlig analyse.

---

## 🎬 Demo av system
*(Legg inn GIF eller video her)*

Eksempel:
- Slå av/på lag
- Klikk i kartet → se radius-filter
- Se liste over tilfluktsrom innen radius
- Se avstand til nærmeste tilfluktsrom

---

## 🧱 Teknisk Stack

| Teknologi | Versjon | Bruksområde |
|-----------|----------|-------------|
| Leaflet | 1.9.x | Kartbibliotek |
| Turf.js | 6.x | Romlig analyse i nettleser |
| Kartverket WMS | OGC WMS | Eksternt kartlag |
| GeoJSON | – | Statisk datasett |

---

## 📊 Datakatalog

| Datasett | Kilde | Format | Bearbeiding |
|-----------|--------|---------|-------------|
| Tilfluktsrom (hele Norge) | GeoNorge / DSB | GeoJSON | Kontroll av koordinatsystem (CRS84 / EPSG:4326) |
| Topografisk bakgrunnskart | Kartverket | OGC WMS | Lastet direkte som WMS-layer |

---

## 🗺 Arkitektur / Dataflyt

GeoJSON (statisk fil)
↓
Fetch i app.js
↓
Leaflet GeoJSON-layer
↓
Brukerinteraksjon (klikk i kart)
↓
Turf.js romlig analyse

Filtrering innen radius

Nærmeste tilfluktsrom
↓
Oppdatering av kart (layers, markører, linjer)
↓
Oppdatering av UI (resultatliste og avstand)




### Forklaring

Applikasjonen laster tilfluktsrom som en statisk GeoJSON-fil og visualiserer dem i Leaflet.  
Kartet integrerer også eksterne OGC WMS-tjenester fra Kartverket.

Ved klikk i kartet utføres romlig analyse direkte i nettleseren ved hjelp av Turf.js:

- Punkter filtreres innenfor en definert radius.
- Nærmeste tilfluktsrom beregnes ved hjelp av avstandsfunksjon.
- Resultatene visualiseres dynamisk både i kartet og i et sidepanel.

---

## 🌍 Koordinatsystemer

Datasettet er levert i CRS84 (tilsvarende WGS84 / EPSG:4326), som er kompatibelt med webkart og Leaflet.

Tidligere versjoner av datasettet var levert i UTM (EPSG:25832/25833), og ble reprojisert i QGIS til EPSG:4326 for korrekt bruk i webapplikasjonen.

Leaflet opererer internt med Web Mercator (EPSG:3857) for visning, mens GeoJSON-dataene benytter lon/lat i grader.

---

## 🔍 Implementert funksjonalitet

- Visualisering av alle tilfluktsrom i Norge
- Datadrevet styling basert på kapasitet (antall plasser)
- Eksternt OGC WMS-lag fra Kartverket
- Layer control (av/på-funksjon)
- Romlig filtrering innen valgt radius
- Beregning av avstand til nærmeste tilfluktsrom
- Dynamisk resultatliste

---

## 🧠 Refleksjon og forbedringspunkter

- Applikasjonen utfører all romlig analyse klientbasert. Ved svært store datasett kunne ytelsen forbedres ved bruk av server-side spørringer (f.eks. PostGIS).
- Marker clustering kunne forbedret lesbarheten ved zoomet ut visning.
- Radius-verdi kunne vært gjort dynamisk via slider/input.
- WMS-laget kunne vært supplert med flere temalag.
- UI kan videreutvikles for bedre mobiltilpasning.

---

## 🚀 Videre utvikling

Mulige forbedringer:
- Implementere søk på adresse eller kommune
- Integrere Supabase/PostGIS for dynamiske SQL-spørringer
- Implementere vektorbaserte kart (MapLibre)
- Lage mer avansert romlig analyse (f.eks. dekningsanalyse)

---

## 📌 Prosjektkrav – Oppfyllelse

✔ Leaflet brukt som kartbibliotek  
✔ GeoJSON som statisk datakilde  
✔ Eksternt OGC API (Kartverket WMS)  
✔ Klikkbare objekter med popup  
✔ Datadrevet styling  
✔ Layer control  
✔ Minst én romlig filtrering (radius + nearest)  

---

## 📂 Struktur
webkart-oppgave1/
│
├── index.html
├── style.css
├── app.js
└── data/
└── mine_data2.geojson


---

## 👨‍💻 Forfatter

Karoline Aas-Mehren
IS-218 – GIS, KI og IoT

