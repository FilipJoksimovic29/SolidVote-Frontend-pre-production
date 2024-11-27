import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Connected from './Connected';

function VotePage({ provider, setVoterInstanceAddress, connectToWallet, isConnected, account }) {
  const { id } = useParams();
  const [voterInstanceAddress, setLocalVoterInstanceAddress] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkConnectionAndFetch() {
      if (!isConnected) {
        try {
          await connectToWallet();
        } catch (error) {
          console.error('Error connecting wallet:', error);
          setLoading(false);
          return;
        }
      }
      await fetchVoterInstanceAddress();
    }

    async function fetchVoterInstanceAddress() {
      try {
        const response = await fetch(``, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
          console.log(data);
        if (response.ok) {
          const { voterInstanceAddress } = data;
          setLocalVoterInstanceAddress(voterInstanceAddress);
          setVoterInstanceAddress(voterInstanceAddress); // Update in App state if needed
        } else {
          console.error('Error fetching voter instance address:', data.error);
        }
      } catch (error) {
        console.error('Network error:', error);
      } finally {
        setLoading(false);
      }
    }

    checkConnectionAndFetch();
  }, [id, setVoterInstanceAddress, isConnected]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!voterInstanceAddress) {
    return <div>Invalid session ID or voting session not found.</div>;
  }

  return (
    <Connected
      provider={provider}
      voterInstanceAddress={voterInstanceAddress}
      account={account}
    />
  );
}

export default VotePage;
