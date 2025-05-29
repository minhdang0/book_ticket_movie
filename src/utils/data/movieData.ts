import { IMovie } from "../interfaces/movie";
import movie1 from "../../assets/images/tru_ta_ky.jpg";
import movie2 from "../../assets/images/nang_bach_tuyet.jpg";
import movie3 from "../../assets/images/quy_nhap_trang.png";
import movie4 from "../../assets/images/latmat_8.jpg";
import movie5 from "../../assets/images/tham_tu_kien.png";

export const moviesData: IMovie[] = [
  {
    id: 1,
    name: "Trừ tà Ký: Khởi Nguyên Hắc Ám",
    image: movie1,
    description: "Một cuộc chiến chống lại thế lực hắc ám khởi nguồn từ truyền thuyết cổ.",
    duration: 85,
    releaseDate: new Date("2025-04-27"),
    category: ["Kinh dị"],
    director: "Khổng Minh",
    ageAllowed: 16,
    room_id: 1,
  },
  {
    id: 2,
    name: "Nàng Bạch Tuyết",
    image: movie2,
    description: "Phiên bản hiện đại của cổ tích nổi tiếng với âm nhạc và phép thuật.",
    duration: 106,
    releaseDate: new Date("2025-04-28"),
    category: ["Phiêu lưu", "Âm Nhạc"],
    director: "Khổng Minh",
    ageAllowed: 16,
    room_id: 2,
  },
  {
    id: 3,
    name: "Quỷ Nhập Tràng",
    image: movie3,
    description: "Câu chuyện rùng rợn về thế giới tâm linh và những điều không thể lý giải.",
    duration: 120,
    releaseDate: new Date("2025-04-29"),
    category: ["Kinh dị"],
    director: "Khổng Minh",
    ageAllowed: 16,
    room_id: 3,
  },
  {
    id: 4,
    name: "Lật mặt 8: Vòng Tay Nắng",
    image: movie4,
    description: "Một bộ phim về sự khác biệt quan điểm giữa ba thế hệ ông bà cha mẹ con cháu. Ai cũng đúng ở góc nhìn của mình nhưng đứng trước hoài bão của tuổi trẻ, cuối cùng thì ai sẽ là người phải nghe theo người còn lại? Và nếu ước mơ của những đứa trẻ bị cho là viển vông, thì cơ hội nào và bao giờ tuổi trẻ mới được tự quyết định tương lai của mình?",
    duration: 135,
    releaseDate: new Date("2025-04-30"),
    category: ['Tâm lý', 'Tình cảm'],
    director: "Khổng Minh",
    ageAllowed: 16,
    room_id: 4,
  },
  {
    id: 5,
    name: "Thám Tử Kiên: Kỳ Án Không Đầu",
    image: movie5,
    description: "Thám Tử Kiên là một nhân vật được yêu thích trong tác phẩm điện của ăn khách của NGƯỜI VỢ CUỐI CÙNG của Victor Vũ, Thám Tử Kiên: Kỳ Không Đầu sẽ là một phim Victor Vũ trở về với thể loại sở trường Kinh Dị - Trinh Thám sau những tác phẩm tình cảm lãng mạn trước đó.",
    duration: 131,
    releaseDate: new Date("2025-04-30"),
    category: ['Kinh dị', 'Trinh thám'],
    director: "Khổng Minh",
    ageAllowed: 16,
    room_id: 5,
  },

];
