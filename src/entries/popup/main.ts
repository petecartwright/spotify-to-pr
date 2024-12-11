import logo from "~/assets/logo.svg";
import "./style.css";
import { MESSAGE_ACTIONS, STORAGE_KEYS } from "~/util/keys";

const imageUrl = new URL(logo, import.meta.url).href;

const loginButton = '<button type="button" name="loginButton">Login</button>';
const logoutButton =
  '<button type="button" name="logoutButton">Logout</button>';
const writeToPrButton =
  '<button type="button" name="writeToPrButton">Write To PR</button>';

const urlIsGithub = async (): Promise<boolean> => {
  // if we're not on github.com AND don't see an open pr comment, get upset
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  // TODO: this could be better
  if (!tab.url || !tab.id) throw new Error("not in a tab????");

  const currentUrl = new URL(tab.url);

  if (currentUrl.hostname !== "github.com") return false;

  const prBoxIsOnPage = await chrome.tabs.sendMessage(tab.id, {
    action: MESSAGE_ACTIONS.confirmPrBoxOnPage,
  });

  return prBoxIsOnPage;
};

const main = async () => {
  const documentRoot = document.querySelector("#root")!;
  const isGithub = await urlIsGithub();

  if (!isGithub) {
    // TODO: make this nicer
    documentRoot.innerHTML = `<h2>only works on github!</h2>`;
    return;
  }

  const loginExpiration = (
    await chrome.storage.local.get(STORAGE_KEYS.expiresAt)
  ).expiresAt;

  const loginUnexpired = Date.now() < loginExpiration;

  // TODO: get rid of the popup altogether??
  //
  //    if we click the button, we try to hit the API
  //    if it works, we just do it
  //    if we're unauth'd, direct to auth flow
  //    but where do we log out?

  documentRoot.innerHTML = `
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
