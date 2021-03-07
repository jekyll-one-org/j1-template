#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# j1fsp.sh
#
# DESCRIPTION
#   Perform r/w performance tests for filesystems used by an application
#   like J1 Template  
#
# ------------------------------------------------------------------------------
# Version:          0.0.1
# Author:           Juergen Adams (juergen@jekyll-one.com)
# Created:          2018-11-08
# Last modified:
# ------------------------------------------------------------------------------
# NOTE:
# 
# ------------------------------------------------------------------------------
# TODO:
#
# ------------------------------------------------------------------------------
# SNIPPETS:
#
# Create testfiles using split
# $(dd if=/dev/urandom bs=${SIZE} count=${COUNT} 2> ${TEST_MEASURES} | split -b ${SLICE} - ${TEST_FILE_FOLDER}/${FILE}.)
#
# remove unneeded output
# dd_write=$(cat ${TEST_MEASURES} | grep -v records | ${SED_CMD} 's/.* s,//')
#
# extract the unit
# ${UNIT}=$(echo ${dd_write}| ${SED_CMD} 's/[0-9 . ,]//g')
#
# extract amount of data processed
# dd_amount=$(cat ${TEST_MEASURES} | grep -v records | ${SED_CMD} 's/ copied.*//')
#
# ------------------------------------------------------------------------------


