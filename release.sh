#!/bin/bash

yarn build
mkdir -p release
zip -r release/release.zip dist/
