import { db } from './db.js';

const products = [
  {
    id: "prod-1",
    name: "Autumn Brown Indian Sandstone Paving Slabs",
    slug: "autumn-brown-indian-sandstone-paving-slabs",
    category: "Sandstone",
    price: 279.00,
    description: "Premium Autumn Brown Indian Sandstone paving slabs are ideal for classic garden patios. Exhibiting warm brown tones mixed with hints of plum, grey, and ochre, this traditional paving stone provides a natural, hand-cut finish and calibrated thickness.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/AB-Sandstone.png",
      "https://jmdglobalstones.co.uk/wp-content/uploads/2026/01/Autumn-Brown-03.jpeg",
      "https://jmdglobalstones.co.uk/wp-content/uploads/2026/01/Autumn-Brown-02.jpeg",
      "https://jmdglobalstones.co.uk/wp-content/uploads/2026/01/Autumn-Brown-01.jpeg"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 292.00, stock: 29 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 279.00, stock: 51 }
    ],
    stars: 4.8,
    is_featured: true
  },
  {
    id: "prod-2",
    name: "Brazilian Black Slate",
    slug: "brazilian-black-slate",
    category: "Slate",
    price: 320.00,
    description: "Brazilian Black Slate paving slabs feature a very flat, lightly cleft surface and straight cut edges. This natural slate exhibits deep charcoal to black tones, giving modern or traditional spaces a sleek, sophisticated finish with outstanding slip resistance.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2025/01/BB-Slate-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 340.00, stock: 15 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 320.00, stock: 22 }
    ],
    stars: 4.9,
    is_featured: false
  },
  {
    id: "prod-3",
    name: "Brazilian Grey Slate",
    slug: "brazilian-grey-slate",
    category: "Slate",
    price: 310.00,
    description: "Brazilian Grey Slate offers a smooth, clean texture with straight, clean-cut sawn edges. With light-to-medium grey tones and minor organic shade variations, this durable material is excellent for contemporary patio designs.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2025/01/BG-Slate-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 330.00, stock: 18 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 310.00, stock: 14 }
    ],
    stars: 4.7,
    is_featured: false
  },
  {
    id: "prod-4",
    name: "Camel Dust Sandstone",
    slug: "camel-dust-sandstone",
    category: "Sandstone",
    price: 285.00,
    description: "Camel Dust Indian Sandstone is a uniquely colored paving slab featuring golden yellow, tan, creamy buff, and peach tones. Perfectly suited to the British climate, its robust structure and riven texture offer both durability and beauty.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/Camel-Dust-Sandstone-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 299.00, stock: 8 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 285.00, stock: 16 }
    ],
    stars: 4.6,
    is_featured: false
  },
  {
    id: "prod-5",
    name: "Charmis Black Limestone",
    slug: "charmis-black-limestone",
    category: "Limestone",
    price: 295.00,
    description: "Charmis Black Limestone is a classic dark grey to carbon black paving stone. Its smooth natural surface looks clean and premium when wet or dry. Excellent for walkways, modern driveways, or courtyards.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2025/01/CB-Limestone-1-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 315.00, stock: 24 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 295.00, stock: 30 }
    ],
    stars: 4.5,
    is_featured: false
  },
  {
    id: "prod-6",
    name: "County Anthracite Porcelain Paving Slabs",
    slug: "county-anthracite-porcelain-paving-slabs",
    category: "Porcelain",
    price: 373.00,
    description: "County Anthracite Porcelain offers a sleek, ultra-modern dark grey finish with a refined textured surface. High-grade porcelain paving slabs from JMD present low water absorption, stain resistance, and are completely frost-proof.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/CA-Porc-Tiles-300x300.png"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 373.00, stock: 40 },
      { size: "600x600mm Pack 40 Pieces (Single Size)", price: 350.00, stock: 12 }
    ],
    stars: 4.9,
    is_featured: true
  },
  {
    id: "prod-7",
    name: "Earth Core Grey Porcelain Slabs",
    slug: "earth-core-grey-porcelain-tiles-porcelain-slabs",
    category: "Porcelain",
    price: 374.00,
    description: "Earth Core Grey Porcelain paving captures the natural beauty of stone while delivering the strength of premium engineered porcelain. Straight cut edges allow for minimal grout lines for a smooth, high-end look.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/ECG-Porc-Tiles-300x300.png"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 374.00, stock: 35 }
    ],
    stars: 4.8,
    is_featured: true
  },
  {
    id: "prod-8",
    name: "Half Rounds Bricks",
    slug: "half-rounds-bricks",
    category: "Bricks",
    price: 245.00,
    description: "JMD Premium Half Round bricks are specifically selected for edging, walling, and traditional features. They offer a rustic yellow/red color profile that fits perfectly with classic masonry and paving borders.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/HR-Bricks-1-300x300.png"
    ],
    variants: [
      { size: "Pallet of 400 Pieces", price: 245.00, stock: 10 }
    ],
    stars: 4.4,
    is_featured: false
  },
  {
    id: "prod-9",
    name: "Hammer Stone Grey Porcelain Paving Slabs",
    slug: "hammer-stone-grey-porcelain-paving-slabs",
    category: "Porcelain",
    price: 374.00,
    description: "Hammer Stone Grey Porcelain paving slabs deliver a luxurious textured grey feel. Offering exceptional durability and clean lines, this product is ideal for transforming patios, pathways, and indoor-outdoor living spaces.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/HSG-Porc-Tiles-300x300.png"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 374.00, stock: 25 }
    ],
    stars: 4.8,
    is_featured: false
  },
  {
    id: "prod-10",
    name: "Indian Black Slate Paving",
    slug: "indain-black-slate",
    category: "Slate",
    price: 315.00,
    description: "Indian Black Slate is imported directly from verified quarries in India. Featuring a rustic cleft finish and vibrant black tones, it is calibrated to a uniform thickness of 22mm for easy installation and longevity.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/BB-Slate-1-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 329.00, stock: 12 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 315.00, stock: 18 }
    ],
    stars: 4.6,
    is_featured: false
  },
  {
    id: "prod-11",
    name: "Indian Vijaya Gold Slate",
    slug: "indain-vijaya-gold",
    category: "Slate",
    price: 330.00,
    description: "Indian Vijaya Gold Slate features striking ochre, rust orange, and gold tones on a base of steel grey. This flagstone slate creates a highly warm, rich feel for patios, pathways, and internal accent walls.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/VG-Slate-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 350.00, stock: 9 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 330.00, stock: 15 }
    ],
    stars: 4.7,
    is_featured: false
  },
  {
    id: "prod-12",
    name: "Kandla Grey Indian Sandstone Paving",
    slug: "kandla-grey-indian-sandstone-paving",
    category: "Sandstone",
    price: 292.00,
    description: "Kandla Grey Sandstone is the most popular garden paving material in the UK. Featuring cool blue-grey tones, straight hand-cut edges, and a consistent riven surface, it creates a clean, elegant look that coordinates with any garden layout.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2025/01/KG-Sandstone-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 307.00, stock: 85 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 292.00, stock: 64 }
    ],
    stars: 4.9,
    is_featured: true
  },
  {
    id: "prod-13",
    name: "Kandla Grey Porcelain Slabs",
    slug: "kandla-grey-porcelain",
    category: "Porcelain",
    price: 373.00,
    description: "Kandla Grey Porcelain captures the contemporary light-grey aesthetic of natural sandstone but with the maintenance-free benefit of engineered vitrified tiles. Extremely resistant to algae, dirt, and stains.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2025/07/Kandla-Grey-Porcelain-300x300.png"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 373.00, stock: 45 }
    ],
    stars: 4.8,
    is_featured: false
  },
  {
    id: "prod-14",
    name: "Kota Black Limestone Slabs",
    slug: "kota-black-limestone",
    category: "Limestone",
    price: 289.00,
    description: "Kota Black Limestone features a flatter, smoother texture than sandstone, presenting a dark charcoal color that coordinates wonderfully with borders and green garden shrubbery. Imported from the highest quality limestone beds in India.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/ls_Blacklimestone_02-300x340.jpg"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 305.00, stock: 19 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 289.00, stock: 26 }
    ],
    stars: 4.7,
    is_featured: true
  },
  {
    id: "prod-15",
    name: "Kota Blue Limestone Paving",
    slug: "kota-blue",
    category: "Limestone",
    price: 290.00,
    description: "Kota Blue Limestone displays subtle blue-grey hues with steel undertones. The surface is exceptionally flat and hard-wearing, offering a premium flagstone appearance suitable for extensive paving layouts.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/KB-Limestone-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 310.00, stock: 14 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 290.00, stock: 20 }
    ],
    stars: 4.6,
    is_featured: false
  },
  {
    id: "prod-16",
    name: "Kurnool Grey Limestone",
    slug: "kurnool-grey",
    category: "Limestone",
    price: 295.00,
    description: "Kurnool Grey Limestone displays deep grey tones with a natural hand-split surface. Very dense and durable, it holds its slate-like color excellently and has a slightly textured feel that provides superb slip resistance.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/ls_kurnoolgrey_06-300x225.jpg"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 315.00, stock: 5 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 295.00, stock: 8 }
    ],
    stars: 4.5,
    is_featured: false
  },
  {
    id: "prod-17",
    name: "Mint Indian Sandstone Paving",
    slug: "mint",
    category: "Sandstone",
    price: 288.00,
    description: "Mint Indian Sandstone is renowned for its rich cream, ivory, buff, and amber tones, with beautiful natural fossil patterns. It provides a warm, sunny aesthetic to dark gardens or north-facing patios.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/Mint-Sandstone-1-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 299.00, stock: 22 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 288.00, stock: 17 }
    ],
    stars: 4.8,
    is_featured: false
  },
  {
    id: "prod-18",
    name: "Mountain White Porcelain Paving Slabs",
    slug: "mountain-white-porcelain-paving-slabs",
    category: "Porcelain",
    price: 349.00,
    description: "Mountain White Porcelain paving slabs bring crisp, luminous bright white tones to gardens and patios. These high-grade ceramic tiles reflect light beautifully and possess an R11 anti-slip safety rating.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/MW-Porc-Tiles-300x300.png"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 349.00, stock: 15 }
    ],
    stars: 4.7,
    is_featured: false
  },
  {
    id: "prod-19",
    name: "Persia Beige Porcelain Paving Slabs",
    slug: "persia-beige-porcelain-paving-slabs",
    category: "Porcelain",
    price: 373.00,
    description: "Persia Beige Porcelain slabs represent the height of outdoor luxury. Emulating premium ivory travertine with warm cream hues, it provides a bright, sprawling Mediterranean look for residential garden patios.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2026/06/Persia-Beige05-300x200.jpg"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 373.00, stock: 20 }
    ],
    stars: 4.9,
    is_featured: true
  },
  {
    id: "prod-20",
    name: "Plain Yellow Bricks",
    slug: "plain-yellow-bricks",
    category: "Bricks",
    price: 250.00,
    description: "Traditional London Stock-style Plain Yellow bricks are designed for building characterful garden walls, borders, and decorative features. Authentic textures and color consistency make this a classic choice.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/PY-Bricks-300x300.png"
    ],
    variants: [
      { size: "Pallet of 400 Pieces", price: 250.00, stock: 14 }
    ],
    stars: 4.3,
    is_featured: false
  },
  {
    id: "prod-21",
    name: "Quartz Light Grey Porcelain",
    slug: "quartz-light-grey",
    category: "Porcelain",
    price: 373.00,
    description: "Quartz Light Grey Porcelain paving slabs mimic the speckled aggregate texture of natural granite. Stain-proof, scratch-resistant, and offering exceptional slip resistance, this paving is built to survive heavy footfall.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/QLG-Porc-Tiles-300x300.png"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 373.00, stock: 32 }
    ],
    stars: 4.8,
    is_featured: false
  },
  {
    id: "prod-22",
    name: "Quartz White Porcelain Paving",
    slug: "quartz-white-porcelain-paving",
    category: "Porcelain",
    price: 373.00,
    description: "Quartz White Porcelain provides a pristine, high-brightness paving surface. Exhibiting extremely subtle grey speckles, it is the perfect flooring choice for high-contrast architectural patio spaces.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2025/07/Quartz-White-Porcelain-300x300.png"
    ],
    variants: [
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 373.00, stock: 18 }
    ],
    stars: 4.6,
    is_featured: false
  },
  {
    id: "prod-23",
    name: "Raj Green Indian Sandstone Paving",
    slug: "raj-green-indian-sandstone-paving",
    category: "Sandstone",
    price: 292.00,
    description: "Raj Green Sandstone paving flagstones mimic traditional English Yorkstone. With blended tones of green, grey, brown, and soft bronze, this robust paving handles wet conditions excellently and ages beautifully over time.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/RG-Sandstone-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 292.00, stock: 45 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 279.00, stock: 30 }
    ],
    stars: 4.9,
    is_featured: true
  },
  {
    id: "prod-24",
    name: "Rippon Buff Indian Sandstone Paving",
    slug: "rippon-buff-indian-sandstone-paving",
    category: "Sandstone",
    price: 292.00,
    description: "Rippon Buff Sandstone paving slabs present warm peach, cream, pink, and orange swirls over a light sandstone base. Features sawn edges and a hand-cut, split finish that catches the light wonderfully.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/ss_ripponbuff_01-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 292.00, stock: 35 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 279.00, stock: 21 }
    ],
    stars: 4.8,
    is_featured: false
  },
  {
    id: "prod-25",
    name: "Smeed Dean Yellow Bricks",
    slug: "smeed-dean-yellow",
    category: "Bricks",
    price: 270.00,
    description: "Premium JMD Smeed Dean Yellow bricks replicate standard Kent stock bricks. Their distinctive yellow tint and slightly weathered face make them great for restoration work or character-rich garden partitions.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/SMDY-Bricks-300x300.png"
    ],
    variants: [
      { size: "Pallet of 400 Pieces", price: 270.00, stock: 12 }
    ],
    stars: 4.7,
    is_featured: false
  },
  {
    id: "prod-26",
    name: "Smeed Dean Yellow Multi Bricks",
    slug: "smeed-dean-yellow-multi",
    category: "Bricks",
    price: 280.00,
    description: "JMD Smeed Dean Yellow Multi bricks introduce varying dark soot marks and red/orange blend faces to create a highly varied rustic texture. Ideal for feature brickwork and classic masonry details.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/SMDYM-Bricks-300x300.png"
    ],
    variants: [
      { size: "Pallet of 400 Pieces", price: 280.00, stock: 15 }
    ],
    stars: 4.5,
    is_featured: false
  },
  {
    id: "prod-27",
    name: "Soft Red Bricks",
    slug: "soft-red-bricks",
    category: "Bricks",
    price: 260.00,
    description: "Traditional Soft Red facing bricks display a rich reddish-orange shade. Perfect for classic cottage-style walling, chimney updates, or edging paths to provide warmth and vintage architectural details.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/SR-Bricks-1-300x300.png"
    ],
    variants: [
      { size: "Pallet of 400 Pieces", price: 260.00, stock: 11 }
    ],
    stars: 4.4,
    is_featured: false
  },
  {
    id: "prod-28",
    name: "Stretcher Plinths Bricks",
    slug: "stretcher-plinths",
    category: "Bricks",
    price: 265.00,
    description: "Premium Stretcher Plinths bricks feature a beautiful chamfered edge designed for creating architectural steps, transitions, plinths, and wall base capping. Highly durable and matching JMD classic ranges.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/SP-Bricks-300x300.png"
    ],
    variants: [
      { size: "Pallet of 200 Pieces", price: 265.00, stock: 8 }
    ],
    stars: 4.3,
    is_featured: false
  },
  {
    id: "prod-29",
    name: "Tandoor Blue Limestone Slabs",
    slug: "tandoor-blue",
    category: "Limestone",
    price: 285.00,
    description: "Tandoor Blue Limestone is a classic flat limestone that provides a clean, contemporary slate-like look. Beautiful grey-blue tones stand out elegantly and remain durable under all weather conditions.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/TB-Limestone-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 300.00, stock: 15 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 285.00, stock: 22 }
    ],
    stars: 4.7,
    is_featured: false
  },
  {
    id: "prod-30",
    name: "Tandoor Yellow Limestone Slabs",
    slug: "tandoor-yellow",
    category: "Limestone",
    price: 290.00,
    description: "Tandoor Yellow Limestone displays warm golden-buff and earthy beige hues. With sawn edges and a flat hand-cut surface, it gives paths and patios a natural warmth that blends perfectly into garden greenery.",
    images: [
      "https://jmdglobalstones.co.uk/wp-content/uploads/2024/12/TY-Limestone-300x300.png"
    ],
    variants: [
      { size: "Project Pack 60 Pieces (Mixed Sizes)", price: 310.00, stock: 16 },
      { size: "900x600mm Pack 30 Pieces (Single Size)", price: 290.00, stock: 20 }
    ],
    stars: 4.6,
    is_featured: false
  }
];

