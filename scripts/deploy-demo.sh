#!/usr/bin/env bash
# Builds both web versions and publishes them to the gh-pages branch:
#   https://shaharsolomon.github.io/freshly/      demo (sample data, SMS code 123456)
#   https://shaharsolomon.github.io/freshly/app/  local (name only, data stays in the browser)
set -euo pipefail

repo=$(pwd)
out=$(mktemp -d)
cp app.json "$out/app.json.bak"
trap 'cp "$out/app.json.bak" "$repo/app.json"' EXIT

# GitHub Pages serves the project under /freshly, so each bundle needs its prefix.
build() { # base-url output-dir title description
  node -e 'const a=require("./app.json");a.expo.experiments={...a.expo.experiments,baseUrl:process.argv[1]};require("fs").writeFileSync("app.json",JSON.stringify(a,null,2)+"\n")' "$1"
  npx expo export --platform web --output-dir "$2" --clear
  sed -i "s|<html lang=\"en\">|<html lang=\"he\" dir=\"rtl\">|; s|href=\"/favicon.ico\"|href=\"$1/favicon.ico\"|" "$2/index.html"
  # Title and link preview for WhatsApp, plus "add to home screen" support.
  node -e '
const [,file,base,title,desc]=process.argv;const fs=require("fs");
const head=`<title>${title}</title>
    <meta name="description" content="${desc}" />
    <meta property="og:title" content="${title}" />
    <meta property="og:description" content="${desc}" />
    <meta property="og:image" content="https://shaharsolomon.github.io/freshly/og.png" />
    <meta property="og:type" content="website" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-title" content="freshly" />
    <link rel="apple-touch-icon" href="https://shaharsolomon.github.io/freshly/icon.png" />
    <link rel="manifest" href="${base}/manifest.json" />`;
fs.writeFileSync(file,fs.readFileSync(file,"utf8").replace(/<title>.*?<\/title>/,head));
fs.writeFileSync(require("path").dirname(file)+"/manifest.json",JSON.stringify({name:"freshly",short_name:"freshly",start_url:base+"/",scope:base+"/",display:"standalone",dir:"rtl",lang:"he",background_color:"#ffffff",theme_color:"#2F8F4E",icons:[{src:"https://shaharsolomon.github.io/freshly/icon.png",sizes:"1024x1024",type:"image/png"}]}));
' "$2/index.html" "$1" "$3" "$4"
}
EXPO_PUBLIC_DEMO=1 build /freshly "$out/site" "freshly · דמו" "גרסת דמו עם נתוני דוגמה. קוד הכניסה: 123456"
EXPO_PUBLIC_MODE=local build /freshly/app "$out/site/app" "freshly 🥬" "משתמשים במה שיש בבית לפני שזה נזרק. נכנסים עם שם בלבד, הכל נשמר בטלפון."
cp "$repo/docs/og.png" "$out/site/og.png"
cp "$repo/assets/icon.png" "$out/site/icon.png"

cd "$out/site"
# Deep links fall back to the right app: anything under /freshly/app/ loads the local version.
node -e '
const fs=require("fs");
const demo=fs.readFileSync("index.html","utf8");
const redirect=`<script>if(location.pathname.startsWith("/freshly/app/")&&!location.pathname.endsWith("/app/"))location.replace("/freshly/app/")</script>`;
fs.writeFileSync("404.html",demo.replace("<head>","<head>"+redirect));'
touch .nojekyll          # keep the _expo folders
if [ -n "${DRY_RUN:-}" ]; then echo "Built in $out/site"; exit 0; fi
git init -q -b gh-pages
git add -A
git commit -q -m "Deploy web builds"
git push -f "$(git -C "$repo" remote get-url origin)" gh-pages
