import { Select, Spin } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useEffect } from "react";
import { RootState, AppDispatch } from "../../store";
import { setSelectedCinema } from "../../features/cinema/cinemaSlice";
import { getAllCinemas } from "../../features/cinema/cinemaAsync";
import { ICinema } from "../../utils/interfaces/cinema";

const CinemaSelect = ({ onChange }: { onChange: (cinemaId: string | null) => void }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { cinemas, selectedCinema, loading, error } = useSelector((state: RootState) => state.cinema);

    useEffect(() => {
        dispatch(getAllCinemas());
    }, [dispatch]);

    // Tự động chọn cinema đầu tiên khi dữ liệu được load
    useEffect(() => {
        if (cinemas.length > 0 && selectedCinema === null) {
            const firstCinemaId = cinemas[0]._id;
            dispatch(setSelectedCinema(firstCinemaId));
            onChange(firstCinemaId);
        }
    }, [cinemas, selectedCinema, dispatch, onChange]);

    const handleChange = (value: string) => {
        if (value === '') {
            dispatch(setSelectedCinema(null));
            onChange(null);
        } else {
            dispatch(setSelectedCinema(value));
            onChange(value);
        }
    };

    if (loading) {
        return (
            <Select
                style={{ width: 200 }}
                placeholder="Đang tải..."
                disabled
                suffixIcon={<Spin size="small" />}
            />
        );
    }

    if (error) {
        return (
            <Select
                style={{ width: 200 }}
                placeholder="Lỗi tải dữ liệu"
                disabled
            />
        );
    }

    return (
        <Select
            style={{ width: 200 }}
            placeholder="Chọn rạp chiếu"
            value={selectedCinema !== null ? selectedCinema : ''}
            onChange={handleChange}
        >
            <Select.Option value={''}>Tất cả rạp phim</Select.Option>
            {cinemas.map((cinema: ICinema) => (
                <Select.Option key={cinema._id} value={cinema._id}>
                    {cinema.name}
                </Select.Option>
            ))}
        </Select>
    );
};

export default CinemaSelect;