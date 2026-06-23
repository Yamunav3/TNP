import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, GraduationCap } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const ManageAlumni = () => {
  // --- States ---
  const [alumni, setAlumni] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Forms
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    role: '',
    graduationYear: '',
    branch: '',
    skills: '',
    linkedin: '',
    github: '',
    isAvailable: true
  });
  const [editData, setEditData] = useState({
    name: '',
    company: '',
    role: '',
    graduationYear: '',
    branch: '',
    skills: '',
    linkedin: '',
    github: '',
    isAvailable: true
  });
  const authHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  // --- API Calls ---

  // 1. READ: Fetch all alumni
  const fetchAlumni = async () => {
    try {
      const { data } = await axios.get('http://localhost:5002/api/alumni/admin/all', { headers: authHeaders() });
      setAlumni(data);
    } catch (err) {
      console.error("Failed to fetch alumni");
    }
  };

  useEffect(() => {
    fetchAlumni();
  }, []);

  // 2. CREATE: Add new alumni
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.company || !formData.role) return toast.error("Please fill required fields");

    setLoading(true);
    try {
      await axios.post('http://localhost:5002/api/alumni', {
        ...formData,
        skills: formData.skills.split(',').map(s => s.trim()).filter(s => s)
      }, { headers: authHeaders() });
      toast.success("Alumni added successfully!");
      setFormData({
        name: '',
        company: '',
        role: '',
        graduationYear: '',
        branch: '',
        skills: '',
        linkedin: '',
        github: '',
        isAvailable: true
      });
      fetchAlumni(); // Refresh list
    } catch (err: any) {
      toast.error("Failed to add alumni");
    } finally {
      setLoading(false);
    }
  };

  // 3. DELETE: Remove alumni
  const handleDelete = async (id: string) => {
    if (!window.confirm("Permanently delete this alumni?")) return;

    try {
      await axios.delete(`http://localhost:5002/api/alumni/${id}`, { headers: authHeaders() });
      setAlumni((prev) => prev.filter((a) => a._id !== id));
      toast.success("Alumni deleted successfully");
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete alumni");
    }
  };

  // 4. UPDATE: Save edits
  const handleUpdate = async (id: string) => {
    try {
      await axios.put(`http://localhost:5002/api/alumni/${id}`, {
        ...editData,
        skills: editData.skills.split(',').map(s => s.trim()).filter(s => s)
      }, { headers: authHeaders() });
      toast.success("Alumni updated");
      setEditingId(null);
      fetchAlumni();
    } catch (err) {
      toast.error("Update failed");
    }
  };

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Alumni Management</h1>
        <Badge variant="outline">Admin Access</Badge>
      </div>

      {/* --- CREATE FORM --- */}
      <Card className="border-dashed border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary" /> Add New Alumni Mentor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <input 
                type="text" placeholder="Full Name" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
              <input 
                type="text" placeholder="Current Company" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                required
              />
              <input 
                type="text" placeholder="Job Role" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              />
              <input 
                type="text" placeholder="Graduation Year (e.g., 2024)" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.graduationYear}
                onChange={(e) => setFormData({...formData, graduationYear: e.target.value})}
              />
            </div>

            <div className="space-y-4">
              <input 
                type="text" placeholder="Branch (e.g., CSE, ECE)" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.branch}
                onChange={(e) => setFormData({...formData, branch: e.target.value})}
              />
              <input 
                type="text" placeholder="Skills (comma separated)" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.skills}
                onChange={(e) => setFormData({...formData, skills: e.target.value})}
              />
              <input 
                type="url" placeholder="LinkedIn URL" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.linkedin}
                onChange={(e) => setFormData({...formData, linkedin: e.target.value})}
              />
              <input 
                type="url" placeholder="GitHub URL" 
                className="w-full p-2 rounded-md border bg-background text-sm"
                value={formData.github}
                onChange={(e) => setFormData({...formData, github: e.target.value})}
              />
              <label className="flex items-center gap-2 text-sm">
                <input 
                  type="checkbox" 
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({...formData, isAvailable: e.target.checked})}
                />
                Available for Mentoring
              </label>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Adding..." : "Add Alumni"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* --- READ & UPDATE & DELETE LIST --- */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Alumni Directory</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {alumni.map((alumnus) => (
              <div key={alumnus._id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-secondary/10 transition-colors">
                {editingId === alumnus._id ? (
                  /* Inline Edit UI */
                  <div className="flex flex-col md:flex-row gap-3 w-full">
                    <input 
                      className="border p-1 text-sm rounded flex-1" 
                      value={editData.name} 
                      onChange={(e) => setEditData({...editData, name: e.target.value})} 
                      placeholder="Name"
                    />
                    <input 
                      className="border p-1 text-sm rounded flex-1" 
                      value={editData.company} 
                      onChange={(e) => setEditData({...editData, company: e.target.value})} 
                      placeholder="Company"
                    />
                    <input 
                      className="border p-1 text-sm rounded flex-1" 
                      value={editData.role} 
                      onChange={(e) => setEditData({...editData, role: e.target.value})} 
                      placeholder="Role"
                    />
                    <div className="flex gap-2">
                      <Button onClick={() => handleUpdate(alumnus._id)} size="sm" variant="default"><Save className="w-4 h-4"/></Button>
                      <Button onClick={() => setEditingId(null)} size="sm" variant="ghost"><X className="w-4 h-4"/></Button>
                    </div>
                  </div>
                ) : (
                  /* Standard List UI */
                  <>
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded">
                        <GraduationCap className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{alumnus.name} • {alumnus.graduationYear}</p>
                        <p className="text-[10px] text-muted-foreground uppercase">{alumnus.role} @ {alumnus.company}</p>
                        <p className="text-xs text-muted-foreground">{alumnus.branch} • {alumnus.skills?.join(', ')}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Badge variant={alumnus.isAvailable ? "default" : "secondary"}>
                        {alumnus.isAvailable ? "Available" : "Busy"}
                      </Badge>
                      <Button variant="outline" size="sm" onClick={() => {
                        setEditingId(alumnus._id);
                        setEditData({
                          ...alumnus,
                          skills: alumnus.skills?.join(', ') || ''
                        });
                      }}>
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDelete(alumnus._id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
            {alumni.length === 0 && <p className="text-center text-muted-foreground text-sm py-4">No alumni added yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ManageAlumni;
