'use client';

import { useEffect, useState } from 'react';
import { Truck, Plus, Edit, Trash2, MapPin, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ShippingCompany {
  id: number;
  name: string;
  code: string;
  logo: string;
  tracking_url: string;
  phone: string;
  email: string;
  is_active: boolean;
}

interface ShippingZone {
  id: number;
  company_id: number;
  name: string;
  cities: string[];
  min_days: number;
  max_days: number;
  is_active: boolean;
}

interface ShippingRate {
  id: number;
  zone_id: number;
  weight_min: number;
  weight_max: number;
  price: number;
  free_shipping_above: number;
  is_active: boolean;
}

export default function ShippingPage() {
  const [companies, setCompanies] = useState<ShippingCompany[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('companies');
  const [showCompanyDialog, setShowCompanyDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState<ShippingCompany | null>(null);
  const [companyForm, setCompanyForm] = useState({
    name: '',
    code: '',
    tracking_url: '',
    phone: '',
    email: '',
  });

  useEffect(() => {
    fetchShipping();
  }, []);

  const fetchShipping = async () => {
    setLoading(true);
    try {
      // Mock data - replace with API calls
      setCompanies([
        {
          id: 1,
          name: 'TCS',
          code: 'tcs',
          logo: 'https://via.placeholder.com/48',
          tracking_url: 'https://tcstracking.com/?track={tracking_number}',
          phone: '111-123-223',
          email: 'support@tcs.com',
          is_active: true,
        },
        {
          id: 2,
          name: 'Leopards Courier',
          code: 'leopards',
          logo: 'https://via.placeholder.com/48',
          tracking_url: 'https://leopards.com.pk/track/{tracking_number}',
          phone: '042-111-300-700',
          email: 'support@leopards.com.pk',
          is_active: true,
        },
        {
          id: 3,
          name: 'Trax',
          code: 'trax',
          logo: 'https://via.placeholder.com/48',
          tracking_url: 'https://trax.com.pk/track/{tracking_number}',
          phone: '042-111-000-400',
          email: 'support@trax.com.pk',
          is_active: false,
        },
      ]);
    } catch (error) {
      console.error('Failed to fetch shipping:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCompany = async () => {
    try {
      // API call here
      fetchShipping();
      setShowCompanyDialog(false);
      setCompanyForm({ name: '', code: '', tracking_url: '', phone: '', email: '' });
    } catch (error) {
      console.error('Failed to save company:', error);
    }
  };

  const handleEditCompany = (company: ShippingCompany) => {
    setSelectedCompany(company);
    setCompanyForm({
      name: company.name,
      code: company.code,
      tracking_url: company.tracking_url,
      phone: company.phone,
      email: company.email,
    });
    setShowCompanyDialog(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Shipping Management</h1>
          <p className="text-muted-foreground mt-1">Manage courier companies and shipping rates</p>
        </div>
        <Button onClick={() => setShowCompanyDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Courier
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="companies">Courier Companies</TabsTrigger>
          <TabsTrigger value="zones">Shipping Zones</TabsTrigger>
          <TabsTrigger value="rates">Shipping Rates</TabsTrigger>
        </TabsList>

        {/* Companies Tab */}
        <TabsContent value="companies" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {companies.map((company) => (
              <div key={company.id} className="bg-card rounded-lg border p-6 space-y-4">
                <div className="flex items-center gap-4">
                  <img src={company.logo} alt={company.name} className="w-12 h-12 rounded-md object-cover" />
                  <div>
                    <h3 className="font-semibold">{company.name}</h3>
                    <p className="text-sm text-muted-foreground">{company.code}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-muted-foreground" />
                    <span className="text-muted-foreground">Tracking:</span>
                    <span className="truncate">{company.tracking_url}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{company.phone}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <Badge variant={company.is_active ? 'default' : 'secondary'}>
                    {company.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditCompany(company)}>
                      <Edit className="w-3 h-3" />
                    </Button>
                    <Button size="sm" variant="outline">
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {/* Zones Tab */}
        <TabsContent value="zones">
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">Shipping zones configuration coming soon...</p>
          </div>
        </TabsContent>

        {/* Rates Tab */}
        <TabsContent value="rates">
          <div className="bg-card rounded-lg border p-6">
            <p className="text-muted-foreground">Shipping rates configuration coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>

      {/* Company Dialog */}
      <Dialog open={showCompanyDialog} onOpenChange={setShowCompanyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedCompany ? 'Edit Courier Company' : 'Add Courier Company'}
            </DialogTitle>
            <DialogDescription>
              {selectedCompany ? 'Update courier information' : 'Add a new courier company'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <Label>Company Name</Label>
              <Input
                value={companyForm.name}
                onChange={(e) => setCompanyForm({ ...companyForm, name: e.target.value })}
                placeholder="e.g., TCS"
              />
            </div>
            <div>
              <Label>Company Code</Label>
              <Input
                value={companyForm.code}
                onChange={(e) => setCompanyForm({ ...companyForm, code: e.target.value.toLowerCase() })}
                placeholder="e.g., tcs"
              />
            </div>
            <div>
              <Label>Tracking URL Template</Label>
              <Input
                value={companyForm.tracking_url}
                onChange={(e) => setCompanyForm({ ...companyForm, tracking_url: e.target.value })}
                placeholder="Use {tracking_number} as placeholder"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Phone</Label>
                <Input
                  value={companyForm.phone}
                  onChange={(e) => setCompanyForm({ ...companyForm, phone: e.target.value })}
                  placeholder="111-123-223"
                />
              </div>
              <div>
                <Label>Email</Label>
                <Input
                  type="email"
                  value={companyForm.email}
                  onChange={(e) => setCompanyForm({ ...companyForm, email: e.target.value })}
                  placeholder="support@company.com"
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCompanyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCompany}>
              {selectedCompany ? 'Update' : 'Create'} Company
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
