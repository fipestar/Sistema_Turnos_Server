import {Table, Column, Model, DataType, Default, BeforeValidate, PrimaryKey, AutoIncrement} from 'sequelize-typescript'

export enum  AppointmentStatus {
    PENDIENTE = 'Pendiente',
    CONFIRMADO= 'Confirmado',
    CANCELADO = 'Cancelado'
}

@Table({
    tableName: 'appointments',
    timestamps: true,
    indexes: [
        { fields: ['professionalName', 'startAt'] },
        { fields: ['professionalName', 'endAt'] },
        { fields: ['status']}
    ]
})

export class Appointment extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column({
        type: DataType.INTEGER
    })
    declare id: number

    @Column({
        type: DataType.STRING(120),
        allowNull: false
    })
    declare patientName: string

    @Column({
        type: DataType.STRING(120),
        allowNull: false
    })
    declare professionalName: string

    @Column({ 
        type: DataType.DATE,
        allowNull: false
    })
    declare startAt: Date

    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare endAt: Date
    
    @Default(AppointmentStatus.PENDIENTE)
    @Column({
        type: DataType.ENUM(
            AppointmentStatus.PENDIENTE,
            AppointmentStatus.CONFIRMADO,
            AppointmentStatus.CANCELADO
        ),
        allowNull: false
    })
    declare status: AppointmentStatus

    @Column({
        type: DataType.TEXT,
        allowNull: true
    })
    declare notes?: string

    @BeforeValidate
    static validateDateRange(instance: Appointment) {
        if(instance.startAt && instance.endAt && instance.startAt >= instance.endAt) {
            throw new Error('La fecha de inicio debe ser anterior a la fecha de fin')
        }
    }
}

