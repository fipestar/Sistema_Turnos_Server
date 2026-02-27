import { Router } from "express";

const router = Router()

router.get('/', (req, res) => {
    const datos = [
        {id: 1, nombre: 'Juan'},
        {id: 2, nombre: 'Maria'},
        {id: 3, nombre: 'Pedro'},
    ]
    res.json(datos);
})

router.post("/", (req, res) => {
    res.send("POST recibido");
})

router.put("/", (req, res) => {
    res.send("PUT recibido");
})

router.patch("/", (req, res) => {
    res.send("PATCH recibido");
})

router.delete("/", (req, res) => {
    res.send("DELETE recibido");
})

export default router;