import * as yup from 'yup';

export const userSchemaRegister = yup.object({
    fullname: yup.string().required("Trường này là bắt buộc"),
    email: yup
      .string()
      .email("Nhập email hợp lệ")
      .required("Trường này là bắt buộc"),
    password: yup.string().min(8, "Ít nhất 8 ký tự").required("Trường này là bắt buộc"),
    password_confirmation: yup
      .string()
      .oneOf([yup.ref('password')], "Không trùng khớp với mật khẩu")
      .min(8, "Ít nhất 8 ký tự")
      .required("Trường này là bắt buộc"),
  }).required();

  export const userSchemaLogin = yup.object({
    email: yup
      .string()
      .email("Nhập email hợp lệ")
      .required("Trường này là bắt buộc"),
    password: yup.string().min(8, "Ít nhất 8 ký tự").required("Trường này là bắt buộc"),
  }).required();

export const userProfile = yup.object().shape({
  firstName: yup.string().required("Họ không được để trống"),
  lastName: yup.string().required("Tên không được để trống"),
  age: yup
  .number()
  .positive("Tuổi là số dương")
  .integer("Tuổi là số nguyên")
  .min(6, "Tuổi phải lớn hơn hoặc bằng 6"),
  gender: yup
  .string()
  .oneOf(["Nam", "Nữ","Khác"], "Giới tính phải là 'Nam', 'Nữ' hoặc 'Khác"),
  email: yup.string().email("Email không hợp lệ").required("Email không được để trống"),
  phone: yup.string().nullable(),
  username: yup.string().required("Username không được để trống"),
  birthDate: yup.date()
 
});