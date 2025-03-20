import React, { useEffect, useState } from 'react';
import styles from './Marquee.module.scss';
import { Link } from 'react-router-dom';

const announcement = [
  'Chào mừng bạn đến với website!',
  'Đăng nhập ngay để nhận ưu đãi đặc biệt!',
  'Khuyến mãi sốc chỉ có hôm nay!',
  'Hỗ trợ khách hàng 24/7 - Liên hệ ngay!'
];

const Marquee: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [fade, setFade] = useState(styles.marqueeFadeIn); 

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(styles.marqueeFadeout); 
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % announcement.length);  
        setFade(styles.marqueeFadeIn);
      }, 2000); 
    }, 7000); 

    return () => clearInterval(interval);
  }, []);

  return (
    <div className={styles.marqueeWrapper}>
      <div className={`${styles.marqueeContent} ${fade}`}>
        <span>{announcement[index]}</span>
      </div>
      <div className={styles.auth}>
        <ul>
            <li><Link to="/login">Đăng Nhập</Link></li>
            <li><Link to="register">Đăng ký</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default Marquee;
