import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { googleLogin } from '../services/authService';


function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const { login, logout, user, isAuthChecking } = useAuth();

  if (isAuthChecking) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-light" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="text-center">
          <div className="spinner-border text-primary" role="status" aria-hidden="true" />
          <p className="mt-3 text-muted mb-0">Checking session...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="vh-100 d-flex align-items-center justify-content-center bg-light" style={{ fontFamily: 'Inter, sans-serif' }}>
        <div className="card border-0 shadow-sm p-4 text-center" style={{ maxWidth: '420px', borderRadius: '1rem' }}>
          <h1 className="h4 fw-bold mb-2">You are already logged in</h1>
          <p className="text-muted mb-3">Welcome back, {user.username}.</p>
          <button type="button" className="btn btn-outline-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>
    );
    // TODO: redirect to home page 
  }

  return (
    <div className="vh-100 d-flex flex-column bg-light font-monospace" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Header */}
      <header className="d-flex align-items-center justify-content-between border-bottom px-4 py-3 bg-white shadow-sm sticky-top">
        <div className="d-flex align-items-center gap-2">
          <div className="text-primary" style={{ width: '32px', height: '32px' }}>
            <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path clipRule="evenodd" d="M24 18.4228L42 11.475V34.3663C42 34.7796 41.7457 35.1504 41.3601 35.2992L24 42V18.4228Z" fill="currentColor" fillRule="evenodd"></path>
              <path clipRule="evenodd" d="M24 8.18819L33.4123 11.574L24 15.2071L14.5877 11.574L24 8.18819ZM9 15.8487L21 20.4805V37.6263L9 32.9945V15.8487ZM27 37.6263V20.4805L39 15.8487V32.9945L27 37.6263ZM25.354 2.29885C24.4788 1.98402 23.5212 1.98402 22.646 2.29885L4.98454 8.65208C3.7939 9.08038 3 10.2097 3 11.475V34.3663C3 36.0196 4.01719 37.5026 5.55962 38.098L22.9197 44.7987C23.6149 45.0671 24.3851 45.0671 25.0803 44.7987L42.4404 38.098C43.9828 37.5026 45 36.0196 45 34.3663V11.475C45 10.2097 44.2061 9.08038 43.0155 8.65208L25.354 2.29885Z" fill="currentColor" fillRule="evenodd"></path>
            </svg>
          </div>
          <h2 className="h5 mb-0 fw-bold text-dark">PostIt</h2>
        </div>
        <button className="btn btn-primary d-flex align-items-center gap-2 fw-bold px-3">
          <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>help</span>
          Help
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-grow-1 d-flex flex-column align-items-center justify-content-center p-3 p-md-4">
        <div className="card border-0 shadow-lg w-100" style={{ maxWidth: '480px', borderRadius: '1rem' }}>

          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-4">
              <h1 className="h3 fw-bold text-dark mb-1">
                {isLogin ? "Welcome Back" : "Create an Account"}
              </h1>
              <p className="text-muted small mb-0">
                {isLogin ? "Please enter your details to sign in" : "Sign up to get started"}
              </p>
            </div>

            {/* Tabs */}
            <div className="d-flex border-bottom mb-4">
              <button
                type="button"
                onClick={() => setIsLogin(true)}
                className={`btn flex-fill text-center pb-3 fw-bold rounded-0 ${isLogin ? 'text-primary border-bottom border-primary border-2' : 'text-muted border-bottom border-transparent border-2 hover-text-dark'}`}
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => setIsLogin(false)}
                className={`btn flex-fill text-center pb-3 fw-bold rounded-0 ${!isLogin ? 'text-primary border-bottom border-primary border-2' : 'text-muted border-bottom border-transparent border-2 hover-text-dark'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Social Logins */}
            <div className="d-flex flex-column gap-3 mb-4 align-items-center">
              <GoogleLogin
                onSuccess={async (response) => {
                  try {
                    const result = await googleLogin(response.credential!);

                    login({
                      userId: result.userId,
                      username: result.username,
                      token: result.token,
                      refreshToken: result.refreshToken,
                    });

                    console.log("Google login success", result);

                    // TODO: redirect to home page
                  } catch (err: any) {
                    console.error("Google login failed", err);
                  }
                }}
                onError={() => {
                  console.log("Google login failed");
                }}
              />

            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <hr className="flex-grow-1 text-muted m-0" />
              <span className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: '1px', fontSize: '11px' }}>or email</span>
              <hr className="flex-grow-1 text-muted m-0" />
            </div>

            {/* Form */}
            {isLogin ? <LoginForm /> : <SignupForm />}
          </div>
        </div>
      </main>

      <footer className="mt-auto py-4 text-center">
        <p className="text-muted mb-0 text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>
          © 2026 PostIt Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
}

export default AuthPage;
