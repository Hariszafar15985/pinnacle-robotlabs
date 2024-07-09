#!/bin/bash


echo "INit db"
mysql -u root -p49loD87uE5s -e "CREATE USER 'pinnacle'@'%' IDENTIFIED BY '49loD87uE5s'; GRANT ALL PRIVILEGES ON * . * TO 'pinnacle'@'%';FLUSH PRIVILEGES;"
mysql -u root -p49loD87uE5s -e "DROP DATABASE pinnacle"
mysql -u root -p49loD87uE5s -e "CREATE DATABASE pinnacle"
mysql -u pinnacle -p49loD87uE5s pinnacle -h mysql < pinnacle.sql
