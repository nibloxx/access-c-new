import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Input from "../ui/Input";
import CustomSelector from "../ui/CustomSelector";
import Modal from "../ui/Modal";
import { ROLES } from "../../utils/constants";
import { useDispatch } from "react-redux";
import { createUser, updateUser } from "../../store/user/userThunk";
import Loader from "../ui/Loader";

// Define Zod validation schema
const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  email: z.string().email("Invalid email address"),
  roles: z.array(z.string()).min(1, "At least one role must be selected"),
  isAdmin: z.boolean().default(false),
  password: z.string().optional(),
});

// Create a conditional schema for new users vs editing existing users
const createUserSchema = userSchema.extend({
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const initialdata = {
  username: "",
  email: "",
  password: "",
  firstName: "",
  lastName: "",
  roles: [],
  isAdmin: false,
};
const UserModal = ({ isOpen, onClose,isLoading, user }) => {
  const dispatch = useDispatch();
  const schema = user ? userSchema : createUserSchema;

  // Initialize form with react-hook-form and zod resolver
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: initialdata,
  });
  
  // Reset form when user data changes
  React.useEffect(() => {
    if (isOpen) {
      if (user) {
        // When editing, populate all fields except password
        reset({
          ...user,
          password: "",
        });
      } else {
        // When creating new user, reset to defaults
        reset(initialdata);
      }
    }
  }, [isOpen, user, reset]);

  // Custom handler for the role selector component
  const handleRoleChange = (e) => {
    setValue("roles", e.target.value, { shouldValidate: true });
  };

  // Watch the roles value to pass to the CustomSelector
  const watchedRoles = watch("roles");

  // Submit handler
  const onSubmitForm = (data) => {
    const { username, email, password, firstName, lastName, roles } = data;
    const payload = {
      username,
      email,
      password,
      firstName,
      lastName,
      roles,
    };
   
    if (user) {
      // Update user

      dispatch(
        updateUser({
          id: user._id,
          payload,
          onSuccess: () => {
            reset(initialdata);
            onClose();
          },
          onError: () => {
            // Handle error (e.g., show a notification)
            console.error("Error creating user");
          },
        })
      );
    } else {
      // Create new user
      dispatch(
        createUser({
          payload,
          onSuccess: () => {
            reset(initialdata);
            onClose();
          },
          onError: () => {
            // Handle error (e.g., show a notification)
            console.error("Error creating user");
          },
        })
      );
    }
  };

  // Setup role options
  const roleOptions = Object.values(ROLES).map((role) => ({
    value: role,
    label: role,
  }));

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={user ? "Edit User" : "Add New User"}
    >
      <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-4">
        <div>
          <Input
            label="Username"
            name="username"
            {...register("username")}
            required
          />
          {errors.username && (
            <p className="mt-1 text-sm text-red-600">
              {errors.username.message}
            </p>
          )}
        </div>

        <div>
          <Input
            label="First Name"
            name="firstName"
            {...register("firstName")}
          />
          {errors.firstName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.firstName.message}
            </p>
          )}
        </div>

        <div>
          <Input label="Last Name" name="lastName" {...register("lastName")} />
          {errors.lastName && (
            <p className="mt-1 text-sm text-red-600">
              {errors.lastName.message}
            </p>
          )}
        </div>

        <div>
          <Input
            label="Email"
            name="email"
            type="email"
            {...register("email")}
            required
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
          )}
        </div>

        <div>
          <CustomSelector
            label="Roles"
            name="roles"
            value={watchedRoles}
            onChange={handleRoleChange}
            options={roleOptions}
            multiple
            placeholder="Select roles..."
            required
          />
          {errors.roles && (
            <p className="mt-1 text-sm text-red-600">{errors.roles.message}</p>
          )}
        </div>

        {!user && (
          <div>
            <Input
              label="Password"
              name="password"
              type="password"
              {...register("password")}
              required
            />
            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>
        )}

        <div className="flex justify-end space-x-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
          disabled={isLoading}
            type="submit"
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
          >
           {isLoading?<Loader /> : user ? "Update" : "Create"}
          </button>
        </div>
      </form>
    </Modal>
  );
};

export default UserModal;
