import React, { useEffect, useState } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { userProfile } from "../../../../schema/schema";
import { IUser } from "../../../../utils/interfaces/user";
import * as authService from "../../../../services/authService";
import useDebounce from "../../../../hooks/useDebounce";

type FormValues = {
    firstName: string;
    lastName: string;
    age?: number;
    gender?: string;
    phone?: string | null;
    birthDate?: Date;
    email: string;
    username: string;
    image?: string;
    fileImage?: File;
};

type Props = {
    userInfo: IUser;
    onSave: (updatedUser: IUser) => void;
    onCancel: () => void;
    setLoading: (loading: boolean) => void;
};

const EditUserForm: React.FC<Props> = ({ userInfo, onSave, onCancel, setLoading }) => {
    const [preview, setPreview] = useState<string | null>(null);
    const [fileImage, setFileImage] = useState<File | null>(null);
    const [fileName, setFileName] = useState<string | null>(null);

    const {
        register,
        handleSubmit,
        watch,
        setError,
        clearErrors,
        trigger,
        formState: { errors }
    } = useForm<FormValues>({
        resolver: yupResolver(userProfile) as any,
        defaultValues: {
            firstName: userInfo?.firstName || "",
            lastName: userInfo?.lastName || "",
            age: userInfo?.age || undefined,
            gender: userInfo?.gender || "",
            phone: userInfo?.phone || "",
            birthDate: userInfo?.birthDate ? new Date(userInfo.birthDate) : undefined,
            email: userInfo?.email || "",
            username: userInfo?.username || "",
        },
    });

    // Cleanup preview URL when component unmounts
    useEffect(() => {
        return () => {
            if (preview) URL.revokeObjectURL(preview);
        };
    }, [preview]);

    const emailValue = watch('email');
    const phoneValue = watch('phone') || '';
    const usernameValue = watch('username');

    const debounceEmail = useDebounce(emailValue, 800);
    const debouncePhone = useDebounce(phoneValue, 800);
    const debounceUsername = useDebounce(usernameValue, 800);

    // Validation effect
    useEffect(() => {
        if (!debounceEmail || !debouncePhone || !debounceUsername) return;

        const validateField = async () => {
            const isValid = await trigger(["email", "username", "phone"]);

            if (isValid) {
                const excludeId = userInfo._id;
                const existsEmail = await authService.checkEmail(debounceEmail, `${excludeId}`);
                const existsPhone = await authService.checkPhone(debouncePhone, `${excludeId}`);
                const existsUsername = await authService.checkUsername(debounceUsername, `${excludeId}`);

                if (existsEmail) {
                    setError("email", {
                        type: "manual",
                        message: "Email đã tồn tại. Vui lòng sử dụng email khác"
                    });
                } else if (existsPhone) {
                    setError("phone", {
                        type: "manual",
                        message: "Số điện thoại đã tồn tại. Vui lòng sử dụng số khác"
                    });
                } else if (existsUsername) {
                    setError("username", {
                        type: "manual",
                        message: "Username đã tồn tại. Vui lòng sử dụng username khác"
                    });
                } else {
                    clearErrors(["email", "phone", "username"]);
                }
            }
        };

        if (debounceUsername || debouncePhone || debounceEmail) {
            validateField();
        }
    }, [debounceEmail, debouncePhone, debounceUsername, trigger, setError, clearErrors, userInfo._id]);

    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setLoading(true);

        const formData = new FormData();

        Object.entries(data).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== "") {
                formData.append(key, String(value));
            }
        });

        if (fileImage instanceof File) {
            if (data.image) {
                formData.set("image", fileImage);
            } else {
                formData.append("image", fileImage);
            }
        }

        if (data.birthDate) {
            formData.set("birthDate", new Date(data.birthDate).toISOString().split("T")[0]);
        }

        try {
            const res = await authService.updateUser(`${userInfo._id}`, formData);
            if (res.status >= 400) throw res;

            const updatedUser = await authService.getUser(`${userInfo._id}`);
            onSave(updatedUser);
        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const target = e.target as HTMLInputElement;
        const file = target.files?.[0];
        if (file) {
            setFileImage(file);
            setPreview(URL.createObjectURL(file));
            setFileName(file.name);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <div>
                <label>Thay đổi ảnh của bạn</label>
                <input
                    type="file"
                    {...register("fileImage")}
                    onChange={handleFileChange}
                />
                {preview ? (
                    <img src={preview} alt={fileName || "Chưa có ảnh"} />
                ) : userInfo.image ? (
                    <img src={userInfo.image} alt={`avatar của ${userInfo.firstName}`} />
                ) : (
                    <p>Chưa cập nhật ảnh</p>
                )}
                {errors.fileImage && <p>{errors.fileImage.message}</p>}
            </div>

            <div>
                <label>Họ:</label>
                <input {...register("firstName")} />
                {errors.firstName && <p>{errors.firstName.message}</p>}
            </div>

            <div>
                <label>Tên:</label>
                <input {...register("lastName")} />
                {errors.lastName && <p>{errors.lastName.message}</p>}
            </div>

            <div>
                <label>Tuổi:</label>
                <input type="number" {...register("age")} min={1} />
                {errors.age && <p>{errors.age.message}</p>}
            </div>

            <div>
                <label>Giới tính:</label>
                <input type="text" {...register("gender")} />
                {errors.gender && <p>{errors.gender.message}</p>}
            </div>

            <div>
                <label>Email:</label>
                <input {...register("email")} />
                {errors.email && <p>{errors.email.message}</p>}
            </div>

            <div>
                <label>Số điện thoại:</label>
                <input {...register("phone")} />
                {errors.phone && <p>{errors.phone.message}</p>}
            </div>

            <div>
                <label>Tên đăng nhập:</label>
                <input {...register("username")} />
                {errors.username && <p>{errors.username.message}</p>}
            </div>

            <div>
                <label>Ngày sinh:</label>
                <input type="date" {...register("birthDate")} />
                {errors.birthDate && <p>{errors.birthDate.message}</p>}
            </div>

            <button type="submit">Lưu thay đổi</button>
            <button type="button" onClick={onCancel}>Hủy</button>
        </form>
    );
};

export default EditUserForm;