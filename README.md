# Ovo je frontend deo SolidVote aplikacije, aplicaciju mozete probati na  https://solidvotedapp.com/SolidVote , dok se dodatne informacije o samoj aplikaciji i problemu koji resava nalaze na https://solidvotedapp.com
 Trenutno je na Base sepolia testnet-u, i u procesu je testiranja , sve sugestije su dobrodosle na office@solidvotedapp.com

# Ako neko želi da lokalno testira kod, prvo je potrebno da:
 1. Okaci pametne ugovore na mrezu po izboru(pametni ugovori su pisani u solidity-ju, dakle Eth, Base, Polygon..ect) vise o ovome 
  https://github.com/FilipJoksimovic29/SolidVote-smart-contracts-pre-production-version.git. 
 2. Nakon toga u constant fajlu potrebno je uneti adresu ugovora i abi za svaki od tri ugovora koja se koriste
 3. Unutar App.js je potrebno uneti project id i rpc (WalletConnect i Alchemy npr.) 
 4. Kako bi se instalirale potrebne zavisnosti nakon instaliranog node.js-a pokrenuti npm install, ako ima problema, obrtiti se chatgpt-ju :)
    
Ovo su neki od krupnijih koraka, pretpostavljam da neko ima malo iskustva.

# Tehnicki detalji:
Aplikacija je piana u Reactu, sastavljena je od pet glavnih komponenti i App.js fajla.
Login je komponenta koja se prva otvara nakon pokretanje aplikacije, nakon povezivanja sa walletom korisnika, prelazi se na LandingPage komponentu
Komponneta AdminPanel zaduzena je za prikazivanje podesavanja glasacke sesije
Komponenta Connected je zaduzena za samo glasanje
Komponenta VotePage je zaduzena za preusmeravanje glasaca koji je seknirao QR kod na sesiju glasanja kojoj on pripada
App.js sadrzi neke od kljucnih funkcija kao sto su povezivanje walleta ili slanje Eth-a glasacima 

# ENG

# This is the frontend part of the SolidVote application. You can try the app at https://solidvotedapp.com/SolidVote, and additional information about the application and the problem it solves can be found at https://solidvotedapp.com.
Currently, it is on the Base Sepolia testnet and is in the testing phase. Any suggestions are welcome at office@solidvotedapp.com.

# If someone wants to test the code locally, they first need to:
Deploy the smart contracts to a network of their choice (the smart contracts are written in Solidity, so Eth, Base, Polygon, etc.). For more information, visit
https://github.com/FilipJoksimovic29/SolidVote-smart-contracts-pre-production-version.git.
Then, in the constants file, input the contract address and ABI for each of the three contracts being used.
In App.js, input the project ID and RPC (e.g., WalletConnect and Alchemy).
To install the required dependencies, after installing Node.js, run npm install. If you encounter any issues, feel free to ask ChatGPT. 😊
These are some of the larger steps, assuming the person has some experience.

# Technical details:
The application is written in React and consists of five main components and the App.js file.
Login is the component that opens first after launching the application. After connecting with the user's wallet, it moves to the LandingPage component.
The AdminPanel component is responsible for displaying voting session settings.
The Connected component is responsible for the voting process itself.
The VotePage component redirects voters who scanned the QR code to the voting session they belong to.
App.js contains some of the key functions, such as connecting to a wallet or sending ETH to voters.




