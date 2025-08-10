#!/bin/bash

# Script to convert SVG icon to PNG files at different sizes
# Requires imagemagick or inkscape to be installed

if command -v convert &> /dev/null; then
    echo "Using ImageMagick to convert icons..."
    convert icons/icon.svg -resize 16x16 icons/icon16.png
    convert icons/icon.svg -resize 48x48 icons/icon48.png
    convert icons/icon.svg -resize 128x128 icons/icon128.png
    echo "Icons created successfully!"
elif command -v inkscape &> /dev/null; then
    echo "Using Inkscape to convert icons..."
    inkscape icons/icon.svg --export-filename=icons/icon16.png --export-width=16 --export-height=16
    inkscape icons/icon.svg --export-filename=icons/icon48.png --export-width=48 --export-height=48
    inkscape icons/icon.svg --export-filename=icons/icon128.png --export-width=128 --export-height=128
    echo "Icons created successfully!"
else
    echo "Please install ImageMagick (convert command) or Inkscape to generate PNG icons."
    echo "Alternatively, manually convert icons/icon.svg to:"
    echo "  - icons/icon16.png (16x16)"
    echo "  - icons/icon48.png (48x48)" 
    echo "  - icons/icon128.png (128x128)"
fi