import renderContent from "../renderContent";
import logo from "~/assets/logo.svg";
import "./style.css";
import { writeToPr } from "~/util/writeToPr";

// TODO: only show this in dev
renderContent(
  import.meta.PLUGIN_WEB_EXT_CHUNK_CSS_PATHS,
  (appRoot: HTMLElement) => {
    const logoImageUrl = new URL(logo, import.meta.url).href;

    appRoot.innerHTML = `
    <div class="logo">
      <img src="${logoImageUrl}" height="50" alt="" />
    </div>
  `;
  }
);

chrome.runtime.onMessage.addListener(async (message) => {
  // TODO: can we type these messages????
  if (message.action === "write-to-pr") {
    const track = message.track;
    await writeToPr(track);
  }
});
