# ------------------------------------------------------------------------------
# ~/lib/functions
#
# DESCRIPTION
#   Function library used for PGW1|PGW3|MBG data collections and reports
#
# ------------------------------------------------------------------------------
# Version           1.0.8
# Author            Juergen Adams (juergen@jekyll-one.com)
# Created           2018-03-23 (Fri Mar 23 09:11:06 CEST 2018)
# Last modified     2018-04-30
# ------------------------------------------------------------------------------
# NOTE
#   Never use this library directly (as a script). This library is
#   intended to be sourced by bash applications and scripts to share
#   code.
#
# NOTE
#   To use this code, a GNU bash of version 4.1.2 or better is
#   needed (e.g. for the use of hashes|dictionaries using DECLARE -A)
#
# NOTE
#   Platforms tested: MacOS v10.9.5 CentOS release 6.6
#
# NOTE
#   Because of missing log data|migration (see OPTPSM-), for the time
#   range of 2018-02-12 to 2018-04-10 MBG historical data was placed
#   (same log file names) in an additional (sibling) folder in parallel
#   to the standard archived folder. If sibling data exists, those files
#   are needed to parsed as well to complete a data set
#
# ------------------------------------------------------------------------------
# TODO
#   Split up in several libs for log data (per carrier) and
#   database data access
#
# ------------------------------------------------------------------------------
# USED BY:
#
#   ~/scripts/vf_es_reporter/vf_es_reporter.sh
#
# ------------------------------------------------------------------------------

# ==============================================================================
# CONSTANTS
# ------------------------------------------------------------------------------

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

# ------------------------------------------------------------------------------
# STATE FLAGS|MESSAGES
# ------------------------------------------------------------------------------
S_VALID=valid                                                                   # valid state, resource|component available
S_INVALID=invalid                                                               # invalid state, resource|component NOT available
S_SUCCESS=success                                                               # operation successful
S_FAILED=failed                                                                 # operation failed
S_NO_DATA=no_data                                                               # no data

declare -A STATE=(
  [S_VALID]=${S_VALID}
  [S_INVALID]=${S_INVALID}
  [S_SUCCESS]=${S_SUCCESS}
  [S_FAILED]=${S_FAILED}
  [S_NO_DATA]=${S_NO_DATA}
)

declare -A STATE_MESSAGE=(
  [${S_VALID}]="component available"
  [${S_INVALID}]="component unavailable"
  [${S_SUCCESS}]="operation successful"
  [${S_FAILED}]="operation failed"
  [${S_NO_DATA}]="missing data"
)

# ------------------------------------------------------------------------------
# SUBSCRIPTION STATE FLAGS|MEANING PGW1
# ------------------------------------------------------------------------------
SS1_ACTIVE=A                                                                    # Subscription ready
SS1_VALID=V                                                                     # Subscription stopped but valid till end of subscription period
SS1_STOPPED=S                                                                   # Subscription closed by mobile subscriber
SS1_STOPIT_BY_WEB=x                                                             # Subscription closed by mobile subscriber
SS1_STOPPED_BY_WEB=X                                                            # Subscription closed by mobile subscriber
SS1_STOPIT_BY_CARRIER=c                                                         # Subscription closed by carrier
SS1_STOPPED_BY_CARRIER=C                                                        # Subscription closed by carrier
SS1_STOPIT_BY_CUCA=y                                                            # Subscription closed by customer care
SS1_STOPPED_BY_CUCA=Y                                                           # Subscription closed by customer care
SS1_CLOSING=k                                                                   # Subscription closed by mobile subscriber but try to rejoin
SS1_STOPIT_BY_EMAIL=e                                                           # Subscription closed by customer email
SS1_STOPPED_BY_EMAIL=E                                                          # Subscription closed by customer email

declare -A FLAGS1=(
  [SS1_ACTIVE]=${SS1_ACTIVE}
  [SS1_VALID]=${SS1_VALID}
  [SS1_STOPPED]=${SS1_STOPPED}
  [SS1_STOPIT_BY_WEB]=${SS1_STOPIT_BY_WEB}
  [SS1_STOPPED_BY_WEB]=${SS1_STOPPED_BY_WEB}
  [SS1_STOPIT_BY_CARRIER]=${SS1_STOPIT_BY_CARRIER}
  [SS1_STOPPED_BY_CARRIER]=${SS1_STOPPED_BY_CARRIER}
  [SS1_STOPIT_BY_CUCA]=${SS1_STOPIT_BY_CUCA}
  [SS1_STOPPED_BY_CUCA]=${SS1_STOPPED_BY_CUCA}
  [SS1_CLOSING]=${SS1_CLOSING}
  [SS1_STOPIT_BY_EMAIL]=${SS1_STOPIT_BY_EMAIL}
  [SS1_STOPPED_BY_EMAIL]=${SS1_STOPPED_BY_EMAIL}
)

declare -A FLAGS1_MEANING=(
  [${SS1_ACTIVE}]="Subscription ready"
  [${SS1_VALID}]="Subscription stopped but valid till end of subscription period"
  [${SS1_STOPPED}]="Subscription closed by mobile subscriber"
  [${SS1_STOPIT_BY_WEB}]="Subscription closed by mobile subscriber"
  [${SS1_STOPPED_BY_WEB}]="Subscription closed by mobile subscriber"
  [${SS1_STOPIT_BY_CARRIER}]="Subscription closed by carrier"
  [${SS1_STOPPED_BY_CARRIER}]="Subscription closed by carrier"
  [${SS1_STOPIT_BY_CUCA}]="Subscription closed by customer care"
  [${SS1_STOPPED_BY_CUCA}]="Subscription closed by customer care"
  [${SS1_CLOSING}]="Subscription closed by mobile subscriber but try to rejoin"
  [${SS1_STOPIT_BY_EMAIL}]="Subscription closed by customer email"
  [${SS1_STOPPED_BY_EMAIL}]="Subscription closed by customer email"
)

# ------------------------------------------------------------------------------
# SUBSCRIPTION STATE FLAGS|MEANING PGW3
# ------------------------------------------------------------------------------
SS3_ACTIVE='ACTIVE'                                                             # Subscription ready
SS3_STOPPED='STOPPED'                                                           # Subscription closed by customer email
SS3_CLOSED='CLOSED'                                                             # Subscription ready

# ------------------------------------------------------------------------------
# PGW SEARCH PATTERN WAP|WEB SUBSCRIPTIONS
# ------------------------------------------------------------------------------
PGW_PREPARE_SUBSCRIPTION_REQUEST_PATTERN="request-type=prepareSubscription"
PGW_VALIDATE_SUBSCRIPTION_REQUEST_PATTERN="request-type=validateSubscription"
PGW_INIT_SUBSCRIPTION_REQUEST_PATTERN="request-type=initSubscription"

PGW1_SEND_REQUEST_MBG_PATTERN="provider=.*&request-type"
PGW1_RECEIVE_RESPONSE_MBG_PATTERN="MBGAccessManager.*MBG returns Map"
PGW3_SEND_REQUEST_MBG_PATTTERN="sending GET request to.*tpmbg-app99:8330"
PGW3_RECEIVE_RESPONSE_MBG_PATTERN="unknown"

PGW1_CLOSE_ON_TIMER_PATTERN="TimerUnusedSubscriptionClose"
PGW3_CLOSE_ON_TIMER_PATTERN="TimerUnusedSubscriptionClose"
PGW1_CLOSE_ON_CHARGE_SUBSCRIPTION_PATTERN="2222222222222222:.*chargesubscription.ChargeSubscriptionProcessor.*PaymentException.*Rebill Manager closed subscription"
PGW3_CLOSE_ON_CHARGE_SUBSCRIPTION_PATTERN=""

# ------------------------------------------------------------------------------
# MBG REQUEST PATTERN WAP|WEB SUBSCRIPTIONS
# ------------------------------------------------------------------------------
MBG_SEND_REQUEST_PATTERN="Sending to provider"
MBG_RECEIVE_RESPONSE_PATTERN="Received from provider"
MBG_SEND_RECEIVE_PATTERN="Sending to provider|Received from provider"

MBG_PIN_SUBSCRIPTION_RESPONSE_PATTERN="pinSubscriptionRequest.*Received from provider"

MBG_PREPARE_SUBSCRIPTION_REQUEST_PATTERN="prepareSubscription.*Sending to provider"
MBG_PREPARE_SUBSCRIPTION_RESPONSE_PATTERN="prepareSubscription.*Received from provider"

MBG_VALIDATE_SUBSCRIPTION_REQUEST_PATTERN="validateSubscription.*Sending to provider"
MBG_VALIDATE_SUBSCRIPTION_RESPONSE_PATTERN="validateSubscription.*Received from provider"

MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN="initSubscription.*Sending to provider"
MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN="initSubscription.*Received from provider"

MBG_REFUND_SUBSCRIPTION_REQUEST_PATTERN="refund.*Sending to provider"
MBG_REFUND_SUBSCRIPTION_RESPONSE_PATTERN="refund.*Received from provider"

MBG_STOP_SUBSCRIPTION_REQUEST_PATTERN="stopSubscription.*Sending to provider"
MBG_STOP_SUBSCRIPTION_RESPONSE_PATTERN="stopSubscription.*Received from provider"

# ------------------------------------------------------------------------------
# MBG REQUEST MAPPING
# ------------------------------------------------------------------------------
MBG_PIN_SUBSCRIPTION_REQUEST="pinSubscriptionRequest"
MBG_PREPARE_SUBSCRIPTION_REQUEST="prepareSubscription"
MBG_VALIDATE_SUBSCRIPTION_REQUEST="validateSubscription"
MBG_INIT_SUBSCRIPTION_REQUEST="initSubscription"
MBG_PREPARE_SUBSCRIPTION_REQUEST="prepareSubscription"
MBG_STOP_SUBSCRIPTION_REQUEST="stopSubscription"
MBG_REFUND_SUBSCRIPTION_REQUEST="refund"

declare -A VF_SMK_REQUEST=(
  [MBG_PIN_SUBSCRIPTION_REQUEST]="mandateSetupRequest"
  [MBG_PREPARE_SUBSCRIPTION]="mandateSetupRequest"
  [MBG_VALIDATE_SUBSCRIPTION_REQUEST]="mandateSetupRequest"
  [MBG_INIT_SUBSCRIPTION_REQUEST]="mandatePayment|captureRequest"
  [MBG_STOP_SUBSCRIPTION_REQUEST]="cancelSubscriptionRequest"
  [MBG_REFUND_SUBSCRIPTION_REQUEST]="refundRequest"
)

declare -A MBG_VF_SMK_REQUEST_MAPPING=(
  [MBG_PIN_SUBSCRIPTION_REQUEST]="m1"
  [MBG_PREPARE_SUBSCRIPTION]="m1"
  [MBG_VALIDATE_SUBSCRIPTION_REQUEST]="m2"
  [MBG_INIT_SUBSCRIPTION_REQUEST]="m3"
  [MBG_STOP_SUBSCRIPTION_REQUEST]="m1"
  [MBG_REFUND_SUBSCRIPTION_REQUEST]="m1"
)


# ==============================================================================
# FUNCTIONS
# ------------------------------------------------------------------------------

# ------------------------------------------------------------------------------
# do_nothing ()
#
# DESCRIPTION   Does nothing
# SYNOPSIS      do_nothing
#
# ------------------------------------------------------------------------------
function do_nothing () {
  return 0
}

# ------------------------------------------------------------------------------
# logger ()
#
#    DESCRIPTION        print a log line
#
#    SYNOPSIS           logger LEVEL PATTERN FUNCTION MSG LOGFILE
#    Example
#
#     local ${MSG}="parse carrier communication"
#     [ "${LOG_FILE}" ] && logger INFO S1071197424 parse_files $MSG
#
# ------------------------------------------------------------------------------
# NOTE
#   Log level: DEBUG | INFO | WARN | ERROR | FATAL
#
# ------------------------------------------------------------------------------
function logger () {
#set -x

local LEVEL=$1
local PATTERN=$2
local FUNC=$3
local MESSAGE=$4
local LOG_FILE_NAME=$5

local msg_line=
local TIMESTAMP=$(${DATE_CMD} ${DEFAULT_DATE_FORMAT}" "%T,%3N)  # get timestamp using milliseconds
local LOG_MESSAGE=$(printf "%-23s [%5s] [%20s] [%30s] %s\n" "${TIMESTAMP}" "${LEVEL}" "${PATTERN}" "${FUNC}" "${MESSAGE}")

if [[ ${VERBOSE} == "true" ]]; then
  cat << EOF | tee -a ${LOG_FILE_NAME}
  ${LOG_MESSAGE}
EOF
else
  cat << EOF >> ${LOG_FILE_NAME}
  ${LOG_MESSAGE}
EOF
fi

#set +x
}

