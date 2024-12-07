// largely borrowed from the Spotify AuthZ With PKCE docs:
// https://developer.spotify.com/documentation/web-api/tutorials/code-pkce-flow

import { STORAGE_KEYS } from "./keys";

type SpotifyAuthZParams = {
  client_id: string;
  code_challenge: string;
  code_challenge_method: "S256";
  response_type: "code";
  redirect_uri: string;
  scope: string;
  state?: string;
};

type SpotifyAccessTokenParams = {
  grant_type: "authorization_code";
  code: string;
  redirect_uri: string;
  client_id: string;
  code_verifier: string;
};

type SpotifyAccessTokenResponseData = {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token?: string;
};

type SpotifyRefreshTokenParams = {
  grant_type: string;
  refresh_token: string;
  client_id: string;
};

const generateCodeVerifier = (length: number): string => {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return values.reduce((acc, x) => acc + possible[x % possible.length], "");
};

const sha256 = async (plain: string): Promise<ArrayBuffer> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return crypto.subtle.digest("SHA-256", data);
};

const base64encode = (input: ArrayBuffer) => {
  return btoa(String.fromCharCode(...new Uint8Array(input)))
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
};

export const authorizeWithSpotify = async (): Promise<string | undefined> => {
  // TODO: move this to common storage, set on init??
  const spotifyClientId = "473534ffb69d46cfa2064a04033ebfb3";

  // TODO: can i make a test request to see if we need to refresh the token?

  const redirectUri = chrome.identity.getRedirectURL();

  const codeVerifier = generateCodeVerifier(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64encode(hashed);

  const scope = "user-read-currently-playing";
  const spotifyAuthZUrl = new URL("https://accounts.spotify.com/authorize");

  const spotifyAuthZParams: SpotifyAuthZParams = {
    response_type: "code",
    client_id: spotifyClientId,
    scope,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    redirect_uri: redirectUri,
  };

  spotifyAuthZUrl.search = new URLSearchParams(spotifyAuthZParams).toString();

  const spotifyAuthZReturnUrl = await chrome.identity.launchWebAuthFlow({
    url: spotifyAuthZUrl.toString(),
    interactive: true,
  });

  // TODO: actually handle failure
  if (!spotifyAuthZReturnUrl) return;

  const urlParams = new URL(spotifyAuthZReturnUrl).searchParams;
  let code = urlParams.get("code");

  // TODO: actually handle failure
  if (!code) return;

  const spotifyAccessTokenUrl = new URL(
    "https://accounts.spotify.com/api/token"
  );

  const spotifyAccessTokenParams: SpotifyAccessTokenParams = {
    grant_type: "authorization_code",
    code: code,
    redirect_uri: redirectUri,
    client_id: spotifyClientId,
    code_verifier: codeVerifier,
  };

  const spotifyAccessTokenBody = await fetch(spotifyAccessTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(spotifyAccessTokenParams),
  });

  // TODO: actually handle failure
  const spotifyAccessTokenResponse: SpotifyAccessTokenResponseData =
    await spotifyAccessTokenBody.json();

  // TODO: actually handle failure
  if (!spotifyAccessTokenResponse.access_token) return;

  chrome.storage.local.set({
    [STORAGE_KEYS.spotifyAccessToken]: spotifyAccessTokenResponse.access_token,
  });

  chrome.storage.local.set({
    [STORAGE_KEYS.spotifyRefreshToken]:
      spotifyAccessTokenResponse.refresh_token,
  });

  const now = new Date();
  const expirationTime = now.setSeconds(
    now.getSeconds() + spotifyAccessTokenResponse.expires_in
  );

  chrome.storage.local.set({
    [STORAGE_KEYS.expiresAt]: expirationTime,
  });

  return spotifyAccessTokenResponse.access_token;
};

export const refreshSpotifyToken = async (): Promise<string | undefined> => {
  // TODO: move this to common storage, set on init??
  const spotifyClientId = "473534ffb69d46cfa2064a04033ebfb3";
  const spotifyAccessTokenUrl = new URL(
    "https://accounts.spotify.com/api/token"
  );

  let refreshTokenData = await chrome.storage.local.get(
    STORAGE_KEYS.spotifyRefreshToken
  );

  // TODO: actually handle failure
  if (!refreshTokenData?.spotifyRefreshToken) return;

  const refreshToken = refreshTokenData.spotifyRefreshToken;
  const refreshTokenRequestParams: SpotifyRefreshTokenParams = {
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: spotifyClientId,
  };

  const refreshRequestResponse = await fetch(spotifyAccessTokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(refreshTokenRequestParams),
  });

  // TODO: actually handle failure
  const refreshRequestData = await refreshRequestResponse.json();
  return refreshRequestData;
};

export const logout = async () => {
  for (const storageKey of Object(STORAGE_KEYS).keys()) {
    chrome.storage.local.remove(storageKey);
  }
};
