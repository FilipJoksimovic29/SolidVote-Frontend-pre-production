
/* global BigInt */

import React, { useState, useEffect,useRef } from 'react';
import { contractAbi, factoryAddress, factoryAbi, tokenAddress, tokenAbi } from './Constant/constant';
import Login from './Components/Login';
import Connected from './Components/Connected';
import AdminPanel from './Components/AdminPanel';
import LandingPage from './Components/LandingPage'; 
import './App.css';
import logobeli from './logobeli.png';
import logo from './logobeli.png';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import { Web3ModalProvider } from './Web3ModalProvider.js'; 
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import VotePage from './Components/VotePage'; 
import { BrowserProvider, Contract, parseUnits, formatEther, parseEther, ZeroAddress  } from 'ethers';
import CloseIcon from '@mui/icons-material/Close'; 


function App() {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [account, setAccount] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
      const [providerError, setProviderError] = useState(false); 
      const [showTokenForm, setShowTokenForm] = useState(false);
  const [remainingTime, setRemainingTime] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [number, setNumber] = useState('');
  const [canVote, setCanVote] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [textButton, setTextButton] = useState('Connect');
  const [isAddressExpanded, setIsAddressExpanded] = useState(false);
  const [votingTitle, setVotingTitle] = useState(''); 
  const [remainingSeconds, setRemainingSeconds] = useState(0);
  const [contractAddress, setContractAddress] = useState(null);
  const toggleAddress = () => {
    setIsAddressExpanded(!isAddressExpanded);
  };
  const formRef = useRef(null); 
  const [voters, setVoters] = useState([]);
  const [kolicinaZaSlanje, setKolicinaZaSlanje] = useState("0"); 
  const [formData, setFormData] = useState({
    email: '',
    address: '',
    companyName: '',
    usage: ''
  });
  const postaviKolicinuZaSlanje = (novaKolicina) => {
    setKolicinaZaSlanje(novaKolicina);
  };
  const toggleTokenForm = () => setShowTokenForm(!showTokenForm);
  const openTokenForm = () => setShowTokenForm(true);
  const closeTokenForm = () => setShowTokenForm(false);

  const [redoviGlasaca, setRedoviGlasaca] = useState();
  const [adminInstanceAddress, setAdminInstanceAddress] = useState(null); 
  const [voterInstanceAddress, setVoterInstanceAddress] = useState(null);
  const [formErrors, setFormErrors] = useState({}); 
  const [showAddressPopup, setShowAddressPopup] = useState(false); 
  const addressPopupRef = useRef(null); 
  const checkAdminInstance = async () => {
    if (!provider) {
      console.error("Provider is not set.");
      return;
    }
    
    try {
      const signer = await provider.getSigner();  
      const contract = new Contract(factoryAddress, factoryAbi, signer);
      const instanceAddress = await contract.getAdminInstanceAddress.staticCall(account);
    
      if (instanceAddress !== ZeroAddress ) {
        setAdminInstanceAddress(instanceAddress);
        setContractAddress(instanceAddress); 
        console.log(`Admin instance found at: ${instanceAddress}`);
      } else {
        setAdminInstanceAddress(null);
        setContractAddress(null); 
        console.log("No admin instance found.");
      }
    } catch (error) {
      console.error("Error checking admin instance address:", error);
    }
  };
  
  

  const updateRedoviGlasaca = (newRows) => {
    setRedoviGlasaca(newRows);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (formRef.current && !formRef.current.contains(event.target)) {
        closeTokenForm();
      }
    };

    if (showTokenForm) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTokenForm]);


  useEffect(() => {
    async function fetchInitialTime() {
      if (contractAddress) {
        const timeInSeconds = await getRemainingTimeFromContract();
        setRemainingSeconds(timeInSeconds > 0 ? timeInSeconds : 0);
      }
    }

   
  

    fetchInitialTime();

    const interval = setInterval(() => {
      setRemainingSeconds((prevSeconds) => {
        if (prevSeconds <= 0) {
          clearInterval(interval);
          return 0;
        } else {
          return prevSeconds - 1;
        }
      });
    }, 1000);

    const syncInterval = setInterval(() => {
      if (contractAddress) {
        syncTimeWithContract();
      }
    }, 70000);

    return () => {
      clearInterval(interval);
      clearInterval(syncInterval);
    };
  }, [contractAddress]); 


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (addressPopupRef.current && !addressPopupRef.current.contains(event.target)) {
        setShowAddressPopup(false);
      }
    };

    if (showAddressPopup) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showAddressPopup]);

  const createUserVotingInstance = async () => {
    try {
      await provider.send("eth_requestAccounts", []); 
      const signer = await provider.getSigner();
      const contract = new Contract(factoryAddress, factoryAbi, signer);
      const transactionResponse = await contract.createUserVotingInstance();

      console.log('Transaction response:', transactionResponse);
      const receipt = await transactionResponse.wait(); 

     
      const instanceAddress = receipt.events?.filter((x) => x.event === "VotingCreated")[0].args.votingInstance;
      console.log('New voting instance created at:', instanceAddress);

      
      setAdminInstanceAddress(instanceAddress);

    
      return instanceAddress; 
    } catch (error) {
      console.error('Failed to create a new voting instance:', error);
      return null;
    }
  };

  async function syncTimeWithContract() {
    const timeInSeconds = await getRemainingTimeFromContract();
    setRemainingSeconds(timeInSeconds > 0 ? timeInSeconds : 0); 
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  async function getRemainingTimeFromContract() {
    if (!contractAddress) return 0;
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contractInstance = new Contract(contractAddress, contractAbi, signer);
    
    try {
      const timeInSeconds = await contractInstance.getRemainingTime.staticCall();
      return parseInt(timeInSeconds.toString(), 10);
    } catch (error) {
      console.error('Error fetching remaining time:', error);
      return 0;
    }
  }
  const hours = Math.floor(remainingSeconds / 3600);
  const minutes = Math.floor((remainingSeconds % 3600) / 60);
  const seconds = remainingSeconds % 60;

  useEffect(() => {
    const handleAccountsChanged = (accounts) => {
      if (accounts.length === 0) {
        setIsConnected(false);
        setAccount(null);
      } else {
     
      }
    };

    window.ethereum?.on('accountsChanged', handleAccountsChanged);

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged);
    };
  }, []);

  useEffect(() => {
    if (account && contractAddress) {
      checkIfOwner();
    }
  }, [account, contractAddress]);

  useEffect(() => {
    if (account) {
      checkAdminInstance();
    }
  }, [account]);

  const checkIfOwner = async () => {
    try {
      if (!contractAddress) return; 
      const signer = await provider.getSigner();   
      const contract = new Contract(contractAddress, contractAbi, signer);
      const ownerStatus = await contract.isOwner.staticCall();
      setIsOwner(ownerStatus);
    } catch (error) {
      console.error("Error checking owner status:", error);
    }
  };
  
  

  useEffect(() => {
    if (isConnected) {
      setTextButton("Disconnect");
    } else {
      setTextButton("Connect");
    }
  }, [isConnected]);

  async function checkcanVote() {
    if (!contractAddress) return;
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contractInstance = new Contract(contractAddress, contractAbi, signer);
  
    const userAddress = await signer.getAddress();
  
    const sessionVoted = await contractInstance.lastVotedSession.staticCall(userAddress);
    const currentSession = await contractInstance.votingSessionId.staticCall();
  
    const hasVoted = sessionVoted >= currentSession;
  
    setCanVote(hasVoted);
  }
  
  async function getVoters() {
    if (!contractAddress) return;
    await provider.send("eth_requestAccounts", []);
    const signer = await provider.getSigner();
    const contractInstance = new Contract(contractAddress, contractAbi, signer);
  
    try {
      const unformattedVoters = await contractInstance.getVoters.staticCall();
      const formattedVoters = unformattedVoters.map((voter, index) => {
        return {
          index: index,
          name: voter.Adresa,
          voteCount: Number(voter.Poeni) 
        };
      });
      setVoters(formattedVoters);
    } catch (error) {
      console.error("Error fetching voters:", error);
    }
  }
  
  function isValidEmail(email) {
    const re =
      /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  }

