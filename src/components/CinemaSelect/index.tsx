import { Select } from "antd";
import { cinemasData } from "../../utils/data/cinemaData";
import { useCinema } from "../../contexts/CinemaContext";

const CinemaSelect = ({ onChange }: { onChange: (cinemaId: number | null) => void }) => {
    const { selectedCinema, setSelectedCinema } = useCinema();

    const handleChange = (value: number) => {
        if (value === -1) {
            setSelectedCinema(null);
            onChange(null);
        } else {
            setSelectedCinema(value);
            onChange(value);
        }
    };

    return (
        <Select
            style={{ width: 200 }}
            placeholder="Chọn rạp chiếu"
            value={selectedCinema !== null ? selectedCinema : -1}
            onChange={handleChange}
        >
            <Select.Option value={-1}>Tất cả rạp phim</Select.Option>
            {cinemasData.map((cinema) => (
                <Select.Option key={cinema.id} value={cinema.id}>
                    {cinema.name}
                </Select.Option>
            ))}
        </Select>
    );
};

export default CinemaSelect;
