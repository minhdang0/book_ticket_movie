import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import * as httpRequests from '../../utils/api/httpRequests';
import styles from './Login.module.scss';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faLock } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/Button';
import { userSchemaLogin } from '../../schema/schema';
import config from '../../config';
import useQuery from '../../hooks/useQuery';

type Inputs = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [user, setUser] = useState(null);
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(userSchemaLogin),
  });

  const navigate = useNavigate();
  const query = useQuery();

  const onSubmit = async (data: Inputs) => {

    const requestData = {
      email: data.email,
      password: data.password,
    }

    try {
      const response = await authService.login(requestData);
      if (response.status === 'error') throw response;
      httpRequests.setToken(response.access_token);

      const res = await authService.currentUser();
      setUser(res.user);

      navigate(query.get("continue") || config.routes.home);
    } catch (error) {
      console.log(error)
    }

  };


  return (
    <form className={clsx(styles.form__login)} onSubmit={handleSubmit(onSubmit)}>
      {/* Email */}
      <div className='mb-3'>
        <label htmlFor='email'><FontAwesomeIcon icon={faEnvelope} />Email</label>
        <input type='email' id='email' {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
      </div>
      {/* Password */}
      <div className='mb-3'>
        <label htmlFor='password'><FontAwesomeIcon icon={faLock} />Password</label>
        <input type='password' id='password' {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}
      </div>

      {/* Submit */}
      <Button primary>Login</Button>
      <div className={clsx('mt-3', 'mb-3')}>
        <Link to='/'>Quay về trang chủ</Link>
        <Link to='/register'>Chuyển đến trang đăng ký</Link>
      </div>
    </form>
  );
};

export default Login;
