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

  const CLIENT_ID = 'lxqo8p0p2ww5qlek4chddtbpnju4jh';

  async function signIn() {
    try {
      setIsLoggingIn(true);

      const redirectUri = makeRedirectUri({
        scheme: 'streamData',
        useProxy: true,
      });
      const responseType = 'token';
      const scopes = encodeURI('openid user:read:email user:read:follows');
      const FORCE_VERIFY = true;
      const STATE = generateRandom(30);
      const authUrl = `${twitchEndpoints.authorization}?client_id=${CLIENT_ID}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scopes}&force_verify=${FORCE_VERIFY}&state${STATE}`;
      const response = await startAsync({
        authUrl,
      });

      if (
        response.type === 'success' &&
        response.params.error !== 'access_denied'
      ) {
        if (response.params.state === 'STATE') {
          throw new Error('Invalid state value');
        }
        const { access_token } = response.params;
        api.defaults.headers.authorization = `Bearer ${access_token}`;
        const { data } = await api.get('/users');

        const { id, display_name, email, profile_image_url } = data.data[0];
        setUser({ id, display_name, email, profile_image_url });
        setUserToken(access_token);
      }
    } catch (error) {
      throw new Error('Erro ao realizar login');
    } finally {
      setIsLoggingIn(false);
    }
  }

  async function signOut() {
    try {
      setIsLoggingOut(true);
      revokeAsync(
        {
          token: userToken,
          clientId: CLIENT_ID,
        },
        {
          revocationEndpoint: twitchEndpoints.revocation,
        }
      );
    } catch (error) {
    } finally {
      setUser({} as User);
      setUserToken('');
      api.defaults.headers.authorization = '';
      setIsLoggingOut(false);
    }
  }

  useEffect(() => {
    api.defaults.headers['Client-Id'] = CLIENT_ID;
  }, []);

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
