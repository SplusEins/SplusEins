# !/bin/bash

# Rerun after changes to OSM data (e. g. adding new rooms or changing existing ones)

DATA_QUERY='[out:json][timeout:25]; nwr["indoor"="room"]["ref"~""](52.174312,10.542111,52.183790,10.564728); out tags geom;'

curl -X GET --data-urlencode "data=${DATA_QUERY}" "https://overpass-api.de/api/interpreter" | jq '.elements | map({id: .id, level: .tags.level, ref: .tags.ref}) | map({(.ref): {id: .id, level: .level}}) | add' > ../assets/overpassOSMRoomsData.json