import { db } from './db.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const IMAGES_DIR = path.join(__dirname, '../frontend/public/images');

const products = [
  {
    id: "kandla-grey-18-9m2-project-packs",
    name: "Kandla Grey Project Pack",
    slug: "kandla-grey-project-pack",
    category: "Sandstone",
    price: 353.00,
    stock: 53,
    size: "Project Pack 60 Pieces (Mixed Sizes)",
    description: "Premium Kandla Grey Sandstone Project Pack paving slabs feature cool blue-grey tones, straight hand-cut edges, and a consistent riven surface. One pack covers approximately 18.9 m².",
    images: [
      "/images/kandla-grey-18-9m2-project-packs/Kandla_grey_pp.jpg",
      "/images/kandla-grey-18-9m2-project-packs/Kandla_grey_pp_2.jpg"
    ],
    is_featured: true,
    stars: 4.9
  },
  {
    id: "kandla-grey-900x600x22mm",
    name: "Kandla Grey Single Size Pack",
    slug: "kandla-grey-single-size-pack",
    category: "Sandstone",
    price: 292.00,
    stock: 68,
    size: "900x600mm Pack 30 Pieces (Single Size)",
    description: "Kandla Grey Sandstone is the most popular garden paving material in the UK. Featuring cool blue-grey tones, straight hand-cut edges, and a consistent riven surface, it creates a clean, elegant look that coordinates with any garden layout. One pack covers approximately 17.0 m².",
    images: [
      "/images/kandla-grey-900x600x22mm/kandla-grey-900x600.png"
    ],
    is_featured: false,
    stars: 4.9
  },
  {
    id: "raj-green-18-9m2-project-packs",
    name: "Raj Green Project Pack",
    slug: "raj-green-project-pack",
    category: "Sandstone",
    price: 353.00,
    stock: 37,
    size: "Project Pack 60 Pieces (Mixed Sizes)",
    description: "Raj Green Sandstone paving flagstones mimic traditional English Yorkstone. With blended tones of green, grey, brown, and soft bronze, this robust paving handles wet conditions excellently and ages beautifully over time. One pack covers approximately 18.9 m².",
    images: [
      "/images/raj-green-18-9m2-project-packs/raj-green-sandstone.png"
    ],
    is_featured: true,
    stars: 4.9
  },
  {
    id: "raj-green-900x600x22mm",
    name: "Raj Green Single Size Pack",
    slug: "raj-green-single-size-pack",
    category: "Sandstone",
    price: 279.00,
    stock: 34,
    size: "900x600mm Pack 30 Pieces (Single Size)",
    description: "Raj Green Sandstone paving flagstones mimic traditional English Yorkstone. With blended tones of green, grey, brown, and soft bronze, this robust paving handles wet conditions excellently and ages beautifully over time. One pack covers approximately 17.0 m².",
    images: [
      "/images/raj-green-900x600x22mm/raj-green-900x600.png"
    ],
    is_featured: false,
    stars: 4.9
  },
  {
    id: "rippon-buff-18-9m2-project-packs",
    name: "Rippon Buff Project Pack",
    slug: "rippon-buff-project-pack",
    category: "Sandstone",
    price: 353.00,
    stock: 25,
    size: "Project Pack 60 Pieces (Mixed Sizes)",
    description: "Rippon Buff Sandstone paving slabs present warm peach, cream, pink, and orange swirls over a light sandstone base. Features sawn edges and a hand-cut, split finish that catches the light wonderfully. One pack covers approximately 18.9 m².",
    images: [
      "/images/rippon-buff-18-9m2-project-packs/Rippon_Buff_pp_1.jpg",
      "/images/rippon-buff-18-9m2-project-packs/Rippon_Buff_pp_2.jpg"
    ],
    is_featured: false,
    stars: 4.8
  },
  {
    id: "rippon-buff-900x600x22mm",
    name: "Rippon Buff Single Size Pack",
    slug: "rippon-buff-single-size-pack",
    category: "Sandstone",
    price: 279.00,
    stock: 11,
    size: "900x600mm Pack 30 Pieces (Single Size)",
    description: "Rippon Buff Sandstone paving slabs present warm peach, cream, pink, and orange swirls over a light sandstone base. Features sawn edges and a hand-cut, split finish that catches the light wonderfully. One pack covers approximately 17.0 m².",
    images: [
      "/images/rippon-buff-900x600x22mm/rippon-buff-900x600.png"
    ],
    is_featured: false,
    stars: 4.8
  },
  {
    id: "autumn-brown-18-9m2-project-packs",
    name: "Autumn Brown Project Pack",
    slug: "autumn-brown-project-pack",
    category: "Sandstone",
    price: 353.00,
    stock: 1,
    size: "Project Pack 60 Pieces (Mixed Sizes)",
    description: "Premium Autumn Brown Indian Sandstone paving slabs are ideal for classic garden patios. Exhibiting warm brown tones mixed with hints of plum, grey, and ochre, this traditional paving stone provides a natural, hand-cut finish and calibrated thickness. One pack covers approximately 18.9 m².",
    images: [
      "/images/autumn-brown-18-9m2-project-packs/Autumn_Brown_pp_1.jpg",
      "/images/autumn-brown-18-9m2-project-packs/Autumn_Brown_pp_2.jpg",
      "/images/autumn-brown-18-9m2-project-packs/Autumn_Brown_pp_3.jpg"
    ],
    is_featured: true,
    stars: 4.8
  },

  {
    id: "county-anthracite-900x600x20mm",
    name: "County Anthracite Porcelain Slabs",
    slug: "county-anthracite-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 16,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "County Anthracite Porcelain offers a sleek, ultra-modern dark grey finish with a refined textured surface. High-grade porcelain paving slabs from JMD present low water absorption, stain resistance, and are completely frost-proof. One pack covers approximately 21.3 m².",
    images: [
      "/images/county-anthracite-900x600x20mm/Country_Anthracite.jpg",
      "/images/county-anthracite-900x600x20mm/Country_anthracite_2.jpg",
      "/images/county-anthracite-900x600x20mm/county-anthracite.png"
    ],
    is_featured: true,
    stars: 4.9
  },
  {
    id: "hammer-stone-grey-900x600x20mm",
    name: "Hammer Stone Grey Porcelain Slabs",
    slug: "hammer-stone-grey-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 10,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "Hammer Stone Grey Porcelain paving slabs deliver a luxurious textured grey feel. Offering exceptional durability and clean lines, this product is ideal for transforming patios, pathways, and indoor-outdoor living spaces. One pack covers approximately 21.3 m².",
    images: [
      "/images/hammer-stone-grey-900x600x20mm/hammer-stone-grey.png"
    ],
    is_featured: false,
    stars: 4.8
  },
  {
    id: "mountain-white-900x600x20mm",
    name: "Mountain White Porcelain Slabs",
    slug: "mountain-white-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 2,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "Mountain White Porcelain paving slabs bring crisp, luminous bright white tones to gardens and patios. These high-grade ceramic tiles reflect light beautifully and possess an R11 anti-slip safety rating. One pack covers approximately 21.3 m².",
    images: [
      "/images/mountain-white-900x600x20mm/Mountain_White_1.jpg",
      "/images/mountain-white-900x600x20mm/Mountain_White_2.jpg",
      "/images/mountain-white-900x600x20mm/Mountain_White_3.jpg",
      "/images/mountain-white-900x600x20mm/mountain-white.png"
    ],
    is_featured: false,
    stars: 4.7
  },
  {
    id: "earth-core-grey-900x600x20mm",
    name: "Earth Core Grey Porcelain Slabs",
    slug: "earth-core-grey-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 3,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "Earth Core Grey Porcelain paving captures the natural beauty of stone while delivering the strength of premium engineered porcelain. Straight cut edges allow for minimal grout lines for a smooth, high-end look. One pack covers approximately 21.3 m².",
    images: [
      "/images/earth-core-grey-900x600x20mm/Earth_core_1.jpg",
      "/images/earth-core-grey-900x600x20mm/Earth_Core_2.jpg",
      "/images/earth-core-grey-900x600x20mm/earth-core-grey.png"
    ],
    is_featured: true,
    stars: 4.8
  },
  {
    id: "quartz-light-grey-900x600x20mm",
    name: "Quartz Light Grey Porcelain Slabs",
    slug: "quartz-light-grey-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 21,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "Quartz Light Grey Porcelain paving slabs mimic the speckled aggregate texture of natural granite. Stain-proof, scratch-resistant, and offering exceptional slip resistance, this paving is built to survive heavy footfall. One pack covers approximately 21.3 m².",
    images: [
      "/images/quartz-light-grey-900x600x20mm/Quartz_light_grey_!.jpg",
      "/images/quartz-light-grey-900x600x20mm/Quartz_light_grey_2.jpg",
      "/images/quartz-light-grey-900x600x20mm/quartz-light-grey.png"
    ],
    is_featured: false,
    stars: 4.8
  },
  {
    id: "kandla-grey-900x600x20mm",
    name: "Kandla Grey Porcelain Slabs",
    slug: "kandla-grey-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 34,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "Kandla Grey Porcelain captures the contemporary light-grey aesthetic of natural sandstone but with the maintenance-free benefit of engineered vitrified tiles. Extremely resistant to algae, dirt, and stains. One pack covers approximately 21.3 m².",
    images: [
      "/images/kandla-grey-900x600x20mm/Kandla_grey_porcelain.jpg",
      "/images/kandla-grey-900x600x20mm/Kandla_grey_porcelain_2.jpg",
      "/images/kandla-grey-900x600x20mm/Kandla_grey_porcelain_3.jpg",
      "/images/kandla-grey-900x600x20mm/kandla-grey-porcelain.png"
    ],
    is_featured: false,
    stars: 4.8
  },
  {
    id: "quartz-white-900x600x20mm",
    name: "Quartz White Porcelain Slabs",
    slug: "quartz-white-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 35,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "Quartz White Porcelain provides a pristine, hish-brightness paving surface. Exhibiting extremely subtle grey speckles, it is the perfect flooring choice for high-contrast architectural patio spaces. One pack covers approximately 21.3 m².",
    images: [
      "/images/quartz-white-900x600x20mm/Quartz_White.jpg",
      "/images/quartz-white-900x600x20mm/Quartz_White_1.jpg",
      "/images/quartz-white-900x600x20mm/Quartz_White_2.jpg",
      "/images/quartz-white-900x600x20mm/quartz-white-porcelain.png"
    ],
    is_featured: false,
    stars: 4.6
  },
  {
    id: "persia-beige-900x600x20mm",
    name: "Persia Beige Porcelain Slabs",
    slug: "persia-beige-porcelain-slabs",
    category: "Porcelain",
    price: 360.00,
    stock: 3,
    size: "900x600mm Pack 38 Pieces (Single Size)",
    description: "Persia Beige Porcelain slabs represent the height of outdoor luxury. Emulating premium ivory travertine with warm cream hues, it provides a bright, sprawling Mediterranean look for residential garden patios. One pack covers approximately 21.3 m².",
    images: [
      "/images/persia-beige-900x600x20mm/Persia_Beige_1.jpg",
      "/images/persia-beige-900x600x20mm/Persia_Beige_2.jpg",
      "/images/persia-beige-900x600x20mm/Persia_Beige_3.jpg",
      "/images/persia-beige-900x600x20mm/persia-beige.jpg"
    ],
    is_featured: true,
    stars: 4.9
  },
  {
    id: "smeed-dean-yellow",
    name: "Smeed Dean Yellow",
    slug: "smeed-dean-yellow",
    category: "Bricks",
    price: 275.00,
    stock: 90,
    size: "360 Bricks 230x110x68mm",
    description: "Smeed Yellow Dean Bricks from India are traditionally crafted handmade bricks, recognized for their warm yellow tone and refined finish. They are a popular choice for architectural projects that require a classic yet elegant appearance. Perfect for facades, restoration work, and decorative applications, these bricks offer durability, character, and a distinctive charm that enhances any structure.",
    images: [
      "/images/smeed-dean-yellow/primary.png"
    ],
    is_featured: false,
    stars: 4.8
  },
  {
    id: "smeed-dean-yellow-multi",
    name: "Smeed Dean Yellow Multi",
    slug: "smeed-dean-yellow-multi",
    category: "Bricks",
    price: 295.00,
    stock: 45,
    size: "30 Pieces 228-232x108-112x68-70mm",
    description: "Smeed Dean Yellow Multi Bricks from India are handcrafted clay bricks known for their rich yellow tones with natural variations, adding warmth and character to any build. Their distinctive appearance makes them a popular choice for facades, restoration projects, and feature walls. Durable and versatile, these bricks blend traditional craftsmanship with lasting strength, enhancing both classic and modern designs.",
    images: [
      "/images/smeed-dean-yellow-multi/primary.png"
    ],
    is_featured: false,
    stars: 4.8
  }
];

