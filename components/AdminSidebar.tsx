import React, { useState } from 'react';
import Link from 'next/link';
import styles from './styles/admin/AdminSidebar.module.css';
import { useRouter } from 'next/router';
import { FiLogOut } from 'react-icons/fi';
import { MdFiberNew } from 'react-icons/md';
import { signOut } from 'next-auth/react';

import { FaChalkboard, FaChevronCircleRight, FaChevronCircleDown, FaCalendarPlus, FaCalendarDay, FaCalendarAlt, FaPencilAlt, FaHandPointRight, FaRegClock, FaTh, FaRegMoneyBillAlt, FaSearch } from "react-icons/fa";
import { useMediaQuery } from 'react-responsive';
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;

}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const isMobile = useMediaQuery({ maxWidth: 767 }); // กำหนดจุด breakpoint ของมือถือ
  const handleMenuItemClick = () => {
    if (isMobile) {
      toggleSidebar()
    }
  };
  const router = useRouter();
  const [selectedSubMenu1, setSelectedSubMenu1] = useState(true);
  const [selectedSubMenu2, setSelectedSubMenu2] = useState(true);

  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.menu}>
        <ul className={styles['menu-list']}>

          <Link href="/admin/backend" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend' ? styles.activeMenuItem : ''}`}> <div><FaChalkboard /> <span> ตั้งค่ากฎ</span></div> </li></Link>
          <Link href="/admin/backend/dailySummary" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/dailySummary' ? styles.activeMenuItem : ''}`}> <div><FaRegMoneyBillAlt /> <span> สรุปยอดรายวัน</span></div> </li></Link>

          <li
            className={`${styles['menu-item']} ${router.pathname.startsWith('/admin/backend/booking/') ? styles.activeMenuItem : ''}`}
            onClick={() => setSelectedSubMenu1(!selectedSubMenu1)}
          >
            {selectedSubMenu1 === true ? (
              <a> <FaChevronCircleDown /> <span style={{ marginLeft: "10px" }}>การจองสนาม</span></a>
            ) : <a> <FaChevronCircleRight /> <span style={{ marginLeft: "10px" }}>การจองสนาม</span></a>}

            {(
              <ul className={`${styles['sub-menu']}  ${selectedSubMenu1 ? styles.selectedSubMenu : ''}`} onClick={(e) => e.stopPropagation()}>
                <Link href="/admin/backend/booking/0" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/booking/[id]' || router.pathname === '/booking/Reserve/[id]' ? styles.activeSubMenu : ''}`} > <div><FaCalendarPlus /> <span> จองสนาม</span></div></li></Link>
                <Link href="/admin/backend/booking/holidays" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/booking/holidays' ? styles.activeSubMenu : ''}`} ><div><FaCalendarDay /> <span>วันหยุด</span> </div></li></Link>
                <Link href="/admin/backend/booking/new_reserved?state=1" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/booking/new_reserved' ? styles.activeSubMenu : ''}`} ><div><MdFiberNew /> <span>การจองใหม่</span> </div></li></Link>
                <Link href="/admin/backend/booking/bookinghistory" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/booking/bookinghistory' ? styles.activeSubMenu : ''}`} ><div><FaSearch /> <span>ค้นหาการจอง</span></div></li></Link>
                <Link href="/admin/backend/booking/buffet/reserved" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/booking/buffet/reserved' ? styles.activeSubMenu : ''}`} ><div><FaSearch /> <span>บุฟเฟต์/สลิป</span></div></li></Link>
                <Link href="/admin/backend/booking/buffet" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/booking/buffet' ? styles.activeSubMenu : ''}`} ><div><FaCalendarAlt /> <span>คิวบุฟเฟ่ต์/ค่าลูก</span></div></li></Link>

              </ul>
            )}
          </li>

          <li
            className={`${styles['menu-item']} ${router.pathname.startsWith('/admin/backend/tournament/') ? styles.activeMenuItem : ''}`}
            onClick={() => setSelectedSubMenu2(!selectedSubMenu2)}
          >
            {selectedSubMenu2 === true ? (
              <a>  <FaChevronCircleDown /> <span style={{ marginLeft: "10px" }}>การแข่งขัน</span> </a>
            ) : <a><FaChevronCircleRight /> <span style={{ marginLeft: "10px" }}></span>การแข่งขัน</a>}
            {(
              <ul className={`${styles['sub-menu']}  ${selectedSubMenu2 ? styles.selectedSubMenu : ''}`} onClick={(e) => e.stopPropagation()}>                <Link href="/admin/backend/tournament/newregis?status=0&paymentStatus=all" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/tournament/newregis' ? styles.activeSubMenu : ''}`}> <div><FaHandPointRight /> <span>ผู้สมัครทั้งหมด</span></div></li></Link>
                <Link href="/admin/backend/tournament/setting" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/tournament/setting' ? styles.activeSubMenu : ''}`}> <div><FaPencilAlt /> <span>เพิ่ม/ลบ งานแข่ง</span></div> </li></Link>
                <Link href="/admin/backend/tournament/hand_level_setting" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/tournament/hand_level_setting' ? styles.activeSubMenu : ''}`}> <div><FaPencilAlt /> <span>ตั้งค่าระดับมือ</span></div> </li></Link>
                <Link href="/admin/backend/tournament/protest" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/tournament/protest' ? styles.activeSubMenu : ''}`}> <div><FaHandPointRight /> <span>การประท้วง</span></div></li></Link>
              </ul>
            )}
          </li>
          <li
            className={`${styles['menu-item']} ${router.pathname.startsWith('/admin/backend/practice-court/') ? styles.activeMenuItem : ''}`}
            onClick={() => setSelectedSubMenu2(!selectedSubMenu2)}
          >
            {selectedSubMenu2 === true ? (
              <a>  <FaChevronCircleDown /> <span style={{ marginLeft: "10px" }}>จองสนามซ้อม</span> </a>
            ) : <a><FaChevronCircleRight /> <span style={{ marginLeft: "10px" }}></span>จองสนามซ้อม</a>}
            {(
              <ul className={`${styles['sub-menu']}  ${selectedSubMenu2 ? styles.selectedSubMenu : ''}`} onClick={(e) => e.stopPropagation()}>                
                <Link href="/admin/backend/practice-court/booking/0" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/practice-court/booking/[id]' ? styles.activeSubMenu : ''}`}> <div><FaHandPointRight /> <span>จองสนามซ้อม</span></div></li></Link>
                <Link href="/admin/backend/practice-court/holidays" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/practice-court/holidays' ? styles.activeSubMenu : ''}`}> <div><FaPencilAlt /> <span>วันหยุด</span></div> </li></Link>
                <Link href="/admin/backend/practice-court/new_reserved?state=1" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/practice-court/new_reserved' ? styles.activeSubMenu : ''}`}> <div><FaPencilAlt /> <span>การจองใหม่</span></div> </li></Link>
                <Link href="/admin/backend/practice-court/bookinghistory" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/practice-court/bookinghistory' ? styles.activeSubMenu : ''}`}> <div><FaHandPointRight /> <span>ค้นหาการจอง</span></div></li></Link>
                <Link href="/admin/backend/practice-court/title-name" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/practice-court/title-name' ? styles.activeSubMenu : ''}`}> <div><FaHandPointRight /> <span>หัวข้อ</span></div></li></Link>
                <Link href="/admin/backend/practice-court/time-slot" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/practice-court/time-slot' ? styles.activeSubMenu : ''}`}> <div><FaHandPointRight /> <span>เวลา</span></div></li></Link>

              </ul>
            )}
          </li>
          <Link href="/admin/backend/setting/courts" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/setting/courts' ? styles.activeMenuItem : ''}`}> <div> <FaTh /> <span>คอร์ท</span></div> </li></Link>
          <Link href="/admin/backend/setting/timeSlots" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/setting/timeSlots' ? styles.activeMenuItem : ''}`}> <div><FaRegClock /> <span>เวลา</span></div>  </li></Link>
          <Link href="/admin/backend/setting/buffet" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/admin/backend/setting/buffet' ? styles.activeMenuItem : ''}`}> <div><FaRegClock /> <span>บุฟเฟ่ต์</span></div>  </li></Link>

          <Link onClick={() => signOut()} href="" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']}`} > <div><FiLogOut /> <span>ออกจากระบบ</span></div>    </li></Link>
        </ul>

      </div>
    </div>
  );
};

export default Sidebar;
