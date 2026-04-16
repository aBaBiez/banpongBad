import { NextApiRequest, NextApiResponse } from 'next';
import pool from '@/db/db';
import { buffetStatusEnum } from '@/enum/buffetStatusEnum';
import { RowDataPacket } from 'mysql2';


export default async function handle(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const connection = await pool.getConnection()
    try {
        const { id } = req.query
        const buffetId = Number(Array.isArray(id) ? id[0] : id);
        if (!Number.isFinite(buffetId) || buffetId <= 0) {
            return res.status(400).json({ error: 'Invalid id' });
        }
        const buffetQuery = `
        SELECT
            b.id,
            b.nickname,
            b.usedate,
            b.price,
            b.shuttle_cock,
            b.paymentStatus,
            b.regisDate,
            b.isStudent,
            bs.court_price
        FROM buffet_newbie b
        LEFT JOIN buffet_setting_newbie bs ON bs.isStudent = b.isStudent
        WHERE b.id = ?
        LIMIT 1
        `;
        const [buffetRows] = await connection.query<RowDataPacket[]>(buffetQuery, [buffetId]);
        if (!buffetRows.length) {
            return res.status(404).json({ error: 'Buffet not found' });
        }
        const buffet = buffetRows[0];

        const shuttlecockQuery = `
        SELECT
            bs.shuttlecock_type_id,
            st.name AS shuttlecock_type,
            bs.quantity,
            st.price
        FROM buffet_newbie_shuttlecocks bs
        JOIN shuttlecock_types st ON st.id = bs.shuttlecock_type_id
        WHERE bs.buffet_id = ?
        `;
        const [shuttlecockRows] = await connection.query<RowDataPacket[]>(shuttlecockQuery, [buffetId]);

        const customerQuery = `
        SELECT customerID
        FROM pos_customers
        WHERE playerId = ? AND buffetStatus = ?
        `;
        const [customerRows] = await connection.query<RowDataPacket[]>(customerQuery, [buffetId, buffetStatusEnum.BUFFET_NEWBIE]);
        const customerIds = customerRows.map((row) => row.customerID);

        let pendingMoney = 0;
        if (customerIds.length > 0) {
            const placeholders = customerIds.map(() => '?').join(', ');
            const pendingQuery = `
            SELECT COALESCE(SUM(CASE WHEN flag_delete = false THEN TotalAmount ELSE 0 END), 0) AS pendingMoney
            FROM pos_sales
            WHERE CustomerID IN (${placeholders})
            `;
            const [pendingRows] = await connection.query<RowDataPacket[]>(pendingQuery, customerIds);
            pendingMoney = Number(pendingRows[0]?.pendingMoney ?? 0);
        }

        const shuttlecock_details = shuttlecockRows.map((row) => ({
            shuttlecock_type_id: row.shuttlecock_type_id,
            shuttlecock_type: row.shuttlecock_type,
            quantity: Number(row.quantity ?? 0),
            price: Number(row.price ?? 0),
        }));
        const shuttlecockTotal = shuttlecock_details.reduce((sum, item) => sum + (item.quantity * item.price) / 4, 0);
        const courtPrice = Number(buffet.court_price ?? 0);
        const total_price = shuttlecockTotal + courtPrice + pendingMoney;

        res.json([{
            ...buffet,
            pendingMoney,
            shuttlecock_details,
            total_price,
        }]);
    } catch (error) {
        console.error('Error fetching :', error);
        res.status(500).json({ error: 'Error fetching ' });
    } finally {
        connection.release(); // Release the connection back to the pool when done
    }
};
