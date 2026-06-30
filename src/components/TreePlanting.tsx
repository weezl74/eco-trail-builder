import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Trees, MapPin, Calendar, CheckCircle, Clock, ExternalLink } from 'lucide-react';
import { api, createTreeRequest, fetchTreeRequests, updateTreeRequest } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface TreeRequest {
  id: string;
  points_used: number;
  status: string;
  what3words_location?: string | null;
  planting_date?: string | null;
  tree_species: string;
  created_at: string;
}

interface TreePlantingProps {
  // Tree planting is a verified action — it MUST be validated against tree_points.
  treePoints: number;
  onPointsUpdate: (newTreePoints: number) => void;
}

const TreePlanting: React.FC<TreePlantingProps> = ({ treePoints, onPointsUpdate }) => {
  const [treeRequests, setTreeRequests] = useState<TreeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();

  const POINTS_REQUIRED = 500;
  const canPlantTree = treePoints >= POINTS_REQUIRED;

  // Mock What3Words locations for demonstration
  const mockWhat3WordsLocations = [
    'forest.leaves.growing',
    'nature.oak.woodland',
    'valley.green.trees',
    'meadow.saplings.grow',
    'park.branches.shadow',
    'grove.peaceful.canopy'
  ];

  useEffect(() => {
    if (user) {
      loadTreeRequests();
    }
  }, [user]);

  const loadTreeRequests = async () => {
    if (!user) return;

    try {
      const data = await fetchTreeRequests(user.id);
      setTreeRequests(
        data
          .slice()
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
      );
    } catch (error) {
      console.error('Error loading tree requests:', error);
    }
  };

  const generateMockLocation = () => {
    return mockWhat3WordsLocations[Math.floor(Math.random() * mockWhat3WordsLocations.length)];
  };

  const handleRequestTree = async () => {
    if (!user) return;
    if (!canPlantTree) {
      toast({
        title: "Not enough Tree Points",
        description: `You need ${POINTS_REQUIRED} Tree Points to request a tree. You currently have ${treePoints}.`,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await createTreeRequest({
        user_id: user.id,
        points_used: POINTS_REQUIRED,
        status: 'pending',
        tree_species: 'Native Oak',
      });

      // Deduct tree points from user's profile
      await api.post('/profile/update', {
        user_id: user.id,
        tree_points: treePoints - POINTS_REQUIRED,
      });


      onPointsUpdate(treePoints - POINTS_REQUIRED);
      setIsDialogOpen(false);
      await loadTreeRequests();

      toast({
        title: "Tree Request Submitted! 🌱",
        description: "Your tree planting request has been sent to CCBC. You'll receive updates on the planting progress.",
      });
    } catch (error) {
      console.error('Error requesting tree:', error);
      toast({
        title: "Request Failed",
        description: "There was an error submitting your tree request. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const simulateTreePlanted = async (requestId: string) => {
    try {
      const plantingDate = new Date();
      plantingDate.setDate(plantingDate.getDate() + Math.floor(Math.random() * 30) + 14); // 14-44 days from now
      
      await updateTreeRequest(requestId, {
        user_id: user?.id,
        status: 'planted',
        what3words_location: generateMockLocation(),
        planting_date: plantingDate.toISOString().split('T')[0],
      });
      
      await loadTreeRequests();
      toast({
        title: "Tree Planted! 🌳",
        description: "Your tree has been planted by CCBC. Check the What3Words location to find it!",
      });
    } catch (error) {
      console.error('Error updating tree status:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'approved':
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      case 'planted':
        return <Trees className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending':
        return 'secondary';
      case 'approved':
        return 'default';
      case 'planted':
        return 'default';
      default:
        return 'outline';
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trees className="h-5 w-5 text-green-600" />
          CCBC Tree Planting Programme
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Request Tree Section */}
        <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border">
          <div className="flex-1">
            <h3 className="font-semibold text-green-800">Plant a Tree in Caerphilly Borough</h3>
            <p className="text-sm text-green-600 mt-1">
              Use {POINTS_REQUIRED} points to request CCBC to plant a tree on your behalf
            </p>
            <p className="text-xs text-green-500 mt-2">
              Your points: {totalPoints} | Required: {POINTS_REQUIRED}
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button 
                disabled={!canPlantTree}
                className="bg-green-600 hover:bg-green-700"
              >
                <Trees className="h-4 w-4 mr-2" />
                Request Tree
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Trees className="h-5 w-5 text-green-600" />
                  Request Tree Planting
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="text-center p-6 bg-green-50 rounded-lg">
                  <Trees className="h-12 w-12 text-green-600 mx-auto mb-3" />
                  <h3 className="font-semibold text-green-800 mb-2">
                    Plant a Native Oak Tree
                  </h3>
                  <p className="text-sm text-green-600 mb-4">
                    CCBC will plant a native oak tree somewhere in Caerphilly Borough on your behalf. 
                    Once planted, you'll receive the What3Words location to visit your tree!
                  </p>
                  <div className="bg-white p-3 rounded border">
                    <p className="text-sm font-medium">Cost: {POINTS_REQUIRED} points</p>
                    <p className="text-xs text-gray-500 mt-1">
                      Planting typically takes 2-6 weeks from approval
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="flex-1"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleRequestTree}
                    disabled={isLoading}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {isLoading ? 'Submitting...' : 'Confirm Request'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tree Requests History */}
        <div>
          <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            Your Tree Requests
          </h3>
          {treeRequests.length > 0 ? (
            <div className="space-y-3">
              {treeRequests.map((request) => (
                <div key={request.id} className="border rounded-lg p-4 bg-white">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(request.status)}
                      <span className="font-medium text-gray-800">{request.tree_species}</span>
                      <Badge variant={getStatusBadgeVariant(request.status)}>
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Badge>
                    </div>
                    <span className="text-sm text-gray-500">
                      {new Date(request.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {request.status === 'planted' && request.what3words_location && (
                    <div className="mt-3 p-3 bg-green-50 rounded border-l-4 border-green-500">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-green-800">
                            🌳 Tree Location Found!
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <MapPin className="h-4 w-4 text-green-600" />
                            <code className="text-sm bg-white px-2 py-1 rounded border">
                              {request.what3words_location}
                            </code>
                          </div>
                          {request.planting_date && (
                            <div className="flex items-center gap-2 mt-2">
                              <Calendar className="h-4 w-4 text-green-600" />
                              <span className="text-sm text-green-600">
                                Planted: {new Date(request.planting_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                        </div>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => window.open(`https://what3words.com/${request.what3words_location}`, '_blank')}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          View Location
                        </Button>
                      </div>
                    </div>
                  )}

                  {request.status === 'pending' && (
                    <div className="mt-3 p-3 bg-yellow-50 rounded border-l-4 border-yellow-500">
                      <p className="text-sm text-yellow-800">
                        ⏳ Request submitted to CCBC. Awaiting approval and site selection.
                      </p>
                      {/* Demo button to simulate progression */}
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => simulateTreePlanted(request.id)}
                        className="mt-2 text-xs text-yellow-600 hover:text-yellow-800"
                      >
                        [Demo: Simulate Tree Planted]
                      </Button>
                    </div>
                  )}
                  
                  <div className="mt-2 pt-2 border-t flex justify-between text-xs text-gray-500">
                    <span>Points used: {request.points_used}</span>
                    <span>Request ID: {request.id.split('-')[0]}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Trees className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No tree requests yet</p>
              <p className="text-xs">Earn {POINTS_REQUIRED} points to plant your first tree!</p>
            </div>
          )}
        </div>

        {/* Information Section */}
        <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
          <p className="font-medium mb-1">About the CCBC Tree Planting Programme:</p>
          <p>• Trees are planted in appropriate locations across Caerphilly County Borough</p>
          <p>• Native species are prioritized for ecological benefits</p>
          <p>• What3Words locations provided once trees are established</p>
          <p>• Planting times may vary based on season and weather conditions</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default TreePlanting;