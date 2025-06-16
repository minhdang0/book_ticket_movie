// OTPModal.tsx
import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faSpinner } from '@fortawesome/free-solid-svg-icons';
import Button from '../../../../components/Button';
import * as authService from '../../../../services/authService';
import styles from './OTPModal.module.scss';
import clsx from 'clsx';

interface OTPModalProps {
    isOpen: boolean;
    onClose: () => void;
    email: string;
    onSuccess: () => void;
}

const OTPModal: React.FC<OTPModalProps> = ({ isOpen, onClose, email, onSuccess }) => {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [countdown, setCountdown] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [isVerifying, setIsVerifying] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [attemptsLeft, setAttemptsLeft] = useState(3);

    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (isOpen) {
            setCountdown(60);
            setCanResend(false);
            setError('');
            setOtp(['', '', '', '', '', '']);
            setAttemptsLeft(3);

            // Focus first input
            setTimeout(() => {
                inputRefs.current[0]?.focus();
            }, 100);

            // Start countdown
            startCountdown();
        }

        return () => {
            if (countdownRef.current) {
                clearInterval(countdownRef.current);
            }
        };
    }, [isOpen]);

    const startCountdown = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
        }

        countdownRef.current = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setCanResend(true);
                    if (countdownRef.current) {
                        clearInterval(countdownRef.current);
                    }
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    const handleInputChange = (index: number, value: string) => {
        if (value.length > 1) return;

        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        setError('');

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-submit when all fields are filled
        if (value && index === 5 && newOtp.every(digit => digit !== '')) {
            handleVerify(newOtp.join(''));
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (otpCode?: string) => {
        const code = otpCode || otp.join('');

        if (code.length !== 6) {
            setError('Vui lòng nhập đầy đủ mã xác thực');
            return;
        }

        setIsVerifying(true);
        setError('');

        try {
            const response: any = await authService.verifyRegistration({
                email,
                otp: code,
            });

            if (response.status === 'success') {
                onSuccess();
                onClose();
            }
        } catch (error: any) {
            const message = error.response?.data?.message || 'Có lỗi xảy ra';
            setError(message);

            if (error.response?.data?.attemptsLeft !== undefined) {
                setAttemptsLeft(error.response.data.attemptsLeft);
            }

            // Clear OTP inputs on error
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsVerifying(false);
        }
    };

    const handleResend = async () => {
        if (!canResend || isResending) return;

        setIsResending(true);
        setError('');

        try {
            await authService.resendOTP({ email });
            setCountdown(60);
            setCanResend(false);
            setAttemptsLeft(3);
            setOtp(['', '', '', '', '', '']);
            startCountdown();
            inputRefs.current[0]?.focus();
        } catch (error: any) {
            const message = error.response?.data?.message || 'Không thể gửi lại mã';
            setError(message);
        } finally {
            setIsResending(false);
        }
    };

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text');

        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            handleVerify(pastedData);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={clsx(styles.modal__overlay)}>
            <div className={clsx(styles.modal__content)}>
                <div className={clsx(styles.modal__header)}>
                    <h2>Xác thực Email</h2>
                    <button
                        className={clsx(styles.close__button)}
                        onClick={onClose}
                        type="button"
                    >
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                <div className={clsx(styles.modal__body)}>
                    <p className={clsx(styles.instruction)}>
                        Mã xác thực đã được gửi đến email: <strong>{email}</strong>
                    </p>
                    <p className={clsx(styles.sub__instruction)}>
                        Vui lòng nhập mã 6 chữ số để hoàn tất đăng ký
                    </p>

                    <div className={clsx(styles.otp__container)} onPaste={handlePaste}>
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => {
                                    inputRefs.current[index] = el;
                                }}
                                type="text"
                                value={digit}
                                onChange={(e) => handleInputChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className={clsx(styles.otp__input, {
                                    [styles.error]: error && otp.join('').length === 6
                                })}
                                maxLength={1}
                                disabled={isVerifying}
                            />
                        ))}
                    </div>

                    {error && (
                        <div className={clsx(styles.error__message)}>
                            {error}
                            {attemptsLeft > 0 && (
                                <span className={clsx(styles.attempts)}>
                                    (Còn {attemptsLeft} lần thử)
                                </span>
                            )}
                        </div>
                    )}

                    <div className={clsx(styles.countdown)}>
                        {countdown > 0 ? (
                            <span>Mã sẽ hết hạn sau {countdown}s</span>
                        ) : (
                            <span className={clsx(styles.expired)}>Mã đã hết hạn</span>
                        )}
                    </div>

                    <div className={clsx(styles.button__group)}>
                        <Button
                            primary
                            onClick={() => handleVerify()}
                            disabled={isVerifying || otp.some(digit => !digit)}
                            className={clsx(styles.verify__button)}
                        >
                            {isVerifying ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    Đang xác thực...
                                </>
                            ) : (
                                'Xác thực'
                            )}
                        </Button>

                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={!canResend || isResending}
                            className={clsx(styles.resend__button, {
                                [styles.disabled]: !canResend || isResending
                            })}
                        >
                            {isResending ? (
                                <>
                                    <FontAwesomeIcon icon={faSpinner} spin />
                                    Đang gửi...
                                </>
                            ) : (
                                'Gửi lại mã'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OTPModal;