import React from "react";
import { Container, Row } from "reactstrap";
import { Link } from "react-router-dom";
import styles from "./Footer.module.scss"; 

type Props = {};

const Footer: React.FC<Props> = () => {
  return (
    <footer className={styles.footer__container}>
      <Container>
        <Row>
          <div className={styles.footer__top}>
            <div className={styles.footer__item}>
              <h5>Tổng quan</h5>
              <ul>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Giới thiệu</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Tuyển dụng</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Liên hệ</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Chính sách sử dụng</Link>
                </li>
              </ul>
            </div>

            <div className={styles.footer__item}>
              <h5>Các cụm rạp</h5>
              <ul>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Hà Nội</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Bắc Ninh</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Thái Nguyên</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Hà Nam</Link>
                </li>
              </ul>
            </div>

            <div className={styles.footer__item}>
              <h5>Các dịch vụ</h5>
              <ul>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Đặt vé Online</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Đặt vé trực tiếp</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Combo ưu đãi</Link>
                </li>
                <li>
                  <i className="ri-arrow-drop-right-line"></i>
                  <Link to="">Ngày lễ</Link>
                </li>
              </ul>
            </div>

            <div className={styles.footer__item}>
              <h5>Liên hệ</h5>
              <p>Công ty cổ phần trách nhiệm hữu hạn</p>
              <Link className={styles.mailto} to="mailto:email@gmail.com">
                email@gmail.com
              </Link>
            </div>
          </div>
        </Row>
      </Container>
    </footer>
  );
};

export default Footer;
