import { motion } from "motion/react";
import { 
  Copy, 
  Check, 
  Palette, 
  Type, 
  Layout, 
  Sparkles, 
  Grid3x3,
  Sun,
  Moon,
  Search,
  Heart,
  Star,
  MapPin,
  Camera,
  Users,
  Mail,
  Download
} from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Input } from "./ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";

export function DesignSystem() {
  const [copiedValue, setCopiedValue] = useState<string | null>(null);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedValue(text);
    setTimeout(() => setCopiedValue(null), 2000);
  };

  // Color Palette Data
  const colorPalette = {
    primary: [
      { name: "Blue 50", value: "#eff6ff", variable: "--blue-50" },
      { name: "Blue 100", value: "#dbeafe", variable: "--blue-100" },
      { name: "Blue 200", value: "#bfdbfe", variable: "--blue-200" },
      { name: "Blue 300", value: "#93c5fd", variable: "--blue-300" },
      { name: "Blue 400", value: "#60a5fa", variable: "--blue-400" },
      { name: "Blue 500", value: "#3b82f6", variable: "--blue-500" },
      { name: "Blue 600", value: "#2563eb", variable: "--blue-600" },
      { name: "Blue 700", value: "#1d4ed8", variable: "--blue-700" },
      { name: "Blue 800", value: "#1e40af", variable: "--blue-800" },
      { name: "Blue 900", value: "#1e3a8a", variable: "--blue-900" },
      { name: "Blue 950", value: "#172554", variable: "--blue-950" }
    ],
    semantic: [
      { name: "Background", value: "#fafbfc", variable: "--background" },
      { name: "Foreground", value: "#0f172a", variable: "--foreground" },
      { name: "Card", value: "#ffffff", variable: "--card" },
      { name: "Border", value: "#e2e8f0", variable: "--border" },
      { name: "Muted", value: "#f8fafc", variable: "--muted" },
      { name: "Accent", value: "#e0f2fe", variable: "--accent" },
      { name: "Destructive", value: "#dc2626", variable: "--destructive" }
    ]
  };

  // Typography Scale
  const typographyScale = [
    { name: "Display", tag: "h1", size: "2.5rem (40px)", weight: "700", lineHeight: "1.2" },
    { name: "Heading 1", tag: "h2", size: "2rem (32px)", weight: "600", lineHeight: "1.3" },
    { name: "Heading 2", tag: "h3", size: "1.5rem (24px)", weight: "600", lineHeight: "1.4" },
    { name: "Heading 3", tag: "h4", size: "1.25rem (20px)", weight: "600", lineHeight: "1.5" },
    { name: "Body", tag: "p", size: "1rem (16px)", weight: "400", lineHeight: "1.6" },
    { name: "Small", tag: "small", size: "0.875rem (14px)", weight: "400", lineHeight: "1.5" },
    { name: "Caption", tag: "span", size: "0.75rem (12px)", weight: "400", lineHeight: "1.4" }
  ];

  // Spacing System
  const spacingSystem = [
    { name: "XS", value: "0.25rem", pixels: "4px", variable: "--spacing-xs" },
    { name: "SM", value: "0.5rem", pixels: "8px", variable: "--spacing-sm" },
    { name: "MD", value: "1rem", pixels: "16px", variable: "--spacing-md" },
    { name: "LG", value: "1.5rem", pixels: "24px", variable: "--spacing-lg" },
    { name: "XL", value: "2rem", pixels: "32px", variable: "--spacing-xl" },
    { name: "2XL", value: "3rem", pixels: "48px", variable: "--spacing-2xl" },
    { name: "3XL", value: "4rem", pixels: "64px", variable: "--spacing-3xl" }
  ];

  // Border Radius System
  const radiusSystem = [
    { name: "SM", value: "0.5rem", pixels: "8px", variable: "--radius-sm" },
    { name: "MD", value: "0.75rem", pixels: "12px", variable: "--radius" },
    { name: "LG", value: "1rem", pixels: "16px", variable: "--radius-lg" },
    { name: "XL", value: "1.5rem", pixels: "24px", variable: "--radius-xl" },
    { name: "2XL", value: "2rem", pixels: "32px", variable: "--radius-2xl" },
    { name: "Full", value: "9999px", pixels: "∞", variable: "--radius-full" }
  ];

  // Shadow System
  const shadowSystem = [
    { name: "XS", value: "0 1px 2px 0 rgb(0 0 0 / 0.05)", variable: "--shadow-xs" },
    { name: "SM", value: "0 1px 3px 0 rgb(0 0 0 / 0.08), 0 1px 2px -1px rgb(0 0 0 / 0.08)", variable: "--shadow-sm" },
    { name: "MD", value: "0 4px 6px -1px rgb(0 0 0 / 0.08), 0 2px 4px -2px rgb(0 0 0 / 0.08)", variable: "--shadow-md" },
    { name: "LG", value: "0 10px 15px -3px rgb(0 0 0 / 0.08), 0 4px 6px -4px rgb(0 0 0 / 0.08)", variable: "--shadow-lg" },
    { name: "XL", value: "0 20px 25px -5px rgb(0 0 0 / 0.08), 0 8px 10px -6px rgb(0 0 0 / 0.08)", variable: "--shadow-xl" },
    { name: "2XL", value: "0 25px 50px -12px rgb(0 0 0 / 0.15)", variable: "--shadow-2xl" }
  ];

  const ColorSwatch = ({ color }: { color: { name: string; value: string; variable: string } }) => (
    <motion.div
      className="group cursor-pointer"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => copyToClipboard(color.value)}
    >
      <div 
        className="h-20 rounded-xl mb-3 shadow-sm border border-[var(--border)] relative overflow-hidden"
        style={{ backgroundColor: color.value }}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
          {copiedValue === color.value ? (
            <Check className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          ) : (
            <Copy className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>
      <p className="text-xs font-medium text-[var(--foreground)] mb-1">{color.name}</p>
      <p className="text-xs text-[var(--muted-foreground)] font-mono">{color.value}</p>
      <p className="text-xs text-[var(--muted-foreground)] font-mono">var({color.variable})</p>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-[var(--blue-50)] to-white">
      {/* Header */}
      <div className="border-b bg-white/80 backdrop-blur-lg sticky top-0 z-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl mb-2">Design System</h1>
              <p className="text-[var(--muted-foreground)]">
                photorido's comprehensive design guidelines and component library
              </p>
            </div>
            <Button className="bg-[var(--blue-600)] hover:bg-[var(--blue-700)]">
              <Download className="h-4 w-4 mr-2" />
              Export Assets
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Tabs defaultValue="colors" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-7 gap-2">
            <TabsTrigger value="colors" className="gap-2">
              <Palette className="h-4 w-4" />
              Colors
            </TabsTrigger>
            <TabsTrigger value="typography" className="gap-2">
              <Type className="h-4 w-4" />
              Typography
            </TabsTrigger>
            <TabsTrigger value="spacing" className="gap-2">
              <Grid3x3 className="h-4 w-4" />
              Spacing
            </TabsTrigger>
            <TabsTrigger value="components" className="gap-2">
              <Layout className="h-4 w-4" />
              Components
            </TabsTrigger>
            <TabsTrigger value="effects" className="gap-2">
              <Sparkles className="h-4 w-4" />
              Effects
            </TabsTrigger>
            <TabsTrigger value="icons" className="gap-2">
              <Camera className="h-4 w-4" />
              Icons
            </TabsTrigger>
            <TabsTrigger value="patterns" className="gap-2">
              <Layout className="h-4 w-4" />
              Patterns
            </TabsTrigger>
          </TabsList>

          {/* Colors Tab */}
          <TabsContent value="colors" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Primary Color Palette</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Our blue color scale provides a professional and trustworthy aesthetic. Click any color to copy its hex value.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {colorPalette.primary.map((color) => (
                      <ColorSwatch key={color.name} color={color} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Semantic Colors</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Functional colors used throughout the application for consistent UI elements.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-6">
                    {colorPalette.semantic.map((color) => (
                      <ColorSwatch key={color.name} color={color} />
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gradients</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Pre-defined gradient combinations for enhanced visual appeal.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <div className="h-24 rounded-xl" style={{ background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)" }} />
                      <p className="text-sm font-medium">Primary Gradient</p>
                      <p className="text-xs text-[var(--muted-foreground)] font-mono">var(--gradient-primary)</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 rounded-xl" style={{ background: "linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%)" }} />
                      <p className="text-sm font-medium">Accent Gradient</p>
                      <p className="text-xs text-[var(--muted-foreground)] font-mono">var(--gradient-accent)</p>
                    </div>
                    <div className="space-y-2">
                      <div className="h-24 rounded-xl" style={{ background: "linear-gradient(180deg, #eff6ff 0%, #ffffff 100%)" }} />
                      <p className="text-sm font-medium">Soft Gradient</p>
                      <p className="text-xs text-[var(--muted-foreground)] font-mono">var(--gradient-soft)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Typography Tab */}
          <TabsContent value="typography" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Type Scale</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Carefully crafted typographic hierarchy for optimal readability and visual balance.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {typographyScale.map((type, index) => (
                      <div key={type.name} className="border-b border-[var(--border)] pb-6 last:border-b-0 last:pb-0">
                        <div className="grid md:grid-cols-2 gap-6 items-center">
                          <div>
                            {type.tag === "h1" && <h1>Display Heading</h1>}
                            {type.tag === "h2" && <h2>Heading Level 1</h2>}
                            {type.tag === "h3" && <h3>Heading Level 2</h3>}
                            {type.tag === "h4" && <h4>Heading Level 3</h4>}
                            {type.tag === "p" && <p>This is body text for general content and descriptions.</p>}
                            {type.tag === "small" && <small className="text-sm">Small text for supporting information</small>}
                            {type.tag === "span" && <span className="text-xs">Caption text for labels</span>}
                          </div>
                          <div className="space-y-1 text-sm">
                            <p><span className="text-[var(--muted-foreground)]">Name:</span> <span className="font-medium">{type.name}</span></p>
                            <p><span className="text-[var(--muted-foreground)]">Tag:</span> <code className="px-2 py-0.5 bg-[var(--muted)] rounded">&lt;{type.tag}&gt;</code></p>
                            <p><span className="text-[var(--muted-foreground)]">Size:</span> <span className="font-mono">{type.size}</span></p>
                            <p><span className="text-[var(--muted-foreground)]">Weight:</span> <span className="font-mono">{type.weight}</span></p>
                            <p><span className="text-[var(--muted-foreground)]">Line Height:</span> <span className="font-mono">{type.lineHeight}</span></p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Font Weights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]">
                      <span style={{ fontWeight: 400 }}>Regular (400)</span>
                      <code className="text-xs">var(--font-weight-normal)</code>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]">
                      <span style={{ fontWeight: 500 }}>Medium (500)</span>
                      <code className="text-xs">var(--font-weight-medium)</code>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]">
                      <span style={{ fontWeight: 600 }}>Semibold (600)</span>
                      <code className="text-xs">var(--font-weight-semibold)</code>
                    </div>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-[var(--muted)]">
                      <span style={{ fontWeight: 700 }}>Bold (700)</span>
                      <code className="text-xs">font-weight: 700</code>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Spacing Tab */}
          <TabsContent value="spacing" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Spacing Scale</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Consistent spacing creates rhythm and improves scanability.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {spacingSystem.map((space) => (
                      <div key={space.name} className="flex items-center gap-6">
                        <div className="w-24 text-sm font-medium">{space.name}</div>
                        <div 
                          className="h-10 bg-[var(--blue-500)] rounded"
                          style={{ width: space.value }}
                        />
                        <div className="flex gap-4 text-sm text-[var(--muted-foreground)]">
                          <span className="font-mono">{space.value}</span>
                          <span className="font-mono">({space.pixels})</span>
                          <code className="text-xs">var({space.variable})</code>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Border Radius</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Rounded corners create a friendly, modern aesthetic.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                    {radiusSystem.map((radius) => (
                      <div key={radius.name} className="space-y-3">
                        <div 
                          className="h-24 bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-600)]"
                          style={{ borderRadius: radius.value }}
                        />
                        <div>
                          <p className="text-sm font-medium">{radius.name}</p>
                          <p className="text-xs text-[var(--muted-foreground)] font-mono">{radius.value} ({radius.pixels})</p>
                          <p className="text-xs text-[var(--muted-foreground)] font-mono">var({radius.variable})</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Shadow System</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Elevation system for creating depth and hierarchy.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {shadowSystem.map((shadow) => (
                      <div key={shadow.name} className="space-y-3">
                        <div 
                          className="h-32 bg-white rounded-xl flex items-center justify-center"
                          style={{ boxShadow: shadow.value }}
                        >
                          <span className="text-lg font-medium text-[var(--muted-foreground)]">{shadow.name}</span>
                        </div>
                        <p className="text-xs text-[var(--muted-foreground)] font-mono break-all">var({shadow.variable})</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Components Tab */}
          <TabsContent value="components" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Buttons</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Interactive elements with various styles and states.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Variants</p>
                      <div className="flex flex-wrap gap-3">
                        <Button>Default</Button>
                        <Button variant="secondary">Secondary</Button>
                        <Button variant="outline">Outline</Button>
                        <Button variant="ghost">Ghost</Button>
                        <Button variant="destructive">Destructive</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">Sizes</p>
                      <div className="flex flex-wrap items-center gap-3">
                        <Button size="sm">Small</Button>
                        <Button size="default">Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <p className="text-sm font-medium">With Icons</p>
                      <div className="flex flex-wrap gap-3">
                        <Button>
                          <Search className="h-4 w-4 mr-2" />
                          Search
                        </Button>
                        <Button variant="secondary">
                          <Heart className="h-4 w-4 mr-2" />
                          Save
                        </Button>
                        <Button variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Badges</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Labels and tags for categorization and status indication.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-3">
                    <Badge>Default</Badge>
                    <Badge variant="secondary">Secondary</Badge>
                    <Badge variant="outline">Outline</Badge>
                    <Badge variant="destructive">Destructive</Badge>
                    <Badge className="bg-[var(--blue-600)]">Featured</Badge>
                    <Badge className="bg-green-600">Verified</Badge>
                    <Badge className="bg-yellow-600">New</Badge>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Form Inputs</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Text inputs, search fields, and form controls.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-sm mb-2">Text Input</label>
                      <Input placeholder="Enter your name" />
                    </div>
                    <div>
                      <label className="block text-sm mb-2">With Icon</label>
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--muted-foreground)]" />
                        <Input placeholder="Search..." className="pl-10" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm mb-2">Disabled State</label>
                      <Input placeholder="Disabled input" disabled />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Cards</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Container components for grouping related content.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle>Basic Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Cards contain content and actions about a single subject.
                        </p>
                      </CardContent>
                    </Card>
                    <Card className="glass">
                      <CardHeader>
                        <CardTitle>Glass Card</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-[var(--muted-foreground)]">
                          Cards with glassmorphism effect for modern aesthetics.
                        </p>
                      </CardContent>
                    </Card>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Effects Tab */}
          <TabsContent value="effects" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Glassmorphism</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Semi-transparent blur effects for modern, layered designs.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="relative h-64 rounded-xl overflow-hidden bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-700)] p-8">
                    <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIgZmlsbD0id2hpdGUiIG9wYWNpdHk9IjAuMiIvPjwvc3ZnPg==')] opacity-30" />
                    <div className="relative grid grid-cols-2 gap-4">
                      <div className="glass p-6 rounded-xl">
                        <p className="text-white font-medium mb-2">Default Glass</p>
                        <code className="text-xs text-blue-100">className="glass"</code>
                      </div>
                      <div className="glass-strong p-6 rounded-xl">
                        <p className="text-[var(--blue-900)] font-medium mb-2">Strong Glass</p>
                        <code className="text-xs text-[var(--blue-700)]">className="glass-strong"</code>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Animations</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Smooth transitions and micro-interactions powered by Motion (Framer Motion).
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-3 gap-6">
                    <motion.div
                      className="h-32 bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-600)] rounded-xl flex items-center justify-center text-white font-medium cursor-pointer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Hover Me
                    </motion.div>
                    <motion.div
                      className="h-32 bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-600)] rounded-xl flex items-center justify-center text-white font-medium cursor-pointer"
                      whileHover={{ y: -8 }}
                      transition={{ type: "spring", stiffness: 300 }}
                    >
                      Lift Effect
                    </motion.div>
                    <motion.div
                      className="h-32 bg-gradient-to-br from-[var(--blue-500)] to-[var(--blue-600)] rounded-xl flex items-center justify-center text-white font-medium cursor-pointer"
                      whileHover={{ rotate: 5 }}
                      transition={{ type: "spring" }}
                    >
                      Rotate
                    </motion.div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Hover States</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Interactive feedback for better user experience.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <motion.div 
                      className="p-6 bg-white border-2 border-[var(--border)] rounded-xl cursor-pointer"
                      whileHover={{ 
                        borderColor: "var(--blue-500)",
                        boxShadow: "0 4px 20px rgba(59, 130, 246, 0.1)"
                      }}
                    >
                      <p className="font-medium">Card with Border Highlight</p>
                      <p className="text-sm text-[var(--muted-foreground)] mt-1">Hover to see the effect</p>
                    </motion.div>
                    <motion.div 
                      className="p-6 bg-gradient-to-r from-[var(--blue-50)] to-[var(--blue-100)] rounded-xl cursor-pointer"
                      whileHover={{ 
                        background: "linear-gradient(to right, var(--blue-100), var(--blue-200))"
                      }}
                    >
                      <p className="font-medium text-[var(--blue-900)]">Gradient Shift</p>
                      <p className="text-sm text-[var(--blue-700)] mt-1">Hover to see gradient change</p>
                    </motion.div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Icons Tab */}
          <TabsContent value="icons" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Icon Library</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    We use Lucide React icons for a consistent, beautiful icon system.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-6">
                    {[
                      { Icon: Search, name: "Search" },
                      { Icon: Heart, name: "Heart" },
                      { Icon: Star, name: "Star" },
                      { Icon: MapPin, name: "MapPin" },
                      { Icon: Camera, name: "Camera" },
                      { Icon: Users, name: "Users" },
                      { Icon: Mail, name: "Mail" },
                      { Icon: Download, name: "Download" },
                      { Icon: Sun, name: "Sun" },
                      { Icon: Moon, name: "Moon" },
                      { Icon: Palette, name: "Palette" },
                      { Icon: Type, name: "Type" },
                      { Icon: Layout, name: "Layout" },
                      { Icon: Sparkles, name: "Sparkles" },
                      { Icon: Grid3x3, name: "Grid3x3" },
                      { Icon: Copy, name: "Copy" },
                      { Icon: Check, name: "Check" }
                    ].map(({ Icon, name }) => (
                      <motion.div
                        key={name}
                        className="flex flex-col items-center gap-2 p-4 rounded-lg hover:bg-[var(--muted)] cursor-pointer group"
                        whileHover={{ scale: 1.1 }}
                      >
                        <Icon className="h-6 w-6 text-[var(--blue-600)] group-hover:text-[var(--blue-700)]" />
                        <span className="text-xs text-[var(--muted-foreground)]">{name}</span>
                      </motion.div>
                    ))}
                  </div>
                  <div className="mt-6 p-4 bg-[var(--blue-50)] rounded-lg">
                    <p className="text-sm">
                      <strong>Usage:</strong> <code className="px-2 py-1 bg-white rounded text-xs">
                        import &#123; Search &#125; from "lucide-react"
                      </code>
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Icon Sizes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap items-end gap-8">
                    <div className="text-center">
                      <Camera className="h-4 w-4 text-[var(--blue-600)] mx-auto mb-2" />
                      <p className="text-xs text-[var(--muted-foreground)]">16px (h-4 w-4)</p>
                    </div>
                    <div className="text-center">
                      <Camera className="h-5 w-5 text-[var(--blue-600)] mx-auto mb-2" />
                      <p className="text-xs text-[var(--muted-foreground)]">20px (h-5 w-5)</p>
                    </div>
                    <div className="text-center">
                      <Camera className="h-6 w-6 text-[var(--blue-600)] mx-auto mb-2" />
                      <p className="text-xs text-[var(--muted-foreground)]">24px (h-6 w-6)</p>
                    </div>
                    <div className="text-center">
                      <Camera className="h-8 w-8 text-[var(--blue-600)] mx-auto mb-2" />
                      <p className="text-xs text-[var(--muted-foreground)]">32px (h-8 w-8)</p>
                    </div>
                    <div className="text-center">
                      <Camera className="h-12 w-12 text-[var(--blue-600)] mx-auto mb-2" />
                      <p className="text-xs text-[var(--muted-foreground)]">48px (h-12 w-12)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          {/* Patterns Tab */}
          <TabsContent value="patterns" className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-8"
            >
              <Card>
                <CardHeader>
                  <CardTitle>Design Principles</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Core principles guiding our design decisions.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-6 border-l-4 border-[var(--blue-600)] bg-[var(--blue-50)] rounded-r-lg">
                      <h4 className="mb-2">Professional & Trustworthy</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Blue color palette and clean design create confidence and reliability.
                      </p>
                    </div>
                    <div className="p-6 border-l-4 border-[var(--blue-600)] bg-[var(--blue-50)] rounded-r-lg">
                      <h4 className="mb-2">Responsive First</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Every component works seamlessly across desktop, tablet, and mobile devices.
                      </p>
                    </div>
                    <div className="p-6 border-l-4 border-[var(--blue-600)] bg-[var(--blue-50)] rounded-r-lg">
                      <h4 className="mb-2">Accessible</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        WCAG compliant colors, keyboard navigation, and screen reader support.
                      </p>
                    </div>
                    <div className="p-6 border-l-4 border-[var(--blue-600)] bg-[var(--blue-50)] rounded-r-lg">
                      <h4 className="mb-2">Delightful Interactions</h4>
                      <p className="text-sm text-[var(--muted-foreground)]">
                        Smooth animations and micro-interactions enhance user experience.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Grid System</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    12-column responsive grid with consistent gutters.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-4">
                      {Array.from({ length: 12 }).map((_, i) => (
                        <div key={i} className="col-span-1 h-12 bg-[var(--blue-200)] rounded flex items-center justify-center text-xs text-[var(--blue-900)]">
                          {i + 1}
                        </div>
                      ))}
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-6 h-12 bg-[var(--blue-500)] rounded flex items-center justify-center text-white text-sm">
                        6 columns
                      </div>
                      <div className="col-span-6 h-12 bg-[var(--blue-500)] rounded flex items-center justify-center text-white text-sm">
                        6 columns
                      </div>
                    </div>
                    <div className="grid grid-cols-12 gap-4">
                      <div className="col-span-4 h-12 bg-[var(--blue-600)] rounded flex items-center justify-center text-white text-sm">
                        4 columns
                      </div>
                      <div className="col-span-4 h-12 bg-[var(--blue-600)] rounded flex items-center justify-center text-white text-sm">
                        4 columns
                      </div>
                      <div className="col-span-4 h-12 bg-[var(--blue-600)] rounded flex items-center justify-center text-white text-sm">
                        4 columns
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Breakpoints</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    Tailwind CSS default breakpoints for responsive design.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { name: "Mobile", breakpoint: "< 640px", class: "Default" },
                      { name: "Tablet", breakpoint: "≥ 640px", class: "sm:" },
                      { name: "Laptop", breakpoint: "≥ 768px", class: "md:" },
                      { name: "Desktop", breakpoint: "≥ 1024px", class: "lg:" },
                      { name: "Large Desktop", breakpoint: "≥ 1280px", class: "xl:" },
                      { name: "Extra Large", breakpoint: "≥ 1536px", class: "2xl:" }
                    ].map((bp) => (
                      <div key={bp.name} className="flex items-center justify-between p-4 bg-[var(--muted)] rounded-lg">
                        <div>
                          <p className="font-medium">{bp.name}</p>
                          <p className="text-sm text-[var(--muted-foreground)]">{bp.breakpoint}</p>
                        </div>
                        <code className="px-3 py-1 bg-white rounded text-sm">{bp.class}</code>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Component Composition</CardTitle>
                  <p className="text-sm text-[var(--muted-foreground)] mt-2">
                    How to combine primitives to create complex interfaces.
                  </p>
                </CardHeader>
                <CardContent>
                  <div className="border rounded-xl overflow-hidden">
                    <div className="bg-white p-6">
                      <div className="flex items-start gap-4">
                        <div className="h-12 w-12 rounded-full bg-[var(--blue-500)] flex items-center justify-center text-white">
                          <Camera className="h-6 w-6" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4>Professional Photographer</h4>
                            <Badge className="bg-green-600">Verified</Badge>
                          </div>
                          <p className="text-sm text-[var(--muted-foreground)] mb-4">
                            Specialized in wedding and portrait photography with 10+ years experience.
                          </p>
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                              <span className="text-sm">4.9</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <MapPin className="h-4 w-4 text-[var(--muted-foreground)]" />
                              <span className="text-sm">Mumbai, India</span>
                            </div>
                          </div>
                          <div className="flex gap-2 mt-4">
                            <Button size="sm">View Profile</Button>
                            <Button size="sm" variant="outline">Contact</Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer Note */}
      <div className="border-t bg-white/80 backdrop-blur-lg mt-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 text-center">
          <p className="text-sm text-[var(--muted-foreground)]">
            This design system is built with React, Tailwind CSS v4, and Motion (Framer Motion).
            <br />
            For questions or contributions, contact our design team.
          </p>
        </div>
      </div>
    </div>
  );
}
