import logo from "~/assets/logo.svg";
import "./style.css";
import { MESSAGE_ACTIONS, STORAGE_KEYS } from "~/util/keys";

const imageUrl = new URL(logo, import.meta.url).href;

const loginUnexpired = (await chrome.storage.local.get(STORAGE_KEYS.expiresAt))
  .expiresAt;

let loginButton = "";
if (!loginUnexpired) {
  loginButton = `<button type="button" name="loginButton">
  Login
  </button>`;
}

// TODO: maybe we show nothing if we're not on github
//       or we are on github and don't have an open PR editor open

document.querySelector("#app")!.innerHTML = `
  <img src="${imageUrl}" height="45" alt="" />
  <h1>Login</h1>
	${loginButton}
	${
    loginButton
      ? ""
      : `<button type="button" name="writeToPrButton">
          Write To PR
        </button>`
  }
`;

if (loginButton) {
  const loginButtonElement = document.querySelector(
    "button[name='loginButton']"
  ) as HTMLButtonElement;

  loginButtonElement.addEventListener("click", async () => {
    console.log("tryna call MESSAGE_ACTIONS.login");
    await chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.login });
  });
} else {
  const writeToPrButtonElement = document.querySelector(
    "button[name='writeToPrButton']"
  ) as HTMLButtonElement;

  writeToPrButtonElement.addEventListener("click", async () => {
    console.log("tryna call getSong");
    await chrome.runtime.sendMessage({ action: MESSAGE_ACTIONS.getSong });
  });
}
