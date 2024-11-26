import { MESSAGE_ACTIONS } from "~/util/keys";
import "./style.css";
import { writeToPr } from "~/util/writeToPr";

chrome.runtime.onMessage.addListener(async (message) => {
  // TODO: can we type these messages????
  if (message.action === MESSAGE_ACTIONS.writeToPr) {
    const track = message.track;
    await writeToPr(track);
  }
});
