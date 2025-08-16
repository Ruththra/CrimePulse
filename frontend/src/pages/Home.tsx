import { Link } from 'react-router-dom';
import { FileText, Shield, Users, AlertTriangle } from 'lucide-react';
import { Button } from '../components/ui/button';
import NewsTicker from '../components/NewsTicker';
import HeatMap from '../components/HeatMap';
import crimeBackground from '../assets/crime-background.jpg';

const Home = () => {
  return (
    <div className="min-h-screen">
      {/* News Ticker */}
      <NewsTicker />
      
      {/* Hero Section */}
      <div 
        className="relative min-h-screen flex items-center justify-center"
        style={{
          backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.8), rgba(0, 0, 0, 0.6)), url(${crimeBackground})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundAttachment: 'fixed'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-transparent to-background/40"></div>
        
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            
            {/* Left Side - Heat Map */}
            <div className="order-2 lg:order-1">
              <HeatMap />
            </div>

            {/* Right Side - Main Content */}
            <div className="order-1 lg:order-2 text-center lg:text-left">
              <h1 className="text-5xl lg:text-7xl font-bold mb-6">
                <span className="block text-foreground">Crime</span>
                <span 
                  className="block bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent glitch" 
                  data-text="PULSE"
                >
                  PULSE
                </span>
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 max-w-lg">
                Your voice matters. Report crimes, stay informed, and help build a safer Sri Lanka. 
                Together we can make a difference.
              </p>

              {/* Main CTA Button */}
              <div className="mb-8">
                <Link to="/complaint">
                  <Button className="btn-crime text-lg px-12 py-6 h-auto">
                    <FileText className="h-6 w-6 mr-3" />
                    Make Your Complaint
                  </Button>
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 max-w-md mx-auto lg:mx-0">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">1,247</div>
                  <div className="text-sm text-muted-foreground">Cases Resolved</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">24/7</div>
                  <div className="text-sm text-muted-foreground">Support</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">98%</div>
                  <div className="text-sm text-muted-foreground">Success Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Elements */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <div className="flex space-x-4">
            <Link to="/auth">
              <Button variant="outline" className="btn-outline-crime">
                <Users className="h-5 w-5 mr-2" />
                Join Community
              </Button>
            </Link>
            <Link to="/emergency">
              <Button className="btn-danger">
                <AlertTriangle className="h-5 w-5 mr-2" />
                Emergency Report
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section className="py-20 bg-gradient-to-b from-background to-secondary">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose Crime Pulse?</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Our platform provides secure, efficient, and transparent crime reporting for all citizens of Sri Lanka.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-crime p-8 text-center group hover:shadow-glow transition-all duration-300">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Secure & Anonymous</h3>
              <p className="text-muted-foreground">
                Your identity is protected. Report crimes safely with our encrypted platform.
              </p>
            </div>

            <div className="card-crime p-8 text-center group hover:shadow-glow transition-all duration-300">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Easy Reporting</h3>
              <p className="text-muted-foreground">
                Simple forms, media uploads, and step-by-step guidance for all crime types.
              </p>
            </div>

            <div className="card-crime p-8 text-center group hover:shadow-glow transition-all duration-300">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-primary/30 transition-colors">
                <AlertTriangle className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">Real-time Updates</h3>
              <p className="text-muted-foreground">
                Get live updates on your case status and community crime alerts.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;