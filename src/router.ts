import { Router } from "express";
import { body, param } from "express-validator";
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments, updateAppointment, updateAppointmentStatus } from "./handlers/appointment";
import { AppointmentStatus } from "./models/Appointment.model";
import { handleInputErrors } from "./middleware";

const router = Router()

router.get("/", getAppointments)

router.get("/:id",
    param('id').isInt().withMessage('ID debe ser un número entero'),
    handleInputErrors,
    getAppointmentById
)

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

router.put("/:id",
    param('id').isInt().withMessage('ID debe ser un número entero'),
    body('patientName')
        .trim()
        .optional()
        .isLength({ max: 120 }).withMessage('Máximo 120 caracteres'),
    body('professionalName')
        .trim()
        .optional()
        .isLength({ max: 120 }).withMessage('Máximo 120 caracteres'),
    body('startAt')
        .optional()
        .isISO8601().withMessage('startAt debe ser una fecha válida ISO8601'),
    body('endAt')
        .optional()
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
    updateAppointment
)

router.patch("/:id/status", updateAppointmentStatus)

router.delete("/:id",
    param('id').isInt().withMessage('ID debe ser un número entero'),
    handleInputErrors,
    deleteAppointment
)

export default router;