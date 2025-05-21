import { updateUser } from "../../services/user";
import { UpdateInputs } from "../../types";
import { yupResolver } from "@hookform/resolvers/yup";
import React, { useState, useContext, useEffect } from "react";
import { CommonContext } from "../../context";
import { Helmet } from "react-helmet";
import { Resolver, SubmitHandler, useForm } from "react-hook-form";
import * as yup from "yup";
import { BiLoaderAlt, BiSolidHide, BiSolidShow } from "react-icons/bi";
import { FiUser, FiPhone, FiLock } from "react-icons/fi";

const Profile = () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [showPasswords, setShowPasswords] = useState({
    old: false,
    new: false,
  });

  const { user } = useContext(CommonContext);

  const ProfileSchema = yup.object({
    firstName: yup.string().label("First name"),
    lastName: yup.string().label("Last name"),
    oldPassword: yup.string().label("Old Password"),
    newPassword: yup.string().label("New Password"),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateInputs>({
    resolver: yupResolver(ProfileSchema) as Resolver<UpdateInputs, any>,
    mode: "onTouched",
  });

  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        oldPassword: "",
        newPassword: "",
      });
    }
  }, [user, reset]);

  const onSubmit: SubmitHandler<UpdateInputs> = async (data) => {
    await updateUser({ setLoading, data });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Helmet>
        <title>Update Profile</title>
      </Helmet>

      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-center">
          <h1 className="text-2xl font-bold text-white">Update Profile</h1>
          <p className="text-blue-100 mt-1">Manage your account info</p>
        </div>

        <div className="p-6 space-y-5">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* First Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                First Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  {...register("firstName")}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.firstName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.firstName.message}
                </p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Last Name
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiUser className="text-gray-400" />
                </div>
                <input
                  {...register("lastName")}
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              {errors.lastName && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.lastName.message}
                </p>
              )}
            </div>

            {/* Old Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Old Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPasswords.old ? "text" : "password"}
                  {...register("oldPassword")}
                  className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, old: !prev.old }))
                  }
                >
                  {showPasswords.old ? <BiSolidShow /> : <BiSolidHide />}
                </button>
              </div>
              {errors.oldPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.oldPassword.message}
                </p>
              )}
            </div>

            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FiLock className="text-gray-400" />
                </div>
                <input
                  type={showPasswords.new ? "text" : "password"}
                  {...register("newPassword")}
                  className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  className="absolute right-3 top-2.5 text-gray-500"
                  onClick={() =>
                    setShowPasswords((prev) => ({ ...prev, new: !prev.new }))
                  }
                >
                  {showPasswords.new ? <BiSolidShow /> : <BiSolidHide />}
                </button>
              </div>
              {errors.newPassword && (
                <p className="text-xs text-red-500 mt-1">
                  {errors.newPassword.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-white font-semibold transition duration-300 ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading ? (
                <BiLoaderAlt className="animate-spin mx-auto" size={20} />
              ) : (
                "Update Profile"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
