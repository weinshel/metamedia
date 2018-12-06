# metamedia

# Running

- Install dependencies (run once and when any dependencies are changed):
  - OS X: `npm install`
  - Linux/Windows `npm install --no-optional`

- Build the code: `npm run build` 
- (Optional for development) Build using `npm run build:watch`. This runs Webpack in watch mode and automatically reruns whenever you change any files. Recommended to leave this running in a background terminal.

### Firefox

1. Open `about:debugging` in Firefox, click **Load Temporary Add-on**.
2. Navigate to where the code is located on your computer, and select the `extension/manifest.json` file.

The extension will now be installed, and will stay installed until you close or restart Firefox.

Alternatively, run `npm run start:firefox` to start up a temporary Firefox profile with the extension installed.

# Building for Production

Run `npm dist`. This runs webpack in production mode, minifies the files, and packs the code in a zip file in the `web-ext-artifacts/` folder. This can be installed in developer mode with the same procedure as above.

The built extension will not install easily in permanent non-developer mode - it will need to be uploaded to the browser's respective store and approved.

# License

GNU General Public License v3.0