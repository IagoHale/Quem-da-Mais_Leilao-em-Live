import type { StreamerInfo } from '../types/auction';

export async function fetchTwitchUser(login: string): Promise<StreamerInfo> {
  try {
    let response = await fetch(`https://api.ivr.fi/v2/twitch/user?login=${login.toLowerCase()}`);

    if (response.status === 404) {
      response = await fetch(`https://api.ivr.fi/v2/twitch/user/${login.toLowerCase()}`);
    }

    if (!response.ok) {
      throw new Error('Erro na API da Twitch');
    }

    const data = await response.json();
    const user = Array.isArray(data) ? data[0] : data;

    if (user && (user.id || user.login || user.displayName)) {
      return {
        login: user.login || login,
        display_name: user.displayName || user.display_name || login,
        profile_image_url: user.logo || user.profile_image_url || user.profile_image,
        banner_url: user.banner,
        primaryColorHex: user.chatColor || user.primaryColorHex || '#9146FF',
        offline_image_url: user.offlineBanner || user.offline_image_url,
      };
    }

    throw new Error('Canal não encontrado');
  } catch (error) {
    console.error('Twitch API Error:', error);
    throw error;
  }
}
