import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/db/db';
import { getToken } from 'next-auth/jwt';
import { buffetStatusEnum } from '@/enum/buffetStatusEnum';
import { RowDataPacket } from 'mysql2';

export default async function getBuffetById(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const token = await getToken({ req });
    if (!token) {
        return res.status(401).json({ message: 'Not authenticated' });
    }

    const connection = await pool.getConnection();
    try {
        const { id } = req.query;
        const buffetId = Number(Array.isArray(id) ? id[0] : id);
        if (!Number.isFinite(buffetId) || buffetId <= 0) {
            return res.status(400).json({ message: 'Missing buffet ID' });
        }

        const [buffetRows] = await connection.query<RowDataPacket[]>(
            `SELECT b.*, ROUND(bs.court_price, 2) AS court_price
             FROM buffet b
             JOIN buffet_setting bs ON bs.isStudent = b.isStudent
             WHERE b.id = ?
             LIMIT 1`,
            [buffetId]
        );
        if (!buffetRows.length) {
            return res.status(404).json({ message: 'Buffet not found' });
        }
        const buffet = buffetRows[0];

        const [shuttlecockRows] = await connection.query<RowDataPacket[]>(
            `SELECT bs.shuttlecock_type_id, st.name AS shuttlecock_type, st.price, bs.quantity
             FROM buffet_shuttlecocks bs
             JOIN shuttlecock_types st ON bs.shuttlecock_type_id = st.id
             WHERE bs.buffet_id = ?`,
            [buffetId]
        );
        const shuttlecock_details = shuttlecockRows.map((row) => ({
            shuttlecock_type_id: row.shuttlecock_type_id,
            shuttlecock_type: row.shuttlecock_type,
            price: Number(row.price ?? 0),
            quantity: Number(row.quantity ?? 0),
        }));
        const shuttlecock_total_price = shuttlecock_details.reduce((sum, row) => sum + (row.quantity * row.price) / 4, 0);

        const [customerRows] = await connection.query<RowDataPacket[]>(
            `SELECT customerID
             FROM pos_customers
             WHERE playerId = ? AND buffetStatus = ?`,
            [buffetId, buffetStatusEnum.BUFFET]
        );
        const customerIds = customerRows.map((row) => row.customerID);
        let shoppingMoney = 0;
        if (customerIds.length) {
            const placeholders = customerIds.map(() => '?').join(', ');
            const [moneyRows] = await connection.query<RowDataPacket[]>(
                `SELECT COALESCE(SUM(CASE WHEN flag_delete = false THEN TotalAmount ELSE 0 END), 0) AS shoppingMoney
                 FROM pos_sales
                 WHERE customerID IN (${placeholders})`,
                customerIds
            );
            shoppingMoney = Number(moneyRows[0]?.shoppingMoney ?? 0);
        }

        const total_price = Number(buffet.court_price ?? 0) + shuttlecock_total_price + shoppingMoney;

        res.json({
            data: {
                ...buffet,
                shoppingMoney,
                shuttlecock_total_price,
                shuttlecock_details,
                total_price,
            },
        });


    } catch (error) {
        console.error('Error fetching buffet by ID:', error);
        res.status(500).json({ error: 'Error fetching buffet by ID' });
    } finally {
        connection.release();
    }
}
