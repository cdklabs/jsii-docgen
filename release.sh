#!/bin/bash
set -euo pipefail
yarn install
yarn build
yarn test
yarn pack
npx jsii-release-npm .
