#!/bin/bash
 
################################################################
##
##   MySQL Database Backup Script 
##   Written By: Rahul Kumar
##   URL: https://tecadmin.net/bash-script-mysql-database-backup/
##   Last Update: Jan 05, 2019
##
################################################################
 
export PATH=/bin:/usr/bin:/usr/local/bin
TODAY=`date +"%d%b%Y"`
 
################################################################
################## Update below values  ########################

DB_BACKUP_PATH='../../backup/pinnacle_license/dbbackup'
MYSQL_HOST='crm-master-db-01'
MYSQL_PORT='3306'
MYSQL_USER='root'
MYSQL_PASSWORD='tsyJfW2IfAM'
DATABASE_NAME='pinnacle'
BACKUP_RETAIN_DAYS=3   ## Number of days to keep local backup copy

# TBFIXED 
#MYSQL_LUSER='root'
#MYSQL_LPASSWD='bhyUIbEr12'
#MYSQL_LPORT='3307'

#################################################################

#echo "Please specify container to run backup on"
#echo "master-db-01, master-db-02"
#read MYSQL_HOST

#echo "Please specify what database you want to backup"
#echo "ncb, other?"
#read DATABASE_NAME

 
#docker exec -it $BEAT mkdir -p ${DB_BACKUP_PATH}/${TODAY}
mkdir -p ${DB_BACKUP_PATH}/${TODAY}
echo "Backup started for database - ${DATABASE_NAME}"

echo "dumping" 

ssh root@$MYSQL_HOST mysqldump -h localhost  \
   -P ${MYSQL_PORT} \
   -u ${MYSQL_USER} \
   -p${MYSQL_PASSWORD} \
   ${DATABASE_NAME} | gzip > ${DB_BACKUP_PATH}/${TODAY}/${DATABASE_NAME}-${TODAY}.sql.gz #${DB_BACKUP_PATH}/${TODAY}/${DATABASE_NAME}-${TODAY}.sql


 
if [ $? -eq 0 ]; then
  echo "Database backup successfully completed"
else
  echo "Error found during backup"
fi
 
ls -lsa ${DB_BACKUP_PATH}/${TODAY}

##### Remove backups older than {BACKUP_RETAIN_DAYS} days  #####
 
DBDELDATE=`python -c 'import sys; from datetime import datetime, timedelta; print((datetime.now()-timedelta(days=int(sys.argv[1]))).strftime("%d%b%Y") )'  "$BACKUP_RETAIN_DAYS"`
 
if [ ! -z ${DB_BACKUP_PATH} ]; then
      cd ${DB_BACKUP_PATH}
      if [ ! -z ${DBDELDATE} ] && [ -d ${DBDELDATE} ]; then
            rm -rf ${DBDELDATE}
      fi
fi
 
### End of script ####





