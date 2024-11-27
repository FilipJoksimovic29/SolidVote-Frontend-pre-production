/* global BigInt */
import React, { useState,useEffect,useMemo } from "react";
import { contractAbi } from '../Constant/constant';
import { Container, Box, Grid,Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton, TextField, Typography } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import InputSlider from './Slider'; 
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import QRCode from 'qrcode.react';
import { Contract, formatEther, parseEther } from 'ethers';


const AdminPanel = ({ provider, signer, voters, postaviKolicinuZaSlanje,  updateRedoviGlasaca ,kolicinaZaSlanje, tokenAbi,tokenAddress,contractAddress}) => {
  
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const tableRef = React.useRef(null);
    const [votingtitle, setVotingTitle] = useState("");  
    const [unosKorisnika, setUnosKorisnika] = useState(''); 
    const [isEditing, setIsEditing] = useState(false);
    const [redoviOpcijaZaGlasanje, setRedoviOpcijaZaGlasanje] = useState([{ tekst: '' }]); 
    const [redoviGlasaca, setRedoviGlasaca] = useState([ 
        { tekst: '', broj: '' }
    ]);
    const [isVotingFinished, setisVotingFinished] = useState();
    const [inputCandidates, setInputCandidates] = useState("");
    const [loading, setLoading] = useState(false);
    const [votingDuration, setVotingDuration] = useState("30"); 
    const [candidates, setCandidates] = useState([]); 
    const handleSliderChange = (newValue) => {
      setVotingDuration(newValue); 
    };
    const [uniqueID, setUniqueID] = useState('');
    const [remainingTime, setRemainingTime] = useState('');
    const [showResults, setShowResults] = useState(false);
    const [gasAmountForVote, setGasAmountForVote] = useState(0);
    const backgroundStyle = {
        backgroundImage: `url('/images/adminBackground.jpg')`,
        backgroundSize: 'cover', // Pokriva celu pozadinu
        backgroundPosition: 'center', // Centrira sliku
        height: '100vh', // Visina pozadine
        width: '100vw' // Širina pozadine
    };
    const [action, setAction] = useState("");
    const handleInputCandidatesChange = (e) => {
        setInputCandidates(e.target.value);
    };

    const handleVotingDurationChange = (e) => {
        setVotingDuration(e.target.value);
    };
    const frontendBaseUrl = ''; // Replace with your actual local testing URL
    const qrCodeValue = `${frontendBaseUrl}/${uniqueID}`;

    const handleVotingTitleChange = (e) => {
        setVotingTitle(e.target.value);
        console.log(votingtitle);
    };
    const formattedTime = useMemo(() => {
      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;
      return `${hours}h ${minutes}m ${seconds}s`;
  }, [remainingSeconds]);
  
  const downloadQR = () => {
    const canvas = document.getElementById("qrCodeEl");
    const pngUrl = canvas.toDataURL("image/png");
    let downloadLink = document.createElement("a");
    downloadLink.href = pngUrl;
    downloadLink.download = "QRCode.png";
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
};


async function getVotingTitle() {
  if (!contractAddress) return;

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const contractInstance = new Contract(contractAddress, contractAbi, signer);

  try {
    const title = await contractInstance.getVotingTitle.staticCall();

    console.log(title);
    setVotingTitle(title);
    return title;
  } catch (error) {
    console.error('Error fetching voting title:', error);
  }
}



async function getRemainingTimeFromContract() {
  if (!contractAddress) return 0; // Return 0 if contractAddress is null

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const contractInstance = new Contract(contractAddress, contractAbi, signer);

  try {
      const timeInSeconds = await contractInstance.getRemainingTime.staticCall();
      console.log("Time from contract:", timeInSeconds); // Log fetched time
      return parseInt(timeInSeconds.toString(), 10);
  } catch (error) {
      console.error('Error fetching remaining time:', error);
      return 0;
  }
}

  
async function syncTimeWithContract() {
  const timeInSeconds = await getRemainingTimeFromContract();
  console.log("Fetched time from contract:", timeInSeconds);
  if (Math.abs(timeInSeconds - remainingSeconds) > 120) {
      console.log("Significant time difference detected. Syncing time...");
      setRemainingSeconds(timeInSeconds);
  }
}



async function getCurrentStatus() {
  if (!contractAddress) return; // Check if contractAddress is not null

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const contractInstance = new Contract(contractAddress, contractAbi, signer);

  try {
      const status = await contractInstance.getVotingStatus.staticCall();
      console.log("Current Status:", status);
      setisVotingFinished(status);
  } catch (error) {
      console.error('Error fetching current status:', error);
  }
}



async function getCandidates() {
  if (!contractAddress) return []; 

  await provider.send("eth_requestAccounts", []);
  const signer = await provider.getSigner();

  const contractInstance = new Contract(contractAddress, contractAbi, signer);

  try {
      const candidatesList = await contractInstance.getAllVotesOfCandidatesAdmin.staticCall();
      return candidatesList.map((candidate, index) => ({
          index: index,
          name: candidate.name,
          voteCount: candidate.voteCount.toString(),
      }));
  } catch (error) {
      console.error('Error fetching candidates:', error);
      return [];
  }
}


    
    const fetchCandidates = async () => {
        setLoading(true);
        try {
            const contract = new Contract(contractAddress, contractAbi, signer);
            const candidatesArray = await contract.getAllVotesOfCandidatesAdmin();
            console.log(candidatesArray);
            setCandidates(candidatesArray.map((candidate, index) => ({
                index,
                name: candidate.name,
                voteCount: candidate.voteCount.toNumber(), 
            })));
        } catch (error) {
            console.error("Error fetching candidates:", error);
        }
        setLoading(false);
    };




    const fetchUniqueID = async () => {
      try {
          if (!contractAddress) return;
  
          await provider.send("eth_requestAccounts", []);
          const signer = await provider.getSigner();
  
          const contract = new Contract(contractAddress, contractAbi, signer);
  
          const fetchedID = await contract.getUniqueID.staticCall();
          setUniqueID(fetchedID.toString()); 
      } catch (error) {
          console.error('Failed to fetch the unique ID:', error);
      }
  };

useEffect(() => {
  const fetchGasPrice = async () => {
    if (provider) {
      try {
        const feeData = await provider.getFeeData();
        let gasPrice = feeData.gasPrice;

        // If gasPrice is null, use maxFeePerGas
        if (!gasPrice) {
          gasPrice = feeData.maxFeePerGas;
        }

        if (gasPrice) {
          const multiplier = 79441n;
          const bufferMultiplier = 120n;
          const divisor = 100n;

          const gasPriceInWei = gasPrice * multiplier;
          const gasPriceWithBuffer = (gasPriceInWei * bufferMultiplier) / divisor;

          const gasPriceInEth = formatEther(gasPriceWithBuffer.toString());

          postaviKolicinuZaSlanje(gasPriceInEth);
        } else {
          console.error('Unable to fetch gas price.');
        }
      } catch (error) {
        console.error('Error fetching gas price:', error);
      }
    }
  };

  fetchGasPrice();
}, [provider]);


useEffect(() => {
  if (kolicinaZaSlanje !== "0") { // Provera da li je količina različita od "0" (inicijalna vrednost)
      console.log("Ažurirana količina za slanje:", kolicinaZaSlanje);
  }
}, [kolicinaZaSlanje]);

useEffect(() => {
 console.log(kolicinaZaSlanje);
  
}, []);

useEffect(() => {
  const countdown = setInterval(() => {
    setRemainingSeconds(prevSeconds => prevSeconds > 0 ? prevSeconds - 1 : 0);
  }, 1000);

  return () => clearInterval(countdown);
}, []);



useEffect(() => {
  const interval = setInterval(syncTimeWithContract, 60000); // Sinhronizacija na svakih 90 sekundi
  return () => clearInterval(interval);
}, [remainingSeconds, contractAddress]); 

    
    
    useEffect(() => {
      async function fetchData() {
          try {
              const title = await getVotingTitle(); 
              setVotingTitle(title);
  
              const time = await getRemainingTimeFromContract();
              console.log(time); 
              setRemainingSeconds(time);
  
              const candidatesList = await getCandidates(); 
              setCandidates(candidatesList);

             const votingStatus = await getCurrentStatus();
             setisVotingFinished(votingStatus);
             console.log("GGGGGGGGGGGG"+isVotingFinished);

              fetchUniqueID();
              getCurrentStatus();
          } catch (error) {
              console.error("Failed to fetch data:", error);
          }
      }
  
      fetchData();
  }, [contractAddress]); 
    
    const startVoting = async () => {
      setAction("starting");
      try {
          const durationInMinutes = parseInt(votingDuration); 
          if (isNaN(durationInMinutes) || durationInMinutes <= 0) {
              alert("Please enter a valid positive number for voting duration.");
              return;
          }
  
          const candidateNames = redoviOpcijaZaGlasanje.filter(row => row.tekst.trim()).map(row => row.tekst);
          const voterAddresses = redoviGlasaca.filter(row => row.tekst.trim()).map(row => row.tekst);
          const voterPoints = redoviGlasaca.filter(row => row.broj.trim()).map(row => row.broj);
  
          if (candidateNames.length === 0 || voterAddresses.length === 0) {
              alert("Please ensure there are candidates and voters before starting the vote.");
              return;
          }
  
          const tokenContract = new Contract(tokenAddress, tokenAbi, signer);
          const feeAmountEther = "10"; 
  
          const approveTx = await tokenContract.approve(contractAddress, parseEther(feeAmountEther));
          await approveTx.wait(); 
          const kolicinaZaSlanjeWei = parseEther(kolicinaZaSlanje.toString());
          const totalAmountForBatch = BigInt(voterAddresses.length) * kolicinaZaSlanjeWei;

          console.log(totalAmountForBatch);
          const contract = new Contract(contractAddress, contractAbi, signer);
          const transaction = await contract.startVoting(
              durationInMinutes,
              voterAddresses,
              voterPoints,
              candidateNames,
              votingtitle,
              showResults,
              voterAddresses,
              kolicinaZaSlanjeWei,
            totalAmountForBatch,
            { value: totalAmountForBatch });
  
          await transaction.wait();
          alert("Voting has started.");
      } catch (error) {
          console.error("Error starting the voting:", error);
          alert("Failed to start voting. Make sure you have enough tokens and have approved them for burning.");
      }
  };
        
    const stopVoting = async () => {
        setAction("stoping");
        setLoading(true);
        try {
            const contract =  new Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.stopVoting();
            await transaction.wait();
            alert("Voting has been stopped.");
        } catch (error) {
            console.error("Error stopping the voting:", error);
            alert("Failed to stop voting.");
        }
        setLoading(false);
    };
    const clearCandidates = async () => {
        setAction("clearing");
        setLoading(true);
        try {
            const contract = new Contract(contractAddress, contractAbi, signer);
            const transaction = await contract.clearCandidates();
            await transaction.wait();
            alert("Candidates cleared successfully.");
        } catch (error) {
            console.error("Error clearing candidates:", error);
            alert("Failed to clear candidates.");
        }
        setLoading(false);};

        const handleFinishEditing = (event) => {
            if (event.type === 'blur' || (event.key === 'Enter')) {
                setIsEditing(false);
                setVotingTitle(event.target.value);
            }
        };
    
        const handleTextChange = (index, event) => {
            setRedoviOpcijaZaGlasanje(currentRows => {
                let newRows = [...currentRows];
                newRows[index].tekst = event.target.value;
        
                // Ako se unosi tekst u poslednji red, i taj tekst nije prazan, dodaj novi prazan red
                if (index === currentRows.length - 1 && event.target.value.trim()) {
                    newRows.push({ tekst: '' });
                } else if (index === currentRows.length - 2 && !event.target.value.trim() && !newRows[currentRows.length - 1].tekst.trim()) {
                    // Ako je prethodni red prazan, a unosi se prazan tekst u trenutni poslednji red, ukloni taj poslednji red
                    newRows.pop();
                }
        
                return newRows.filter(row => row.tekst.trim() || newRows.indexOf(row) === newRows.length - 1); // Uvek zadrži barem jedan red
            });
        };
        
        const handleRemoveRow = (indexToRemove) => {
            setRedoviOpcijaZaGlasanje(currentRows => {
                const newRows = currentRows.filter((_, index) => index !== indexToRemove);
        
                // Ako su svi redovi obrisani, osiguravamo da postoji barem jedan prazan red
                if (newRows.length === 0) {
                    newRows.push({ tekst: '' });
                }
               
                return newRows;
                
            });
        };
    
       
useEffect(() => {
    console.log(redoviOpcijaZaGlasanje);
}, [redoviOpcijaZaGlasanje]);


useEffect(() => {
  console.log(votingDuration);
}, [votingDuration]);


useEffect(() => {
    console.log(redoviGlasaca);
}, [redoviGlasaca]);
        
        
        const handleTextChangeGlasaci = (index, event) => {
            setRedoviGlasaca(currentRows => {
                let newRows = [...currentRows];
                newRows[index].tekst = event.target.value;
                
                // Dodaj novi red ako se kuca u poslednjem i nije prazan
                if (index === currentRows.length - 1 && event.target.value.trim()) {
                    newRows.push({ tekst: '', broj: '' });
                }
    
                // Ukloni prethodni prazan red ako se trenutni prazni
                if (index === currentRows.length - 2 && !event.target.value.trim() && !newRows[currentRows.length - 1].tekst.trim()) {
                    newRows.pop();
                }
                let updatedRedoviGlasaca = [...redoviGlasaca];
                updatedRedoviGlasaca[index].tekst = event.target.value;
                
                // Koristi prosleđenu funkciju za ažuriranje redoviGlasaca u App komponenti
                updateRedoviGlasaca(updatedRedoviGlasaca);
                return newRows;
            });
        };
    
       

        const handleNumberChangeGlasaci = (index, event) => {
            setRedoviGlasaca(currentRows => {
                const newRows = [...currentRows];
                newRows[index].broj = event.target.value;
                return newRows;
            });
        };
    
        const handleRemoveRowGlasaci = (index) => {
            setRedoviGlasaca(currentRows => {
                const newRows = currentRows.filter((_, i) => i !== index);
                if (newRows.length === 0) {
                    newRows.push({ tekst: '', broj: '' });
                }
                return newRows;
            });
        };
    
    
        const handleSeeResultsChange = (e) => {
          const checked = e.target.checked;
          setShowResults(checked);
          
      };
     
    
  

        
      return (
        <Box
          sx={{
            backgroundColor: '#1c1c1c',
            minHeight: '100vh',
            padding: { xs: '10px', sm: '20px' },
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            paddingTop: { xs: '100px', sm: '20px' }, // Push content down on mobile
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: { xs: '100%', sm: '90%', md: '70%' },
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              background: '#1c1c1c',
              borderRadius: '8px',
              padding: { xs: '10px', sm: '20px' },
              marginBottom: '0px',
              overflowX: 'auto',
              transform: 'scale(0.85)',
              transformOrigin: 'top center',
            }}
          >
            <Box
              sx={{
                width: '100%',
                maxWidth: '500px',
                margin: '0 auto',
              }}
            >
              <Typography
                variant="h4"
                sx={{
                  color: 'white',
                  marginBottom: { xs: '40px', sm: '60px' }, // Increased marginBottom
                  marginTop: { xs: '20px', sm: '40px' },
                  textAlign: 'center',
                  fontWeight: 'bold',
                  letterSpacing: '0.1em',
                  fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                ADMIN PANEL
              </Typography>
            </Box>
      
            <Container
              maxWidth="lg"
              sx={{
                marginBottom: '50px',
                background: '#222329',
                borderRadius: '11px',
                boxShadow: 6,
                padding: { xs: '10px', sm: '20px' },
                paddingTop: '30px', // Added paddingTop
                maxWidth: { xs: '100%', sm: '90%', md: '70%' }, // Make wider on mobile (xs)
                paddingLeft: { xs: '20px', sm: '20px' }, // Add more padding on the sides for mobile
                paddingRight: { xs: '20px', sm: '20px' },
              }}
            >
              <TextField
                label="Enter voting topic here"
                variant="outlined"
                value={votingtitle}
                onChange={handleVotingTitleChange}
                disabled={loading}
                sx={{
                  '& .MuiInputLabel-root': { color: 'white' },
                  '& .MuiOutlinedInput-input': { color: 'white' },
                  minWidth: '250px',
                  marginBottom: '40px', // Increased marginBottom
                  marginTop: '20px',
                  width: '100%',
                  maxWidth: '250px', // Less wide and centered
                  margin: '0 auto',
                  paddingBottom: '30px',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': { borderColor: '#BDBDBD' },
                    '&:hover fieldset': { borderColor: '#9E9E9E' },
                    '&.Mui-focused fieldset': { borderColor: '#ff007a' },
                  },
                  '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' },
                }}
              />
      
              {/* Voting options */}
              {redoviOpcijaZaGlasanje.map((opcija, index) => (
                <Grid
                  container
                  spacing={0.5} // Reduced spacing
                  alignItems="center"
                  sx={{ marginBottom: '10px' }}
                  key={index}
                >
                  <Grid item xs={11}>
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={`Option ${index + 1}`}
                      value={opcija.tekst}
                      onChange={(event) => handleTextChange(index, event)}
                      sx={{
                        '& .MuiInputLabel-root': { color: 'white' },
                        '& .MuiOutlinedInput-input': { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#BDBDBD' },
                          '&:hover fieldset': { borderColor: '#9E9E9E' },
                          '&.Mui-focused fieldset': { borderColor: '#ff007a' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' },
                        '& input': {
                          fontSize: '1.1rem',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={1}>
                    {index !== redoviOpcijaZaGlasanje.length - 1 ? (
                      <IconButton
                        onClick={() => handleRemoveRow(index)}
                        sx={{ color: '#f3e5f5' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : (
                      <Box sx={{ width: 44, height: 48 }}></Box>
                    )}
                  </Grid>
                </Grid>
              ))}
            </Container>
      
            <Container
              maxWidth="lg"
              sx={{
                marginBottom: '35px',
                background: '#222329',
                borderRadius: '11px',
                boxShadow: 6,
                padding: { xs: '10px', sm: '20px' },
                paddingTop: '30px', // Added paddingTop
                maxWidth: { xs: '100%', sm: '90%', md: '70%' }, // Make wider on mobile (xs)
                paddingLeft: { xs: '20px', sm: '20px' }, // Add more padding on the sides for mobile
                paddingRight: { xs: '20px', sm: '20px' },
              }}
            >
              <Typography
                variant="h5"
                sx={{
                  color: 'white',
                  marginBottom: '30px', // Increased marginBottom
                  textAlign: 'center',
                  fontWeight: '500',
                  fontFamily: "'Roboto', sans-serif",
                  fontSize: { xs: '1.5rem', sm: '2rem' },
                }}
              >
                Enter addresses of eligible voters here
              </Typography>
              {redoviGlasaca.map((opcija, index) => (
                <Grid
                  container
                  spacing={0.5} // Reduced spacing
                  alignItems="center"
                  sx={{ marginBottom: '10px' }}
                  key={index}
                >
                  <Grid item xs={9}> {/* Address field takes more width */}
                    <TextField
                      fullWidth
                      variant="outlined"
                      label={`Voter ${index + 1}`}
                      value={opcija.tekst}
                      onChange={(event) => handleTextChangeGlasaci(index, event)}
                      sx={{
                        '& .MuiInputLabel-root': { color: 'white' },
                        '& .MuiOutlinedInput-input': { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#BDBDBD' },
                          '&:hover fieldset': { borderColor: '#9E9E9E' },
                          '&.Mui-focused fieldset': { borderColor: '#ff007a' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' },
                        '& input': {
                          fontSize: '1.1rem',
                        },
                      }}
                    />
                  </Grid>
                  <Grid item xs={2}> {/* Number field takes less width */}
                    <TextField
                      variant="outlined"
                      label={`Number ${index + 1}`}
                      type="text"
                      value={opcija.broj}
                      onChange={(event) => handleNumberChangeGlasaci(index, event)}
                      InputProps={{
                        inputMode: 'numeric',
                        pattern: '[0-9]*',
                      }}
                      sx={{
                        '& .MuiInputLabel-root': { color: 'white' },
                        '& .MuiOutlinedInput-input': { color: 'white' },
                        '& .MuiOutlinedInput-root': {
                          '& fieldset': { borderColor: '#BDBDBD' },
                          '&:hover fieldset': { borderColor: '#9E9E9E' },
                          '&.Mui-focused fieldset': { borderColor: '#ff007a' },
                        },
                        '& .MuiInputLabel-root.Mui-focused': { color: '#ff007a' },
                        '& input': {
                          fontSize: '1.1rem',
                        },
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid item xs={1}>
                    {index !== redoviGlasaca.length - 1 ? (
                      <IconButton
                        onClick={() => handleRemoveRowGlasaci(index)}
                        sx={{ color: '#f3e5f5' }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    ) : (
                      <Box sx={{ width: 42, height: 48 }}></Box>
                    )}
                  </Grid>
                </Grid>
              ))}
            </Container>
      
            <Container
              maxWidth="lg"
              sx={{
                marginBottom: '15px',
                background: '#1c1c1c',
                borderRadius: '11px',
                padding: { xs: '10px', sm: '20px' },
                pt: '40px',
                pb: '40px',
                boxShadow: 0,
              }}
            >
              <Grid container spacing={2} alignItems="center">
                <Grid item xs={12} md={6}>
                  <Typography
                    variant="h5"
                    sx={{
                      color: 'white',
                      mb: 3,
                      fontSize: { xs: '1.5rem', sm: '2rem' },
                    }}
                  >
                    Voting duration (in minutes)
                  </Typography>
                  <Box sx={{ width: '100%', pr: { xs: 0, md: 2 } }}>
                    <InputSlider onSliderChange={handleSliderChange} />
      
                    <FormControlLabel
  control={
    <Checkbox
      sx={{
        color: 'white',
        '&.Mui-checked': {
          color: '#e60072',
        },
        '& svg': {
          fontSize: '2rem',
        },
        mt: { xs: '0px', sm: '30px' },
      }}
      checked={showResults}
      onChange={handleSeeResultsChange}
      name="showResults"
    />
  }
  label={
    <Typography
      className="label-text"
      sx={{
        fontSize: { xs: '1.2rem', sm: '1.4rem' },
        color: 'white',
        mt: { xs: '0px', sm: '30px' },
      }}
    >
      Allow voters to see current results
    </Typography>
  }
  sx={{
    mb: { xs: 1, sm: 2 },
    width: '100%',
    justifyContent: { xs: 'center', sm: 'flex-start' },  // Poravnaj na levo na desktopu
    alignItems: 'center',
    display: 'flex',
    ml: { sm: '40px' },  // Pomeri desno na desktopu
  }}
/>


                  </Box>
                </Grid>
                <Grid
                  item
                  xs={12}
                  md={6}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    pt: { xs: 0, md: 1.25 },
                    mt: { xs: '20px', md: 0 },
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 2,
                      alignItems: 'center',
                      pl: { xs: 0, md: 2 },
                    }}
                  >
                    {/* Start Voting Button */}
                    <Button
                      variant="contained"
                      onClick={startVoting}
                      disabled={loading}
                      sx={{
                        height: '65px',
                        width: '85%',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        mb: 2,
                        borderRadius: '12px',
                        backgroundColor: '#ff007a',
                        '&:hover': {
                          backgroundColor: '#463346',
                        },
                      }}
                    >
                      Start Voting
                    </Button>
                    {/* Stop Voting Button */}
                    <Button
                      variant="contained"
                      color="error"
                      onClick={stopVoting}
                      disabled={loading}
                      sx={{
                        height: '65px',
                        width: '85%',
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        borderRadius: '12px',
                        backgroundColor: '#CCC',
                        color: 'black',
                        '&:hover': {
                          backgroundColor: '#AAA',
                        },
                      }}
                    >
                      Stop Voting
                    </Button>
                  </Box>
                </Grid>
              </Grid>
            </Container>
      
            <Box
              sx={{
                width: '100%',
                maxWidth: '90%',
                display: 'flex',
                justifyContent: 'center',
                color: 'white',
                fontSize: { xs: '1.4rem', sm: '2rem' },
                mb: '20px',
                fontFamily: 'Roboto, sans-serif',
                textAlign: 'center',
              }}
            >
              {votingtitle}
            </Box>
      
            {/* Table */}
            <Box
              sx={{
                width: '100%',
                maxWidth: '95%',
                display: 'flex',
                justifyContent: 'center',
                color: '#f7f7f7',
                boxShadow: 6,
                overflowX: 'auto',
              }}
            >
              <TableContainer
                component={Paper}
                sx={{
                  background: '#f7f7f7',
                  borderRadius: '8px',
                  boxShadow: 6,
                  padding: { xs: '10px', sm: '20px' },
                  width: '100%',
                }}
              >
                <Table
                  sx={{
                    minWidth: 650,
                    fontSize: '1.2rem', // Reduced font size
                  }}
                >
                  <TableHead>
                    <TableRow>
                      <TableCell
                        align="center"
                        sx={{ fontSize: '1.1rem', color: 'black' }}
                      >
                        Index
                      </TableCell>
                      <TableCell style={{ padding: 0, width: 5 }} />
                      <TableCell
                        align="center"
                        sx={{ fontSize: '1.1rem', color: 'black' }}
                      >
                        Candidate Name
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{ fontSize: '1.1rem', color: 'black' }}
                      >
                        Vote Count
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody
                    sx={{
                      '& .MuiTableRow-root:nth-of-type(odd)': {
                        backgroundColor: '#e4c4f2',
                      },
                      '& .MuiTableRow-root:nth-of-type(even)': {
                        backgroundColor: '#f7f7f7',
                      },
                    }}
                  >
                    {candidates.map((candidate, index) => (
                      <TableRow key={index}>
                        <TableCell
                          align="center"
                          sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}
                        >
                          {index}
                        </TableCell>
                        <TableCell style={{ padding: 0, width: 60 }} />
                        <TableCell
                          align="center"
                          sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}
                        >
                          {candidate.name}
                        </TableCell>
                        <TableCell
                          align="center"
                          sx={{ fontSize: '1.1rem', whiteSpace: 'nowrap' }}
                        >
                          {candidate.voteCount}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
      
            <Box
              sx={{
                width: '100%',
                maxWidth: '90%',
                display: 'flex',
                justifyContent: 'center',
                color: 'white',
                fontSize: { xs: '1.4rem', sm: '2rem' },
                mb: '30px',
                mt: '20px',
                textAlign: 'center',
              }}
            >
              Remaining time: {formattedTime}
            </Box>
      
            {/* QR Code and Download Button */}
            <Box
              sx={{
                marginTop: '0px',
                marginBottom: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <QRCode
                id="qrCodeEl"
                value={qrCodeValue}
                size={200}
                level={'H'}
                includeMargin={true}
                style={{
                  border: '5px solid #ff007a',
                  borderRadius: '8px',
                  padding: '5px',
                }}
              />
              <Button
                onClick={downloadQR}
                variant="contained"
                sx={{
                  mt: 3,
                  padding: '12px 30px',
                  fontSize: '1.1rem',
                  backgroundColor: '#ff007a',
                  '&:hover': {
                    backgroundColor: '#e6006d',
                  },
                  color: 'white',
                  fontWeight: 'bold',
                }}
              >
                Download QR Code
              </Button>
            </Box>
          </Box>
      
          <TextField
            label="Unique ID"
            variant="outlined"
            value={uniqueID}
            InputProps={{
              readOnly: true,
            }}
            fullWidth
            margin="normal"
            sx={{
              '& label.Mui-focused': {
                color: '#ff007a',
              },
              '& .MuiInput-underline:after': {
                borderBottomColor: '#ff007a',
              },
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#BDBDBD',
                },
                '&:hover fieldset': {
                  borderColor: '#ff007a',
                },
                '&.Mui-focused fieldset': {
                  borderColor: '#ff007a',
                },
                '& input': {
                  color: 'white',
                },
                backgroundColor: '#1c1c1c',
              },
              '& .MuiInputLabel-root': {
                color: 'white',
              },
            }}
          />
        </Box>
      );
      
      
      
};
export default AdminPanel;




