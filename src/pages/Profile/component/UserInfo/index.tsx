import React from "react";
import { IUser } from "../../../../utils/interfaces/user";
import Button from "../../../../components/Button";

type Props = {
    userInfo: IUser,
    onEdit: (e: React.MouseEvent<HTMLElement>) => void,
}
const UserInfo: React.FC<Props> = ({ userInfo, onEdit }) => {
    return (
        <>
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
                    <Button primary onClick={onEdit}>Chỉnh sửa thông tin</Button>
                </div>
            </div>
        </>
    )
}

export default UserInfo;