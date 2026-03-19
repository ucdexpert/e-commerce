import { Metadata } from 'next';

export async function generateMetadata({ 
    params 
}: { 
    params: { slug: string } 
}): Promise<Metadata> {
    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/products/slug/${params.slug}`,
            { cache: 'no-store' }
        );
        
        if (!response.ok) {
            return {
                title: 'Product Not Found | E-Shop',
                description: 'The requested product could not be found'
            };
        }

        const product = await response.json();
        
        const description = product.description?.slice(0, 155) || 
            product.short_description?.slice(0, 155) ||
            'Shop quality products at E-Shop';

        const keywords = [
            product.name,
            product.categories?.[0]?.name,
            'buy online',
            'Pakistan',
            'E-Shop'
        ].filter(Boolean);

        return {
            title: `${product.name} | E-Shop`,
            description: description,
            keywords: keywords,
            authors: [{ name: 'E-Shop' }],
            openGraph: {
                title: product.name,
                description: description,
                url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://e-commerce-mu-wheat-87.vercel.app'}/products/${product.slug}`,
                type: 'product',
                siteName: 'E-Shop',
                images: product.images?.[0] ? 
                    [{
                        url: product.images[0],
                        alt: product.name,
                        width: 1200,
                        height: 630
                    }] : [],
            },
            twitter: {
                card: 'summary_large_image',
                title: product.name,
                description: description,
                images: product.images?.[0] ? 
                    [product.images[0]] : [],
                creator: '@eshop',
            },
            robots: {
                index: true,
                follow: true,
                googleBot: {
                    index: true,
                    follow: true,
                    'max-video-preview': -1,
                    'max-image-preview': 'large',
                    'max-snippet': -1,
                },
            },
        };
    } catch (error) {
        console.error('Error fetching product metadata:', error);
        return {
            title: 'Product | E-Shop',
            description: 'Shop quality products at E-Shop'
        };
    }
}
