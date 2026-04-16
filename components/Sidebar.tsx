import React, { useState } from 'react';
import Link from 'next/link';
import styles from './styles/Sidebar.module.css';
import { useRouter } from 'next/router';
import { FaChalkboard, FaChevronCircleRight, FaChevronCircleDown, FaCalendarPlus, FaCalendarDay, FaCalendarAlt, FaPencilAlt, FaHandPointRight, FaRegClock, FaTh, FaAngellist } from "react-icons/fa";
import { IoMdAdd } from "react-icons/io";
import { BiDetail } from "react-icons/bi";
import { HiOutlineQueueList } from "react-icons/hi2";
import { GrDocumentText } from "react-icons/gr";

import { useMediaQuery } from 'react-responsive';
interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;

}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, toggleSidebar }) => {
  const router = useRouter();
  const [selectedSubMenu1, setSelectedSubMenu1] = useState(true);
  const [selectedSubMenu3, setSelectedSubMenu3] = useState(true);
  const [selectedSubMenu4, setSelectedSubMenu4] = useState(true);
  const [selectedSubMenu5, setSelectedSubMenu5] = useState(true);

  const isMobile = useMediaQuery({ maxWidth: 767 }); // กำหนดจุด breakpoint ของมือถือ

  const handleMenuItemClick = () => {
    if (isMobile) {
      toggleSidebar()
    }
  };



  return (
    <div className={`${styles.sidebar} ${isOpen ? styles.open : ''}`}>
      <div className={styles.menu}>
        <ul className={styles['menu-list']}>

          <Link href="/" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['menu-item']} ${router.pathname === '/' ? styles.activeMenuItem : ''}`}>< FaChalkboard className='mx-1' /> <span> กฎการใช้สนาม</span> </li></Link>
          <li

            className={`${styles['menu-item']} ${router.pathname === '/booking/[id]' || router.pathname === '/reservations/[id]' || router.pathname === '/booking/Reserve/[id]' ? styles.activeMenuItem : ''}`}
            onClick={() => { setSelectedSubMenu1(!selectedSubMenu1); }}
          >
            {selectedSubMenu1 === true ? (
              <a> <FaChevronCircleDown /> <span style={{ marginLeft: "10px" }}>จองสนาม</span></a>
            ) : <a> <FaChevronCircleRight /> <span style={{ marginLeft: "10px" }}>จองสนาม</span></a>}
            {(
              <ul className={`${styles['sub-menu']}  ${selectedSubMenu1 ? styles.selectedSubMenu : ''}`} onClick={(e) => e.stopPropagation()}>
                <Link href="/booking/0" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/booking/[id]' || router.pathname === '/booking/Reserve/[id]' ? styles.activeSubMenu : ''}`} ><FaCalendarPlus className='mx-1' /> <span> จองสนามแบดมินตัน</span> </li></Link>
                <Link href="/reservations/0" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/reservations/[id]' ? styles.activeSubMenu : ''}`} ><FaCalendarAlt className='mx-1' /> <span>ข้อมูลการจอง</span> </li></Link>
                <Link href="/booking/buffet" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/booking/buffet' ? styles.activeSubMenu : ''}`} ><IoMdAdd className='mx-1' /> <span>จองตีบุฟเฟ่ต์</span> </li></Link>
                <Link href="/booking/buffet/info" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/booking/buffet/info' ? styles.activeSubMenu : ''}`} ><BiDetail className='mx-1' /> <span>ข้อมูลตีบุฟเฟ่ต์</span> </li></Link>
                <Link href="/booking/buffet/queue" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/booking/buffet/queue' ? styles.activeSubMenu : ''}`} ><HiOutlineQueueList className='mx-1' /> <span>คิวตีบุฟเฟ่ต์</span> </li></Link>

              </ul>
            )}
          </li>
          <li
            className={`${styles['menu-item']} ${router.pathname === '/Tournament' || router.pathname === '/Tournament/detail' ? styles.activeMenuItem : ''}`}
            onClick={() => setSelectedSubMenu3(!selectedSubMenu3)}
          >
            {selectedSubMenu3 === true ? (
              <a> <FaChevronCircleDown /> <span style={{ marginLeft: "10px" }}>การสมัครแข่งขัน</span></a>
            ) : <a> <FaChevronCircleRight /> <span style={{ marginLeft: "10px" }}>การสมัครแข่งขัน</span></a>}
            {(
              <ul className={`${styles['sub-menu']}  ${selectedSubMenu3 ? styles.selectedSubMenu : ''}`} onClick={(e) => e.stopPropagation()}>
                <Link href="/Tournament" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/Tournament' ? styles.activeSubMenu : ''}`}><FaHandPointRight className='mx-1' /> <span>สมัครแข่งขัน</span></li></Link>
                <Link href="/Tournament/detail" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/Tournament/detail' ? styles.activeSubMenu : ''}`}><FaAngellist className='mx-1' /> <span>ตรวจสอบผู้สมัคร</span></li></Link>
              </ul>
            )}
          </li>
          <li

            className={`${styles['menu-item']} ${router.pathname === '/practice-court/booking/[id]' || router.pathname === '/practice-court/details/[id]' ? styles.activeMenuItem : ''}`}
            onClick={() => { setSelectedSubMenu4(!selectedSubMenu4); }}
          >
            {selectedSubMenu4 === true ? (
              <a> <FaChevronCircleDown /> <span style={{ marginLeft: "10px" }}>จองสนามซ้อม</span></a>
            ) : <a> <FaChevronCircleRight /> <span style={{ marginLeft: "10px" }}>จองสนามซ้อม</span></a>}
            {(
              <ul className={`${styles['sub-menu']}  ${selectedSubMenu4 ? styles.selectedSubMenu : ''}`} onClick={(e) => e.stopPropagation()}>
                <Link href="/practice-court/booking/0" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/practice-court/booking/[id]'  ? styles.activeSubMenu : ''}`} ><FaCalendarPlus className='mx-1' /> <span>จองสนามซ้อม</span> </li></Link>
                <Link href="/practice-court/details/0" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/practice-court/details/[id]' ? styles.activeSubMenu : ''}`} ><FaCalendarAlt className='mx-1' /> <span>ข้อมูลการจอง</span> </li></Link>
              </ul>
            )}
          </li>
          <li
            className={`${styles['menu-item']} ${router.pathname === '/guest-register' || router.pathname ===  '/guest-register/guest-register-info' ? styles.activeMenuItem : ''}`}
            onClick={() => setSelectedSubMenu5(!selectedSubMenu5)}
          >
            {selectedSubMenu5 === true ? (
              <a> <FaChevronCircleDown /> <span style={{ marginLeft: "10px" }}>ลงชื่อซื้อของ</span></a>
            ) : <a> <FaChevronCircleRight /> <span style={{ marginLeft: "10px" }}>ลงชื่อซื้อของ</span></a>}
            {(
              <ul className={`${styles['sub-menu']}  ${selectedSubMenu5 ? styles.selectedSubMenu : ''}`} onClick={(e) => e.stopPropagation()}>
                <Link href="/guest-register" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']} ${router.pathname === '/guest-register' ? styles.activeSubMenu : ''}`} ><IoMdAdd className='mx-1' /> <span>ลงทะเบียน</span> </li></Link>
                <Link href="/guest-register/guest-register-info" className={styles.link} ><li onClick={handleMenuItemClick} className={`${styles['sub-menu-item']}  ${router.pathname === '/guest-register/guest-register-info' ? styles.activeSubMenu : ''}`} ><BiDetail className='mx-1 ' /> <span>รายชื่อ/การชำระเงิน</span> </li></Link>

              </ul>
            )}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
