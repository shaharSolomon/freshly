#!/usr/bin/env bash
# Builds the web demo (sample data, SMS code 123456) and publishes it to the
# gh-pages branch, served at https://shaharsolomon.github.io/freshly/
set -euo pipefail

out=$(mktemp -d)
cp app.json "$out/app.json.bak"
trap 'cp "$out/app.json.bak" app.json' EXIT

# GitHub Pages serves the project under /freshly, so the bundle needs that prefix.
node -e 'const a=require("./app.json");a.expo.experiments={...a.expo.experiments,baseUrl:"/freshly"};require("fs").writeFileSync("app.json",JSON.stringify(a,null,2)+"\n")'
EXPO_PUBLIC_DEMO=1 npx expo export --platform web --output-dir "$out/site"

cd "$out/site"
sed -i 's|<html lang="en">|<html lang="he" dir="rtl">|; s|href="/favicon.ico"|href="/freshly/favicon.ico"|' index.html
cp index.html 404.html   # deep links fall back to the app
touch .nojekyll          # keep the _expo folder
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy demo build"
git push -f "$(git -C "$OLDPWD" remote get-url origin)" gh-pages
