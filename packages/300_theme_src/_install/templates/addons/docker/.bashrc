# ------------------------------------------------------------------------------
#  ALIASES AND FUNCTIONS
# ------------------------------------------------------------------------------

# -------------------------------------
#   QUICK ACCESS - GENERAL
# -------------------------------------
alias which='type -a'
alias ..='cd ..'
alias ...='cd ..;cd ..'
alias b='cd -'

# -------------------------------------
#   QUICK ACCESS - FILES|FOLDERS
# -------------------------------------
alias l='ls -l'
alias ll='ls -l'
alias la='ls -la'
alias lt='ls -ltr'

alias shared=_shared
alias temp='cd /var/tmp'

# -------------------------------------
#   TERMINAL/DISPLAY
# -------------------------------------
alias c='clear ; stty sane ;'
alias C='reset ; stty sane ;'

# -------------------------------------
#   APPLICATIONS
# -------------------------------------
alias fsp=_fsp

# -------------------------------------
#   ENVIRONMENT
# -------------------------------------

# Set commandline editor to vi (to be activated by ESC)
set -o vi

# Set shell prompt
export PS1="\u@\h:\W> "

# ------------------------------------------------------------------------------
#   FUNCTIONS
# ------------------------------------------------------------------------------

function _shared()  {
  if [[ -d /c/Users/Public ]]; then 
    cd /c/Users/Public
  elif [[ -d /srv/jekyll ]]; then 
    cd /srv/jekyll 
  else 
    :
  fi
}

function _fsp() {                                                  
local fsp=$(find /usr/local/bin -name j1fsp.sh)
                                               
  if [[ -x ${fsp} ]]; then                       
    ${fsp} "$@"                                  
  fi                                                                                   
}                                              
