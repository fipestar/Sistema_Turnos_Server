import request from 'supertest';
import server from '../../server';
import { Appointment, AppointmentStatus } from '../../models/Appointment.model';
import { createAppointment, deleteAppointment, getAppointmentById, getAppointments, updateAppointment, updateAppointmentStatus } from '../appointment';

const buildAppointment = (overrides?: Partial<Appointment>) => {
  const appointment = Appointment.build({
    patientName: 'Paciente Test',
    professionalName: 'Dr. Test',
    startAt: new Date('2026-03-05T10:00:00.000Z'),
    endAt: new Date('2026-03-05T10:30:00.000Z'),
    status: AppointmentStatus.PENDIENTE,
    notes: 'Nota de prueba'
  });

  if (overrides) {
    Object.assign(appointment, overrides);
  }

  return appointment;
};

afterEach(() => {
  jest.restoreAllMocks();
});

describe('POST /api/appointments', () => {
      afterEach(() => {
          jest.restoreAllMocks();
      });

      it('should display validation errors', async () => {
        const res = await request(server)
            .post('/api/appointments')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toHaveProperty('errors');
        expect(res.body.errors).toHaveLength(7)

        expect(res.status).not.toBe(201);
        expect(res.body.errors).not.toHaveLength(2);
    })

      it('should create a new appointment with model structure', async () => {
          const payload = {
               patientName: 'Juan Pérez',
               professionalName: 'Dra. Gómez',
               startAt: '2026-03-05T10:00:00.000Z',
               endAt: '2026-03-05T10:30:00.000Z',
               status: AppointmentStatus.PENDIENTE,
               notes: 'Primera consulta'
          };

          const createSpy = jest
               .spyOn(Appointment, 'create')
            .mockResolvedValue(buildAppointment({
             patientName: payload.patientName,
             professionalName: payload.professionalName,
             startAt: new Date(payload.startAt),
             endAt: new Date(payload.endAt),
             status: payload.status,
             notes: payload.notes
            }));

          const res = await request(server)
               .post('/api/appointments')
               .send(payload);

          expect(res.status).toBe(201);
          expect(res.headers['content-type']).toMatch(/json/);
          expect(createSpy).toHaveBeenCalledWith(payload);
          expect(res.body.data).toEqual(expect.objectContaining({
            patientName: payload.patientName,
            professionalName: payload.professionalName,
            status: payload.status,
            notes: payload.notes
          }));
          expect(res.body.data).toHaveProperty('startAt');
          expect(res.body.data).toHaveProperty('endAt');
      });

          it('should return 400 when status is invalid', async () => {
            const payload = {
              patientName: 'Ana López',
              professionalName: 'Dr. Ruiz',
              startAt: '2026-03-06T09:00:00.000Z',
              endAt: '2026-03-06T09:30:00.000Z',
              status: 'Reprogramado',
              notes: 'Control'
            };

            const createSpy = jest.spyOn(Appointment, 'create');

            const res = await request(server)
              .post('/api/appointments')
              .send(payload);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(createSpy).not.toHaveBeenCalled();
          });

          it('should return 400 when endAt is not greater than startAt', async () => {
            const payload = {
              patientName: 'María Gómez',
              professionalName: 'Dra. Castro',
              startAt: '2026-03-07T11:00:00.000Z',
              endAt: '2026-03-07T11:00:00.000Z',
              status: AppointmentStatus.PENDIENTE,
              notes: 'Seguimiento'
            };

            const createSpy = jest.spyOn(Appointment, 'create');

            const res = await request(server)
              .post('/api/appointments')
              .send(payload);

            expect(res.status).toBe(400);
            expect(res.body).toHaveProperty('errors');
            expect(createSpy).not.toHaveBeenCalled();
          });
})

