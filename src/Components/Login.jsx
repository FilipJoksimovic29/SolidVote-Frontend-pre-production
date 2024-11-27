import React, { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { Typography, useMediaQuery, useTheme } from '@mui/material';
import Box from '@mui/material/Box';

const Login = (props) => {
    const [currentText, setCurrentText] = useState('');
    const [opacity, setOpacity] = useState(1);

    const texts = [
        "Welcome to First Decentralized Large Scale Voting Platform"
    ];

    useEffect(() => {
        let currentTextIndex = 0;
        setCurrentText(texts[currentTextIndex]);

        const changeText = () => {
            setOpacity(0);
            setTimeout(() => {
                currentTextIndex = (currentTextIndex + 1) % texts.length;
                setCurrentText(texts[currentTextIndex]);
                setOpacity(1);
            }, 1000);
        };

        const intervalId = setInterval(changeText, 4500);

        return () => clearInterval(intervalId);
    }, []);

    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    const backgroundStyle = {
        backgroundColor: '#1e1f23',
        height: '100vh',
        width: '100vw',
    };

    return (
        <div
            style={{
                ...backgroundStyle,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '400px',
            }}
            className="login-container"
        >
            <Typography
                sx={{
                    fontSize: { xs: '1.45rem', sm: '2.5rem', md: '3rem' },
                    fontWeight: '450',
                    color: 'white',
                    textAlign: 'center',
                    opacity: opacity,
                    transition: 'opacity 1s ease-in-out',
                    padding: { xs: '10px 20px', sm: '20px 60px' },
                    maxWidth: '100%',
                    margin: '0',
                    marginBottom: '10px',
                    fontFamily: 'Roboto, sans-serif',
                    display: 'block',
                    lineHeight: { xs: '1.5', sm: '1.4', md: '1.5' }, // Increased line height on mobile
                }}
            >
                {"Welcome to First Decentralized"}
                {isMobile ? <br /> : ' '}
                {"Large Scale Voting Platform"}
            </Typography>

            <Button
                variant="contained"
                onClick={props.connectWallet}
                sx={{
                    minHeight: { xs: '50px', sm: '70px' }, 
                    minWidth: { xs: '200px', sm: '250px' }, 
                    fontSize: { xs: '1rem', sm: '1.5rem' }, 
                    fontFamily: "'Roboto', sans-serif",
                    borderRadius: '12px',
                    fontWeight: '530',
                    backgroundColor: '#ff007a',
                    color: 'white',
                    textTransform: 'none',
                    mb: 2,
                    '&:hover': {
                        backgroundColor: '#311c31',
                    },
                }}
            >
                Connect Your Wallet
            </Button>
        </div>
    );
};

export default Login;