async function seed() {
  console.log('Seeding products database (flattening size variants into individual listings)...');
  try {
    const flatProducts = [];
    const SANDSTONE_900x600_IMAGES = {
      "prod-1": "/images/autumn-brown-900x600.png",
      "prod-4": "/images/camel-dust-900x600.png",
      "prod-12": "/images/kandla-grey-900x600.png",
      "prod-17": "/images/mint-sandstone-900x600.png",
      "prod-23": "/images/raj-green-900x600.png",
      "prod-24": "/images/rippon-buff-900x600.png"
    };

    products.forEach(p => {
      if (p.variants && p.variants.length > 0) {
        p.variants.forEach((v, idx) => {
          const cleanSize = v.size
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
          
          let imagesList = [...p.images];
          if (v.size.toLowerCase().includes("900x600") && SANDSTONE_900x600_IMAGES[p.id]) {
            imagesList = [SANDSTONE_900x600_IMAGES[p.id], ...p.images.slice(1)];
          }

          flatProducts.push({
            id: `${p.id}-var-${idx + 1}`,
            name: `${p.name} - ${v.size}`,
            slug: `${p.slug}-${cleanSize}`,
            category: p.category,
            price: v.price,
            stock: v.stock,
            size: v.size,
            description: p.description,
            images: imagesList,
            is_featured: p.is_featured,
            stars: p.stars,
            seo_title: `${p.name} (${v.size}) | JMD Global Stones`,
            seo_description: p.description.substring(0, 150),
            variant_group_id: p.id,
            created_at: new Date().toISOString()
          });
        });
      } else {
        flatProducts.push({
          id: p.id,
          name: p.name,
          slug: p.slug,
          category: p.category,
          price: p.price,
          stock: p.stock || 10,
          size: "Single Size",
          description: p.description,
          images: p.images,
          is_featured: p.is_featured,
          stars: p.stars,
          seo_title: `${p.name} | JMD Global Stones`,
          seo_description: p.description.substring(0, 150),
          variant_group_id: p.id,
          created_at: new Date().toISOString()
        });
      }
    });

    await db.saveProducts(flatProducts);
    console.log(`Seeding completed successfully. ${flatProducts.length} separate size listings written to database.`);
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

seed();
