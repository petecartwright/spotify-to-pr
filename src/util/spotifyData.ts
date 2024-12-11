import type { CurrentlyPlayingResponse } from "../types";
import { STORAGE_KEYS } from "./keys";

// TODO: some common way of handling failed auth

export const getCurrentlyPlaying = async (): Promise<
  CurrentlyPlayingResponse | undefined
> => {
  // TODO: make this string an enum or whatever somewhere
  const spotifyAccessToken = (
    await chrome.storage.local.get(STORAGE_KEYS.spotifyAccessToken)
  ).spotifyAccessToken;

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

  // Spotify API response types here:
  // https://developer.spotify.com/documentation/web-api/reference/get-the-users-currently-playing-track#:~:text=of%20each%20object.-,Response,-200
  if (currentlyPlayingSong.status === 204) {
    // nothing is playing rn
    // TODO: handle this case
    return;
  }

  if (currentlyPlayingSong.status === 401) {
    // TODO: reauthenticate
    return;
  }

  if (currentlyPlayingSong.status === 403) {
    // TODO: idk, make sure they have a spotify account
    return;
  }

  if (currentlyPlayingSong.status === 429) {
    // TODO: exceeded rate limits, uhoh
    return;
  }

  // TODO: handle failure
  const currentlyPlayingSongData: CurrentlyPlayingResponse =
    await currentlyPlayingSong.json();

  return currentlyPlayingSongData;
};
