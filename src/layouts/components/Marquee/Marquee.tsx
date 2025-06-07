import React, { useEffect, useState } from 'react';
import styles from './Marquee.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { IUser } from '../../../utils/interfaces/user';
import useLoadingUser from '../../../hooks/useLoadingUser';

const announcement = [
  'Phim bom tấn mới đổ bộ - Sẵn sàng bùng nổ màn ảnh!',
  'Những pha hành động mãn nhãn không thể bỏ lỡ!',
  'Đặt vé ngay hôm nay - Trải nghiệm điện ảnh đỉnh cao!',
  'Mua vé ngay để nhận ưu đãi siêu hấp dẫn!',
  'Combo bắp nước giá sốc - Chỉ có tại rạp!',
  'Cảm xúc thăng hoa cùng những siêu phẩm điện ảnh!',
  'Review cực hot từ khán giả - Đừng bỏ lỡ!',
  'Phim hay mỗi tuần, rạp chiếu luôn sẵn sàng đón bạn!',
  'Vé giới hạn - Nhanh tay kẻo hết!',
  'Xem ngay trailer để không bỏ lỡ siêu phẩm!'
];

type stateValue = {
  auth: authState
}

type authState = {
  currentUser: IUser
}
const Marquee: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const [fade, setFade] = useState<string>(styles.marqueeFadeIn);
  const [userName, setUserName] = useState<string>('');
  const loading = useLoadingUser();
  const navigate = useNavigate();
  const user = useSelector((state: stateValue) => {
    return state.auth.currentUser
  })

  useEffect(() => {
    if (user && typeof user.firstName === 'string') {
      setUserName(user.firstName);
    }
  }, [user]);



  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    try {
      const res = await fetch('http://localhost:4000/api/v1/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Đăng xuất thất bại');
      }

      localStorage.removeItem('token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('bookingInfo');
      navigate('/');
      setUserName('');
    } catch (error) {
      console.log(error);
    }
  };
  useEffect(() => {
    const interval = setInterval(() => {
      setFade(styles.marqueeFadeout);
      setTimeout(() => {
        setIndex((prevIndex) => (prevIndex + 1) % announcement.length);
        setFade(styles.marqueeFadeIn);
      }, 2000);
    }, 7000);

    return () => clearInterval(interval);
  }, [index]);

  const handleProfileClick = () => {
    navigate(`/p/${user?._id}`);
  };

  return (
    <div className={styles.marqueeWrapper}>
      <div className={`${styles.marqueeContent} ${fade}`}>
        <span>{announcement[index]}</span>
      </div>

      {userName ? loading ? <FontAwesomeIcon icon={faSpinner} spin /> : (
        <div className={styles.auth}>
          <span onClick={handleProfileClick} style={{ cursor: 'pointer', color: 'blue' }}>
            Welcome, {userName}!
          </span>
          <button onClick={handleLogout}>Logout</button>
        </div>
      ) : (
        <div className={styles.auth}>
          <ul>
            <li><Link to="/login">Đăng Nhập</Link></li>
            <li><Link to="/register">Đăng ký</Link></li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default Marquee;
