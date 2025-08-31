import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, User, FileText, UserCheck, Shield } from 'lucide-react';
import { useToast } from '../hooks/use-toast';

interface Complaint {
  id: string;
  category: string;
  creator: string;
  description: string;
  location: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  verified: boolean;
  pending: boolean;
  resolved: boolean;
  isRegisteredUser: boolean;
  mediaPath?: string;
}

// User profile interface for reporter information
interface UserProfile {
  userType: 'unregistered' | 'registered' | 'admin';
  username?: string;
  email?: string;
  phone?: string;
  icNumber?: string;
  memberSince: string;
  id: string;
}

const AdminComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoading, setProfileLoading] = useState(true);
  const [adminNotes, setAdminNotes] = useState('');

  // Fetch complaint by ID
  const fetchComplaint = async () => {
    try {
      setLoading(true);
      // Fetch all complaints since we don't have a single complaint endpoint
      const response = await fetch(`http://localhost:8081/complaints/getAllComplaints`);
      if (!response.ok) {
        throw new Error('Failed to fetch complaints');
      }
      const data = await response.json();

      // Find the specific complaint by ID
      const foundComplaint = data.find((c: Complaint) => c.id === id);
      if (!foundComplaint) {
        throw new Error('Complaint not found');
      }

      setComplaint(foundComplaint);
    } catch (err) {
      console.error('Error fetching complaint:', err);
      toast({
        title: "Error",
        description: "Failed to load complaint details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Fetch user profile for the complaint creator
  const fetchUserProfile = async (creatorId: string) => {
    try {
      setProfileLoading(true);
      const response = await fetch(`http://localhost:8082/auth/getUserProfile/${creatorId}`, {
        method: 'GET',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user profile');
      }

      const profileData = await response.json();
      setUserProfile(profileData);
    } catch (err) {
      console.error('Error fetching user profile:', err);
      // Set default profile if API fails
      setUserProfile({
        userType: 'unregistered',
        memberSince: 'Unknown',
        id: creatorId
      });
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/auth');
      return;
    }

    if (id) {
      fetchComplaint();
    }
  }, [id, navigate]);

  // Fetch user profile when complaint is loaded
  useEffect(() => {
    if (complaint?.creator) {
      fetchUserProfile(complaint.creator);
    }
  }, [complaint]);

  const handleVerify = () => {
    if (!complaint) return;

    setComplaint(prev => prev ? { ...prev, verified: true, pending: false } : null);
    toast({
      title: "Complaint Verified",
      description: "The complaint has been marked as verified and will be forwarded to relevant authorities.",
      variant: "default",
    });
  };

  const handleReject = () => {
    if (!complaint) return;

    setComplaint(prev => prev ? { ...prev, verified: false, pending: false } : null);
    toast({
      title: "Complaint Rejected",
      description: "The complaint has been marked as rejected.",
      variant: "destructive",
    });
  };

  const handleResolve = () => {
    if (!complaint) return;

    setComplaint(prev => prev ? { ...prev, verified: true, pending: false, resolved: true } : null);
    toast({
      title: "Complaint Resolved",
      description: "The complaint has been marked as resolved.",
      variant: "default",
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getComplaintStatus = (complaint: Complaint): string => {
    if (complaint.pending) return 'pending';
    if (complaint.resolved) return 'resolved';
    if (complaint.verified) return 'verified';
    return 'rejected';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      case 'resolved': return 'bg-blue-100 text-blue-800 border-blue-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading || !complaint) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-destructive mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Loading Complaint Details...</h3>
          <p className="text-muted-foreground">Please wait while we fetch the complaint information.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <br />
        <br   />

        <div className="flex items-center justify-between mb-8">
          <Button 
            variant="outline" 
            onClick={() => navigate('/admin/home')}
            className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="flex space-x-2">
            <Badge className={getPriorityColor(complaint.priority)}>
              {complaint.priority} Priority
            </Badge>
            <Badge variant="outline" className={getStatusColor(getComplaintStatus(complaint))}>
              {getComplaintStatus(complaint)}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Complaint Details */}
            <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <FileText className="h-5 w-5 text-destructive" />
                  <span>Complaint Details</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Category</Label>
                  <p className="text-lg font-semibold text-foreground">{complaint.category}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Description</Label>
                  <p className="text-foreground leading-relaxed">{complaint.description}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-destructive" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Location</Label>
                      <p className="text-foreground">{complaint.location}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-destructive" />
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Date & Time</Label>
                      <p className="text-foreground">{complaint.date} at {complaint.time}</p>
                    </div>
                  </div>
                </div>
                {complaint.mediaPath && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Media Evidence</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {complaint.mediaPath.split('/').pop() || 'Media file'}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Admin Notes */}
            <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
              <CardHeader>
                <CardTitle>Admin Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="admin-notes">Add your verification notes</Label>
                    <Textarea
                      id="admin-notes"
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      placeholder="Enter notes about your verification decision..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Reporter Information */}
            <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-destructive" />
                  <span>Reporter Information</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {profileLoading ? (
                  <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    <span className="ml-2 text-sm">Loading profile...</span>
                  </div>
                ) : userProfile ? (
                  <>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                      <p className="text-foreground">
                        {userProfile.userType === 'unregistered' ? 'Anonymous' :
                         userProfile.username || 'User'}
                      </p>
                    </div>
                    {userProfile.userType === 'registered' && userProfile.email && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                        <p className="text-foreground">{userProfile.email}</p>
                      </div>
                    )}
                    {userProfile.userType === 'registered' && userProfile.phone && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                        <p className="text-foreground">{userProfile.phone}</p>
                      </div>
                    )}
                    {userProfile.userType === 'registered' && userProfile.icNumber && (
                      <div>
                        <Label className="text-sm font-medium text-muted-foreground">NIC</Label>
                        <p className="text-foreground">{userProfile.icNumber}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Member Since</Label>
                      <p className="text-foreground">{userProfile.memberSince}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">User Type</Label>
                      <p className="text-foreground">{userProfile.userType}</p>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-4">
                    <User className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground text-sm">Unable to load reporter information</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
              <CardHeader>
                <CardTitle>Verification Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {getComplaintStatus(complaint) === 'pending' && (
                  <>
                    <Button
                      onClick={handleVerify}
                      className="w-full bg-green-600 hover:bg-green-700 text-white"
                    >
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify Complaint
                    </Button>
                    <Button
                      onClick={handleReject}
                      variant="destructive"
                      className="w-full"
                    >
                      <XCircle className="h-4 w-4 mr-2" />
                      Reject Complaint
                    </Button>
                    <Button
                      onClick={handleResolve}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Complaint Resolved
                    </Button>
                  </>
                )}
                {getComplaintStatus(complaint) === 'verified' && (
                  <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Complaint Verified</span>
                  </div>
                )}
                {getComplaintStatus(complaint) === 'rejected' && (
                  <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">Complaint Rejected</span>
                  </div>
                )}
                {getComplaintStatus(complaint) === 'resolved' && (
                  <div className="flex items-center justify-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-blue-800 font-medium">Complaint Resolved</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminComplaint;