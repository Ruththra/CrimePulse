import { useState, useEffect } from 'react';
import { User, Shield, FileText, Clock, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/store/useAuthStore';

// Define the report type
interface Report {
  id: string;
  category: string;
  description: string;
  date: string;
  time: string;
  location: string;
  verified: boolean;
  pending: boolean;
  resolved: boolean;
  mediaPath?: string;
}

const Profiles = () => {
  const { authUser } = useAuthStore();
  const [userStats, setUserStats] = useState({
    totalReports: 0,
    resolvedCases: 0,
    pendingCases: 0,
    memberSince: "January 2024"
  });
  const [recentReports, setRecentReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserReports = async () => {
      try {
        setLoading(true);
        // Fetch reports from backend
        const response = await fetch(`http://localhost:8081/complaints/getComplaintsOfCreator?creator=${authUser?.id}`);
        if (!response.ok) {
          console.log("I'm here",response.body)
          console.log("I'm here",response)
          if (response.statusText === "No complaints found") {
            throw new Error("No complaints found for this user.");
          }
          else{
            throw new Error('Failed to fetch reports');
          }
        }
        const data = await response.json();
        
        // For now, we'll use all reports as recent reports
        // In a real implementation, we would filter by user ID
        
        if (data.message === "No complaints found") {
          // Handle error message from backend
          const totalReports = 0;
          const resolvedCases = 0;
          const pendingCases = 0;
          setError(data.message);
          setUserStats({
            totalReports,
            resolvedCases,
            pendingCases,
            memberSince: "January 2024" // This would come from user data in a real implementation
          });
          return;
        } else{
          
          setRecentReports(data);
          // Calculate statistics based on fetched data
          const totalReports = data.length;
          const resolvedCases = data.filter(report => report.resolved).length;
          const pendingCases = data.filter(report => report.pending).length;
          setUserStats({
            totalReports,
            resolvedCases,
            pendingCases,
            memberSince: "January 2024" // This would come from user data in a real implementation
          });
        }

        
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserReports();
  }, [authUser]);

  const getStatusColor = (report: Report) => {
    if (report.resolved) return "bg-green-500";
    if (report.pending) return "bg-yellow-500";
    if (report.verified) return "bg-blue-500";
    return "bg-gray-500";
  };
  
  const getStatusText = (report: Report) => {
    if (report.resolved) return "Resolved";
    if (report.pending) return "Pending";
    if (report.verified) return "Verified";
    return "Submitted";
  };

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">User Profile</h1>
          <p className="text-xl text-muted-foreground">
            Manage your account and track your crime reports
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-1 space-y-6">
            <div className="card-crime p-6">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <User className="h-12 w-12 text-primary" />
                </div>
                <h2 className="text-xl font-bold">John Doe</h2>
                <p className="text-muted-foreground">john.doe@email.com</p>
                <Badge className="mt-2 bg-green-500/20 text-green-400 border-green-500/20">
                  Verified User
                </Badge>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Member Since</span>
                  <span className="text-sm font-medium">{userStats.memberSince}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Phone</span>
                  <span className="text-sm font-medium">+94 77 123 4567</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">NIC</span>
                  <span className="text-sm font-medium">123456789V</span>
                </div>
              </div>

              <Button className="btn-crime w-full mt-6">
                Edit Profile
              </Button>
            </div>

            {/* User Statistics */}
            <div className="card-crime p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Award className="h-5 w-5 mr-2 text-primary" />
                Statistics
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Reports</span>
                  <span className="text-lg font-bold text-primary">{userStats.totalReports}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Resolved Cases</span>
                  <span className="text-lg font-bold text-green-500">{userStats.resolvedCases}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pending Cases</span>
                  <span className="text-lg font-bold text-yellow-500">{userStats.pendingCases}</span>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="text-sm text-muted-foreground mb-2">Resolution Rate</div>
                <div className="w-full bg-secondary rounded-full h-2">
                  <div 
                    className="bg-green-500 h-2 rounded-full" 
                    style={{ width: `${(userStats.resolvedCases / userStats.totalReports) * 100}%` }}
                  ></div>
                </div>
                <div className="text-sm text-green-500 mt-1">
                  {Math.round((userStats.resolvedCases / userStats.totalReports) * 100)}% resolved
                </div>
              </div>
            </div>
          </div>

          {/* Recent Reports */}
          <div className="lg:col-span-2">
            <div className="card-crime p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold flex items-center">
                  <FileText className="h-6 w-6 mr-2 text-primary" />
                  Recent Reports
                </h3>
                <Button className="btn-outline-crime">
                  View All
                </Button>
              </div>

              {loading ? (
                <div className="text-center py-12">
                  <div className="flex justify-center mb-4">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-primary"></div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2">Loading Reports...</h3>
                  <p className="text-muted-foreground">
                    Please wait while we fetch your reports.
                  </p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-destructive mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">Error Loading Reports</h3>
                  <p className="text-muted-foreground mb-6">
                    {error}
                  </p>
                  <Button className="btn-crime" onClick={() => window.location.reload()}>
                    Try Again
                  </Button>
                </div>
              ) : recentReports.length === 0 ? (
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Reports Yet</h3>
                  <p className="text-muted-foreground mb-6">
                    You haven't submitted any crime reports yet.
                  </p>
                  <Button className="btn-crime">
                    Make Your First Report
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentReports.map((report) => (
                    <Card key={report.id} className="border-border hover:shadow-glow transition-all duration-300">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="font-semibold">{report.description}</h4>
                            <p className="text-sm text-muted-foreground">{report.category}</p>
                          </div>
                          <Badge className={`${getStatusColor(report)}/20 text-white border-0`}>
                            {getStatusText(report)}
                          </Badge>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" />
                            {report.date}
                          </div>
                          <div className="flex items-center">
                            <MapPin className="h-4 w-4 mr-1" />
                            {report.location}
                          </div>
                        </div>

                        <div className="mt-4 flex space-x-2">
                          <Button size="sm" className="btn-outline-crime">
                            View Details
                          </Button>
                          {/* {report.pending && (
                            <Button size="sm" variant="outline">
                              Track Progress
                            </Button>
                          )} */}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="mt-8 grid md:grid-cols-2 gap-4">
              <Button className="btn-crime h-16 text-lg">
                <FileText className="h-6 w-6 mr-3" />
                New Report
              </Button>
              <Button className="btn-outline-crime h-16 text-lg">
                <Shield className="h-6 w-6 mr-3" />
                Safety Tips
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profiles;