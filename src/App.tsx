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
  Container,
  Section,
} from './components/ui';

function App() {
  const selectOptions = [
    { value: 'residential', label: 'Residential Roofing' },
    { value: 'commercial', label: 'Commercial Roofing' },
    { value: 'repair', label: 'Roof Repair' },
    { value: 'inspection', label: 'Roof Inspection' },
  ];

  return (
    <div className="min-h-screen bg-[var(--color-background)]">
      <header className="border-b border-[var(--color-surface)]">
        <Container>
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-[var(--color-primary)]">Apex Roofing</h1>
            </div>
            <nav className="flex items-center space-x-4">
              <a href="#services" className="text-gray-600 hover:text-[var(--color-primary)]">
                Services
              </a>
              <a href="#about" className="text-gray-600 hover:text-[var(--color-primary)]">
                About
              </a>
              <a href="#contact" className="text-gray-600 hover:text-[var(--color-primary)]">
                Contact
              </a>
            </nav>
          </div>
        </Container>
      </header>
      <main>
        <Section variant="default" size="xl">
          <h2 className="text-4xl sm:text-5xl font-bold tracking-tight text-[var(--color-primary)] mb-8">
            UI Component Library Showcase
          </h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            This page demonstrates all reusable UI components built for the roofing company website
            template.
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
                <Input label="Full Name" placeholder="John Doe" helperText="Enter your full name" />
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
                  <p className="text-gray-600">This card uses the primary color for its border.</p>
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
      </main>
      <footer className="bg-[var(--color-surface)] border-t border-[var(--color-surface)] py-12">
        <Container>
          <p className="text-center text-gray-500">
            &copy; 2024 Apex Roofing. All rights reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
}

export default App;
