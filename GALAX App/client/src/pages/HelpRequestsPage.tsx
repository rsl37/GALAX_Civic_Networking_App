import * as React from 'react';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { 
  HandHeart, 
  MapPin, 
  Clock, 
  User, 
  Plus,
  Filter,
  Search,
  AlertTriangle,
  Home,
  Car,
  Utensils,
  GraduationCap,
  Heart,
  Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';

interface HelpRequest {
  id: number;
  title: string;
  description: string;
  category: string;
  urgency: string;
  latitude: number | null;
  longitude: number | null;
  status: string;
  created_at: string;
  requester_username: string;
  requester_avatar: string | null;
  helper_username: string | null;
  media_url: string | null;
  media_type: string;
}

export function HelpRequestsPage() {
  const { user } = useAuth();
  const [helpRequests, setHelpRequests] = useState<HelpRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState({
    category: '',
    urgency: '',
    status: '',
    search: ''
  });
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newRequest, setNewRequest] = useState({
    title: '',
    description: '',
    category: '',
    urgency: '',
    location: ''
  });

  useEffect(() => {
    fetchHelpRequests();
  }, [filter]);

  const fetchHelpRequests = async () => {
    try {
      const token = localStorage.getItem('token');
      const params = new URLSearchParams();
      
      if (filter.category) params.append('category', filter.category);
      if (filter.urgency) params.append('urgency', filter.urgency);
      if (filter.status) params.append('status', filter.status);
      
      const response = await fetch(`/api/help-requests?${params}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        let filtered = data.data;
        
        if (filter.search) {
          filtered = filtered.filter((req: HelpRequest) => 
            req.title.toLowerCase().includes(filter.search.toLowerCase()) ||
            req.description.toLowerCase().includes(filter.search.toLowerCase())
          );
        }
        
        setHelpRequests(filtered);
      }
    } catch (error) {
      console.error('Help requests fetch error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateRequest = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/help-requests', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newRequest)
      });
      
      if (response.ok) {
        setShowCreateDialog(false);
        setNewRequest({
          title: '',
          description: '',
          category: '',
          urgency: '',
          location: ''
        });
        fetchHelpRequests();
      }
    } catch (error) {
      console.error('Create request error:', error);
    }
  };

  const handleOfferHelp = async (helpRequestId: number) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/help-requests/${helpRequestId}/offer-help`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchHelpRequests();
      }
    } catch (error) {
      console.error('Offer help error:', error);
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'bg-red-500 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'posted': return 'bg-blue-500 text-white';
      case 'matched': return 'bg-purple-500 text-white';
      case 'in_progress': return 'bg-yellow-500 text-white';
      case 'completed': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'emergency': return <AlertTriangle className="h-4 w-4" />;
      case 'transportation': return <Car className="h-4 w-4" />;
      case 'food': return <Utensils className="h-4 w-4" />;
      case 'housing': return <Home className="h-4 w-4" />;
      case 'healthcare': return <Heart className="h-4 w-4" />;
      case 'education': return <GraduationCap className="h-4 w-4" />;
      case 'technology': return <Wrench className="h-4 w-4" />;
      default: return <HandHeart className="h-4 w-4" />;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Help Requests
            </h1>
            <p className="text-gray-600">Connect with your community</p>
          </div>
          
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="galax-button">
                <Plus className="h-4 w-4 mr-2" />
                Request Help
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create Help Request</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newRequest.title}
                    onChange={(e) => setNewRequest({...newRequest, title: e.target.value})}
                    placeholder="Brief description of what you need"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newRequest.description}
                    onChange={(e) => setNewRequest({...newRequest, description: e.target.value})}
                    placeholder="Detailed description of your request"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={newRequest.category} onValueChange={(value) => setNewRequest({...newRequest, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="transportation">Transportation</SelectItem>
                        <SelectItem value="food">Food</SelectItem>
                        <SelectItem value="housing">Housing</SelectItem>
                        <SelectItem value="healthcare">Healthcare</SelectItem>
                        <SelectItem value="education">Education</SelectItem>
                        <SelectItem value="technology">Technology</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="urgency">Urgency</Label>
                    <Select value={newRequest.urgency} onValueChange={(value) => setNewRequest({...newRequest, urgency: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select urgency" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <Button onClick={handleCreateRequest} className="galax-button w-full">
                  Create Request
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="galax-card">
            <CardContent className="p-4">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Filters:</span>
                </div>
                
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search help requests..."
                      className="pl-10"
                      value={filter.search}
                      onChange={(e) => setFilter({...filter, search: e.target.value})}
                    />
                  </div>
                </div>
                
                <Select value={filter.category} onValueChange={(value) => setFilter({...filter, category: value})}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Categories</SelectItem>
                    <SelectItem value="emergency">Emergency</SelectItem>
                    <SelectItem value="transportation">Transportation</SelectItem>
                    <SelectItem value="food">Food</SelectItem>
                    <SelectItem value="housing">Housing</SelectItem>
                    <SelectItem value="healthcare">Healthcare</SelectItem>
                    <SelectItem value="education">Education</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filter.urgency} onValueChange={(value) => setFilter({...filter, urgency: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Urgency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Urgency</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={filter.status} onValueChange={(value) => setFilter({...filter, status: value})}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Status</SelectItem>
                    <SelectItem value="posted">Posted</SelectItem>
                    <SelectItem value="matched">Matched</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Help Requests Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {helpRequests.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <HandHeart className="h-16 w-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No help requests found</h3>
              <p className="text-gray-500">Try adjusting your filters or create a new request</p>
            </div>
          ) : (
            helpRequests.map((request) => (
              <Card key={request.id} className="galax-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(request.category)}
                      <CardTitle className="text-lg line-clamp-1">{request.title}</CardTitle>
                    </div>
                    <div className="flex gap-1">
                      <Badge className={getUrgencyColor(request.urgency)}>
                        {request.urgency}
                      </Badge>
                      <Badge className={getStatusColor(request.status)}>
                        {request.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <p className="text-gray-600 text-sm line-clamp-3">{request.description}</p>
                  
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-3 w-3" />
                      {request.requester_username}
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatTimeAgo(request.created_at)}
                    </div>
                  </div>
                  
                  {request.latitude && request.longitude && (
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <MapPin className="h-3 w-3" />
                      Location provided
                    </div>
                  )}
                  
                  {request.media_url && (
                    <div className="text-sm text-gray-500">
                      📎 {request.media_type} attachment
                    </div>
                  )}
                  
                  <div className="pt-2">
                    {request.status === 'posted' && (
                      <Button 
                        onClick={() => handleOfferHelp(request.id)}
                        className="galax-button w-full"
                        disabled={request.requester_username === user?.username}
                      >
                        <HandHeart className="h-4 w-4 mr-2" />
                        Offer Help
                      </Button>
                    )}
                    
                    {request.status === 'matched' && (
                      <div className="text-center text-sm text-gray-600">
                        Helper: {request.helper_username}
                      </div>
                    )}
                    
                    {request.status === 'completed' && (
                      <div className="text-center text-sm text-green-600 font-medium">
                        ✅ Completed
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </motion.div>
      </div>
    </div>
  );
}
