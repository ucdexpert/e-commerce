'use client';

import { useState } from 'react';
import { Save, Search, Globe, FileText, Image as ImageIcon, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import toast from 'react-hot-toast';

interface SEOData {
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_title: string;
  og_description: string;
  og_image: string;
  twitter_card: string;
  canonical_url: string;
  robots: string;
}

export default function SEOManagementPage() {
  const [seoData, setSeoData] = useState<SEOData>({
    meta_title: 'My E-Commerce Store - Best Products Online',
    meta_description: 'Shop the best products at affordable prices. Free shipping on orders over $50.',
    meta_keywords: 'ecommerce, online shopping, products, deals',
    og_title: 'My E-Commerce Store',
    og_description: 'Discover amazing products at great prices',
    og_image: 'https://via.placeholder.com/1200x630',
    twitter_card: 'summary_large_image',
    canonical_url: 'https://mystore.com',
    robots: 'index, follow',
  });

  const [productSEO, setProductSEO] = useState({
    id: 1,
    name: 'Premium Wireless Headphones',
    slug: 'premium-wireless-headphones',
    meta_title: '',
    meta_description: '',
  });

  const handleSave = () => {
    toast.success('SEO settings saved successfully!');
    console.log('Saving SEO:', seoData);
  };

  const handleProductSEO = () => {
    toast.success('Product SEO updated!');
  };

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">SEO Management</h1>
          <p className="text-muted-foreground mt-1">Optimize your store for search engines</p>
        </div>
        <Button onClick={handleSave}>
          <Save className="w-4 h-4 mr-2" />
          Save Changes
        </Button>
      </div>

      {/* SEO Score */}
      <Alert className="bg-green-50 border-green-200">
        <AlertDescription className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-600"></div>
            <span className="font-semibold">SEO Score: 85/100</span>
          </div>
          <span className="text-muted-foreground">- Good job! Meta tags are optimized</span>
        </AlertDescription>
      </Alert>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General SEO</TabsTrigger>
          <TabsTrigger value="product">Product SEO</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        {/* General SEO */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Meta Tags
              </CardTitle>
              <CardDescription>Basic SEO meta tags for your store</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Meta Title</Label>
                <Input
                  value={seoData.meta_title}
                  onChange={(e) => setSeoData({ ...seoData, meta_title: e.target.value })}
                  placeholder="Your store title"
                />
                <p className="text-xs text-muted-foreground">
                  {seoData.meta_title.length}/60 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Description</Label>
                <Textarea
                  value={seoData.meta_description}
                  onChange={(e) => setSeoData({ ...seoData, meta_description: e.target.value })}
                  placeholder="Your store description"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">
                  {seoData.meta_description.length}/160 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label>Meta Keywords</Label>
                <Input
                  value={seoData.meta_keywords}
                  onChange={(e) => setSeoData({ ...seoData, meta_keywords: e.target.value })}
                  placeholder="keyword1, keyword2, keyword3"
                />
                <p className="text-xs text-muted-foreground">Comma-separated keywords</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Robots & Canonical
              </CardTitle>
              <CardDescription>Search engine indexing settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Canonical URL</Label>
                <Input
                  value={seoData.canonical_url}
                  onChange={(e) => setSeoData({ ...seoData, canonical_url: e.target.value })}
                  placeholder="https://mystore.com"
                />
              </div>

              <div className="space-y-2">
                <Label>Robots Meta</Label>
                <select
                  value={seoData.robots}
                  onChange={(e) => setSeoData({ ...seoData, robots: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="index, follow">Index & Follow</option>
                  <option value="noindex, follow">No Index & Follow</option>
                  <option value="index, nofollow">Index & No Follow</option>
                  <option value="noindex, nofollow">No Index & No Follow</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Product SEO */}
        <TabsContent value="product" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Product SEO Editor
              </CardTitle>
              <CardDescription>Optimize individual product pages</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Search Product</Label>
                <Input placeholder="Search by product name..." />
              </div>

              <div className="border-t pt-4 space-y-4">
                <div className="space-y-2">
                  <Label>Product</Label>
                  <p className="font-medium">{productSEO.name}</p>
                </div>

                <div className="space-y-2">
                  <Label>URL Slug</Label>
                  <Input
                    value={productSEO.slug}
                    onChange={(e) => setProductSEO({ ...productSEO, slug: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Meta Title</Label>
                  <Input
                    value={productSEO.meta_title}
                    onChange={(e) => setProductSEO({ ...productSEO, meta_title: e.target.value })}
                    placeholder="Product meta title"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Meta Description</Label>
                  <Textarea
                    value={productSEO.meta_description}
                    onChange={(e) => setProductSEO({ ...productSEO, meta_description: e.target.value })}
                    placeholder="Product meta description"
                    rows={3}
                  />
                </div>

                <Button onClick={handleProductSEO} className="w-full">
                  Update Product SEO
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Open Graph (Facebook/LinkedIn)
              </CardTitle>
              <CardDescription>How your store appears on social media</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>OG Title</Label>
                <Input
                  value={seoData.og_title}
                  onChange={(e) => setSeoData({ ...seoData, og_title: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>OG Description</Label>
                <Textarea
                  value={seoData.og_description}
                  onChange={(e) => setSeoData({ ...seoData, og_description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>OG Image URL</Label>
                <Input
                  value={seoData.og_image}
                  onChange={(e) => setSeoData({ ...seoData, og_image: e.target.value })}
                />
                {seoData.og_image && (
                  <img
                    src={seoData.og_image}
                    alt="OG Preview"
                    className="w-full max-w-md rounded-lg border"
                  />
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Twitter Card
              </CardTitle>
              <CardDescription>Twitter card settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="space-y-2">
                <Label>Card Type</Label>
                <select
                  value={seoData.twitter_card}
                  onChange={(e) => setSeoData({ ...seoData, twitter_card: e.target.value })}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="summary_large_image">Large Image</option>
                  <option value="summary">Summary</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Advanced */}
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced SEO Settings</CardTitle>
              <CardDescription>Schema markup and more</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Custom Scripts (Head)</Label>
                <Textarea
                  placeholder="<script>...</script>"
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label>Schema.org JSON-LD</Label>
                <Textarea
                  placeholder='{"@context": "https://schema.org", ...}'
                  rows={5}
                  className="font-mono text-sm"
                />
              </div>

              <Alert>
                <AlertDescription>
                  Advanced settings are for developers. Incorrect configuration may break SEO.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
