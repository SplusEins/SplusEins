#!/bin/bash

set -e # Fail if errors occur
set -o pipefail

# Rerun after changes to OSM data (e. g. adding new rooms or changing existing ones)

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Define output file path
OUTPUT_FILE="${SCRIPT_DIR}/../assets/overpass_osm/"


## SAMPLE DATA_QUERY='[out:json][timeout:25]; nwr["indoor"="room"]["ref"~""](52.174312,10.542111,52.183790,10.564728); out tags geom;'

QUERY_BEGINNING='[out:json][timeout:25]; nwr["indoor"="room"]["ref"~""]('
QUERY_END='); out tags geom;'

# Wolfenbüttel Campus:
BBOX_WF='52.174312,10.542111,52.183790,10.564728'
# http://bboxfinder.com/#52.174312,10.542111,52.183790,10.564728

# Salzgitter Campus Calbrecht:
BBOX_SZ='52.081906,10.371480,52.092744,10.390105'
# http://bboxfinder.com/#52.081906,10.371480,52.092744,10.390105

# Campus Wolfsburg
BBOX_WOB='52.423550,10.774144,52.426504,10.788885'
# http://bboxfinder.com/#52.423550,10.774144,52.426504,10.788885

# Campus Suderburg: 
BBOX_SUD='52.896564,10.443470,52.898713,10.448105'
# http://bboxfinder.com/#52.896564,10.443470,52.898713,10.448105

echo "Fetching OSM data..."

# Ensure the assets directory exists
mkdir -p "$(dirname "$OUTPUT_FILE")"

# TODO: Für Wolfenbüttel, Suderburg, Wolfsburg, Salzgitter

# Function to fetch and process OSM data with retry logic
fetch_osm_data() {
  local campus_name=$1
  local bbox=$2
  local output_file="${OUTPUT_FILE}${campus_name}.json"
  local query="${QUERY_BEGINNING}${bbox}${QUERY_END}"
  local max_retries=3
  local retry_delay=5
  
  echo "Fetching ${campus_name}..."
  
  for ((i=1; i<=max_retries; i++)); do
    local response=$(curl -s --data "data=${query}" "https://overpass-api.de/api/interpreter")
    
    # Check if response is valid JSON
    if echo "$response" | jq empty 2>/dev/null; then
      echo "$response" | jq '.elements | map({id: .id, level: .tags.level, ref: .tags.ref}) | map({(.ref): {id: .id, level: .level}}) | add' > "$output_file"
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

# Wolfenbüttel:
fetch_osm_data "WF" "$BBOX_WF"
sleep 2

# Suderburg:
fetch_osm_data "SUD" "$BBOX_SUD"
sleep 2

# Salzgitter:
fetch_osm_data "SZ" "$BBOX_SZ"
sleep 2

# Wolfsburg:
fetch_osm_data "WOB" "$BBOX_WOB"

echo ""
echo "Done! All campus data fetched successfully."