describe('GET /api/appointments', () => {
  it('should return 404 for non-existing appointment', async () => {
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(null);

    const productId = 9999; // ID que no existe
    const res = await request(server).get(`/api/appointments/${productId}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error')
    expect(res.body.error).toBe('Cita no encontrada');
  })

  it('should check a valid ID in the URL', async () => {
    const res = await request(server).get('/api/appointments/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].msg).toBe('ID debe ser un número entero');
    
  })
  it('get a JSON response for a single appointment', async () => {
    const appointmentMock = buildAppointment({ id: 1 });

    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointmentMock);

    const res = await request(server).get('/api/appointments/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).not.toHaveProperty('errors');
  })
  it('should check if api/appointments url exists', async () => {
    const emptyAppointments: Appointment[] = [];
    jest.spyOn(Appointment, 'findAll').mockResolvedValue(emptyAppointments);

    const res = await request(server).get('/api/appointments');
    expect(res.status).toBe(200);
  })
  it('GET a JSON response with an array of appointments', async () => {
    const appointmentsMock: Appointment[] = [
      buildAppointment({
        id: 1,
        patientName: 'Paciente 1',
        professionalName: 'Profesional 1',
        startAt: new Date('2026-03-05T10:00:00.000Z'),
        endAt: new Date('2026-03-05T10:30:00.000Z'),
        status: AppointmentStatus.PENDIENTE,
        notes: 'Nota 1'
      }),
      buildAppointment({
        id: 2,
        patientName: 'Paciente 2',
        professionalName: 'Profesional 2',
        startAt: new Date('2026-03-06T11:00:00.000Z'),
        endAt: new Date('2026-03-06T11:30:00.000Z'),
        status: AppointmentStatus.CONFIRMADO,
        notes: 'Nota 2'
      })
    ];

    jest.spyOn(Appointment, 'findAll').mockResolvedValue(appointmentsMock);

    const res = await request(server).get('/api/appointments');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toMatch(/json/);
    expect(res.body).toHaveProperty('data');
    expect(res.body.data).toHaveLength(2);

    expect(res.body).not.toHaveProperty('errors');
  })
})

describe('PUT /api/appointments/:id', () => {
  it('should check a valid ID in the URL', async () => {
    const res = await request(server).put('/api/appointments/not-a-number').send({
      patientName: 'Updated Name'
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].msg).toBe('ID debe ser un número entero');
  })
  it('should display validation errors when updating a product', async () => {
    const res = await request(server).put('/api/appointments/1').send({});
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].msg).toBe('Debe enviar al menos un campo para actualizar');

    expect(res.status).not.toBe(200);
    expect(res.body).not.toHaveProperty('data');
  })
  it('should allow valid startAt/endAt pair and continue to handler', async () => {
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(null);

    const res = await request(server).put('/api/appointments/1').send({
      startAt: '2026-03-07T10:00:00.000Z',
      endAt: '2026-03-07T10:30:00.000Z'
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cita no encontrada');
  })
  it('should allow endAt without startAt and continue to handler', async () => {
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(null);

    const res = await request(server).put('/api/appointments/1').send({
      endAt: '2026-03-07T12:00:00.000Z'
    });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cita no encontrada');
  })
  it('should return 404 when trying to update a non-existing appointment', async () => {
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(null);

    const res = await request(server).put('/api/appointments/9999').send({
      patientName: 'Updated Name'
    });
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Cita no encontrada');
  })
  it('should update an existing appointment', async () => {
    const appointmentMock = buildAppointment({
      id: 1,
      patientName: 'Old Name',
      professionalName: 'Dra. Test',
      startAt: new Date('2026-03-07T10:00:00.000Z'),
      endAt: new Date('2026-03-07T10:30:00.000Z'),
      status: AppointmentStatus.PENDIENTE,
      notes: 'Test'
    });

    const updateSpy = jest.spyOn(appointmentMock, 'update').mockResolvedValue(appointmentMock);
    const saveSpy = jest.spyOn(appointmentMock, 'save').mockResolvedValue(appointmentMock);

    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointmentMock);

    const res = await request(server).put('/api/appointments/1').send({
      patientName: 'Updated Name'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(updateSpy).toHaveBeenCalledWith({ patientName: 'Updated Name' });
    expect(saveSpy).toHaveBeenCalled();
    
    expect(res.status).not.toBe(400);
    expect(res.body).not.toHaveProperty('errors');
  } )
})

describe('PATCH /api/appointments/:id/status', () => {
  it('should validate that id is an integer', async () => {
    const res = await request(server)
      .patch('/api/appointments/not-a-number/status')
      .send({ status: AppointmentStatus.CONFIRMADO });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0].msg).toBe('ID debe ser un número entero');
  });

  it('should require status in request body', async () => {
    const res = await request(server)
      .patch('/api/appointments/1/status')
      .send({});

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0].msg).toBe('El estado es obligatorio');
  });

  it('should return 400 when status is invalid', async () => {
    const res = await request(server)
      .patch('/api/appointments/1/status')
      .send({ status: 'Reprogramado' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors[0].msg).toBe('Estado inválido');
  });

  it('should return 404 when appointment does not exist', async () => {
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(null);

    const res = await request(server)
      .patch('/api/appointments/9999/status')
      .send({ status: AppointmentStatus.CONFIRMADO });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe('Cita no encontrada');
  });

  it('should return 409 on invalid status transition', async () => {
    const appointment = buildAppointment({ status: AppointmentStatus.CANCELADO });
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointment);

    const res = await request(server)
      .patch('/api/appointments/1/status')
      .send({ status: AppointmentStatus.CONFIRMADO });

    expect(res.status).toBe(409);
    expect(res.body.error).toBe('Transición de estado no permitida');
  });

  it('should update status when transition is valid', async () => {
    const appointment = buildAppointment({ status: AppointmentStatus.PENDIENTE });
    const saveSpy = jest.spyOn(appointment, 'save').mockResolvedValue(appointment);
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointment);

    const res = await request(server)
      .patch('/api/appointments/1/status')
      .send({ status: AppointmentStatus.CONFIRMADO });

    expect(res.status).toBe(200);
    expect(saveSpy).toHaveBeenCalled();
    expect(res.body).toHaveProperty('data');
    expect(res.body.data.status).toBe(AppointmentStatus.CONFIRMADO);
  });

  it('should return 500 when an unexpected error occurs', async () => {
    jest.spyOn(Appointment, 'findByPk').mockRejectedValue(new Error('DB error'));

    const res = await request(server)
      .patch('/api/appointments/1/status')
      .send({ status: AppointmentStatus.CONFIRMADO });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe('Error interno del servidor');
  });
});

describe('DELETE /api/appointments/:id', () => {
  it('should check a valid ID in the URL', async () => {
    const res = await request(server).delete('/api/appointments/not-a-number');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('errors');
    expect(res.body.errors).toHaveLength(1);
    expect(res.body.errors[0].msg).toBe('ID debe ser un número entero');
  })

  it('should return 404 when trying to delete a non-existing appointment', async () => {
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(null);

    const appointmentId = 9999; // ID que no existe
    const res = await request(server).delete(`/api/appointments/${appointmentId}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('error');
    expect(res.body.error).toBe('Cita no encontrada');
  })

  it('should delete an existing appointment', async () => {
    const appointmentMock = buildAppointment({ id: 1 });
    const destroySpy = jest.spyOn(appointmentMock, 'destroy').mockResolvedValue();

    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointmentMock);

    const res = await request(server).delete('/api/appointments/1');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({message: 'Cita eliminada'});
    expect(destroySpy).toHaveBeenCalled();

    expect(res.status).not.toBe(400);
    expect(res.status).not.toBe(404);
  })
})

