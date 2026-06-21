import React, { useState, useEffect } from 'react';
import { Upload, Plus, Edit, Trash2, Save, X, FileText } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ManageResources = () => {
  // --- States ---
  const [resources, setResources] = useState<Record<string, any>[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Forms
  const [formData, setFormData] = useState({
    title: '',
    category: 'DSA Sheet',
    companyName: ''
  });
  const [editData, setEditData] = useState({
    title: '',
    category: '',
    companyName: ''
  });

  // --- API Calls ---

  // 1. READ: Fetch all resources
  const fetchResources = async () => {
    try {
      const { data } = await axios.get('http://localhost:5002/api/resources/all');
      setResources(data);
    } catch (err) {
      console.error("Failed to fetch resources");
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFile(e.target.files[0]);
  };

  // 2. CREATE: Upload new resource
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !formData.title) return toast.error("Please provide a title and a file");

    const data = new FormData();
    data.append('pdf', file);
    data.append('title', formData.title);
    data.append('category', formData.category);
    data.append('companyName', formData.companyName || 'General');

    setLoading(true);
    try {
      await axios.post('http://localhost:5002/api/resources/upload', data);
      toast.success("Resource published!");
      setFormData({ title: '', category: 'DSA Sheet', companyName: '' });
      setFile(null);
      fetchResources(); // Refresh list
    } catch (err: any) {
      toast.error("Upload failed");
    } finally {
      setLoading(false);
    }
  };

  // 3. DELETE: Remove resource
  // client/src/pages/admin/ManageResources.tsx
// client/src/pages/admin/ManageResources.tsx

const handleDelete = async (id: string) => {
  if (!window.confirm("Permanently delete this placement material?")) return;

  try {
    // 1. Call the backend
    await axios.delete(`http://localhost:5002/api/resources/${id}`);
    
    // 2. Update UI state instantly without a page reload
    setResources((prev) => prev.filter((res) => res._id !== id));
    
    toast.success("Resource deleted successfully");
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Failed to delete the resource");
  }
};
  // 4. UPDATE: Save edits
  const handleUpdate = async (id: string) => {
    try {
      await axios.put(`http://localhost:5002/api/resources/${id}`, editData);
      toast.success("Resource updated");
      setEditingId(null);
      fetchResources();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Resource Management</h1>
        <Badge variant="outline">Admin Access</Badge>
      </div>

      {/* --- CREATE FORM --- */}
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Upload New Placement Material
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input 
                type="text" placeholder="Document Title" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                required
              />
              <select 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
              >
                <option value="DSA Sheet">DSA Sheet</option>
                <option value="Aptitude">Aptitude</option>
                <option value="Recruitment Process">Recruitment Process</option>
                <option value="Company Material">Company Material</option>
              </select>
              <input 
                type="text" placeholder="Company Name (Optional)" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.companyName}
                onChange={(e) => setFormData({...formData, companyName: e.target.value})}
              />
            </div>

            <div className="flex flex-col gap-4">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer hover:bg-secondary/50 border-primary/20">
                <Upload className="w-8 h-8 text-primary mb-2" />
                <p className="text-xs font-medium">{file ? file.name : "Select File (PDF/JPG/PNG)"}</p>
                <input type="file" className="hidden" accept=".pdf,.jpg,.jpeg,.png" onChange={handleFileChange} />
              </label>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Publishing..." : "Publish to Portal"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --- READ & UPDATE & DELETE LIST --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Existing Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {resources.map((res) => (
              <div key={res._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10 transition-colors">
                {editingId === res._id ? (
                  /* Inline Edit UI */
                  <div className="flex flex-col md:flex-row gap-3 w-full">
                    <input 
                      className="border p-1 text-sm rounded flex-1" 
                      value={editData.title} 
                      onChange={(e) => setEditData({...editData, title: e.target.value})} 
                    />
                    <select 
                      className="border p-1 text-sm rounded"
                      value={editData.category}
                      onChange={(e) => setEditData({...editData, category: e.target.value})}
                    >
                      <option value="DSA Sheet">DSA Sheet</option>
                      <option value="Aptitude">Aptitude</option>
                      <option value="Recruitment Process">Recruitment Process</option>
                      <option value="Company Material">Company Material</option>
                    </select>
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(res._id)} size="sm" variant="default"><Save className="w-4 h-4"/></Button>
                      <Button onClick={() => setEditingId(null)} size="sm" variant="ghost"><X className="w-4 h-4"/></Button>
                    </div>
                  </div>
                ) : (
                  /* Standard List UI */
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{res.title}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{res.category} • {res.companyName}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingId(res._id);
                        setEditData({ title: res.title, category: res.category, companyName: res.companyName });
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(res._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {resources.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No resources found.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageResources;