import { NextApiRequest, NextApiResponse } from 'next';
import cloudinary from 'cloudinary';
import multiparty from 'multiparty';
import pool from '@/db/db';
import { format, utcToZonedTime } from 'date-fns-tz';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import { buffetStatusEnum } from '@/enum/buffetStatusEnum';
import { FIRST_BARCODE } from '@/constant/firstBarcode';
import { customerPaymentStatusEnum } from '@/enum/customerPaymentStatusEnum';
import { buffetPaymentStatusEnum } from '@/enum/buffetPaymentStatusEnum';
import { PayByEnum } from '@/enum/payByEnum';

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.SECRET,
});

export const config = {
    api: {
        bodyParser: false,
    },
};

const parseForm = (req: NextApiRequest) =>
    new Promise<{ fields: multiparty.Fields; files: multiparty.Files }>((resolve, reject) => {
        const form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ fields, files });
        });
    });



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const connection = await pool.getConnection();

    try {
        const { fields, files } = await parseForm(req);
        if (req.method == 'POST') {
            const nickname = fields.nickname;
            const usedate = fields.usedate;
            const phone = fields.phone;
            const isStudent = fields.isStudent;
            const skillLevel = fields.skillLevel;

            const query = `INSERT INTO buffet_newbie (nickname, usedate, phone ,isStudent,skillLevel ) VALUES (?, ?, ? , ? , ?)`;
            const [results] = await connection.query<ResultSetHeader>(query, [nickname, usedate, phone, isStudent, skillLevel]);

            if (results.affectedRows > 0) {
                const barcode = FIRST_BARCODE;
                const insertCustomerQuery = `INSERT INTO pos_customers ( PlayerId,phone , CustomerName, buffetStatus, barcode) 
                    SELECT 
                    ?, 
                    ?, 
                    ?, 
                    ?, 
                     COALESCE(
                    (SELECT barcode FROM pos_customers 
                     WHERE DATE(register_date) = CURDATE() 
                     ORDER BY barcode DESC 
                     LIMIT 1) + 1,
                    ${barcode}
                )
                    `;
                const [insertCustomerResults] = await connection.query<ResultSetHeader>(insertCustomerQuery, [results.insertId, phone, nickname, buffetStatusEnum.BUFFET_NEWBIE]);
                if (insertCustomerResults.affectedRows > 0) {
                    const query = `SELECT barcode from pos_customers WHERE customerID = ?`
                    const [barcode] = await connection.query<RowDataPacket[]>(query, [insertCustomerResults.insertId]);
                    return res.status(200).json({ barcode: barcode[0], success: true, message: 'Data inserted successfully' });
                } else {
                    return res.status(500).json({ success: false, message: 'Error inserting data' });
                }
            } else {
                return res.status(500).json({ success: false, message: 'Error inserting data' });
            }
        } else if (req.method == 'PUT') {
            const file = files.file?.[0];
            const idRaw = fields.id?.[0];
            const id = Number(idRaw);
            if (!file?.path) {
                return res.status(400).json({ error: 'Missing file in form-data field `file`' });
            }
            if (!Number.isFinite(id) || id <= 0) {
                return res.status(400).json({ error: 'Invalid or missing `id`' });
            }

            const result = await cloudinary.v2.uploader.upload(file.path, {
                folder: 'upload',
                resource_type: 'image',
            });

            if (result.secure_url) {
                const dateInBangkok = utcToZonedTime(new Date(), "Asia/Bangkok");
                const today = format(dateInBangkok, 'dd MMMM yyyy')
                try {
                    const buffetUpdateQuery = `
                        SELECT 
                          bs.shuttle_cock_price, 
                          bs.court_price, 
                       (COALESCE((
                            SELECT 
                                ( SUM(bs_inner.quantity * st.price) / 4) + bs.court_price
                            FROM buffet_newbie_shuttlecocks bs_inner
                            JOIN shuttlecock_types st ON bs_inner.shuttlecock_type_id = st.id
                            WHERE bs_inner.buffet_id = b.id
                        ), bs.court_price)
                    ) AS totalCourtPrice
                        FROM 
                          buffet_setting_newbie bs
                        JOIN 
                          buffet_newbie b ON b.id = ?
                        WHERE 
                          bs.isStudent = b.isStudent
                        GROUP BY 
                          bs.shuttle_cock_price, 
                          bs.court_price
                      `;

                    const [buffetUpdateResult] = await connection.query<RowDataPacket[]>(buffetUpdateQuery, [id]);

                    if (buffetUpdateResult.length === 0) {
                        return res.status(400).json({ error: "No buffet_newbie settings found for the given buffet_newbie." });
                    }

                    const totalShuttleCock = buffetUpdateResult[0].totalCourtPrice;

                    const buffetUpdate = `
                        UPDATE buffet_newbie
                        SET 
                          paymentSlip = ?, 
                          price = ?, 
                          paymentStatus = '${buffetPaymentStatusEnum.CHECKING}',
                          pay_date = ?,
                          paymethod_shuttlecock = 3
                        WHERE id = ?
                      `;

                    await connection.query(buffetUpdate, [result.secure_url, totalShuttleCock, today, id]);

                    await connection.query(`
                            UPDATE pos_customers
                            SET paymentStatus = '${customerPaymentStatusEnum.CHECKING}', 
                            paymentSlip = ?, 
                            courtPrice = ?,
                            pay_by = ?
                            WHERE CustomerID = (
                              SELECT customerID 
                              FROM (SELECT customerID FROM pos_customers WHERE playerId = ? AND buffetStatus = '${buffetStatusEnum.BUFFET_NEWBIE}') AS temp
                            )
                          `, [result.secure_url, totalShuttleCock, PayByEnum.TRANSFER, id]);

                    return res.status(200).json({ imageUrl: result.secure_url });

                } catch (error) {
                    console.error('Error flagging sale as deleted:', error);

                    return res.status(500).json({ error: 'Server error' });
                }
                } else {
                return res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
            }
        }
        else {
            return res.status(405).json({ error: 'Method not allowed' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Error inserting data' });
    } finally {
        connection.release();
    }
}