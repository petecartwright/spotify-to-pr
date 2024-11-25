import { authorizeWithSpotify } from "~/util/authorization";
import { getCurrentlyPlaying } from "~/util/spotifyData";

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "login") {
    const accessToken = await authorizeWithSpotify();
  }

  if (message.action === "getSong") {
    const currTrack = await getCurrentlyPlaying();

    if (
      currTrack?.currently_playing_type !== "track" &&
      currTrack?.currently_playing_type !== "episode"
    ) {
      console.log(
        `Not a track or an episode. No idea what to do with this. It's a ${currTrack?.currently_playing_type}`
      );
      return;
    }

    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true,
    });
    if (!tab?.id) return;

    chrome.tabs.sendMessage(tab.id, {
      action: "write-to-pr",
      track: currTrack,
    });
  }
});
