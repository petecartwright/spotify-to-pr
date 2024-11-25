import logo from "~/assets/logo.svg";
import "./style.css";

const imageUrl = new URL(logo, import.meta.url).href;

// TODO: if logged in, show "Logout" and "Do The Things RENAME"

// TODO: maybe we show nothing if we're not on github
//       or we are on github and don't have an open PR editor open

const accessToken = chrome.storage.local.get("spotifyAccessToken");

document.querySelector("#app")!.innerHTML = `
  <img src="${imageUrl}" height="45" alt="" />
  <h1>Login</h1>
	<button type="button" name="loginButton">
  Login
  </button>
	<button type="button" name="writeToPrButton">
    Write To PR
  </button>
`;

const clickButtonElement = document.querySelector(
  "button[name='loginButton']"
) as HTMLButtonElement;

const writeToPrButtonElement = document.querySelector(
  "button[name='writeToPrButton']"
) as HTMLButtonElement;

clickButtonElement.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ action: "login" });
});

writeToPrButtonElement.addEventListener("click", async () => {
  await chrome.runtime.sendMessage({ action: "getSong" });
});
