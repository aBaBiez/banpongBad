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

type ParsedFields = Record<string, Array<string | undefined>>;
type ParsedFile = { path?: string };
type ParsedFiles = Record<string, ParsedFile[]>;
const firstFieldValue = (fields: ParsedFields, key: string) => fields[key]?.[0] ?? '';

const parseForm = (req: NextApiRequest) =>
    new Promise<{ fields: ParsedFields; files: ParsedFiles }>((resolve, reject) => {
        const form = new multiparty.Form();
        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({ fields: fields as ParsedFields, files: files as ParsedFiles });
        });
    });



export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const connection = await pool.getConnection();

    try {
        const { fields, files } = await parseForm(req);
        if (req.method == 'POST') {
            const nickname = firstFieldValue(fields, 'nickname');
            const usedate = firstFieldValue(fields, 'usedate');
            const phone = firstFieldValue(fields, 'phone');
            const isStudent = firstFieldValue(fields, 'isStudent');
            const skillLevel = firstFieldValue(fields, 'skillLevel');
            if (!nickname || !usedate || !phone || !skillLevel) {
                return res.status(400).json({ error: 'Missing required fields' });
            }

            const query = `INSERT INTO buffet (nickname, usedate, phone ,isStudent,skillLevel ) VALUES (?, ?, ? , ? , ?)`;
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
                const [insertCustomerResults] = await connection.query<ResultSetHeader>(insertCustomerQuery, [results.insertId, phone, nickname, buffetStatusEnum.BUFFET]);
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
            const idRaw = firstFieldValue(fields, 'id');
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
                    const [buffetRows] = await connection.query<RowDataPacket[]>(
                        `SELECT isStudent FROM buffet WHERE id = ? LIMIT 1`,
                        [id]
                    );
                    if (!buffetRows.length) {
                        return res.status(404).json({ error: 'Buffet not found' });
                    }
                    const isStudent = buffetRows[0].isStudent;

                    const [settingRows] = await connection.query<RowDataPacket[]>(
                        `SELECT court_price FROM buffet_setting WHERE isStudent = ? LIMIT 1`,
                        [isStudent]
                    );
                    if (!settingRows.length) {
                        return res.status(400).json({ error: 'No buffet settings found for the given buffet.' });
                    }
                    const courtPrice = Number(settingRows[0].court_price ?? 0);

                    const [shuttlecockRows] = await connection.query<RowDataPacket[]>(
                        `SELECT COALESCE(SUM(bs.quantity * st.price) / 4, 0) AS shuttlecock_total
                         FROM buffet_shuttlecocks bs
                         JOIN shuttlecock_types st ON bs.shuttlecock_type_id = st.id
                         WHERE bs.buffet_id = ?`,
                        [id]
                    );
                    const shuttlecockTotal = Number(shuttlecockRows[0]?.shuttlecock_total ?? 0);
                    const totalShuttleCock = courtPrice + shuttlecockTotal;

                    const buffetUpdate = `
                        UPDATE buffet
                        SET 
                          paymentSlip = ?, 
                          price = ?, 
                          paymentStatus = '${buffetPaymentStatusEnum.CHECKING}',
                          pay_date = ?,
                          paymethod_shuttlecock = 3
                        WHERE id = ?
                      `;

                    await connection.query(buffetUpdate, [result.secure_url, totalShuttleCock, today, id]);

                    const [customerRows] = await connection.query<RowDataPacket[]>(
                        `SELECT customerID
                         FROM pos_customers
                         WHERE playerId = ? AND buffetStatus = ?
                         ORDER BY customerID DESC
                         LIMIT 1`,
                        [id, buffetStatusEnum.BUFFET]
                    );
                    if (customerRows.length) {
                        await connection.query(
                            `UPDATE pos_customers
                             SET paymentStatus = ?, paymentSlip = ?, courtPrice = ?, pay_by = ?
                             WHERE customerID = ?`,
                            [
                                customerPaymentStatusEnum.CHECKING,
                                result.secure_url,
                                totalShuttleCock,
                                PayByEnum.TRANSFER,
                                customerRows[0].customerID,
                            ]
                        );
                    }

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