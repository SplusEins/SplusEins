# !/bin/bash

set -e # Fail if errors occur
set -o pipefail

# Rerun after changes to OSM data (e. g. adding new rooms or changing existing ones)

# Get the directory of the script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Define output file path
OUTPUT_FILE="${SCRIPT_DIR}/../assets/overpassOSMRoomsData.json"

DATA_QUERY='[out:json][timeout:25]; nwr["indoor"="room"]["ref"~""](52.174312,10.542111,52.183790,10.564728); out tags geom;'

echo "Fetching OSM data..."

# Ensure the assets directory exists
mkdir -p "$(dirname "$OUTPUT_FILE")"

curl -X GET --data-urlencode "data=${DATA_QUERY}" "https://overpass-api.de/api/interpreter" | \
  jq '.elements | map({id: .id, level: .tags.level, ref: .tags.ref}) | map({(.ref): {id: .id, level: .level}}) | add' > "$OUTPUT_FILE"

# Validate JSON
if ! jq empty "$OUTPUT_FILE" 2>/dev/null; then
  echo "[ERROR] Invalid JSON generated!"
  exit 1
fi

echo "✓ Successfully saved room data to $OUTPUT_FILE"