import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Input,
  Textarea,
  Select,
  Badge,
  Section,
} from './components/ui';
import { Header, Footer } from './components/layout';

function App() {
  const selectOptions = [
    { value: 'residential', label: 'Residential Roofing' },
    { value: 'commercial', label: 'Commercial Roofing' },
    { value: 'repair', label: 'Roof Repair' },
    { value: 'inspection', label: 'Roof Inspection' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <Header />
      <main className="pt-16 md:pt-20">
        <section id="home" aria-labelledby="home-heading">
          <Section variant="default" size="xl">
            <h2
              id="home-heading"
              className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-primary)] mb-8"
            >
              UI Component Library Showcase
            </h2>
            <p className="text-lg text-gray-600 mb-12 max-w-2xl">
              This page demonstrates all reusable UI components built for the roofing company
              website template.
            </p>

            {/* Buttons Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Buttons</h3>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="primary" size="sm">
                  Primary Small
                </Button>
                <Button variant="primary" size="md">
                  Primary Medium
                </Button>
                <Button variant="primary" size="lg">
                  Primary Large
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="secondary" size="sm">
                  Secondary Small
                </Button>
                <Button variant="secondary" size="md">
                  Secondary Medium
                </Button>
                <Button variant="secondary" size="lg">
                  Secondary Large
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="outline" size="sm">
                  Outline Small
                </Button>
                <Button variant="outline" size="md">
                  Outline Medium
                </Button>
                <Button variant="outline" size="lg">
                  Outline Large
                </Button>
              </div>
              <div className="flex flex-wrap gap-4 mb-6">
                <Button variant="ghost" size="sm">
                  Ghost Small
                </Button>
                <Button variant="ghost" size="md">
                  Ghost Medium
                </Button>
                <Button variant="ghost" size="lg">
                  Ghost Large
                </Button>
              </div>
              <div className="flex flex-wrap gap-4">
                <Button variant="primary" loading>
                  Loading
                </Button>
                <Button variant="primary" disabled>
                  Disabled
                </Button>
              </div>
            </div>

            {/* Badges Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Badges</h3>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="default">Default</Badge>
                <Badge variant="primary">Primary</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="success">Success</Badge>
                <Badge variant="warning">Warning</Badge>
                <Badge variant="danger">Danger</Badge>
                <Badge variant="outline">Outline</Badge>
              </div>
              <div className="flex flex-wrap gap-3 mb-4">
                <Badge variant="primary" size="sm" dot>
                  Small with dot
                </Badge>
                <Badge variant="success" size="md" dot>
                  Medium with dot
                </Badge>
                <Badge variant="warning" size="lg" dot>
                  Large with dot
                </Badge>
              </div>
            </div>

            {/* Form Inputs Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Form Inputs</h3>
              <Card variant="outlined" padding="lg" className="max-w-md">
                <CardHeader>
                  <CardTitle>Contact Form Demo</CardTitle>
                  <CardDescription>
                    Example form using Input, Textarea, and Select components
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Input
                    label="Full Name"
                    placeholder="John Doe"
                    helperText="Enter your full name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    placeholder="john@example.com"
                    error="Invalid email address"
                  />
                  <Select
                    label="Service Type"
                    placeholder="Select a service"
                    options={selectOptions}
                    helperText="Choose the service you need"
                  />
                  <Textarea label="Message" placeholder="Describe your roofing needs..." rows={4} />
                </CardContent>
                <CardFooter>
                  <div className="flex gap-3 justify-end">
                    <Button variant="ghost">Cancel</Button>
                    <Button variant="primary">Submit Request</Button>
                  </div>
                </CardFooter>
              </Card>
            </div>

            {/* Cards Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Cards</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card variant="default" padding="md">
                  <CardHeader>
                    <CardTitle>Default Card</CardTitle>
                    <CardDescription>Standard card with subtle border</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      This is a default card variant with a light gray border.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" size="sm">
                      Learn More
                    </Button>
                  </CardFooter>
                </Card>
                <Card variant="outlined" padding="md">
                  <CardHeader>
                    <CardTitle>Outlined Card</CardTitle>
                    <CardDescription>Card with primary color border</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      This card uses the primary color for its border.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="primary" size="sm">
                      Get Started
                    </Button>
                  </CardFooter>
                </Card>
                <Card variant="elevated" padding="md">
                  <CardHeader>
                    <CardTitle>Elevated Card</CardTitle>
                    <CardDescription>Card with shadow, no border</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-600">
                      This card uses elevation (shadow) instead of a border.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Button variant="secondary" size="sm">
                      View Details
                    </Button>
                  </CardFooter>
                </Card>
              </div>
            </div>

            {/* Container & Section Section */}
            <div className="mb-12">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6">Container & Section</h3>
              <div className="space-y-4">
                <Section variant="alternate" size="sm" className="rounded-xl">
                  <div className="text-center py-4">
                    <Badge variant="primary" className="mb-2">
                      Section Component
                    </Badge>
                    <p className="text-gray-600">
                      Alternate variant with surface background and small padding
                    </p>
                  </div>
                </Section>
                <Section variant="dark" size="sm" className="rounded-xl">
                  <div className="text-center py-4">
                    <Badge variant="outline" className="mb-2">
                      Dark Section
                    </Badge>
                    <p className="text-gray-300">
                      Dark variant with gray-900 background and white text
                    </p>
                  </div>
                </Section>
              </div>
            </div>
          </Section>
        </section>

        <section id="services" aria-labelledby="services-heading">
          <Section variant="alternate" size="xl">
            <h2
              id="services-heading"
              className="text-3xl font-bold text-[var(--color-primary)] mb-4 text-center"
            >
              Our Services
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto">
              Explore the roofing services we offer. Click the navigation links above to scroll to
              different sections.
            </p>
          </Section>
        </section>

        <section id="about" aria-labelledby="about-heading">
          <Section variant="default" size="xl">
            <h2
              id="about-heading"
              className="text-3xl font-bold text-[var(--color-primary)] mb-4 text-center"
            >
              About Us
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto">
              Learn more about our company, team, and commitment to quality roofing solutions.
            </p>
          </Section>
        </section>

        <section id="reviews" aria-labelledby="reviews-heading">
          <Section variant="alternate" size="xl">
            <h2
              id="reviews-heading"
              className="text-3xl font-bold text-[var(--color-primary)] mb-4 text-center"
            >
              Customer Reviews
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto">
              See what our satisfied customers have to say about our work.
            </p>
          </Section>
        </section>

        <section id="contact" aria-labelledby="contact-heading">
          <Section variant="default" size="xl">
            <h2
              id="contact-heading"
              className="text-3xl font-bold text-[var(--color-primary)] mb-4 text-center"
            >
              Contact Us
            </h2>
            <p className="text-gray-600 text-center max-w-2xl mx-auto">
              Get in touch for a free estimate or to schedule a roof inspection.
            </p>
          </Section>
        </section>
      </main>
      <Footer />
    </div>
  );
}

export default App;
