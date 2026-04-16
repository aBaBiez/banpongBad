import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import 'react-datepicker/dist/react-datepicker.css';
import Swal from 'sweetalert2';
import Head from 'next/head';
import DatePicker from 'react-datepicker';
import { format } from 'date-fns';
import styles from '@/styles/admin/reserved/new_reserved.module.css';
import { utcToZonedTime } from 'date-fns-tz';
import { IsStudentEnum } from '@/enum/StudentPriceEnum';
import { buffetPaymentStatusEnum } from '@/enum/buffetPaymentStatusEnum';
import { customerPaymentStatusEnum } from '@/enum/customerPaymentStatusEnum';
import CustomTable from '@/components/table/customTable';
import useDebounce from '@/hook/use-debounce';
import { OptionType } from '@/components/admin/AbbreviatedSelect';
import { IShuttlecockDetails } from '@/interface/buffet';
import { ShuttleCockTypes } from '../booking/buffet';
import ShuttleCockControl from '../booking/buffet/ShuttleCockControl';
import { PaymethodShuttlecockEnum } from '@/enum/paymethodShuttlecockEnum';
import { PayByEnum } from '@/enum/payByEnum';

interface Buffet {
  id: number;
  name: string;
  nickname: string;
  usedate: string;
  phone: string;
  paymentStatus: number;
  paymentSlip: string;
  paymethod_shuttlecock: string;
  pay_date: string;
  isStudent: IsStudentEnum;
  shoppingMoney?: string;
  total_price?: string;
  total_items: number;
  court_price: number;
  shuttlecock_details: IShuttlecockDetails[];
  shuttlecock_total_price: number;
}

interface Props {
  date: string;
}

