import { useState, useEffect } from 'react';
import { Lock, Upload, FileText, X, CheckCircle2, DollarSign, Star, MapPin, AlertCircle } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';
import { runProjection, PatientInput } from '../lib/api';

const STORAGE_KEY = 'pinkribbon_profile';
const PRIORITIES_KEY = 'pinkribbon_priorities';

export function ProfilePage() {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Load saved data from localStorage
  const loadSavedData = (): PatientInput => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Error loading saved profile:', err);
    }
    // Default values
    return {
      age: 45,
      zip_code: '',
      menopausal_status: 'unknown',
      stage_at_diagnosis: 'unknown',
      er_positive: null,
      pr_positive: null,
      her2_positive: null,
      fertility_preservation_concern: false,
    };
  };

  const loadSavedPriorities = () => {
    try {
      const saved = localStorage.getItem(PRIORITIES_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (err) {
      console.error('Error loading saved priorities:', err);
    }
    return { rating: 60, cost: 40 };
  };

  // Form state matching PatientInput interface
  const [formData, setFormData] = useState<PatientInput>(loadSavedData);

  // Priority Sliders State
  const [priorities, setPriorities] = useState(loadSavedPriorities);

  // Save to localStorage whenever formData or priorities change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (err) {
      console.error('Error saving profile:', err);
    }
  }, [formData]);

  useEffect(() => {
    try {
      localStorage.setItem(PRIORITIES_KEY, JSON.stringify(priorities));
    } catch (err) {
      console.error('Error saving priorities:', err);
    }
  }, [priorities]);

  // Calculate live weights
  const totalWeight = priorities.rating + priorities.cost;
  const ratingWeight = Math.round((priorities.rating / totalWeight) * 100) || 0;
  const costWeight = Math.round((priorities.cost / totalWeight) * 100) || 0;

  const handleSave = async (destination: string) => {
    if (destination === '/simulate') {
      // Validate required fields
      if (!formData.zip_code || formData.zip_code.length < 5) {
        setError('Please enter a valid ZIP code');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Call backend API with patient data
        const results = await runProjection(formData);

        // Navigate to simulation dashboard with results
        navigate('/simulate', { state: { projectionResults: results } });
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to run simulation. Please try again.';
        setError(errorMessage);
        setLoading(false);

        // Scroll to top to show error message
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      // Simple save and navigate
      setSaving(true);
      setTimeout(() => {
        setSaving(false);
        navigate(destination);
      }, 1500);
    }
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

  const [familyHistory, setFamilyHistory] = useState({
    breast: false,
    ovarian: false,
    other: false
  });

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              Your Health Profile <Lock className="h-6 w-6 text-[#E91E63]" />
            </h1>
            <p className="mt-2 text-slate-600">Personalize your breast cancer treatment simulation. Data stored locally.</p>
          </div>
          {saving && (
            <div className="flex items-center text-green-600 animate-pulse bg-green-50 px-3 py-1 rounded-full">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span className="text-sm font-medium">Profile Saved</span>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-900">Error</p>
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        )}

        <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
          
          {/* Section 1: Basic Information */}
          <Card>
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6">
              <div className="space-y-2">
                <label className="text-sm font-medium">Age *</label>
                <div className="flex items-center gap-4">
                  <Input
                    type="number"
                    placeholder="45"
                    className="w-20"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                  />
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={formData.age}
                    onChange={(e) => setFormData({...formData, age: Number(e.target.value)})}
                    className="flex-1 accent-[#E91E63]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP Code *</label>
                <Input
                  type="text"
                  placeholder="12345"
                  maxLength={5}
                  value={formData.zip_code}
                  onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                  className={error && !formData.zip_code ? 'border-red-300' : ''}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Menopausal Status</label>
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  value={formData.menopausal_status}
                  onChange={(e) => setFormData({...formData, menopausal_status: e.target.value as 'pre' | 'post' | 'unknown'})}
                >
                  <option value="unknown">Unknown/Prefer not to say</option>
                  <option value="pre">Pre-menopausal</option>
                  <option value="post">Post-menopausal</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Sex Assigned at Birth</label>
                <select className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
                  <option value="female">Female</option>
                  <option value="male">Male</option>
                  <option value="intersex">Intersex</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Height</label>
                <div className="flex gap-2">
                  <select className="flex h-10 w-1/2 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {[4, 5, 6, 7].map(ft => <option key={ft} value={ft}>{ft} ft</option>)}
                  </select>
                  <select className="flex h-10 w-1/2 items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm">
                    {Array.from({length: 12}, (_, i) => i).map(inch => <option key={inch} value={inch}>{inch} in</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Weight</label>
                <div className="relative">
                  <Input type="number" placeholder="150" defaultValue="150" />
                  <span className="absolute right-3 top-2.5 text-sm text-slate-500">lbs</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 2: Current Diagnosis Details */}
          <Card>
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle>Current Diagnosis Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Diagnosis</label>
                  <Input value="Breast Cancer" readOnly className="bg-slate-100 font-medium text-slate-700" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date of Diagnosis</label>
                  <Input type="date" />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Cancer Stage</label>
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={formData.stage_at_diagnosis}
                    onChange={(e) => setFormData({...formData, stage_at_diagnosis: e.target.value as 'I' | 'II' | 'III' | 'IV' | 'unknown'})}
                  >
                    <option value="unknown">Unknown/Not yet determined</option>
                    <option value="I">Stage I</option>
                    <option value="II">Stage II</option>
                    <option value="III">Stage III</option>
                    <option value="IV">Stage IV (Metastatic)</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tumor Size</label>
                  <div className="relative">
                    <Input type="number" placeholder="2.5" step="0.1" />
                    <span className="absolute right-3 top-2.5 text-sm text-slate-500">cm</span>
                  </div>
                </div>

                 <div className="space-y-2">
                  <label className="text-sm font-medium">Nodal Status</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select Nodal Status...</option>
                    <option value="n0">N0 (No lymph node involvement)</option>
                    <option value="n1">N1 (1-3 nodes)</option>
                    <option value="n2">N2 (4-9 nodes)</option>
                    <option value="n3">N3 (10+ nodes)</option>
                    <option value="unknown">Unknown</option>
                  </select>
                </div>

                 <div className="space-y-2">
                  <label className="text-sm font-medium">Grade</label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="">Select Grade...</option>
                    <option value="1">Grade 1 (Well differentiated)</option>
                    <option value="2">Grade 2 (Moderately differentiated)</option>
                    <option value="3">Grade 3 (Poorly differentiated)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <label className="text-sm font-medium block">Receptor Status</label>
                <div className="flex flex-wrap gap-6">
                  <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]"
                      checked={formData.er_positive === true}
                      onChange={(e) => setFormData({...formData, er_positive: e.target.checked ? true : null})}
                    />
                    <span className="text-sm font-medium">ER+ (Estrogen Receptor)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]"
                      checked={formData.pr_positive === true}
                      onChange={(e) => setFormData({...formData, pr_positive: e.target.checked ? true : null})}
                    />
                    <span className="text-sm font-medium">PR+ (Progesterone Receptor)</span>
                  </label>
                  <label className="flex items-center space-x-2 cursor-pointer p-3 border rounded-lg hover:bg-slate-50 transition-colors">
                    <input
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]"
                      checked={formData.her2_positive === true}
                      onChange={(e) => setFormData({...formData, her2_positive: e.target.checked ? true : null})}
                    />
                    <span className="text-sm font-medium">HER2+ (HER2 Positive)</span>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 3: Medical History */}
          <Card>
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle>Medical History</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-6">
               <div className="space-y-4">
                  <label className="text-sm font-medium block">Family History</label>
                  <div className="space-y-3">
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={familyHistory.breast}
                        onChange={(e) => setFamilyHistory({...familyHistory, breast: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]" 
                      />
                      <span className="text-sm">Family history of breast cancer</span>
                    </label>
                    {familyHistory.breast && (
                      <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 bg-pink-50 rounded-md border border-pink-100">
                         <Input placeholder="Relationship (e.g. Mother)" className="bg-white" />
                         <Input placeholder="Age at Diagnosis" className="bg-white" />
                      </div>
                    )}
                    
                    <label className="flex items-center space-x-2">
                      <input 
                        type="checkbox" 
                        checked={familyHistory.ovarian}
                        onChange={(e) => setFamilyHistory({...familyHistory, ovarian: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]" 
                      />
                      <span className="text-sm">Family history of ovarian cancer</span>
                    </label>

                    <label className="flex items-center space-x-2">
                       <input 
                        type="checkbox" 
                        checked={familyHistory.other}
                        onChange={(e) => setFamilyHistory({...familyHistory, other: e.target.checked})}
                        className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]" 
                      />
                      <span className="text-sm">Family history of other cancers</span>
                    </label>
                  </div>
               </div>
               
               <div className="pt-4 border-t border-slate-100">
                  <label className="text-sm font-medium mb-3 block">Other Conditions</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {['Diabetes', 'Hypertension', 'Heart Disease', 'High Cholesterol', 'Autoimmune Disease', 'Previous Radiation'].map((condition) => (
                      <label key={condition} className="flex items-center space-x-2">
                        <input type="checkbox" className="h-4 w-4 rounded border-gray-300 text-[#E91E63] focus:ring-[#E91E63]" />
                        <span className="text-sm">{condition}</span>
                      </label>
                    ))}
                  </div>
               </div>
            </CardContent>
          </Card>

          {/* Section 4: Insurance (Simplified) */}
          <Card>
            <CardHeader className="pb-4 border-b border-slate-100">
              <CardTitle>Insurance & Access</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Insurance Provider</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select Provider...</option>
                      <option value="medicare">Medicare</option>
                      <option value="bluecross">Blue Cross Blue Shield</option>
                      <option value="united">UnitedHealthcare</option>
                      <option value="kaiser">Kaiser Permanente</option>
                      <option value="aetna">Aetna</option>
                      <option value="cigna">Cigna</option>
                      <option value="other">Other</option>
                    </select>
                 </div>
                 <div className="space-y-2">
                    <label className="text-sm font-medium">Plan Type</label>
                    <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                      <option value="">Select Type...</option>
                      <option value="ppo">PPO</option>
                      <option value="hmo">HMO</option>
                      <option value="pos">POS</option>
                      <option value="epo">EPO</option>
                    </select>
                 </div>
              </div>
            </CardContent>
          </Card>

          {/* Section 5: Treatment Priorities */}
          <Card className="border-[#E91E63] border-l-4">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Treatment Priorities</span>
                <Badge variant="outline" className="text-[#E91E63] border-[#E91E63]">High Impact</Badge>
              </CardTitle>
              <CardDescription>Adjust what matters most to you when choosing a treatment center.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-8 pt-6">
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" /> Hospital Overall Rating
                  </label>
                  <span className="text-sm font-bold text-slate-700">{priorities.rating}% Importance</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                  value={priorities.rating}
                  onChange={(e) => setPriorities({...priorities, rating: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E91E63]" 
                />
                <p className="text-xs text-slate-500">I prioritize high-rated hospitals with excellent safety and patient experience.</p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-green-600" /> Cost Consciousness
                  </label>
                   <span className="text-sm font-bold text-slate-700">{priorities.cost}% Importance</span>
                </div>
                <input 
                  type="range" 
                  min="0" max="100" 
                   value={priorities.cost}
                  onChange={(e) => setPriorities({...priorities, cost: Number(e.target.value)})}
                  className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#E91E63]" 
                />
                <p className="text-xs text-slate-500">I want to minimize my out-of-pocket costs and find efficient care.</p>
              </div>

              <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 mt-4">
                 <p className="text-sm font-medium mb-2 text-center text-slate-700">Your Calculated Priorities</p>
                 <div className="flex h-4 w-full rounded-full overflow-hidden">
                    <div style={{ width: `${ratingWeight}%` }} className="bg-yellow-400 h-full" title="Rating" />
                    <div style={{ width: `${costWeight}%` }} className="bg-green-500 h-full" title="Cost" />
                 </div>
                 <div className="flex justify-between text-xs text-slate-500 mt-2">
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-yellow-400" /> Rating ({ratingWeight}%)</span>
                    <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-green-500" /> Cost ({costWeight}%)</span>
                 </div>
              </div>

            </CardContent>
          </Card>

          {/* Section 6: Upload Medical Records (Moved to Bottom) */}
          <Card className="bg-slate-50 border-slate-200">
             <CardHeader className="pb-4">
              <CardTitle>Upload Medical Records (Optional)</CardTitle>
              <CardDescription>Drag and drop PDF, DOCX, or images. Files are analyzed locally.</CardDescription>
            </CardHeader>
            <CardContent>
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-[#E91E63] transition-colors cursor-pointer bg-white">
                <input
                  type="file"
                  id="file-upload"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  className="hidden"
                  onChange={handleFileUpload}
                />
                <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                  <Upload className="h-10 w-10 text-slate-400 mb-3" />
                  <span className="text-sm font-medium text-slate-700">Click to upload or drag and drop</span>
                </label>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4 space-y-2">
                  {uploadedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-white rounded-md border border-slate-200 shadow-sm">
                      <div className="flex items-center gap-3">
                        <FileText className="h-4 w-4 text-[#E91E63]" />
                        <span className="text-sm font-medium text-slate-900 truncate max-w-[200px]">{file.name}</span>
                      </div>
                      <button onClick={() => removeFile(index)} className="text-slate-400 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="sticky bottom-0 bg-white/95 backdrop-blur p-4 border-t shadow-lg -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 flex flex-col gap-3">
             <div className="max-w-4xl mx-auto w-full flex flex-col sm:flex-row gap-3">
               <Button
                  type="button"
                  size="lg"
                  className="flex-1 bg-slate-900 hover:bg-slate-800 text-white"
                  onClick={() => handleSave('/')}
                  disabled={loading}
                >
                  Save Profile & Return Home
                </Button>
                <Button
                  type="button"
                  size="lg"
                  className="flex-1 bg-gradient-to-r from-[#E91E63] to-[#D81B60] hover:from-[#D81B60] hover:to-[#C2185B] text-white shadow-md shadow-pink-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => handleSave('/simulate')}
                  disabled={loading}
                >
                  {loading ? 'Running Simulation...' : 'Save & Simulate Treatments'}
                </Button>
             </div>
             <div className="text-center">
                <button
                  type="button"
                  className="text-sm text-slate-400 hover:text-slate-600 underline"
                  onClick={() => {
                    localStorage.removeItem(STORAGE_KEY);
                    localStorage.removeItem(PRIORITIES_KEY);
                    window.location.reload();
                  }}
                >
                  Clear All Data
                </button>
             </div>
          </div>

        </form>
      </div>
    </div>
  );
}
