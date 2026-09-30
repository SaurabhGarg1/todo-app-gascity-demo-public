# Gas City runs formula checks with PATH=/usr/local/bin:/usr/bin:/bin and HOME
# set to the city directory. Put the real user toolchain back on PATH.
if [[ -z "${REAL_HOME:-}" ]]; then
  REAL_HOME=$(getent passwd "$(id -u)" | cut -d: -f6)
fi
export HOME="$REAL_HOME"
export PATH="$REAL_HOME/.local/bin:$PATH"

if [[ -d "$REAL_HOME/.nvm/versions/node" ]]; then
  NODE_BIN=$(find "$REAL_HOME/.nvm/versions/node" -maxdepth 2 -type f -name npm -printf '%h\n' 2>/dev/null | sort -V | tail -1 || true)
  if [[ -n "${NODE_BIN:-}" ]]; then
    export PATH="$NODE_BIN:$PATH"
  fi
fi
