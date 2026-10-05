#!/bin/bash

set -e # Fail if errors occur
set -o pipefail

# Rerun after changes to OSM data (e. g. adding new rooms or changing existing ones)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/../assets/overpass_osm/"

# Root-Relationen der Campus (Relation -> Gebäude-Relationen -> Outline + Räume)
REL_WF=21498810
REL_SUD=0 # TODO: ID eintragen
REL_SZ=0  # TODO: ID eintragen
REL_WOB=0 # TODO: ID eintragen

# Query:
# 1. Root-Relation -> Gebäude-Relationen (.buildings), mit members (out body)
# 2. Alle Ways dieser Gebäuderelationen (Outline + Räume), nur Tags + Bounding Box
build_query() {
  local root_id=$1
  echo "[out:json][timeout:60];
rel(id:${root_id});
rel(r)->.buildings;
.buildings out body;
way(r.buildings);
out tags bb;"
}

# jq-Filter: Gebäude (Name + Adresse), keyed by Relation-ID
JQ_BUILDINGS='
  (.elements | map(select(.type=="way") | {key: (.id|tostring), value: .}) | from_entries) as $ways
  | [.elements[] | select(.type=="relation" and .tags.type=="building")]
  | map(
      . as $r
      | ([$r.members[] | select(.role=="outline") | $ways[(.ref|tostring)]] | first // {}) as $o
      | {
          key: ($r.id | tostring),
          value: {
            name:        ($o.tags["name"] // $r.tags["name"]),
            street:      ($o.tags["addr:street"]),
            housenumber: ($o.tags["addr:housenumber"] // $o.tags["addr:Housenumber"]),
            postcode:    ($o.tags["addr:postcode"]),
            city:        ($o.tags["addr:city"])
          }
        }
    )
  | from_entries
'

# jq-Filter: Räume (wie bisher, keyed by ref), plus Verweis auf das Gebäude
JQ_ROOMS='
  (.elements | map(select(.type=="way") | {key: (.id|tostring), value: .}) | from_entries) as $ways
  | [.elements[] | select(.type=="relation" and .tags.type=="building")]
  | map(
      . as $r
      | $r.members[]
      | select(.role=="part:indoor")
      | $ways[(.ref|tostring)]
      | select(. != null and .tags.ref != null)
      | {(.tags.ref): {id: .id, level: .tags.level, building: $r.id, bounds: .bounds}}
    )
  | add // {}
'

echo "Fetching OSM data..."
mkdir -p -- "$OUTPUT_DIR"

fetch_osm_data() {
  local campus_name=$1
  local root_id=$2
  local buildings_file="${OUTPUT_DIR}${campus_name}_buildings.json"
  local rooms_file="${OUTPUT_DIR}${campus_name}_rooms.json"
  local query
  query=$(build_query "$root_id")
  local max_retries=3
  local retry_delay=5

  echo "Fetching ${campus_name}..."

  for ((i = 1; i <= max_retries; i++)); do
    local response
    response=$(curl -s -H "User-Agent: spluseins-api/1.0.0 (https://github.com/SplusEins/SplusEins)" \
      --data-urlencode "data=${query}" "https://overpass-api.de/api/interpreter") || true

    # Valid JSON UND .elements vorhanden (Overpass liefert bei Timeouts teils JSON mit "remark")
    if echo "$response" | jq -e '.elements' >/dev/null 2>&1; then
      echo "$response" | jq "$JQ_BUILDINGS" >"$buildings_file"
      echo "$response" | jq "$JQ_ROOMS" >"$rooms_file"
      echo "✓ Saved ${buildings_file} and ${rooms_file}"
      return 0
    else
      if [[ $i -lt $max_retries ]]; then
        echo "⚠ Attempt $i failed. Retrying in ${retry_delay}s..."
        sleep $retry_delay
      else
        echo "[ERROR] ${campus_name}: Failed after ${max_retries} attempts"
        echo "$response" | head -5
        return 1
      fi
    fi
  done
}

fetch_osm_data "WF" "$REL_WF"
sleep 2
# fetch_osm_data "SUD" "$REL_SUD"
# sleep 2
# fetch_osm_data "SZ" "$REL_SZ"
# sleep 2
# fetch_osm_data "WOB" "$REL_WOB"

echo ""
echo "Done! All campus data fetched successfully."
