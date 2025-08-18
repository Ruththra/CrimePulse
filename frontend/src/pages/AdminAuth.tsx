import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Label } from '../components/ui/label';
import { Shield } from 'lucide-react';
import { useToast } from '../hooks/use-toast';
// Removed: import ReCAPTCHA from 'react-google-recaptcha';

// Removed: const RECAPTCHA_SITE_KEY = 'YOUR_RECAPTCHA_SITE_KEY'; // Replace with your site key

const AdminAuth = () => {
  const { toast } = useToast();
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  // Removed: const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [show2FA, setShow2FA] = useState(false);
  const [twoFACode, setTwoFACode] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Prepare data for backend using FormData
      const formData = new FormData();
      formData.append('username', credentials.username);
      formData.append('password', credentials.password);
      
      const response = await fetch('http://localhost:8082/auth/loginAdmin', {
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
          description: result.message || 'Welcome to Crime Pulse Admin Panel!',
        });
        setShow2FA(true);
      }
    } catch (err: any) {
      toast({
        variant: "destructive",
        title: "Sign In Error",
        description: err.message || 'An error occurred during signin.',
      });
    }
  };

  const handle2FASubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock 2FA code check
    if (twoFACode === '123456') {
      localStorage.setItem('adminAuth', 'true');
      navigate('/admin/home');
    } else {
      alert('Invalid 2FA code');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 bg-crime-tape opacity-5"></div>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-destructive via-yellow-500 to-destructive"></div>
      
      <div className="flex items-center justify-center min-h-screen p-4">
        <Card className="w-full max-w-md bg-card/95 backdrop-blur-sm border-destructive/20">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="p-3 rounded-full bg-destructive/10 border border-destructive/20">
                <Shield className="h-8 w-8 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">Admin Access</CardTitle>
            <CardDescription className="text-muted-foreground">
              Enter your admin credentials to access the complaint management system
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!show2FA ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
                    placeholder="Enter admin username"
                    className="bg-background/50 border-border"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                    placeholder="Enter admin password"
                    className="bg-background/50 border-border"
                    required
                  />
                </div>
                {/* Removed reCAPTCHA */}
                <Button 
                  type="submit" 
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Login to Admin Panel
                </Button>
              </form>
            ) : (
              <form onSubmit={handle2FASubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="2fa">Enter 2FA Code</Label>
                  <Input
                    id="2fa"
                    type="text"
                    value={twoFACode}
                    onChange={(e) => setTwoFACode(e.target.value)}
                    placeholder="Enter 2FA code"
                    className="bg-background/50 border-border"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                >
                  Verify 2FA
                </Button>
              </form>
            )}
            <div className="mt-4 text-center">
                            <Button 
                              variant="ghost" 
                onClick={() => navigate('/auth')}
                className="text-muted-foreground hover:text-foreground"
              >
                              Back to User Login
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                );
              };
              
              export default AdminAuth;
              