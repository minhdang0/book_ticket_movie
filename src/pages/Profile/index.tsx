import React, { useEffect, useState } from "react";
import * as authService from "../../services/authService";
import useUser from "../../hooks/useUser";
import { userProfile } from "../../schema/schema";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Button from "../../components/Button";
import useLoading from "../../hooks/useLoading";
import Loading from "../../components/Loading/Loading";
import useDebounce from "../../hooks/useDebounce";
import { IUser } from "../../utils/interfaces/user";

const Profile: React.FC = () => {
    const { user } = useUser();
    const [userInfo, setUserInfo] = useState<IUser | null>(null);
    const { loading, setLoading } = useLoading();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editing, setEditing] = useState<boolean>(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [fileImage, setFileImage] = useState<object | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        clearErrors,
        trigger,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(userProfile)
    });

    useEffect(() => {
        const fetchUser = async () => {
            if (!user?.id) {
                setErrorMessage("Không có ID người dùng.");
                setLoading(false);
                return;
            }
            try {
                const response = await authService.getUser(user.id);
                setUserInfo(response);
            } catch (err) {
                setErrorMessage("Không tìm thấy người dùng.");
            } finally {
                setLoading(false);
            }
        };

        if (!loading) fetchUser()

    }, [user]);

    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview)
        }
    }, [preview]);

    const emailValue = watch('email');
    const phoneValue = watch('phone');
    const usernameValue = watch('username');

    const debounceEmail = useDebounce(emailValue, 800);
    const debouncePhone = useDebounce(phoneValue, 800);
    const debounceUsername = useDebounce(usernameValue, 800);

    useEffect(() => {
        if (!debounceEmail || !debouncePhone || !debounceUsername) return;

        const validateField = async () => {
            const isValid = await trigger(["email", "username", "phone"]);

            if (isValid) {
                const excludeId = user?.id;
                const existsEmail = await authService.checkEmail(debounceEmail, excludeId);
                const existsPhone = await authService.checkPhone(debouncePhone, excludeId);
                const existsUsername = await authService.checkUsername(debounceUsername, excludeId);

                if (existsEmail) {
                    setError("email", {
                        type: "manual",
                        message: "Email đã tồn tại. Vui lòng sử dụng email khác"
                    });
                }
                else if (existsPhone) {
                    setError("phone", {
                        type: "manual",
                        message: "Số điện thoại đã tồn tại. Vui lòng sử dụng email khác"
                    });
                }
                else if (existsUsername) {
                    setError("username", {
                        type: "manual",
                        message: "Username đã tồn tại. Vui lòng sử dụng email khác"
                    });
                }
                else clearErrors(["email", "phone", "username"]);
            }
        }

        if (debounceUsername || debouncePhone || debounceUsername) validateField();

    }, [emailValue, phoneValue, usernameValue]);

    const handleEditing = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setEditing(!editing);
    };

    const onSubmit: SubmitHandler<{
        firstName: string;
        lastName: string;
        age?: number;
        gender?: string;
        phone?: string | null;
        birthDate?: Date;
        email: string;
        username: string;
    }> = async (data) => {
        if (!user?.id) {
            setErrorMessage("Không có ID người dùng.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                formData.append(key, String(value));  // Ensure the value is a string
            }
        });

        if (fileImage instanceof File) {
            formData.append("image", fileImage);
        }

        if (data.birthDate) {
            formData.set("birthDate", new Date(data.birthDate).toISOString().split("T")[0]);
        }

        try {
            const res = await authService.updateUser(user.id, formData);
            if (res.status >= 400) throw res;
            setEditing(false);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <Loading />
    if (errorMessage) return <p>{errorMessage}</p>;
    if (!userInfo) return <p>Không có dữ liệu người dùng.</p>;

    return (
        <>
            <div className="profile-container">
                {editing ? (
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label>Thay đổi ảnh của bạn</label>
                            <input type="file" onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                const target = e.target as HTMLInputElement
                                const file = target.files?.[0];
                                console.log(file)
                                if (file) {
                                    setFileImage(file);
                                    setPreview(URL.createObjectURL(file));
                                    setFileName(file.name);
                                }
                            }} />
                            {preview && <img src={preview} alt={fileName || "Chua co anh"} />}
                        </div>
                        <div>
                            <label>Họ:</label>
                            <input {...register("firstName")} defaultValue={userInfo.firstName} />
                            {errors.firstName && <p>{errors.firstName.message}</p>}
                        </div>

                        <div>
                            <label>Tên:</label>
                            <input {...register("lastName")} defaultValue={userInfo.lastName} />
                            {errors.lastName && <p>{errors.lastName.message}</p>}
                        </div>

                        <div>
                            <label>Tuổi:</label>
                            <input type="number" {...register("age")} defaultValue={userInfo.age || ''} min={1} />
                            {errors.age && <p>{errors.age.message}</p>}
                        </div>

                        <div>
                            <label>Giới tính:</label>
                            <input type="text" {...register("gender")} defaultValue={userInfo.gender || ''} />
                            {errors.gender && <p>{errors.gender.message}</p>}
                        </div>

                        <div>
                            <label>Email:</label>
                            <input {...register("email")} defaultValue={userInfo.email} />
                            {errors.email && <p>{errors.email.message}</p>}
                        </div>

                        <div>
                            <label>Số điện thoại:</label>
                            <input {...register("phone")} defaultValue={userInfo.phone} />
                            {errors.phone && <p>{errors.phone.message}</p>}
                        </div>

                        <div>
                            <label>Tên đăng nhập:</label>
                            <input {...register("username")} defaultValue={userInfo.username} />
                            {errors.username && <p>{errors.username.message}</p>}
                        </div>

                        <div>
                            <label>Ngày sinh:</label>
                            <input type="date" {...register("birthDate")} defaultValue={userInfo.birthDate || ''} />
                            {errors.birthDate && <p>{errors.birthDate.message}</p>}
                        </div>

                        <button type="submit">Lưu thay đổi</button>
                        <button type="button" onClick={handleEditing}>Hủy</button>
                    </form>
                ) : (
                    <div>
                        <h1>Hồ sơ của {userInfo.firstName} {userInfo.lastName}</h1>
                        {userInfo.image && <img src={userInfo.image} alt={userInfo.username} className="profile-img" />}
                        <p><strong>Email:</strong> {userInfo.email}</p>
                        <p><strong>Trạng thái tài khoản:</strong> {userInfo.emailVerifiedAt ? "Tài khoản đã được xác minh" : "Tài khoản chưa xác minh"}</p>
                        <p><strong>Giới tính:</strong> {userInfo.gender || "Chưa cập nhật"}</p>
                        <p><strong>Tuổi:</strong> {userInfo.age !== null ? userInfo.age : "Chưa cập nhật"}</p>
                        <p><strong>Số điện thoại:</strong> {userInfo.phone || "Chưa cập nhật"}</p>
                        <p><strong>Ngày sinh:</strong> {userInfo.birthDate || "Chưa cập nhật"}</p>
                        <p>
                            <strong>Tham gia ngày:</strong>
                            {userInfo.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : "Không có dữ liệu"}
                        </p>
                        <div>
                            <Button primary onClick={handleEditing}>Chỉnh sửa thông tin</Button>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
};

export default Profile;