# ------------------------------------------------------------------------------
# sec2time ()
#
#    DESCRIPTION        print (elapsed) time broken down to
#                       (d)ay, (h)our (m)in (s)ec and (ms)ec
#
#    SYNOPSIS           sec2time (int milliseconds)
#    Example
#
# ------------------------------------------------------------------------------
function sec2time () {
#set -x

local num=$1

local msec=0
local sec=0
local min=0
local hour=0
local day=0

  if((num>59));then
    ((sec=num%60))
    ((num=num/60))
     if((num>59));then
        ((min=num%60))
        ((num=num/60))
        if((num>23));then
          ((hour=num%24))
          ((day=num/24))
        else
          ((hour=num))
        fi
    else
      ((min=num))
    fi
  else
    ((sec=num))
  fi

  echo ${day}d ${hour}h ${min}m ${sec}s ${msec}ms

#set +x
}

# ------------------------------------------------------------------------------
# is_too_old ()
#
# DESCRIPTION   check a DATE if itIs older than if a given amout of time
# SYNOPSIS      BOOLEAN=$(is_too_old DATE TIME_RANGE)
#
# ------------------------------------------------------------------------------
function is_too_old () {
#set -x

local DATE=$1
local TIME_RANGE="$2"

local DATE_LIMIT=$(${DATE_CMD} -d "${TODAY} - ${TIME_RANGE}")
local DATE_LIMIT_EPOCH=$(${DATE_CMD} -d "${DATE_LIMIT}" +%s)
local DATE_EPOCH=$(${DATE_CMD} -d "${DATE}" +%s)
local DATE_DIFF=$(expr ${DATE_LIMIT_EPOCH} - ${DATE_EPOCH} )
local DATE_DIFF_DAYS=$(expr ${DATE_DIFF} / 86400 )

  [[ DATE_DIFF -le 0 ]] && local RESULT="false"
  [[ DATE_DIFF -gt 0 ]] && local RESULT="true"
  echo "${RESULT}"

#set +x
}

# ------------------------------------------------------------------------------
# check_date ()
#
# DESCRIPTION   Returns a point-in-time string of a date [past|now|future]
# SYNOPSIS      STRING=$(check_date DATE)
#
# ------------------------------------------------------------------------------
function check_date () {
#set -x

local DATE=$1

local TODAY_EPOCH=$(${DATE_CMD} -d "${TODAY}" +%s)
local DATE_EPOCH=$(${DATE_CMD} -d "${DATE}" +%s)
local DATE_DIFF=$(expr ${DATE_EPOCH} - ${TODAY_EPOCH})

  [[ DATE_DIFF -eq 0 ]] && local RESULT="now"
  [[ DATE_DIFF -lt 0 ]] && local RESULT="past"
  [[ DATE_DIFF -gt 0 ]] && local RESULT="future"
  echo "${RESULT}"

#set +x
}

# ------------------------------------------------------------------------------
# parse_calc_dates ()
#
# DESCRIPTION   Parse the date parameters given and calculate the
#               time range values for DB access
# SYNOPSIS      parse_calc_dates "${DATE_ARRAY[@]}"
#
# ------------------------------------------------------------------------------
parse_calc_dates ()
{
#set -x

local DATES=("${@}")

  if [ ${#DATES[@]} -eq 1 ]; then
    START_DATE=$(printf -- "\'%s\'" "${DATES[0]}")
    START_STOP_DATE="established >= ${START_DATE}"
  else
    START_DATE=$(printf -- "\'%s\'" "${DATES[0]}")
    START_STOP_PLUS=$(${DATE_CMD} -d "${DATES[1]} 1 day" +%F)
    STOP_DATE=$(printf -- "\'%s\'" "${START_STOP_PLUS}")
    START_STOP_DATE_SUBSCRIPTION="established >= ${START_DATE} AND established < ${STOP_DATE}"
    START_STOP_DATE_TRANSACTION="order_ts >= ${START_DATE} AND order_ts < ${STOP_DATE}"
  fi

  local currentdate=${DATES[0]}
  local loopenddate=${DATES[1]}

  if [ ${#DATES[@]} -gt 1 ]; then
    until [ "$currentdate" == "$loopenddate" ]
    do
      PROCESSING_DATES+=($currentdate)
      currentdate=$(${DATE_CMD} -d "${currentdate} 1 day" +%F)
    done
    PROCESSING_DATES+=($currentdate)
  else
    PROCESSING_DATES+=($currentdate)
  fi

#set +x
}

# ------------------------------------------------------------------------------
# zipformat ()
#
# DESCRIPTION   Detect whether a logfile is compressed (or not)
#               and set commands CAT|GREP accordingly
# SYNOPSIS      zipformat ${file}
#
# ------------------------------------------------------------------------------
function zipformat () {
#set -x

local FILE=$1

if [[ ! -f ${FILE} ]]; then
  local MSG="Log file not found: ${FILE}"
  logger FATAL ${PATTERN} zipformat "${MSG}" ${LOGFILE}
  exit 1
fi

  if [[ ${1: -3} == ".gz" ]]; then
    #CAT="zcat"
    # See: https://github.com/dalibo/pgbadger/issues/70, zcat on OS X always appends a .Z to the filename
    CAT="gunzip -c"
    GREP="zgrep"
  elif [[ ${1: -3} == ".xz" ]]; then
    CAT="xzcat"
    GREP="xzgrep"
  else
    CAT="cat"
    GREP="grep"
  fi

#set +x
}

# ------------------------------------------------------------------------------
# timeformat ()
#
# DESCRIPTION   Normalize the hour portion of a parsed log line for
#               the timestamp (e.g 23:59:50,862)
# SYNOPSIS      timeformat
#
# ------------------------------------------------------------------------------
function timeformat () {
#set -x

  if [[ ${THOURTRANSACTION} == "00" ]]; then
    THOURTRANSACTION="24"
  else
    THOURTRANSACTION=$(expr ${THOURTRANSACTION} + 0)
  fi

#set +x
}

# ------------------------------------------------------------------------------
# set_current_log ()
#
# DESCRIPTION   Sets the current log file and check|set the link to the
#               current log. To differentiate log for different reports,
#               a postfix can be specified.
# SYNOPSIS      set_current_log POSTFIX DATE
#
# ------------------------------------------------------------------------------
# NOTE
#   https://stackoverflow.com/questions/7665/how-to-resolve-symbolic-links-in-a-shell-script
#
# ------------------------------------------------------------------------------
function set_current_log () {
#set -x

local POSTFIX=$1
LOGFILE_DATE=$2

local POSTFIX=$(to_lower ${POSTFIX})

  if [[ -z $LOGFILE_DATE ]]; then LOGFILE_DATE=${DATE}; fi

  if [[ -z ${POSTFIX} ]]; then
    CURRENT_LOGFILE="${SCRIPT_NAME}.current"
    DEFAULT_LOGFILE="${SCRIPT_NAME}.log.${LOGFILE_DATE}"
    LOGFILE=${LOG_DIR}/${DEFAULT_LOGFILE}
  else
    CURRENT_LOGFILE="${SCRIPT_NAME}_${POSTFIX}.current"
    DEFAULT_LOGFILE="${SCRIPT_NAME}_${POSTFIX}.log.${LOGFILE_DATE}"
    LOGFILE=${LOG_DIR}/${DEFAULT_LOGFILE}
  fi

  if [[ "${LOG_APPEND}" == "false" ]]; then
    rm -f ${LOG_DIR}/${CURRENT_LOGFILE} &>/dev/null
    rm -f ${LOG_DIR}/${DEFAULT_LOGFILE} &>/dev/null

    ${DEBUG} && local MSG="log append disabled, reset current log: ${LOGFILE##*/}"
    ${DEBUG} && logger DEBUG ${COLLECTION} set_current_log "${MSG}" ${LOGFILE}
  else
    ${DEBUG} && local MSG="log append enabled, add to current log: ${LOGFILE##*/}"
    ${DEBUG} && logger DEBUG ${COLLECTION} set_current_log "${MSG}" ${LOGFILE}
  fi

  if [[ ${SET_CURRENTLINK} == "true" ]]; then
    ${DEBUG} && local MSG="check link to current log"
    ${DEBUG} && logger DEBUG ${COLLECTION} set_current_log "${MSG}" ${LOGFILE}

    local CURRENT_LOG=$(readlink ${LOG_DIR}/${CURRENT_LOGFILE})
    local CURRENT_LOG_DATE="${CURRENT_LOG##*.}"

     if [[ -z ${CURRENT_LOG} ]]; then
       ln -sf ${LOGFILE}  ${LOG_DIR}/${CURRENT_LOGFILE}
       local CURRENT_LOG=$(readlink ${LOG_DIR}/${CURRENT_LOGFILE})
       local CURRENT_LOG_DATE="${CURRENT_LOG##*.}"

       ${DEBUG} && local MSG="Link missing. Set link to current log"
       ${DEBUG} && logger DEBUG ${COLLECTION} set_current_log "${MSG}" ${LOGFILE}
     fi

     if [[ ${CURRENT_LOG_DATE} != ${TODAY} ]]; then
       ${DEBUG} && local MSG="Set link to current log: ${LOGFILE##*/}"
       ${DEBUG} && logger DEBUG ${COLLECTION} set_current_log "${MSG}" ${LOGFILE}

       ln -sf ${LOGFILE}  ${LOG_DIR}/${CURRENT_LOGFILE}
     fi
  fi

#set +x
}

# ------------------------------------------------------------------------------
# to_upper ()
#
# DESCRIPTION   Returns the uppercase of a string
# SYNOPSIS      STRING=$(to_upper STRING)
#
# ------------------------------------------------------------------------------
function to_upper () {
#set -x

local STRING=$1

  local RESULT=$(echo ${STRING} | tr "[[:lower:]]" "[[:upper:]]")
  echo "${RESULT}"

#set +x
}

# ------------------------------------------------------------------------------
# to_lower ()
#
# DESCRIPTION   Returns the lowercase of a string
# SYNOPSIS      STRING=$(to_lower STRING)
#
# ------------------------------------------------------------------------------
function  to_lower () {
#set -x

local STRING=$1

  STRING=$(echo ${STRING} | tr "[[:upper:]]" "[[:lower:]]")
  echo "${STRING}"

#set +x
}

# ------------------------------------------------------------------------------
# link_current_app_log ()
#
# DESCRIPTION   Check the link to the current application log file
#               (*.current) for development mode. Create a link if
#               not available or re-link if DATE is given
# SYNOPSIS      link_current_app_log APP DATE
#
# ------------------------------------------------------------------------------
# NOTE
#   This function used used for DEVELOPMENT environment ONLY!!!
#
# ------------------------------------------------------------------------------
function link_current_app_log () {
#set -x

local APP=$1
local DATE=$2

local PGW1_CURRENT_LOG="${APP_LOG_DIR}/${PGW1_APP_NAME}.current"
local PGW3_CURRENT_LOG="${APP_LOG_DIR}/${PGW3_APP_NAME}.current"
local MBG_CURRENT_LOG="${APP_LOG_DIR}/${MBG_APP_NAME}.current"

  APP=$(to_upper "${APP}")

  if [[ $APP == "PGW1" ]]; then CURRENT_LOG={$PGW1_CURRENT_LOG}; fi
  if [[ $APP == "PGW3" ]]; then CURRENT_LOG={$PGW3_CURRENT_LOG}; fi
  if [[ $APP == "MBG" ]]; then  CURRENT_LOG={$MBG_CURRENT_LOG}; fi

  if [[ ${ENV} == "develop" ]]; then

    if [[ -z ${DATE} ]]; then DATE=${TODAY}; fi

    ${DEBUG} && local MSG="check link to current application log - ${APP}"
    ${DEBUG} && logger DEBUG ${PATTERN} set_current_log "${MSG}" ${LOGFILE}

    local CURRENT_LOG=$(readlink ${MBG_CURRENT_LOG})
    local CURRENT_LOG_DATE="${CURRENT_LOG##*.}"

     if [[ -z ${CURRENT_LOG} ]]; then
       ln -sf ${LOGFILE}  ${LOG_DIR}/${CURRENT_LOGFILE}
       local CURRENT_LOG=$(readlink ${LOG_DIR}/${CURRENT_LOGFILE})
       local CURRENT_LOG_DATE="${CURRENT_LOG##*.}"

       ${DEBUG} && local MSG="Link missing. Set link to current log"
       ${DEBUG} && logger DEBUG ${PATTERN} set_current_log "${MSG}" ${LOGFILE}
     fi

     if [[ ${CURRENT_LOG_DATE} != ${TODAY} ]]; then
       rm -f ${CURRENT_LOG} &>/dev/null
       ln -sf ${LOGFILE}  ${LOG_DIR}/${CURRENT_LOGFILE}

       ${DEBUG} && local MSG="Outdated link found. Set link to current log"
       ${DEBUG} && logger DEBUG ${PATTERN} set_current_log "${MSG}" ${LOGFILE}
     fi
  fi

#set +x
}

# ------------------------------------------------------------------------------
# check_add_trailing_files ()
#
# DESCRIPTION   Check if log files are trailing behind. If so, logs of the
#               PREVIOUS DAY are needed as well
# SYNOPSIS      check_add_trailing_files LOG_FILE
#
# ------------------------------------------------------------------------------
# NOTE
#   FILE is splitted to calculate the logfile name of the PREVIOUS DAY
#
# NOTE
#   NO extension needed for filename (split) of the PREVIOUS DAY because
#   find command is using a file glob
#
# ------------------------------------------------------------------------------
function check_add_trailing_files () {
#set -x

local FILE=$1

local FILE_PATH=${FILE%/*}
local FILE_NAME=${FILE##*/}
local FILE_PART_NAME="${FILE_NAME%.*}"
local FILE_DATE=""

local additional_file=""

  ${INFO} && local MSG="check if MBG log file is trailing: ${FILE_NAME}"
  ${INFO} && logger INFO ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}

  # handle different filename formats (extention|no extention)
  #
  [[ "${FILE_NAME}" =~ ^([a-zA-z]*\.log)\.([0-9]{4}-[0-9]{2}-[0-9]{2})$ ]] && local FILE_PART_NAME=${BASH_REMATCH[1]};local FILE_DATE=${BASH_REMATCH[2]}
  if [[ -z ${FILE_DATE} ]]; then
    [[ "${FILE_NAME}" =~ ^([a-zA-z]*\.log)\.([0-9]{4}-[0-9]{2}-[0-9]{2})\.([a-z0-9]*)$ ]] && local FILE_PART_NAME=${BASH_REMATCH[1]};local FILE_DATE=${BASH_REMATCH[2]}
  fi

  local PREVIOUSDAY=$(${DATE_CMD} -d "${FILE_DATE} -1 day" +%F)
  local PREVIOUSDAY_FILE="${FILE_PART_NAME}.${PREVIOUSDAY}"

  # collect transfer and log timestamps from first log line. If log transfer
  # is in SYNC, TDATES[0] == CURRENT DAY and TDATES[1] == PREVIOUS DAY.
  # If log transfer is ASYNC (trailing behind) TDATES are EQUAL
  #
  zipformat ${FILE}
  TDATES=($(${CAT} ${FILE} | head -n1 | grep -Eo "20[0-9]{2}-[0-9]{2}-[0-9]{2}"))

  # get the HOUR of the most current MBG transaction (first line)
  #
  THOURTRANSACTION=$(${CAT} ${FILE} | head -n1 | cut -f 5 -d " " | ${AWK_CMD} -F "" '{print $1$2}')

  # check if the MBG log contains the HOUR, the transaction had happenend.
  # If negative, the MBG log is trailing as well
  #
  timeformat
  TIMEDELTA=$((${THOURTRANSACTION}-${HOUR}))

  if ! [[ ${TDATES[0]} == ${TDATES[1]} ]]; then
    ${DEBUG} && local MSG="different days found for MBG log file: ${FILE}"
    ${DEBUG} && logger DEBUG ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}

    # check if MBG log is trailing
    #
    if [[ ${TIMEDELTA} -le 0 ]]; then
      local cmd="find ${MBG_LOG_SEARCH_FOLDERS} -maxdepth 1 -name ${PREVIOUSDAY_FILE}\* -print"
      additional_file=$(eval $cmd)

      if [[ -z ${additional_file}} ]]; then
        local MSG="MBG log file (previous day) not found: ${PREVIOUSDAY_FILE}"
        logger FATAL ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}
        local MSG="processing aborted"
        logger FATAL ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}
        return 9
      fi

      ${WARN} && local MSG="MBG log is trailing, add previous day: ${additional_file##*/}"
      ${WARN} && logger WARN ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}

      echo "${additional_file}"
      return 1
    fi
  else
    ${DEBUG} && local MSG="same days found for MBG log file: ${FILE##*/}"
    ${DEBUG} && logger DEBUG ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}

    # check if MBG log is trailing
    #
    if [[ ${TIMEDELTA} -le 0 ]]; then
      local cmd="find ${MBG_LOG_SEARCH_FOLDERS} -maxdepth 1 -name ${PREVIOUSDAY_FILE}\* -print"
      additional_file=$(eval $cmd)

      if [[ -z ${additional_file}} ]]; then
        local MSG="MBG log file (previous day) not found: ${PREVIOUSDAY_FILE}"
        logger FATAL ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}
        local MSG="processing aborted"
        logger FATAL ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}
        return 9
      fi

      ${WARN} && local MSG="MBG log is trailing, add previous day: ${additional_file##*/}"
      ${WARN} && logger WARN ${PATTERN} check_add_trailing_files "${MSG}" ${LOGFILE}

      echo "${additional_file}"
      return 1
    fi
  fi

  return 0

