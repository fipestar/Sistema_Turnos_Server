import request from "supertest";
import server, { conectDB } from "../server";
import db from "../config/db";

afterEach(() => {
    jest.restoreAllMocks();
});

describe('GET /api', () => {
    it('should send back a json response', async () => {
        const res = await request(server).get('/api');

        expect(res.status).toBe(200);
        expect(res.headers['content-type']).toMatch(/json/);
        expect(res.body.msg).toBe('Desde API');

        expect(res.status).not.toBe(404);
        expect(res.body.msg).not.toBe('Not Found');
    })
})

describe('conectDB', () => {
    it('should authenticate and sync successfully', async () => {
        const authSpy = jest.spyOn(db, 'authenticate').mockResolvedValue();
        const syncSpy = jest.spyOn(db, 'sync').mockResolvedValue(db);
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

        await conectDB();

        expect(authSpy).toHaveBeenCalled();
        expect(syncSpy).toHaveBeenCalledWith({ alter: true });
        expect(logSpy).toHaveBeenCalledWith('Conexión a la base de datos establecida');
    });

    it('should log error when connection fails', async () => {
        const error = new Error('connection failed');
        jest.spyOn(db, 'authenticate').mockRejectedValue(error);
        const logSpy = jest.spyOn(console, 'log').mockImplementation(() => undefined);

        await conectDB();

        expect(logSpy).toHaveBeenCalledWith(error);
        expect(logSpy).toHaveBeenCalledWith('Error al conectar a la base de datos');
    });

    it('should call conectDB on module load when NODE_ENV is not test', async () => {
        const previousNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';

        jest.resetModules();

        const authenticate = jest.fn().mockResolvedValue(undefined);
        const sync = jest.fn().mockResolvedValue({});

        jest.doMock('../config/db', () => ({
            __esModule: true,
            default: {
                authenticate,
                sync
            }
        }));

        await jest.isolateModulesAsync(async () => {
            await import('../server');
        });

        expect(authenticate).toHaveBeenCalled();
        expect(sync).toHaveBeenCalledWith({ alter: true });

        jest.dontMock('../config/db');
        process.env.NODE_ENV = previousNodeEnv;
    });
});