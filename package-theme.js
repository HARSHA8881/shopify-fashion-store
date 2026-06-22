import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WORKSPACE_DIR = __dirname;
const TEMP_THEME_DIR = path.join(WORKSPACE_DIR, 'theme');
const ZIP_FILE_PATH = path.join(WORKSPACE_DIR, 'theme.zip');

function runCommand(command, cwd = WORKSPACE_DIR) {
  console.log(`Running: ${command}`);
  execSync(command, { stdio: 'inherit', cwd });
}

function cleanDir(dirPath) {
  if (fs.existsSync(dirPath)) {
    fs.rmSync(dirPath, { recursive: true, force: true });
  }
}

function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

try {
  console.log('--- Starting Shopify Theme Packaging Process ---');

  // Step 1: Run Vite Build
  console.log('Building React app...');
  runCommand('npm run build');

  const distDir = path.join(WORKSPACE_DIR, 'dist');
  if (!fs.existsSync(distDir)) {
    throw new Error('Vite build output directory "dist" was not found.');
  }

  // Step 2: Clean and Recreate Theme Directories
  console.log('Preparing temporary theme directory structure...');
  cleanDir(TEMP_THEME_DIR);
  if (fs.existsSync(ZIP_FILE_PATH)) {
    fs.unlinkSync(ZIP_FILE_PATH);
  }

  const subDirs = ['layout', 'templates', 'sections', 'config', 'assets'];
  subDirs.forEach(sub => ensureDir(path.join(TEMP_THEME_DIR, sub)));

  // Step 3: Copy Built Assets from dist/assets to theme/assets and Rename them
  console.log('Copying built assets...');
  const distAssetsDir = path.join(distDir, 'assets');
  const distFiles = fs.readdirSync(distAssetsDir);

  let jsFileCopied = false;
  let cssFileCopied = false;

  distFiles.forEach(file => {
    const ext = path.extname(file);
    const srcPath = path.join(distAssetsDir, file);

    if (ext === '.js' && !jsFileCopied) {
      // Find the main index bundle and rename to index.js
      const destPath = path.join(TEMP_THEME_DIR, 'assets', 'index.js');
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied & renamed JS bundle: ${file} -> assets/index.js`);
      jsFileCopied = true;
    } else if (ext === '.css' && !cssFileCopied) {
      // Find the main css bundle and rename to index.css
      const destPath = path.join(TEMP_THEME_DIR, 'assets', 'index.css');
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied & renamed CSS bundle: ${file} -> assets/index.css`);
      cssFileCopied = true;
    }
  });

  if (!jsFileCopied || !cssFileCopied) {
    console.warn('Warning: Could not find distinct index JS/CSS bundles in dist/assets. Let us search for any .js/.css files.');
    // Fallback search
    distFiles.forEach(file => {
      const ext = path.extname(file);
      const srcPath = path.join(distAssetsDir, file);
      if (ext === '.js' && !jsFileCopied) {
        fs.copyFileSync(srcPath, path.join(TEMP_THEME_DIR, 'assets', 'index.js'));
        jsFileCopied = true;
      }
      if (ext === '.css' && !cssFileCopied) {
        fs.copyFileSync(srcPath, path.join(TEMP_THEME_DIR, 'assets', 'index.css'));
        cssFileCopied = true;
      }
    });
  }

  // Step 4: Copy Static Assets from public/ to theme/assets/
  console.log('Copying static assets...');
  const publicDir = path.join(WORKSPACE_DIR, 'public');
  if (fs.existsSync(publicDir)) {
    const publicFiles = fs.readdirSync(publicDir);
    publicFiles.forEach(file => {
      const srcPath = path.join(publicDir, file);
      const destPath = path.join(TEMP_THEME_DIR, 'assets', file);
      if (fs.statSync(srcPath).isFile()) {
        fs.copyFileSync(srcPath, destPath);
        console.log(`Copied static asset: public/${file} -> assets/${file}`);
      }
    });
  }

  // Step 5: Generate layout/theme.liquid
  console.log('Generating layout/theme.liquid...');
  const themeLiquidContent = `<!doctype html>
<html class="no-js" lang="{{ request.locale.iso_code }}">
  <head>
    <meta charset="utf-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="theme-color" content="">
    <link rel="canonical" href="{{ canonical_url }}">
    <link rel="preconnect" href="https://cdn.shopify.com" crossorigin>

    {%- if settings.favicon != blank -%}
      <link rel="icon" type="image/png" href="{{ settings.favicon | image_url: width: 32, height: 32 }}">
    {%- else -%}
      <link rel="icon" type="image/svg+xml" href="{{ 'favicon.svg' | asset_url }}">
    {%- endif -%}

    <title>
      {{ page_title }}
      {%- if current_tags %} &ndash; tagged "{{ current_tags | join: ', ' }}"{% endif -%}
      {%- if current_page != 1 %} &ndash; Page {{ current_page }}{% endif -%}
      {%- unless page_title contains shop.name %} &ndash; {{ shop.name }}{% endunless -%}
    </title>

    {% if page_description %}
      <meta name="description" content="{{ page_description | escape }}">
    {% endif %}

    {{ content_for_header }}

    <!-- Load React App CSS -->
    {{ 'index.css' | asset_url | stylesheet_tag }}
  </head>

  <body>
    <div id="root"></div>

    {{ content_for_layout }}

    <!-- Provide Shopify asset URLs to React App -->
    <script>
      window.ShopifyThemeAssets = {
        heroImage: "{{ 'hero.png' | asset_url }}",
        favicon: "{{ 'favicon.svg' | asset_url }}",
        icons: "{{ 'icons.svg' | asset_url }}"
      };
    </script>

    <!-- Load React App JS -->
    <script src="{{ 'index.js' | asset_url }}" type="module"></script>
  </body>
</html>
`;
  fs.writeFileSync(path.join(TEMP_THEME_DIR, 'layout', 'theme.liquid'), themeLiquidContent, 'utf-8');

  // Step 6: Generate sections/main.liquid
  console.log('Generating sections/main.liquid...');
  const mainSectionContent = `{% comment %}
  Main content placeholder. The React app runs on #root.
{% endcomment %}

{% schema %}
{
  "name": "Main Content",
  "settings": [],
  "presets": [
    {
      "name": "Main Content"
    }
  ]
}
{% endschema %}
`;
  fs.writeFileSync(path.join(TEMP_THEME_DIR, 'sections', 'main.liquid'), mainSectionContent, 'utf-8');

  // Step 7: Generate templates/index.json
  console.log('Generating templates/index.json...');
  const templatesIndexContent = `{
  "name": "index",
  "sections": {
    "main": {
      "type": "main",
      "settings": {}
    }
  },
  "order": [
    "main"
  ]
}
`;
  fs.writeFileSync(path.join(TEMP_THEME_DIR, 'templates', 'index.json'), templatesIndexContent, 'utf-8');

  // Step 8: Generate config files
  console.log('Generating config/settings_schema.json and config/settings_data.json...');
  const schemaContent = `[
  {
    "name": "theme_info",
    "theme_name": "AURA EDIT React Storefront",
    "theme_version": "1.0.0",
    "theme_author": "Antigravity",
    "theme_documentation_url": "https://github.com/shopify",
    "theme_support_url": "https://github.com/shopify"
  }
]
`;
  const dataContent = `{
  "current": "Default",
  "presets": {
    "Default": {
      "sections": {}
    }
  }
}
`;
  fs.writeFileSync(path.join(TEMP_THEME_DIR, 'config', 'settings_schema.json'), schemaContent, 'utf-8');
  fs.writeFileSync(path.join(TEMP_THEME_DIR, 'config', 'settings_data.json'), dataContent, 'utf-8');

  // Step 9: Compress theme directory into a zip file
  console.log('Compressing theme directory into ZIP file...');
  // We use the system's zip command for reliability and ease (no extra npm packages required)
  runCommand('zip -r ../theme.zip .', TEMP_THEME_DIR);

  // Step 10: Cleanup temporary folder
  console.log('Cleaning up temporary folders...');
  cleanDir(TEMP_THEME_DIR);

  console.log('--- Theme successfully packaged! ---');
  console.log(`Your Shopify theme package is ready at: ${ZIP_FILE_PATH}`);

} catch (error) {
  console.error('Packaging process failed:', error);
  // Cleanup in case of error
  cleanDir(TEMP_THEME_DIR);
  process.exit(1);
}