#set +x
}

# ------------------------------------------------------------------------------
# sanity_check_mbg_log ()
#
# DESCRIPTION   Check if all MBG log files needed are present
# SYNOPSIS      sanity_check_mbg_log
#
# ------------------------------------------------------------------------------
function sanity_check_mbg_log () {
#set -x

  ${DEBUG} && local MSG="run sanity check for MBG log data"
  ${DEBUG} && logger DEBUG ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}

  # sanity check for CURRENT log
  #
  if [[ ! -f ${APP_LOG_DIR}/MBG.current ]]; then
    local MSG="MBG log file (this day) not found: MBG.current"
    logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
    local MSG="processing aborted"
    logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
    return 1
  fi

  # sanity check for YESTERDAY|PREVIOUSDAY log
  #
  if [[ ${STOP_DATE} == ${TODAY} ]]; then
    if [[ ! -f ${MBG_LOG_ARCH_DIR}/MBG.log.${YESTERDAY} ]]; then
      local MSG="MBG log file (yesterday) not found: MBG.log.${YESTERDAY}"
      logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
      local MSG="processing aborted"
      logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
      return 1
    fi
  else
    if [[ ! -f ${MBG_LOG_ARCH_DIR}/MBG.log.${STOP_DATE} ]]; then
      local MSG="MBG log file (stop date) not found: MBG.log.${STOP_DATE}"
      logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
      local MSG="processing aborted"
      logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
      return 1
    fi
    local PREVIOUSDAY=$(${DATE_CMD} -d "${STOP_DATE} -1 day" +%F)
    if [[ ! -f ${MBG_LOG_ARCH_DIR}/MBG.log.${PREVIOUSDAY} ]]; then
      local MSG="MBG log file (previous day) not found: MBG.log.${PREVIOUSDAY}"
      logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
      local MSG="processing aborted"
      logger FATAL ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}
      return 1
    fi
  fi

  ${DEBUG} && local MSG="finished sanity check for MBG log data: successful"
  ${DEBUG} && logger DEBUG ${PATTERN} sanity_check_mbg_log "${MSG}" ${LOGFILE}

  return 0

#set +x
}

