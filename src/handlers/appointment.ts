import { Request, Response } from 'express'
import { Appointment } from '../models/Appointment.model'

export const createAppointment = async (req: Request, res: Response) => {
    try {
        const appointment = await Appointment.create(req.body)
        res.json({data: appointment})
    } catch (error) {
        console.error('Error al crear la cita:', error)
    }
}

export const getAppointments = async (req: Request, res: Response) => {
    try {
        const appointments = await Appointment.findAll()
        res.json({data: appointments})
    } catch (error) {
        console.error('Error al obtener las citas:', error) 
    }
}