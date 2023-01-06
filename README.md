# My first WebRTC app
This project was built to practice and learn about this real time communication protocol

## How to run
In your terminal, `git clone https://github.com/layrfelipe/Learning-WebRTC`

Then, `cd Learning-WebRTC`

You'll notice in `src` folder that we have 3 main files:
- `index.tsx` -> Renders React application
- `App.tsx` -> The application itself
- `server.ts` -> The WebRTC signalling server: an socket.io instance responsible for handling peers connection

Open 2 instances on your terminal: one for the client and another one for the signalling server

First, run `npm run socket` to start the server
Then, run `npm start` to initialize the React app

## PS
Don't use Chrome to run the application because starting on version 47, secure origins (HTTPS) is required for getUserMedia method\
So far I have been using Edge and it works fine\

## Next steps
Separate folders for client and server\
More than 2 peers connected\
Containerize application