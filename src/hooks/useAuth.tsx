import {
  makeRedirectUri,
  revokeAsync,
  startAsync,
  useAuthRequest,
} from 'expo-auth-session';
import React, {
  useEffect,
  createContext,
  useContext,
  useState,
  ReactNode,
} from 'react';
import { generateRandom } from 'expo-auth-session/build/PKCE';

import { api } from '../services/api';

interface User {
  id: number;
  display_name: string;
  email: string;
  profile_image_url: string;
}

interface AuthContextData {
  user: User;
  isLoggingOut: boolean;
  isLoggingIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

interface AuthProviderData {
  children: ReactNode;
}

const AuthContext = createContext({} as AuthContextData);

const twitchEndpoints = {
  authorization: 'https://id.twitch.tv/oauth2/authorize',
  tokenEndpoint: 'https://id.twitch.tv/oauth2/token',
  revocation: 'https://id.twitch.tv/oauth2/revoke',
};

function AuthProvider({ children }: AuthProviderData) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [user, setUser] = useState({} as User);
  const [userToken, setUserToken] = useState('');

  const CLIENT_ID = process.env.CLIENT_ID || 'lxqo8p0p2ww5qlek4chddtbpnju4jh';

  async function signIn() {
    console.log('Hook sigin');
    try {
      setIsLoggingIn(true);

      /*const redirectUri = makeRedirectUri({
        scheme: 'streamData',
        useProxy: true,
      });

      const responseType = 'token';
      const scopes = ['openid', 'user:read:email', 'user:read:follows'];
      const FORCE_VERIFY = true;
      const STATE = generateRandom(30);
      const [request, response, promptAsync] = useAuthRequest(
        {
          clientId: CLIENT_ID,
          redirectUri,
          scopes,
          responseType,
        },
        twitchEndpoints
      );*/

      // assemble authUrl with twitchEndpoint authorization, client_id,
      // redirect_uri, response_type, scope, force_verify and state
      // call startAsync with authUrl
      // verify if startAsync response.type equals "success" and response.params.error differs from "access_denied"
      // if true, do the following:
      // verify if startAsync response.params.state differs from STATE
      // if true, do the following:
      // throw an error with message "Invalid state value"
      // add access_token to request's authorization header
      // call Twitch API's users route
      // set user state with response from Twitch API's route "/users"
      // set userToken state with response's access_token from startAsync
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function signOut() {
    try {
      // set isLoggingOut to true
      // call revokeAsync with access_token, client_id and twitchEndpoint revocation
    } catch (error) {
    } finally {
      // set user state to an empty User object
      // set userToken state to an empty string
      // remove "access_token" from request's authorization header
      // set isLoggingOut to false
    }
  }

  /*useEffect(() => {
    // add client_id to request's "Client-Id" header
  }, []);*/

  return (
    <AuthContext.Provider
      value={{ user, isLoggingOut, isLoggingIn, signIn, signOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };
