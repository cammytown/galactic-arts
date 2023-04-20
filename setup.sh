#!/usr/bin/bash
# This script is used to setup the environment for the project

# Data URL
DATA_URL="https://raw.githubusercontent.com/astronexus/HYG-Database/master/hygdata_v3.csv"
#GL_MATRIX_URL="https://github.com/toji/gl-matrix/blob/master/dist/gl-matrix-min.js"

# Create data directory if necessary
if [ ! -d "data" ]; then
	mkdir data
fi

# If wget is installed, use it to download the data
if command -v wget &> /dev/null; then
	# Download HYG star data:
	wget $DATA_URL -O data/hygdata_v3.csv
	#wget $GL_MATRIX_URL -O src/libs/gl-matrix-min.js

# If curl is installed
elif command -v curl &> /dev/null; then
	# Download HYG star data:
	curl $DATA_URL -o data/hygdata_v3.csv
	#curl $GL_MATRIX_URL -o src/libs/gl-matrix-min.js

# If neither wget or curl is installed
else
	# Print error message
	echo "Error: wget or curl is not installed, could not download HYG star data"
fi


