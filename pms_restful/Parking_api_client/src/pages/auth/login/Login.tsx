import { signIn } from "../../../services/auth";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import { BiLoaderAlt } from "react-icons/bi";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import * as yup from "yup";
import { FiMail, FiLock } from "react-icons/fi";
import { BiSolidHide, BiSolidShow } from "react-icons/bi";

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  type LoginInputs = {
    email: string;
    password: string;
  };

  const LoginSchema = yup.object({
    email: yup
      .string()
      .email("This email is not valid")
      .required("Email is required"),
    password: yup
      .string()
      .matches(
        /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_])[A-Za-z\d\W_]{6,}$/,
        "Must include uppercase, number, and symbol"
      )
      .required("Password is required"),
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInputs>({
    resolver: yupResolver(LoginSchema) as Resolver<LoginInputs, any>,
    mode: "onTouched",
  });

  const dispatch = useDispatch();

  const onSubmit: SubmitHandler<LoginInputs> = async (data) => {
    await signIn({
      dispatch,
      setLoading,
      email: data.email,
      password: data.password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Helmet>
        <title>Login | PMS</title>
      </Helmet>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        {/* Header with gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Welcome Back</h1>
          <p className="text-blue-100 mt-1">Sign in to your account</p>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiMail className="text-gray-400" />
                </div>
                <input
                  {...register("email")}
                  type="email"
                  placeholder="johndoe@example.com"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  {...register("password")}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <BiSolidShow size={18} />
                  ) : (
                    <BiSolidHide size={18} />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              disabled={loading}
              type="submit"
              className={`w-full py-3 px-4 rounded-lg text-white font-semibold transition-all duration-300 flex items-center justify-center
                                ${
                                  loading
                                    ? "bg-blue-400"
                                    : "bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg"
                                }`}
            >
              {loading ? (
                <>
                  <BiLoaderAlt className="animate-spin mr-2" size={18} />
                  Signing In...
                </>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <div className="flex items-center justify-between">
            <Link
              to="/auth/forgot-password"
              className="text-s text-blue-600 hover:text-blue-800 hover:underline transition-colors"
            >
              Forgot password?
            </Link>

            <div className="text-sm text-gray-600">
              Need an account?{" "}
              <Link
                to="/auth/signup"
                className="text-blue-600 hover:text-blue-800 font-medium hover:underline transition-colors"
              >
                Sign up
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
