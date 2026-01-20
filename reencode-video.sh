#!/bin/bash
# Video Re-encoding Script for Mobile Compatibility
# Place this script in the same folder as your video file

echo "============================================"
echo "Mobile Video Re-encoder for iOS/Android"
echo "============================================"
echo ""

# Input file
INPUT="grok-video-890d4307-1e67-405d-838d-44860a4e0c56.mp4"
OUTPUT="grok-video-890d4307-1e67-405d-838d-44860a4e0c56-mobile.mp4"

# Check if input file exists
if [ ! -f "$INPUT" ]; then
    echo "❌ Error: $INPUT not found!"
    echo "Please place this script in the same folder as your video file."
    exit 1
fi

# Check if ffmpeg is installed
if ! command -v ffmpeg &> /dev/null; then
    echo "❌ Error: ffmpeg is not installed!"
    echo ""
    echo "Please install ffmpeg first:"
    echo "  Mac:     brew install ffmpeg"
    echo "  Ubuntu:  sudo apt install ffmpeg"
    echo "  Windows: Download from https://www.gyan.dev/ffmpeg/builds/"
    exit 1
fi

echo "✅ Found input file: $INPUT"
echo "✅ FFmpeg is installed"
echo ""
echo "Starting re-encoding for mobile compatibility..."
echo "This may take a minute..."
echo ""

# Re-encode video
ffmpeg -i "$INPUT" \
  -c:v libx264 \
  -profile:v baseline \
  -level 3.0 \
  -pix_fmt yuv420p \
  -c:a aac \
  -b:a 128k \
  -movflags +faststart \
  -y \
  "$OUTPUT"

# Check if successful
if [ $? -eq 0 ]; then
    echo ""
    echo "============================================"
    echo "✅ SUCCESS!"
    echo "============================================"
    echo ""
    echo "Mobile-optimized video created: $OUTPUT"
    echo ""
    echo "File sizes:"
    ls -lh "$INPUT" "$OUTPUT" | awk '{print "  " $9 ": " $5}'
    echo ""
    echo "Next steps:"
    echo "1. Upload $OUTPUT to your server"
    echo "2. Rename it to $INPUT (replace the old file)"
    echo "   OR update your HTML to use the new filename"
    echo "3. Test on your iPhone Safari"
    echo ""
else
    echo ""
    echo "❌ Re-encoding failed!"
    echo "Please check the error messages above."
    exit 1
fi
