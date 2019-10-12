#!/bin/bash

: "${xvfb_lockdir:=$HOME/.xvfb-locks}"
: "${xvfb_display_min:=99}"
: "${xvfb_display_max:=599}"

mkdir -p -- "$xvfb_lockdir" || exit

i=$xvfb_display_min

while (( i < xvfb_display_max )); do
  if [ -f "/tmp/.X$i-lock" ]; then
    (( ++i )); continue
  fi

  exec 5>"$xvfb_lockdir/$i" || continue
  if flock -x -n 5; then
    exec /usr/bin/xvfb-run --server-num="$i" "$@" || exit
  fi
  (( i++ ))
done

echo "finished"
