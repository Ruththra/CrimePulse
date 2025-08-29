import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Calendar, MapPin, FileText, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { useToast } from '../hooks/use-toast';
import LocationPicker from '../components/LocationPicker';
import SimpleLocationPicker from '../components/SimpleLocationPicker';
import crimeBackground from '../assets/crime-background.jpg';
import { useAuthStore } from '@/store/useAuthStore';


  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const defaultDate = now.toISOString().split('T')[0];
  const defaultTime = `${pad(now.getHours())}:${pad(now.getMinutes())}`;

const Complaint = () => {
  const navigate = useNavigate();
  const [complaintData, setComplaintData] = useState({
    category: '',
    description: '',
    date: defaultDate,
    time: defaultTime,
    location: '',
    latitude: null as number | null,
    longitude: null as number | null,
    media: [] as File[]
  });
  
  const { authUser } = useAuthStore();
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [showSuccess, setShowSuccess] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSimpleLocation, setUseSimpleLocation] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
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

  const categories = [
    { value: 'Theft', label: 'Theft' },
    { value: 'Assault', label: 'Assault' },
    { value: 'CyberCrime', label: 'Cybercrime' },
    { value: 'MissingPerson', label: 'Missing Person' },
    { value: 'Other', label: 'Other' }
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const allowedTypes = ['image/jpeg', 'image/png','image/heic', 'video/mp4', 'video/quicktime','video/x-m4v' ];
    for (let file of files){
      if (file) {
        // Check each file size (max 50MB)
        if (file.size > 50 * 1024 * 1024) {
          setErrors({...errors, media: 'File size must be less than 50MB'});
          return;
        }
        
        // Check each file type
        if (!allowedTypes.includes(file.type)) {
          setErrors({...errors, media: 'Only JPG, PNG,HEIC, MP4,M4V and MOV files are allowed'});
          return;
        }
      }


      setComplaintData({    ...complaintData, media: [...complaintData.media, ...files] 
      });
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
    } else if (!useSimpleLocation && (complaintData.latitude === null || complaintData.longitude === null)) {
      newErrors.location = 'Please select a valid location on the map';
    }
    console.log('Location validation:', {
      location: complaintData.location,
      latitude: complaintData.latitude,
      longitude: complaintData.longitude,
      useSimpleLocation,
      hasError: !complaintData.location.trim() || (!useSimpleLocation && (complaintData.latitude === null || complaintData.longitude === null))
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleConfirmSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix the errors before submitting",
        variant: "destructive"
      });
      return;
    }

    setShowConfirmation(true);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmation(false);

    // Prepare data for backend
    try {
      console.log('Submitting complaint data:', complaintData);
      const formData = new FormData();
      formData.append('category', complaintData.category);
      formData.append('description', complaintData.description);
      formData.append('date', complaintData.date);
      formData.append('time', complaintData.time);
      formData.append('location', complaintData.location);
      if (complaintData.latitude !== null) {
        formData.append('latitude', complaintData.latitude.toString());
      }
      if (complaintData.longitude !== null) {
        formData.append('longitude', complaintData.longitude.toString());
      }
      if (complaintData.media.length > 0) {
        complaintData.media.forEach((file, index) => {
          formData.append('media', file);
        });
      }
      console.log('FormData entries:');
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }

      const response = await fetch(`http://localhost:8081/complaints/submit?creator=${authUser?.id}`, {
        method: 'POST',
        body: formData,
        mode: 'cors',
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to submit complaint. Please try again.');
      }
      // Handle success response
      toast({
        title: 'Complaint Submitted',
        description: 'Your complaint has been successfully submitted.',
        variant: 'success'
      })

      setShowSuccess(true);
      // Reset form
      setComplaintData({
        category: '',
        description: '',
        date: defaultDate,
        time: defaultTime,
        location: '',
        latitude: null,
        longitude: null,
        media: []
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

          <form onSubmit={handleConfirmSubmit} className="space-y-6">
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
              <div className="flex justify-between items-center">
                <Label htmlFor="location">Location *</Label>
                {/* <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setUseSimpleLocation(!useSimpleLocation)}
                  className="text-xs"
                >
                  {useSimpleLocation ? "Use Advanced Map" : "Use Simple Location"}
                </Button> */}
              </div>
              
              {useSimpleLocation ? (
                <SimpleLocationPicker
                  onLocationSelect={(location) => {
                    console.log('Simple location selected:', location);
                    setComplaintData({
                      ...complaintData,
                      location: location.address,
                      latitude: location.lat,
                      longitude: location.lng
                    });
                    // Clear any existing location errors
                    if (errors.location) {
                      setErrors(prev => {
                        const newErrors = {...prev};
                        delete newErrors.location;
                        return newErrors;
                      });
                    }
                    // Also update validation to ensure form can be submitted
                    setErrors(prev => {
                      const newErrors = {...prev};
                      delete newErrors.location;
                      return newErrors;
                    });
                  }}
                  initialLocation={
                    complaintData.location ?
                    {
                      lat: complaintData.latitude,
                      lng: complaintData.longitude,
                      address: complaintData.location
                    } :
                    undefined
                  }
                />
              ) : (
                <LocationPicker
                  onLocationSelect={(location) => {
                    console.log('Location selected in Complaint form:', location);
                    setComplaintData({
                      ...complaintData,
                      location: location.address,
                      latitude: location.lat,
                      longitude: location.lng
                    });
                    // Clear any existing location errors
                    if (errors.location) {
                      setErrors(prev => {
                        const newErrors = {...prev};
                        delete newErrors.location;
                        return newErrors;
                      });
                    }
                    // Also update validation to ensure form can be submitted
                    setErrors(prev => {
                      const newErrors = {...prev};
                      delete newErrors.location;
                      return newErrors;
                    });
                  }}
                  initialLocation={
                    complaintData.location && complaintData.latitude !== null && complaintData.longitude !== null ?
                    {
                      lat: complaintData.latitude,
                      lng: complaintData.longitude,
                      address: complaintData.location
                    } :
                    undefined
                  }
                />
              )}
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
                
                {!complaintData.media.length ? (
                  <label htmlFor="media" className="cursor-pointer">
                    <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground mb-2">
                      Click to upload images or videos
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Supported: JPG, PNG, HEIC, M4V, MP4, MOV (Max 50MB)
                    </p>
                    </label>
                  
                ) : (
                  <label htmlFor="media" className="cursor-pointer">
                  <div className="flex flex-col items-center space-y-2">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                    <ul className="text-sm font-medium space-y-1">
                      {complaintData.media.map((file: File, idx: number) => (
                        <li key={idx}>{file.name}</li>
                      ))}
                    </ul>
                    <button
                      type="button"
                      onClick={() => setComplaintData({ ...complaintData, media: [] })}
                      className="text-xs text-destructive hover:underline"
                    >
                      Remove all files
                    </button>
                  </div>
                  </label>
                )}
              </div>

              {errors.media && (
                <p className="text-sm text-destructive">{errors.media}</p>
              )}
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

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="card-crime border-blue-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertTriangle className="h-6 w-6 mr-2" />
              Confirm Complaint Submission
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to submit this complaint? Please verify all information is correct.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              Once submitted, your complaint will be reviewed by authorities.
            </p>
            <div className="flex space-x-4">
              <Button
                onClick={() => setShowConfirmation(false)}
                variant="outline"
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                className="btn-crime flex-1"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Confirm'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={showSuccess} onOpenChange={setShowSuccess}>
        <DialogContent className="card-crime border-green-500/20">
          <DialogHeader>
            <DialogTitle className="flex items-center text-green-600">
              <CheckCircle className="h-6 w-6 mr-2" />
              Complaint Submitted Successfully
            </DialogTitle>
            <DialogDescription>
              Your complaint has been successfully submitted to the authorities.
            </DialogDescription>
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
              onClick={() => {
                setShowSuccess(false);
                navigate('/');
              }}
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