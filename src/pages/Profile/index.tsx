import React, { useEffect, useState } from "react";
import useLoading from "../../hooks/useLoading";
import Loading from "../../components/Loading/Loading";
import { IUser } from "../../utils/interfaces/user";
import useCurrentUser from "../../hooks/useCurrentUser";
import UserInfo from "./component/UserInfo";
import EditUserForm from "./component/EditUserForm";
import BillHistory from "./component/BillHistory";
import { Col, Container, Row } from "reactstrap";
import SideTabs from "../../components/SideTabs/SideTabs";
import SideTab from "../../components/SideTabs/SideTab";
import billService from "../../services/billService";
import { IBillResponse } from "../../utils/interfaces/bill";

const Profile: React.FC = () => {
    const user = useCurrentUser();
    const [userInfo, setUserInfo] = useState<IUser | null>(null);
    const { loading, setLoading } = useLoading();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [editing, setEditing] = useState<boolean>(false);
    const [bills, setBills] = useState<IBillResponse | null>(null);

    useEffect(() => {
        const fetchUser = async () => {
            if (!user) {
                setErrorMessage("Không có ID người dùng.");
                setLoading(false);
                return;
            }
            else {
                setUserInfo(user);
            }
            try {

                const billData = await billService.getBillByUserId(user._id);
                console.log(billData)
                setBills(billData)
            } catch (err) {
                setErrorMessage("Không tìm thấy người dùng.");
            } finally {
                setLoading(false);
            }
        };

        if (loading === false) fetchUser();
    }, [user, loading]);

    const handleEditing = (e: React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
        setEditing(!editing);
    };

    const handleSave = (updatedUser: IUser) => {
        setUserInfo(updatedUser);
        setEditing(false);
    };

    const handleCancel = () => {
        setEditing(false);
    };

    if (loading) return <Loading />;
    if (errorMessage) return <p>{errorMessage}</p>;
    if (!userInfo) return <p>Không có dữ liệu người dùng.</p>;

    return (
        <>
            <Container className="mt-5">
                <Row>
                    <Col lg='12'>
                        <SideTabs>
                            <SideTab title="Thông tin cá nhân">
                                <div className="profile-container">
                                    {editing ? (
                                        <EditUserForm
                                            userInfo={userInfo}
                                            onSave={handleSave}
                                            onCancel={handleCancel}
                                            setLoading={setLoading}
                                        />
                                    ) : (
                                        <UserInfo userInfo={userInfo} onEdit={handleEditing} />
                                    )}
                                </div>
                            </SideTab>
                            <SideTab title="Lịch sử đặt vé">
                                {bills ? (
                                    <BillHistory bills={bills} />
                                ) : (
                                    <p className="text-muted">Đang tải dữ liệu đặt vé...</p>
                                )}
                            </SideTab>
                        </SideTabs>
                    </Col>
                </Row>
            </Container>
        </>
    );
};

export default Profile;