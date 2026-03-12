import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import SignupForm from '../components/auth/SignupForm';
import Logo from '../components/general/logo';

function AuthPage() {
  const [isLogin, setIsLogin] = useState<boolean>(true);

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
            <div className="d-flex flex-column gap-3 mb-4">
              <button type="button" className="btn btn-light border d-flex align-items-center justify-content-center gap-3 py-2 fw-semibold text-secondary">
                <svg className="w-5 h-5" style={{ width: '20px', height: '20px' }} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
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
