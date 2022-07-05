import { Card, makeStyles, TextField, Typography, useTheme } from '@material-ui/core';
import { ImportExportRounded } from '@material-ui/icons';
import { BN, Provider } from '@project-serum/anchor';
import { Token, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { Keypair, PublicKey, Signer, SystemProgram, Transaction } from '@solana/web3.js';
import { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import { FEE_MULTIPLIER, useDexContext, useMarket, useOpenOrders, useRouteVerbose } from '../context/Dex';
import { useCanSwap, useReferral, useSwapContext, useSwapFair } from '../context/Swap';
import { useMint, useOwnedTokenAccount } from '../context/Token';
import { useTokenMap } from '../context/TokenList';
import { SOL_MINT, WRAPPED_SOL_MINT } from '../utils/pubkeys';
import { InfoLabel } from './Info';
import { SettingsButton } from './Settings';
import TokenDialog from './TokenDialog';
import { Button } from 'antd';

const useStyles = makeStyles((theme) => ({
  card: {
    width: theme.spacing(50),
    borderRadius: theme.spacing(2),
    boxShadow: "0px 0px 30px 5px rgba(0,0,0,0.075)",
    padding: theme.spacing(2),
  },
  tab: {
    width: "50%",
  },
  settingsButton: {
    padding: 0,
  },
  swapButton: {
    width: "100%",
  },
  swapToFromButton: {
    display: "block",
    margin: "10px auto 10px auto",
    cursor: "pointer",
  },
  textField: {
    flexGrow: 1,
  },
  amountInput: {
    fontSize: 22,
    fontWeight: 600,
  },
  input: {
    textAlign: "right",
    flexGrow: 1,
  },
  swapTokenFormContainer: {
    borderRadius: theme.spacing(2),
    boxShadow: "0px 0px 15px 2px rgba(33,150,243,0.1)",
    display: "flex",
    justifyContent: "space-between",
    padding: theme.spacing(1),
  },
  swapTokenSelectorContainer: {
    marginLeft: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    width: "50%",
  },
  balanceContainer: {
    display: "flex",
    alignItems: "center",
    fontSize: "14px",
  },
  maxButton: {
    marginLeft: theme.spacing(1),
    color: theme.palette.primary.main,
    fontWeight: 700,
    fontSize: "12px",
    cursor: "pointer",
    textTransform: 'uppercase',
  },
  tokenButton: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
  },
}));

export default function SwapCard({
  containerStyle,
  contentStyle,
  swapTokenContainerStyle,
}: {
  containerStyle?: any;
  contentStyle?: any;
  swapTokenContainerStyle?: any;
}) {
  const styles = useStyles();
  return (
    <Card className={styles.card} style={containerStyle}>
      <SwapHeader />
      <div style={contentStyle}>
        <SwapFromForm style={swapTokenContainerStyle} />
        <ArrowButton />
        <SwapToForm style={swapTokenContainerStyle} />
        <InfoLabel />
        <SwapButton />
      </div>
    </Card>
  );
}

export function SwapHeader() {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "16px",
      }}
    >
      <Typography
        style={{
          fontSize: 18,
          fontWeight: 700,
        }}
      >
        SWAP
      </Typography>
      <SettingsButton />
    </div>
  );
}

export function ArrowButton() {
  const styles = useStyles();
  const theme = useTheme();
  const { swapToFromMints } = useSwapContext();
  return (
    <ImportExportRounded
      className={styles.swapToFromButton}
      fontSize="large"
      htmlColor={theme.palette.primary.main}
      onClick={swapToFromMints}
    />
  );
}

function SwapFromForm({ style }: { style?: any }) {
  const { fromMint, setFromMint, fromAmount, setFromAmount } = useSwapContext();
  return (
    <SwapTokenForm
      from
      style={style}
      mint={fromMint}
      setMint={setFromMint}
      amount={fromAmount}
      setAmount={setFromAmount}
    />
  );
}

function SwapToForm({ style }: { style?: any }) {
  const { toMint, setToMint, toAmount, setToAmount } = useSwapContext();
  return (
    <SwapTokenForm
      from={false}
      style={style}
      mint={toMint}
      setMint={setToMint}
      amount={toAmount}
      setAmount={setToAmount}
    />
  );
}

