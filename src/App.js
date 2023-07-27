import {useEffect, useState} from "react";
import { v4 as uuidv4 } from 'uuid';
import Hex from 'crypto-js/enc-hex';
import hmacSHA512 from 'crypto-js/hmac-sha512';
import TransactionCard from "./components/TransactionCard";
import {TextField} from "@mui/material";

function App() {


  const [wcUri, setWcUri] = useState('----')
  const [address, setAddress] = useState('--Address Here--')
  const [personalMessage, setPersonalMessage] = useState('Personal Message Signing')
  const [loading, setLoading] = useState(true)


  const [apiKey, setApiKey] = useState()

  const initializeSingularity = () => {
    window.Singularity.init(apiKey, () => {
      alert(`SIngularity Initialized with api key - ${apiKey}`)
    });
  }


  useEffect(() => {
    window.document.body.addEventListener('Singularity-mounted', () => {
      window.SingularityEvent.subscribe('SingularityEvent-logout', () => {
        window.SingularityEvent.close();
      });
      window.SingularityEvent.subscribe('SingularityEvent-login', data => {
        console.log('login data --->', data);
        alert(`Logged in user data -----> ${data}`)
      });

      window.SingularityEvent.subscribe('SingularityEvent-open', () => {

      });

      window.SingularityEvent.subscribe('SingularityEvent-close', () => {
        console.log('subscribe close drawer ');
      });

      window.SingularityEvent.subscribe(
          'SingularityEvent-onTransactionApproval',
          data => {
            console.log('Txn approved', JSON.parse(data));
          }
      );
      window.SingularityEvent.subscribe(
          'SingularityEvent-onTransactionSuccess',
          data => {
            console.log('Txn Successfull', JSON.parse(data));
          }
      );
      window.SingularityEvent.subscribe(
          'SingularityEvent-onTransactionFailure',
          data => {
            console.log('Txn failed', JSON.parse(data));
          }
      );

      setLoading(false)
    });
  }, []);



  const onPersonalMessageSignedClicked = async () => {
    const signature = await window.SingularityEvent.requestPersonalSignature(personalMessage)
    console.log('Signature demo',signature)
    if (signature.metaData)
      window.alert('Signature: ' + signature.metaData);
  }


  const onTypedMessageSignedClicked = async () => {
    const domain = {
      name: 'GamePay',
      version: '1',
      chainId: 97,
      verifyingContract: '0xED975dB5192aB41713f0080E7306E08188e53E7f'
    };

    const types = {
      bid: [
        { name: 'bidder', type: 'address' },
        { name: 'collectableId', type: 'uint256' },
        { name: 'amount', type: 'uint256' },
        { name: 'nounce', type: 'uint' }
      ]
    };

    const message = {
      bidder: '0xAa81f641d4b3546F05260F49DEc69Eb0314c47De',
      collectableId: 1,
      amount: 100,
      nounce: 1
    };

    const primaryType ="bid";

    const signature = await window.SingularityEvent.requestTypedSignature(domain, primaryType, types, message)

    console.log('Signature demo',signature)
    if (signature.metaData)
      window.alert('Signature: ' + signature.metaData);
  }

  const handleReceiveTransactionClicked = async () => {

    const clientReferenceId = uuidv4();

    let body = {
      clientReferenceId,
      singularityTransactionType: 'RECEIVE',
      transactionLabel: 'Label Here',
      transactionDescription: 'Description',
      transactionIconLink:
          'https://singularity-icon-assets.s3.ap-south-1.amazonaws.com/currency/matic.svg',
      clientReceiveObject: {
        clientRequestedAssetId: 800011,
        clientRequestedAssetQuantity: 0.00001,
      },
    };

    const secret =
        'SSk49aq1/kQ1eKH7Sg+u4JsisvrycRcLopHdM6lNEMVe/p7lsSVoRiY0neFYNJkHoWVEK30bPAV2pNU2WwOJXQ==';

    console.log('Body to generate signature ---->', body);
    const requestString = JSON.stringify(body);
    const signature = Hex.stringify(hmacSHA512(requestString, secret));
    await window.SingularityEvent.transactionFlow(requestString, signature)
  }

  const onWalletConnectUriButtonClicked = async () => {
    const {name, metaData} = await window.SingularityEvent.getWalletConnectConnectionUri()
    setWcUri(metaData)
    alert(metaData)
  }


  return (
      <>
        <div className="App">
          { loading &&
              <center><h1>Loading...Please Wait...</h1></center>
          }
          <center><h2>Welcome to the my game</h2></center>

          <p>1. Initialize Singularity</p>

          Api Key:
          <TextField
              placeholder="Api Key"
              value={apiKey}
              onChange={e => setApiKey(e.target.value)}
              inputProps={{ style: { fontSize: '20px', height: '100%' } }}
              sx={{ mt: 1 }}
          />

          <button onClick={initializeSingularity}>Initialize Singularity</button>

          <p>2. Get the wallet connection connection uri from the button below</p>

          <button onClick={onWalletConnectUriButtonClicked}> Get Wallet Connect Connection Uri</button>


          <h2>WC Uri Received: </h2> {wcUri}

          <p>3. Use the use below in your wallet. For testing purposed, paste this uri to wallet @ <a href="https://react-web3wallet.vercel.app/" target="_blank">https://react-web3wallet.vercel.app/</a> </p>

          <p>4. Now test the transactions</p>


          <TextField
              placeholder="Text Message here"
              value={personalMessage}
              onChange={e => setPersonalMessage(e.target.value)}
              inputProps={{ style: { fontSize: '20px', height: '100%' } }}
              sx={{ mt: 1 }}
          />
          <button onClick={onPersonalMessageSignedClicked}>Get Personal Message Signed</button>

          {/*<button onClick={onTypedMessageSignedClicked}>Get Typed Message Signed</button>*/}
          {/*<button onClick={handleReceiveTransactionClicked}>Start Receive Transaction</button>*/}
          <TransactionCard />
        </div>
      </>
  );
}

export default App;
