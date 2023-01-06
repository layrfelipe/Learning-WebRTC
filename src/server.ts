import express from "express";
import { Server } from "socket.io";

// initializing express and signalling (socket) servers
const app = express();
const io = new Server();

const PORT = 8080;
const server = app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
});

// initial route
app.get("/", (req, res) => res.send("Hello, WebRTC!"));

// binding socket to http (proxying :3000 -> :8080 on package.json)
io.listen(server, {
    path: "/learning-WebRTC"
});

const webRTCNamespace = io.of("/webRTCPeers");

webRTCNamespace.on("connection", socket => {
    socket.emit("connection-success", {
        status: "connection-success",
        socketId: socket.id
    })

    socket.on("disconnect", () => console.log(`${socket.id} has disconnected`))

    socket.on("sdp", data => {
        // sends session description protocol to all peers
        socket.broadcast.emit("sdp", data)
    })

    socket.on("candidate", data => {
        // sends interactive connectivity stablishment candidate to all peers
        socket.broadcast.emit("candidate", data)
    })
})