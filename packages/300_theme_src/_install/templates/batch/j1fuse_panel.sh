#!/usr/bin/env bash

# ------------------------------------------------------------------------------
# Product/Info:
# https://jekyll.one
#
# Copyright (C) 2023 Juergen Adams
# J1 Template is licensed under the MIT License.
# ------------------------------------------------------------------------------

# Credentials
# ------------------------------------------------------------------------------
export ADMIN_USERNAME=j1adm
export ADMIN_PASSWORD=j1adm?SECRET


# Settings
# ------------------------------------------------------------------------------
FUSE_PANEL_HOME=/home/jadams/j1webs/fuse-panel
FUSE_PANEL_BIN=${FUSE_PANEL_HOME}/bin
FUSE_PANEL_EXE=${FUSE_PANEL_BIN}/fuse-panel
FUSE_PANEL_DB_HOME=${FUSE_PANEL_HOME}/db
FUSE_PANEL_DB=${FUSE_PANEL_DB_HOME}/test.db
FUSE_DISABLE_USAGE_STATS="--disable-usage-statistics"


FUSE_PANEL_ADDRESS="0.0.0.0"
FUSE_PANEL_PORT="5001"

nohup ${FUSE_PANEL_EXE} \
  --dbfile ${FUSE_PANEL_DB} \
  --bind ${FUSE_PANEL_ADDRESS} \
  --port ${FUSE_PANEL_PORT} \
  ${FUSE_DISABLE_USAGE_STATS} &
