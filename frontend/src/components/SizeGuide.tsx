'use client';

import { useState } from 'react';
import { X, Ruler, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface SizeGuideProps {
  category?: 'clothing' | 'shoes' | 'accessories';
}

interface SizeChart {
  size: string;
  chest?: string;
  waist?: string;
  hips?: string;
  length?: string;
  us?: string;
  uk?: string;
  eu?: string;
  cm?: string;
}

const clothingSizes: SizeChart[] = [
  { size: 'XS', chest: '30-32"', waist: '24-26"', hips: '32-34"', length: '25"' },
  { size: 'S', chest: '32-34"', waist: '26-28"', hips: '34-36"', length: '26"' },
  { size: 'M', chest: '34-36"', waist: '28-30"', hips: '36-38"', length: '27"' },
  { size: 'L', chest: '36-38"', waist: '30-32"', hips: '38-40"', length: '28"' },
  { size: 'XL', chest: '38-40"', waist: '32-34"', hips: '40-42"', length: '29"' },
  { size: '2XL', chest: '40-42"', waist: '34-36"', hips: '42-44"', length: '30"' },
];

const shoeSizes: SizeChart[] = [
  { size: 'US 6', us: '6', uk: '4', eu: '36', cm: '22' },
  { size: 'US 7', us: '7', uk: '5', eu: '37', cm: '23' },
  { size: 'US 8', us: '8', uk: '6', eu: '38', cm: '24' },
  { size: 'US 9', us: '9', uk: '7', eu: '39', cm: '25' },
  { size: 'US 10', us: '10', uk: '8', eu: '40', cm: '26' },
  { size: 'US 11', us: '11', uk: '9', eu: '41', cm: '27' },
  { size: 'US 12', us: '12', uk: '10', eu: '42', cm: '28' },
];

export function SizeGuide({ category = 'clothing' }: SizeGuideProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState(category);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Ruler className="w-4 h-4" />
          Size Guide
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Ruler className="w-5 h-5" />
            Size Guide
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="clothing">Clothing</TabsTrigger>
            <TabsTrigger value="shoes">Shoes</TabsTrigger>
          </TabsList>

          {/* Clothing Size Chart */}
          <TabsContent value="clothing" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">How to Measure</p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• <strong>Chest:</strong> Measure around the fullest part of your chest</li>
                    <li>• <strong>Waist:</strong> Measure around your natural waistline</li>
                    <li>• <strong>Hips:</strong> Measure around the fullest part of your hips</li>
                    <li>• <strong>Length:</strong> Measure from shoulder to hem</li>
                  </ul>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Size</TableHead>
                  <TableHead>Chest</TableHead>
                  <TableHead>Waist</TableHead>
                  <TableHead>Hips</TableHead>
                  <TableHead>Length</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clothingSizes.map((row) => (
                  <TableRow key={row.size}>
                    <TableCell className="font-semibold">{row.size}</TableCell>
                    <TableCell>{row.chest}</TableCell>
                    <TableCell>{row.waist}</TableCell>
                    <TableCell>{row.hips}</TableCell>
                    <TableCell>{row.length}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Fitting Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• For a looser fit, size up</li>
                  <li>• For a tighter fit, size down</li>
                  <li>• Check fabric composition</li>
                  <li>• Some materials may shrink</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">International Sizes</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• US XS = EU 34</li>
                  <li>• US S = EU 36</li>
                  <li>• US M = EU 38</li>
                  <li>• US L = EU 40</li>
                </ul>
              </div>
            </div>
          </TabsContent>

          {/* Shoes Size Chart */}
          <TabsContent value="shoes" className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-start gap-2">
                <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-900">How to Measure Your Foot</p>
                  <ul className="text-sm text-blue-700 mt-2 space-y-1">
                    <li>• Place foot on a piece of paper</li>
                    <li>• Mark the heel and longest toe</li>
                    <li>• Measure the distance in cm</li>
                    <li>• Measure both feet and use the larger measurement</li>
                  </ul>
                </div>
              </div>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>US Size</TableHead>
                  <TableHead>UK Size</TableHead>
                  <TableHead>EU Size</TableHead>
                  <TableHead>Foot Length (cm)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shoeSizes.map((row) => (
                  <TableRow key={row.size}>
                    <TableCell className="font-semibold">{row.us}</TableCell>
                    <TableCell>{row.uk}</TableCell>
                    <TableCell>{row.eu}</TableCell>
                    <TableCell>{row.cm}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Shoe Fitting Tips</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Measure feet at the end of the day</li>
                  <li>• Wear the socks you'll use with the shoes</li>
                  <li>• Allow thumb's width of space</li>
                  <li>• Walk around to test comfort</li>
                </ul>
              </div>
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Width Guide</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• B = Narrow</li>
                  <li>• D = Medium (Standard)</li>
                  <li>• E = Wide</li>
                  <li>• 2E = Extra Wide</li>
                </ul>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-6 flex justify-end">
          <Button onClick={() => setOpen(false)}>
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default SizeGuide;
