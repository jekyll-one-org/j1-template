#!/usr/bin/env bash

FOLDER=/Users/jadams/test_files/
TEST_FILES_PATH=${FOLDER}/files/
FILE=name
COUNT=3
SIZE=1M
SLICE=1M
TYPE=random

# Do write test of $COUNT files
$(dd if=/dev/urandom bs=${SIZE} count=${COUNT} 2> ${FILE}.measures | split -b ${SLICE} - ${TEST_FILES_PATH}${FILE}.)

dd_write=$(cat ${FILE}.measures | grep -v records | sed 's/.* s,//')
echo ${dd_write}


FILES=$(find ${TEST_FILES_PATH} -type f -print)

for f in $FILES; do
  # echo "Processing $f file..."
  dd_read+=$(dd if=${f} of=/dev/null 2>&1 | grep -v records | sed 's/.* s,//')
done

echo ${dd_read}

cd ..
rm -f ${TEST_FILES_PATH}${FILE}\.*
