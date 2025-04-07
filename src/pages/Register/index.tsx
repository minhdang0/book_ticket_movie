import React, { useEffect, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from "@hookform/resolvers/yup";
import { Link, useNavigate } from 'react-router-dom';
import * as authService from '../../services/authService';
import * as httpRequests from '../../utils/api/httpRequests';
import styles from './Register.module.scss';
import clsx from 'clsx';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckCircle, faEnvelope, faLock, faUser } from '@fortawesome/free-solid-svg-icons';
import Button from '../../components/Button';
import { userSchemaRegister } from '../../schema/schema';

type Inputs = {
  fullname: string;
  email: string;
  password: string;
  password_confirmation: string;
};

const Register: React.FC = () => {
  const { register, handleSubmit, watch, trigger, setError, clearErrors, formState: { errors } } = useForm({
    resolver: yupResolver(userSchemaRegister),
  });

  const navigate = useNavigate();
  const myTime = useRef<NodeJS.Timeout | null>(null);

  const getName = (name: string) => {
    const nameArr = name.trim().split(" ").map(item => item);
    if (nameArr.length === 1) return [nameArr[0], ""];

    const firstName = nameArr.pop();
    const lastName = nameArr.join(" ");
    return [firstName, lastName];

  }
  const onSubmit = async (data: Inputs) => {
    const [firstName, lastName] = getName(data.fullname);

    const requestData = {
      firstName,
      lastName,
      email: data.email,
      password: data.password,
      password_confirmation: data.password_confirmation
    }
    console.log(requestData)
    try {
      const response = await authService.register(requestData);

      if (response.status >= 400) {
        if (response.response.data.message) {
          setError("password_confirmation", {
            type: "manual",
            message: response.response.data.message
          });
        }
      }
      httpRequests.setToken(response.data.access_token);
      navigate('/login');
    } catch (error) {
      console.log(error)
    }

  };

  const emailValue = watch('email');
  useEffect(() => {
    if (!emailValue) return;
    if (myTime.current) clearTimeout(myTime.current);

    myTime.current = setTimeout(async () => {
      const isValid = await trigger('email');

      if (isValid) {
        const exists = await authService.checkEmail(emailValue);
        if (exists) {
          setError("email", {
            type: "manual",
            message: "Email đã tồn tại. Vui lòng sử dụng email khác"
          });
        } else clearErrors("email");
      }

    }, 800)
  }, [emailValue, trigger, setError])
  return (
    <form className={clsx(styles.form__register)} onSubmit={handleSubmit(onSubmit)}>
      {/* Fullname */}
      <div className='mb-3'>
        <label htmlFor='fullname'><FontAwesomeIcon icon={faUser} /> Họ và tên</label>
        <input type='text' id='fullname' {...register("fullname")} />
        {errors.fullname && <p>{errors.fullname.message}</p>}
      </div>
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

      {/* Confirm Password */}
      <div className='mb-3'>
        <label htmlFor='password_confirmation'><FontAwesomeIcon icon={faCheckCircle} />Nhập lại mật khẩu</label>
        <input type='password' id='password_confirmation' {...register("password_confirmation")} />
        {errors.password_confirmation && <p>{errors.password_confirmation.message}</p>}
      </div>

      {/* Submit */}
      <Button primary>Đăng ký</Button>
      <div className={clsx('mt-3', 'mb-3')}>
        <Link to='/'>Quay về trang chủ</Link>
        <Link to='/login'>Chuyển đến trang đăng nhập</Link>
      </div>
    </form>
  );
};

export default Register;
