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

export const getAppointmentById = async (req: Request, res: Response) => {
    try {
        const {id} = req.params
        const appointment = await Appointment.findByPk(Array.isArray(id) ? id[0] : id)
        if(!appointment){
            return res.status(404).json({error: 'Cita no encontrada'})
        }
        res.json({data: appointment})

    } catch (error) {
        console.error('Error al obtener la cita:', error)
        res.status(500).json({error: 'Error interno del servidor'})
    }
}

export const updateAppointment = async (req: Request, res: Response) => {
    const {id} = req.params
    const appointment = await Appointment.findByPk(Array.isArray(id) ? id[0] : id)
    if(!appointment){
        return res.status(404).json({error: 'Cita no encontrada'})
    }
    //Actualizar la cita
    await appointment.update(req.body)
    await appointment.save()

    res.json({data: appointment})
}

export const updateAppointmentStatus = async (req: Request, res: Response) => {
    try {
        const id = Number(req.params.id)
        const { status } = req.body

        const allowed = ['Pendiente', 'Confirmado', 'Cancelado']
        if (!allowed.includes(status)) {
            return res.status(400).json({ error: 'Estado inválido' })
        }

        const appointment = await Appointment.findByPk(id)
        if (!appointment) {
            return res.status(404).json({ error: 'Cita no encontrada' })
        }

        const current = appointment.status
        const validTransition =
            (current === 'Pendiente' && (status === 'Confirmado' || status === 'Cancelado')) ||
            (current === 'Confirmado' && (status === 'Pendiente' || status === 'Cancelado')) ||
            (current === 'Cancelado' && status === 'Cancelado')

        if (!validTransition) {
            return res.status(409).json({ error: 'Transición de estado no permitida' })
        }

        appointment.status = status
        await appointment.save()

        return res.json({ data: appointment })
    } catch (error) {
        console.error('Error al actualizar estado de la cita:', error)
        return res.status(500).json({ error: 'Error interno del servidor' })
    }
}

export const deleteAppointment = async (req: Request, res: Response) => {
    const {id} = req.params
    const appointment = await Appointment.findByPk(Array.isArray(id) ? id[0] : id)
    if(!appointment){
        return res.status(404).json({error: 'Cita no encontrada'})
    }

    await appointment.destroy()
    res.json({message: 'Cita eliminada'})
}