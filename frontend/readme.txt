Decentralized Voting App (Motoko + React + Vite)
Overview
This is a decentralized voting application built using Internet Computer's Motoko language for the backend and React with Vite for the frontend. It allows users to create polls, vote on them, view vote statistics, and delete polls—all stored on a decentralized canister.

Features
Create polls with multiple answer options.

Vote in polls (each principal can vote once).

View current results, including percentage breakdown.

Delete polls from the system (admin only or by implementation design).

Responsive, styled user interface with live state updates.

Tech Stack
Backend: Motoko

Frontend: React + Vite

Deployment: DFINITY SDK (dfx)

Styling: Custom CSS (with Roboto font and vibrant color scheme)

Getting Started
Install DFINITY SDK: https://internetcomputer.org/docs/current/developer-docs/build/install-upgrade/remove-reinstall

Run dfx start in one terminal to start the local replica.

Deploy the backend canister:
dfx deploy backend

Deploy frontend assets:
dfx deploy frontend

Start the frontend with Vite:
cd frontend
npm install
npm run dev

Access the app in your browser at http://localhost:5173/

Build for Production
To bundle the frontend for production:

npm run build

Deployment
Local: via dfx

Production: deploy to the Internet Computer using dfx deploy --network ic

Notes
The app enforces one vote per principal per poll.

Poll results are displayed in both numeric and percentage form.

Deleting a poll removes it entirely from the canister state (ensure you have backups or confirmation logic).