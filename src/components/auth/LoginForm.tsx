import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const loginSchema = z.object({
  identifier: z.string().min(1, "Email or Username is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginFormData = {
  identifier: string;
  password: string;
};

function LoginForm() {
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    mode: "onChange",
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      console.log("Logging in with:", { identifier: data.identifier, password: data.password });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      throw new Error("Invalid credentials. Please check your email/username and password.");
      // TODO: Call backend login API here
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="mb-3">
        <label className="form-label text-muted small text-uppercase fw-bold ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Email or Username</label>
        <div className={`input-group input-group-lg input-group-focus ${errors.identifier ? 'is-invalid' : ''}`}>
          <span className="input-group-text bg-white border-end-0 text-muted">
            <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
          </span>
          <input
            type="text"
            className={`form-control border-start-0 ps-0 ${errors.identifier ? 'is-invalid border-danger' : ''}`}
            placeholder="name@example.com"
            {...register("identifier")}
          />
        </div>
        {errors.identifier && <div className="text-danger small mt-1 ms-1 fw-semibold">{errors.identifier.message}</div>}
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
            Signing In...
          </>
        ) : (
          <>
            Sign In
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
          </>
        )}
      </button>
    </form>
  );
}

export default LoginForm;
