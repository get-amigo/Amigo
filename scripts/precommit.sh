#!/bin/sh

branch=$(git symbolic-ref HEAD | sed -e 's,.*/\(.*\),\1,')

if [ "$branch" = "main" ] || [ "$branch" = "master" ] || [ "$branch" = "develop" ] || [ "$branch" = "staging" ]; then
    printf "\n\n\033[0;31m\n"
    printf "ERROR: You can't commit directly to %s branch\n" "$branch"
    printf "\033[0m\n\n"
    exit 1
fi