function isValidAddress(address) {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
}
  const timeString = `${hours}h ${minutes}m ${seconds}s`;

  const handleSendToTelegram = async () => {
    const { email, address, companyName, usage } = formData;
    const errors = {};

    // Validations
    if (!email || !isValidEmail(email)) errors.email = "Invalid email format.";
    if (!address || !isValidAddress(address)) errors.address = "Invalid Ethereum address format.";
    if (!companyName) errors.companyName = "Company name is required.";
    if (!usage) errors.usage = "Usage description is required.";

    setFormErrors(errors);

    // Check if there are any errors
    if (Object.keys(errors).length > 0) {
        alert("Please correct the errors before submitting.");
        return;
    }

    // Prepare message for Telegram
    const message = `New SOV Token Request:\nEmail: ${email}\nAddress: ${address}\nCompany Name: ${companyName}\nUsage: ${usage}`;
    const chatId = ''; // Replace with your chat ID
    const token = ''; // Replace with your bot token

    try {
        const url = `https://api.telegram.org/bot${token}/sendMessage`;
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            alert('Message sent to Telegram successfully');
            setShowTokenForm(false); 
            setFormErrors({}); 
        } else {
            throw new Error('Failed to send message to Telegram');
        }
    } catch (error) {
        console.error('Error sending message to Telegram:', error);
        alert('Error sending message to Telegram');
    }
};

  
  const posaljiEther = async () => {
    try {
      if (!contractAddress) return; 
      if (!window.ethereum) throw new Error("Ethereum browser extension not available");

      await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contract = new Contract(contractAddress, contractAbi, signer);

      const recipients = redoviGlasaca.map(glasac => glasac.tekst);
      const amounts = recipients.map(() => parseUnits(kolicinaZaSlanje, "ether"));

      const totalAmountWei = amounts.reduce(
        (total, amount) => total + amount,
        0n
      );
      const transactionResponse = await contract.batchTransfer(recipients, amounts, {
        value: totalAmountWei,
      });

      console.log("Transaction response:", transactionResponse);
      console.log("Čekanje na potvrdu transakcije...");

      await transactionResponse.wait();

      console.log("Transakcija potvrđena. Hash transakcije:", transactionResponse.hash);
    } catch (error) {
      console.error("Došlo je do greške:", error);
    }
  };

  function deleteAllCookies() {
    const cookies = document.cookie.split(";");

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    }
}




