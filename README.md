# BTC Beef

Static website for [BTC Beef](https://btcbeef.com), a farm-direct Red Angus beef business in Caledonia, Ontario.

## Local preview

From the project directory, install the development dependencies once and start the preview server:

```bash
npm install
npm run dev
```

The terminal will print the local preview address. Run `npm run validate` before submitting changes.

## Project structure

- `index.html` contains the single-page site content and metadata.
- `assets/css/custom.css` contains BTC Beef-specific design and responsive styles.
- `assets/js/main.js` contains navigation, gallery, and inquiry-form interactions.
- `assets/img` contains the site's optimized imagery and source photos.
- `CNAME`, `robots.txt`, and `sitemap.xml` support the GitHub Pages deployment.

The production site is published from the repository's default branch through GitHub Pages.
