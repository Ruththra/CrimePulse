import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Shield } from 'lucide-react';
import { Button } from '../components/ui/button';
import heartPulseLogo from '@/assets/heart-pulse-logo.png';
import { useAuthStore } from "../store/useAuthStore";



const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const mobileMenuRef = useRef<HTMLDivElement>(null);
    const {
      authUser,
      isAdmin,
      isRegisteredUser,
      isCheckingAuth,
      checkAuth
    } = useAuthStore();
  
    useEffect(() => {
      // Only check auth if we haven't checked yet
      if (isCheckingAuth === true) {
        checkAuth();
      }
    }, [checkAuth, isCheckingAuth]);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const navLinks = [
    ...(!isAdmin ? [   { name: 'Home', href: '/' },] : []),

    
    // ...(isRegisteredUser ? [{ name: 'Complaint', href: '/complaint' }] : []),
    ...(isAdmin ? [
      { name: 'Dashboard', href: '/admin/home' },
      // { name: 'Admin Complaints', href: '/admin/complaints' }
    ] : []),
      { name: 'Contacts', href: '/contacts' },
     ...(true ? [{ name: 'Profiles', href: '/profiles' }] : []),
    ...(isRegisteredUser||isAdmin ? [{ name: 'Logout', href: '/logout' }] : [{ name: 'Sign In', href: '/auth' }]),
 
    // { name: 'Profiles', href: '/profiles' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left Side */}
          <div className="flex-shrink-0">

            <Link to={isAdmin ? "/admin/home" : "/"} className="flex items-center space-x-2 group">
              <div className="relative">
                <img 
                  src={heartPulseLogo} 
                  alt="Crime Pulse" 
                  className="h-10 w-10 transition-transform group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-glow-gradient opacity-0 group-hover:opacity-100 transition-opacity rounded-full"></div>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Crime Pulse
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Right Side */}
          <div className="hidden lg:block">
            <div className="flex items-baseline space-x-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-foreground hover:bg-secondary hover:text-secondary-foreground'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile menu button - Right Side */}
          <div className="lg:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground hover:bg-secondary"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isOpen && (
          <div className="lg:hidden" ref={mobileMenuRef}>
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-card border border-border rounded-lg mt-2 mb-4">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  to={link.href}
                  className={`block px-3 py-2 rounded-md text-base font-medium transition-all duration-200 ${
                    isActive(link.href)
                      ? 'bg-primary text-primary-foreground shadow-glow'
                      : 'text-foreground hover:bg-secondary hover:text-secondary-foreground'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;