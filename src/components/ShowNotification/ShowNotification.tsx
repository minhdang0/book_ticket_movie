import { useState, useEffect } from "react";
import styles from "./ShowNotification.module.scss";

type Props = {
    title: string;
    message: string;
    type?: "info" | "success" | "warning" | "error";
};

const ShowNotification: React.FC<Props> = ({ title, message, type = "info" }) => {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => setVisible(false), 3000);
        return () => clearTimeout(timer);
    }, []);

    if (!visible) return null;

    return (
        <div className={styles.not}>
            <div className={`${styles.not__content} ${styles[type]}`}>
                <div className={styles.not__main}>
                    <div>
                        <h4 className={styles.not__title}>{title}</h4>
                        <p>{message}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowNotification;