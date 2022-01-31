import { TokenInfo } from '@solana/spl-token-registry';

export const lstarCoin: TokenInfo = {
  'chainId': 101,
  'address': 'C6qep3y7tCZUJYDXHiwuK46Gt6FsoxLi8qV1bTCRYaY1',
  'symbol': 'LSTAR',
  'name': 'Learning Star',
  'decimals': 6,
  'logoURI': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/D3yigvdWq6qobhAwQL6UiSide5W9W7zcJbuVvKa3T231/logo.png',
  'tags': [
    'play2earn',
    'learn2earn',
  ],
  'extensions': {
    'discord': 'https://discord.gg/letmespeak',
    // 'instagram': 'https://www.instagram.com/letmespeak_org',
    // 'telegram': 'https://t.me/letmespeak_org',
    'twitter': 'https://twitter.com/Letmespeak_org',
    'website': 'https://www.letmespeak.org',
    serumV3Usdc: 'C6y1AH1A9Q3Xdk5yxCj5XEQaG2mmXzaqQWq5HLhjpWiT',
  },
};

export const usdcCoin: TokenInfo = {
  'chainId': 101,
  'address': 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  'symbol': 'USDC',
  'name': 'USD Coin',
  'decimals': 6,
  'logoURI': 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v/logo.png',
  'tags': [
    'stablecoin',
  ],
  'extensions': {
    'coingeckoId': 'usd-coin',
    'serumV3Usdt': '77quYg4MGneUdjgXCunt9GgM1usmrxKY31twEy3WHwcS',
    'website': 'https://www.centre.io/',
  },
};
