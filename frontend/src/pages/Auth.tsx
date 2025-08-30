import { useState, useEffect } from 'react';
import { useNavigate ,Link} from 'react-router-dom';
import { Eye, EyeOff, User, Phone, CreditCard, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuthStore } from '@/store/useAuthStore';
import crimeBackground from '@/assets/crime-background.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const { login, isLoggingIn } = useAuthStore();

  useEffect(() => {
    // Check backend connectivity
    fetch('http://localhost:8082/auth', { method: 'OPTIONS' })
      .then(res => {
        if (res.ok) {
          console.log('✅ Backend connected');
        } else {
          console.log('❌ Backend not connected (response not ok)');
        }
      })
      .catch(err => {
        console.log('❌ Backend not connected:', err.message);
      });
    
    // Ensure unreg_user_id cookie is present
    fetch('http://localhost:8082/auth/identify', {
      method: 'GET',
      credentials: 'include'
    })
    .then(res => res.json())
    .then(data => {
      console.log('✅ Unregistered user ID ensured:', data);
    })
    .catch(err => {
      console.log('❌ Error ensuring unreg_user_id cookie:', err.message);
          fetch('http://localhost:8082/auth/identify', {
          method: 'GET',
          credentials: 'include'
        })
    });
  }, []);
  const [showPassword, setShowPassword] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    fullName: '', telephone: '', nic: '', email: '', password: '', confirmPassword: '', agreePolicy: false
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const { toast } = useToast();

  const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const validateNIC = (nic: string) => {
    // Sri Lankan NIC validation (old format: 9 digits + V, new format: 12 digits)
    return /^([0-9]{9}[vVxX]|[0-9]{12})$/.test(nic);
  };

  const validatePhone = (phone: string) => {
    // Sri Lankan phone number validation
    return /^(?:\+94|0)?[1-9][0-9]{8}$/.test(phone);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};

    if (!signInData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(signInData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!signInData.password) {
      newErrors.password = 'Password is required';
    } else if (signInData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        await login({ email: signInData.email, password: signInData.password }, 'registered');
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: err.message || 'An error occurred during signin.',
        });
      }
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: {[key: string]: string} = {};
    
    if (!registerData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!registerData.telephone) {
      newErrors.telephone = 'Telephone number is required';
    } else if (!validatePhone(registerData.telephone)) {
      newErrors.telephone = 'Please enter a valid Sri Lankan phone number';
    }

    if (!registerData.nic) {
      newErrors.nic = 'NIC number is required';
    } else if (!validateNIC(registerData.nic)) {
      newErrors.nic = 'Please enter a valid Sri Lankan NIC number';
    }

    if (!registerData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(registerData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    if (!registerData.agreePolicy) {
      newErrors.agreePolicy = 'You must agree to the Privacy Policy and Terms and Conditions';
    }
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Prepare data for backend using FormData
        const formData = new FormData();
        formData.append('username', registerData.fullName);
        formData.append('email', registerData.email);
        formData.append('phone', registerData.telephone);
        formData.append('icNumber', registerData.nic);
        formData.append('password', registerData.password);
        
        const response = await fetch('http://localhost:8082/auth/createRegisteredUser', {
          method: 'POST',
          body: formData,
          mode: 'cors',
          credentials: 'include'
        });
        
        if (!response.ok) {
          const errorResult = await response.json();
          throw new Error(errorResult.message || 'Failed to register user');
        }
        
        const result = await response.json();

        toast({
          title: "Registration Successful",
          description: result.message || 'Welcome to Crime Pulse! You can now report crimes.',
        });
        
        // Redirect to home page after successful registration
        window.location.reload();
      } catch (err: any) {
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: err.message || 'An error occurred during registration.',
        });
      }
    }
  };


  return (
    <div 
      className="min-h-screen flex items-center justify-center py-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8)), url(${crimeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-md w-full mx-4">
        <div className="card-crime p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Crime Pulse
            </h1>
            <p className="text-muted-foreground mt-2">Secure Crime Reporting Platform</p>
          </div>

          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-8">
              <TabsTrigger value="signin" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Sign In
              </TabsTrigger>
              <TabsTrigger value="register" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Register
              </TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 input-crime"
                      value={signInData.email}
                      onChange={(e) => setSignInData({...signInData, email: e.target.value})}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="signin-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      className="pl-10 pr-10 input-crime"
                      value={signInData.password}
                      onChange={(e) => setSignInData({...signInData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>


                <Button type="submit" className="btn-crime w-full" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <svg className="mr-2 h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Signing In...
                    </>
                  ) : (
                    'Sign In'
                  )}
              </Button>
              <div className="mt-4 text-center">
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/admin/auth')}
                  className="text-muted-foreground hover:text-foreground text-sm"
                >
                  Admin Login
                </Button>
              </div>
              </form>
            </TabsContent>

            <TabsContent value="register">
              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      className="pl-10 input-crime"
                      value={registerData.fullName}
                      onChange={(e) => setRegisterData({...registerData, fullName: e.target.value})}
                    />
                  </div>
                  {errors.fullName && <p className="text-sm text-destructive">{errors.fullName}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telephone">Telephone Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="telephone"
                      type="tel"
                      placeholder="07xxxxxxxx"
                      className="pl-10 input-crime"
                      value={registerData.telephone}
                      onChange={(e) => setRegisterData({...registerData, telephone: e.target.value})}
                    />
                  </div>
                  {errors.telephone && <p className="text-sm text-destructive">{errors.telephone}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="nic">NIC Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="nic"
                      type="text"
                      placeholder="123456789V or 123456789012"
                      className="pl-10 input-crime"
                      value={registerData.nic}
                      onChange={(e) => setRegisterData({...registerData, nic: e.target.value})}
                    />
                  </div>
                  {errors.nic && <p className="text-sm text-destructive">{errors.nic}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10 input-crime"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({...registerData, email: e.target.value})}
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="register-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Create a strong password"
                      className="pl-10 pr-10 input-crime"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({...registerData, password: e.target.value})}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Confirm your password"
                      className="pl-10 input-crime"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({...registerData, confirmPassword: e.target.value})}
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>

                <div className="flex items-start gap-2">
                  <input
                    id="agreePolicy"
                    type="checkbox"
                    className="mt-1 h-4 w-4"
                    checked={registerData.agreePolicy}
                    onChange={(e) => setRegisterData({ ...registerData, agreePolicy: e.target.checked })}
                  />
                  <Label htmlFor="agreePolicy" className="text-sm text-muted-foreground">
                    I agree to the{' '}
                    <a
                      href="/privacy-policy"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Privacy Policy
                    </a>{' '}and{' '}
                    <a
                      href="/terms-and-conditions"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary underline"
                    >
                      Terms and Conditions
                    </a>
                    .
                  </Label>
                </div>
                {errors.agreePolicy && <p className="text-sm text-destructive">{errors.agreePolicy}</p>}


                <Button type="submit" className="btn-crime w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="mt-6 text-center text-sm text-muted-foreground">
            {/* <p>Protected by advanced encryption</p> */}
            <p className="text-xs mt-1">Your privacy and security are our priority</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
