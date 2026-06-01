'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import { SiteSettings, defaultSiteSettings } from '@/lib/site-settings';
import { useAuth } from '@/context/auth-context';

interface AccountSettings {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [accountSettings, setAccountSettings] = useState<AccountSettings>({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [siteSettings, setSiteSettings] = useState<SiteSettings>(defaultSiteSettings);
  const [siteLoading, setSiteLoading] = useState(true);

  const [accountChanges, setAccountChanges] = useState(false);
  const [siteChanges, setSiteChanges] = useState(false);
  const [loading, setLoading] = useState(false);

  const { toast } = useToast();

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await fetch('/api/site-settings');
        const data = await response.json();
        setSiteSettings(data ?? defaultSiteSettings);
      } catch {
        toast({
          title: 'Unable to load site settings',
          description: 'Please refresh the page and try again.',
        });
      } finally {
        setSiteLoading(false);
      }
    };

    loadSettings();
  }, [toast]);

  useEffect(() => {
    if (user?.email) {
      setAccountSettings(prev => ({ ...prev, email: user.email ?? '' }));
    }
  }, [user?.email]);

  const handleAccountChange = (field: keyof AccountSettings, value: string) => {
    setAccountSettings(prev => ({ ...prev, [field]: value }));
    setAccountChanges(true);
  };

  const handleSiteChange = (field: keyof SiteSettings, value: string | number | boolean) => {
    setSiteSettings(prev => ({ ...prev, [field]: value }));
    setSiteChanges(true);
  };

  // Business name & phone live in site_settings but are edited from the Account tab.
  const handleBusinessChange = (field: 'businessName' | 'phone', value: string) => {
    setSiteSettings(prev => ({ ...prev, [field]: value }));
    setAccountChanges(true);
  };

  const handleSaveAccountSettings = async () => {
    const { newPassword, confirmPassword, currentPassword, email } = accountSettings;

    if (newPassword && newPassword !== confirmPassword) {
      toast({
        title: 'Passwords do not match',
        description: 'Please make sure the new password and confirmation are identical.',
      });
      return;
    }

    setLoading(true);
    try {
      // 1. Update login credentials (email / password) if they changed.
      const wantsCredentialChange = Boolean(newPassword) || email !== (user?.email ?? '');
      if (wantsCredentialChange) {
        const res = await fetch('/api/auth/update-account', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, currentPassword, newPassword }),
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data?.error || 'Unable to update account.');
        }
      }

      // 2. Persist business name & phone (stored in site_settings).
      const siteRes = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(siteSettings),
      });
      const siteData = await siteRes.json();
      if (!siteRes.ok) {
        throw new Error(siteData?.error || 'Unable to update business details.');
      }
      setSiteSettings(siteData);

      setAccountSettings(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      }));
      setAccountChanges(false);
      toast({
        title: 'Account updated',
        description: 'Your account details have been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save account details.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSiteSettings = async () => {
    setLoading(true);

    try {
      const response = await fetch('/api/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(siteSettings),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || 'Unable to save site settings.');
      }

      setSiteSettings(data);
      setSiteChanges(false);
      toast({
        title: 'Site settings updated',
        description: 'Your site information has been saved successfully.',
      });
    } catch (error) {
      toast({
        title: 'Save failed',
        description: error instanceof Error ? error.message : 'Failed to save settings.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto">
          <TabsTrigger value="account">Account</TabsTrigger>
          <TabsTrigger value="site">Site Settings</TabsTrigger>
        </TabsList>

        {/* Account Settings Tab */}
        <TabsContent value="account" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Business Information</CardTitle>
              <CardDescription>Update your business details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input
                    id="businessName"
                    value={siteSettings.businessName}
                    onChange={(e) => handleBusinessChange('businessName', e.target.value)}
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Login Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={accountSettings.email}
                    onChange={(e) => handleAccountChange('email', e.target.value)}
                    placeholder="admin@example.com"
                  />
                  <p className="text-xs text-slate-400 mt-1">
                    Changing this requires your current password and an email confirmation.
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={siteSettings.phone}
                  onChange={(e) => handleBusinessChange('phone', e.target.value)}
                  placeholder="+234 800 123 4567"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your login password</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Current Password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={accountSettings.currentPassword}
                  onChange={(e) => handleAccountChange('currentPassword', e.target.value)}
                  placeholder="••••••••"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={accountSettings.newPassword}
                    onChange={(e) => handleAccountChange('newPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={accountSettings.confirmPassword}
                    onChange={(e) => handleAccountChange('confirmPassword', e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {accountChanges && (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveAccountSettings}
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-500"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setAccountChanges(false)}
              >
                Cancel
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Site Settings Tab */}
        <TabsContent value="site" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Site Information</CardTitle>
              <CardDescription>Configure your website details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="siteTitle">Site Title</Label>
                <Input
                  id="siteTitle"
                  value={siteSettings.siteTitle}
                  onChange={(e) => handleSiteChange('siteTitle', e.target.value)}
                  placeholder="Your site title"
                />
              </div>
              <div>
                <Label htmlFor="siteDescription">Site Description</Label>
                <Textarea
                  id="siteDescription"
                  value={siteSettings.siteDescription}
                  onChange={(e) => handleSiteChange('siteDescription', e.target.value)}
                  placeholder="Short description of your business"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Business Address</CardTitle>
              <CardDescription>Your physical location</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  value={siteSettings.address}
                  onChange={(e) => handleSiteChange('address', e.target.value)}
                  placeholder="123 Main Street"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={siteSettings.city}
                    onChange={(e) => handleSiteChange('city', e.target.value)}
                    placeholder="Lagos"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={siteSettings.state}
                    onChange={(e) => handleSiteChange('state', e.target.value)}
                    placeholder="Lagos State"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    value={siteSettings.zipCode}
                    onChange={(e) => handleSiteChange('zipCode', e.target.value)}
                    placeholder="12345"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Operating Hours & Delivery</CardTitle>
              <CardDescription>Set your business hours and delivery settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="openingTime">Opening Time</Label>
                  <Input
                    id="openingTime"
                    type="time"
                    value={siteSettings.openingTime}
                    onChange={(e) => handleSiteChange('openingTime', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="closingTime">Closing Time</Label>
                  <Input
                    id="closingTime"
                    type="time"
                    value={siteSettings.closingTime}
                    onChange={(e) => handleSiteChange('closingTime', e.target.value)}
                  />
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="deliveryFee">Delivery Fee (₦)</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    value={siteSettings.deliveryFee}
                    onChange={(e) => handleSiteChange('deliveryFee', Number(e.target.value))}
                    placeholder="2000"
                  />
                </div>
                <div>
                  <Label htmlFor="minimumOrder">Minimum Order (₦)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    value={siteSettings.minimumOrder}
                    onChange={(e) => handleSiteChange('minimumOrder', Number(e.target.value))}
                    placeholder="10000"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Bank / Payment Details</CardTitle>
              <CardDescription>
                Shown to customers at checkout for bank transfers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={siteSettings.bankName}
                  onChange={(e) => handleSiteChange('bankName', e.target.value)}
                  placeholder="e.g. OPay, GTBank, Access Bank"
                />
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="accountName">Account Name</Label>
                  <Input
                    id="accountName"
                    value={siteSettings.accountName}
                    onChange={(e) => handleSiteChange('accountName', e.target.value)}
                    placeholder="Account holder name"
                  />
                </div>
                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    inputMode="numeric"
                    value={siteSettings.accountNumber}
                    onChange={(e) => handleSiteChange('accountNumber', e.target.value)}
                    placeholder="0123456789"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Maintenance Mode</CardTitle>
              <CardDescription>Take your site offline for maintenance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Enable Maintenance Mode</Label>
                  <p className="text-sm text-slate-500 mt-1">Customers won't be able to place orders</p>
                </div>
                <Switch
                  checked={siteSettings.maintenanceMode}
                  onCheckedChange={(checked) => handleSiteChange('maintenanceMode', checked)}
                />
              </div>
              {siteSettings.maintenanceMode && (
                <div>
                  <Label htmlFor="maintenanceMessage">Maintenance Message</Label>
                  <Textarea
                    id="maintenanceMessage"
                    value={siteSettings.maintenanceMessage}
                    onChange={(e) => handleSiteChange('maintenanceMessage', e.target.value)}
                    placeholder="Customers will see this message"
                    rows={3}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          {siteChanges && (
            <div className="flex gap-2">
              <Button
                onClick={handleSaveSiteSettings}
                disabled={loading}
                className="gap-2 bg-gradient-to-r from-orange-500 to-red-500"
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setSiteChanges(false)}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-900">
                <AlertTriangle className="h-5 w-5" />
                Danger Zone
              </CardTitle>
            </CardHeader>
            <CardContent>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">Clear All Data</Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Data?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all menu items, orders, and settings. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction className="bg-red-600">
                    Delete Everything
                  </AlertDialogAction>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}
