import { Sequelize } from 'sequelize-typescript'
import dotenv from 'dotenv'
import { Appointment } from '../models/Appointment.model'
dotenv.config()

const DATABASE_URL = process.env.DATABASE_URL as string

 const db = new Sequelize(process.env.DATABASE_URL!, {
  dialect: 'postgres',
  models: [Appointment],
  logging: false,
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false
    }
  }
})

export default db;

