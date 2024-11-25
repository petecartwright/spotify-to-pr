import type { CurrentlyPlayingResponse } from "../types";

// TODO: some common way of handling failed auth

export const getCurrentlyPlaying = async (): Promise<
  CurrentlyPlayingResponse | undefined
> => {
  await chrome.storage.local.remove("track");

  // TODO: make this string an enum or whatever somewhere
  const spotifyAccessToken = (
    await chrome.storage.local.get("spotify_access_token")
  ).spotify_access_token;

  // base spotify API URL plus the "additional_types" param
  // so we get episodes, not just tracks
  // https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track
  const baseUrl =
    "https://api.spotify.com/v1/me/player/currently-playing?additional_types=episode";

  const currentlyPlayingSong = await fetch(baseUrl, {
    headers: {
      Authorization: `Bearer ${spotifyAccessToken}`,
    },
  });

  if (currentlyPlayingSong.status === 204) {
    // nothing is playing rn
    return;
  }

  // TODO: handle failure
  const currentlyPlayingSongData: CurrentlyPlayingResponse =
    await currentlyPlayingSong.json();

  console.log("currentlyPlayingSongData", currentlyPlayingSongData);

  return currentlyPlayingSongData;
};
