import { useRouter } from 'next/router';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useAuth } from '../../context/AuthContext';
import type { NextPage } from 'next';
import { FirebaseError } from '@firebase/util';
import { createUser, RoleType } from '@/lib/user';
import { Loading } from '../../components/loading';
import { YearType, MonthType, DaysType } from '../../features/const';

interface SignupType {
  email: string;
  password: string;
  password_confirm: string;
}
const SignupPage: NextPage = () => {
  const { signUp, user } = useAuth();
  const methods = useForm<SignupType>({ mode: 'onBlur' });
  const router = useRouter();
  const now = new Date();
  const year = now.getFullYear() as YearType;
  const month = (now.getMonth() + 1) as MonthType;
  const day = now.getDate() as DaysType;
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = methods;

  const onSubmit = async (data: SignupType) => {
    try {
      const userCredential = await signUp(data.email, data.password);
      await createUser({
        userId: userCredential.user.uid,
        role: RoleType.USER, // RoleType.ADMIN
      });
      router.push(`/${year}/${month}/${day}`);
    } catch (error: any) {
      if (error instanceof FirebaseError) {
        console.error(error);
      }
      console.error(error.message);
    }
  };

  if (!user) {
    return <Loading message={'更新中..'} />;
  }

  if (user && user.role !== RoleType.ADMIN) {
    router.push('/login');
  }

  return (
    <div className='sign-up-form container mx-auto w-96 mt-12  border-2'>
      <FormProvider {...methods}>
        <form
          action=''
          className='w-80 mx-auto pb-12 px-4'
          onSubmit={handleSubmit(onSubmit)}
        >
          <div className='mt-8'>
            <div className='flex items-center justify-between'>
              <label className='text-gray-600 mb-3 text-lg'>Email</label>
            </div>

            <input
              type='email'
              {...register('email', { required: 'Email is required' })}
              className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
            />
            {errors.email && (
              <p className='text-red-400'>{errors.email.message}</p>
            )}
          </div>
          <div className='mt-8'>
            <div className='flex items-center justify-between'>
              <label className='text-gray-600 mb-3 text-lg'>Password</label>
            </div>

            <input
              type='password'
              {...register('password', { required: 'Password is required' })}
              className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
            />
            {errors.password && (
              <p className='text-red-400'>{errors.password.message}</p>
            )}
          </div>
          <div className='mt-8'>
            <div className='flex items-center justify-between'>
              <label className='text-gray-600 mb-3 text-lg'>
                Confirm Password
              </label>
            </div>

            <input
              type='password'
              {...register('password_confirm', {
                required: 'Verify your password',
              })}
              className={`border border-solid rounded-lg ring:0 focus:ring-0 focus:outline-none border-gray-400 text-gray-500 text-normal py-3 h-12 px-6 text-lg w-full flex items-center`}
            />
            {errors.password_confirm && (
              <p className='text-red-400'>{errors.password_confirm.message}</p>
            )}
          </div>
          <div className='flex justify-center pt-8'>
            <button
              type='submit'
              className='bg-gray-900 w-full text-white rounded-md px-4 py-3 text-lg font-medium'
            >
              <p className='capitalize text-white font-normal'>登録</p>
            </button>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default SignupPage;
