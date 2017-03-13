#!/bin/bash

VERSION=$(cat package.json | grep version | cut -d: -f2 | sed -e "s/\"//g" | sed -e "s/ //g" | sed -e "s/\,//g")

zip -r AWSLambdaPoisonPill-$VERSION.zip index.js package.json node_modules/