export function SwapTokenForm({
  from,
  style,
  mint,
  setMint,
  amount,
  setAmount,
}: {
  from: boolean;
  style?: any;
  mint: PublicKey;
  setMint: (m: PublicKey) => void;
  amount: number;
  setAmount: (a: number) => void;
}) {
  const styles = useStyles();

  const [showTokenDialog, setShowTokenDialog] = useState(false);
  const tokenAccount = useOwnedTokenAccount(mint);
  const mintAccount = useMint(mint);

  const balance = tokenAccount && mintAccount
    ? tokenAccount.account.amount.toNumber() / 10 ** mintAccount.decimals
    : 0;

  const formattedAmount = mintAccount && amount
    ? Number(amount.toFixed(mintAccount.decimals))
    : amount;

  return (
    <div className={styles.swapTokenFormContainer} style={style}>
      <div className={styles.swapTokenSelectorContainer}>
        <TokenButton mint={mint} />
        <Typography color="textSecondary" className={styles.balanceContainer}>
          <FormattedMessage id="Swap.balance" values={{
            amount: tokenAccount && mintAccount
              ? balance?.toFixed(mintAccount.decimals)
              : '-'
          }} />
          {from && !!balance ? (
            <span
              className={styles.maxButton}
              onClick={() => setAmount(balance)}
            >
              <FormattedMessage id="Swap.max" />
            </span>
          ) : null}
        </Typography>
      </div>
      <TextField
        className={styles.textField}
        type="number"
        value={formattedAmount}
        onChange={(e) => setAmount(parseFloat(e.target.value))}
        InputProps={{
          disableUnderline: true,
          classes: {
            root: styles.amountInput,
            input: styles.input,
          },
          inputProps: {
            min: 0,
            max: balance,
          },
        }}
      />
      <TokenDialog
        setMint={setMint}
        open={showTokenDialog}
        onClose={() => setShowTokenDialog(false)}
      />
    </div>
  );
}

function TokenButton({ mint }: {
  mint: PublicKey;
}) {
  const styles = useStyles();
  const theme = useTheme();

  return (
    <div className={styles.tokenButton}>
      <TokenIcon mint={mint} style={{ width: theme.spacing(4) }} />
      <TokenName mint={mint} style={{ fontSize: 14, fontWeight: 700 }} />
    </div>
  );
}

export function TokenIcon({ mint, style }: { mint: PublicKey; style: any }) {
  const tokenMap = useTokenMap();
  let tokenInfo = tokenMap.get(mint.toString());
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        flexDirection: "column",
      }}
    >
      {tokenInfo?.logoURI ? (
        <img alt="Logo" style={style} src={tokenInfo?.logoURI} />
      ) : (
        <div style={style}></div>
      )}
    </div>
  );
}

function TokenName({ mint, style }: { mint: PublicKey; style: any }) {
  const tokenMap = useTokenMap();
  const theme = useTheme();
  let tokenInfo = tokenMap.get(mint.toString());

  return (
    <Typography
      style={{
        marginLeft: theme.spacing(2),
        marginRight: theme.spacing(1),
        ...style,
      }}
    >
      {tokenInfo?.symbol}
    </Typography>
  );
}

