// PaymentChecker.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import { Button, Spinner } from 'reactstrap';
import { checkPaid } from '../../../../services/checkPay';

interface Transaction {
    'Mã GD': number;
    'Mô tả': string;
    'Giá trị': number;
    'Ngày diễn ra': string;
    'Số tài khoản': string;
}

export enum PaymentStatus {
    WAITING = 'waiting',
    PROCESSING = 'processing',
    SUCCESS = 'success',
    FAILED = 'failed'
}

interface PaymentCheckerProps {
    totalAmount: number;
    transferContent: string;
    paymentStatus: PaymentStatus;
    isChecking: boolean;
    onStatusChange: (status: PaymentStatus) => void;
    onCheckingChange: (checking: boolean) => void;
    onTransactionFound: (transaction: Transaction) => void;
    onError: (error: string) => void;
}

const PaymentChecker: React.FC<PaymentCheckerProps> = ({
    totalAmount,
    transferContent,
    paymentStatus,
    isChecking,
    onStatusChange,
    onCheckingChange,
    onTransactionFound,
    onError
}) => {
    const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const isCheckingRef = useRef(false);

    // Kiểm tra giao dịch có hợp lệ không
    const isValidTransaction = useCallback((transaction: Transaction): boolean => {
        if (!totalAmount || !transferContent) return false;

        const isAmountMatch = transaction['Giá trị'] === totalAmount;
        const isContentMatch = transaction['Mô tả'].toLowerCase().includes(transferContent.toLowerCase());

        return isAmountMatch && isContentMatch;
    }, [totalAmount, transferContent]);

    // Kiểm tra thanh toán
    const checkPaymentStatus = useCallback(async (): Promise<void> => {
        // Tránh check trùng lặp
        if (isCheckingRef.current || paymentStatus !== PaymentStatus.WAITING) {
            return;
        }

        try {
            isCheckingRef.current = true;
            onCheckingChange(true);

            const response = await checkPaid();

            if (!response || !Array.isArray(response)) {
                throw new Error('Invalid response from payment service');
            }

            const validTransaction = response.find((transaction: Transaction) =>
                isValidTransaction(transaction)
            );

            if (validTransaction) {
                onTransactionFound(validTransaction);
                onStatusChange(PaymentStatus.SUCCESS);

                // Dừng việc check
                if (checkIntervalRef.current) {
                    clearInterval(checkIntervalRef.current);
                    checkIntervalRef.current = null;
                }
            }
        } catch (error) {
            console.error('Payment check failed:', error);
            onError('Có lỗi xảy ra khi kiểm tra thanh toán.');
        } finally {
            isCheckingRef.current = false;
            onCheckingChange(false);
        }
    }, [paymentStatus, totalAmount, transferContent, isValidTransaction, onStatusChange, onCheckingChange, onTransactionFound, onError]);

    // Auto check payment
    useEffect(() => {
        // Chỉ bắt đầu check khi có đầy đủ thông tin và đang ở trạng thái WAITING
        if (paymentStatus === PaymentStatus.WAITING && totalAmount > 0 && transferContent) {
            // Check ngay lập tức
            checkPaymentStatus();

            // Sau đó check mỗi 10 giây
            checkIntervalRef.current = setInterval(checkPaymentStatus, 10000);
        }

        // Cleanup khi component unmount hoặc trạng thái thay đổi
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
                checkIntervalRef.current = null;
            }
        };
    }, [paymentStatus, totalAmount, transferContent]); // Chỉ depend vào các giá trị cần thiết

    // Cleanup khi component unmount
    useEffect(() => {
        return () => {
            if (checkIntervalRef.current) {
                clearInterval(checkIntervalRef.current);
            }
            isCheckingRef.current = false;
        };
    }, []);

    // Manual check button
    const handleManualCheck = () => {
        if (!isChecking && paymentStatus === PaymentStatus.WAITING) {
            checkPaymentStatus();
        }
    };

    return (
        <div className="payment-checker">
            {/* Status Indicator */}
            <div className="text-center mt-3">
                {paymentStatus === PaymentStatus.WAITING && (
                    <div className="d-flex align-items-center justify-content-center">
                        {isChecking && (
                            <Spinner size="sm" color="primary" className="me-2" />
                        )}
                        <span className="text-muted">
                            {isChecking ? 'Đang kiểm tra giao dịch...' : 'Chờ thanh toán'}
                        </span>
                    </div>
                )}

                {paymentStatus === PaymentStatus.PROCESSING && (
                    <div className="d-flex align-items-center justify-content-center">
                        <Spinner size="sm" color="warning" className="me-2" />
                        <span className="text-warning fw-bold">Đang xử lý thanh toán...</span>
                    </div>
                )}

                {paymentStatus === PaymentStatus.SUCCESS && (
                    <div className="text-success fw-bold">
                        ✅ Thanh toán thành công!
                    </div>
                )}

                {paymentStatus === PaymentStatus.FAILED && (
                    <div className="text-danger fw-bold">
                        ❌ Thanh toán thất bại
                    </div>
                )}
            </div>

            {/* Manual Check Button */}
            {paymentStatus === PaymentStatus.WAITING && !isChecking && (
                <div className="text-center mt-3">
                    <Button
                        color="outline-primary"
                        size="sm"
                        onClick={handleManualCheck}
                    >
                        Kiểm tra ngay
                    </Button>
                </div>
            )}
        </div>
    );
};

export default PaymentChecker;