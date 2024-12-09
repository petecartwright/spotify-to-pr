import { authorizeWithSpotify, logout } from "~/util/authorization";
import { MESSAGE_ACTIONS } from "~/util/keys";
import { getCurrentlyPlaying } from "~/util/spotifyData";

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === MESSAGE_ACTIONS.login) {
    const accessToken = await authorizeWithSpotify();
  }

  if (message.action === MESSAGE_ACTIONS.logout) {
    await logout();
  }

  if (message.action === MESSAGE_ACTIONS.getSong) {
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
      action: MESSAGE_ACTIONS.writeToPr,
      track: currTrack,
    });
  }
});
