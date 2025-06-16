import React, { useState } from "react";
import { Button, Card, CardBody, Badge, Modal, ModalHeader, ModalBody, ModalFooter, Row, Col, Pagination, PaginationItem, PaginationLink } from "reactstrap";
import { IBillMore, IBillResponse } from "../../../../utils/interfaces/bill";
import Barcode from "react-barcode";
import styles from "./BillHistory.module.scss";

type Props = {
    bills: IBillResponse
}

const BillHistory: React.FC<Props> = ({ bills }) => {
    const [selectedBill, setSelectedBill] = useState<IBillMore | null>(null);
    const [detailModal, setDetailModal] = useState<boolean>(false);

    const handleViewDetail = (bill: IBillMore) => {
        setSelectedBill(bill);
        setDetailModal(true);
    };

    const toggleDetailModal = () => {
        setDetailModal(!detailModal);
        if (!detailModal) {
            setSelectedBill(null);
        }
    };

    const handlePageChange = (page: number) => {
        // TODO: Implement page change logic
        console.log('Page changed to:', page);
    };

    const formatDate = (dateString: string | undefined) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('vi-VN', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            return 'Invalid Date';
        }
    };

    const formatCurrency = (amount: number | undefined) => {
        if (typeof amount !== 'number') return '0 ₫';
        try {
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(amount);
        } catch (error) {
            return `${amount} ₫`;
        }
    };

    const getStatusBadge = (status: string | undefined) => {
        if (!status) return <Badge color="secondary" className={styles.statusBadge}>N/A</Badge>;

        const statusMap: Record<string, { color: string; text: string; className: string }> = {
            'Confirmed': { color: 'success', text: 'Đã xác nhận', className: styles.confirmed },
            'Cancelled': { color: 'success', text: 'Đã xác nhận', className: styles.confirmed },
            'Pending': { color: 'warning', text: 'Chờ xử lý', className: styles.pending }
        };

        const statusInfo = statusMap[status] || { color: 'secondary', text: status, className: styles.default };

        return (
            <Badge color={statusInfo.color} className={`${styles.statusBadge} ${statusInfo.className}`}>
                {statusInfo.text}
            </Badge>
        );
    };

    const generateBarcodeValue = (billId: string): string => {
        if (!billId) return '000000000000';

        // Convert ObjectId to numeric string for barcode
        // Take the last 12 characters and convert hex to decimal
        const hex = billId.slice(-12);
        let numeric = '';

        for (let i = 0; i < hex.length; i += 2) {
            const hexPair = hex.substring(i, i + 2);
            const decimal = parseInt(hexPair, 16);
            numeric += decimal.toString().padStart(2, '0').slice(-2);
        }

        // Ensure we have exactly 12 digits for CODE128
        return numeric.padStart(12, '0').slice(0, 12);
    };

    const renderPagination = () => {
        if (!bills?.pagination || bills.pagination.totalPages <= 1) return null;

        const { currentPage, totalPages, hasPrevPage, hasNextPage } = bills.pagination;
        const pages = [];

        // Previous button
        pages.push(
            <PaginationItem key="prev" disabled={!hasPrevPage}>
                <PaginationLink
                    previous
                    onClick={() => hasPrevPage && handlePageChange(currentPage - 1)}
                >
                    Trước
                </PaginationLink>
            </PaginationItem>
        );

        // First page
        if (currentPage > 3) {
            pages.push(
                <PaginationItem key={1}>
                    <PaginationLink onClick={() => handlePageChange(1)}>
                        1
                    </PaginationLink>
                </PaginationItem>
            );
            if (currentPage > 4) {
                pages.push(
                    <PaginationItem key="ellipsis1" disabled>
                        <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                );
            }
        }

        // Pages around current page
        for (let i = Math.max(1, currentPage - 2); i <= Math.min(totalPages, currentPage + 2); i++) {
            pages.push(
                <PaginationItem key={i} active={i === currentPage}>
                    <PaginationLink onClick={() => handlePageChange(i)}>
                        {i}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Last page
        if (currentPage < totalPages - 2) {
            if (currentPage < totalPages - 3) {
                pages.push(
                    <PaginationItem key="ellipsis2" disabled>
                        <PaginationLink>...</PaginationLink>
                    </PaginationItem>
                );
            }
            pages.push(
                <PaginationItem key={totalPages}>
                    <PaginationLink onClick={() => handlePageChange(totalPages)}>
                        {totalPages}
                    </PaginationLink>
                </PaginationItem>
            );
        }

        // Next button
        pages.push(
            <PaginationItem key="next" disabled={!hasNextPage}>
                <PaginationLink
                    next
                    onClick={() => hasNextPage && handlePageChange(currentPage + 1)}
                >
                    Sau
                </PaginationLink>
            </PaginationItem>
        );

        return (
            <div className={styles.pagination}>
                <div className={styles.paginationWrapper}>
                    <Pagination>
                        {pages}
                    </Pagination>
                </div>
            </div>
        );
    };

    // Early return for no data
    if (!bills || !bills.lists) {
        return (
            <div className={styles.billHistory}>
                <div className={styles.noDataMessage}>
                    <p>Chưa có lịch sử đặt vé nào.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={styles.billHistory}>
            <Row className={styles.billGrid}>
                {bills.lists.map((bill: IBillMore) => {
                    // Safe access to nested properties
                    const movieName = bill?.tickets?.[0]?.movie_id?.name || 'N/A';
                    const cinemaName = bill?.tickets?.[0]?.cinema_name || 'N/A';
                    const roomName = bill?.tickets?.[0]?.room_name || 'N/A';
                    const seatNumbers = bill?.booking_id?.seat_numbers?.join(', ') || 'N/A';
                    const showtimeDate = bill?.showtime_id?.date;
                    const showtimeTime = bill?.showtime_id?.time || 'N/A';
                    const bookingTime = bill?.booking_id?.booking_time;
                    const bookingStatus = bill?.booking_id?.booking_status;

                    return (
                        <Col md="6" lg="4" key={bill._id || Math.random()}>
                            <Card className={styles.billCard}>
                                <CardBody className={styles.cardBody}>
                                    <div className={styles.cardHeader}>
                                        <h6 className={styles.movieTitle}>
                                            {movieName}
                                        </h6>
                                        {getStatusBadge(bookingStatus)}
                                    </div>

                                    <div className={styles.cardInfo}>
                                        <p className={styles.infoItem}>
                                            <strong>Rạp:</strong> {cinemaName}
                                        </p>

                                        <p className={styles.infoItem}>
                                            <strong>Phòng:</strong> {roomName}
                                        </p>

                                        <p className={styles.infoItem}>
                                            <strong>Ghế:</strong> {seatNumbers}
                                        </p>

                                        <p className={styles.infoItem}>
                                            <strong>Suất chiếu:</strong> {formatDate(showtimeDate)} - {showtimeTime}
                                        </p>

                                        <p className={styles.infoItem}>
                                            <strong>Ngày đặt:</strong> {formatDate(bookingTime)}
                                        </p>
                                    </div>

                                    <div className={styles.cardActions}>
                                        <Button
                                            color="outline-primary"
                                            size="sm"
                                            className={styles.detailBtn}
                                            onClick={() => handleViewDetail(bill)}
                                        >
                                            Chi tiết
                                        </Button>
                                    </div>
                                </CardBody>
                            </Card>
                        </Col>
                    );
                })}
            </Row>

            {/* Pagination */}
            {renderPagination()}

            {/* Show page info */}
            {bills.pagination && bills.pagination.totalPages > 1 && (
                <div className={styles.pageInfo}>
                    <small className={styles.pageText}>
                        Trang {bills.pagination.currentPage} / {bills.pagination.totalPages}
                    </small>
                </div>
            )}

            {/* Detail Modal */}
            <Modal isOpen={detailModal} toggle={toggleDetailModal} size="lg" className={styles.detailModal}>
                <ModalHeader toggle={toggleDetailModal}>
                    Chi tiết hóa đơn
                </ModalHeader>
                <ModalBody>
                    {selectedBill && (
                        <div>
                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Mã hóa đơn:</Col>
                                <Col sm="8">
                                    <div className={styles.barcodeContainer}>
                                        <Barcode
                                            value={generateBarcodeValue(selectedBill._id || '')}
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
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Trạng thái:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {getStatusBadge(selectedBill.booking_id?.booking_status)}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Phim:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.tickets?.[0]?.movie_id?.name || 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Đạo diễn:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.tickets?.[0]?.movie_id?.director || 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Thời lượng:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.tickets?.[0]?.movie_id?.duration ? `${selectedBill.tickets[0].movie_id.duration} phút` : 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Ngôn ngữ:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.tickets?.[0]?.movie_id?.language || 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Độ tuổi cho phép:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.tickets?.[0]?.movie_id?.ageAllowed ? `${selectedBill.tickets[0].movie_id.ageAllowed}+` : 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Rạp chiếu:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.tickets?.[0]?.cinema_name || 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Phòng chiếu:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.tickets?.[0]?.room_name || 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Suất chiếu:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {formatDate(selectedBill.showtime_id?.date)} lúc {selectedBill.showtime_id?.time || 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Ghế đã đặt:</Col>
                                <Col sm="8">
                                    <div className={styles.seatBadges}>
                                        {selectedBill.product_list && selectedBill.product_list.length > 0 ? (
                                            selectedBill.product_list.map((item, index) => (
                                                <span key={index} className={styles.seatBadge}>
                                                    {item.seat_number || 'N/A'} ({item.seat_type || 'N/A'})
                                                </span>
                                            ))
                                        ) : (
                                            <span className={styles.detailValue}>N/A</span>
                                        )}
                                    </div>
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Số lượng vé:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.booking_id?.ticket_quantity || 'N/A'}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Thời gian đặt:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {formatDate(selectedBill.booking_id?.booking_time)}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Thời gian in vé:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {formatDate(selectedBill.print_time)}
                                </Col>
                            </Row>

                            <Row className={styles.detailRow}>
                                <Col sm="4" className={styles.detailLabel}>Voucher:</Col>
                                <Col sm="8" className={styles.detailValue}>
                                    {selectedBill.booking_id?.voucher || 'Không có'}
                                </Col>
                            </Row>

                            <hr className={styles.divider} />

                            <Row className={`${styles.detailRow} ${styles.totalAmount}`}>
                                <Col sm="4" className={styles.detailLabel}>Tổng tiền:</Col>
                                <Col sm="8">
                                    <h5 className={styles.totalValue}>
                                        {formatCurrency(selectedBill.total)}
                                    </h5>
                                </Col>
                            </Row>

                            {selectedBill.tickets?.[0]?.movie_id?.description && (
                                <>
                                    <hr className={styles.divider} />
                                    <Row className={`${styles.detailRow} ${styles.movieDescription}`}>
                                        <Col sm="12">
                                            <div className={styles.detailLabel}>Mô tả phim:</div>
                                            <p className={styles.descriptionText}>
                                                {selectedBill.tickets[0].movie_id.description}
                                            </p>
                                        </Col>
                                    </Row>
                                </>
                            )}
                        </div>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button color="secondary" className={styles.closeBtn} onClick={toggleDetailModal}>
                        Đóng
                    </Button>
                </ModalFooter>
            </Modal>
        </div>
    );
};

export default BillHistory;