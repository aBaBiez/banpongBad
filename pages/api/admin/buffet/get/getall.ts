import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/db/db';
import { getToken } from 'next-auth/jwt';
import { buffetStatusEnum } from '@/enum/buffetStatusEnum';
import { RowDataPacket } from 'mysql2';

export default async function insertData(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const token = await getToken({ req });
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const connection = await pool.getConnection();
    try {
        const { page = 1, limit = 15, search = '' } = req.query;
        const searchValue = Array.isArray(search) ? search[0] : search;
        const pageNumber = Number(Array.isArray(page) ? page[0] : page) || 1;
        const limitNumber = Number(Array.isArray(limit) ? limit[0] : limit) || 15;
        const offset = (pageNumber - 1) * limitNumber;
        

        const query = `
        SELECT
            b.*
        FROM buffet b
        WHERE (b.nickname LIKE ? OR b.phone LIKE ? OR usedate LIKE ?)
        ORDER BY b.id DESC
        LIMIT ? OFFSET ?
        `;

        const likeSearch = `%${searchValue}%`;
        const [results] = await connection.query(query, [likeSearch, likeSearch, likeSearch, limitNumber, offset]);

        const countQuery = `
        SELECT COUNT(*) as total_items
        FROM buffet b
        WHERE (b.nickname LIKE ? OR b.phone LIKE ? OR usedate LIKE ?)
        `;
        const [countResults] = await connection.query<RowDataPacket[]>(countQuery, [likeSearch, likeSearch, likeSearch]);
        const total_items = Number(countResults?.[0]?.total_items ?? 0);
        
        res.json({
            data: results,
            total_items,
        });
        
    } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Error fetching data' });
    } finally {
        connection.release();
    }
}