function ListNotPayBuffet({ date }: Props) {
  const [buffetData, setBuffetData] = useState<Buffet[]>([]);
  const [editBuffet, setEditBuffet] = useState<Buffet | null>(null);
  const [shuttleCockTypes, setShuttleCockTypes] = useState<OptionType[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [total_items, setTotal_items] = useState(0);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const baseUrl = '/api/admin/buffet';

  const loadData = () => {
    setLoading(true);
    setBuffetData([]);
    fetch(`${baseUrl}/get/getNotpay_buffet?usedate=${date}&page=${currentPage}&limit=${itemsPerPage}&search=${debouncedSearchTerm}`)
      .then((response) => response.json())
      .then((data) => {
        setBuffetData(data.data);
        setTotal_items(data.totalItems);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, [currentPage, debouncedSearchTerm]);

  useEffect(() => {
    fetch(`${baseUrl}/get_shuttlecock_types`)
      .then((response) => response.json())
      .then((data) => {
        const formattedData = data.map((item: ShuttleCockTypes) => ({
          id: item.id,
          label: `${item.name} - ${item.price}฿/ลูก (คนละ ${item.price / 4}฿)`,
          code: item.code,
          name: item.name,
          price: item.price,
        }));
        setShuttleCockTypes(formattedData);
      });
  }, []);

  const getByID = (id?: number) => {
    const buffetId = id || editBuffet?.id;
    fetch(`${baseUrl}/get/get_by_id?id=${buffetId}`)
      .then((response) => response.json())
      .then((data) => setEditBuffet(data.data));
  };

  const status = (value: number) => (
    <div className="text-center" style={{ borderRadius: '8px', backgroundColor: value === 0 ? '#eccccf' : value === 1 ? '#FDCE4E' : value === 2 ? '#d1e7dd' : '#eccccf' }}>
      {value === 0 ? 'ยังไม่ชำระ' : value === 1 ? 'รอตรวจสอบ' : value === 2 ? 'ชำระแล้ว' : 'สลิปไม่ถูกต้อง'}
    </div>
  );

  const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 1000,
    timerProgressBar: true,
  });

  const slipCheck = async (id: number, slip_url: string) => {
    const response = await fetch(`${baseUrl}/get/get_by_id?id=${id}`);
    const data = await response.json();
    const buffetDataById = data.data as Buffet;
    Swal.fire({
      title: `ยอดชำระ ${buffetDataById.total_price} บาท `,
      showDenyButton: true,
      showCancelButton: true,
      imageUrl: `${slip_url}`,
      confirmButtonText: 'อนุมัติ',
      denyButtonText: 'สลิปไม่ถูกต้อง',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (!result.isConfirmed && !result.isDenied) return;
      const payload = result.isConfirmed
        ? { id, status: buffetPaymentStatusEnum.PAID, customerPaymentStatus: customerPaymentStatusEnum.PAID }
        : { id, status: buffetPaymentStatusEnum.REJECT, customerPaymentStatus: customerPaymentStatusEnum.REJECT };
      const statusResponse = await fetch(`${baseUrl}/update_status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!statusResponse.ok) {
        Swal.fire({ title: 'มีข้อผิดพลาด!', text: 'กรุณาลองใหม่อีกครั้ง', icon: 'error' });
        return;
      }
      loadData();
      Toast.fire({ icon: result.isConfirmed ? 'success' : 'error', title: result.isConfirmed ? 'อนุมัติเรียบร้อย!' : 'ไม่อนุมัติ!' });
    });
  };

  const saveEdit = () => {
    fetch(`${baseUrl}/updateData`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(editBuffet),
    }).then(() => {
      loadData();
      setEditBuffet(null);
    });
  };

  const deleteBooking = (id: number, nickname: string) => {
    Swal.fire({ title: `ยืนยันลบการจองของ ${nickname} ?`, showCancelButton: true, confirmButtonText: 'ยืนยัน', cancelButtonText: 'ยกเลิก' }).then(async (result) => {
      if (!result.isConfirmed) return;
      await fetch(`${baseUrl}/updateData?id=${id}`, { method: 'DELETE' });
      loadData();
      Toast.fire({ icon: 'success', title: 'ลบสำเร็จ!' });
    });
  };

  const payMethod = async (id: number | undefined, method: string, paymethodShuttlecock: PaymethodShuttlecockEnum, pay_by: PayByEnum) => {
    if (!id) return;
    Swal.fire({
      title: `รับชำระด้วย ${method}?`,
      text: `ลูกค้าชำระค่าสินค้า/บริการด้วย ${method} ทั้งหมด ${editBuffet?.total_price} บาท`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (!result.isConfirmed) return;
      await fetch(`${baseUrl}/pay_shuttle_cock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, paymethodShuttlecock, courtPrice: editBuffet?.total_price ?? 0, pay_by }),
      });
      loadData();
      setEditBuffet(null);
    });
  };

  const dateInBangkok = utcToZonedTime(new Date(), 'Asia/Bangkok');

  const handleCheckboxChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value as IsStudentEnum;
    const newIsStudent = value === editBuffet?.isStudent ? IsStudentEnum.None : value;
    if (!editBuffet) return;
    setEditBuffet({ ...editBuffet, isStudent: newIsStudent });
  };

  const columns = [
    { label: 'ชื่อเล่น', key: 'nickname' },
    { label: 'โทรศัพท์', key: 'phone' },
    { label: 'วันที่เล่น', key: 'usedate', formatter: (_: unknown, row: Buffet) => new Date(row.usedate).toLocaleDateString('th-TH') },
    { label: 'สถานะ', key: 'paymentStatus', formatter: (_: unknown, row: Buffet) => status(row.paymentStatus) },
    {
      label: 'Actions',
      key: 'actions',
      formatter: (_: unknown, row: Buffet) => (
        <div className="d-flex justify-content-around">
          <Button className="btn btn-sm" onClick={() => slipCheck(row.id, row.paymentSlip)} disabled={!row.paymentSlip}>เช็คสลิป</Button>
          <Button className="btn btn-warning btn-sm" onClick={() => getByID(row.id)}>แก้ไข</Button>
          <Button className="btn btn-danger btn-sm" onClick={() => deleteBooking(row.id, row.nickname)}>ลบ</Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head><title>Buffet Reserved</title></Head>
      <div style={{ margin: 'auto', maxWidth: '1000px', overflow: 'auto' }}>
        <h3>รายชื่อผู้ยังไม่ชำระเงิน วันที่ {date}</h3>
        <form className={styles.searchForm}>
          <input className={styles.searchInput} type="text" placeholder="ชื่อ/เบอร์/วันที่เล่น" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button className={styles.searchButton} type="submit">Search</button>
        </form>
        <CustomTable data={buffetData} columns={columns} isLoading={loading} currentPage={currentPage} totalPages={Math.ceil(total_items / itemsPerPage)} itemsPerPage={itemsPerPage} onPageChange={setCurrentPage} isShowPagination />
      </div>
      <Modal show={editBuffet !== null} onHide={() => setEditBuffet(null)} centered keyboard={false} fullscreen="sm-down">
        <Modal.Header closeButton><Modal.Title>แก้ไขข้อมูล</Modal.Title></Modal.Header>
        <Modal.Body className="modal-scroll-body">
          {editBuffet && (
            <Form>
              <Form.Group controlId="formNickname"><Form.Label>ชื่อเล่น</Form.Label><Form.Control type="text" value={editBuffet.nickname} onChange={(e) => setEditBuffet({ ...editBuffet, nickname: e.target.value })} /></Form.Group>
              <Form.Group controlId="formPhone"><Form.Label>เบอร์</Form.Label><Form.Control type="string" maxLength={10} value={editBuffet.phone} onChange={(e) => setEditBuffet({ ...editBuffet, phone: e.target.value })} /></Form.Group>
              <div className={`${styles.checkbox_wrapper} d-flex mt-3`}><input type="checkbox" id="cbtest-19-1" value={IsStudentEnum.Student} onChange={handleCheckboxChange} checked={editBuffet.isStudent === IsStudentEnum.Student} /><label htmlFor="cbtest-19-1" className={styles.check_box}></label><p className="mx-2" style={{ padding: '0' }}>นักเรียน</p></div>
              <div className={`${styles.checkbox_wrapper} d-flex`}><input type="checkbox" id="cbtest-19-2" value={IsStudentEnum.University} onChange={handleCheckboxChange} checked={editBuffet.isStudent === IsStudentEnum.University} /><label htmlFor="cbtest-19-2" className={styles.check_box}></label><p className="mx-2" style={{ padding: '0' }}>นักศึกษา</p></div>
              <div style={{ backgroundColor: '#e5fffb', padding: '10px', borderRadius: '8px' }}>
                <p className="text-center" style={{ backgroundColor: '#4ef3fc', borderRadius: '8px' }}>ส่วนจำนวนลูกกดเปลี่ยนแล้วมีผลทันที</p>
                {shuttleCockTypes.map((type) => {
                  const matched = editBuffet.shuttlecock_details?.find((detail) => detail.shuttlecock_type_id === type.id);
                  const quantity = matched?.quantity || 0;
                  return (
                    <div key={type.id} className="d-flex justify-content-between align-items-center">
                      <p className="mb-0">{type.label}</p>
                      <ShuttleCockControl buffetId={editBuffet.id} shuttlecockTypeId={type.id} initialQty={quantity} onUpdated={getByID} />
                    </div>
                  );
                })}
              </div>
              <Form.Group controlId="formPrice" className="mt-2"><Form.Label>รวมค่าลูก (หาร 4 แล้ว)</Form.Label><Form.Control className="w-100" readOnly type="number" value={editBuffet.shuttlecock_total_price} /></Form.Group>
              <Form.Group controlId="formPrice"><Form.Label>ค่าสนาม</Form.Label><Form.Control className="w-100" readOnly type="number" value={editBuffet.court_price} /></Form.Group>
              <Form.Group controlId="formPrice"><Form.Label>ยอดซื้อของ</Form.Label><Form.Control className="w-100" readOnly type="number" value={editBuffet.shoppingMoney} /></Form.Group>
              <Form.Group controlId="formPrice"><Form.Label>ยอดรวม สนาม + ลูก + ซื้อของ</Form.Label><Form.Control className="w-100" type="number" readOnly value={editBuffet.total_price} /></Form.Group>
              <Form.Group controlId="formUsedate"><Form.Label>วันที่เล่น</Form.Label><DatePicker className="w-100" selected={editBuffet.usedate ? new Date(editBuffet.usedate) : null} onChange={(date) => date && setEditBuffet({ ...editBuffet, usedate: format(date, 'dd MMMM yyyy') })} dateFormat="dd MMMM yyyy" /></Form.Group>
              <Form.Group controlId="formPayDate"><Form.Label>วันที่ชำระเงิน</Form.Label><DatePicker className="w-100" selected={editBuffet.pay_date ? new Date(editBuffet.pay_date) : null} onChange={(date) => date && setEditBuffet({ ...editBuffet, pay_date: format(date, 'dd MMMM yyyy') })} dateFormat="dd MMMM yyyy" /><Button className="mx-3 mt-2" onClick={() => setEditBuffet({ ...editBuffet, pay_date: format(dateInBangkok, 'dd MMMM yyyy') })}>วันนี้</Button></Form.Group>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>รับชำระ <Button className="mx-2" onClick={() => payMethod(editBuffet?.id, 'โอนเงิน', PaymethodShuttlecockEnum.TRANSFER_ADMIN, PayByEnum.TRANSFER)}>ผ่านการโอน</Button></div>
          <div><Button variant="secondary me-2" onClick={() => setEditBuffet(null)}>ปิด</Button><Button variant="primary" onClick={saveEdit}>บันทึก</Button></div>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default ListNotPayBuffet;