# ------------------------------------------------------------------------------
# detect_mbg_data_files ()
#
# DESCRIPTION   Collect all MBG log files to be parsed for a transaction
# SYNOPSIS      detect_mbg_data_files SUBSCRIPTION_ID SETUP_DATE STOP_DATE
#
# ------------------------------------------------------------------------------
# NOTE
#   Use "local file_name" to clean filenames for double slashes (//)
#
# ------------------------------------------------------------------------------
function detect_mbg_data_files () {
#set -x

local PATTERN=$1
local SETUP_DATE=$2
local STOP_DATE=$3

local MBG_LOG_SEARCH_FOLDERS="${MBG_LOG_ARCH_DIR}"

  # add sibling folders to the search path MBG_LOG_SEARCH_FOLDERS as glob
  #
  if [[ ${RUN_SIBLINGS_DETECTION} == "true" ]]; then local MBG_LOG_SEARCH_FOLDERS="${MBG_LOG_ARCH_DIR}*/"; fi

  ${DEBUG} && local MSG="sibling file processing: ${RUN_SIBLINGS_DETECTION}"
  ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

  ${DEBUG} && local MSG="trailing file processing: ${RUN_TRAILING_FILE_DETECTION}"
  ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

  ${DEBUG} && local MSG="sanity file checks: ${RUN_SANITY_FILE_CHECKS}"
  ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

  ${RUN_SANITY_FILE_CHECKS} && sanity_check_mbg_log

  # detect all MBG log files to be parsed for SETUP
  #
  if [[ ${COLL_SETUP_DATA} == "true" ]]; then

    ${DEBUG} && local MSG="check log data available for: SETUP"
    ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

    # Collect all MBG logs needed for SETUP_DATE
    #
    local cmd="find ${MBG_LOG_SEARCH_FOLDERS} -maxdepth 1 -name MBG.log.${SETUP_DATE}\* -print"
    FILES=($(eval $cmd))

    # check if MBG log files are trailing behind. If so, MBG logs of the
    # PREVIOUS DAY are needed as well
    if [[ ${#FILES[@]} -gt 1 ]]; then
      # sibling data detected to process
      #
      local file_name=${FILES[0]##*${APP_LOG_DIR}/}
      local file_name=${file_name/\///}
      ${DEBUG} && local MSG="found sibling data for SETUP: ${file_name}"
      ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

      for file in ${FILES[@]}; do
        local file_name=${file##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}

        local res=0
        if [[ ${RUN_TRAILING_FILE_DETECTION} == "true" ]]; then
          ${DEBUG} && local MSG="check if MBG log is trailing: ${file_name}"
          ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}
          local additional_trailing_file=$(check_add_trailing_files ${STOP_FILES})
          local res=$?
        fi

        if [[ ${res} -eq 0 ]]; then
          local file_name=${file##*${APP_LOG_DIR}/}
          local file_name=${file_name/\///}
          ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && MSG="MBG log not trailing: ${file_name}"
          ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
        elif [[ ${res} -eq 1 ]]; then
          local file_name=${additional_trailing_file##*${APP_LOG_DIR}/}
          local file_name=${file_name/\///}
          ${DEBUG} && MSG="MBG log ${file} trailing, add file: ${file_name}"
          ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
          FILES+=(${additional_trailing_file})
        elif [[ ${res} -eq 9 ]]; then
          local file_name=${file##*${APP_LOG_DIR}/}
          local file_name=${file_name/\///}
          ${ERROR} && MSG="processing trailing file failed for: ${file_name}"
          ${ERROR} && logger ERROR ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
        fi
      done
    else # no sibling data to process
      local res=0
      if [[ ${RUN_TRAILING_FILE_DETECTION} == "true" ]]; then
        ${DEBUG} && local MSG="check if MBG log is trailing: ${file_name}"
        ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}
        local additional_trailing_file=$(check_add_trailing_files ${STOP_FILES})
        local res=$?
      fi

      if [[ ${res} -eq 0 ]]; then
        local file_name=${FILES##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}
        ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && MSG="MBG log not trailing: ${file_name}"
        ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
      elif [[ ${res} -eq 1 ]]; then
        local file_name=${additional_trailing_file##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}
        ${DEBUG} && MSG="MBG log ${FILES} trailing, add file: ${file_name}"
        ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
        FILES+=(${additional_trailing_file})
      elif [[ ${res} -eq 9 ]]; then
        local file_name=${FILES##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}
        ${ERROR} && MSG="processing trailing file failed for: ${file_name}"
        ${ERROR} && logger ERROR ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
      fi
    fi
  fi # end COLL_SETUP_DATA

  # detect all MBG log files to be parsed for STOP
  #
  if [[ ${COLL_STOP_DATA} == "true" ]]; then

    ${DEBUG} && local MSG="check log data available for: STOP"
    ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

    if [[ ${STOP_DATE} == ${TODAY} ]]; then
      # STOP_DATE is always in the PAST. If STOP_DATE == TODAY, go for YESTERDAY
      #
      local cmd="find ${MBG_LOG_SEARCH_FOLDERS} -maxdepth 1 -name MBG.log.${YESTERDAY}\* -print"
    else
      local cmd="find ${MBG_LOG_SEARCH_FOLDERS} -maxdepth 1 -name MBG.log.${STOP_DATE}\* -print"
    fi

    local STOP_FILES=($(eval $cmd))
    FILES+=(${STOP_FILES[@]})

    # check if MBG log files are trailing behind. If so, MBG logs of the
    # PREVIOUS DAY are needed as well
    #
    if [[ ${#STOP_FILES[@]} -gt 1 ]]; then
      # sibling data detected to process
      #
      local file_name=${STOP_FILES[0]##*${APP_LOG_DIR}/}
      local file_name=${file_name/\///}
      ${DEBUG} && local MSG="found sibling data for STOP: ${file_name}"
      ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

      for file in ${STOP_FILES[@]}; do
        local file_name=${file##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}

        local res=0
        if [[ ${RUN_TRAILING_FILE_DETECTION} == "true" ]]; then
          ${DEBUG} && local MSG="check if MBG log is trailing: ${file_name}"
          ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}
          local additional_trailing_file=$(check_add_trailing_files ${STOP_FILES})
          local res=$?
        fi

        if [[ ${res} -eq 0 ]]; then
          local file_name=${file##*${APP_LOG_DIR}/}
          local file_name=${file_name/\///}
          ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && MSG="MBG log not trailing: ${file_name}"
          ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
        elif [[ ${res} -eq 1 ]]; then
          local file_name=${additional_trailing_file##*${APP_LOG_DIR}/}
          local file_name=${file_name/\///}
          ${DEBUG} && MSG="MBG log ${file} trailing, add file: ${file_name}"
          ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
          FILES+=(${additional_trailing_file})
        elif [[ ${res} -eq 9 ]]; then
          local file_name=${file##*${APP_LOG_DIR}/}
          local file_name=${file_name/\///}
          ${ERROR} && MSG="processing trailing file failed for: ${file_name}"
          ${ERROR} && logger ERROR ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
        fi

      done
    else # no sibling data to process
      local res=0
      if [[ ${RUN_TRAILING_FILE_DETECTION} == "true" ]]; then
        ${DEBUG} && local MSG="check if MBG log is trailing: ${file_name}"
        ${DEBUG} && logger DEBUG ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}
        local additional_trailing_file=$(check_add_trailing_files ${STOP_FILES})
        local res=$?
      fi

      if [[ ${res} -eq 0 ]]; then
        local file_name=${STOP_FILES##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}
        ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && MSG="MBG log not trailing: ${file_name}"
        ${RUN_TRAILING_FILE_DETECTION} && ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
      elif [[ ${res} -eq 1 ]]; then
        local file_name=${additional_trailing_file##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}
        ${DEBUG} && MSG="MBG log ${STOP_FILES} trailing, add file: ${file_name}"
        ${DEBUG} && logger DEBUG ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
        FILES+=(${additional_trailing_file})
      elif [[ ${res} -eq 9 ]]; then
        local file_name=${STOP_FILES[1]##*${APP_LOG_DIR}/}
        local file_name=${file_name/\///}
        ${ERROR} && MSG="processing trailing file failed for: ${file_name}"
        ${ERROR} && logger ERROR ${PATTERN} create_close_records "${MSG}" ${LOGFILE}
      fi
    fi

  fi # end COLL_STOP_DATA

  # create short-file array for logging
  #
  for file in ${FILES[@]}; do
    local file_name=${file##*${APP_LOG_DIR}/}
    local file_name=${file_name/\///}
    local SFILES+="${file_name} "
  done

  ${INFO} && local MSG="log file|s detected for parsing (#${#FILES[@]}): ${SFILES[@]}"
  ${INFO} && logger INFO ${PATTERN} detect_mbg_data_files "${MSG}" ${LOGFILE}

  return 0

#set +x
}

# ------------------------------------------------------------------------------
# get_setup_date ()
#
# DESCRIPTION   Get|Read SETUP date for SUBSCRIPTION_ID from database
# SYNOPSIS      DATE=$(get_setup_date SUBSCRIPTION_ID)
#
# ------------------------------------------------------------------------------
function get_setup_date () {
#set -x

local subscription_id=$1

  if [[ ${ENV} == "develop" ]]; then
    local SETUP_DATE="2018-01-14"
    echo ${SETUP_DATE}
  else
    return 0
  fi

#set +x
}

# ------------------------------------------------------------------------------
# collect_carrier_data ()
#
# DESCRIPTION   Parse (MBG) logs for the PATTERN given, sort and write
#               results to (temp raw data) file
# SYNOPSIS      collect_carrier_data SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function collect_carrier_data () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local TMPFILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.raw"
local STMPFILE=${TMPFILE##*/}
local RESULT_SORT_FILE=${TMPFILE}.sorted
local SRESULT_SORT_FILE=${RESULT_SORT_FILE##*/}
local RESULT_FILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.dat"
local SRESULT_FILE=${RESULT_FILE##*/}

  if [[ ! -d ${CACHE_DIR}/${PROCESSING_DATE} ]]; then mkdir -p ${CACHE_DIR}/${PROCESSING_DATE} &>/dev/null; fi

  ${INFO} && local EPOCH_START=$(($(${DATE_CMD} +%s%N)/1000000))

  ${INFO} && local MSG="collect carrier communication"
  ${INFO} && logger INFO ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}

  if [[ -e ${TMPFILE} ]] || [[ -e ${RESULT_FILE} ]]; then
    ${DEBUG} && local MSG="clean up data files: ${STMPFILE}|${SRESULT_FILE}"
    ${DEBUG} && logger DEBUG ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}

    [[ -e ${TMPFILE} ]] && rm -f ${TMPFILE} &>/dev/null
    [[ -e ${RESULT_FILE} ]] && rm -f ${RESULT_FILE} &>/dev/null
  fi

  for file in ${FILES[@]}
  do
    local file_name=${file##*${APP_LOG_DIR}/}
    local file_name=${file_name/\///}
    local MSG="extract MBG log data from file: ${file_name}"
    ${INFO} && logger INFO ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}

    if [[ ! -e ${file} ]]; then
      local MSG="MBG log file not found: ${SFILE}"
      logger FATAL ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}
      local MSG="processing aborted"
      logger FATAL ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}
      return 1
    fi
    zipformat ${file}
    ${GREP} -F "${PATTERN}" ${file} >> ${TMPFILE}
  done

  # ----------------------------------------------------------------------------
  # check and sort results
  # ----------------------------------------------------------------------------

  if [[ ${CHECK_CARRIER_DATA} == "true" ]]; then
    ${DEBUG} && local MSG="check data extracted"
    ${DEBUG} && logger DEBUG ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}

    TKEYS=()
    while read line
    do
      tkey=$(echo "$line" | awk '{print $8}' | grep -Eo "[a-z0-9]{10,20}")
      TKEYS+=(${tkey})
    done < ${TMPFILE}

    TKEYS=($(echo "${TKEYS[@]}" | tr ' ' '\n' | sort -u | tr '\n' ' '))
    if [ ${#TKEYS[@]} == 0 ]; then
      local MSG="no data found for: ${DATE}"
      logger ERROR ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}
      local MSG="processing aborted"
      logger ERROR ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}
      return 1
    fi
  fi

  TRANSACTION=$(head -n1 ${TMPFILE} | awk '{print $11}')
  SID=$(head -n1 ${TMPFILE} | awk '{print $13}' | cut -d"/" -f3 | grep -Eo "[a-zA-Z0-9]{10,30}")
  if [ ! -z ${SID} ]; then
    GREPPATTERN=$(printf -- "-e \"%s\" " "${TKEYS[@]}" "${SID}")
  else
    GREPPATTERN=$(printf -- "-e \"%s\" " "${TKEYS[@]}")
  fi

  # NOTE
  #   CMD="$(echo "unset LANG; zgrep -F "${GREPPATTERN}" ${file} | sort -k 4,4 -k 5,5 >> ${RESULT}")"
  #   zgrep does not support the above in this ancient CentOS version... so here is a little workaround - this time a not so useless use of cat ;-):

  # jadams, 2018-04-04: unset LANG removed, to be checked why unset LANG cause an error
  #

  if [[  ${SORT_CARRIER_DATA} == "true" ]]; then
    ${DEBUG} && local MSG="sort data extracted"
    ${DEBUG} && logger DEBUG ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}

    zipformat ${TMPFILE}
    CMD="$(echo "${CAT} ${TMPFILE} | grep -F "${GREPPATTERN}" | sort -k 4,4 -k 5,5 | uniq >> ${RESULT_SORT_FILE}")"
    eval ${CMD}

    rm -rf ${TMPFILE} &>/dev/null
    mv ${RESULT_SORT_FILE} ${TMPFILE}
  fi

  if [[ ${STRIP_CARRIER_DATA} == "false" ]]; then
    mv ${TMPFILE} ${RESULT_FILE}
    #${INFO} && local MSG="cache file written: ${RESULT_FILE##*/}"
    ${INFO} && local MSG="cache file written: ${RESULT_FILE}"
    ${INFO} && logger INFO ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}
  else
    #${INFO} && local MSG="cache file written: ${TMPFILE##*/}"
    ${INFO} && local MSG="cache file written: ${TMPFILE}"
    ${INFO} && logger INFO ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}
  fi

  ${INFO} && local EPOCH_FINISHED=$(($(${DATE_CMD} +%s%N)/1000000))
  ${INFO} && local ELAPSED=$(expr ${EPOCH_FINISHED} - ${EPOCH_START})

  ${INFO} && local MSG="finished processing - ${ELAPSED}ms"
  ${INFO} && logger INFO ${PATTERN} collect_carrier_data "${MSG}" ${LOGFILE}

  return 0

#set +x
}

# ------------------------------------------------------------------------------
# strip_carrier_data ()
#
# DESCRIPTION   Strip logs for unneeded|trailing data and
#               create a results file
# SYNOPSIS      strip_carrier_data SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function strip_carrier_data () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local TMPFILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.raw"
local RESULT_FILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.dat"
local SRESULT_FILE=${RESULT_FILE##*/}

  cut -d" " -f 4,5,10,19- "${TMPFILE}" | grep -E "Sending to provider|Received from provider" > ${RESULT_FILE}
  # jadams rm -f ${TMPFILE}

  ${INFO} && local MSG="results written: ${SRESULT_FILE}"
  ${INFO} && logger INFO ${PATTERN} strip_carrier_data "${MSG}" ${LOGFILE}

#set +x && exit
}

# ------------------------------------------------------------------------------
# parse_carrier_data ()
#
# DESCRIPTION  Extract MANDATE_DETAILS from results file
# SYNOPSIS     parse_carrier_data SUBSCRIPTION_ID PROCESSING_DATE
# ------------------------------------------------------------------------------
# NOTE:
#
# TODO:
#
# ------------------------------------------------------------------------------
function parse_carrier_data () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local ifs_bckup=${IFS}
local TMPFILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.raw"
local RESULT_FILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.dat"

  if [[ ${STRIP_CARRIER_DATA} == "false" ]]; then TMPFILE=${RESULT_FILE}; fi

  ${INFO} && local MSG="start parse carrier protocol data"
  ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

  if [[ ${COLL_PRODUCT_DATA} == "true" ]]; then

    ${INFO} && local MSG="parse PRODUCT_DATA"
    ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

    # collect base data from MBG log line (first match)
    #
#set -x
    local line=($(grep -Eom1 "\[.*\]" "${TMPFILE}" | ${SED_CMD} -re 's/\[|\]//g'))
#set +x

    REQUEST_TYPE="${line[4]}"
    CHANNEL="${line[6]}"
    MSISDN_STD="${line[8]}"
    MSISDN="+${MSISDN_STD#00*}"
    AMOUNT="${line[9]}"
    CHANNEL=$(to_upper ${CHANNEL})

    ID_RECORD=($(echo ${line[7]} | ${SED_CMD} -re 's/\// /g'))
    SETUP_TRANSACTIONID=${ID_RECORD[1]}
    SUBSCRIPTIONID=${ID_RECORD[2]}

    local API_USERID=${ID_RECORD[0]}
    API=${API_USERID%%_*}

    if [[ ${API} == "PGW" ]]; then
      API="PGW1"
      USERID=${API_USERID#PGW_*}
    else
      USERID=${API_USERID#PGW3_*}
    fi

    if [[ ${VERY_VERBOSE} == "true" ]] && [[ ${DEBUG} == "true" ]]; then
      echo
      echo "  ------------------------- start raw data -----------------------------"
      echo "  API:                  ${API}"
      echo "  USERID:               ${USERID}"
      echo "  SETUP_TRANSACTIONID:  ${SETUP_TRANSACTIONID}"
      echo "  SUBSCRIPTIONID:       ${SUBSCRIPTIONID}"
      echo "  REQUEST_TYPE:         ${REQUEST_TYPE}"
      echo "  CHANNEL:              ${CHANNEL}"
      echo "  AMOUNT:               ${AMOUNT}"
      echo "  MSISDN:               ${MSISDN}"
      echo "  ------------------------- end raw data -------------------------------"
      echo
    fi

  fi # end COLL_PRODUCT_DATA

  ${INFO} && local MSG="channel detected: ${CHANNEL}"
  ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

  if [[ ${COLL_TYPE_SETUP} == "true" ]] || [[ ${COLL_SETUP_DATA} == "true" ]]; then

    MSISDN="$(grep -Eom1 "MSISDN.*MSISDN" "${RESULT_FILE}" | ${SED_CMD} -re 's/.*>|<.*//g')"
    AMOUNT="$(grep -Eom1 "maxAmount.*maxAmount" "${RESULT_FILE}" | ${SED_CMD} -re 's/.*>|<.*//g' | ${SED_CMD} -re 's/EUR//')"
    DESCRIPTION_OF_GOODS="$(grep -Eom1 "descriptionOfGoods.*descriptionOfGoods" "${RESULT_FILE}" | ${SED_CMD} -re 's/.*>|<.*//g')"
    MERCHANTID="$(grep -Eom1 "merchantId.*merchantId" "${RESULT_FILE}" | ${SED_CMD} -re 's/.*>|<.*//g')"
    MERCHAND_SERVICEID="$(grep -Eom1 "merchantServiceId.*merchantServiceId" "${RESULT_FILE}" | ${SED_CMD} -re 's/.*>|<.*//g')"
    MERCHAND_DESIGNID="$(grep -Eom1 "merchantDesignId.*merchantDesignId" "${RESULT_FILE}" | ${SED_CMD} -re 's/.*>|<.*//g')"

    if [[ ${CHANNEL} == "WAP" ]]; then
      ${INFO} && local MSG="parse SETUP_DATA for channel: ${CHANNEL}"
      ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

      PREPARE_SUBSCRIPTION_TIME_RAW=($(grep -E "${MBG_PREPARE_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
      PREPARE_SUBSCRIPTION_TIME=$(echo $PREPARE_SUBSCRIPTION_TIME_RAW | ${SED_CMD} 's/T/ /')
      PREPARE_SUBSCRIPTION_CHANNEL=($(grep -E "${MBG_PREPARE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "channel.*channel" | ${SED_CMD} -re 's/.*>|<.*//g'))
      PREPARE_SUBSCRIPTION_RESPONSE=($(grep -E "${MBG_PREPARE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "simToken.*simToken|UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))

      # if (positive) response empty, collect error code
      #
      if [[ -z ${PREPARE_SUBSCRIPTION_RESPONSE} ]]; then
        PREPARE_SUBSCRIPTION_RESPONSE=("error" $(grep -E "${MBG_PREPARE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
      fi

      # INIT_SUBSCRIPTION_PAYMENT|CAPTURE, if PREPARE_SUBSCRIPTION successful
      #
      if [[ ${PREPARE_SUBSCRIPTION_RESPONSE[0]} != "error" ]]; then

        VALIDATE_SUBSCRIPTION_TIME_RAW=($(grep -E "${MBG_VALIDATESUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
        VALIDATE_SUBSCRIPTION_TIME=$(echo $VALIDATE_SUBSCRIPTION_TIME_RAW | ${SED_CMD} 's/T/ /')
        VALIDATE_SUBSCRIPTION_REQUEST=($(grep -E "${MBG_VALIDATE_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "simToken.*simToken|UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
        VALIDATE_SUBSCRIPTION_RESPONSE=($(grep -E "${MBG_VALIDATE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI|success" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
        VALIDATE_SUBSCRIPTION_RESPONSE=$(to_upper ${VALIDATE_SUBSCRIPTION_RESPONSE})

        # if (positive) response empty, collect error code
        #
        if [[ -z ${VALIDATE_SUBSCRIPTION_RESPONSE} ]]; then
          VALIDATE_SUBSCRIPTION_RESPONSE=("error" $(grep -E "${MBG_VALIDATE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
        fi
#set -x  jadams
        SUBSCRIPTION_PAYMENT_TIME_RAW=($(grep -Em1 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
        SUBSCRIPTION_PAYMENT_TIME=$(echo $SUBSCRIPTION_PAYMENT_TIME_RAW | ${SED_CMD} 's/T/ /')
        SUBSCRIPTION_PAYMENT_REQUEST=($(grep -Em1 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
        SUBSCRIPTION_PAYMENT_RESPONSE=($(grep -Em1 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI|success" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
        SUBSCRIPTION_PAYMENT_RESPONSE=$(to_upper ${SUBSCRIPTION_PAYMENT_RESPONSE})

        # if (positive) response empty, collect error code
        #
        if [[ -z ${SUBSCRIPTION_PAYMENT_RESPONSE} ]]; then
          SUBSCRIPTION_PAYMENT_RESPONSE=("error" $(grep -Em1 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
        fi
#set +x

        # echo SUBSCRIPTION_PAYMENT_RESPONSE:   ${SUBSCRIPTION_PAYMENT_RESPONSE[0]}
        # echo SUBSCRIPTION_PAYMENT_RESPONSE:   ${SUBSCRIPTION_PAYMENT_RESPONSE[1]}

        local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_REQUEST}"
        local SUBSCRIPTION_PAYMENT_RESPONSE="${SUBSCRIPTION_PAYMENT_RESPONSE[1]}"

        # echo SUBSCRIPTION_PAYMENT_UTI:        ${SUBSCRIPTION_PAYMENT_UTI}
        # echo SUBSCRIPTION_PAYMENT_RESPONSE:   ${SUBSCRIPTION_PAYMENT_RESPONSE}

        # INIT_SUBSCRIPTION_CAPTURE, if INIT_SUBSCRIPTION_PAYMENT successful
        #
        if [[ ${SUBSCRIPTION_PAYMENT_RESPONSE[0]} != "error" ]]; then
          INIT_SUBSCRIPTION_CAPTURE_TIME_RAW=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
          INIT_SUBSCRIPTION_CAPTURE_TIME=$(echo $INIT_SUBSCRIPTION_CAPTURE_TIME_RAW | ${SED_CMD} 's/T/ /')
          INIT_SUBSCRIPTION_CAPTURE_REQUEST=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
          INIT_SUBSCRIPTION_CAPTURE_RESPONSE=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI|success" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
          INIT_SUBSCRIPTION_CAPTURE_RESPONSE=$(to_upper ${INIT_SUBSCRIPTION_CAPTURE_RESPONSE})

          # if (positive) response empty, collect error code
          #
          if [[ -z ${INIT_SUBSCRIPTION_CAPTURE_RESPONSE} ]]; then
            INIT_SUBSCRIPTION_CAPTURE_RESPONSE=("error" $(grep -E "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
          fi
        fi # INIT_SUBSCRIPTION_PAYMENT successful
      fi # PREPARE_SUBSCRIPTION successful

    fi # end CHANNEL "WAP"

    if [[ ${CHANNEL} == "WEB" ]]; then
      ${INFO} && local MSG="parse SETUP_DATA for channel: ${CHANNEL}"
      ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

      # echo MBG_VF_SMK_REQUEST_MAPPING:  ${MBG_VF_SMK_REQUEST_MAPPING[MBG_PIN_SUBSCRIPTION_REQUEST]}
      # echo STATE_MESSAGE:               ${FLAGS1_MEANING[A]}

      PIN_SUBSCRIPTION_TIME_RAW=($(grep -E "${MBG_PIN_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
      PIN_SUBSCRIPTION_TIME=$(echo $PIN_SUBSCRIPTION_TIME_RAW | ${SED_CMD} 's/T/ /')
      PIN_SUBSCRIPTION_RESPONSE=($(grep -E "${MBG_PIN_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "simToken.*simToken|UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))

      # if (positive) response empty, collect error code
      #
      if [[ -z ${PIN_SUBSCRIPTION_RESPONSE} ]]; then
        PIN_SUBSCRIPTION_RESPONSE=("error" $(grep -E "${MBG_PIN_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
      fi

      PREPARE_SUBSCRIPTION_TIME_RAW=($(grep -E "${MBG_PREPARE_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
      PREPARE_SUBSCRIPTION_TIME=$(echo $PREPARE_SUBSCRIPTION_TIME_RAW | ${SED_CMD} 's/T/ /')
      PREPARE_SUBSCRIPTION_CHANNEL=($(grep -E "${MBG_PREPARE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "channel.*channel" | ${SED_CMD} -re 's/.*>|<.*//g'))
      PREPARE_SUBSCRIPTION_RESPONSE=($(grep -E "${MBG_PREPARE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "simToken.*simToken|UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))

      # if (positive) response empty, collect error code
      #
      if [[ -z ${PREPARE_SUBSCRIPTION_RESPONSE} ]]; then
        PREPARE_SUBSCRIPTION_RESPONSE=("error" $(grep -E "${MBG_PREPARE_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
      fi

      # INIT_SUBSCRIPTION_PAYMENT|CAPTURE, if PREPARE_SUBSCRIPTION successful
      if [[ ${PREPARE_SUBSCRIPTION_RESPONSE[0]} != "error" ]]; then

        SUBSCRIPTION_PAYMENT_TIME_RAW=($(grep -Em1 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
        SUBSCRIPTION_PAYMENT_TIME=$(echo $INIT_SUBSCRIPTION_TIME_RAW | ${SED_CMD} 's/T/ /')
        SUBSCRIPTION_PAYMENT_REQUEST=($(grep -Em1 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
        SUBSCRIPTION_PAYMENT_RESPONSE=($(grep -Em1 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI|success" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
        SUBSCRIPTION_PAYMENT_RESPONSE=$(to_upper ${SUBSCRIPTION_PAYMENT_RESPONSE})

        # if (positive) response empty, collect error code
        #
        if [[ -z ${SUBSCRIPTION_PAYMENT_RESPONSE} ]]; then
          SUBSCRIPTION_PAYMENT_RESPONSE=("error" $(grep -Em1 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
        fi

        # INIT_SUBSCRIPTION_CAPTURE, if INIT_SUBSCRIPTION_PAYMENT successful
        #
        if [[ ${SUBSCRIPTION_PAYMENT_RESPONSE[0]} != "error" ]]; then
          INIT_SUBSCRIPTION_CAPTURE_TIME_RAW=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
          INIT_SUBSCRIPTION_CAPTURE_TIME=$(echo $INIT_SUBSCRIPTION_TIME_RAW | ${SED_CMD} 's/T/ /')
          INIT_SUBSCRIPTION_CAPTURE_REQUEST=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
          INIT_SUBSCRIPTION_CAPTURE_RESPONSE=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI|success" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))

          # if (positive) response empty, collect error code
          #
          if [[ -z ${INIT_SUBSCRIPTION_CAPTURE_RESPONSE} ]]; then
            INIT_SUBSCRIPTION_CAPTURE_RESPONSE=("error" $(grep -Em2 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
          fi
        fi # INIT_SUBSCRIPTION_PAYMENT successful
      fi # PREPARE_SUBSCRIPTION successful

    fi # end CHANNEL "WEB"

  fi # end COLL_SETUP_DATA

  if [[ ${COLL_TYPE_STOP} == "true" ]] || [[ ${COLL_STOP_DATA} == "true" ]]; then

    ${INFO} && local MSG="parse STOP_DATA for channel: ${CHANNEL}"
    ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

    STOP_SUBSCRIPTION_TIME_RAW=($(grep -E "${MBG_STOP_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
    STOP_SUBSCRIPTION_TIME=$(echo $STOP_SUBSCRIPTION_TIME_RAW | ${SED_CMD} 's/T/ /')
    STOP_SUBSCRIPTION_REQUEST=($(grep -E "${MBG_STOP_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
    STOP_SUBSCRIPTION_RESPONSE=($(grep -E "${MBG_STOP_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "success" | ${SED_CMD} -re 's/.*>|<.*//g'))

    # if (positive) response empty, collect error code
    #
    if [[ -z ${STOP_SUBSCRIPTION_RESPONSE} ]]; then
      STOP_SUBSCRIPTION_RESPONSE=("error" $(grep -E "${MBG_STOP_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
    fi
  fi # end COLL_STOP_DATA

  if [[ ${COLL_TYPE_REFUND} == "true" ]] || [[ ${COLL_REFUND_DATA} == "true" ]]; then

    ${INFO} && local MSG="parse REFUND_DATA for channel: ${CHANNEL}"
    ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

    REFUND_SUBSCRIPTIONTIME_RAW=($(grep -E "${MBG_REFUND_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "messageTS.*messageTS" | ${SED_CMD} -re 's/.*>|<.*//g'))
    REFUND_SUBSCRIPTIONTIME_=$(echo $REFUND_SUBSCRIPTIONTIME_RAW | ${SED_CMD} 's/T/ /')
    REFUND_SUBSCRIPTION_REQUEST=($(grep -E "${MBG_REFUND_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
    REFUND_SUBSCRIPTION_RESPONSE=($(grep -E "${MBG_REFUND_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "success" | ${SED_CMD} -re 's/.*>|<.*//g'))

    # if (positive) response empty, collect error code
    #
    if [[ -z ${REFUND_SUBSCRIPTION_RESPONSE} ]]; then
      REFUND_SUBSCRIPTION_RESPONSE=("error" $(grep -E "${MBG_REFUND_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "errorCode.*errorCode" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))
    fi
  fi # end COLL_REFUND_DATA

  # remove raw file not longer needed
  #
  if [[ ${STRIP_CARRIER_DATA} == "true" ]]; then
    rm -f ${TMPFILE} &>/dev/null
  fi

  ${INFO} && local MSG="finished parse carrier protocol data"
  ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

  return 0

#set +x
}

# ------------------------------------------------------------------------------
# write_raw_data ()
#
# DESCRIPTION   Write all MANDATE_DETAILS as raw data (CSV) to file
# SYNOPSIS      write_raw_data SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_raw_data () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local TMPFILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.raw"
local RESULT_FILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.dat"
local SRESULT_FILE=${RESULT_FILE##*/}
local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"
local SRESULT_CSV=${RESULT_CSV##*/}

  # ------------------------------------------------------------------------------
  # prepare results file
  # ------------------------------------------------------------------------------

  if [[ ! -s ${RESULT_CSV} ]]; then
    ${INFO} && local MSG="no csv file found"
    ${INFO} && logger INFO ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}

    mkdir -p ${DATA_DIR}/${PROCESSING_DATE} &>/dev/null
    touch ${RESULT_CSV}
  else
    ${INFO} && local MSG="reset existing csv file: ${SRESULT_CSV}"
    ${INFO} && logger INFO ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}

    rm -f ${RESULT_CSV} &>/dev/null
    touch ${RESULT_CSV}
  fi

  ${INFO} && local MSG="start processing raw data records"
  ${INFO} && logger INFO ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}

  if [[ ${VERBOSE} == "true" ]]; then
   echo
   echo "  ------------------------- start raw data -----------------------------"
  fi

  # ----------------------------------------------------------------------------
  # write REQUEST raw data
  # ----------------------------------------------------------------------------

  if [[ ${CHANNEL} == "WAP" ]]; then

    local PREPARE_SUBSCRIPTION_UTI="${PREPARE_SUBSCRIPTION_RESPONSE[1]}"
    if ! [[ -z ${PREPARE_SUBSCRIPTION_UTI} ]]; then
      write_prepare_subscription_data ${PATTERN} ${PROCESSING_DATE}
    elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
      ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: PREPARE_SUBSCRIPTION"
      ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
      if [[ ${VERBOSE} == "true" ]]; then
       echo "  ------------------------- end raw data -------------------------------"
       echo
      fi
      return 1
    fi

    local VALIDATE_SUBSCRIPTION_UTI="${VALIDATE_SUBSCRIPTION_RESPONSE[1]}"
    if ! [[ -z ${VALIDATE_SUBSCRIPTION_UTI} ]]; then
      write_subscription_validate_csv ${PATTERN} ${PROCESSING_DATE}
    elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
      ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: VALIDATE_SUBSCRIPTION"
      ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
      if [[ ${VERBOSE} == "true" ]]; then
       echo "  ------------------------- end raw data -------------------------------"
       echo
      fi
      return 1
    fi

    # WORKAROUND for incomplete|missing carrier protocol data
    #
    # Check if initSubscription|mandatePayment response data is available
    # if NOT, the protocoll is missing and data incomplete
    #
    local PAYMENT_RESPONSE_0=${SUBSCRIPTION_PAYMENT_RESPONSE[0]}
    local PAYMENT_RESPONSE_1=${SUBSCRIPTION_PAYMENT_RESPONSE[1]}
    if ! [[ -z $PAYMENT_RESPONSE_0 ]] && ! [[ -z $PAYMENT_RESPONSE_1 ]]; then
      local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_RESPONSE[0]}"
    else
      local SUBSCRIPTION_PAYMENT_UTI=""
    fi

    if ! [[ -z ${SUBSCRIPTION_PAYMENT_UTI} ]]; then
      write_subscription_payment_csv ${PATTERN} ${PROCESSING_DATE}
    elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
      ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: INIT_SUBSCRIPTION_PAYMENT"
      ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
      if [[ ${VERBOSE} == "true" ]]; then
       echo "  ------------------------- end raw data -------------------------------"
       echo
      fi
      return 1
    fi

    if [[ ${SUBSCRIPTION_PAYMENT_RESPONSE[0]} != "error" ]]; then
      local INIT_SUBSCRIPTION_CAPTURE_UTI="${INIT_SUBSCRIPTION_CAPTURE_RESPONSE[0]}"
      if ! [[ -z ${INIT_SUBSCRIPTION_CAPTURE_UTI} ]]; then
        write_subscription_capture_csv ${PATTERN} ${PROCESSING_DATE}
      elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
        ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: INIT_SUBSCRIPTION_CAPTURE"
        ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
        if [[ ${VERBOSE} == "true" ]]; then
         echo "  ------------------------- end raw data -------------------------------"
         echo
        fi
        return 1
      fi
    fi

  elif [[ ${CHANNEL} == "WEB" ]]; then

    local PIN_SUBSCRIPTION_UTI="${PIN_SUBSCRIPTION_RESPONSE[1]}"
    if ! [[ -z ${PIN_SUBSCRIPTION_UTI} ]]; then
      write_pin_subscription_data_csv ${PATTERN} ${PROCESSING_DATE}
    elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
      ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: PIN_SUBSCRIPTION"
      ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
      if [[ ${VERBOSE} == "true" ]]; then
       echo "  ------------------------- end raw data -------------------------------"
       echo
      fi
      return 1
    fi

    local PREPARE_SUBSCRIPTION_UTI="${PREPARE_SUBSCRIPTION_RESPONSE[1]}"
    if ! [[ -z ${PREPARE_SUBSCRIPTION_UTI} ]]; then
      write_prepare_subscription_data ${PATTERN} ${PROCESSING_DATE}
    elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
      ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: PREPARE_SUBSCRIPTION"
      ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
      if [[ ${VERBOSE} == "true" ]]; then
       echo "  ------------------------- end raw data -------------------------------"
       echo
      fi
      return 1
    fi

    local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_RESPONSE[0]}"
    if ! [[ -z ${SUBSCRIPTION_PAYMENT_UTI} ]]; then
      write_subscription_payment_csv ${PATTERN} ${PROCESSING_DATE}
    elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
      ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: INIT_SUBSCRIPTION_PAYMENT"
      ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
      if [[ ${VERBOSE} == "true" ]]; then
       echo "  ------------------------- end raw data -------------------------------"
       echo
      fi
      return 1
    fi

    if [[ ${SUBSCRIPTION_PAYMENT_RESPONSE[0]} != "error" ]]; then
      local INIT_SUBSCRIPTION_CAPTURE_UTI="${INIT_SUBSCRIPTION_CAPTURE_RESPONSE[0]}"
      if ! [[ -z ${INIT_SUBSCRIPTION_CAPTURE_UTI} ]]; then
        write_subscription_capture_csv ${PATTERN} ${PROCESSING_DATE}
      elif [[ ${COLL_TYPE_SETUP} == "true" ]] && [[ ${COLL_SETUP_DATA} == "true" ]]; then
        ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: INIT_SUBSCRIPTION_CAPTURE"
        ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
        if [[ ${VERBOSE} == "true" ]]; then
         echo "  ------------------------- end raw data -------------------------------"
         echo
        fi
        return 1
      fi
    fi
  fi

  local STOP_SUBSCRIPTION_UTI="${STOP_SUBSCRIPTION_RESPONSE}"
  if ! [[ -z ${STOP_SUBSCRIPTION_UTI} ]]; then
    write_subscription_stop_csv ${PATTERN} ${PROCESSING_DATE}
  elif [[ ${COLL_TYPE_STOP} == "true" ]] && [[ ${COLL_STOP_DATA} == "true" ]]; then
    ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: STOP_SUBSCRIPTION"
    ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
    if [[ ${VERBOSE} == "true" ]]; then
     echo "  ------------------------- end raw data -------------------------------"
     echo
    fi
    return 1
  fi

  local REFUND_SUBSCRIPTION_UTI="${REFUND_SUBSCRIPTION_RESPONSE}"
  if ! [[ -z ${REFUND_SUBSCRIPTION_UTI} ]]; then
    write_subscription_refund_csv ${PATTERN} ${PROCESSING_DATE}
  elif [[ ${COLL_TYPE_REFUND} == "true" ]] && [[ ${COLL_REFUND_DATA} == "true" ]]; then
    ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: REFUND_SUBSCRIPTION"
    ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
    if [[ ${VERBOSE} == "true" ]]; then
     echo "  ------------------------- end raw data -------------------------------"
     echo
    fi
    return 1
  fi

  # ----------------------------------------------------------------------------
  # write MANDATE raw data
  # ----------------------------------------------------------------------------

  local MANDATE_MERCHANTID="${MERCHANTID}"
  if ! [[ -z ${MANDATE_MERCHANTID} ]]; then
    write_merchand_data_csv ${PATTERN} ${PROCESSING_DATE}
  elif [[ ${COLL_MERCHAND_DATA} == "true" ]]; then
    ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: MERCHAND DATA"
    ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
    if [[ ${VERBOSE} == "true" ]]; then
     echo "  ------------------------- end raw data -------------------------------"
     echo
    fi
    return 1
  fi

  local MANDATE_SIM_TOKEN="${PREPARE_SUBSCRIPTION_RESPONSE[0]}"
  if ! [[ -z ${MANDATE_SIM_TOKEN} ]]; then
    write_ms_data_csv ${PATTERN} ${PROCESSING_DATE}
  elif [[ ${COLL_MS_DATA} == "true" ]]; then
    ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: MS DATA"
    ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
    if [[ ${VERBOSE} == "true" ]]; then
     echo "  ------------------------- end raw data -------------------------------"
     echo
    fi
    return 1
  fi

  #local USER_ID="${USERID}"
  local MANDATE_DESCRIPTION_OF_GOODS="${DESCRIPTION_OF_GOODS}"
  if ! [[ -z ${MANDATE_DESCRIPTION_OF_GOODS} ]]; then
    write_product_data_csv ${PATTERN} ${PROCESSING_DATE}
  elif [[ ${COLL_PRODUCT_DATA} == "true" ]]; then
    ${ERROR} && local MSG="${STATE_MESSAGE[no_data]}: PRODUCT DATA"
    ${ERROR} && logger ERROR ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}
    if [[ ${VERBOSE} == "true" ]]; then
     echo "  ------------------------- end raw data -------------------------------"
     echo
    fi
    return 1
  fi

  if [[ ${VERBOSE} == "true" ]]; then
   echo "  ------------------------- end raw data -------------------------------"
   echo
  fi

  ${DEBUG} && local MSG="finished processing raw data records"
  ${DEBUG} && logger DEBUG ${PATTERN} write_raw_data "${MSG}" ${LOGFILE}

  return 0

#set +x
}

# ------------------------------------------------------------------------------
# write_merchand_data_csv ()
#
# DESCRIPTION   Write all merchand details as raw (CSV) data
# SYNOPSIS      write_merchand_data_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_merchand_data_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"


# ${DEBUG} && local MSG="start collect merchand data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_merchand_data_csv "${MSG}" ${LOGFILE}

local PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${PREPARE_SUBSCRIPTION_TIME}" +%s)"
local PREPARE_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")

MANDATE_USERID="${USERID}"
MANDATE_MERCHANTID="${MERCHANTID}"
MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
MANDATE_MERCHAND_DESIGNID="${MERCHAND_DESIGNID}"

#TEMPLATE="MID "${MERCHANTID}", "$CUSTOMER" \""$PRODUCT"\", "${PATTERN}", "${DATE}""
#HEADER=$(printf "${TEMPLATE}\n" ; eval printf '%.0s=' "{1..${#TEMPLATE}}")

DELM=${CSV_DELIMITER}

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}MERCHAND_DATA${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_USERID}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_MERCHAND_DESIGNID}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}MERCHAND_DATA${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_USERID}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_MERCHAND_DESIGNID}
EOF
fi

# ${DEBUG} && local MSG="finished collect merchand data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_merchand_data_csv "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_ms_data_csv ()
#
# DESCRIPTION   Write mobile subscriber (ms) details as raw (CSV) data
# SYNOPSIS      write_ms_data_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_ms_data_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

local PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${PREPARE_SUBSCRIPTION_TIME}" +%s)"
local PREPARE_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")

local MANDATE_MSISDN="${MSISDN}"
local MANDATE_SIM_TOKEN="${PREPARE_SUBSCRIPTION_RESPONSE[0]}"

# ${DEBUG} && local MSG="start collect MS DATA"
# ${DEBUG} && logger DEBUG ${PATTERN} write_ms_data_csv "${MSG}" ${LOGFILE}

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}MS_DATA${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MSISDN}${DELM}${MANDATE_SIM_TOKEN}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}MS_DATA${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MSISDN}${DELM}${MANDATE_SIM_TOKEN}
EOF
fi

# ${DEBUG} && local MSG="finished collect MS DATA"
# ${DEBUG} && logger DEBUG ${PATTERN} write_ms_data_csv "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_product_data_csv ()
#
# DESCRIPTION   Write product details as raw (CSV) data
# SYNOPSIS      write_product_data_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_product_data_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

# ${DEBUG} && local MSG="start collect PRODUCT DATA"
# ${DEBUG} && logger DEBUG ${PATTERN} write_product_data_csv "${MSG}" ${LOGFILE}

local PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${PREPARE_SUBSCRIPTION_TIME}" +%s)"
local PREPARE_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")

local MANDATE_AMOUNT="${AMOUNT}"
local MANDATE_CHANNEL="${PREPARE_SUBSCRIPTION_CHANNEL}"
local MANDATE_DESCRIPTION_OF_GOODS="${DESCRIPTION_OF_GOODS}"

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}PRODUCT_DATA${DELM}${TRANSACTIONID}${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${REQUEST_TYPE}${DELM}${CHANNEL}${DELM}${MANDATE_AMOUNT}${DELM}${MANDATE_DESCRIPTION_OF_GOODS}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}PRODUCT_DATA${DELM}${TRANSACTIONID}${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${REQUEST_TYPE}${DELM}${CHANNEL}${DELM}${MANDATE_AMOUNT}${DELM}${MANDATE_DESCRIPTION_OF_GOODS}
EOF
fi

# ${DEBUG} && local MSG="finished collect PRODUCT DATA"
# ${DEBUG} && logger DEBUG ${PATTERN} write_product_data_csv "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_pin_subscription_data_csv ()
#
# DESCRIPTION   Write all mandate setup details as raw (CSV) data
# SYNOPSIS      write_pin_subscription_data_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_pin_subscription_data_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

local MANDATE_MERCHANTID="${MERCHANTID}"
local MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
local MANDATE_AMOUNT="${AMOUNT}"

local PIN_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${PIN_SUBSCRIPTION_TIME}" +%s)"
local PIN_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${PIN_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
local PIN_SUBSCRIPTION_UTI="${PIN_SUBSCRIPTION_RESPONSE[0]}"
local PIN_SUBSCRIPTION_RESPONSE="${PIN_SUBSCRIPTION_RESPONSE[1]}"
local PIN_SUBSCRIPTION_RESPONSE=$(to_upper ${PIN_SUBSCRIPTION_RESPONSE})

# ${DEBUG} && local MSG="start collect PIN_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_pin_subscription_data_csv "${MSG}" ${LOGFILE}

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}PIN_SUBSCRIPTION${DELM}mandateSetupRequest${DELM}${PIN_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${PIN_SUBSCRIPTION_UTI}${DELM}${PIN_SUBSCRIPTION_RESPONSE}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}PIN_SUBSCRIPTION${DELM}mandateSetupRequest${DELM}${PIN_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${PIN_SUBSCRIPTION_UTI}${DELM}${PIN_SUBSCRIPTION_RESPONSE}
EOF
fi

# ${DEBUG} && local MSG="finished collect PIN_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_pin_subscription_data_csv "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_prepare_subscription_data ()
#
# DESCRIPTION   Write all mandate setup details as raw (CSV) data
# SYNOPSIS      write_prepare_subscription_data SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_prepare_subscription_data () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

local MANDATE_MERCHANTID="${MERCHANTID}"
local MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
local MANDATE_AMOUNT="${AMOUNT}"

local PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${PREPARE_SUBSCRIPTION_TIME}" +%s)"
local PREPARE_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${PREPARE_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
local PREPARE_SUBSCRIPTION_UTI="${PREPARE_SUBSCRIPTION_RESPONSE[0]}"
local PREPARE_SUBSCRIPTION_RESPONSE="${PREPARE_SUBSCRIPTION_RESPONSE[1]}"
local PREPARE_SUBSCRIPTION_RESPONSE=$(to_upper ${PREPARE_SUBSCRIPTION_RESPONSE})

# ${DEBUG} && local MSG="start collect PREPARE_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_prepare_subscription_data "${MSG}" ${LOGFILE}

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}PREPARE_SUBSCRIPTION${DELM}mandateSetupRequest${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${PREPARE_SUBSCRIPTION_UTI}${DELM}${PREPARE_SUBSCRIPTION_RESPONSE}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}PREPARE_SUBSCRIPTION${DELM}mandateSetupRequest${DELM}${PREPARE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${PREPARE_SUBSCRIPTION_UTI}${DELM}${PREPARE_SUBSCRIPTION_RESPONSE}
EOF
fi

# ${DEBUG} && local MSG="finished collect PREPARE_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_prepare_subscription_data "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_subscription_validate_csv ()
#
# DESCRIPTION   Write all mandate setup details as raw (CSV) data
# SYNOPSIS      write_subscription_validate_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_subscription_validate_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

local MANDATE_MERCHANTID="${MERCHANTID}"
local MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
local MANDATE_AMOUNT="${AMOUNT}"

local VALIDATE_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${VALIDATE_SUBSCRIPTION_TIME}" +%s)"
local VALIDATE_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${VALIDATE_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
local VALIDATE_SUBSCRIPTION_UTI="${VALIDATE_SUBSCRIPTION_REQUEST[1]}"
local VALIDATE_SUBSCRIPTION_RESPONSE="${VALIDATE_SUBSCRIPTION_RESPONSE[1]}"
local VALIDATE_SUBSCRIPTION_RESPONSE=$(to_upper ${VALIDATE_SUBSCRIPTION_RESPONSE})

# ${DEBUG} && local MSG="start collect VALIDATE_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_prepare_subscription_data "${MSG}" ${LOGFILE}

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}VALIDATE_SUBSCRIPTION${DELM}mandateSetupRequest${DELM}${VALIDATE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${VALIDATE_SUBSCRIPTION_UTI}${DELM}${VALIDATE_SUBSCRIPTION_RESPONSE}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}VALIDATE_SUBSCRIPTION${DELM}mandateSetupRequest${DELM}${VALIDATE_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${VALIDATE_SUBSCRIPTION_UTI}${DELM}${VALIDATE_SUBSCRIPTION_RESPONSE}
EOF
fi

# ${DEBUG} && local MSG="finished collect VALIDATE_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_prepare_subscription_data "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_subscription_payment_csv ()
#
# DESCRIPTION   Write all mandate payment details as raw (CSV) data
# SYNOPSIS      write_subscription_payment_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_subscription_payment_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

# no initSubscription data available if validateSubscription failed
#
if [[ ! ${VALIDATE_SUBSCRIPTION_RESPONSE[0]} == "error" ]]; then

local MANDATE_MERCHANTID="${MERCHANTID}"
local MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
local MANDATE_AMOUNT="${AMOUNT}"

local SUBSCRIPTION_PAYMENT_TIMESTAMP_EPOCH="$($DATE_CMD -d "${SUBSCRIPTION_PAYMENT_TIME}" +%s)"
local SUBSCRIPTION_PAYMENT_TIMESTAMP=$($DATE_CMD --date @${SUBSCRIPTION_PAYMENT_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_REQUEST}"
local SUBSCRIPTION_PAYMENT_RESPONSE="${SUBSCRIPTION_PAYMENT_RESPONSE[1]}"
local SUBSCRIPTION_PAYMENT_RESPONSE=$(to_upper ${SUBSCRIPTION_PAYMENT_RESPONSE})

# ${DEBUG} && local MSG="start collect INIT_SUBSCRIPTION_PAYMENT data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_payment_csv "${MSG}" ${LOGFILE}

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}INIT_SUBSCRIPTION_PAYMENT${DELM}paymentRequest${DELM}${SUBSCRIPTION_PAYMENT_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${SUBSCRIPTION_PAYMENT_UTI}${DELM}${SUBSCRIPTION_PAYMENT_RESPONSE}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}INIT_SUBSCRIPTION_PAYMENT${DELM}paymentRequest${DELM}${SUBSCRIPTION_PAYMENT_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${SUBSCRIPTION_PAYMENT_UTI}${DELM}${SUBSCRIPTION_PAYMENT_RESPONSE}
EOF
fi

# ${DEBUG} && local MSG="finished collect INIT_SUBSCRIPTION_PAYMENT data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_payment_csv "${MSG}" ${LOGFILE}

fi

#set +x
}

# ------------------------------------------------------------------------------
# write_subscription_capture_csv ()
#
# DESCRIPTION   Write all mandate capture details as raw (CSV) data
# SYNOPSIS      write_subscription_capture_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_subscription_capture_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

# no initSubscription data available if validateSubscription failed
#
if [[ ! ${VALIDATE_SUBSCRIPTION_RESPONSE[0]} == "error" ]]; then

local MANDATE_MERCHANTID="${MERCHANTID}"
local MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
local MANDATE_AMOUNT="${AMOUNT}"

local INIT_SUBSCRIPTION_CAPTURE_TIMESTAMP_EPOCH="$($DATE_CMD -d "${INIT_SUBSCRIPTION_CAPTURE_TIME}" +%s)"
local INIT_SUBSCRIPTION_CAPTURE_TIMESTAMP=$($DATE_CMD --date @${INIT_SUBSCRIPTION_CAPTURE_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
local INIT_SUBSCRIPTION_CAPTURE_REQUEST_UTI="${INIT_SUBSCRIPTION_CAPTURE_REQUEST}"
local INIT_SUBSCRIPTION_CAPTURE_RESPONSE_UTI="${INIT_SUBSCRIPTION_CAPTURE_RESPONSE[0]}"

# INIT_SUBSCRIPTION_CAPTURE_REQUEST=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_REQUEST_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI" | ${SED_CMD} -re 's/.*>|<.*//g'))
# INIT_SUBSCRIPTION_CAPTURE_RESPONSE=($(grep -Em2 "${MBG_INIT_SUBSCRIPTION_RESPONSE_PATTERN}" ${RESULT_FILE} | grep -Eo "UTI.*UTI|success" | ${SED_CMD} -re 's/.*>|<.*//g' | sort -u))

# ${DEBUG} && local MSG="start collect INIT_SUBSCRIPTION_CAPTURE data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_capture_csv "${MSG}" ${LOGFILE}

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}INIT_SUBSCRIPTION_CAPTURE${DELM}captureRequest${DELM}${INIT_SUBSCRIPTION_CAPTURE_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${INIT_SUBSCRIPTION_CAPTURE_REQUEST_UTI}${DELM}${INIT_SUBSCRIPTION_CAPTURE_RESPONSE_UTI}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}INIT_SUBSCRIPTION_CAPTURE${DELM}captureRequest${DELM}${INIT_SUBSCRIPTION_CAPTURE_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${INIT_SUBSCRIPTION_CAPTURE_REQUEST_UTI}${DELM}${INIT_SUBSCRIPTION_CAPTURE_RESPONSE_UTI}
EOF
fi

# ${DEBUG} && local MSG="finished collect INIT_SUBSCRIPTION_CAPTURE data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_capture_csv "${MSG}" ${LOGFILE}

fi

#set +x
}

# ------------------------------------------------------------------------------
# write_subscription_stop_csv ()
#
# DESCRIPTION   Write all mandate cancel details as raw (CSV) data
# SYNOPSIS      write_subscription_stop_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_subscription_stop_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"
local DAT_FILE="${CACHE_DIR}/${PROCESSING_DATE}/${PATTERN}.dat"

# ${DEBUG} && local MSG="start collect STOP_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_stop_csv "${MSG}" ${LOGFILE}

local MANDATE_MERCHANTID="${MERCHANTID}"
local MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
local MANDATE_AMOUNT="${AMOUNT}"

local STOP_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${STOP_SUBSCRIPTION_TIME}" +%s)"
local STOP_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${STOP_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
local STOP_SUBSCRIPTION_UTI="${STOP_SUBSCRIPTION_REQUEST}"

if [[ "${STOP_SUBSCRIPTION_RESPONSE}" == "success"  ]]; then
  local STOP_SUBSCRIPTION_RESPONSE="${STOP_SUBSCRIPTION_RESPONSE}"
  local STOP_SUBSCRIPTION_RESPONSE=$(to_upper ${STOP_SUBSCRIPTION_RESPONSE})
else
  local STOP_SUBSCRIPTION_RESPONSE="${STOP_SUBSCRIPTION_RESPONSE[1]}"
fi

#set -x
    local line=($(grep -Em1 '\[stopSubscription\]' "${DAT_FILE}" | grep -Eo "\[.*\]" | ${SED_CMD} -re 's/\[|\]//g'))
    local ID_RECORD=($(echo ${line[7]} | ${SED_CMD} -re 's/\// /g'))
    STOP_TRANSACTIONID=${ID_RECORD[1]}
#set +x

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}STOP_SUBSCRIPTION${DELM}cancelSubscriptionRequest${DELM}${STOP_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${STOP_SUBSCRIPTION_UTI}${DELM}${STOP_SUBSCRIPTION_RESPONSE}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}STOP_SUBSCRIPTION${DELM}cancelSubscriptionRequest${DELM}${STOP_SUBSCRIPTION_TIMESTAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${STOP_SUBSCRIPTION_UTI}${DELM}${STOP_SUBSCRIPTION_RESPONSE}
EOF
fi

# ${DEBUG} && local MSG="finished collect STOP_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_stop_csv "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_subscription_refund_csv ()
#
# DESCRIPTION   Write all mandate refund details as raw (CSV) data
# SYNOPSIS      write_subscription_refund_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
function write_subscription_refund_csv () {
#set -x

local PATTERN=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/${PROCESSING_DATE}/${PATTERN}.csv"

# ${DEBUG} && local MSG="start collect REFUND_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_refund_csv "${MSG}" ${LOGFILE}

local MANDATE_MERCHANTID="${MERCHANTID}"
local MANDATE_MERCHAND_SERVICEID="${MERCHAND_SERVICEID}"
local MANDATE_AMOUNT="${AMOUNT}"

local REFUND_SUBSCRIPTIONTIME_STAMP_EPOCH="$($DATE_CMD -d "${REFUND_SUBSCRIPTIONTIME_}" +%s)"
local REFUND_SUBSCRIPTIONTIME_STAMP=$($DATE_CMD --date @${REFUND_SUBSCRIPTIONTIME_STAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
local REFUND_SUBSCRIPTION_UTI="${REFUND_SUBSCRIPTION_REQUEST}"
local REFUND_SUBSCRIPTION_RESPONSE="${REFUND_SUBSCRIPTION_RESPONSE}"
local REFUND_SUBSCRIPTION_RESPONSE=$(to_upper ${REFUND_SUBSCRIPTION_RESPONSE})

if [[ ${VERBOSE} == "true" ]]; then
  cat <<- EOF | tee -a ${RESULT_CSV}
  ${PATTERN}${DELM}REFUND_SUBSCRIPTION${DELM}refundRequest${DELM}${REFUND_SUBSCRIPTIONTIME_STAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${REFUND_SUBSCRIPTION_UTI}${DELM}${REFUND_SUBSCRIPTION_RESPONSE}
EOF
else
  cat << EOF > ${RESULT_CSV}
  ${PATTERN}${DELM}REFUND_SUBSCRIPTION${DELM}refundRequest${DELM}${REFUND_SUBSCRIPTIONTIME_STAMP}${DELM}${MANDATE_MERCHANTID}${DELM}${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_AMOUNT}${DELM}${REFUND_SUBSCRIPTION_UTI}${DELM}${REFUND_SUBSCRIPTION_RESPONSE}
EOF
fi

# ${DEBUG} && local MSG="finished collect REFUND_SUBSCRIPTION data"
# ${DEBUG} && logger DEBUG ${PATTERN} write_subscription_refund_csv "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# write_stop_data_record_csv ()
#
# DESCRIPTION   Write all merchand details as raw (CSV) data
# SYNOPSIS      write_stop_data_record_csv SUBSCRIPTION_ID PROCESSING_DATE
#
# ------------------------------------------------------------------------------
# NOTE
#   The stop record is EXTENDED for DD specific data to identify
#   transactions|subscriptions with the RESL databases
#
# ------------------------------------------------------------------------------
# NOTE
#   If NO stopSubscription logline can be found|extracted from MBG logs,
#   the resulting timestamp (for the stop) is "COLLECTION_DATE 00:00:00"
#   (e.g. 2018-04-10 00:00:00).
#
#   For such cases, an analysis is needed why the resulting data record
#   (~/cache/SubscriptionID.dat) is incomplete.
#
# ------------------------------------------------------------------------------

function write_stop_data_record_csv () {
#set -x

local SUBSCRIPTION_ID=$1
local PROCESSING_DATE=$2

local RESULT_CSV="${DATA_DIR}/PGW-SUBSCRIPTIONS-CLOSED-DATA.${PROCESSING_DATE}.csv"

  ${INFO} && local MSG="start create stop data record"
  ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

  local VALIDATE_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${VALIDATE_SUBSCRIPTION_TIME}" +%s)"
  local VALIDATE_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${VALIDATE_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")
  local VALIDATE_SUBSCRIPTION_UTI="${VALIDATE_SUBSCRIPTION_REQUEST[1]}"
  local VALIDATE_SUBSCRIPTION_RESPONSE="${VALIDATE_SUBSCRIPTION_RESPONSE[1]}"
  local VALIDATE_SUBSCRIPTION_RESPONSE=$(to_upper ${VALIDATE_SUBSCRIPTION_RESPONSE})

  local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_REQUEST}"
  local SUBSCRIPTION_PAYMENT_RESPONSE="${SUBSCRIPTION_PAYMENT_RESPONSE[1]}"
  local SUBSCRIPTION_PAYMENT_RESPONSE=$(to_upper ${SUBSCRIPTION_PAYMENT_RESPONSE})

#set -x  jadams
  local ERROR_FLAG=false
  [[ "${VALIDATE_SUBSCRIPTION_RESPONSE}"  =~ ^E-.* ]] && local VALIDATE_SUBSCRIPTION_ERROR=true
  [[ "${SUBSCRIPTION_PAYMENT_RESPONSE[1]}"  =~ ^E-.* ]] && local SUBSCRIPTION_PAYMENT_ERROR=true

  # SUBSCRIPTION_PAYMENT only, if VALIDATE_SUBSCRIPTION successful
  #
  if [[ ${VALIDATE_SUBSCRIPTION_ERROR} == "false" ]] || [[ ${VALIDATE_SUBSCRIPTION_ERROR} == "false" ]]; then
    #local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_RESPONSE[0]}"
    local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_REQUEST}"
    local SUBSCRIPTION_PAYMENT_RESPONSE="${SUBSCRIPTION_PAYMENT_RESPONSE[1]}"
    local SUBSCRIPTION_PAYMENT_RESPONSE=$(to_upper ${SUBSCRIPTION_PAYMENT_RESPONSE})

    # echo SUBSCRIPTION_PAYMENT_UTI:        ${SUBSCRIPTION_PAYMENT_UTI}
    # echo SUBSCRIPTION_PAYMENT_RESPONSE:   ${SUBSCRIPTION_PAYMENT_RESPONSE}

    # SUBSCRIPTION_CAPTURE only, if SUBSCRIPTION_PAYMENT successful
    #
    if [[ ${SUBSCRIPTION_PAYMENT_UTI} != "error" ]]; then
      local SUBSCRIPTION_CAPTURE_REQUEST_UTI="${INIT_SUBSCRIPTION_CAPTURE_REQUEST}"
      local SUBSCRIPTION_CAPTURE_RESPONSE_UTI="${INIT_SUBSCRIPTION_CAPTURE_RESPONSE[0]}"
    else
      local SUBSCRIPTION_CAPTURE_REQUEST_UTI="${SUBSCRIPTION_PAYMENT_UTI}"
      local SUBSCRIPTION_CAPTURE_RESPONSE_UTI="${SUBSCRIPTION_PAYMENT_RESPONSE}"
    fi
  else # ERROR == true
    if [[ ${VALIDATE_SUBSCRIPTION_ERROR} == "true" ]]; then
      local SUBSCRIPTION_PAYMENT_UTI="N/alias name="#statement""
      local SUBSCRIPTION_PAYMENT_RESPONSE="N/A"
    elif [[ ${SUBSCRIPTION_PAYMENT_ERROR} == "true" ]]; then
      local SUBSCRIPTION_PAYMENT_UTI="${SUBSCRIPTION_PAYMENT_REQUEST}"
      local SUBSCRIPTION_PAYMENT_RESPONSE=${SUBSCRIPTION_PAYMENT_RESPONSE[1]}
    fi
  fi # ERROR_FLAG
# set +x  jadams

  local STOP_SUBSCRIPTION_TIMESTAMP_EPOCH="$($DATE_CMD -d "${STOP_SUBSCRIPTION_TIME}" +%s)"
  local STOP_SUBSCRIPTION_TIMESTAMP=$($DATE_CMD --date @${STOP_SUBSCRIPTION_TIMESTAMP_EPOCH} "${RESULT_TIMESTAMP_FORMAT}")

  if [[ ${ERROR_FLAG} == "false" ]]; then
    local STOP_SUBSCRIPTION_UTI="${STOP_SUBSCRIPTION_REQUEST}"
    local STOP_SUBSCRIPTION_RESPONSE="${STOP_SUBSCRIPTION_RESPONSE}"
  else
    local STOP_SUBSCRIPTION_UTI="N/A"
  fi # ERROR_FLAG

  DELM=${CSV_DELIMITER}

  # VF record
  # ${MANDATE_MERCHAND_SERVICEID}${DELM}${MANDATE_MSISDN}${DELM}${VALIDATE_SUBSCRIPTION_TIMESTAMP}${DELM}${VALIDATE_SUBSCRIPTION_UTI}${DELM}${VALIDATE_SUBSCRIPTION_RESPONSE}${DELM}${STOP_SUBSCRIPTION_TIMESTAMP}${DELM}${SUBSCRIPTION_PAYMENT_UTI}${DELM}${SUBSCRIPTION_PAYMENT_RESPONSE}

  if [[ ${VERBOSE} == "true" ]]; then
    echo
    echo "  ------------------------- start record data ----------------------------"
    cat <<- EOF | tee -a ${RESULT_CSV}
    ${USERID}${DELM}${SUBSCRIPTIONID}${DELM}${SETUP_TRANSACTIONID}${DELM}${STOP_TRANSACTIONID}${DELM}${CHANNEL}${DELM}${AMOUNT}${DELM}${MERCHANTID}${DELM}${MERCHAND_DESIGNID}${DELM}${MERCHAND_SERVICEID}${DELM}${MSISDN}${DELM}${VALIDATE_SUBSCRIPTION_TIMESTAMP}${DELM}${VALIDATE_SUBSCRIPTION_UTI}${DELM}${VALIDATE_SUBSCRIPTION_RESPONSE}${DELM}${STOP_SUBSCRIPTION_TIMESTAMP}${DELM}${SUBSCRIPTION_PAYMENT_UTI}${DELM}${SUBSCRIPTION_PAYMENT_RESPONSE}
EOF
    echo "  ------------------------- end record data ------------------------------"
    echo
  else
    cat << EOF >> ${RESULT_CSV}
    ${USERID}${DELM}${SUBSCRIPTIONID}${DELM}${SETUP_TRANSACTIONID}${DELM}${STOP_TRANSACTIONID}${DELM}${CHANNEL}${DELM}${AMOUNT}${DELM}${MERCHANTID}${DELM}${MERCHAND_DESIGNID}${DELM}${MERCHAND_SERVICEID}${DELM}${MSISDN}${DELM}${VALIDATE_SUBSCRIPTION_TIMESTAMP}${DELM}${VALIDATE_SUBSCRIPTION_UTI}${DELM}${VALIDATE_SUBSCRIPTION_RESPONSE}${DELM}${STOP_SUBSCRIPTION_TIMESTAMP}${DELM}${SUBSCRIPTION_PAYMENT_UTI}${DELM}${SUBSCRIPTION_PAYMENT_RESPONSE}
EOF
  fi

  ${INFO} && local MSG="finished create stop data record"
  ${INFO} && logger INFO ${PATTERN} parse_carrier_data "${MSG}" ${LOGFILE}

#set +x
}

# ------------------------------------------------------------------------------
# create_report_2 ()
#
# DESCRIPTION   Main routines to create report_2
# SYNOPSIS      create_report_2
#
# ------------------------------------------------------------------------------
function create_report_2 () {
  return 0
}

# ------------------------------------------------------------------------------
# create_report_3 ()
#
# DESCRIPTION   Main routines to create report_3
# SYNOPSIS      create_report_3
#
# ------------------------------------------------------------------------------
function create_report_3 () {
  return 0
}

# ------------------------------------------------------------------------------
# create_report_4 ()
#
# DESCRIPTION   Main routines to create report_4
# SYNOPSIS      create_report_4
#
# ------------------------------------------------------------------------------
function create_report_4 () {
  return 0
}

# ------------------------------------------------------------------------------
# create_report_5 ()
#
# DESCRIPTION   Main routines to create report_5
# SYNOPSIS      create_report_5
#
# ------------------------------------------------------------------------------
function create_report_5 () {
  return 0
}
