#!/bin/bash
set -e # fail on any error

echo '* Working around permission errors locally by making sure that "mysql" uses the same uid and gid as the host volume'
TARGET_UID=$(stat -c "%u" /var/lib/mysql)
echo '-- Setting mysql user to use uid '$TARGET_UID
usermod -o -u $TARGET_UID mysql || true
TARGET_GID=$(stat -c "%g" /var/lib/mysql)
echo '-- Setting mysql group to use gid '$TARGET_GID
groupmod -o -g $TARGET_GID mysql || true
echo
echo '* Starting MySQL'
chown -R mysql:root /var/run/mysqld/
/usr/local/bin/docker-entrypoint.sh mysqld --user=mysql --console