import { CurrentlyPlayingResponse } from "./spotifyData";

const prefix = "<!--- Added by Spotify to PR chrome extention --->";
const suffix = "<!--- Go to <<some link here> for more info! --->";

const formatTrackData = (trackData: CurrentlyPlayingResponse): string => {
  const artists = trackData.item.artists
    .map((artist) => `[${artist.name}](${artist.external_urls.spotify})`)
    .join(", ");

  const trackName = trackData.item.name;

  const preview = `([Preview here](${trackData.item.preview_url}))`;

  return `${artists} - ${trackName} ${preview}`;
};

export const writeToPr = async (trackData: CurrentlyPlayingResponse) => {
  // find the element to write to
  const thePrCommentBox = document.querySelector(
    "textarea[name='pull_request[body]'"
  ) as HTMLTextAreaElement;

  let existingText = thePrCommentBox.value ?? "";

  const trackText = formatTrackData(trackData);

  // if we've already written to this comment, remove what's already in there
  const prefixIndex = existingText.indexOf(prefix);
  const suffixIndex = existingText.indexOf(suffix);
  let beforePrefix = "";
  let afterSuffix = "";

  if (prefixIndex > -1 && suffixIndex > -1) {
    beforePrefix = existingText.slice(0, prefixIndex).trim();
    afterSuffix = existingText
      .slice(suffixIndex + suffix.length, existingText.length)
      .trim();
  }

  // ok now we can safely write what's in here
  const finalText =
    beforePrefix +
    "\n" +
    prefix +
    "\nThis PR's soundtrack: \n🎶🎶 " +
    trackText +
    " 🎶🎶\n" +
    suffix +
    "\n" +
    afterSuffix;

  thePrCommentBox.value = finalText;
};
