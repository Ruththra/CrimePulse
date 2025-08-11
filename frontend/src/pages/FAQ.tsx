import { ChevronDown } from 'lucide-react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

const FAQ = () => {
  const faqs = [
    {
      question: "How do I report a crime?",
      answer: "You can report a crime by clicking the 'Make Your Complaint' button on our homepage. Fill out the form with detailed information about the incident, including category, description, date, time, and location. You can also upload evidence if available."
    },
    {
      question: "Is my identity protected when reporting?",
      answer: "Yes, we take your privacy seriously. Our platform uses advanced encryption to protect your data. You can choose to report anonymously, and your personal information is only shared with authorized law enforcement when necessary for investigation."
    },
    {
      question: "How long does it take to process a complaint?",
      answer: "Most complaints are reviewed within 24-48 hours. You'll receive a reference number immediately after submission and updates via SMS and email as your case progresses through the system."
    },
    {
      question: "What types of crimes can I report?",
      answer: "You can report various types of crimes including theft, assault, cybercrime, missing persons, and other criminal activities. For emergencies requiring immediate attention, please call 119 or visit your nearest police station."
    },
    {
      question: "Can I track the status of my complaint?",
      answer: "Yes, once you submit a complaint, you'll receive a unique reference number. You can use this number to track the status of your case and receive real-time updates on the investigation progress."
    },
    {
      question: "What evidence should I provide?",
      answer: "Provide as much detail as possible including photos, videos, witness information, and any relevant documents. Our system accepts JPG, PNG, MP4, and MOV files up to 10MB in size."
    },
    {
      question: "Is this service free?",
      answer: "Yes, Crime Pulse is completely free to use. Our mission is to make crime reporting accessible to all citizens of Sri Lanka and help build safer communities."
    },
    {
      question: "What if I need immediate help?",
      answer: "For emergencies requiring immediate police response, call 119 (Police Emergency) or 118 (Accident Service). Crime Pulse is designed for non-emergency reporting and case tracking."
    }
  ];

  return (
    <div className="min-h-screen py-20 bg-gradient-to-b from-background to-secondary">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Find answers to common questions about using Crime Pulse to report crimes and track cases.
          </p>
        </div>

        <div className="card-crime p-8">
          <Accordion type="single" collapsible className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-border">
                <AccordionTrigger className="text-left hover:text-primary">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Contact our support team for additional assistance.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/contacts" className="btn-crime inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold">
              Contact Support
            </a>
            <a href="tel:+94112345678" className="btn-outline-crime inline-flex items-center justify-center px-6 py-3 rounded-lg font-semibold">
              Call Hotline
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;