describe('Appointment model validations', () => {
  it('should throw when startAt is greater than or equal to endAt', () => {
    const appointment = buildAppointment({
      startAt: new Date('2026-03-08T10:00:00.000Z'),
      endAt: new Date('2026-03-08T10:00:00.000Z')
    });

    expect(() => Appointment.validateDateRange(appointment)).toThrow('La fecha de inicio debe ser anterior a la fecha de fin');
  });

  it('should not throw when startAt is before endAt', () => {
    const appointment = buildAppointment({
      startAt: new Date('2026-03-08T10:00:00.000Z'),
      endAt: new Date('2026-03-08T11:00:00.000Z')
    });

    expect(() => Appointment.validateDateRange(appointment)).not.toThrow();
  });
});

describe('appointment handlers error paths', () => {
  const createMockRes = () => {
    const json = jest.fn();
    const status = jest.fn().mockReturnValue({ json });
    return { status, json };
  };

  it('createAppointment should return 500 when create fails', async () => {
    jest.spyOn(Appointment, 'create').mockRejectedValue(new Error('DB error'));

    const req = { body: {} };
    const res = createMockRes();

    await createAppointment(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });

  it('getAppointments should return 500 when findAll fails', async () => {
    jest.spyOn(Appointment, 'findAll').mockRejectedValue(new Error('DB error'));

    const req = {};
    const res = createMockRes();

    await getAppointments(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });

  it('getAppointmentById should return 400 when id is not an integer', async () => {
    const req = { params: { id: 'abc' } };
    const res = createMockRes();

    await getAppointmentById(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID debe ser un número entero' });
  });

  it('getAppointmentById should return 500 when findByPk fails', async () => {
    jest.spyOn(Appointment, 'findByPk').mockRejectedValue(new Error('DB error'));

    const req = { params: { id: '1' } };
    const res = createMockRes();

    await getAppointmentById(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });

  it('updateAppointment should return 400 when id is not an integer', async () => {
    const req = { params: { id: 'abc' }, body: { patientName: 'x' } };
    const res = createMockRes();

    await updateAppointment(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID debe ser un número entero' });
  });

  it('deleteAppointment should return 400 when id is not an integer', async () => {
    const req = { params: { id: 'abc' } };
    const res = createMockRes();

    await deleteAppointment(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'ID debe ser un número entero' });
  });

  it('updateAppointmentStatus should return 400 when status is invalid', async () => {
    const req = { params: { id: '1' }, body: { status: 'Reprogramado' } };
    const res = createMockRes();

    await updateAppointmentStatus(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ error: 'Estado inválido' });
  });

  it('updateAppointmentStatus should return 404 when appointment does not exist', async () => {
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(null);

    const req = { params: { id: '1' }, body: { status: AppointmentStatus.CONFIRMADO } };
    const res = createMockRes();

    await updateAppointmentStatus(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ error: 'Cita no encontrada' });
  });

  it('updateAppointmentStatus should return 409 on invalid transition', async () => {
    const appointment = buildAppointment({ status: AppointmentStatus.CANCELADO });
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointment);

    const req = { params: { id: '1' }, body: { status: AppointmentStatus.CONFIRMADO } };
    const res = createMockRes();

    await updateAppointmentStatus(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(409);
    expect(res.json).toHaveBeenCalledWith({ error: 'Transición de estado no permitida' });
  });

  it('updateAppointmentStatus should update and return data on valid transition', async () => {
    const appointment = buildAppointment({ status: AppointmentStatus.PENDIENTE });
    const saveSpy = jest.spyOn(appointment, 'save').mockResolvedValue(appointment);
    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointment);

    const req = { params: { id: '1' }, body: { status: AppointmentStatus.CONFIRMADO } };
    const res = createMockRes();

    await updateAppointmentStatus(req as never, res as never);

    expect(saveSpy).toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledWith({ data: appointment });
  });

  it('updateAppointmentStatus should return 500 when an unexpected error occurs', async () => {
    jest.spyOn(Appointment, 'findByPk').mockRejectedValue(new Error('DB error'));

    const req = { params: { id: '1' }, body: { status: AppointmentStatus.CONFIRMADO } };
    const res = createMockRes();

    await updateAppointmentStatus(req as never, res as never);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
  });
});