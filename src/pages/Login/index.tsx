import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from 'react-router-dom';
import { notification } from 'antd';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock, faSpinner } from '@fortawesome/free-solid-svg-icons';

import * as authService from '../../services/authService';
// import * as httpRequests from '../../utils/api/httpRequests';
import styles from './Login.module.scss';
import Button from '../../components/Button';
import { userSchemaLogin } from '../../schema/schema';
import config from '../../config';
import useQuery from '../../hooks/useQuery';
import useLoading from '../../hooks/useLoading';
import { useDispatch } from 'react-redux';
import { getCurrentUser } from '../../features/auth/authAsync';
import { AppDispatch } from '../../store';
import useCurrentUser from '../../hooks/useCurrentUser';

type Inputs = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  // const { setUser } = useUser();
  const { loading, setLoading } = useLoading();
  const navigate = useNavigate();
  const query = useQuery();
  const dispatch = useDispatch<AppDispatch>();
  const [focus, setFocus] = useState({ email: false, password: false });
  const user = useCurrentUser();

  const {
    register,
    handleSubmit,
    setError,
    watch,
    formState: { errors }
  } = useForm<Inputs>({
    resolver: yupResolver(userSchemaLogin),
  });

  const valueEmail = watch('email') || '';
  const valuePassword = watch('password') || '';

  const onSubmit = async (data: Inputs) => {
    setLoading(true);

    try {
      const response = await authService.login(data);

      if (response.status >= 400) {
        const errorMsg = response.response?.data?.message || 'Có lỗi xảy ra';

        setError('password', {
          type: 'manual',
          message: errorMsg,
        });

        notification.error({
          placement: 'topRight',
          message: 'Đăng nhập thất bại',
          description: errorMsg,
          duration: 3,
        });

        throw response;
      }

      notification.success({
        placement: 'topRight',
        message: 'Đăng nhập thành công',
        duration: 2,
      });
      console.log(response);
      dispatch(getCurrentUser());
      localStorage.setItem('token', response.access_token);
      localStorage.setItem('refresh_token', response.refresh_token)
      // httpRequests.setToken(response.access_token);

      navigate(query.get("continue") || config.routes.home);
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (user) {
    navigate(query.get("continue") || config.routes.home);
    return;
  }
  return (
    <form className={clsx(styles.form__login)} onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <div className="mb-3">
        <label
          htmlFor="email"
          className={clsx({
            [styles.label__email]: valueEmail.length > 0 || focus.email,
            [styles.label__formal]: valueEmail.length === 0 && !focus.email,
          })}
        >
          <FontAwesomeIcon icon={faEnvelope} /> Email
        </label>
        <input
          type="email"
          id="email"
          className={styles.input__content}
          {...register('email')}
          onFocus={() => setFocus(prev => ({ ...prev, email: true }))}
          onBlur={() => setFocus(prev => ({ ...prev, email: false }))}
        />
        {errors.email && <p>{errors.email.message}</p>}
      </div>

      {/* Password */}
      <div className="mb-3">
        <label
          htmlFor="password"
          className={clsx({
            [styles.label__password]: valuePassword.length > 0 || focus.password,
            [styles.label__formal]: valuePassword.length === 0 && !focus.password,
          })}
        >
          <FontAwesomeIcon icon={faLock} /> Password
        </label>
        <input
          type="password"
          id="password"
          className={styles.input__content}
          {...register('password')}
          onFocus={() => setFocus(prev => ({ ...prev, password: true }))}
          onBlur={() => setFocus(prev => ({ ...prev, password: false }))}
        />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      {/* Submit */}
      <div className={styles.btn__container}>
        <Button className={styles.btn__login} primary>
          {loading ? <FontAwesomeIcon icon={faSpinner} spin /> : 'Đăng nhập'}
        </Button>
      </div>

      <div className={clsx('mt-3', 'mb-3')}>
        <Link to="/">Quay về trang chủ</Link>
        <Link to="/register">Chuyển đến trang đăng ký</Link>
      </div>
    </form>
  );
};

export default Login;
