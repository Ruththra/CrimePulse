import { useState } from 'react';
import { Upload, Calendar, MapPin, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import crimeBackground from '../assets/crime-background.jpg';

const Complaint = () => {
  const [complaintData, setComplaintData] = useState({
    category: '',
    description: '',
    date: '',
    time: '',
    location: '',
    media: null as File | null
  });
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'theft', label: 'Theft' },
    { value: 'assault', label: 'Assault' },
    { value: 'cybercrime', label: 'Cybercrime' },
    { value: 'missing', label: 'Missing Person' },
    { value: 'other', label: 'Other' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        setErrors({...errors, media: 'File size must be less than 10MB'});
        return;
      }
      
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/quicktime'];
      if (!allowedTypes.includes(file.type)) {
        setErrors({...errors, media: 'Only JPG, PNG, MP4, and MOV files are allowed'});
        return;
      }

      setComplaintData({...complaintData, media: file});
      setErrors({...errors, media: ''});
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};

    if (!complaintData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!complaintData.description.trim()) {
      newErrors.description = 'Description is required';
    } else if (complaintData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters';
    }

    if (!complaintData.date) {
      newErrors.date = 'Date is required';
    }

    if (!complaintData.time) {
      newErrors.time = 'Time is required';
    }

    if (!complaintData.location.trim()) {
      newErrors.location = 'Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    // Prepare data for backend
    try {
      const formData = new FormData();
      formData.append('category', complaintData.category);
      formData.append('description', complaintData.description);
      formData.append('date', complaintData.date);
      formData.append('time', complaintData.time);
      formData.append('location', complaintData.location);
      if (complaintData.media) {
        formData.append('media', complaintData.media);
      }

      const response = await fetch("http://localhost:8081/complaints/submit", {
        method: 'POST',
        body: formData,
        mode: 'cors',
      });
      if (!response.ok) {
        throw new Error('Failed to submit complaint. Please try again.');
      }

      setShowSuccess(true);
      // Reset form
      setComplaintData({
        category: '',
        description: '',
        date: '',
        time: '',
        location: '',
        media: null
      });
    } catch (error:any) {
      toast({
        title: 'Submission Error',
        description: error.message || 'An error occurred submitting your complaint.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div 
      className="min-h-screen py-20"
      style={{
        backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.8)), url(${crimeBackground})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="max-w-2xl mx-auto px-4">
        <div className="card-crime p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-2">File a Complaint</h1>
            <p className="text-muted-foreground">
              Your report helps keep our community safe. All information is confidential.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category */}
            <div className="space-y-2">
              <Label htmlFor="category">Crime Category *</Label>
              <Select value={complaintData.category} onValueChange={(value) => 
                setComplaintData({...complaintData, category: value})
              }>
                <SelectTrigger className="input-crime">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.value} value={category.value}>
                      {category.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-destructive">{errors.category}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                placeholder="Provide detailed information about the incident..."
                className="input-crime min-h-[120px] resize-none"
                value={complaintData.description}
                onChange={(e) => setComplaintData({...complaintData, description: e.target.value})}
              />
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{complaintData.description.length} characters</span>
                <span>Minimum 20 characters required</span>
              </div>
              {errors.description && <p className="text-sm text-destructive">{errors.description}</p>}
            </div>

            {/* Date and Time */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date of Incident *</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <Input
                    id="date"
                    type="date"
                    className="pl-10 input-crime"
                    value={complaintData.date}
                    onChange={(e) => setComplaintData({...complaintData, date: e.target.value})}
                    max={new Date().toISOString().split('T')[0]}
                  />
                </div>
                {errors.date && <p className="text-sm text-destructive">{errors.date}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time of Incident *</Label>
                <Input
                  id="time"
                  type="time"
                  className="input-crime"
                  value={complaintData.time}
                  onChange={(e) => setComplaintData({...complaintData, time: e.target.value})}
                />
                {errors.time && <p className="text-sm text-destructive">{errors.time}</p>}
              </div>
            </div>

            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location *</Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="location"
                  type="text"
                  placeholder="Enter the location where the incident occurred"
                  className="pl-10 input-crime"
                  value={complaintData.location}
                  onChange={(e) => setComplaintData({...complaintData, location: e.target.value})}
                />
              </div>
              {errors.location && <p className="text-sm text-destructive">{errors.location}</p>}
            </div>

            {/* Media Upload */}
            <div className="space-y-2">
              <Label htmlFor="media">Upload Evidence (Optional)</Label>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
                <input
                  id="media"
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
                <label htmlFor="media" className="cursor-pointer">
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Click to upload images or videos
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supported: JPG, PNG, MP4, MOV (Max 10MB)
                  </p>
                </label>
              </div>
              {complaintData.media && (
                <div className="text-sm text-green-600 flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  File uploaded: {complaintData.media.name}
                </div>
              )}
              {errors.media && <p className="text-sm text-destructive">{errors.media}</p>}
            </div>

            {/* reCAPTCHA Placeholder */}
            <div className="border border-border rounded-lg p-4 bg-secondary/20">
              <div className="flex items-center space-x-3">
                <input type="checkbox" id="recaptcha" className="w-5 h-5" />
                <label htmlFor="recaptcha" className="text-sm">
                  I'm not a robot
                </label>
                <div className="ml-auto text-xs text-muted-foreground">reCAPTCHA</div>
              </div>
            </div>

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="btn-crime w-full text-lg py-6"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <FileText className="h-5 w-5 mr-3" />
                  Submit Complaint
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-yellow-500 mt-0.5" />
              <div className="text-sm">
                <p className="font-semibold text-yellow-600">Important Notice</p>
                <p className="text-muted-foreground mt-1">
                  For emergencies requiring immediate attention, please call 119 (Police Emergency) 
                  or visit your nearest police station.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="card-crime border-green-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              Complaint Submitted Successfully
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Your complaint has been received and assigned reference number:
            </p>
            <div className="bg-secondary/50 p-4 rounded-lg text-center">
              <span className="text-xl font-bold text-primary">CP-{Date.now().toString().slice(-6)}</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You will receive updates via SMS and email. Keep this reference number for future inquiries.
            </p>
            <Button 
              onClick={() => setShowSuccess(false)} 
              className="btn-crime w-full"
            >
              Continue
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Complaint;