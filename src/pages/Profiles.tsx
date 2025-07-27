import { User, Shield, FileText, Clock, Award, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const Profiles = () => {
  const userStats = {
    totalReports: 12,
    resolvedCases: 8,
    pendingCases: 4,
    memberSince: "January 2024"
  };

  const recentReports = [
    {
      id: "CP-123456",
      category: "Theft",
      status: "Resolved",
      date: "2024-01-15",
      location: "Colombo 03"
    },
    {
      id: "CP-123457",
      category: "Cybercrime",
      status: "Under Investigation",
      date: "2024-01-12",
      location: "Kandy"
    },
    {
      id: "CP-123458",
      category: "Missing Person",
      status: "Resolved",
      date: "2024-01-10",
      location: "Galle"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Resolved": return "bg-green-500";
      case "Under Investigation": return "bg-yellow-500";
      case "Pending": return "bg-red-500";
      default: return "bg-gray-500";
    }
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

              <div className="space-y-4">
                {recentReports.map((report) => (
                  <Card key={report.id} className="border-border hover:shadow-glow transition-all duration-300">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <h4 className="font-semibold">{report.id}</h4>
                          <p className="text-sm text-muted-foreground">{report.category}</p>
                        </div>
                        <Badge className={`${getStatusColor(report.status)}/20 text-white border-0`}>
                          {report.status}
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
                        {report.status === "Under Investigation" && (
                          <Button size="sm" variant="outline">
                            Track Progress
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {recentReports.length === 0 && (
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