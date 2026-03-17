import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import Logo from '../components/general/logo';
import { GoogleLogin } from '@react-oauth/google';
import { useAuth } from '../context/AuthContext';
import { googleLogin } from '../services/authService';
import HomeFeed from './HomeFeed';
// import CommentsPage from './CommentsPage';


function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const { login, user, isAuthChecking } = useAuth();

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
    return <HomeFeed />;
  }

  return (
    <div className="vh-100 d-flex flex-column bg-light font-monospace">

      {/* Header */}
      <header className="d-flex align-items-center justify-content-between border-bottom px-4 py-3 bg-white shadow-sm sticky-top">
        <Logo />
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
