#!/bin/bash

in="$1"
out="$2"

# Get trim box w, h, x, y
IFS=" x+" read w h x y < <(magick -fuzz 10% "$in" -format "%@" info:)

# Get longest side
longest=$w
[ $h -gt $longest ] && longest=$h

# Increase by 20%
longest=$(echo "scale=0;$longest*1/1" | bc)
echo $longest

magick -fuzz 10% "$in" -trim -background transparent -gravity center -extent ${longest}x${longest} "$out"
