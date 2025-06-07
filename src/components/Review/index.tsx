import React, { useState, useEffect } from 'react';
import { Avatar, Rate, Input, Button, message, Dropdown, Menu } from 'antd';
import {
    HeartOutlined,
    HeartFilled,
    MessageOutlined,
    ShareAltOutlined,
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    UserOutlined,
    SendOutlined
} from '@ant-design/icons';
import reviewService from '../../services/reviewService';
import './Review.scss';

const { TextArea } = Input;

export interface IReview {
    _id: string;
    customer_id: string;
    movie_id: string;
    content: string;
    rating?: number;
    createdAt: Date;
    updatedAt: Date;
    likes?: number;
    isLiked?: boolean;
    customer?: {
        _id: string;
        firstName: string;
        lastName: string;
        image?: string;
    };
}

export interface IUser {
    _id: string;
    firstName: string;
    lastName: string;
    age?: number | null;
    gender?: string;
    email: string;
    phone?: string;
    username: string;
    birthDate?: string | null;
    image?: string;
    emailVerifiedAt?: string | null;
    createdAt?: Date | null;
}

interface ReviewProps {
    movieId: string;
    currentUser: IUser | null;
}

const Review: React.FC<ReviewProps> = ({ movieId, currentUser }) => {
    const [reviews, setReviews] = useState<IReview[]>([]);
    const [loading, setLoading] = useState(false);
    const [newReview, setNewReview] = useState('');
    const [newRating, setNewRating] = useState(5);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');
    const [editRating, setEditRating] = useState(5);
    const [showWriteReview, setShowWriteReview] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    // Fetch reviews with pagination
    const fetchReviews = async (pageNum: number = 1, reset: boolean = false) => {
        setLoading(true);
        try {
            const response = await reviewService.getReviewsByMovieId(movieId, pageNum, 10);
            const newReviews = response.data || [];

            if (reset) {
                setReviews(newReviews);
            } else {
                setReviews(prev => [...prev, ...newReviews]);
            }

            setHasMore(newReviews.length === 10);
            setPage(pageNum);
        } catch (error) {
            message.error('Không thể tải đánh giá');
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews(1, true);
    }, [movieId]);

    // Load more reviews
    const loadMoreReviews = () => {
        if (!loading && hasMore) {
            fetchReviews(page + 1, false);
        }
    };

    // Handle create new review
    const handleCreateReview = async () => {
        if (!currentUser) {
            message.error('Bạn cần đăng nhập để đánh giá phim');
            return;
        }

        if (!newReview.trim()) {
            message.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        try {
            const reviewData = {
                customer_id: currentUser._id,
                movie_id: movieId,
                content: newReview,
                rating: newRating,
            } as IReview;

            await reviewService.createReview(reviewData);
            message.success('Đánh giá đã được đăng thành công');
            setNewReview('');
            setNewRating(5);
            setShowWriteReview(false);
            fetchReviews(1, true);
        } catch (error) {
            message.error('Không thể đăng đánh giá');
            console.error('Error creating review:', error);
        }
    };

    // Handle edit review
    const handleEditReview = async (reviewId: string) => {
        if (!editContent.trim()) {
            message.error('Vui lòng nhập nội dung đánh giá');
            return;
        }

        try {
            const reviewData = {
                content: editContent,
                rating: editRating,
            };

            await reviewService.updateReview(reviewId, reviewData);
            message.success('Đánh giá đã được cập nhật');
            setEditingId(null);
            setEditContent('');
            setEditRating(5);
            fetchReviews(1, true);
        } catch (error) {
            message.error('Không thể cập nhật đánh giá');
            console.error('Error updating review:', error);
        }
    };

    // Handle delete review
    const handleDeleteReview = async (reviewId: string) => {
        try {
            await reviewService.removeReview(reviewId);
            message.success('Đánh giá đã được xóa');
            fetchReviews(1, true);
        } catch (error) {
            message.error('Không thể xóa đánh giá');
            console.error('Error deleting review:', error);
        }
    };

    // Start editing
    const startEdit = (review: IReview) => {
        setEditingId(review._id);
        setEditContent(review.content);
        setEditRating(review.rating || 5);
    };

    // Cancel editing
    const cancelEdit = () => {
        setEditingId(null);
        setEditContent('');
        setEditRating(5);
    };

    // Check if user can modify review
    const canModifyReview = (review: IReview) => {
        return currentUser && currentUser._id === review.customer_id;
    };

    // Format time ago
    const getTimeAgo = (date: Date) => {
        const now = new Date();
        const diff = now.getTime() - new Date(date).getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Vừa xong';
        if (minutes < 60) return `${minutes} phút`;
        if (hours < 24) return `${hours} giờ`;
        if (days < 7) return `${days} ngày`;
        return new Date(date).toLocaleDateString('vi-VN');
    };

    // Render dropdown menu for review actions
    const renderActionMenu = (review: IReview) => (
        <Menu>
            <Menu.Item
                key="edit"
                icon={<EditOutlined />}
                onClick={() => startEdit(review)}
            >
                Chỉnh sửa
            </Menu.Item>
            <Menu.Item
                key="delete"
                icon={<DeleteOutlined />}
                danger
                onClick={() => handleDeleteReview(review._id)}
            >
                Xóa
            </Menu.Item>
        </Menu>
    );

    return (
        <div className='review-container'>
            <div className="facebook-review">
                <div className="review-header">
                    <h3>Đánh giá từ khán giả</h3>
                    <span className="review-count">{reviews.length} đánh giá</span>
                </div>

                {/* Write new review section */}
                {currentUser && (
                    <div className="write-review-section">
                        <div className="write-review-trigger">
                            <Avatar
                                src={currentUser.image}
                                icon={!currentUser.image && <UserOutlined />}
                                size={40}
                            />
                            <div
                                className="write-placeholder"
                                onClick={() => setShowWriteReview(true)}
                            >
                                Chia sẻ cảm nhận của bạn về bộ phim...
                            </div>
                        </div>

                        {showWriteReview && (
                            <div className="write-review-form">
                                <div className="rating-section">
                                    <span>Đánh giá của bạn:</span>
                                    <Rate value={newRating} onChange={setNewRating} />
                                </div>
                                <TextArea
                                    value={newReview}
                                    onChange={(e) => setNewReview(e.target.value)}
                                    placeholder="Chia sẻ cảm nhận của bạn về bộ phim..."
                                    rows={3}
                                    maxLength={500}
                                    showCount
                                />
                                <div className="form-actions">
                                    <Button onClick={() => setShowWriteReview(false)}>
                                        Hủy
                                    </Button>
                                    <Button
                                        type="primary"
                                        icon={<SendOutlined />}
                                        onClick={handleCreateReview}
                                        loading={loading}
                                    >
                                        Đăng
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Reviews list */}
                <div className="reviews-list">
                    {reviews.map((review) => (
                        <div key={review._id} className="review-item">
                            <div className="review-header">
                                <Avatar
                                    src={review.customer?.image}
                                    icon={!review.customer?.image && <UserOutlined />}
                                    size={40}
                                />
                                <div className="review-info">
                                    <div className="reviewer-name">
                                        {review.customer?.firstName} {review.customer?.lastName}
                                    </div>
                                    <div className="review-meta">
                                        <Rate disabled value={review.rating || 5} />
                                        <span className="review-time">
                                            {getTimeAgo(review.createdAt)}
                                        </span>
                                    </div>
                                </div>
                                {canModifyReview(review) && (
                                    <Dropdown
                                        overlay={renderActionMenu(review)}
                                        trigger={['click']}
                                        placement="bottomRight"
                                    >
                                        <Button
                                            type="text"
                                            icon={<MoreOutlined />}
                                            size="small"
                                            className="action-button"
                                        />
                                    </Dropdown>
                                )}
                            </div>

                            <div className="review-content">
                                {editingId === review._id ? (
                                    <div className="edit-form">
                                        <div className="rating-section">
                                            <Rate value={editRating} onChange={setEditRating} />
                                        </div>
                                        <TextArea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            rows={3}
                                            maxLength={500}
                                            showCount
                                        />
                                        <div className="form-actions">
                                            <Button size="small" onClick={cancelEdit}>
                                                Hủy
                                            </Button>
                                            <Button
                                                type="primary"
                                                size="small"
                                                onClick={() => handleEditReview(review._id)}
                                            >
                                                Lưu
                                            </Button>
                                        </div>
                                    </div>
                                ) : (
                                    <p>{review.content}</p>
                                )}
                            </div>

                            <div className="review-actions">
                                <Button
                                    type="text"
                                    icon={review.isLiked ? <HeartFilled /> : <HeartOutlined />}
                                    size="small"
                                    className={`action-btn ${review.isLiked ? 'liked' : ''}`}
                                >
                                    Thích {review.likes ? `(${review.likes})` : ''}
                                </Button>
                                <Button
                                    type="text"
                                    icon={<MessageOutlined />}
                                    size="small"
                                    className="action-btn"
                                >
                                    Phản hồi
                                </Button>
                                <Button
                                    type="text"
                                    icon={<ShareAltOutlined />}
                                    size="small"
                                    className="action-btn"
                                >
                                    Chia sẻ
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Load more button */}
                {hasMore && (
                    <div className="load-more-section">
                        <Button
                            type="link"
                            onClick={loadMoreReviews}
                            loading={loading}
                        >
                            Xem thêm đánh giá
                        </Button>
                    </div>
                )}

                {reviews.length === 0 && !loading && (
                    <div className="empty-state">
                        <p>Chưa có đánh giá nào. Hãy là người đầu tiên đánh giá bộ phim này!</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Review;