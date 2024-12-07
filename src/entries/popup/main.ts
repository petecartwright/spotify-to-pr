import logo from "~/assets/logo.svg";
import "./style.css";
import { MESSAGE_ACTIONS, STORAGE_KEYS } from "~/util/keys";

const imageUrl = new URL(logo, import.meta.url).href;

const loginButton = '<button type="button" name="loginButton">Login</button>';
const logoutButton =
  '<button type="button" name="logoutButton">Logout</button>';
const writeToPrButton =
  '<button type="button" name="writeToPrButton">Write To PR</button>';

const urlIsGithub = async () => {
  // if we're not on github.com AND don't see an open pr comment, get upset
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  // TODO: this could be better
  if (!tab.url) throw new Error("not in a tab????");
  const currentUrl = new URL(tab.url);

  return currentUrl.hostname === "github.com";
};

const main = async () => {
  const isGithub = await urlIsGithub();
  if (!isGithub) return;

  const loginExpiration = (
    await chrome.storage.local.get(STORAGE_KEYS.expiresAt)
  ).expiresAt;

  const loginUnexpired = Date.now() < loginExpiration;

  // TODO: only show on approp github pages????
  //       and need to check

  // TODO: get rid of the popup altogether
  //    if we click the button, we try to hit the API
  //    if it works, we just do it
  //    if we're unauth'd, direct to auth flow

  // TODO: maybe we show nothing if we're not on github
  //       or we are on github and don't have an open PR editor open

  document.querySelector("#root")!.innerHTML = `
  <img src="${imageUrl}" height="45" alt="" />
  ${loginUnexpired ? logoutButton : loginButton}
  ${loginUnexpired ? writeToPrButton : ""}
	`;

  if (loginUnexpired) {
    const writeToPrButtonElement = document.querySelector(
      "button[name='writeToPrButton']"
    ) as HTMLButtonElement;

    writeToPrButtonElement.addEventListener("click", async () => {
      await chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.getSong });
    });

    const logoutButtonElement = document.querySelector(
      "button[name='logoutButton']"
    ) as HTMLButtonElement;

    logoutButtonElement.addEventListener("click", async () => {
      await chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.logout });
    });
  } else {
    const loginButtonElement = document.querySelector(
      "button[name='loginButton']"
    ) as HTMLButtonElement;

    loginButtonElement.addEventListener("click", async () => {
      await chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.login });
    });
  }
};

main();
