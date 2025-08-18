import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Shield, Eye, LogOut, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import HeatMap from '../components/HeatMap';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';

// If the file exists elsewhere, update the path accordingly, for example:
// import Piechart from '../components/ui/Piechart';
// Or, if the file does not exist, create it in src/components/ui/Piechart3D.tsx with a basic export like below:

// src/components/ui/Piechart3D.tsx
// import React from 'react';
// const Piechart3D = (props: any) => <div>Piechart3D Placeholder</div>;
// export default Piechart3D;

interface Complaint {
  id: string;
  category: string;
  description: string;
  location: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'verified' | 'rejected';
  reporterName: string;
}

const mockComplaints: Complaint[] = [
  {
    id: '1',
    category: 'Assault',
    description: 'Physical altercation near Central Market',
    location: 'Colombo Central Market',
    date: '2024-01-15',
    priority: 'high',
    status: 'pending',
    reporterName: 'John Doe'
  },
  {
    id: '2',
    category: 'Theft',
    description: 'Mobile phone stolen from bus',
    location: 'Kandy Road',
    date: '2024-01-14',
    priority: 'medium',
    status: 'pending',
    reporterName: 'Jane Smith'
  },
  {
    id: '3',
    category: 'Cybercrime',
    description: 'Online banking fraud attempt',
    location: 'Online',
    date: '2024-01-13',
    priority: 'high',
    status: 'verified',
    reporterName: 'Mike Johnson'
  },
  {
    id: '4',
    category: 'Missing Person',
    description: 'Elderly person missing since morning',
    location: 'Galle Face',
    date: '2024-01-12',
    priority: 'high',
    status: 'pending',
    reporterName: 'Sarah Wilson'
  }
];

const ApexChart = () => {
  const [state, setState] = useState<{
    series: number[];
    options: ApexOptions;
  }>({
    series: [14, 23, 21, 17, 15, 10, 12, 17, 21],
    options: {
      chart: {
        type: 'polarArea',
        width: '100%',
        height: 400,
      },
      stroke: {
        colors: ['#fff']
      },
      fill: {
        opacity: 0.8
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: {
              width: '100%',
              height: 300,
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 768,
          options: {
            chart: {
              width: '100%',
              height: 250,
            },
            legend: {
              position: 'bottom'
            }
          }
        },
        {
          breakpoint: 480,
          options: {
            chart: {
              width: '100%',
              height: 200,
            },
            legend: {
              position: 'bottom'
            }
          }
        }
      ]
    },
  });

  return (
    <div className="apexchart-container">
      <ReactApexChart options={state.options} series={state.series} type="polarArea" height={400} width="100%" />
    </div>
  );
};

const AdminHome = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/auth');
      return;
    }

    // Sort complaints by priority (high -> medium -> low) and then by date
    const sortedComplaints = mockComplaints.sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    setComplaints(sortedComplaints);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/auth');
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-destructive text-destructive-foreground';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'verified': return <CheckCircle className="h-4 w-4" />;
      case 'rejected': return <AlertTriangle className="h-4 w-4" />;
      default: return <Clock className="h-4 w-4" />;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/20 to-background">
      {/* Header */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-destructive/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <Shield className="h-8 w-8 text-destructive" />
              <h1 className="text-xl font-bold text-foreground">Admin Panel</h1>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{complaints.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {complaints.filter(c => c.status === 'pending').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {complaints.filter(c => c.status === 'verified').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {complaints.filter(c => c.priority === 'high').length}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Heatmap left, ApexChart middle, Complaints right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* ... Stats Cards remain unchanged ... */}
          </div>

          {/* Top Section: HeatMap left, ApexChart right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Heatmap Section */}
            {/* <Card className="bg-card/95 backdrop-blur-sm border-destructive/20 p-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Heat Map</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="heatmap-container">
                  <HeatMap />
                </div>
              </CardContent>
            </Card> */}
            <div className="heatmap-container">
              <HeatMap />
            </div>

            {/* ApexChart Section */}
            <Card className="bg-card/95 backdrop-blur-sm border-destructive/20 p-4">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-foreground">Complaints Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="apexchart-container">
                  <ApexChart />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bottom Section: Complaints Table */}
          <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-foreground">Complaints Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="hidden md:table-cell">ID</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden md:table-cell">Reporter</TableHead>
                  <TableHead className="hidden md:table-cell">Priority</TableHead>
                  <TableHead className="hidden md:table-cell">Status</TableHead>
                  <TableHead>Action</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody>
                {complaints.map((complaint) => (
                  <TableRow key={complaint.id}>
                    <TableCell className="hidden md:table-cell">{complaint.id}</TableCell>
                    <TableCell>{complaint.category}</TableCell>
                    <TableCell className="hidden md:table-cell">{complaint.description}</TableCell>
                    <TableCell>{complaint.location}</TableCell>
                    <TableCell className="hidden md:table-cell">{complaint.date}</TableCell>
                    <TableCell className="hidden md:table-cell">{complaint.reporterName}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge className={getPriorityColor(complaint.priority)}>
                        {complaint.priority}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="outline" className={getStatusColor(complaint.status)}>
                        <div className="flex items-center space-x-1">
                          {getStatusIcon(complaint.status)}
                          <span>{complaint.status}</span>
                        </div>
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => navigate(`/admin/complaint/${complaint.id}`)}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        <span className="hidden sm:inline">View</span>
                      </Button>

                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

              </div>
            </CardContent>
          </Card>
        </div>
          </div>
        </div>
  );
};

export default AdminHome;