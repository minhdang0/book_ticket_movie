import React, { useEffect, useState } from 'react';
import { Card, CardBody, Container, Row, Col, Button, Table } from 'reactstrap';
import styles from './Bill.module.scss';
import { IBill } from '../../../../utils/interfaces/bill';
import { IBooking } from '../../../../utils/interfaces/booking';
import billService from '../../../../services/billService';

interface BillComponentProps {
    bill?: IBill;
    booking?: string | null;
}

interface ProductItem {
    seat_number: string;
    seat_type: string;
    price: number;
}

const Bill: React.FC<BillComponentProps> = ({ bill, booking }) => {
    const [billData, setBillData] = useState<IBill | null>(bill || null);
    const [bookingData, setBookingData] = useState<IBooking | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    console.log(bookingData)
    // Load bill data if not provided
    useEffect(() => {
        const loadBillData = async () => {
            if (!bill && booking) {
                setLoading(true);
                try {
                    const billResponse = await billService.getBillByBookingId(booking);
                    setBillData(billResponse);

                    const bookingResponse = await billService.getBookingById(booking);
                    setBookingData(bookingResponse);
                } catch (error) {
                    console.error('Failed to load bill data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        loadBillData();
    }, [bill, booking]);

    const generateBarcode = (billId: string): string => {
        return `*${billId.toUpperCase()}*`;
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

    // Print bill
    const handlePrint = (): void => {
        window.print();
    };

    // Download bill as PDF (có thể implement sau)
    const handleDownloadPDF = (): void => {
        // Implement PDF download logic
        console.log('Download PDF functionality');
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

    if (!billData) {
        return (
            <Container className={styles.container}>
                <div className="text-center text-danger">
                    Không tìm thấy thông tin hóa đơn.
                </div>
            </Container>
        );
    }

    const productList: ProductItem[] = billData.product_list || [];

    return (
        <Container className={`${styles.container} ${styles.printable}`}>
            <Row>
                <Col md={10} className="mx-auto">
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
                                <Col sm={6}>
                                    <div className={styles.billInfo}>
                                        <p><strong>Mã hóa đơn:</strong> {billData._id}</p>
                                        <p><strong>Mã booking:</strong> {billData.booking_id}</p>
                                        <p><strong>Thời gian:</strong> {formatDate(billData.time)}</p>
                                    </div>
                                </Col>
                                <Col sm={6} className="text-end">
                                    {/* Barcode */}
                                    <div className={styles.barcode}>
                                        <div className={styles.barcodeText}>
                                            {generateBarcode(billData._id || '')}
                                        </div>
                                        <small className="text-muted d-block mt-1">
                                            Mã vạch: {billData._id}
                                        </small>
                                    </div>
                                </Col>
                            </Row>

                            {/* Product List */}
                            <div className="mb-4">
                                <h5 className="mb-3">Chi tiết sản phẩm</h5>
                                <Table bordered hover responsive>
                                    <thead className="table-primary">
                                        <tr>
                                            <th className="text-center">#</th>
                                            <th>Số ghế</th>
                                            <th>Loại ghế</th>
                                            <th className="text-end">Đơn giá</th>
                                            <th className="text-center" >SL</th>
                                            <th className="text-end">Thành tiền</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {productList.map((item: ProductItem, index: number) => (
                                            <tr key={index}>
                                                <td className="text-center">{index + 1}</td>
                                                <td>
                                                    <strong>{item.seat_number}</strong>
                                                </td>
                                                <td>
                                                    <span className={`badge ${item.seat_type === 'VIP' ? 'bg-warning' :
                                                        item.seat_type === 'Ghế thường' ? 'bg-info' : 'bg-secondary'
                                                        }`}>
                                                        {item.seat_type}
                                                    </span>
                                                </td>
                                                <td className="text-end">
                                                    {item.price.toLocaleString('vi-VN')} VNĐ
                                                </td>
                                                <td className="text-center">1</td>
                                                <td className="text-end">
                                                    <strong>{item.price.toLocaleString('vi-VN')} VNĐ</strong>
                                                </td>
                                            </tr>
                                        ))}

                                        {/* Total Row */}
                                        <tr className="table-warning">
                                            <td colSpan={5} className="text-end fw-bold">
                                                TỔNG CỘNG:
                                            </td>
                                            <td className="text-end fw-bold fs-5">
                                                {billData.total_price?.toLocaleString('vi-VN')} VNĐ
                                            </td>
                                        </tr>
                                    </tbody>
                                </Table>
                            </div>

                            {/* Payment Info */}
                            <Row className="mb-4">
                                <Col sm={6}>
                                    <div className={styles.paymentInfo}>
                                        <h6>Thông tin thanh toán:</h6>
                                        <p className="mb-1"><strong>Phương thức:</strong> Chuyển khoản ngân hàng</p>
                                        <p className="mb-1"><strong>Trạng thái:</strong>
                                            <span className="badge bg-success ms-2">Đã thanh toán</span>
                                        </p>
                                        <p className="mb-1"><strong>Số lượng vé:</strong> {productList.length} vé</p>
                                    </div>
                                </Col>
                                <Col sm={6}>
                                    <div className={styles.companyInfo}>

                                    </div>
                                </Col>
                            </Row>

                            {/* Footer */}
                            <div className="text-center mt-4 pt-3 border-top">
                                <p className="text-muted mb-2">
                                    Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!
                                </p>
                                <p className="small text-muted">
                                    Hóa đơn được tạo tự động bởi hệ thống - {formatDate(new Date())}
                                </p>
                            </div>

                            {/* Action Buttons */}
                            <div className="text-center mt-4 d-print-none">
                                <Button
                                    color="primary"
                                    className="me-3"
                                    onClick={handlePrint}
                                >
                                    🖨️ In hóa đơn
                                </Button>
                                <Button
                                    color="success"
                                    onClick={handleDownloadPDF}
                                >
                                    📄 Tải PDF
                                </Button>
                            </div>

                            {/* QR Code for Bill Verification */}
                            <div className="text-center mt-4">
                                <div className={styles.qrCodeSmall}>
                                    <img
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${billData._id}`}
                                        alt="Bill QR Code"
                                        style={{ width: '80px', height: '80px' }}
                                    />
                                    <p className="small text-muted mt-1">Mã QR xác thực hóa đơn</p>
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