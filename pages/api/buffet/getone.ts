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
        const query = `SELECT 
    b.id, 
    b.nickname, 
    b.usedate, 
    b.price, 
    b.shuttle_cock, 
    b.paymentStatus, 
    b.regisDate, 
    b.isStudent, 
    bs.court_price,
    (SELECT pc.playerId FROM pos_customers pc WHERE pc.customerID = b.id) AS playerId,

    -- เงินที่ยังไม่จ่าย
    (SELECT 
        SUM(
            CASE 
                WHEN  ps.flag_delete = false 
                THEN ps.TotalAmount 
                ELSE 0 
            END
        ) 
     FROM pos_sales ps 
     WHERE ps.CustomerID = (
        SELECT pc.customerID 
        FROM pos_customers pc 
        WHERE pc.playerId = b.id AND pc.buffetStatus = '${buffetStatusEnum.BUFFET}'
     )
    ) AS pendingMoney,

    -- รายละเอียดลูกแบด
    (SELECT JSON_ARRAYAGG(
        JSON_OBJECT(
            'shuttlecock_type_id', bs.shuttlecock_type_id,
            'shuttlecock_type', st.name,
            'quantity', bs.quantity,
            'price', st.price 
        )
    )
    FROM buffet_shuttlecocks bs
    JOIN shuttlecock_types st ON bs.shuttlecock_type_id = st.id
    WHERE bs.buffet_id = b.id
    ) AS shuttlecock_details,

    -- รวม shuttlecock + court_price + รายจ่ายจาก pos_sales
    (
        COALESCE((
            SELECT 
                ( SUM(bs_inner.quantity * st.price) / 4) + bs.court_price
            FROM buffet_shuttlecocks bs_inner
            JOIN shuttlecock_types st ON bs_inner.shuttlecock_type_id = st.id
            WHERE bs_inner.buffet_id = b.id
        ), bs.court_price)
        +
        COALESCE((
            SELECT 
                SUM(
                    CASE 
                        WHEN ps.flag_delete = false THEN ps.TotalAmount
                        ELSE 0 
                    END
                )
            FROM pos_sales ps
            WHERE ps.CustomerID = (
                SELECT pc.customerID
                FROM pos_customers pc
                WHERE pc.playerId = b.id AND pc.buffetStatus = '${buffetStatusEnum.BUFFET}'
                LIMIT 1
            )
        ), 0)
    ) AS total_price

FROM 
    buffet b 
JOIN 
    buffet_setting bs ON bs.isStudent = b.isStudent
WHERE 
    b.id = ? ;`;
        ;

        // Execute the SQL query to fetch time slots
        const [results] = await connection.query<RowDataPacket[]>(query, [buffetId]);
        if (!results.length) {
            return res.status(404).json({ error: 'Buffet not found' });
        }

        // ต้อง parse shuttlecock_details ถ้า database ส่งมาเป็น string
        const result = results[0];
        if (typeof result.shuttlecock_details === 'string') {
            try {
                result.shuttlecock_details = JSON.parse(result.shuttlecock_details);
            } catch (err) {
                console.error('Failed to parse shuttlecock_details:', err);
                result.shuttlecock_details = [];
            }
        }

        res.json(results);
    } catch (error) {
        console.error('Error fetching :', error);
        res.status(500).json({ error: 'Error fetching ' });
    } finally {
        connection.release(); // Release the connection back to the pool when done
    }
};
