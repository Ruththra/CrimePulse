import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, User, Phone, CreditCard, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { useToast } from '../hooks/use-toast';
import crimeBackground from '../assets/crime-background.jpg';

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();

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
    .catch(async (err) => {
      console.log('❌ Error ensuring unreg_user_id cookie:', (err as Error).message);
      try {
        const retryRes = await fetch('http://localhost:8082/auth/identify', {
          method: 'GET',
          credentials: 'include'
        });
        if (!retryRes.ok) {
          console.log('⚠️ Retry failed to ensure unreg_user_id cookie');
        }
      } catch (retryErr) {
        console.log('❌ Retry error ensuring unreg_user_id cookie:', (retryErr as Error).message);
      }
    });
  }, []);

  // Redirect to home if landed on Auth after logout
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const fromLogout = params.get('fromLogout') || params.get('logout');
    if (fromLogout && (fromLogout === 'true' || fromLogout === '1')) {
      navigate('/', { replace: true });
    }
  }, [location.search, navigate]);
  const [showPassword, setShowPassword] = useState(false);
  const [signInData, setSignInData] = useState({ email: '', password: '' });
  const [registerData, setRegisterData] = useState({
    fullName: '', telephone: '', nic: '', password: '', confirmPassword: ''
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
        // Prepare data for backend using FormData
        const formData = new FormData();
        formData.append('email', signInData.email);
        formData.append('password', signInData.password);
        
        const response = await fetch('http://localhost:8082/auth/loginRegisteredUser', {
          method: 'POST',
          body: formData,
          credentials: 'include'
        });
        const result = await response.json();

        if (!response.ok) {
          toast({
            variant: "destructive",
            title: "Sign In Failed",
            description: result.message || 'Invalid credentials or server error.',
          });
        } else {
          toast({
            title: "Sign In Successful",
            description: result.message || 'Welcome back to Crime Pulse!',
          });
          // Redirect logic here if needed
        }
      } catch (err: unknown) {
        const error = err as Error;
        toast({
          variant: "destructive",
          title: "Sign In Error",
          description: error.message || 'An error occurred during signin.',
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

    if (!registerData.password) {
      newErrors.password = 'Password is required';
    } else if (registerData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (registerData.password !== registerData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Prepare data for backend using FormData
        const formData = new FormData();
        formData.append('username', registerData.fullName);
        formData.append('email', ''); // Email field required by backend but not in form
        formData.append('phone', registerData.telephone);
        formData.append('icNumber', registerData.nic);
        formData.append('password', registerData.password);
        
        const response = await fetch('http://localhost:8082/auth/createRegisteredUser', {
          method: 'POST',
          body: formData,
          mode: 'cors',
          credentials: 'include'
        });
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.message || 'Failed to register user');
        }

        toast({
          title: "Registration Successful",
          description: result.message || 'Welcome to Crime Pulse! You can now report crimes.',
        });
        // Redirect logic here if needed
      } catch (err: unknown) {
        const error = err as Error;
        toast({
          variant: "destructive",
          title: "Registration Error",
          description: error.message || 'An error occurred during registration.',
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

                <Button type="submit" className="btn-crime w-full">
                  Sign In
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

                <Button type="submit" className="btn-crime w-full">
                  Create Account
                </Button>
              </form>
            </TabsContent>
          </Tabs>

        </div>
      </div>
    </div>
  );
};

export default Auth;