import React from 'react';
import { Shield, Lock, Eye, Database, UserX, Globe, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';

export function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero */}
      <section className="bg-gradient-to-b from-white to-[#E0F2F1] py-12 border-b">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="flex items-center justify-center gap-4 mb-4">
            <Shield className="h-12 w-12 text-[#00BFB3]" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-900">Privacy Policy</h1>
          </div>
          <div className="text-center space-y-2">
            <p className="text-slate-600">Effective Date: February 14, 2025</p>
            <p className="text-slate-600">Last Updated: February 14, 2025</p>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-4xl py-12 space-y-12">
        {/* Introduction */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-4">Introduction</h2>
          <Card className="bg-teal-50 border-[#00BFB3] border-2">
            <CardContent className="p-6">
              <p className="text-slate-700 mb-4">
                CareCompass ("we," "our," "us") is committed to protecting your privacy. This Privacy 
                Policy explains how we handle information when you use our healthcare decision simulation platform.
              </p>
              <p className="font-bold text-slate-900 text-lg">
                Key Principle: Your health information never leaves your device. We are not a covered 
                entity under HIPAA because we don't store, transmit, or process protected health 
                information (PHI).
              </p>
            </CardContent>
          </Card>
        </section>

        {/* What Information We Collect */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What Information We Collect</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Lock className="h-5 w-5 text-[#00BFB3]" />
                  1. Health Profile Data (Stored Locally Only)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  When you enter information about your diagnosis, age, medical history, or preferences, 
                  this data is:
                </p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Stored only in your browser's local storage</li>
                  <li>Never transmitted to our servers</li>
                  <li>Automatically deleted if you clear your browser data</li>
                  <li>Not accessible to us or any third party</li>
                </ul>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-900">
                    <strong>Examples:</strong> Age, diagnosis, symptom onset time, medical conditions, 
                    insurance type, treatment preferences
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Eye className="h-5 w-5 text-[#00BFB3]" />
                  2. Search & Usage Data (Anonymized)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">We collect anonymized data about how you use the platform:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Diagnosis searched (e.g., "breast cancer" but not "John Smith searched breast cancer")</li>
                  <li>Zip code (for finding nearby hospitals)</li>
                  <li>Which hospitals you viewed</li>
                  <li>Whether you ran simulations</li>
                  <li>Which pages you visited</li>
                  <li>Device type and browser</li>
                  <li>Session duration</li>
                </ul>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-900 font-medium mb-2">This data is:</p>
                  <ul className="text-sm text-green-800 space-y-1">
                    <li>✓ Aggregated and anonymized</li>
                    <li>✓ Used to improve the platform</li>
                    <li>✓ Never linked to your identity</li>
                    <li>✓ Not sold to third parties</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Database className="h-5 w-5 text-[#00BFB3]" />
                  3. Technical Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-700 mb-4">Standard web analytics:</p>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>IP address (anonymized after 24 hours)</li>
                  <li>Browser type and version</li>
                  <li>Operating system</li>
                  <li>Referral source (how you found us)</li>
                  <li>Pages viewed and time spent</li>
                  <li>Error logs (for debugging)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* What We DON'T Collect */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">What Information We Do NOT Collect</h2>
          
          <Card className="bg-red-50 border-red-300">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Your name</span>
                </div>
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Email address (unless you contact us)</span>
                </div>
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Phone number</span>
                </div>
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Medical record numbers</span>
                </div>
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Social security number</span>
                </div>
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Insurance ID numbers</span>
                </div>
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Actual health outcomes</span>
                </div>
                <div className="flex items-center gap-2 text-red-800">
                  <UserX className="h-5 w-5" />
                  <span>Credit card information</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* How We Use Information */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">How We Use Information</h2>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Anonymized Usage Data:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Improve platform functionality</li>
                  <li>Identify bugs and errors</li>
                  <li>Understand which features are most valuable</li>
                  <li>Conduct research on healthcare decision-making patterns</li>
                  <li>Generate aggregate statistics (e.g., "most searched conditions")</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-100">
              <CardHeader>
                <CardTitle>We Do NOT:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-700">
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Sell your data to anyone</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Share individual usage patterns</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Target you with ads based on health searches</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Provide data to insurance companies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Provide data to employers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-red-600 font-bold">✗</span>
                    <span>Create individual user profiles for marketing</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Third-Party Services */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Third-Party Services</h2>
          
          <div className="space-y-4">
            <Card className="border-l-4 border-l-[#00BFB3]">
              <CardContent className="p-6">
                <h3 className="font-bold text-slate-900 mb-2">✓ We Use:</h3>
                <div className="space-y-4 ml-4">
                  <div>
                    <p className="font-semibold text-slate-900">Google Maps API</p>
                    <p className="text-sm text-slate-600">Purpose: Display hospital locations</p>
                    <p className="text-sm text-slate-600">Data Shared: Zip code, hospital addresses</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Google Analytics 4</p>
                    <p className="text-sm text-slate-600">Purpose: Anonymous usage analytics</p>
                    <p className="text-sm text-slate-600">Data Shared: Anonymized session data, no health information</p>
                    <Badge variant="secondary" className="mt-1">IP Anonymization: Enabled</Badge>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">Cloud Infrastructure (AWS/GCP)</p>
                    <p className="text-sm text-slate-600">Purpose: Host the platform</p>
                    <p className="text-sm text-slate-600">Data Shared: Only anonymized usage logs</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-300">
              <CardContent className="p-6">
                <h3 className="font-bold text-red-900 mb-2">✗ We Do NOT Use:</h3>
                <ul className="space-y-2 text-red-800 ml-4">
                  <li>• Facebook Pixel or social media trackers</li>
                  <li>• Third-party advertising networks</li>
                  <li>• Data brokers or marketing platforms</li>
                  <li>• Insurance company APIs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Your Rights */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Your Rights</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="bg-green-50 border-green-300">
              <CardHeader>
                <CardTitle className="text-green-900">You Can:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-green-800">
                  <li>✓ Use the platform without creating an account</li>
                  <li>✓ Clear your local data anytime (browser settings)</li>
                  <li>✓ Use incognito/private browsing mode</li>
                  <li>✓ Block cookies (may affect functionality)</li>
                  <li>✓ Request deletion of any feedback you submit</li>
                  <li>✓ Export your locally stored data</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-100">
              <CardHeader>
                <CardTitle className="text-slate-900">You Cannot:</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-slate-700">
                  <li>✗ Request "your data" from our servers (we don't have individually identifiable data)</li>
                  <li>✗ Opt out of anonymized analytics and still use the platform (needed for operation)</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Data Security */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Data Security</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Technical Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>HTTPS encryption for all connections</li>
                  <li>No health data transmitted to servers</li>
                  <li>Secure cloud infrastructure (SOC 2 certified)</li>
                  <li>Regular security audits</li>
                  <li>No third-party advertising scripts</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Organizational Measures</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                  <li>Minimal data collection by design</li>
                  <li>Employee access restrictions</li>
                  <li>Incident response plan</li>
                  <li>Regular privacy training</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* CCPA & GDPR */}
        <section className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-[#00BFB3]" />
                California Privacy Rights (CCPA)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-700 mb-4">California residents have the right to:</p>
              <ul className="list-disc list-inside space-y-2 text-slate-700 ml-4">
                <li>Know what personal information is collected</li>
                <li>Request deletion of personal information</li>
                <li>Opt out of sale of personal information (we don't sell data)</li>
              </ul>
              <p className="text-slate-700 mt-4 text-sm italic">
                Since we don't collect identifiable personal information, most CCPA requests are not applicable.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Globe className="h-6 w-6 text-[#00BFB3]" />
                GDPR Compliance (EU Users)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-slate-700">
                <p><strong>Legal Basis for Processing:</strong> Legitimate interest in providing and improving the service</p>
                <p><strong>Data Controller:</strong> CareCompass team</p>
                <p><strong>Your Rights:</strong> Access, rectification, erasure (right to be forgotten), data portability, 
                object to processing, lodge complaint with supervisory authority</p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section>
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Contact Us</h2>
          
          <Card className="bg-[#E0F2F1] border-[#00BFB3]">
            <CardContent className="p-8">
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Privacy Questions:</h3>
                  <p className="text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#00BFB3]" />
                    privacy@carecompass.health
                  </p>
                  <p className="text-sm text-slate-600">Response time: 5 business days</p>
                </div>
                
                <div>
                  <h3 className="font-bold text-slate-900 mb-2">General Inquiries:</h3>
                  <p className="text-slate-700 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-[#00BFB3]" />
                    hello@carecompass.health
                  </p>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 mb-2">Mailing Address:</h3>
                  <p className="text-slate-700">
                    CareCompass<br />
                    Stanford University (TreeHacks 2025 Project)<br />
                    Stanford, CA 94305
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Disclaimer */}
        <section>
          <Card className="bg-amber-50 border-amber-300">
            <CardHeader>
              <CardTitle>Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-slate-700">
                <li><strong>Not a Medical Device:</strong> CareCompass is an educational tool, not a medical device regulated by the FDA.</li>
                <li><strong>Not Medical Advice:</strong> Simulations are for informational purposes only. Always consult licensed healthcare providers for medical decisions.</li>
                <li><strong>No Doctor-Patient Relationship:</strong> Using this platform does not create a doctor-patient relationship.</li>
                <li><strong>No Warranty:</strong> Platform provided "as is" without warranties about accuracy or completeness.</li>
              </ul>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