# ==============================================================================
# GLOBAL SETTINGS
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# BASE SETTINGS
# ------------------------------------------------------------------------------
SCRIPT="$0"
SCRIPT_NAME=${0##*/}
PARENT_PATH=${0%/*}
HOMEPATH=`cd $PARENT_PATH &>/dev/null; pwd`
MYPID=$$

# ------------------------------------------------------------------------------
# RESOURCE SETTINGS
# ------------------------------------------------------------------------------
TEST_FOLDER=${PWD}/TEST_${MYPID}
TEST_MEASURES=${TEST_FOLDER}/measures
TEST_FILE_FOLDER=${TEST_FOLDER}/files/
FILE=tfile
UNIT="MB/s"
TYPE=random
RANDOM_DEV=/dev/urandom
ZERO_DEV=/dev/zero
IFLAG_DIRECT=direct         # direct I/O for data is used to avoid FS cache
OFLAG_DIRECT=direct         # same as IFLAG_DIRECT
OFLAG_DSYNC=sync            # write process is blocked until all data and meta data are written
FLUSH_CACHE=true            # write all FS cached data to disk


# Do NOT modify anything beyond this line!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
# ==============================================================================

# ------------------------------------------------------------------------------
# ANSI ESCAPE TEXT COLOR CODES
# ------------------------------------------------------------------------------
NO_COLOR='\033[0m'
WHITE='\033[1;37m'
BLACK='\033[0;30m'
DARK_GRAY='\033[1;30m'
DARK_GREY='\033[1;30m'
LIGHT_GRAY='\033[0;37m'
LIGHT_GRAY='\033[0;37m'
RED='\033[0;31m'
LIGHT_RED='\033[1;31m'
GREEN='\033[0;32m'
LIGHT_GREEN='\033[1;32m'
ORANGE='\033[0;33m'
BROWN='\033[0;33m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
LIGHT_BLUE='\033[1;34m'
PURPLE='\033[0;35m'
LIGHT_PURPLE='\033[1;35m'
CYAN='\033[0;36m'
LIGHT_CYAN='\033[1;36m'

# ------------------------------------------------------------------------------
# ANSI ESCAPE TEXT ATTRIBUTE CODES
# ------------------------------------------------------------------------------
BLINK='\033[5m'
NC='\033[0m'

# ==============================================================================
# COLLECT CMD LINE OPTIONS
# ------------------------------------------------------------------------------
USAGE=false
VERBOSE=false

while getopts c:m:s:hS OPT
do
  case "$OPT" in
    h)  USAGE=true;;
    m)  MODE="${OPTARG}";;
    c)  COUNT="${OPTARG}";;
    s)  SIZE="${OPTARG}";;
    S)  STATS=true;;
  esac
done

# ------------------------------------------------------------------------------
# j1fsp DEFAULT SETTINGS
# ------------------------------------------------------------------------------
#SED_CMD="gsed"
SED_CMD="sed"
AWK_CMD="awk"
DATE_CMD="date"
DEFAULT_DATE_FORMAT="+%F"
DEFAULT_TIME_FORMAT="+%H:%M:%S"
PRECISION="2"
M_BYTES=1048576
SECONDS=0
if [[ -z ${COUNT} ]]; then COUNT=10; fi
if [[ -z ${MODE} ]]; then MODE="sync"; fi
if [[ -z ${SIZE} ]]; then SIZE=1M; fi
if [[ -z ${STATS} ]]; then STATS=false; fi

# ==============================================================================
# LOCAL FUNCTIONS
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
#    usage ()
#
#    DESCRIPTION        print the usage text
#    SYNOPSIS           usage
#
# ------------------------------------------------------------------------------
function usage () {
#set +x

clear
echo

cat <<EOF
  $SCRIPT_NAME [-c <count> -s <size> -m <mode> -S] | -h

      -h            Prints this help
      -c <num>      Number of test files, default: 10
      -m <mode>     FS buffer cache usage [sync|direct], default: sync 
      -s <size>     Size of test files, default: 1M
      -S            Measure CPU|Memory speeds, default: false

  Example/s:

  Creates read|write test for 10 files if 1M of size, buffer cache used
    $SCRIPT_NAME 

  Creates read|write test for 50 files if 1M of size, no buffer cache used
    $SCRIPT_NAME -c 50 -m direct

  Creates read|write test for 30 files if 4M of size
    $SCRIPT_NAME -c 30 -s 4M

  Print usage (help)
    $SCRIPT_NAME -h

EOF

#set -x
}

# ------------------------------------------------------------------------------
#    win_to_unix_path ()
#
#    DESCRIPTION        used to convert e.g. "C:\Program Files\Docker Toolbox" 
#                       to "/c/Program Files/Docker Toolbox"
#    SYNOPSIS           win_to_unix_path WINDOWS_PATH
#
# ------------------------------------------------------------------------------
win_to_unix_path(){
#set -x
local WINDOWS_PATH=$1
local WORK_DIR="$(pwd)"
local PATH_CONVERTED

	cd "${WINDOWS_PATH}"
		PATH_CONVERTED="$(pwd)"
	cd "${WORK_DIR}"

	echo ${PATH_CONVERTED}

#set +x
}

# ==============================================================================
# MAIN
# ------------------------------------------------------------------------------
#set -x

${USAGE} && usage && exit 0

DATE=$(${DATE_CMD} ${DEFAULT_DATE_FORMAT})
TIME=$(${DATE_CMD} ${DEFAULT_TIME_FORMAT})
echo
echo "${SCRIPT_NAME} START: ${DATE} ${TIME}"

# flush FS buffers to disk
${FLUSH_CACHE} && sync; sync

# Create test folder
mkdir -p ${TEST_FILE_FOLDER}

UNIT_SIZE=$(echo ${SIZE} | ${SED_CMD} 's/[MG]//g')

if [[ ${STATS} ]]; then
  CPU_SPEED=$(dd if=/dev/urandom of=/dev/null bs=1M count=100 2>&1 | grep -v records | ${SED_CMD} 's/.*s,//')
  MEM_SPEED=$(dd if=/dev/zero of=/dev/null bs=1M count=100 2>&1 | grep -v records | ${SED_CMD} 's/.*s,//')
fi

if [[ ${MODE} == "sync" ]]; then
  DD_FLAG="sync"
elif [[ ${MODE} == "direct" ]]; then
  DD_FLAG="direct"
else
  DD_FLAG="sync"
fi

# run performance test to WRITE $COUNT files of size $SIZE
# ------------------------------------------------------------------------------
for (( i=1; i<=${COUNT}; i+=1 )); do
  dd_writes+=$(dd if=/dev/urandom of=${TEST_FILE_FOLDER}/${FILE}.${i} bs=${SIZE} count=1 oflag=${DD_FLAG} 2>&1 | grep -v records | ${SED_CMD} 's/.*s,//')
  #dd_writes+=$(dd if=/dev/urandom of=${TEST_FILE_FOLDER}/${FILE}.${MYPID}.${i} bs=${SIZE} count=1 2>&1 | grep -v records | ${SED_CMD} 's/.*s,//')
done

# remove unit string from all measures and replace multiple spaces
dd_writes=$(echo ${dd_writes} | ${SED_CMD} 's/MB\/s//g' | tr -s ' ')

# calculate the total throughput (float)
tot=0
for i in ${dd_writes[@]}; do
  tot=$(echo ${tot} ${i} | awk '{print $1 + $2}')  
done
dd_write=$(echo ${tot} ${COUNT} | awk '{print $1 / $2}')

# trim the precision (float) 
dd_write=$(echo ${dd_write} | awk '{printf "%.2f", $1}')

# calculate amount of data processed
dd_amount_b=$(echo ${M_BYTES} ${COUNT} ${UNIT_SIZE} | awk '{print $1*$2*$3}')
dd_amount_m=$(echo ${dd_amount_b} | awk '{printf "%.2f", $1/(1024*1024)}')
dd_amount="${dd_amount_b} bytes (${dd_amount_m} MB)"

# run performance test to READ previously created files
# ------------------------------------------------------------------------------
FILES=$(find ${TEST_FILE_FOLDER}/ -type f -print)

# read files and create results array dd_reads
for f in $FILES; do
  dd_reads+=$(dd if=${f} of=/dev/null iflag=${DD_FLAG} 2>&1 | grep -v records | ${SED_CMD} 's/.* s,//')  
  #dd_reads+=$(dd if=${f} of=/dev/null 2>&1 | grep -v records | ${SED_CMD} 's/.* s,//')  
done

# remove unit string from all measures and replace multiple spaces
dd_reads=$(echo ${dd_reads} | ${SED_CMD} 's/MB\/s//g' | tr -s ' ')

# calculate the total throughput (float)
tot=0
for i in ${dd_reads[@]}; do
  tot=$(echo ${tot} ${i} | awk '{print $1 + $2}')  
done
dd_read=$(echo ${tot} ${COUNT} | awk '{print $1 / $2}')

# trim the precision (float) 
dd_read=$(echo ${dd_read} | awk '{printf "%.2f", $1}')

dd_ratio=$(echo ${dd_read} ${dd_write} | awk '{print $1 / $2}')
dd_ratio=$(echo ${dd_ratio} | awk '{printf "%.2f", $1}')
dd_ratio_i=$(echo ${dd_ratio} | awk '{printf "%i", $1}')

TIME=$(${DATE_CMD} ${DEFAULT_TIME_FORMAT})
duration=$SECONDS
elapsed=$(echo "$(($duration / 60))m $(($duration % 60))s")
# print results
#
echo "${SCRIPT_NAME} END:   ${DATE} ${TIME}"
echo "${SCRIPT_NAME} TIME:  $elapsed"
echo
if [[ ${STATS} == "true" ]]; then
echo "${SCRIPT_NAME} CPU:  ${CPU_SPEED}" 
echo "${SCRIPT_NAME} MEM:  ${MEM_SPEED}"
echo
fi
echo "${SCRIPT_NAME} MODE:  ${MODE}"
echo "${SCRIPT_NAME} FSIZE: ${SIZE}"
if [[ ${COUNT} -lt 10 ]]; then
echo -e "${SCRIPT_NAME} FNUM:  ${RED}${COUNT}${NC}"
else
echo -e "${SCRIPT_NAME} FNUM:  ${GREEN}${COUNT}${NC}"
fi
echo "${SCRIPT_NAME} DATA:  ${dd_amount}"
echo
echo "${SCRIPT_NAME} READ:  ${dd_read} ${UNIT}"
echo "${SCRIPT_NAME} WRITE: ${dd_write} ${UNIT}"
if [[ ${dd_ratio_i} -lt 1 ]]; then
echo -e "${SCRIPT_NAME} RATIO:  ${RED}${dd_ratio}${NC} R|W"
else
echo -e "${SCRIPT_NAME} RATIO:  ${GREEN}${dd_ratio}${NC} R|W"
fi
echo

# Cleanup
rm -rf ${TEST_FOLDER}

#set +x
