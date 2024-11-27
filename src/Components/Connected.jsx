import React, { useState, useEffect, useMemo } from "react";
import { Radio, Table, TableBody, TableCell, TableContainer, Box, TableHead, TableRow, Paper, Button, Typography } from '@mui/material';
import { contractAbi } from '../Constant/constant';
import { Contract } from 'ethers';

const Connected = ({ account={account},voterInstanceAddress, provider  }) => {

    
    const [selectedCandidate, setSelectedCandidate] = useState('');
    const [remainingSeconds, setRemainingSeconds] = useState(0);
    const [votingTitle, setVotingTitle] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [providerError, setProviderError] = useState(false); // State za praćenje greške u provideru
    const [isVotingFinished, setIsVotingFinished] = useState();

    const handleRadioChange = (event) => {
        setSelectedCandidate(event.target.value);
    };
    const [hasVoted, setHasVoted] = useState(false);
    const [gasAmountForVote, setGasAmountForVote] = useState(0);


    const formattedTime = useMemo(() => {
        const hours = Math.floor(remainingSeconds / 3600);
        const minutes = Math.floor((remainingSeconds % 3600) / 60);
        const seconds = remainingSeconds % 60;
        return `${hours}h ${minutes}m ${seconds}s`;
    }, [remainingSeconds]);

    useEffect(() => {
        const countdown = setInterval(() => {
            setRemainingSeconds(prevSeconds => prevSeconds > 0 ? prevSeconds - 1 : 0);
        }, 1000);

        return () => clearInterval(countdown);
    }, []);

    useEffect(() => {
        const interval = setInterval(syncTimeWithContract, 60000); // Sync every minute
        return () => clearInterval(interval);
    }, [remainingSeconds, voterInstanceAddress]);

    async function getRemainingTimeFromContract() {
        if (!voterInstanceAddress) return 0;
    
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
    
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
    
        try {
          const timeInSeconds = await contractInstance.getRemainingTime.staticCall();
          console.log("Time from contract:", timeInSeconds);
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
    
    console.log("Voting Status:", isVotingFinished);


    useEffect(() => {
        const estimateVoteGas = async () => {
            if (!voterInstanceAddress || !provider) return;

            try {
                await provider.send("eth_requestAccounts", []);
                const signer = await provider.getSigner();
                const address = await signer.getAddress(); 
                const contract = new Contract(voterInstanceAddress, contractAbi, signer);

                const estimatedGas = await contract.vote.estimateGas(1, { from: address });
                setGasAmountForVote(estimatedGas.toString());
                console.log(`Estimated gas: ${estimatedGas.toString()}`);
            } catch (error) {
                console.error('Error estimating gas:', error);
                setGasAmountForVote('Estimation failed');
            }
        };

        estimateVoteGas();
    }, [voterInstanceAddress, provider, setGasAmountForVote]);
    
    
    

    useEffect(() => {
        async function fetchData() {
            try {
                const title = await getVotingTitle();
                setVotingTitle(title);
        
                const time = await getRemainingTimeFromContract();
                setRemainingSeconds(time);
        
                const candidatesList = await getCandidates();
                setCandidates(candidatesList);
    
                await getCurrentStatus();
                await checkIfUserHasVoted();
                await checkCanSeeResults();
               console.log(hasVoted+"AAAA");
            } catch (error) {
                console.error("Failed to fetch data:", error);
            }
        }
        
        if (provider) { fetchData();}
    }, [voterInstanceAddress]);

    async function getCurrentStatus() {
        if (!voterInstanceAddress) return;
    
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
    
        try {
          const status = await contractInstance.getVotingStatus.staticCall();
          setIsVotingFinished(!status);
        } catch (error) {
          console.error('Error fetching voting status:', error);
        }
      }
      

    

      async function checkCanSeeResults() {
        if (!voterInstanceAddress) return;
    
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
    
        try {
          const canSeeResults = await contractInstance.canSeeResults.staticCall();
          setShowResults(canSeeResults);
        } catch (error) {
          console.error('Error checking if can see results:', error);
        }
      }
    
      

      async function checkIfUserHasVoted() {
        if (!voterInstanceAddress) return;
    
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
    
        try {
          const hasVoted = await contractInstance.hasUserVoted.staticCall();
          setHasVoted(!hasVoted);
        } catch (error) {
          console.error('Error checking if user has voted:', error);
        }
      }
      
  
      async function getVotingTitle() {
        if (!voterInstanceAddress) return;
      
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
      
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
      
        try {
          const title = await contractInstance.getVotingTitle.staticCall();
      
          console.log(title);
          setVotingTitle(title);
          return title;
        } catch (error) {
          console.error('Error fetching voting title:', error);
        }
      }
      
    
    async function getRemainingTime() {
        if (!voterInstanceAddress) return; 
        await provider.send("eth_requestAccounts", []);
        const signer = provider.getSigner();
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
        const timeInSeconds = await contractInstance.getRemainingTime();
        const time = parseInt(timeInSeconds);
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = time % 60;

        return (`${hours}h ${minutes}m ${seconds}s`);
    }

    async function getCandidates() {
        if (!voterInstanceAddress) return [];
    
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
    
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
    
        try {
          const candidatesList = await contractInstance.getAllVotesOfCandidates.staticCall();
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
    
      async function vote(index) {
        if (!voterInstanceAddress) return;
    
        await provider.send("eth_requestAccounts", []);
        const signer = await provider.getSigner();
    
        const contractInstance = new Contract(voterInstanceAddress, contractAbi, signer);
    
        try {
          const tx = await contractInstance.vote(index);
          await tx.wait();
          checkIfUserHasVoted();
        } catch (error) {
          console.error('Error voting:', error);
        }
      }
    
      const voteClick = () => {
        if (!selectedCandidate) {
          console.error("No candidate selected.");
          return;
        }
        console.log("Selected candidate index: " + selectedCandidate);
        vote(parseInt(selectedCandidate, 10));
      };

    const backgroundStyle = {
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw'
    };

    return (
        <div style={backgroundStyle} className="connected-container">
        
        <Typography variant="h4" sx={{ color: 'white', marginBottom: '3px', textAlign: 'center',mt:'150px' }}>
            {votingTitle} 
        </Typography>
    
        <TableContainer 
    component={Paper} 
    sx={{  
        background: '#1e1f23',
        maxWidth: '70%', 
        margin: '20px auto', 
        overflowX: 'auto',
        boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
        borderRadius: '10px'
    }}
>
    <Table aria-label="candidates table" size="small"> 
        <TableHead sx={{backgroundColor:'#f7f7f7'}}>
            <TableRow>
                <TableCell align="center" sx={{ fontSize: '1.2rem', color:'black' }}>Index</TableCell>
                <TableCell align="center" sx={{ fontSize: '1.2rem', color:'black' }}>Candidate name</TableCell>
                <TableCell align="center" sx={{ fontSize: '1.2rem', color:'black' }}>Current Resaults</TableCell>
                <TableCell align="center" sx={{ fontSize: '1.2rem', color:'black' }}>Vote</TableCell>
            </TableRow>
        </TableHead>
        <TableBody sx={{
            '& .MuiTableRow-root': {
                '& td': {
                    padding: '6px', 
                    fontSize: '1.2rem',
                },
                '&:nth-of-type(odd)': {
                    backgroundColor: '#f3e5f5', 
                },
                '&:nth-of-type(even)': {
                    backgroundColor: '#f7f7f7', 
                },
            },
        }}>
            {candidates && candidates.map((candidate, index) => (
                <TableRow key={index}>
                    <TableCell align="center">{index + 1}</TableCell>
                    <TableCell align="center">{candidate.name}</TableCell>
                    <TableCell align="center">
                        {showResults ? candidate.voteCount : "Not available"}
                    </TableCell>
                    <TableCell align="center">
                        {!isVotingFinished && !hasVoted ? (
                            <Radio
                                checked={selectedCandidate === candidate.index.toString()}
                                onChange={handleRadioChange}
                                value={candidate.index.toString()}
                                name="radio-buttons"
                                sx={{ '& .MuiSvgIcon-root': { fontSize: '1.25rem', color: '#ff007a' } }}
                            />
                        ) : (
                            <Radio
                                checked={selectedCandidate === candidate.index.toString()}
                                value={candidate.index.toString()}
                                name="radio-buttons"
                                sx={{ '& .MuiSvgIcon-root': { fontSize: '1.25rem', color: '#D3D3D3' } }}
                                disabled
                            />
                        )}
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    </Table>
</TableContainer>



        <Typography variant="h6" sx={{fontWeight: '400', color: '#white', marginBottom: '5px', marginTop: '5px', textAlign: 'center' }}>
            Remaining Time: {formattedTime}
        </Typography>
        {!isVotingFinished  && !hasVoted && (
            <Button variant="contained" onClick={voteClick} sx={{
                marginTop: '10px',
                marginBottom: '20px',
                display: 'block',
                marginX: 'auto',
                fontSize: '1.5rem',
                fontWeight: 'bold',
                padding: '15px 30px',
                borderRadius: '16px',
                backgroundColor: '#ff007a',
                '&:hover': {
                    backgroundColor: '#463346',
                },
            }}>
                Vote
            </Button>
        )}
    </div>
);
};

export default Connected;

