import { Router } from "express";
import { body } from "express-validator";
import { createAppointment, getAppointments } from "./handlers/appointment";
import { AppointmentStatus } from "./models/Appointment.model";
import { handleInputErrors } from "./middleware";

const router = Router()

router.get("/", getAppointments)

router.post("/", 
    body('patientName')
        .trim()
        .notEmpty().withMessage('El nombre del paciente es obligatorio')
        .isLength({ max: 120 }).withMessage('Máximo 120 caracteres'),
    body('professionalName')
        .trim()
        .notEmpty().withMessage('El profesional es obligatorio')
        .isLength({ max: 120 }).withMessage('Máximo 120 caracteres'),
    body('startAt')
        .notEmpty().withMessage('La fecha/hora de inicio es obligatoria')
        .isISO8601().withMessage('startAt debe ser una fecha válida ISO8601'),
    body('endAt')
        .notEmpty().withMessage('La fecha/hora de fin es obligatoria')
        .isISO8601().withMessage('endAt debe ser una fecha válida ISO8601')
        .custom((value, { req }) => new Date(value) > new Date(req.body.startAt)).withMessage('endAt debe ser mayor que startAt'),
    body('status')
        .optional()
        .isIn([
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADO,
            AppointmentStatus.CANCELADO
        ]).withMessage('Estado inválido'),
    body('notes')
        .optional()
        .isLength({ max: 2000 }).withMessage('Máximo 2000 caracteres en notas'),
    handleInputErrors,
    createAppointment
)

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