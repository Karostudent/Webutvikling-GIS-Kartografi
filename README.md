# GIS Beredskapskart – Evakuering av skoleelever

## TLDR
Dette webkartet analyserer beredskap i Norge ved å vise nærmeste tilfluktsrom, skoler og nødetater fra et valgt punkt i kartet.  
Systemet kombinerer statiske GIS-filer, eksterne OGC-tjenester og en romlig database (PostGIS i Supabase).  
Brukeren kan utføre romlig analyse som radius-søk og nearest-beregninger direkte i nettleseren.

---

## Demo

![Demo av webkartet](docs/Demo.gif)

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
- Slå av/på datalag med Layer Control
- Se attributtdata via popup og tooltip
- Se datadrevet styling basert på kapasitet i tilfluktsrom

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

## Problemstilling
Hvordan kan et webbasert GIS-system brukes til å analysere beredskap for evakuering av skoleelever til nærmeste tilfluktsrom og nødetater i en krisesituasjon?

Prosjektet er laget som en IT-faglig case for å demonstrere bruk av webkart, romlige databaser og GIS-analyse i praksis.


## Kjoring lokalt

1. Start en enkel lokal server i prosjektroten.
2. Apne [index.html](index.html) via server-URL (ikke direkte file://).

Eksempel med Python:

```powershell
python -m http.server 8000
```

Deretter apner du http://localhost:8000/

## Oppdatere beredskapsdata (Overpass)

Kjor scriptet:

```powershell
python scripts/overpass_data.py
```

Output skrives til:

- [data/emergency_resources_police.geojson](data/emergency_resources_police.geojson)
- [data/emergency_resources_fire.geojson](data/emergency_resources_fire.geojson)
- [data/emergency_resources_hospital.geojson](data/emergency_resources_hospital.geojson)


