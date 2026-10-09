#!/bin/bash

set -e # Fail if errors occur
set -o pipefail

# Rerun after changes to OSM data (e. g. adding new rooms or changing existing ones)

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT_DIR="${SCRIPT_DIR}/../assets/overpass_osm/"

# Root-Relationen der Campus (Relation -> Gebäude-Relationen -> Outline + Räume)
REL_WF=21498810
REL_SUD=21499858
REL_SZ=0  # TODO: ID eintragen
REL_WOB=0 # TODO: ID eintragen

# 1. Root-Relation -> Gebäude-Relationen (.buildings), mit members
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

# Pro Raum (key = ref): id, level, building:name, building:addr, bounds
JQ_ROOMS='
  (.elements | map(select(.type=="way") | {key: (.id|tostring), value: .}) | from_entries) as $ways
  | [.elements[] | select(.type=="relation" and .tags.type=="building")]
  | map(
      . as $r
      | ([$r.members[] | select(.role=="outline") | $ways[(.ref|tostring)]] | first // {}) as $o
      | ($o.tags // {}) as $t
      | ($t["addr:housenumber"] // $t["addr:Housenumber"]) as $hn
      | ([$t["addr:street"], $hn]            | map(select(. != null)) | join(" ")) as $line1
      | ([$t["addr:postcode"], $t["addr:city"]] | map(select(. != null)) | join(" ")) as $line2
      | ([$line1, $line2] | map(select(. != "")) | join(", ")) as $addr
      | ($t["name"] // $r.tags["name"]) as $bname
      | $r.members[]
      | select(.role=="part:indoor")
      | $ways[(.ref|tostring)]
      | select(. != null and .tags.ref != null)
      | {(.tags.ref): {
          id: .id,
          level: .tags.level,
          "building:name": $bname,
          "building:addr": (if $addr == "" then null else $addr end),
          bounds: .bounds
        }}
    )
  | add // {}
'

echo "Fetching OSM data..."
mkdir -p -- "$OUTPUT_DIR"

fetch_osm_data() {
  local campus_name=$1
  local root_id=$2
  local output_file="${OUTPUT_DIR}${campus_name}.json"
  local query
  query=$(build_query "$root_id")
  local max_retries=3
  local retry_delay=5

  echo "Fetching ${campus_name}..."

  for ((i=1; i<=max_retries; i++)); do
    local response
    response=$(curl -s -H "User-Agent: spluseins-api/1.0.0 (https://github.com/SplusEins/SplusEins)" \
      --data-urlencode "data=${query}" "https://overpass-api.de/api/interpreter") || true

    # Valid JSON UND .elements vorhanden (Overpass liefert bei Timeouts teils JSON mit "remark")
    if echo "$response" | jq -e '.elements' >/dev/null 2>&1; then
      echo "$response" | jq "$JQ_ROOMS" > "$output_file"
      echo "✓ Successfully saved room data to ${output_file}"
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
fetch_osm_data "SUD" "$REL_SUD"
sleep 2
# fetch_osm_data "SZ" "$REL_SZ"
# sleep 2
# fetch_osm_data "WOB" "$REL_WOB"

echo ""
echo "Done! All campus data fetched successfully."
