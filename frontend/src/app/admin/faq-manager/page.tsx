'use client';

import { useState } from 'react';
import { Plus, Edit, Trash2, ChevronDown, ChevronUp, Search, GripVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import toast from 'react-hot-toast';

interface FAQ {
  id: number;
  question: string;
  answer: string;
  category: string;
  order: number;
  is_active: boolean;
  views: number;
}

const categories = ['General', 'Shipping', 'Returns', 'Payment', 'Products', 'Account'];

export default function FAQManagerPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: 1,
      question: 'What is your return policy?',
      answer: 'We offer a 30-day return policy for all unused items in original packaging.',
      category: 'Returns',
      order: 1,
      is_active: true,
      views: 234,
    },
    {
      id: 2,
      question: 'How long does shipping take?',
      answer: 'Standard shipping takes 3-5 business days. Express shipping is 1-2 business days.',
      category: 'Shipping',
      order: 2,
      is_active: true,
      views: 189,
    },
  ]);

  const [showDialog, setShowDialog] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'General',
    is_active: true,
  });

  const handleSave = () => {
    if (editingFaq) {
      setFaqs(faqs.map(f => f.id === editingFaq.id ? { ...f, ...formData } : f));
      toast.success('FAQ updated successfully!');
    } else {
      const newFaq: FAQ = {
        id: Date.now(),
        ...formData,
        order: faqs.length + 1,
        views: 0,
      };
      setFaqs([...faqs, newFaq]);
      toast.success('FAQ created successfully!');
    }
    setShowDialog(false);
    setEditingFaq(null);
    setFormData({ question: '', answer: '', category: 'General', is_active: true });
  };

  const handleEdit = (faq: FAQ) => {
    setEditingFaq(faq);
    setFormData({
      question: faq.question,
      answer: faq.answer,
      category: faq.category,
      is_active: faq.is_active,
    });
    setShowDialog(true);
  };

  const handleDelete = (id: number) => {
    setFaqs(faqs.filter(f => f.id !== id));
    toast.success('FAQ deleted successfully!');
  };

  const handleToggleActive = (id: number) => {
    setFaqs(faqs.map(f => f.id === id ? { ...f, is_active: !f.is_active } : f));
  };

  const filteredFaqs = faqs.filter(faq => {
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || faq.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">FAQ Manager</h1>
          <p className="text-muted-foreground mt-1">Manage frequently asked questions</p>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add FAQ
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border rounded-md bg-background"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total FAQs</CardDescription>
            <CardTitle className="text-3xl">{faqs.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active</CardDescription>
            <CardTitle className="text-3xl text-green-600">{faqs.filter(f => f.is_active).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Inactive</CardDescription>
            <CardTitle className="text-3xl text-red-600">{faqs.filter(f => !f.is_active).length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Total Views</CardDescription>
            <CardTitle className="text-3xl">{faqs.reduce((sum, f) => sum + f.views, 0)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filteredFaqs.map((faq) => (
          <Card key={faq.id} className={!faq.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">{faq.category}</Badge>
                    <Badge variant={faq.is_active ? 'default' : 'secondary'}>
                      {faq.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{faq.views} views</span>
                  </div>
                  <button
                    onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                    className="text-left hover:underline"
                  >
                    <h3 className="font-semibold text-lg flex items-center gap-2">
                      {expandedFaq === faq.id ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                      {faq.question}
                    </h3>
                  </button>
                  {expandedFaq === faq.id && (
                    <p className="mt-3 text-muted-foreground pl-6">{faq.answer}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={faq.is_active}
                    onCheckedChange={() => handleToggleActive(faq.id)}
                  />
                  <Button size="sm" variant="outline" onClick={() => handleEdit(faq)}>
                    <Edit className="w-3 h-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(faq.id)}
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingFaq ? 'Edit FAQ' : 'Add New FAQ'}
            </DialogTitle>
            <DialogDescription>
              {editingFaq ? 'Update FAQ information' : 'Create a new FAQ'}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Question</Label>
              <Textarea
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                placeholder="What is your return policy?"
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>Answer</Label>
              <Textarea
                value={formData.answer}
                onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                placeholder="We offer a 30-day return policy..."
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full p-2 border rounded-md"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center justify-between">
              <Label>Active</Label>
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              {editingFaq ? 'Update' : 'Create'} FAQ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
