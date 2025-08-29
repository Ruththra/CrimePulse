import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ArrowLeft, CheckCircle, XCircle, AlertTriangle, MapPin, Calendar, User, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Complaint {
  id: string;
  category: string;
  description: string;
  location: string;
  date: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'verified' | 'rejected';
  reporterName: string;
  reporterPhone: string;
  reporterNIC: string;
  mediaFiles?: string[];
}

const mockComplaint: Complaint = {
  id: '1',
  category: 'Assault',
  description: 'There was a physical altercation near the Central Market around 3 PM. Two individuals were involved in a heated argument that escalated to physical violence. Several witnesses were present. The incident occurred near the main entrance of the market.',
  location: 'Colombo Central Market, Main Entrance',
  date: '2024-01-15',
  time: '15:00',
  priority: 'high',
  status: 'pending',
  reporterName: 'John Doe',
  reporterPhone: '+94771234567',
  reporterNIC: '123456789V',
  mediaFiles: ['incident_photo_1.jpg', 'witness_video.mp4']
};

const AdminComplaint = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/auth');
      return;
    }

    // In a real app, fetch complaint by ID
    setComplaint(mockComplaint);
  }, [id, navigate]);

  const handleVerify = () => {
    if (!complaint) return;
    
    setComplaint(prev => prev ? { ...prev, status: 'verified' } : null);
    toast({
      title: "Complaint Verified",
      description: "The complaint has been marked as verified and will be forwarded to relevant authorities.",
      variant: "default",
    });
  };

  const handleReject = () => {
    if (!complaint) return;
    
    setComplaint(prev => prev ? { ...prev, status: 'rejected' } : null);
    toast({
      title: "Complaint Rejected", 
      description: "The complaint has been marked as rejected.",
      variant: "destructive",
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'verified': return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!complaint) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
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
            <Badge variant="outline" className={getStatusColor(complaint.status)}>
              {complaint.status}
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
                {complaint.mediaFiles && complaint.mediaFiles.length > 0 && (
                  <div>
                    <Label className="text-sm font-medium text-muted-foreground">Media Evidence</Label>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {complaint.mediaFiles.map((file, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {file}
                        </Badge>
                      ))}
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
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Name</Label>
                  <p className="text-foreground">{complaint.reporterName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <p className="text-foreground">{complaint.reporterPhone}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">NIC</Label>
                  <p className="text-foreground">{complaint.reporterNIC}</p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
              <CardHeader>
                <CardTitle>Verification Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {complaint.status === 'pending' && (
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
                  </>
                )}
                {complaint.status === 'verified' && (
                  <div className="flex items-center justify-center p-4 bg-green-50 border border-green-200 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                    <span className="text-green-800 font-medium">Complaint Verified</span>
                  </div>
                )}
                {complaint.status === 'rejected' && (
                  <div className="flex items-center justify-center p-4 bg-red-50 border border-red-200 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600 mr-2" />
                    <span className="text-red-800 font-medium">Complaint Rejected</span>
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