import request from 'supertest';
import server from '../../server';
import { Appointment, AppointmentStatus } from '../../models/Appointment.model';

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
               .mockResolvedValue({ ...payload } as any);

          const res = await request(server)
               .post('/api/appointments')
               .send(payload);

          expect(res.status).toBe(201);
          expect(res.headers['content-type']).toMatch(/json/);
          expect(createSpy).toHaveBeenCalledWith(payload);
            expect(res.body.data).toEqual(expect.objectContaining(payload));
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
    const appointmentMock = {
      id: 1,
      patientName: 'Paciente Test',
      professionalName: 'Dr. Test',
      startAt: '2026-03-05T10:00:00.000Z',
      endAt: '2026-03-05T10:30:00.000Z',
      status: AppointmentStatus.PENDIENTE,
      notes: 'Nota de prueba'
    };

    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointmentMock as any);

    const res = await request(server).get('/api/appointments/1');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(res.body).not.toHaveProperty('errors');
  })
  it('should check if api/appointments url exists', async () => {
    jest.spyOn(Appointment, 'findAll').mockResolvedValue([] as any);

    const res = await request(server).get('/api/appointments');
    expect(res.status).toBe(200);
  })
  it('GET a JSON response with an array of appointments', async () => {
    const appointmentsMock = [
      {
        id: 1,
        patientName: 'Paciente 1',
        professionalName: 'Profesional 1',
        startAt: '2026-03-05T10:00:00.000Z',
        endAt: '2026-03-05T10:30:00.000Z',
        status: AppointmentStatus.PENDIENTE,
        notes: 'Nota 1'
      },
      {
        id: 2,
        patientName: 'Paciente 2',
        professionalName: 'Profesional 2',
        startAt: '2026-03-06T11:00:00.000Z',
        endAt: '2026-03-06T11:30:00.000Z',
        status: AppointmentStatus.CONFIRMADO,
        notes: 'Nota 2'
      }
    ];

    jest.spyOn(Appointment, 'findAll').mockResolvedValue(appointmentsMock as any);

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
    const appointmentMock = {
      id: 1,
      patientName: 'Old Name',
      professionalName: 'Dra. Test',
      startAt: '2026-03-07T10:00:00.000Z',
      endAt: '2026-03-07T10:30:00.000Z',
      status: AppointmentStatus.PENDIENTE,
      notes: 'Test',
      update: jest.fn().mockResolvedValue(undefined),
      save: jest.fn().mockResolvedValue(undefined),
    };

    jest.spyOn(Appointment, 'findByPk').mockResolvedValue(appointmentMock as any);

    const res = await request(server).put('/api/appointments/1').send({
      patientName: 'Updated Name'
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('data');
    expect(appointmentMock.update).toHaveBeenCalledWith({ patientName: 'Updated Name' });
    expect(appointmentMock.save).toHaveBeenCalled();
    
    expect(res.status).not.toBe(400);
    expect(res.body).not.toHaveProperty('errors');
  } )
})