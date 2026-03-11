import { useState } from 'react';

function LoginPage(){
  const [showPassword, setShowPassword] = useState<boolean>(false);
  // Add state to track if we are logging in or signing up
  const [isLogin, setIsLogin] = useState<boolean>(true);

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
              {/* Dynamic Header Text */}
              <h1 className="h3 fw-bold text-dark mb-1">
                {isLogin ? "Welcome Back" : "Create an Account"}
              </h1>
              <p className="text-muted small mb-0">
                {isLogin ? "Please enter your details to sign in" : "Sign up to get started"}
              </p>
            </div>

            {/* Tabs (Changed to buttons to handle state without changing the URL hash) */}
            <div className="d-flex border-bottom mb-4">
              <button 
                type="button"
                onClick={() => setIsLogin(true)}
                className={`btn flex-fill text-center pb-3 fw-bold rounded-0 ${isLogin ? 'text-primary border-bottom border-primary border-2' : 'text-muted border-bottom border-transparent border-2 transition-colors hover-text-dark'}`}
              >
                Login
              </button>
              <button 
                type="button"
                onClick={() => setIsLogin(false)}
                className={`btn flex-fill text-center pb-3 fw-bold rounded-0 ${!isLogin ? 'text-primary border-bottom border-primary border-2' : 'text-muted border-bottom border-transparent border-2 transition-colors hover-text-dark'}`}
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

            {/* Divider */}
            <div className="d-flex align-items-center gap-3 mb-4">
              <hr className="flex-grow-1 text-muted m-0" />
              <span className="text-muted small text-uppercase fw-semibold" style={{ letterSpacing: '1px', fontSize: '11px' }}>or email</span>
              <hr className="flex-grow-1 text-muted m-0" />
            </div>

            {/* Form */}
            <form onSubmit={(e) => e.preventDefault()}>
              
              {/* Dynamic Inputs based on mode */}
              {isLogin ? (
                <div className="mb-3">
                  <label className="form-label text-muted small text-uppercase fw-bold ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Email or Username</label>
                  <div className="input-group input-group-lg input-group-focus">
                    <span className="input-group-text bg-white border-end-0 text-muted">
                      <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                    </span>
                    <input type="text" className="form-control border-start-0 ps-0" placeholder="name@example.com" />
                  </div>
                </div>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="form-label text-muted small text-uppercase fw-bold ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Email</label>
                    <div className="input-group input-group-lg input-group-focus">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>mail</span>
                      </span>
                      <input type="email" className="form-control border-start-0 ps-0" placeholder="name@example.com" />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label text-muted small text-uppercase fw-bold ms-1" style={{ fontSize: '11px', letterSpacing: '1px' }}>Username</label>
                    <div className="input-group input-group-lg input-group-focus">
                      <span className="input-group-text bg-white border-end-0 text-muted">
                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>person</span>
                      </span>
                      <input type="text" className="form-control border-start-0 ps-0" placeholder="choose a username" />
                    </div>
                  </div>
                </>
              )}

              <div className="mb-3">
                <div className="input-group input-group-lg input-group-focus mt-2">
                  <span className="input-group-text bg-white border-end-0 text-muted">
                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>lock</span>
                  </span>
                  <input 
                    type={showPassword ? "text" : "password"} 
                    className="form-control border-start-0 border-end-0 px-0" 
                    placeholder="••••••••" 
                  />
                  <button 
                    className="btn border border-start-0 bg-white text-muted" 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined d-flex align-items-center" style={{ fontSize: '20px' }}>
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
              </div>

              <button type="submit" className="btn btn-primary btn-lg w-100 d-flex align-items-center justify-content-center gap-2 fw-bold shadow-sm mt-4">
                {isLogin ? "Sign In" : "Create Account"}
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>arrow_forward</span>
              </button>
            </form>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-4 text-center">
        <p className="text-muted mb-0 text-uppercase fw-semibold" style={{ fontSize: '10px', letterSpacing: '1px' }}>
          © 2026 PostIt Inc. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default LoginPage;