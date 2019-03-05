echo "--- building docs ---"
npm run build:docs

echo "--- creating .circleci ---"
cp -r .circleci docs/.circleci

echo "--- creating .nojekyll ---"
touch docs/.nojekyll

echo "--- starting upload ---"
npx gh-pages --dotfiles -d docs
