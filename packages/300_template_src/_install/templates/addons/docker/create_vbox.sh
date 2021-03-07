#!/usr/bin/env bash
# ------------------------------------------------------------------------------
# create_vbox.sh
#
# DESCRIPTION
#   Create a virtual box for Oracle VirtualBox
#
# ------------------------------------------------------------------------------
# Version:          0.0.1
# Author:           Juergen Adams (juergen@jekyll-one.com)
# Created:          2018-11-03
# Last modified:
# ------------------------------------------------------------------------------
# NOTE: /x/j1/github/jekyll_one_com/add-ons/docker/create_vbox.sh
# 
# ------------------------------------------------------------------------------
# TODO
#
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
OS_INSTALL_MEDIUM_FOLDER="C:\Users\jadams\Downloads"
OS_INSTALL_MEDIUM="CentOS-7-x86_64-DVD-1804.iso"

# ------------------------------------------------------------------------------
# VBOX FOLDER SETTINGS
# ------------------------------------------------------------------------------
VBOX_VM_FOLDER="D:\Users\shared\Vbox Virtual Machines"



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

# ------------------------------------------------------------------------------
# SCRIPT DEFAULT SETTINGS
# ------------------------------------------------------------------------------
PRINT_SUMMARY=false
PRINT_DOCKER_LOGO=true

# ------------------------------------------------------------------------------
# DOCKER MACHINE SETTINGS
# ------------------------------------------------------------------------------
DOCKER_MACHINE="${DOCKER_TOOLBOX_INSTALL_PATH}\docker-machine.exe"

# ------------------------------------------------------------------------------
# VBOX MANAGE SETTINGS
# ------------------------------------------------------------------------------
if [ ! -z "$VBOX_MSI_INSTALL_PATH" ]; then
  VBOX_MANAGE_CMD="${VBOX_MSI_INSTALL_PATH}VBoxManage.exe"
else
  VBOX_MANAGE_CMD="${VBOX_INSTALL_PATH}VBoxManage.exe"
fi

# ------------------------------------------------------------------------------
# VM DEFAULT SETTINGS
# ------------------------------------------------------------------------------
if [[ -z ${VM_NAME} ]]; then VM_NAME="vlinux"; fi
if [[ -z ${VM_HDD_DEVICE_SIZE} ]]; then VM_HDD_DEVICE_SIZE=20480; fi
if [[ -z ${VM_MEMORY_SIZE} ]]; then VM_MEMORY_SIZE=2048; fi
VM_VRAM_SIZE=16
VM_OS_TYPE=Linux26_64

# ------------------------------------------------------------------------------
# VM DEVICES
# ------------------------------------------------------------------------------

VM_INSTALL_DEVICE="dvd"
VM_HDD_DEVICE="hdd"
VM_DVD_DEVICE="dvddrive"
VM_SATA_DEVICE_NAME="${VM_NAME}_sata"
VM_NETWORK_ADAPTER_TYPE="nat"

# ==============================================================================
# COLLECT CMD LINE OPTIONS
# ------------------------------------------------------------------------------
USAGE=false
VERBOSE=false

while getopts d:m:n:hs OPT
do
  case "$OPT" in
    d)  VM_HDD_DEVICE_SIZE="${OPTARG}";;
    h)  USAGE=true;;
    m)  VM_MEMORY_SIZE="${OPTARG}";;
    n)  VM_NAME="${OPTARG}";;
    s)  PRINT_SUMMARY=true;;
  esac
done

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
  $SCRIPT_NAME [-d <disk_size> -m <memory_size> -s] -n <vbox_name>

      -h                   Prints this help
      -n <vbox_name>       Name of the virtual box to be created
      -d <disk_size>       Size of the virtual hard disk, default: 20G
      -m <memory_size<     Size of the virtual memory (RAM), default:2G
      -s                   Prints a summary of the vbox created, default: false
      

  Example/s:

  Creates a box named myCentosBox having 2G of memory and a 20G HDD attached

    $SCRIPT_NAME -d 20480 -m 2048 -n myCentosBox -s

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

# ------------------------------------------------------------------------------
#    box_summary ()
#
#    DESCRIPTION        Prints a summary of the vbox created
#    SYNOPSIS           box_summary VBOX_NAME
#
# ------------------------------------------------------------------------------
function box_summary () {
#set +x

local VBOX_NAME=$1

echo
echo "Summary:"
echo
"${VBOX_MANAGE_CMD}" showvminfo ${VBOX_NAME}

#set +x
}

