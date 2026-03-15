# GIS Beredskapskart – Evakuering av skoleelever

## Problemstilling og TLDR

Hvordan kan geografiske analyser brukes til å vurdere beredskap og evakueringsmuligheter for skoleelever i Norge?

Prosjektet undersøker nærhet mellom skoler, tilfluktsrom og nødetater gjennom et interaktivt webkart som utfører romlig analyse direkte mot en PostGIS-database.

Prosjektet er laget som en IT-faglig case for å demonstrere bruk av webkart, romlige databaser og GIS-analyse i praksis.


---

## Demo

![Demo av webkartet](docs/Demo.gif)

---

## System Architecture

Brukerinteraksjon:
1. Bruker klikker i kartet
2. Frontend sender koordinater til Supabase RPC
3. PostGIS utfører:
 - nearest analyse
 - radius-søk
4. Resultat returneres som GeoJSON
5. Kart og analysepanel oppdateres

Systemet kombinerer:
 - statiske datasett (GeoJSON)
 - eksterne OGC-tjenester (Kartverket WMS)
 - romlig database (PostGIS)

---

## Teknisk stack

| Teknologi | Rolle |
|-----------|------|
| Leaflet 1.9 | Webkart |
| Supabase | Backend / PostGIS |
| PostGIS | Spatial analyse |
| GeoJSON | Statisk GIS-data |
| Kartverket WMS | Ekstern OGC tjeneste |
| Overpass / OSM | Beredskapsressurser |
| VS Code | Utviklingsmiljø |
| GitHub | Versjonskontroll |

---

## Spatial analyse

Romlig analyse utføres på to nivåer:

### Frontend (Leaflet)
- Nearest-analyse for skoler og nødetater basert på GeoJSON
- Radiusfiltering av lokale datasett

### Backend (PostGIS i Supabase)
- SQL-funksjon for å finne nærmeste tilfluktsrom
- SQL-funksjon for å finne alle tilfluktsrom innen radius

Dette viser hvordan spatial analyse kan flyttes fra klient til database for bedre ytelse og skalerbarhet.

---

## Datakatalog

| Datasett | Kilde | Format | Bearbeiding |
|---------|------|-------|-------------|
| Offentlige tilfluktsrom | GeoNorge | PostGIS | Importert til Supabase og brukt i spatial SQL |
| Grunnskoler | GeoNorge | GeoJSON | Filtrert og visualisert statisk |
| Videregående skoler | GeoNorge | GeoJSON | Visualisert statisk |
| Sivilforsvarsdistrikter | GeoNorge | GeoJSON | Polygonlag |
| Nødetater (politi, brann, sykehus) | OpenStreetMap | GeoJSON | Hentet via Overpass |
| Fjellskygge WMS | Kartverket | WMS | Ekstern OGC overlay |
| Topo4 WMS | Kartverket | WMS | Ekstern OGC overlay |

---

## Funksjonalitet

Kartet lar brukeren:

- Klikke i kartet for å analysere beredskap i området
- Se alle ressurser innenfor en radius på 5 km
- Få beregnet nærmeste:
  - tilfluktsrom
  - grunnskole
  - videregående skole
  - beredskapsressurs (politi, brann eller sykehus)
- Visualisere avstand med linje i kartet
- Tooltip og popup på alle objekter
- Slå av/på datalag med Layer Control
- Panel med analyseresultat

---

## Arkitektur
- GeoJSON → Leaflet
- WMS → kartoverlay
- Kartklikk → Supabase RPC → PostGIS analyse
- Resultat → visualisering i kart og panel

## Refleksjon og forbedringspunkter
- Systemet bruker en fast radius og kunne hatt dynamisk radiusvalg
- Flere analyser kunne vært flyttet til PostGIS for bedre ytelse
- Nettverksanalyse (rute langs vei) kunne gitt mer realistiske avstander
- UI kan forbedres med bedre layout og responsivt design
- Datasett kan oppdateres dynamisk via API i stedet for statiske filer

## Begrensninger
- Analyse baserer seg på luftlinjeavstand
- Kapasitetsdata for tilfluktsrom er teoretiske
- Private tilfluktsrom er ikke inkludert
- Evakueringstid påvirkes av trafikk og organisering
- Datasettene er statiske øyeblikksbilder

---

## Kjoring lokalt

1. Klon repoet

2. Lag config.js med Supabase-nøkler

3. Start lokal server:

npx live-server

4. Åpne nettleser på localhost

---

## Oppdatere beredskapsdata (Overpass)

Kjor scriptet:

```powershell
python scripts/overpass_data.py
```

Output skrives til:

- [data/emergency_resources_police.geojson](data/emergency_resources_police.geojson)
- [data/emergency_resources_fire.geojson](data/emergency_resources_fire.geojson)
- [data/emergency_resources_hospital.geojson](data/emergency_resources_hospital.geojson)


