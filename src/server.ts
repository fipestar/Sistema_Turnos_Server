import  express  from "express";
import router from "./router";
import db from "./config/db";

//Conectar a la db
async function conectDB(){
    try {
        await db.authenticate()
        await db.sync({ alter: true })
        console.log("Conexión a la base de datos establecida");
    } catch (error) {
        console.log(error)
        console.log("Error al conectar a la base de datos");
    }
}

conectDB()

const server = express();

server.use(express.json())

server.use('/api/appointments', router)

export default server;