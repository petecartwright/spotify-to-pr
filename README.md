# spotify-to-pr

Lil Chrome extension to put what you're listening to on Spotify into your GitHub PR description.

Maybe you want to remember what you were listening to when you come back to debug. Maybe you want to enhance the general vibes of a PR. Maybe you want to impress your coworkers with your deep cuts.

Maybe you just like the little pictures?

![screenshot showing an open Spotify window with a Sam Cooke song playing. Next to that is a GitHub PR description preview with the album cover, artist, song name, and preview link](docs/img/screenshot_sam_cooke.png)

## Installation

This isn't on the Chrome Web Store (and probably never will be[^1]) so you'll need to install it yourself.

1. Clone this repo
1. Register for a Spotify Web API Client ID [here](https://developer.spotify.com/documentation/web-api)
1. Pop that client ID in your `.env` file
1. In your terminal, run `npm run build`
   1. This will install all dependencies and create a `/dist` folder with the built extension
1. Install the extension into Chrome:
   1. Go to `chrome://extensions` in your browser.
   2. Turn on "Developer Mode" via the toggle
   3. Click "Load Unpacked" and point it at the `/dist` folder that you built in step 4
1. Get your extension's ID (it's on the card on the `chrome://extensions` page )
1. Go to you [Spotify for Developers Dashboard](https://developer.spotify.com/dashboard), click on your app, and change your "Redirect URIs" to `https://<extensionid>.chromiumapp.org`

## Usage

When you have a GitHub PR comment box open, click on the extension icon. If you haven't used it before or your auth has expired and can't be refreshed, you'll have to authenticate with Spotify first.

Then click "Write to PR" to grab the song or podcast you're listening to and write it to your PR comment.

If there's already a song in there, it will replace it for you.

[^1]: for a bunch of reasons! The main two are a) I don't really want to host a backend for this, and b) even more importantly, [as of May 2025](https://developer.spotify.com/blog/2025-04-15-updating-the-criteria-for-web-api-extended-access), Spotify only approves non-developer API access for registered businesses with >250K MAU. I am not that. 🪦
