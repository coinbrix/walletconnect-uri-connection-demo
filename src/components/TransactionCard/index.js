import {
  Box,
  Button,
  TextField,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  OutlinedInput,
} from '@mui/material';
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import Hex from 'crypto-js/enc-hex';

export default function TransactionCard({
  userId,
  showUserAddressField,
  handleBuyAsset,
}) {
  const tokens = [
    { value: 800011, label: 'USDC Mumbai' },
    { value: 800010, label: 'MATIC Mumbai' },
    { value: 970, label: 'BNB BSC Testnet' },
    { value: 973, label: 'BUSD BSC Testnet' },
    { value: 560, label: 'BNB BSC Mainnet' },
    { value: 563, label: 'BUSD BSC Mainnet' },
    { value: 564, label: 'RPG BSC Mainnet' },
    { value: 50, label: 'ETH on Goerli' },
    { value: 51, label: 'USDC on Goerli' },
    { value: 4200, label: 'ETH on Optimism Testnet' },
    { value: 4201, label: 'USDC on Optimism Testnet' },
    { value: 99810, label: 'ETH on Caldera Goerli Appchain' },
    { value: 99811, label: 'USDC on Caldera Goerli Appchain' },
    { value: 2220, label: 'ETH on Conduit Goerli Appchain' },
    { value: 2221, label: 'USDC on Conduit Goerli Appchain' },
    { value: 93720, label: 'OAS on Oasys Testnet' },
    { value: 93721, label: 'USDC on Oasys Testnet' },
    { value: 295480, label: 'OAS on MCH Verse Mainnet' },
    { value: 295481, label: 'USDC on MCH Verse Mainnet' },
    { value: 201970, label: 'OAS on SAND Verse' },
    { value: 201971, label: 'USDC on SAND Verse' },
    { value: 431130, label: 'Avax on Avalanche Fuji testnet' },
    { value: 431131, label: 'USDC on Avalanche Fuji testnet' },
    { value: 431140, label: 'Avax on Avalanche Mainnet' },
    { value: 431141, label: 'USDC on Avalanche Mainnet' },
    { value: 431147, label: 'LODE on Avalanche Mainnet' },
    { value: 431148, label: 'AGX on Avalanche Mainnet' },
    { value: 431149, label: 'AUX on Avalanche Mainnet' },
    { value: 1370, label: 'MATIC Mainnet' },
    { value: 1371, label: 'USDC Mainnet' },
    { value: 974, label: 'RPG BSC Testnet' },
  ];

  const receivingAddressTypes = [
    {
      value: 'user',
      label: 'User',
    },
    {
      value: 'merchant',
      label: 'Merchant',
    },
  ];
  const [token, setToken] = useState('');
  const [amount, setAmount] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [gamerAddress, setGamerAddress] = useState('');
  const [receivingAddressType, setReceivingAddressType] = useState('user');

  useEffect(() => {
    if (receivingAddressType === 'user') {
      // handleAddressField();
    } else {
      setGamerAddress('');
    }
    return () => {
      setGamerAddress('');
    };
  }, [receivingAddressType]);

  // const handleAddressField = async () => {
  //   const userInfo = await window.SingularityEvent.getConnectUserInfo();
  //   const userAvailabelAddresses =
  //     userInfo?.metaData?.wallet?.accounts?.evmPublicAddress || [];
  //   const userSelectedAddress = userAvailabelAddresses.length
  //     ? userAvailabelAddresses[0]?.publicAddress || ''
  //     : '';
  //   if (userSelectedAddress) {
  //     setGamerAddress(userSelectedAddress);
  //   }
  // };

  const initiateTransaction = async () => {
    setLoading(true);

    try {
      const clientReferenceId = uuidv4();

      let body = {
        clientReferenceId,
        singularityTransactionType: 'RECEIVE',
        transactionLabel: reason,
        transactionDescription: 'Description',
        transactionIconLink:
          'https://singularity-icon-assets.s3.ap-south-1.amazonaws.com/currency/matic.svg',
        clientReceiveObject: {
          clientRequestedAssetId: token,
          clientRequestedAssetQuantity: amount,
        },
      };
      if (gamerAddress) {
        body = {
          ...body,
          clientReceiveObject: {
            ...body.clientReceiveObject,
            address: gamerAddress,
          },
        };
      }

      const secret =
        'SSk49aq1/kQ1eKH7Sg+u4JsisvrycRcLopHdM6lNEMVe/p7lsSVoRiY0neFYNJkHoWVEK30bPAV2pNU2WwOJXQ==';

      console.log('Body to generate signature ---->', body);
      const requestString = JSON.stringify(body);
      const signature = Hex.stringify(hmacSHA512(requestString, secret));
      window.SingularityEvent.transactionFlow(requestString, signature, userId);
      if (gamerAddress && handleBuyAsset) {
        handleBuyAsset();
      }
    } catch (err) {
      window.alert('Some error occured');
      console.error(err);
    }

    setLoading(false);
  };

  return (
    <Box
      sx={{
        border: '6px solid white',
        bgcolor: '#FFFFFFA6',
        width: ['100%', 410],
        boxSizing: 'border-box',
        p: 3,
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography textAlign="center" mb={1}>
        Request payment from user
      </Typography>

      <FormControl fullWidth>
        {!token && (
          <InputLabel style={{ fontSize: '20px' }}>Requested Token</InputLabel>
        )}
        <Select
          value={token}
          onChange={e => setToken(e.target.value)}
          input={<OutlinedInput style={{ fontSize: '20px' }} />}
        >
          {tokens.map(({ value, label }) => (
            <MenuItem key={value} value={value} style={{ fontSize: '20px' }}>
              {label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <TextField
        type="number"
        placeholder="Requested Amount"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        inputProps={{ style: { fontSize: '20px', height: '100%' } }}
        sx={{ mt: 1 }}
      />

      <TextField
        placeholder="Reason for Payment"
        value={reason}
        onChange={e => setReason(e.target.value)}
        inputProps={{ style: { fontSize: '20px', height: '100%' } }}
        sx={{ mt: 1 }}
      />
      {/* showUserAddressField prop is passed only in case of non-login form, 
        where we have to explicitly take user address */}
      {showUserAddressField ? (
        <TextField
          placeholder="Enter address"
          value={gamerAddress}
          onChange={e => setGamerAddress(e.target.value)}
          inputProps={{ style: { fontSize: '20px', height: '100%' } }}
          sx={{ mt: 1 }}
        />
      ) : (
        <FormControl fullWidth sx={{ mt: 1 }}>
          <InputLabel style={{ fontSize: '20px' }}>Send To</InputLabel>

          <Select
            placeholder="Send to"
            value={receivingAddressType}
            onChange={e => setReceivingAddressType(e.target.value)}
            input={<OutlinedInput style={{ fontSize: '20px' }} />}
          >
            {receivingAddressTypes.map(({ value, label }) => (
              <MenuItem key={value} value={value} style={{ fontSize: '20px' }}>
                {label}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      <Button
        sx={{
          fontSize: 20,
          lineHeight: '23px',
          mt: 1,
        }}
        variant="contained"
        disabled={!amount || !token || loading}
        onClick={initiateTransaction}
      >
        {loading ? 'Loading' : 'Request'}
      </Button>
    </Box>
  );
}
