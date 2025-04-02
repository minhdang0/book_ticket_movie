import React from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';

type Props = {
  name: string;
  label: string;
  icon?: React.ReactNode;
  register: UseFormRegister<FieldValues>;
  errors: any;
  type?: string;
};

const Input: React.FC<Props> = ({ name, label, register, errors, type = 'text' }) => {
  return (
    <div className='mb-3'>
      <label htmlFor={name}>
        {label}
      </label>
      <input
        type={type}
        id={name}
        {...register(name)}
        className="form-control"
      />
      {errors[name] && <p>{errors[name]?.message}</p>}
    </div>
  );
};

export default Input;
