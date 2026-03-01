import request from "supertest";
import server, {conectDB} from "../server";
import db from "../config/db";


jest.mock('../config/db')

describe('connectDB', () => {
    it('should handle database connection errors', async () => {
        jest.spyOn(db, 'authenticate')
            .mockRejectedValueOnce(new Error('Error connecting to the database'))
        const consoleSpy = jest.spyOn(console, 'log')
        
        await conectDB()

        expect(consoleSpy).toHaveBeenCalledWith(
            expect.stringContaining('Error connecting to the database')
        )
    })
})