import express from "express";
import { Server } from "socket.io";

const app = express();
const io = new Server();

const PORT = 8080;

app.get("/", (req, res) => res.send("Hello, WebRTC!"));

const server = app.listen(PORT, () => {
    console.log(`App is running on port ${PORT}`)
});

io.listen(server, {
    path: "/learning-WebRTC"
});

const webRTCNamespace = io.of("/webRTCPeers");

webRTCNamespace.on("connection", socket => {
    console.log(`${socket.id} has connected`);

    socket.emit("connection-success", {
        status: "connection-success",
        socketId: socket.id
    })

    socket.on("disconnect", () => console.log(`${socket.id} has disconnected`))

    socket.on("sdp", data => {
        socket.broadcast.emit("sdp", data)
    })

    socket.on("candidate", data => {
        socket.broadcast.emit("candidate", data)
    })
})