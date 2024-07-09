#!/bin/bash


echo "INit db"
mysql -u root -ptsyJfW2IfAM -e "CREATE USER 'pinnacle'@'%' IDENTIFIED BY 'tsyJfW2IfAM'; GRANT ALL PRIVILEGES ON * . * TO 'pinnacle'@'%';FLUSH PRIVILEGES;"
mysql -u root -ptsyJfW2IfAM -e "DROP DATABASE pinnacle_test"
mysql -u root -ptsyJfW2IfAM -e "CREATE DATABASE pinnacle_test"
mysql -u pinnacle -ptsyJfW2IfAM pinnacle_test -h mysql < pinnacle.sql