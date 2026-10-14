import express from "express";
import mongoose from "mongoose";
import {createServer} from "node:http";
import cors from "cors";
import {Server } from "socket.io";
import { connect } from "node:http2";
import connectToServer from "./controllers/socketManage.js";
import router from "./routes/usersroutes.js";

const app=express();
// below two line we connect express server or socket.io server;
const server=createServer(app);
const io=connectToServer(server);

app.set("port",(process.env.PORT || 8000));
app.use(cors({
    origin:"http://localhost:5173",
}));
app.use(express.json({limit:"40kb"}));
app.use(express.urlencoded({limit:"40kb",extended:true}));
app.use("/api/v1/users",router);

const start=async ()=>{
    const connectionDB=await mongoose.connect("mongodb://localhost:27017/Zoom");
    console.log("DB was connected");
    server.listen(app.get("port"),()=>{
        console.log("server was running on port 8000");
    });
};

start();
