# Ovo je frontend deo SolidVote aplikacije, aplicaciju mozete probati na  https://solidvotedapp.com/SolidVote , dok se dodatne informacije o samoj aplikaciji i problemu koji resava nalaze na https://solidvotedapp.com
# Trenutno je na Base sepolia testnet-u, i u procesu je testiranja , sve sugestije su dobrodosle na office@solidvotedapp.com

# Ovaj kod nije kod za produkciju i kao takvog odricem se bilo kakve odogovornosti.
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
