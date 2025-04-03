import React, { useEffect, useState } from 'react';
import styles from './Marquee.module.scss';
import { Link, useNavigate } from 'react-router-dom';
import useUser from '../../../hooks/useUser';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSpinner } from '@fortawesome/free-solid-svg-icons';
import useLoading from '../../../hooks/useLoading';

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

const Marquee: React.FC = () => {
  const [index, setIndex] = useState<number>(0);
  const [fade, setFade] = useState<string>(styles.marqueeFadeIn);
  const [userName, setUserName] = useState<string>('');
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    if (user && typeof user.firstName === 'string') {
      setUserName(user.firstName);
    }
  }, [user]);



  const handleLogout = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch('https://api01.f8team.dev/api/auth/logout', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!res.ok) {
        throw new Error('Đăng xuất thất bại');
      }

      localStorage.removeItem('token');
      navigate('/');
      setUserName('');
      setLoading(false)
    } catch (error) {
      console.log(error);
    }
    finally {
      setLoading(false)
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
    navigate(`/p/${user?.id}`);
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
