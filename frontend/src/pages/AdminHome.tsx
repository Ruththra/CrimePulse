import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '../components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Label } from '../components/ui/label';
import { Shield, Eye, LogOut, AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import HeatMap from '../components/HeatMap';
import ReactApexChart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import ApexChart from '../components/ui/apex-chart3d';

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
  // status: 'pending' | 'verified' | 'rejected';
  mediaPath?: string; // optional if your backend returns media URLs
}

const AdminHome = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const navigate = useNavigate();

  const itemsPerPage = 5;

  // Filter complaints based on selected filters
  const filteredComplaints = complaints.filter(complaint => {
    const categoryMatch = categoryFilter === 'all' || complaint.category === categoryFilter;
    const priorityMatch = priorityFilter === 'all' || complaint.priority === priorityFilter;
    return categoryMatch && priorityMatch;
  });

  const totalPages = Math.ceil(filteredComplaints.length / itemsPerPage);
  const paginatedComplaints = filteredComplaints.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const API_URL = 'http://localhost:8081/complaints/getAllComplaints'; // <--- Corrected backend URL

  // Fetch complaints from backend
  const fetchComplaints = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(API_URL);
      // const response = await fetch(API_URL, {
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   credentials: 'include'
      // });
      console.log('Fetching complaints from:', API_URL);

      if (!response.ok) {
        // Handle 404 "No complaints found" as empty state, not error
        if (response.status === 404) {
          try {
            const errorText = await response.text();
            if (errorText.startsWith('{') || errorText.startsWith('[')) {
              const errorData = JSON.parse(errorText);
              if (errorData.message === "No complaints found") {
                // Return empty array for "no complaints found" case
                setComplaints([]);
                setLoading(false);
                return;
              }
            }
          } catch (parseError) {
            // If parsing fails, continue with normal error handling
          }
        }

        // Try to get error message from response body for other errors
        let errorMessage = `Error fetching complaints: ${response.status} ${response.statusText}`;
        try {
          const errorText = await response.text();
          // Check if the response is JSON
          if (errorText.startsWith('{') || errorText.startsWith('[')) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.message || errorData.error || errorMessage;
          } else if (errorText.trim() !== '') {
            // If it's not JSON but has content, use it as the error message
            errorMessage = errorText;
          }
        } catch (parseError) {
          // If parsing fails, we'll use the default error message
        }
        throw new Error(errorMessage);
      }

      // Check if response is JSON before parsing
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await response.text();
        throw new Error(`Expected JSON response but got: ${responseText.substring(0, 100)}${responseText.length > 100 ? '...' : ''}`);
      }

      const data: Complaint[] = await response.json();

      // Sort complaints by priority (high -> medium -> low) and then by date
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      const sortedComplaints = data.sort((a, b) => {
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });

      setComplaints(sortedComplaints);
      setCurrentPage(1); // Reset to first page when complaints are loaded
    } catch (error) {
      console.error('Failed to fetch complaints:', error);
      setError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Check admin authentication
    const adminAuth = localStorage.getItem('adminAuth');
    if (!adminAuth) {
      navigate('/admin/auth');
      return;
    }

    fetchComplaints();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('adminAuth');
    navigate('/admin/auth');
  };

  const handleFilterChange = (type: 'category' | 'priority', value: string) => {
    if (type === 'category') {
      setCategoryFilter(value);
    } else {
      setPriorityFilter(value);
    }
    setCurrentPage(1); // Reset to first page when filter changes
  };

  const clearFilters = () => {
    setCategoryFilter('all');
    setPriorityFilter('all');
    setCurrentPage(1);
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

  const getComplaintStatus = (complaint: Complaint): string => {
    if (complaint.pending) return 'pending';
    if (complaint.resolved) return 'verified';
    if (complaint.verified) return 'verified';
    return 'rejected';
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
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {categoryFilter !== 'all' || priorityFilter !== 'all' ? 'Filtered Complaints' : 'Total Complaints'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {categoryFilter !== 'all' || priorityFilter !== 'all' ? filteredComplaints.length : complaints.length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-yellow-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Pending</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {(categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? filteredComplaints.filter(c => c.pending === true)
                  : complaints.filter(c => c.pending === true)
                ).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-green-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Verified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {(categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? filteredComplaints.filter(c => c.verified === true)
                  : complaints.filter(c => c.verified === true)
                ).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-destructive/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">High Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">
                {(categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? filteredComplaints.filter(c => c.priority === 'high')
                  : complaints.filter(c => c.priority === 'high')
                ).length || 0}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card/95 backdrop-blur-sm border-blue-500/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Registered Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">
                {(categoryFilter !== 'all' || priorityFilter !== 'all'
                  ? filteredComplaints.filter(c => c.isRegisteredUser === true)
                  : complaints.filter(c => c.isRegisteredUser === true)
                ).length || 0}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content: Heatmap left, ApexChart middle, Complaints right */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
            {/* <div className="heatmap-container"> */}
              <HeatMap />
            {/* </div> */}

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
              <div className="flex flex-col space-y-4">
                <CardTitle className="text-xl font-bold text-foreground">Complaints Overview</CardTitle>

                {/* Filter Section */}
                <div className="flex flex-wrap gap-4 items-end">
                  <div className="space-y-2">
                    <Label htmlFor="category-filter">Filter by Category</Label>
                    <Select value={categoryFilter} onValueChange={(value) => handleFilterChange('category', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Categories" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        <SelectItem value="Theft">Theft</SelectItem>
                        <SelectItem value="Assault">Assault</SelectItem>
                        <SelectItem value="CyberCrime">Cybercrime</SelectItem>
                        <SelectItem value="MissingPerson">Missing Person</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="priority-filter">Filter by Priority</Label>
                    <Select value={priorityFilter} onValueChange={(value) => handleFilterChange('priority', value)}>
                      <SelectTrigger className="w-48">
                        <SelectValue placeholder="All Priorities" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Priorities</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {(categoryFilter !== 'all' || priorityFilter !== 'all') && (
                    <Button
                      variant="outline"
                      onClick={clearFilters}
                      className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Clear Filters
                    </Button>
                  )}

                  <div className="text-sm text-muted-foreground ml-auto">
                    Showing {filteredComplaints.length} of {complaints.length} complaints
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                {loading ? (
                  <div className="flex justify-center items-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-destructive"></div>
                    <span className="ml-2">Loading complaints...</span>
                  </div>
                ) : error ? (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-md p-4 text-destructive text-center">
                    <p>Error loading complaints: {error}</p>
                    <Button
                      variant="outline"
                      onClick={() => fetchComplaints()}
                      className="mt-2 text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                    >
                      Retry
                    </Button>
                  </div>
                ) : filteredComplaints.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <Shield className="h-16 w-16 text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold text-foreground mb-2">
                      {categoryFilter !== 'all' || priorityFilter !== 'all' ? 'No Matching Complaints' : 'No Complaints Found'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      {categoryFilter !== 'all' || priorityFilter !== 'all'
                        ? 'No complaints match your current filter criteria. Try adjusting your filters or clearing them to see all complaints.'
                        : 'There are currently no complaints in the system. New complaints will appear here when submitted.'
                      }
                    </p>
                    {categoryFilter !== 'all' || priorityFilter !== 'all' ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          onClick={clearFilters}
                          className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
                          Clear Filters
                        </Button>
                        <Button
                          variant="outline"
                          onClick={() => fetchComplaints()}
                          className="text-muted-foreground border-muted-foreground hover:bg-muted-foreground hover:text-muted"
                        >
                          Refresh
                        </Button>
                      </div>
                    ) : (
                      <Button
                        variant="outline"
                        onClick={() => fetchComplaints()}
                        className="text-destructive border-destructive hover:bg-destructive hover:text-destructive-foreground"
                      >
                        Refresh
                      </Button>
                    )}
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="hidden md:table-cell">S.No</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead className="hidden md:table-cell">Description</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead className="hidden md:table-cell">Date</TableHead>
                        <TableHead className="hidden md:table-cell">Time</TableHead>
                        <TableHead className="hidden md:table-cell">Creator</TableHead>
                        <TableHead className="hidden md:table-cell">Priority</TableHead>
                        <TableHead className="hidden md:table-cell">User Type</TableHead>
                        <TableHead className="hidden md:table-cell">Status</TableHead>
                        <TableHead>Action</TableHead>
                      </TableRow>
                    </TableHeader>

                    <TableBody>
                      {paginatedComplaints.map((complaint, index) => (
                        <TableRow key={complaint.id}>
                          <TableCell className="hidden md:table-cell">{(currentPage - 1) * itemsPerPage + index + 1}</TableCell>
                          <TableCell>{complaint.category}</TableCell>
                          <TableCell className="hidden md:table-cell">{complaint.description}</TableCell>
                          <TableCell>{complaint.location}</TableCell>
                          <TableCell className="hidden md:table-cell">{complaint.date}</TableCell>
                          <TableCell className="hidden md:table-cell">{complaint.time}</TableCell>
                          <TableCell className="hidden md:table-cell">
                            <span className="text-sm text-muted-foreground">
                              {complaint.creator || 'Anonymous'}
                            </span>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge className={getPriorityColor(complaint.priority)}>
                              {complaint.priority}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={complaint.isRegisteredUser ? 'bg-blue-100 text-blue-800 border-blue-200' : 'bg-gray-100 text-gray-800 border-gray-200'}>
                              {complaint.isRegisteredUser ? 'Registered' : 'Anonymous'}
                            </Badge>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline" className={getStatusColor(getComplaintStatus(complaint))}>
                              <div className="flex items-center space-x-1">
                                {getStatusIcon(getComplaintStatus(complaint))}
                                <span>{getComplaintStatus(complaint)}</span>
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
                )}

                {/* Pagination */}
                {filteredComplaints.length > 0 && totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
                    <Pagination>
                      <PaginationContent>
                        <PaginationItem>
                          <PaginationPrevious
                            size="default"
                            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <PaginationItem key={page}>
                            <PaginationLink
                              size="default"
                              isActive={currentPage === page}
                              onClick={() => setCurrentPage(page)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                        <PaginationItem>
                          <PaginationNext
                            size="default"
                            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}

              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminHome;