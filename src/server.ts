import  express  from "express";
import router from "./router";
import db from "./config/db";

//Conectar a la db
export async function conectDB(){
    try {
        await db.authenticate()
        await db.sync({ alter: true })
        console.log("Conexión a la base de datos establecida");
    } catch (error) {
        console.log(error)
        console.log("Error al conectar a la base de datos");
    }
}

const server = express();

server.use(express.json())

server.get('/api', (req, res) => {
    res.json({ msg: 'Desde API' })
})

server.use('/api/appointments', router)

if (process.env.NODE_ENV !== 'test') {
    conectDB()
}

export default server;