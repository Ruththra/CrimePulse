import { Phone, Mail, MapPin, Clock, MessageCircle } from 'lucide-react';

const Contacts = () => {

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Contact Us</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get in touch with our team for support, questions, or feedback about Crime Pulse.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Contact Information */}
          <div className="space-y-8">
            <div className="card-crime p-6">
              <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Phone className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Emergency Hotline</h3>
                    <p className="text-muted-foreground">119 (Police Emergency)</p>
                    <p className="text-muted-foreground">118 (Accident Service)</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Support Hotline</h3>
                    <p className="text-muted-foreground">+94 11 234 5678</p>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Mail className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Email Support</h3>
                    <p className="text-muted-foreground">support@crimepulse.lk</p>
                    <p className="text-muted-foreground">info@crimepulse.lk</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <MapPin className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Address</h3>
                    <p className="text-muted-foreground">
                      Crime Pulse Headquarters<br />
                      123 Galle Road, Colombo 03<br />
                      Sri Lanka
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center">
                    <Clock className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Office Hours</h3>
                    <p className="text-muted-foreground">
                      Monday - Friday: 8:00 AM - 6:00 PM<br />
                      Saturday: 9:00 AM - 2:00 PM<br />
                      Sunday: Emergency only
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Emergency Notice */}
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6">
              <h3 className="font-bold text-destructive mb-2">Emergency Situations</h3>
              <p className="text-sm text-muted-foreground">
                If you're in immediate danger or witnessing a crime in progress, 
                do not use this form. Call 119 immediately or visit your nearest police station.
              </p>
            </div>
          </div>

          {/* Emergency Contacts Directory */}
          <div className="card-crime p-8">
            <h2 className="text-2xl font-bold mb-6">Emergency Contacts Directory</h2>

            <div className="space-y-8">
              <div>
                <h3 className="text-xl font-semibold mb-4">Police Stations</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Colombo Fort Police</p>
                      <p className="text-sm text-muted-foreground">+94 11 234 5671</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Kollupitiya Police</p>
                      <p className="text-sm text-muted-foreground">+94 11 234 5672</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Bambalapitiya Police</p>
                      <p className="text-sm text-muted-foreground">+94 11 234 5673</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Dehiwala Police</p>
                      <p className="text-sm text-muted-foreground">+94 11 234 5674</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Mount Lavinia Police</p>
                      <p className="text-sm text-muted-foreground">+94 11 234 5675</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Nugegoda Police</p>
                      <p className="text-sm text-muted-foreground">+94 11 234 5676</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Kotte Police</p>
                      <p className="text-sm text-muted-foreground">+94 11 234 5677</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Negombo Police</p>
                      <p className="text-sm text-muted-foreground">+94 31 234 5678</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Gampaha Police</p>
                      <p className="text-sm text-muted-foreground">+94 33 234 5679</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Kandy Police</p>
                      <p className="text-sm text-muted-foreground">+94 81 234 5680</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Galle Police</p>
                      <p className="text-sm text-muted-foreground">+94 91 234 5681</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Matara Police</p>
                      <p className="text-sm text-muted-foreground">+94 41 234 5682</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Kurunegala Police</p>
                      <p className="text-sm text-muted-foreground">+94 37 234 5683</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Anuradhapura Police</p>
                      <p className="text-sm text-muted-foreground">+94 25 234 5684</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Jaffna Police</p>
                      <p className="text-sm text-muted-foreground">+94 21 234 5685</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Batticaloa Police</p>
                      <p className="text-sm text-muted-foreground">+94 65 234 5686</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Trincomalee Police</p>
                      <p className="text-sm text-muted-foreground">+94 26 234 5687</p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-semibold mb-4">Ambulance Services</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">1990 - National Ambulance Service (Suwaseriya)</p>
                      <p className="text-sm text-muted-foreground">24/7 Emergency Response</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Colombo Ambulance</p>
                      <p className="text-sm text-muted-foreground">+94 11 255 1990</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Kandy Ambulance</p>
                      <p className="text-sm text-muted-foreground">+94 81 222 1990</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Galle Ambulance</p>
                      <p className="text-sm text-muted-foreground">+94 91 223 1990</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Jaffna Ambulance</p>
                      <p className="text-sm text-muted-foreground">+94 21 222 1990</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Matara Ambulance</p>
                      <p className="text-sm text-muted-foreground">+94 41 222 1990</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Anuradhapura Ambulance</p>
                      <p className="text-sm text-muted-foreground">+94 25 222 1990</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4 p-4 rounded-lg border bg-background/50">
                    <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                      <Phone className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">Batticaloa Ambulance</p>
                      <p className="text-sm text-muted-foreground">+94 65 222 1990</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contacts;