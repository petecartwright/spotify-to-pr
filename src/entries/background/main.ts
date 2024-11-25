import { authorizeWithSpotify } from "~/util/authorization";
import { getCurrentlyPlaying } from "~/util/spotifyData";

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension installed");
  console.log("chrome", chrome);
});

chrome.runtime.onMessage.addListener(async (message) => {
  if (message.action === "login") {
    const accessToken = await authorizeWithSpotify();

    // TODO: all this below needs to be a in a new listener
    //       that's activated by a button

    const currTrack = await getCurrentlyPlaying();

    if (currTrack?.currently_playing_type !== "track") return;

    const storage = await chrome.storage.local.get();
    console.log("currTrack", currTrack);
    console.log("storage", storage);
    await chrome.storage.local.set({ track: currTrack });

    chrome.runtime.sendMessage({
      action: "write-to-pr",
      track: currTrack,
    });
    // send a message to let the content script
    // know to write the text to gh
  }
});
