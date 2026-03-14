import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useAuth } from '../../context/AuthContext';
import { registerUser } from '../../services/authService';

const signUpSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .regex(/^[^\s@]+@[^\s@]+\.[^\s@]+$/, "Please enter a valid email"),
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username is too long"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

type SignUpFormData = {
  email: string;
  username: string;
  password: string;
};

function SignupForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: SignUpFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const result = await registerUser(data.email, data.username, data.password);

      login({
        userId: result.userId,
        username: result.username ?? data.username,
        token: result.token,
        refreshToken: result.refreshToken,
      });

      console.log('Registered successfully', result);
      // TODO: redirect user to home page
      // navigate("/home")

    } catch (err: any) {
        setServerError(err.response?.data?.message || "Something went wrong. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label className="form-label text-muted small text-uppercase fw-bold ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Email</label>
        <div className={`input-group input-group-lg input-group-focus ${errors.email ? 'is-invalid' : ''}`}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
          </span>
          <input
            type="email"
            className={`form-control border-start-0 ps-0 ${errors.email ? 'is-invalid border-danger' : ''}`}
            placeholder="name@example.com"
            {...register("email")}
          />
        </div>
        {errors.email && <div className="text-danger small mt-1 ms-1 fw-semibold">{errors.email.message}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label text-muted small text-uppercase fw-bold ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Username</label>
        <div className={`input-group input-group-lg input-group-focus ${errors.username ? 'is-invalid' : ''}`}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
          </span>
          <input
            type="text"
            className={`form-control border-start-0 ps-0 ${errors.username ? 'is-invalid border-danger' : ''}`}
            placeholder="choose a username"
            {...register("username")}
          />
        </div>
        {errors.username && <div className="text-danger small mt-1 ms-1 fw-semibold">{errors.username.message}</div>}
      </div>

      <div className="mb-3">
        <div className={`input-group input-group-lg input-group-focus ${errors.password ? 'is-invalid' : ''}`}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
          </span>
          <input
            type={showPassword ? "text" : "password"}
            className={`form-control border-start-0 border-end-0 px-0 ${errors.password ? 'is-invalid border-danger' : ''}`}
            placeholder="••••••••"
            {...register("password")}
          />
          <button
            className={`btn border border-start-0 bg-white text-muted ${errors.password ? 'border-danger' : ''}`}
            type="button"
            onClick={() => setShowPassword(!showPassword)}
          >
            <span className="material-symbols-outlined d-flex align-items-center" style={{ fontSize: '20px' }}>
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
        {errors.password && <div className="text-danger small mt-1 ms-1 fw-semibold">{errors.password.message}</div>}
      </div>

      {serverError && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2 px-3 mt-3" role="alert">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>error</span>
          <span className="small fw-semibold">{serverError}</span>
        </div>
      )}

      <button type="submit" disabled={isLoading} className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 fw-bold shadow-sm mt-4">
        {isLoading ? (
          <>
            <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
            Creating Account...
          </>
        ) : (
          <>
            Create Account
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}

export default SignupForm;
