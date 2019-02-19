#!/bin/sh
cd build-result/assets
pwd
printenv
sed -i "s/Teammitglied1/$TEAM_MEMBER1/g" protected-information.json
sed -i "s/Teammitglied2/$TEAM_MEMBER2/g" protected-information.json
sed -i "s/Teammitglied3/$TEAM_MEMBER3/g" protected-information.json
sed -i "s/Teammitglied4/$TEAM_MEMBER4/g" protected-information.json
cd ../..
cp -R build-result/. build-result-prod/
