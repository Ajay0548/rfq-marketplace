import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import StatusBadge from './StatusBadge';
import { 
  Building2, 
  LayoutDashboard, 
  FileText, 
  PlusCircle, 
  Search, 
  Send, 
  LogOut, 
  Menu, 
  X,
  User as UserIcon
} from 'lucide-react';

export default function Navbar() {
  const { user, role, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <header style={{ backgroundColor: '#ffffff', borderBottom: '1px solid var(--border-color)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '68px' }}>
        {/* Brand */}
        <Link to="/" onClick={closeMenu} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', textDecoration: 'none' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '8px', backgroundColor: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ffffff' }}>
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-main)', letterSpacing: '-0.02em', lineHeight: 1.2 }}>
              RFQ Marketplace
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
              B2B Sourcing Platform
            </div>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav style={{ display: 'none', alignItems: 'center', gap: '0.5rem' }} className="desktop-nav">
          {isAuthenticated && role === 'BUYER' && (
            <>
              <NavLink
                to="/buyer/dashboard"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <NavLink
                to="/buyer/rfqs"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
              >
                <FileText size={16} /> My RFQs
              </NavLink>
              <NavLink
                to="/buyer/rfqs/create"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
              >
                <PlusCircle size={16} /> Create RFQ
              </NavLink>
            </>
          )}

          {isAuthenticated && role === 'SUPPLIER' && (
            <>
              <NavLink
                to="/supplier/dashboard"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
              >
                <LayoutDashboard size={16} /> Dashboard
              </NavLink>
              <NavLink
                to="/supplier/rfqs"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
              >
                <Search size={16} /> Browse RFQs
              </NavLink>
              <NavLink
                to="/supplier/quotations"
                className={({ isActive }) => `btn btn-sm ${isActive ? 'btn-primary' : 'btn-outline'}`}
                style={{ border: 'none' }}
              >
                <Send size={16} /> My Quotations
              </NavLink>
            </>
          )}
        </nav>

        {/* User Auth Section */}
        <div style={{ display: 'none', alignItems: 'center', gap: '1rem' }} className="desktop-nav">
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '50%', backgroundColor: 'var(--secondary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--secondary)' }}>
                  <UserIcon size={18} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      {user?.name}
                    </span>
                    <StatusBadge status={role} type="role" />
                  </div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {user?.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogout}
                className="btn btn-sm btn-outline"
                title="Logout"
                style={{ color: 'var(--danger)', borderColor: '#fecaca' }}
              >
                <LogOut size={15} /> Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-sm btn-outline">
                Log In
              </Link>
              <Link to="/register" className="btn btn-sm btn-primary">
                Register
              </Link>
            </div>
          )}
        </div>

        {/* Mobile Toggle Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="mobile-toggle-btn btn btn-sm btn-outline"
          aria-label="Toggle menu"
          style={{ display: 'inline-flex' }}
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div style={{ backgroundColor: '#ffffff', borderTop: '1px solid var(--border-color)', padding: '1rem 1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {isAuthenticated && (
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.9375rem' }}>{user?.name}</div>
                <div style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>{user?.email}</div>
              </div>
              <StatusBadge status={role} type="role" />
            </div>
          )}

          {isAuthenticated && role === 'BUYER' && (
            <>
              <Link to="/buyer/dashboard" onClick={closeMenu} className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <LayoutDashboard size={16} /> Buyer Dashboard
              </Link>
              <Link to="/buyer/rfqs" onClick={closeMenu} className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <FileText size={16} /> My RFQs
              </Link>
              <Link to="/buyer/rfqs/create" onClick={closeMenu} className="btn btn-primary btn-block" style={{ justifyContent: 'flex-start' }}>
                <PlusCircle size={16} /> Create New RFQ
              </Link>
            </>
          )}

          {isAuthenticated && role === 'SUPPLIER' && (
            <>
              <Link to="/supplier/dashboard" onClick={closeMenu} className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <LayoutDashboard size={16} /> Supplier Dashboard
              </Link>
              <Link to="/supplier/rfqs" onClick={closeMenu} className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <Search size={16} /> Browse Open RFQs
              </Link>
              <Link to="/supplier/quotations" onClick={closeMenu} className="btn btn-outline btn-block" style={{ justifyContent: 'flex-start' }}>
                <Send size={16} /> My Submitted Quotes
              </Link>
            </>
          )}

          {isAuthenticated ? (
            <button
              type="button"
              onClick={() => {
                closeMenu();
                handleLogout();
              }}
              className="btn btn-danger btn-block"
              style={{ marginTop: '0.5rem' }}
            >
              <LogOut size={16} /> Log Out
            </button>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: '0.5rem' }}>
              <Link to="/login" onClick={closeMenu} className="btn btn-outline btn-block">
                Log In
              </Link>
              <Link to="/register" onClick={closeMenu} className="btn btn-primary btn-block">
                Register
              </Link>
            </div>
          )}
        </div>
      )}

      <style>{`
        @media (min-width: 768px) {
          .desktop-nav {
            display: flex !important;
          }
          .mobile-toggle-btn {
            display: none !important;
          }
        }
      `}</style>
    </header>
  );
}