const connectToWallet = async () => {
  
  if (typeof window.ethereum !== 'undefined') {
    try {
      
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new BrowserProvider(window.ethereum);
      const signer = await provider.getSigner(); 
      const account = await signer.getAddress(); 
      
      if (account) {
        setProvider(provider);
        setSigner(signer);
        setAccount(account);
        setIsConnected(true);
        console.log("Wallet connected with address:", account);
        return;
      } else {
        throw new Error("Failed to retrieve account address.");
      }
    } catch (error) {
      console.error("Error connecting to wallet extension:", error);
      setIsConnected(false);
    }
  }

  // WalletConnect
  try {
    const ethereumProvider = await EthereumProvider.init({
      projectId: '',
      metadata: {
        name: 'SolidVote',
        description: 'Web3Modal Example',
        url: '',
        icons: ['https://avatars.githubusercontent.com/u/37784886']
      },
      showQrModal: true,
      chains: [84532], // Base Sepolia testnet
      rpc: {
        84532: '' // Your RPC URL
      }
    });

    await ethereumProvider.connect();

    const wrappedProvider = new BrowserProvider(ethereumProvider);

    const tempSigner = await wrappedProvider.getSigner();
    const tempAccount = await tempSigner.getAddress(); 

    if (tempAccount) {
      setProvider(wrappedProvider);
      setSigner(tempSigner);
      setAccount(tempAccount);
      setIsConnected(true);
      console.log("Wallet connected with address:", tempAccount);
    } else {
      throw new Error("Failed to retrieve account address.");
    }
  } catch (error) {
    console.error("Error connecting to wallet:", error);
    setIsConnected(false);
  }
};


  useEffect(() => {
    if (!provider) {
        console.error("Provider is not set.");
        setProviderError(true); 
    } else {
        setProviderError(false);
        console.error("Provider issss  set.");

    }
}, [provider]); 

  const handleAccountsChanged = (accounts) => {
    if (accounts.length > 0) {
      setAccount(accounts[0]);
      setIsConnected(true);
    } else {
      setIsConnected(false);
      setAccount(null);
    }
  };

  const disconnectMetamask = () => {
    setIsConnected(false);
    setAccount(null);

    console.log("Metamask is disconnected from the app. Please also disconnect in MetaMask if needed.");
  };

  const handleButton = () => {
    if (isConnected) {
      disconnectMetamask();
    } else {
      connectToWallet();
    }
  };

  function formatAddress(account) {
    return `${account.substring(0, 4)}...${account.substring(account.length - 4)}`;
  }

  return (
   
    <Router basename="/SolidVote">
      <div className="App">
      <header className="App-logo">
  <img src={logobeli} style={{ height: '70px', width: 'auto', paddingRight:'10px' }} alt="Logo" />
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
    {isConnected ? (
      <>
        <Chip
          label={formatAddress(account)} 
          color="primary"
          onClick={() => setShowAddressPopup(true)} 
          sx={{
            height: '46px',
            marginRight: '10px',
            backgroundColor: '#ff007a', 
            color: 'white',
            borderRadius: '12px',
            fontSize: '0.875rem',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: '#E6007E', 
            },
          }}
        />

        {showAddressPopup && (
          <div
            ref={addressPopupRef}
            style={{
              position: 'absolute',
              top: '70px', 
              right: '10px',
              backgroundColor: 'white',
              padding: '15px',
              borderRadius: '8px',
              boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
              width: '280px',
              zIndex: 1000,
            }}
          >
            {console.log("Account in popup:", account)} {/* Log the account in popup */}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontWeight: 'bold', color: 'black', fontSize: '1rem' }}>Your Address:</span>
              <CloseIcon
                onClick={() => setShowAddressPopup(false)}
                style={{ cursor: 'pointer', color: '#ff007a' }}
              />
            </div>
            <p style={{ wordBreak: 'break-all', marginTop: '10px', color: 'black', fontSize: '0.9rem' }}>
              {account}
            </p>
          </div>
        )}

        <Button
          variant="contained"
          onClick={openTokenForm}
          sx={{
            height: '56px',
            minWidth: '120px',
            maxWidth: '200px',
            fontSize: '1rem',
            fontWeight: 'bold',
            borderRadius: '12px',
            backgroundColor: '#ff007a', 
            color: 'white',
            '&:hover': {
              backgroundColor: '#E6007E', 
            },
          }}
        >
          Get SOV Tokens
        </Button>
      </>
    ) : (
     
      <Button
        variant="contained"
        onClick={connectToWallet}
        sx={{
          height: '56px',
          minWidth: '120px',
          maxWidth: '200px',
          fontSize: '1rem',
          fontWeight: 'bold',
          borderRadius: '12px',
          backgroundColor: '#ff007a', 
          color: 'white',
          '&:hover': {
            backgroundColor: '#E6007E', 
          },
        }}
      >
        Connect
      </Button>
    )}

    {showTokenForm && (
      <div
        ref={formRef}
        style={{
          position: 'absolute',
          top: '100px',
          right: '10px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.1)',
          width: '300px', 
        }}
      >
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleInputChange}
          style={{
            width: 'calc(100% - 20px)', 
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px', 
          }}
        />
        {formErrors.email && <p style={{ color: 'red' }}>{formErrors.email}</p>}

        <input
          type="text"
          name="address"
          placeholder="Wallet Address"
          value={formData.address}
          onChange={handleInputChange}
          style={{
            width: 'calc(100% - 20px)',
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px',
          }}
        />
        {formErrors.address && <p style={{ color: 'red' }}>{formErrors.address}</p>}

        <input
          type="text"
          name="companyName"
          placeholder="Company Name"
          value={formData.companyName}
          onChange={handleInputChange}
          style={{
            width: 'calc(100% - 20px)', 
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px', 
          }}
        />
        {formErrors.companyName && <p style={{ color: 'red' }}>{formErrors.companyName}</p>}

        <input
          type="text"
          name="usage"
          placeholder="Usage"
          value={formData.usage}
          onChange={handleInputChange}
          style={{
            width: 'calc(100% - 20px)', 
            padding: '10px',
            marginBottom: '10px',
            borderRadius: '5px',
            border: '1px solid #ccc',
            marginRight: '10px', 
          }}
        />
        {formErrors.usage && <p style={{ color: 'red' }}>{formErrors.usage}</p>}

        <Button
          onClick={handleSendToTelegram}
          variant="contained"
          sx={{
            width: '100%',
            fontSize: '0.875rem',
            fontWeight: 'bold',
            color: 'white',
            borderRadius: '8px',
            backgroundColor: '#ff007a',
            '&:hover': {
              backgroundColor: '#E6007E',
            },
          }}
        >
          Send Request
        </Button>
      </div>
    )}
  </div>
