import { IMovie } from "../interfaces/movie";
import movie1 from "../../assets/images/tru_ta_ky.jpg"
import movie2 from "../../assets/images/nang_bach_tuyet.jpg"
import movie3 from "../../assets/images/quy_nhap_trang.png"

export const moviesData: IMovie[] = [
    {
      name: "Trừ tà Ký: Khởi Nguyên Hắc Ám",
      duration: 85,
      category: ["Kinh dị"],
      image: movie1
    },
    {
      name: "Nàng Bạch Tuyết",
      duration: 106,
      category: ["Phiêu lưu","Âm Nhạc"],
      image: movie2
    },
    {
      name: "Quỷ Nhập Tràng",
      duration: 120,
      category: ["Kinh dị"],
      image: movie3
    },
    
  ];