# ------------------------------------------------------------------------------
#    docker_text_logo ()
#
#    DESCRIPTION        Prints a text logo of Docker
#    SYNOPSIS           docker_text_logo
#
# ------------------------------------------------------------------------------
function docker_text_logo () {

cat << EOF

                        ##         .
                  ## ## ##        ==
               ## ## ## ## ##    ===
           /"""""""""""""""""\___/ ===
      ~~~ {~~ ~~~~ ~~~ ~~~~ ~~~ ~ /  ==== ~~~
           \______ o           __/
             \    \         __/
              \____\_______/

EOF
}

# ==============================================================================
# MAIN
# ------------------------------------------------------------------------------
#set -x

# Convert Windows to Unix pathes
#
VBOX_VM_FOLDER="$(win_to_unix_path "${VBOX_VM_FOLDER}")"
VBOX_INSTALL_MEDIUM="$(win_to_unix_path "${OS_INSTALL_MEDIUM_FOLDER}")/${OS_INSTALL_MEDIUM}"

${USAGE} && usage && exit 0

# Check environmenta details
#
if [ ! -f "${DOCKER_MACHINE}" ]; then
  echo "Docker Machine is not installed. Please re-run the Toolbox Installer and try again."
  exit 1
fi

if [ ! -f "${VBOX_MANAGE_CMD}" ]; then
  echo "VirtualBox is not installed. Please re-run the Toolbox Installer and try again."
  exit 1
fi

# Check if box already exists
#
"${VBOX_MANAGE_CMD}" list vms | grep \""${VM_NAME}"\" &> /dev/null
VM_EXISTS_CODE=$?

# Create the box
#
if [ $VM_EXISTS_CODE -ne 0 ]; then
  clear
  echo -e "Create Virtual machine ${GREEN}${VM_NAME}${NC} .."
  echo
  "${VBOX_MANAGE_CMD}" createvm --name "${VM_NAME}" --ostype ${VM_OS_TYPE} --register --basefolder "${VBOX_VM_FOLDER}"
  "${VBOX_MANAGE_CMD}" modifyvm "${VM_NAME}" --description "${VM_NAME} - Created by ${SCRIPT_NAME}"
  "${VBOX_MANAGE_CMD}" modifyvm "${VM_NAME}" --audio none
  "${VBOX_MANAGE_CMD}" modifyvm "${VM_NAME}" --vram ${VM_VRAM_SIZE}
  "${VBOX_MANAGE_CMD}" modifyvm "${VM_NAME}" --memory "${VM_MEMORY_SIZE}" --boot1 "${VM_INSTALL_DEVICE}"
  "${VBOX_MANAGE_CMD}" modifyvm "${VM_NAME}" --nic1 "${VM_NETWORK_ADAPTER_TYPE}"
  "${VBOX_MANAGE_CMD}" storagectl "${VM_NAME}" --name "${VM_SATA_DEVICE_NAME}" --add sata
  "${VBOX_MANAGE_CMD}" createhd --filename "${VBOX_VM_FOLDER}/${VM_NAME}.sda.vdi" --size ${VM_HDD_DEVICE_SIZE} --format VDI --variant Standard
  "${VBOX_MANAGE_CMD}" storageattach "${VM_NAME}" --storagectl "${VM_SATA_DEVICE_NAME}" --port 1 --type ${VM_HDD_DEVICE} --medium "${VBOX_VM_FOLDER}/${VM_NAME}.sda.vdi"
  "${VBOX_MANAGE_CMD}" storageattach "${VM_NAME}" --storagectl "${VM_SATA_DEVICE_NAME}" --port 0 --type ${VM_DVD_DEVICE} --medium "${VBOX_INSTALL_MEDIUM}"
else
  # Box already exists
  #
  VM_EXISTS="$("${VBOX_MANAGE_CMD}" list vms | grep \""vCentOS63"\" | sed -e "s/\"//g")"
  echo -e "Virtual machine ${RED}${VM_NAME}${NC} is already configured. Cannot proceed."
  echo "VM detected: $VM_EXISTS"
  PRINT_SUMMARY=false
fi

# Check if the box is created successfully
#
VM_EXISTS="$("${VBOX_MANAGE_CMD}" list vms | grep \""${VM_NAME}"\" | sed -e "s/\"//g")" &> /dev/null
VM_EXISTS_CODE=$?

if [ $VM_EXISTS_CODE -eq 0 ]; then
  echo
  echo -e "Virtual machine ${GREEN}${VM_NAME}${NC} successfully created."
  echo -e "Modify the ${CYAN}network settings${NC} for vbox ${GREEN}${VM_NAME}${NC} as needed!"
  # Prints a summary of the vbox created
  #
  ${PRINT_SUMMARY} && box_summary ${VM_NAME}
  ${PRINT_DOCKER_LOGO} && docker_text_logo && echo && echo "Have fun!"
  
else
  echo -e "Virtual machine ${RED}${VM_NAME}${NC} failed to be created."
fi


#set +x

