echo "--- build ---"
npm run build:types
npm run build:code

echo "--- copying meta ---"
cp ./README.md ./build/README.md
cp ./LICENSE ./build/LICENSE
cp ./package.json ./build/package.json
cp ./.npmignore ./build/.npmignore

