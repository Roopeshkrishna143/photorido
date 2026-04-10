type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
  expires_in?: number;
  scope?: string;
  token_type?: string;
};

type GoogleTokenClient = {
  callback: (response: GoogleTokenResponse) => void;
  requestAccessToken: (options?: { prompt?: string }) => void;
};

type GoogleOAuth2Client = {
  initTokenClient: (config: {
    client_id: string;
    scope: string;
    callback: (response: GoogleTokenResponse) => void;
  }) => GoogleTokenClient;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        oauth2?: GoogleOAuth2Client;
      };
    };
  }
}

export {};
