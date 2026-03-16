import Logo from './logo';
import { useAuth } from '../../context/AuthContext';
import { useEffect, useState } from 'react';
import { DEFAULT_AVATAR, getUserAvatarById } from '../../services/userService';

export const PageType = {
  Home: 'home',
  Profile: 'profile',
} as const;
export type PageType = typeof PageType[keyof typeof PageType];

interface HeaderProps {
  page?: PageType;
  onLogout?: () => void;
  onSettings?: () => void;
  onSearch?: (query: string) => void;
  searchLoading?: boolean;
}

export default function Header({ page = PageType.Home, onLogout, onSettings, onSearch }: HeaderProps) {
  const { user, logout } = useAuth();
  const [profileAvatar, setProfileAvatar] = useState<string>(DEFAULT_AVATAR);
  const [searchValue, setSearchValue] = useState("");

  const handleSearchTrigger = (val: string) => {
    onSearch?.(val.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchTrigger(searchValue);
    }
  };

  const handleClear = () => {
    setSearchValue("");
    handleSearchTrigger(""); // Trigger empty search to return to main feed
  };

  useEffect(() => {
    getUserAvatarById(user?.id).then(setProfileAvatar);
  }, [user?.id]);

  const userName = user?.username || 'Unknown User';
  const userAvatar = profileAvatar;

  return (
    <header className="sticky-top border-bottom bg-white shadow-sm">
      <div className="container-xl">
        <div className="d-flex align-items-center justify-content-between py-2" style={{ gap: '1rem' }}>

        {/* Logo */}
        <Logo />

        {/* AI-Powered Search Bar */}
        {page !== PageType.Profile && (
        <div className="flex-grow-1 d-flex justify-content-center" style={{ maxWidth: '448px' }}>
          <div className="position-relative w-100">
            <span
              className="position-absolute top-50 translate-middle-y text-primary d-flex align-items-center"
              style={{ left: '12px', zIndex: 1, pointerEvents: 'none' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>auto_awesome</span>
            </span>
            <input
              type="text"
              className="form-control rounded-pill bg-light border-0"
              placeholder="Ask AI to find posts, people or trends..."
              style={{ paddingLeft: '2.5rem', paddingRight: '2.5rem' }}
              value={searchValue}
              onChange={e => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />

            {/* Clear Button (X) */}
            {searchValue && (
              <button
                onClick={handleClear}
                className="btn btn-link position-absolute top-50 translate-middle-y p-0 d-flex align-items-center text-secondary border-0"
                style={{ right: '12px', zIndex: 2, textDecoration: 'none' }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>close</span>
              </button>
            )}
          </div>
        </div>
        )}

        {/* Logout + Right Section */}
        <nav className="d-flex align-items-center gap-2">
          {/* Logout — desktop */}
          <a
            href="#"
            className="d-none d-sm-flex align-items-center gap-1 text-decoration-none text-secondary rounded px-2 py-2 header-logout-btn"
            style={{ fontSize: '14px', fontWeight: 500 }}
            onClick={(e) => { e.preventDefault(); onLogout ? onLogout() : logout(); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>logout</span>
            <span>Logout</span>
          </a>
          {/* Logout — mobile */}
          <a
            href="#"
            className="d-flex d-sm-none align-items-center justify-content-center text-secondary text-decoration-none rounded header-logout-btn"
            style={{ width: '40px', height: '40px' }}
            onClick={(e) => { e.preventDefault(); onLogout ? onLogout() : logout(); }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>logout</span>
          </a>

          {/* Divider */}
          <div className="vr align-self-center" style={{ height: '24px' }} />

          {/* Right section: avatar+name on Home, settings on Profile */}
          {page === PageType.Profile ? (
            <button
              className="btn btn-light d-flex align-items-center justify-content-center rounded-circle p-0"
              style={{ width: '36px', height: '36px' }}
              title="Settings"
              onClick={onSettings}
            >
              <span className="material-symbols-outlined text-secondary" style={{ fontSize: '22px' }}>settings</span>
            </button>
          ) : (
            <div className="d-flex align-items-center gap-2">
              <img
                src={userAvatar}
                alt={`${userName} profile picture`}
                className="rounded-circle object-fit-cover flex-shrink-0"
                style={{ width: '36px', height: '36px' }}
              />
              <span className="d-none d-lg-block fw-semibold text-dark" style={{ fontSize: '14px' }}>
                {userName}
              </span>
            </div>
          )}
          </nav>

        </div>
      </div>
    </header>
  );
}

