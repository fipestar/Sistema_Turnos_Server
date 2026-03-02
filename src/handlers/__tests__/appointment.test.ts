import request from 'supertest';
import server from '../../server';
import { Appointment, AppointmentStatus } from '../../models/Appointment.model';

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

