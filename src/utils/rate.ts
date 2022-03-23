import { Provider } from '@project-serum/anchor';
import { Market } from '@project-serum/serum';
import { Swap } from '@project-serum/swap';
import { TokenListContainer } from '@solana/spl-token-registry';
import { PublicKey } from '@solana/web3.js';
import { DEX_PID } from './pubkeys';

export async function getTokenBid(provider: Provider, marketAddress: string, tokenList: TokenListContainer): Promise<number> {
  // const provider = getConnectionProvider(new SolletWalletAdapter());
  const swapClient = new Swap(provider, tokenList);
  const market = new PublicKey(marketAddress);
  const marketClient = await Market.load(
    swapClient.program.provider.connection,
    market,
    swapClient.program.provider.opts,
    DEX_PID,
  );
  const bids = await marketClient.loadBids(swapClient.program.provider.connection);
  return bids.items(true).next().value.price;
}
