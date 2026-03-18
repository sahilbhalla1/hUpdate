import { useForm } from "react-hook-form";
import { ErrorMessage } from "@hookform/error-message";
import cmssvg from "../../assets/loginillustration.svg";
import logo from "../../assets/hisense-logo.svg";
import { toast } from "sonner";
import { useNavigate, useSearchParams } from "react-router-dom";
import { User, Lock } from "lucide-react";
import "../../styles/Signin.css";
import { authenticate } from "../../utils/helpers";
import api from "../../services/api";
import { useEffect } from "react";

export default function SignIn() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const handleDialerLogin = async (agentId, mobile) => {
    try {
      // Endpoint to validate dialer-based credentials
      const response = await api.post("/auth/dialer-login", {
        agentId,
        mobile,
      });

      if (response.status === 200) {
        authenticate(response, () => {
          // Redirect to Create Ticket with the customer's phone number
          navigate(`/tickets/create?phone=${mobile}`);
        });
      }
    } catch (err) {
      console.error("Dialer login failed", err);
      toast.error("Login failed.");
    }
  };

  // Handle Dialer Parameters on Component Mount
  useEffect(() => {
    const agentId = searchParams.get("agentid");
    const mobile = searchParams.get("mobile");
    if (agentId && mobile) {
      handleDialerLogin(agentId, mobile);
    }
  }, [searchParams]);

  const onSubmit = async ({ userid, password }) => {
    try {
      const response = await api.post("/auth/login", {
        email: userid,
        password,
      });

      if (response.status === 200) {
        authenticate(response, () => {
          navigate("/home");
        });
      }
    } catch (err) {
      console.log(err);
      toast.error("Invalid credentials!");
    }
  };

  return (
    <>
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6">
        <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-lg bg-white shadow-lg md:flex-row">
          {/* Left Section */}
          <div className="flex w-full flex-col items-center justify-center bg-[#1c2649] p-6 text-white md:w-1/2">
            <div className="text-center">
              <h3 className="mb-2 text-xl font-semibold">HTM (Hisense Ticket Management)</h3>
              <p className="text-sm text-gray-200">
                The Ticket Management System provides steps for setting up and customizing the platform to efficiently track, manage, and
                resolve customer tickets.
              </p>
            </div>
            <div className="mt-1 w-full max-w-xs">
              <img src={cmssvg} alt="Illustration" className="w-full" />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex w-full items-center justify-center p-6 md:w-1/2 md:p-10">
            <div className="w-full max-w-sm">
              <div className="mb-4 text-center">
                <img src={logo} alt="Logo" className="mx-auto h-6" />
                {/* <p className="mt-2 text-sm text-gray-500">
                  Customer Relationship Management
                </p> */}
              </div>

              <h5 className="mb-2 text-center text-lg font-medium">Login to HTM</h5>

              <form className="space-y-4 text-sm" onSubmit={handleSubmit(onSubmit)}>
                {/* email */}
                <div>
                  <label htmlFor="userid" className="mb-1 block text-gray-600">
                    User ID
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      id="userid"
                      placeholder="User ID"
                      className="w-full rounded border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      {...register("userid", {
                        required: "UserId is required.",
                      })}
                    />
                  </div>
                  <ErrorMessage
                    errors={errors}
                    name="userid"
                    render={({ message }) => <p className="mt-1 text-xs text-red-500">{message}</p>}
                  />
                </div>

                {/* Password */}
                <div>
                  <label htmlFor="password" className="mb-1 block text-gray-600">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <input
                      type="password"
                      id="password"
                      placeholder="Password"
                      className="w-full rounded border border-gray-300 px-3 py-2 pl-9 text-sm focus:border-blue-500 focus:ring focus:ring-blue-200"
                      {...register("password", {
                        required: "Password is required.",
                      })}
                    />
                  </div>
                  <ErrorMessage
                    errors={errors}
                    name="password"
                    render={({ message }) => <p className="mt-1 text-xs text-red-500">{message}</p>}
                  />
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  style={{ cursor: "pointer" }}
                  className="w-full rounded bg-[#1c2649] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#121831]"
                >
                  Log In
                </button>
              </form>

              {/* Footer */}
              <p className="mt-6 text-center text-xs text-gray-500">
                © {new Date().getFullYear()} All rights reserved: Cogent E-Services Limited
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
