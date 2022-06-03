import { FormControlLabel, FormGroup, IconButton, InputAdornment, makeStyles, Popover, Switch, TextField, Typography } from '@material-ui/core';
import { SettingsOutlined as Settings } from '@material-ui/icons';
import PopupState, { bindPopover, bindTrigger } from 'material-ui-popup-state';
import { useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useDexContext } from '../context/Dex';
import { useSwapContext, useSwapFair } from '../context/Swap';
import OpenOrdersDialog from './OpenOrdersDialog';
import { Button } from 'antd';

const useStyles = makeStyles((theme) => ({
  tab: {
    width: "50%",
  },
  table: {},
  settingsButton: {
    padding: 0,
    color: theme.palette.primary.main,
  },
  closeAccountSwitchLabel: {
    color: theme.palette.text.secondary,
  },
  fairAutoSelected: {
    backgroundColor: theme.palette.primary.main,
    padding: "3px 5px",
    borderRadius: "10px",
    color: theme.palette.primary.contrastText,
    fontWeight: 700,
  },
  fairAuto: {
    backgroundColor:
      theme.palette.type === "dark"
        ? theme.palette.secondary.light
        : theme.palette.secondary.main,
    padding: "3px 5px",
    borderRadius: "10px",
    boxShadow: "none",
  },
}));

export function SettingsButton() {
  const styles = useStyles();

  return (
    <PopupState variant="popover">
      {
        //@ts-ignore
        (popupState) => (
          <div>
            <IconButton
              {...bindTrigger(popupState)}
              className={styles.settingsButton}
            >
              <Settings />
            </IconButton>
            <Popover
              {...bindPopover(popupState)}
              anchorOrigin={{
                vertical: "bottom",
                horizontal: "left",
              }}
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              PaperProps={{
                style: {
                  borderRadius: "10px",
                  boxShadow: "0px 0px 30px 5px rgba(0,0,0,0.075)",
                },
              }}
            >
              <SettingsDetails />
            </Popover>
          </div>
        )
      }
    </PopupState>
  );
}

function SettingsDetails() {
  const intl = useIntl();
  const styles = useStyles();

  const { slippage, setSlippage, fairOverride, setFairOverride } =
    useSwapContext();
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const fair = useSwapFair();
  const { swapClient } = useDexContext();

  const setSlippageHandler = (value?: number) => {
    setSlippage(!value || value < 0 ? 0 : value);
  };

  return (
    <div style={{ padding: "15px", width: "305px" }}>
      <Typography style={{ fontWeight: "bold" }}>
        <FormattedMessage id="Swap.settings.title" />
      </Typography>
      <div>
        <div style={{ marginTop: "10px" }}>
          <Typography color="textSecondary" style={{ fontSize: "12px" }}>
            <FormattedMessage id="Swap.settings.tolerance.title" />
          </Typography>
          <TextField
            type="number"
            placeholder={intl.formatMessage({ id: 'Swap.settings.tolerance.placeholder' })}
            value={slippage}
            onChange={(e) => setSlippageHandler(parseFloat(e.target.value))}
            style={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
            }}
            InputProps={{
              endAdornment: <InputAdornment position="end">%</InputAdornment>,
            }}
          />
        </div>
        <div style={{ marginTop: "10px" }}>
          <Typography color="textSecondary" style={{ fontSize: "12px" }}>
            <FormattedMessage id="Swap.settings.fairPrice.title" />
          </Typography>
          <div style={{ display: "flex" }}>
            <TextField
              type="number"
              placeholder={intl.formatMessage({ id: 'Swap.settings.fairPrice.placeholder' })}
              value={fair}
              onChange={(e) => setFairOverride(parseFloat(e.target.value))}
              style={{
                marginRight: "10px",
                flex: 1,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
              disabled={fairOverride === null}
            />
            <Button
              type="primary"
              shape="round"
              size="middle"
              onClick={() => {
                if (fair === undefined) {
                  console.error("Fair is undefined");
                  return;
                }
                if (fairOverride === null) {
                  setFairOverride(fair);
                } else {
                  setFairOverride(null);
                }
              }}
            >
              <FormattedMessage id="Swap.settings.fairPrice.auto" />
            </Button>
          </div>
        </div>
        <div style={{ margin: "10px 0px" }}>
          <CloseNewAccountsSwitch />
        </div>
        <Button
          type="default"
          size="middle"
          shape="round"
          disabled={swapClient.program.provider.wallet.publicKey === null}
          onClick={() => setShowSettingsDialog(true)}
        >
          <FormattedMessage id="Swap.action.manage" />
        </Button>
      </div>
      <OpenOrdersDialog
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />
    </div>
  );
}

function CloseNewAccountsSwitch() {
  const styles = useStyles();
  const { isClosingNewAccounts, setIsClosingNewAccounts } = useSwapContext();

  return (
    <FormGroup style={{ display: "none" }} row>
      <FormControlLabel
        classes={{ label: styles.closeAccountSwitchLabel }}
        labelPlacement="start"
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginLeft: 0,
          width: "100%",
        }}
        control={
          <Switch
            checked={isClosingNewAccounts}
            onChange={() => setIsClosingNewAccounts(!isClosingNewAccounts)}
            color="primary"
          />
        }
        label="Close new accounts"
      />
    </FormGroup>
  );
}