async function seed() {
  console.log('Seeding the 16 JMD products with clean names and dynamic primary image ordering...');
  try {
    const flatProducts = products.map(p => {
      let imagesList = [...p.images];
      const folderPath = path.join(IMAGES_DIR, p.id);
      
      if (fs.existsSync(folderPath)) {
        const files = fs.readdirSync(folderPath);
        const imageFiles = files.filter(f => {
          const ext = path.extname(f).toLowerCase();
          return ext === '.png' || ext === '.jpg' || ext === '.jpeg';
        });
        
        if (imageFiles.length > 0) {
          const primaryImg = imageFiles.find(f => f.toLowerCase() === 'primary.png');
          const others = imageFiles.filter(f => f.toLowerCase() !== 'primary.png').sort();
          
          let sortedFiles = [];
          if (primaryImg) {
            sortedFiles = [primaryImg, ...others];
          } else {
            // Find other cover images if no primary.png, or use default sorting
            sortedFiles = imageFiles.sort((a, b) => {
              // If a has a specific name like "cover" or the first image in array, rank it higher
              const aCover = a.toLowerCase().includes('cover') || a.toLowerCase().includes('porcelain') || a.toLowerCase().includes('beige') || a.toLowerCase().includes('white') || a.toLowerCase().includes('grey');
              const bCover = b.toLowerCase().includes('cover') || b.toLowerCase().includes('porcelain') || b.toLowerCase().includes('beige') || b.toLowerCase().includes('white') || b.toLowerCase().includes('grey');
              if (aCover && !bCover) return -1;
              if (!aCover && bCover) return 1;
              return a.localeCompare(b);
            });
          }
          
          imagesList = sortedFiles.map(f => `/images/${p.id}/${f}`);
        }
      }
      
      return {
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        price: p.price,
        stock: p.stock,
        size: p.size,
        description: p.description,
        images: imagesList,
        is_featured: p.is_featured,
        stars: p.stars,
        seo_title: `${p.name} | JMD Global Stones`,
        seo_description: p.description.substring(0, 150),
        variant_group_id: p.id.split('-18-')[0].split('-900x')[0],
        created_at: new Date().toISOString()
      };
    });

    await db.saveProducts(flatProducts);
    console.log(`✅ Seeded ${flatProducts.length} clean products into database stores with custom images.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

seed();