</header>

  
        {/* Added Routes for navigation */}
        <Routes>
          {/* Home Route */}
          <Route
            path="/"
            element={
              isConnected ? (
                adminInstanceAddress ? (
                  <AdminPanel
                    provider={provider}
                    signer={signer}
                    voters={voters}
                    SlanjaNaAdreseGlasace={posaljiEther}
                    postaviKolicinuZaSlanje={postaviKolicinuZaSlanje}
                    redoviGlasaca={redoviGlasaca}
                    updateRedoviGlasaca={updateRedoviGlasaca}
                    kolicinaZaSlanje={kolicinaZaSlanje}
                    tokenAbi={tokenAbi}
                    tokenAddress={tokenAddress}
                    contractAddress={contractAddress}
                  />
                ) : voterInstanceAddress && voterInstanceAddress !== '' ? (
                  <Connected
                    provider={provider}
                    signer={signer}
                    account={account}
                    voterInstanceAddress={voterInstanceAddress}
                  />
                ) : (
                  <LandingPage
                    createInstance={createUserVotingInstance}
                    setVoterInstanceAddress={setVoterInstanceAddress}
                    provider={provider}
                  />
                )
              ) : (
                <Login connectWallet={connectToWallet} provider={provider} />
              )
            }
          />
  
          {/* Vote Route */}
          <Route
  path="/vote/:id"
  element={
    <VotePage
      provider={provider}
      setVoterInstanceAddress={setVoterInstanceAddress}
      connectToWallet={connectToWallet}
      isConnected={isConnected}
      account={account}
    />
  }
          />
        </Routes>
      </div>
    </Router>
    
  );
  
}

export default App;
