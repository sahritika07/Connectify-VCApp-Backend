import express from "express";
import cors from "cors";
import http from "http";
import { Server } from "socket.io";

const app = express();
app.use(cors());


const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "*",
    }
});


const rooms= {};


io.on("connection", (socket) => {
    console.log("User Connected:", socket.id);

    socket.on("join-room", (roomId) => {
        socket.join(roomId);

        if(!rooms[roomId]) rooms[roomId] = [];
        rooms[roomId].push(socket.id);

        socket.emit(
            "all-users",
            rooms[roomId].filter((id) => id !== socket.id)
        )

        // notify others 
        socket.to(roomId).emit("user-joined", socket.id);
    });

    socket.on("offer", ({to, offer}) => {
        socket.to(to).emit("offer", {
            from: socket.id,
            answer,
        });
    });

    socket.on("answer", ({to, answer}) => {
        socket.to(to).emit("answer", {
            from: socket.id,
            answer,
        });
    });

    socket.on("ice-candidate", ({to,candidate}) =>{
        socket.to(to).emit("ice-candidate", {
            from: socket.id,
            candidate,
        });
    });

    socket.on("disconnect", () => {
        console.log("Disconnected", socket.id);

        for(const roomId in rooms) {
            rooms[roomId] = rooms[roomId].filter((id) => id !== socket.id);

            socket.to(roomId).emit("user-left" , socket.id);

            if(rooms[roomId].length === 0) delete rooms[roomId];
        }
    });
});


server.listen(5000, () => {
    console.log(`Backend running on port ${5000}`)
})