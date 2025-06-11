import React, { useEffect, useState } from 'react';
import { Card, CardBody, Container, Row, Col } from 'reactstrap';
import Barcode from 'react-barcode';
import styles from './Bill.module.scss';
import { IBill } from '../../../../utils/interfaces/bill';
import useCurrentUser from '../../../../hooks/useCurrentUser';

interface BillComponentProps {
    bill?: IBill | null;
    booking?: string | null;
}

const Bill: React.FC<BillComponentProps> = ({ bill, booking }) => {
    const [billData, setBillData] = useState<IBill | null>(bill || null);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const currentUser = useCurrentUser();

    // Load bill data if not provided
    useEffect(() => {
        const loadBillData = async () => {
            if (booking) {
                setLoading(true);
                setError('');
                try {
                    const billResponse = await fetch(`http://localhost:4000/api/v1/bills/booking/${booking}`, {
                        method: 'GET'
                    });

                    const data = await billResponse.json();
                    console.log(data.data);
                    setBillData(data.data);

                } catch (error) {
                    console.error('Failed to load bill data:', error);
                    setError('Không thể tải thông tin hóa đơn');
                } finally {
                    setLoading(false);
                }
            }
        };

        loadBillData();
    }, [bill, booking]);

    // Generate barcode value from bill ID
    const generateBarcodeValue = (billId: string): string => {
        if (!billId) return '000000000000';

        // Convert ObjectId to numeric string for barcode
        // Take the last 12 characters and convert hex to decimal
        const hex = billId.slice(-12);
        let numeric = '';

        for (let i = 0; i < hex.length; i += 2) {
            const hexPair = hex.substr(i, 2);
            const decimal = parseInt(hexPair, 16);
            numeric += decimal.toString().padStart(2, '0').slice(-2);
        }

        // Ensure we have exactly 12 digits for CODE128
        return numeric.padStart(12, '0').slice(0, 12);
    };

    // Format date
    const formatDate = (date: Date | string): string => {
        const d = new Date(date);
        return d.toLocaleString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        });
    };

    // Safe render for customer name
    const renderCustomerName = (): string => {
        if (currentUser?.firstName && currentUser?.lastName) {
            return `${currentUser.firstName} ${currentUser.lastName}`;
        } else if (currentUser?.firstName) {
            return currentUser.firstName;
        } else if (currentUser?.lastName) {
            return currentUser.lastName;
        }
        return 'Khách hàng';
    };

    if (loading) {
        return (
            <Container className={styles.container}>
                <div className="text-center">
                    <div className="spinner-border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-2">Đang tải hóa đơn...</p>
                </div>
            </Container>
        );
    }

    if (error) {
        return (
            <Container className={styles.container}>
                <div className="text-center text-danger">
                    <h4>Lỗi tải hóa đơn</h4>
                    <p>{error}</p>
                </div>
            </Container>
        );
    }

    if (!billData) {
        return (
            <Container className={styles.container}>
                <div className="text-center text-danger">
                    <h4>Không tìm thấy thông tin hóa đơn.</h4>
                    <p>Vui lòng kiểm tra lại mã booking hoặc liên hệ hỗ trợ.</p>
                </div>
            </Container>
        );
    }

    return (
        <Container className={`${styles.container} ${styles.printable}`}>
            <Row>
                <Col md={8} className="mx-auto">
                    <Card className={styles.billCard}>
                        <CardBody>
                            {/* Header */}
                            <div className="text-center mb-4">
                                <h2 className="text-primary mb-1">HÓA ĐƠN THANH TOÁN</h2>
                                <h4 className="text-muted">CINEMA BOOKING</h4>
                                <hr />
                            </div>

                            {/* Bill Info */}
                            <Row className="mb-4">
                                <Col sm={12} className="">
                                    {/* Barcode */}
                                    <div className={styles.barcode}>
                                        <div className="d-flex flex-column mb-2">
                                            <p><strong>Mã hóa đơn:</strong></p>
                                            <Barcode
                                                value={generateBarcodeValue(billData._id || '')}
                                                format="CODE128"
                                                width={3.0}
                                                height={50}
                                                fontSize={16}
                                                textAlign="center"
                                                textPosition="bottom"
                                                textMargin={5}
                                                background="#ffffff"
                                                lineColor="#000000"
                                                displayValue={true}
                                            />
                                        </div>
                                    </div>
                                </Col>
                                <Col sm={12}>
                                    <div className={styles.billInfo}>
                                        <p><strong>Thời gian:</strong> {formatDate(billData.print_time || new Date())}</p>
                                        <p><strong>Khách hàng:</strong> {renderCustomerName()}</p>
                                        {currentUser?.phone && (
                                            <p><strong>Số điện thoại:</strong> {String(currentUser.phone)}</p>
                                        )}
                                    </div>
                                </Col>

                            </Row>

                            {/* Product List */}
                            {billData.product_list && billData.product_list.length > 0 && (
                                <div className="mb-4">
                                    <h5 className="text-primary mb-3">🎬 Chi tiết đơn hàng</h5>
                                    <div className="table-responsive">
                                        <table className="table table-striped">
                                            <thead>
                                                <tr>
                                                    <th>Mục</th>
                                                    <th>Loại</th>
                                                    <th className="text-end">Giá</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {billData.product_list.map((item, index) => (
                                                    <tr key={index}>
                                                        <td>{String(item.seat_number || 'N/A')}</td>
                                                        <td>{String(item.seat_type || 'N/A')}</td>
                                                        <td className="text-end">
                                                            {(Number(item.price) || 0).toLocaleString('vi-VN')} VNĐ
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            {/* Payment Summary */}
                            <div className="mb-4">
                                <Card className="border-primary">
                                    <CardBody className="bg-light">
                                        <h5 className="text-primary mb-3">💰 Thông tin thanh toán</h5>
                                        <Row>
                                            <Col sm={8}>
                                                <div className="d-flex justify-content-between">
                                                    <strong className="h5 text-primary">TỔNG TIỀN ĐÃ THANH TOÁN:</strong>
                                                    <strong className="h5 text-success">
                                                        {(Number(billData.total) || 0).toLocaleString('vi-VN')} VNĐ
                                                    </strong>
                                                </div>
                                            </Col>
                                            <Col sm={4} className="text-end">
                                                <div className="text-success">
                                                    <i className="fas fa-check-circle fa-2x"></i>
                                                    <div className="mt-2">
                                                        <strong>THANH TOÁN THÀNH CÔNG</strong>
                                                    </div>
                                                    <small className="text-muted">
                                                        {formatDate(billData.print_time || new Date())}
                                                    </small>
                                                </div>
                                            </Col>
                                        </Row>
                                    </CardBody>
                                </Card>
                            </div>

                            {/* Footer */}
                            <div className="text-center mb-4">
                                <hr />
                                <p className="text-success mb-2">
                                    <strong>✅ Đặt vé thành công!</strong>
                                </p>
                                <p className="text-muted mb-1">
                                    <strong>Cảm ơn quý khách đã sử dụng dịch vụ!</strong>
                                </p>
                                <p className="text-muted small">
                                    Vui lòng giữ hóa đơn để kiểm tra khi vào rạp.<br />
                                    Hotline hỗ trợ: 1900 1234 | Email: support@cinemago.com
                                </p>
                                <div className="mt-3">
                                    <small className="text-muted">
                                        Hóa đơn được tạo tự động bởi hệ thống Cinema Booking
                                    </small>
                                </div>
                            </div>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Bill;