import { authorizeWithSpotify } from "~/util/authorization";
import { getCurrentlyPlaying } from "~/util/spotifyData";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "login") {
    const accessToken = await authorizeWithSpotify();

    // TODO: all this below needs to be a in a new listener
    //       that's activated by a button

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
    await chrome.storage.local.set({ track: currTrack });

    // // TODO: remove, just   for debugging
    const storage = await chrome.storage.local.get();
    console.log("storage", storage);
  }
});
