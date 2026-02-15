#!/bin/bash
# Replace git URLs with HTTPS + token for private submodules
git config --global url."https://${GITHUB_TOKEN}@github.com/".insteadOf "git@github.com:"
git submodule sync
git submodule update --init --recursive
