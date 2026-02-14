import React, { useState } from 'react';
import { Lock, Save, ArrowRight, CheckCircle2, Upload, FileText, X } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

export function ProfilePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      navigate('/map');
    }, 1500);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setUploadedFiles([...uploadedFiles, ...newFiles]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(uploadedFiles.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              Your Health Profile <Lock className="h-6 w-6 text-[#00BFB3]" />
            </h1>
            <p className="mt-2 text-slate-600">Help us personalize your outcome predictions. All data stays on your device.</p>
          </div>
          {saving && (
            <div className="flex items-center text-green-600 animate-pulse">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <span>Auto-saving...</span>
            </div>
          )}
        </div>

        <form className="space-y-8">
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age</label>
                <Input type="number" placeholder="45" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Sex Assigned at Birth</label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="">Select...</option>
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="intersex">Intersex</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Height (cm)</label>
                <Input type="number" placeholder="170" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input type="number" placeholder="70" />
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Diagnosis */}
          <Card>
            <CardHeader>
              <CardTitle>Current Diagnosis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Diagnosis</label>
                <Input defaultValue="Breast Cancer" className="bg-slate-50" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diagnosis Date</label>
                  <Input type="date" />
                  <p className="text-xs text-muted-foreground">Approximate date is okay.</p>
                </div>
                <div className="space-y-2">
                   <label className="text-sm font-medium">Stage</label>
                   <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50">
                    <option value="">Select Stage</option>
                    <option value="stage0">Stage 0 (In situ)</option>
                    <option value="stage1">Stage I</option>
                    <option value="stage2">Stage II</option>
                    <option value="stage3">Stage III</option>
                    <option value="stage4">Stage IV</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2.5: Medical Data Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Upload Medical Records</CardTitle>
              <CardDescription>Upload lab results, imaging reports, or pathology reports (optional)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#00BFB3] transition-colors cursor-pointer">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-12 w-12 text-slate-400 mb-3" />
                  <span className="text-sm font-medium text-slate-700">Click to upload or drag and drop</span>
                  <span className="text-xs text-slate-500 mt-1">PDF, JPG, PNG, DOC (max 10MB per file)</span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium text-slate-700">Uploaded Files:</p>
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-md border border-slate-200">
                      <div className="flex items-center gap-3">
                        <FileText className="h-5 w-5 text-[#00BFB3]" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">{file.name}</p>
                          <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                <Lock className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-800">
                  All uploaded files are processed locally on your device and never transmitted to our servers. 
                  We extract key medical data points to improve prediction accuracy.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: History */}
          <Card>
            <CardHeader>
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {['Hypertension', 'Diabetes', 'Heart Disease', 'Previous Cancer', 'Family History', 'High Cholesterol'].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <input type="checkbox" id={condition} className="h-4 w-4 rounded border-gray-300 text-[#00BFB3] focus:ring-[#00BFB3]" />
                    <label htmlFor={condition} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      {condition}
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Treatment Priorities</CardTitle>
              <CardDescription>Adjust sliders to weight what matters most to you.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Survival / Success Rate</label>
                  <span className="text-sm text-slate-500">80%</span>
                </div>
                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00BFB3]" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Cost Consciousness</label>
                  <span className="text-sm text-slate-500">40%</span>
                </div>
                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00BFB3]" />
              </div>
               <div className="space-y-4">
                <div className="flex justify-between">
                  <label className="text-sm font-medium">Travel Convenience</label>
                  <span className="text-sm text-slate-500">20%</span>
                </div>
                <input type="range" className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#00BFB3]" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center border-t bg-slate-50/50 p-6">
               <div className="text-xs text-slate-500 max-w-xs">
                 <Lock className="inline h-3 w-3 mr-1" />
                 Your data is encrypted and never leaves your device.
               </div>
               <div className="flex gap-4">
                 <Button variant="secondary" onClick={() => navigate('/map')}>Skip for Now</Button>
                 <Button className="bg-[#00BFB3] hover:bg-[#00A69C]" onClick={handleSave}>
                   {saving ? 'Saving...' : 'Save Profile'}
                 </Button>
               </div>
            </CardFooter>
          </Card>
        </form>
      </div>
    </div>
  );
}