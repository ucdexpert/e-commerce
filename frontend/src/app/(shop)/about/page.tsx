'use client';

import { Package, Truck, Headphones, RotateCcw, TrendingUp, Users, Award } from 'lucide-react';

export default function AboutUsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Welcome to E-Shop
          </h1>
          <p className="text-xl md:text-2xl text-white/90 max-w-2xl mx-auto">
            Your trusted online shopping destination for quality products at unbeatable prices
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Our Story</h2>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              Founded in 2024, E-Shop started with a simple mission: to make quality products 
              accessible to everyone at affordable prices. What began as a small online store 
              has grown into a thriving e-commerce platform serving thousands of satisfied customers.
            </p>
            <p className="text-lg text-gray-600 leading-relaxed">
              We believe in transparency, quality, and exceptional customer service. Every product 
              in our store is carefully selected to meet our high standards, and we stand behind 
              every purchase with our satisfaction guarantee.
            </p>
          </div>
        </div>
      </section>

      {/* Why Choose Us */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Why Choose E-Shop?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Package className="w-8 h-8" />}
              title="Quality Products"
              description="Every item is carefully selected and inspected to ensure it meets our quality standards."
              color="bg-blue-500"
            />
            <FeatureCard
              icon={<Truck className="w-8 h-8" />}
              title="Fast Delivery"
              description="Free shipping on orders over $100. Express delivery available for urgent orders."
              color="bg-green-500"
            />
            <FeatureCard
              icon={<Headphones className="w-8 h-8" />}
              title="24/7 Support"
              description="Our customer support team is always ready to help you with any questions or concerns."
              color="bg-purple-500"
            />
            <FeatureCard
              icon={<RotateCcw className="w-8 h-8" />}
              title="Easy Returns"
              description="30-day hassle-free return policy. If you're not satisfied, we'll make it right."
              color="bg-amber-500"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">Our Growth</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <StatCard
              icon={<Package className="w-10 h-10" />}
              value="10,000+"
              label="Products Available"
              color="text-blue-600"
            />
            <StatCard
              icon={<Users className="w-10 h-10" />}
              value="50,000+"
              label="Happy Customers"
              color="text-green-600"
            />
            <StatCard
              icon={<Award className="w-10 h-10" />}
              value="5+"
              label="Years of Excellence"
              color="text-purple-600"
            />
          </div>
        </div>
      </section>

      {/* Team Section (Optional) */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-4">Our Values</h2>
          <p className="text-lg text-gray-600 text-center max-w-2xl mx-auto mb-12">
            The principles that guide everything we do
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <ValueCard
              title="Customer First"
              description="Your satisfaction is our top priority. We go above and beyond to ensure you have the best shopping experience."
            />
            <ValueCard
              title="Integrity"
              description="We believe in honest pricing, accurate product descriptions, and transparent business practices."
            />
            <ValueCard
              title="Innovation"
              description="We continuously improve our platform and services to provide you with the latest features and convenience."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary to-secondary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Shopping?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of satisfied customers and discover amazing products at great prices.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="px-8 py-4 bg-white text-primary font-semibold rounded-xl hover:bg-gray-100 transition-colors shadow-lg"
            >
              Browse Products
            </a>
            <a
              href="/contact"
              className="px-8 py-4 bg-transparent border-2 border-white text-white font-semibold rounded-xl hover:bg-white/10 transition-colors"
            >
              Contact Us
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ 
  icon, 
  title, 
  description, 
  color 
}: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  color: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
      <div className={`${color} w-16 h-16 rounded-xl flex items-center justify-center text-white mb-6`}>
        {icon}
      </div>
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}

function StatCard({ 
  icon, 
  value, 
  label, 
  color 
}: { 
  icon: React.ReactNode; 
  value: string; 
  label: string; 
  color: string;
}) {
  return (
    <div className="text-center">
      <div className={`${color} w-20 h-20 rounded-full flex items-center justify-center text-white mx-auto mb-4`}>
        {icon}
      </div>
      <p className="text-4xl font-bold text-gray-900 mb-2">{value}</p>
      <p className="text-gray-600">{label}</p>
    </div>
  );
}

function ValueCard({ title, description }: { title: string; description: string }) {
  return (
    <div className="bg-white rounded-2xl p-8 shadow-md">
      <h3 className="text-xl font-bold text-gray-900 mb-3">{title}</h3>
      <p className="text-gray-600 leading-relaxed">{description}</p>
    </div>
  );
}
