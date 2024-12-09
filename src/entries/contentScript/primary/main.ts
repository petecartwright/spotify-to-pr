// content script

import { MESSAGE_ACTIONS } from "~/util/keys";
import "./style.css";
import { writeToPr } from "~/util/writeToPr";

chrome.runtime.onMessage.addListener(async (message, _, sendResponse) => {
  if (message.action === MESSAGE_ACTIONS.writeToPr) {
    const track = message.track;
    await writeToPr(track);
    return false;
  }

  if (message.action === MESSAGE_ACTIONS.confirmPrBoxOnPage) {
    // check to see if the PR comment box is on the page
    const thePrCommentBox = document.querySelector(
      "textarea[name='pull_request[body]'"
    ) as HTMLTextAreaElement;

    sendResponse(!!thePrCommentBox);
    return false;
  }
  return false;
});