export function SwapButton() {
  const styles = useStyles();
  const {
    fromMint,
    toMint,
    fromAmount,
    setFromAmount,
    slippage,
    isClosingNewAccounts,
    isStrict,
  } = useSwapContext();
  const { swapClient, isLoading: isDexLoading, openOrders } = useDexContext();
  const fromMintInfo = useMint(fromMint);
  const toMintInfo = useMint(toMint);
  const route = useRouteVerbose(fromMint, toMint);
  const fromMarket = useMarket(
    route && route.markets ? route.markets[0] : undefined
  );
  const toMarket = useMarket(
    route && route.markets ? route.markets[1] : undefined
  );
  const canSwap = useCanSwap();
  const referral = useReferral(fromMarket);
  const fair = useSwapFair();
  let fromWallet = useOwnedTokenAccount(fromMint);
  let toWallet = useOwnedTokenAccount(toMint);
  const quoteMint = fromMarket && fromMarket.quoteMintAddress;
  const quoteMintInfo = useMint(quoteMint);
  const quoteWallet = useOwnedTokenAccount(quoteMint);
  const [isLoading, setIsLoading] = useState(false);


  // Click handler.
  const sendSwapTransaction = async () => {
    setIsLoading(true);
    try {
      if (!fromMintInfo || !toMintInfo) {
        throw new Error("Unable to calculate mint decimals");
      }
      if (!fair) {
        throw new Error("Invalid fair");
      }
      if (!quoteMint || !quoteMintInfo) {
        throw new Error("Quote mint not found");
      }

      const amount = new BN(fromAmount * 10 ** fromMintInfo.decimals);
      const isSol = fromMint.equals(SOL_MINT) || toMint.equals(SOL_MINT);
      const wrappedSolAccount = isSol ? Keypair.generate() : undefined;

      // Build the swap.
      let txs = await (async () => {
        if (!fromMarket) {
          throw new Error("Market undefined");
        }

        const minExchangeRate = {
          rate: new BN((10 ** toMintInfo.decimals * FEE_MULTIPLIER) / fair)
            .muln(100 - slippage)
            .divn(100),
          fromDecimals: fromMintInfo.decimals,
          quoteDecimals: quoteMintInfo.decimals,
          strict: isStrict,
        };
        const fromOpenOrders = fromMarket
          ? openOrders.get(fromMarket?.address.toString())
          : undefined;
        const toOpenOrders = toMarket
          ? openOrders.get(toMarket?.address.toString())
          : undefined;
        const fromWalletAddr = fromMint.equals(SOL_MINT)
          ? wrappedSolAccount!.publicKey
          : fromWallet
            ? fromWallet.publicKey
            : undefined;
        const toWalletAddr = toMint.equals(SOL_MINT)
          ? wrappedSolAccount!.publicKey
          : toWallet
            ? toWallet.publicKey
            : undefined;

        return await swapClient.swapTxs({
          fromMint,
          toMint,
          quoteMint,
          amount,
          minExchangeRate,
          referral,
          fromMarket,
          toMarket,
          // Automatically created if undefined.
          fromOpenOrders: fromOpenOrders ? fromOpenOrders[0].address : undefined,
          toOpenOrders: toOpenOrders ? toOpenOrders[0].address : undefined,
          fromWallet: fromWalletAddr,
          toWallet: toWalletAddr,
          quoteWallet: quoteWallet ? quoteWallet.publicKey : undefined,
          // Auto close newly created open orders accounts.
          close: isClosingNewAccounts,
        });
      })();

      // If swapping SOL, then insert a wrap/unwrap instruction.
      if (isSol) {
        if (txs.length > 1) {
          throw new Error("SOL must be swapped in a single transaction");
        }
        const { tx: wrapTx, signers: wrapSigners } = await wrapSol(
          swapClient.program.provider,
          wrappedSolAccount as Keypair,
          fromMint,
          amount
        );
        const { tx: unwrapTx, signers: unwrapSigners } = unwrapSol(
          swapClient.program.provider,
          wrappedSolAccount as Keypair
        );
        const tx = new Transaction();
        tx.add(wrapTx);
        tx.add(txs[0].tx);
        tx.add(unwrapTx);
        txs[0].tx = tx;
        txs[0].signers.push(...wrapSigners);
        txs[0].signers.push(...unwrapSigners);
      }

      await swapClient.program.provider.sendAll(txs);
      setFromAmount(0);
    } catch (e) {
      console.log('Swap error:', e);
      throw e;
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <Button
      type="primary"
      shape="round"
      size="large"
      loading={isLoading || isDexLoading}
      className={styles.swapButton}
      onClick={sendSwapTransaction}
      disabled={!canSwap || isLoading || isDexLoading}
    >
      <FormattedMessage id={isDexLoading ? 'Swap.loading' : 'Swap.action.swap'} />
    </Button>
  );
}

async function wrapSol(
  provider: Provider,
  wrappedSolAccount: Keypair,
  fromMint: PublicKey,
  amount: BN
): Promise<{ tx: Transaction; signers: Array<Signer | undefined> }> {
  const tx = new Transaction();
  const signers = [wrappedSolAccount];
  // Create new, rent exempt account.
  tx.add(
    SystemProgram.createAccount({
      fromPubkey: provider.wallet.publicKey,
      newAccountPubkey: wrappedSolAccount.publicKey,
      lamports: await Token.getMinBalanceRentForExemptAccount(
        provider.connection
      ),
      space: 165,
      programId: TOKEN_PROGRAM_ID,
    })
  );
  // Transfer lamports. These will be converted to an SPL balance by the
  // token program.
  if (fromMint.equals(SOL_MINT)) {
    tx.add(
      SystemProgram.transfer({
        fromPubkey: provider.wallet.publicKey,
        toPubkey: wrappedSolAccount.publicKey,
        lamports: amount.toNumber(),
      })
    );
  }
  // Initialize the account.
  tx.add(
    Token.createInitAccountInstruction(
      TOKEN_PROGRAM_ID,
      WRAPPED_SOL_MINT,
      wrappedSolAccount.publicKey,
      provider.wallet.publicKey
    )
  );
  return { tx, signers };
}

function unwrapSol(
  provider: Provider,
  wrappedSolAccount: Keypair
): { tx: Transaction; signers: Array<Signer | undefined> } {
  const tx = new Transaction();
  tx.add(
    Token.createCloseAccountInstruction(
      TOKEN_PROGRAM_ID,
      wrappedSolAccount.publicKey,
      provider.wallet.publicKey,
      provider.wallet.publicKey,
      []
    )
  );
  return { tx, signers: [] };
}
