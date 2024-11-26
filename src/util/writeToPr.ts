import { CurrentlyPlayingResponse } from "~/types";

const prefix = "<!--- Added by Spotify to PR chrome extention --->";
const suffix = "<!--- Go to <<some link here> for more info! --->";

const formatTrackData = (trackData: CurrentlyPlayingResponse): string => {
  const item = trackData.item;

  if (item.type === "track") {
    const artists = item.artists
      .map((artist) => `[${artist.name}](${artist.external_urls.spotify})`)
      .join(", ");

    let albumImage = "";
    const smallestImageUrl = item.album?.images?.sort((a, b) =>
      a.height < b.height ? -1 : 1
    )[0].url;

    if (smallestImageUrl) {
      albumImage = `![album cover](${smallestImageUrl})`;
    }

    const trackName = item.name;
    const preview = `[**Preview**](${item.preview_url})`;

    const artistsPlural = item.artists.length > 1;

    return `${albumImage ? albumImage + "\n" : ""}**Artist${artistsPlural ? "s" : ""}**: ${artists} \n **Track**: ${trackName}\n ${preview}`;
  }

  if (item.type === "episode") {
    const showNameWithLink = `[${item.show.name}](${item.show.external_urls.spotify})`;
    const episodeNameWithLink = `[${item.name}](${item.external_urls.spotify})`;

    let episodeImage = "";
    const smallestImageUrl = item.images?.sort((a, b) =>
      a.height < b.height ? -1 : 1
    )[0].url;

    if (smallestImageUrl) {
      episodeImage = `![episode art](${smallestImageUrl})`;
    }

    const preview = `[**Preview**](${item.audio_preview_url})`;

    // TODO: make this look better
    return `${episodeImage} \n **Show**: ${showNameWithLink} \n **Episode**: ${episodeNameWithLink}\n ${preview}`;
  }

  // should never get here but let's make TS happy
  throw new Error("unepected track type");
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
    //TODO: move ths to the format function and do diff stuff  based on track vs episode
    "\nThis PR's soundtrack: \n" +
    trackText +
    "\n" +
    suffix +
    "\n" +
    afterSuffix;

  thePrCommentBox.value = finalText;
};
