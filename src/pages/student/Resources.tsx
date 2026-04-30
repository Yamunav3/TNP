import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, Search, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

const Resources = () => {
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'DSA Sheet', 'Aptitude', 'Recruitment Process', 'Company Material'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        // Points to your active backend port
        const { data } = await axios.get('http://localhost:5002/api/resources/all');
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);
const handleDelete = async (id: string) => {
  if (!window.confirm("Are you sure you want to delete this placement material?")) return;

  try {
    // 1. Send the request to the backend
    await axios.delete(`http://localhost:5002/api/resources/${id}`);
    
    // 2. Update the UI state instantly
    // We filter out the deleted ID so the list refreshes without a page reload
    setResources((prev) => prev.filter((item) => item._id !== id));
    
    toast.success("Resource removed successfully");
  } catch (err) {
    console.error("Delete failed:", err);
    toast.error("Could not delete the resource");
  }
};
const handleDownload = async (url: string, fileName: string) => {
  if (!url) return;
  
  try {
    // 1. Fetch the data directly. This ensures the browser gets the raw bits.
    const response = await fetch(url);
    if (!response.ok) throw new Error('Download failed');
    const blob = await response.blob();

    // 2. Create a local URL for the PDF/Image data
    const localUrl = window.URL.createObjectURL(blob);

    // 3. Trigger the browser's download prompt
    const link = document.createElement('a');
    link.href = localUrl;
    
    // Maintain the original format
    const isPdf = url.toLowerCase().includes('.pdf');
    const extension = isPdf ? '.pdf' : '';
    link.download = fileName.toLowerCase().endsWith(extension) 
      ? fileName 
      : `${fileName}${extension}`;
      
    document.body.appendChild(link);
    link.click();
    
    // 4. Cleanup to save memory
    link.remove();
    window.URL.revokeObjectURL(localUrl);
  } catch (err) {
    console.error("Blob download failed, opening in new tab:", err);
    window.open(url, '_blank');
  }
};
  const filteredResources = resources.filter(res => {
    const matchesTab = activeTab === 'All' || res.category === activeTab;
    const matchesSearch = res.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (res.companyName && res.companyName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesTab && matchesSearch;
  });

  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Placement Study Library</h1>
        <p className="text-muted-foreground italic">Prepare with curated DSA sheets, aptitude guides, and company-specific materials.</p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-secondary/30 p-4 rounded-xl border">
        <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {categories.map(cat => (
            <Badge 
              key={cat}
              variant={activeTab === cat ? "default" : "outline"}
              className="cursor-pointer px-4 py-2 text-sm whitespace-nowrap"
              onClick={() => setActiveTab(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by company or topic..."
            className="w-full pl-10 p-2 rounded-lg border bg-background text-sm focus:ring-2 focus:ring-primary outline-none"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-48 rounded-xl" />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredResources.map((res) => (
            <Card key={res._id} className="group hover:border-primary/50 transition-all duration-300 shadow-sm hover:shadow-md">
              <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="p-2.5 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <Badge variant="secondary" className="text-[10px] uppercase font-bold">{res.category}</Badge>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <CardTitle className="text-lg line-clamp-1">{res.title}</CardTitle>
                  <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                    <BookOpen className="w-3 h-3" /> {res.companyName}
                  </p>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <span className="text-[10px] text-muted-foreground">
                    Added: {new Date(res.uploadedAt).toLocaleDateString()}
                  </span>
                  <Button 
                    size="sm" 
                    className="gap-2"
                    onClick={() => handleDownload(res.pdfUrl, res.title)} // Correctly calls the logic above
                  >
                    <Download className="w-4 h-4" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredResources.length === 0 && (
        <div className="text-center py-20 border-2 border-dashed rounded-2xl">
          <p className="text-muted-foreground">No resources found matching your search.</p>
        </div>
      )}
    </div>
  );
};

export default Resources;