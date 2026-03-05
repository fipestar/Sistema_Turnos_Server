import { Router } from "express";
import { body, param } from "express-validator";
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments, updateAppointment, updateAppointmentStatus } from "./handlers/appointment";
import { AppointmentStatus } from "./models/Appointment.model";
import { handleInputErrors } from "./middleware";

/**
 * @swagger
 * components:
 *   schemas:
 *     Appointment:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *           example: 1
 *         patientName:
 *           type: string
 *           maxLength: 120
 *           example: Juan Perez
 *         professionalName:
 *           type: string
 *           maxLength: 120
 *           example: Dra. Gomez
 *         startAt:
 *           type: string
 *           format: date-time
 *           example: 2026-03-05T10:00:00.000Z
 *         endAt:
 *           type: string
 *           format: date-time
 *           example: 2026-03-05T10:30:00.000Z
 *         status:
 *           type: string
 *           enum: [Pendiente, Confirmado, Cancelado]
 *           example: Pendiente
 *         notes:
 *           type: string
 *           nullable: true
 *           example: Primera consulta
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *     AppointmentCreateInput:
 *       type: object
 *       required: [patientName, professionalName, startAt, endAt]
 *       properties:
 *         patientName:
 *           type: string
 *           maxLength: 120
 *           example: Juan Perez
 *         professionalName:
 *           type: string
 *           maxLength: 120
 *           example: Dra. Gomez
 *         startAt:
 *           type: string
 *           format: date-time
 *           example: 2026-03-05T10:00:00.000Z
 *         endAt:
 *           type: string
 *           format: date-time
 *           example: 2026-03-05T10:30:00.000Z
 *         status:
 *           type: string
 *           enum: [Pendiente, Confirmado, Cancelado]
 *           default: Pendiente
 *         notes:
 *           type: string
 *           maxLength: 2000
 *           example: Primera consulta
 *     AppointmentUpdateInput:
 *       type: object
 *       description: Enviar al menos un campo para actualizar.
 *       properties:
 *         patientName:
 *           type: string
 *           maxLength: 120
 *         professionalName:
 *           type: string
 *           maxLength: 120
 *         startAt:
 *           type: string
 *           format: date-time
 *         endAt:
 *           type: string
 *           format: date-time
 *         status:
 *           type: string
 *           enum: [Pendiente, Confirmado, Cancelado]
 *         notes:
 *           type: string
 *           maxLength: 2000
 *     AppointmentStatusUpdateInput:
 *       type: object
 *       required: [status]
 *       properties:
 *         status:
 *           type: string
 *           enum: [Pendiente, Confirmado, Cancelado]
 *           example: Confirmado
 *     ValidationError:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           example: field
 *         value:
 *           nullable: true
 *         msg:
 *           type: string
 *           example: ID debe ser un numero entero
 *         path:
 *           type: string
 *           example: id
 *         location:
 *           type: string
 *           example: params
 *     ValidationErrorResponse:
 *       type: object
 *       properties:
 *         errors:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/ValidationError'
 *     AppointmentDataResponse:
 *       type: object
 *       properties:
 *         data:
 *           $ref: '#/components/schemas/Appointment'
 *     AppointmentListResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/Appointment'
 *     ErrorResponse:
 *       type: object
 *       properties:
 *         error:
 *           type: string
 *           example: Error interno del servidor
 *     MessageResponse:
 *       type: object
 *       properties:
 *         message:
 *           type: string
 *           example: Cita eliminada
 */

const router = Router()

/**
 * @swagger
 * /api/appointments:
 *   get:
 *     tags: [Appointments]
 *     summary: Obtener todas las citas
 *     description: Retorna la lista completa de citas registradas.
 *     responses:
 *       200:
 *         description: Lista de citas obtenida correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentListResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/", getAppointments)

/**
 * @swagger
 * /api/appointments/{id}:
 *   get:
 *     tags: [Appointments]
 *     summary: Obtener una cita por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDataResponse'
 *       400:
 *         description: Error de validacion en parametros
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.get("/:id",
    param('id').isInt().withMessage('ID debe ser un número entero'),
    handleInputErrors,
    getAppointmentById
)

/**
 * @swagger
 * /api/appointments:
 *   post:
 *     tags: [Appointments]
 *     summary: Crear una nueva cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentCreateInput'
 *     responses:
 *       201:
 *         description: Cita creada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDataResponse'
 *       400:
 *         description: Error de validacion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
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

/**
 * @swagger
 * /api/appointments/{id}:
 *   put:
 *     tags: [Appointments]
 *     summary: Actualizar una cita por ID
 *     description: |
 *       Actualiza una cita existente. Debe enviarse al menos un campo del recurso.
 *       Si se envian `startAt` y `endAt`, `endAt` debe ser mayor que `startAt`.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentUpdateInput'
 *     responses:
 *       200:
 *         description: Cita actualizada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDataResponse'
 *       400:
 *         description: Error de validacion
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.put("/:id",
    param('id').isInt().withMessage('ID debe ser un número entero'),

    body().custom((value, { req }) => {
        const allowedFields = ['patientName', 'professionalName', 'startAt', 'endAt', 'status', 'notes']
        const provided = Object.keys(req.body ?? {})
        const hasAtLeastOne = provided.some((k) => allowedFields.includes(k))
        if (!hasAtLeastOne) {
            throw new Error('Debe enviar al menos un campo para actualizar')
        }
        return true
    }),

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
        .custom((value, { req }) => {
            if (!req.body.startAt) return true
            return new Date(value) > new Date(req.body.startAt)
        }).withMessage('endAt debe ser mayor que startAt'),
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

/**
 * @swagger
 * /api/appointments/{id}/status:
 *   patch:
 *     tags: [Appointments]
 *     summary: Actualizar el estado de una cita
 *     description: Actualiza unicamente el estado de la cita respetando las transiciones permitidas por negocio.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AppointmentStatusUpdateInput'
 *     responses:
 *       200:
 *         description: Estado actualizado correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AppointmentDataResponse'
 *       400:
 *         description: Error de validacion (id o status)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       409:
 *         description: Transicion de estado no permitida
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Error interno del servidor
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.patch("/:id/status",
    param('id').isInt().withMessage('ID debe ser un número entero'),
    body('status')
        .notEmpty().withMessage('El estado es obligatorio')
        .bail()
        .isIn([
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADO,
            AppointmentStatus.CANCELADO
        ]).withMessage('Estado inválido'),
    handleInputErrors,
    updateAppointmentStatus
)

/**
 * @swagger
 * /api/appointments/{id}:
 *   delete:
 *     tags: [Appointments]
 *     summary: Eliminar una cita por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID de la cita
 *     responses:
 *       200:
 *         description: Cita eliminada correctamente
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Error de validacion del parametro id
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ValidationErrorResponse'
 *       404:
 *         description: Cita no encontrada
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.delete("/:id",
    param('id').isInt().withMessage('ID debe ser un número entero'),
    handleInputErrors,
    deleteAppointment
)

export default router;