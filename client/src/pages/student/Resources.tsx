
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FileText, Download, Search, BookOpen, ExternalLink, FileArchive, FileSpreadsheet, Calculator, Briefcase } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';

const Resources = () => {
  const [resources, setResources] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['All', 'DSA Sheet', 'Aptitude', 'Recruitment Process', 'Company Material'];

  useEffect(() => {
    const fetchResources = async () => {
      try {
        const { data } = await axios.get('http://localhost:5000/api/resources/all');
        setResources(data);
      } catch (err) {
        console.error("Error fetching resources:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchResources();
  }, []);

  const handleDownload = async (url: string, fileName: string) => {
    if (!url) return;
    
    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Download failed');
      const blob = await response.blob();
      const localUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = localUrl;
      const isPdf = url.toLowerCase().includes('.pdf');
      const extension = isPdf ? '.pdf' : '';
      link.download = fileName.toLowerCase().endsWith(extension) 
        ? fileName 
        : `${fileName}${extension}`;
      document.body.appendChild(link);
      link.click();
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

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'DSA Sheet':
        return <FileSpreadsheet className="w-6 h-6" />;
      case 'Aptitude':
        return <Calculator className="w-6 h-6" />;
      case 'Recruitment Process':
        return <FileArchive className="w-6 h-6" />;
      case 'Company Material':
        return <Briefcase className="w-6 h-6" />;
      default:
        return <FileText className="w-6 h-6" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'DSA Sheet':
        return 'text-primary bg-primary/10 dark:bg-primary/20';
      case 'Aptitude':
        return 'text-accent-foreground bg-accent/15';
      case 'Recruitment Process':
        return 'text-success bg-success/10 dark:bg-success/20';
      case 'Company Material':
        return 'text-primary bg-primary/10 dark:bg-primary/20';
      default:
        return 'text-muted-foreground bg-muted/50';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950 py-8 px-4 md:px-6">
      <div className="max-w-7xl mx-auto space-y-8">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Placement Study Library
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Prepare with curated DSA sheets, aptitude guides, and company-specific materials to ace your placements
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-none shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-6 items-start lg:items-center justify-between">
                <div className="flex flex-wrap gap-2 w-full lg:w-auto">
                  {categories.map(cat => (
                    <Badge
                      key={cat}
                      variant={activeTab === cat ? "default" : "outline"}
                      className={`cursor-pointer px-4 py-2 text-sm font-medium transition-all ${
                        activeTab === cat 
                          ? 'bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary' 
                          : 'hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                      onClick={() => setActiveTab(cat)}
                    >
                      {cat}
                    </Badge>
                  ))}
                </div>
                <div className="relative w-full lg:w-80">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input 
                    type="text" 
                    placeholder="Search by company or topic..."
                    className="pl-10 pr-4 py-2 border-border focus:ring-2 focus:ring-primary"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}>
                  <Card className="h-48 border-none shadow-lg">
                    <CardContent className="p-6">
                      <Skeleton className="h-12 w-12 rounded-lg mb-4" />
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-1/2" />
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredResources.map((res, index) => (
                <motion.div
                  key={res._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  whileHover={{ y: -4 }}
                >
                  <Card className="h-full border-none shadow-lg hover:shadow-2xl transition-all duration-300 group bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
                    <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                      <div className={`p-3 rounded-xl transition-colors ${getCategoryColor(res.category)}`}>
                        {getCategoryIcon(res.category)}
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {res.category}
                      </Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <CardTitle className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                          {res.title}
                        </CardTitle>
                        {res.companyName && (
                          <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                            <BookOpen className="w-3.5 h-3.5" /> {res.companyName}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                        <span className="text-xs text-muted-foreground">
                          {res.uploadedAt ? new Date(res.uploadedAt).toLocaleDateString() : 'Recently added'}
                        </span>
                        <Button 
                          size="sm" 
                          className="bg-gradient-to-r from-primary to-primary-dark hover:from-primary-dark hover:to-primary gap-2"
                          onClick={() => handleDownload(res.pdfUrl, res.title)}
                        >
                          <Download className="w-4 h-4" /> Download
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20"
            >
              <div className="w-24 h-24 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <FileText className="w-12 h-12 text-muted-foreground opacity-50" />
              </div>
              <h3 className="text-2xl font-bold mb-2">No resources found</h3>
              <p className="text-muted-foreground mb-6">Try adjusting your search or category filter</p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setActiveTab('All'); }}>
                Reset Filters
              </Button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

// Missing icons for demonstration
const Calculator = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="16" height="20" x="4" y="2" rx="2" />
    <line x1="8" x2="16" y1="6" y2="6" />
    <line x1="16" x2="16" y1="14" y2="18" />
    <path d="M16 10h.01" />
    <path d="M12 10h.01" />
    <path d="M8 10h.01" />
    <path d="M12 14h.01" />
    <path d="M8 14h.01" />
    <path d="M12 18h.01" />
    <path d="M8 18h.01" />
  </svg>
);

const Briefcase = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
  </svg>
);

export default Resources;
