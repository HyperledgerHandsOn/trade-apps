#!/bin/bash
#
# SPDX-License-Identifier: Apache-2.0
#

function printHelp () {
  echo "Usage: "
  echo "  makeAll.sh v1|v2"
  echo "  Defaults to v1 if parameter is not recognized as v1 or v2."
}

# Keeps pushd silent
pushd () {
    command pushd "$@" > /dev/null
}

# Keeps popd silent
popd () {
    command popd "$@" > /dev/null
}

VERSION=$1
if [ "$VERSION" != "v2" ];
then 
    VERSION="v1"
fi

cd $VERSION

pushd exporter
make all
popd 

pushd importer
make all
popd

pushd regulator
make all
popd

pushd exportingentity
make all
popd

pushd carrier
make all
popd