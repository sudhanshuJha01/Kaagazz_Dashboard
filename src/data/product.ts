export type Product = {
  id: string;
  title: string;
  description: string;
  price: number;
  discountedPrice: number;
  stockLeft: number;
  isBulkAvailable: boolean;
  bulkMinQty?: number;
  rating: number;
  rank: number;
  image: string;
  images: string[];
  category: string;
  certifiedSustainable: boolean;
};

export const products: Product[] = [
  {
    id: "prod-001",
    title: "Stapled Notepad",
    description: "Sleek, compact, and crafted for everyday efficiency. Made from upcycled agricultural waste, ideal for professionals and creatives who care about conscious choices.",
    price: 300,
    discountedPrice: 100,
    stockLeft: 60,
    isBulkAvailable: true,
    bulkMinQty: 20,
    rating: 4.6,
    rank: 2,
    image: "/stapled/1.png",
    images: ["/stapled/1.png","/stapled/2.png", "/stapled/3.jpg", "/stapled/4.png", "/stapled/5.jpg"],
    category: "Stationery",
    certifiedSustainable: true,
  },
  {
    id: "prod-002",
    title: "Spiral Notepad",
    description: "Vertical and horizontal spiral notepads made with sturdy binding and premium eco-paper. Ideal for free-form writing, sketching, and planning.",
    price: 250,
    discountedPrice: 150,
    stockLeft: 45,
    isBulkAvailable: true,
    bulkMinQty: 15,
    rating: 4.7,
    rank: 3,
    image: "/sprial_notepad/1.png",
    images: ["/sprial_notepad/1.png", "/sprial_notepad/2.png", "/sprial_notepad/3.png",],
    category: "Stationery",
    certifiedSustainable: true,
  },
  {
    id: "prod-003",
    title: "A4 Size Sheets (70 GSM)",
    description: "Clean, smooth sheets ideal for printing, sketching, and corporate use. Made from responsibly sourced agri-fiber.",
    price: 400,
    discountedPrice: 300,
    stockLeft: 100,
    isBulkAvailable: true,
    bulkMinQty: 25,
    rating: 4.5,
    rank: 4,
    image: "/a4/1.png",
    images: ["/a4/1.png", "/a4/2.png", "/a4/3.png", "/a4/4.jpg"],
    category: "Paper",
    certifiedSustainable: true,
  },
  {
    id: "prod-004",
    title: "Seed Pencils",
    description: "Made from recycled paper and embedded with seeds that grow into herbs, flowers, or vegetables.",
    price: 50,
    discountedPrice: 30,
    stockLeft: 150,
    isBulkAvailable: true,
    bulkMinQty: 30,
    rating: 4.9,
    rank: 5,
    image: "/seed_pencil/1.png",
    images: ["/seed_pencil/1.png", "/seed_pencil/2.png", "/seed_pencil/3.png", ],
    category: "Stationery",
    certifiedSustainable: true,
  },
  {
    id: "prod-005",
    title: "Cork Diary",
    description: "Made with biodegradable cork and premium eco-paper. Ideal for journaling and corporate gifting.",
    price: 999,
    discountedPrice: 600,
    stockLeft: 40,
    isBulkAvailable: true,
    bulkMinQty: 10,
    rating: 4.8,
    rank: 6,
    image: "/cork/1.png",
    images: ["/cork/1.png", "/cork/2.png", "/cork/3.jpg", "/cork/4.png"],
    category: "Gift Sets",
    certifiedSustainable: true,
  },
  {
    id: "prod-006",
    title: "Artisanal Paper",
    description: "Handmade by rural artisans, each sheet has unique texture and character. Ideal for invitations, art, or branding.",
    price: 500,
    discountedPrice: 400,
    stockLeft: 48,
    isBulkAvailable: true,
    bulkMinQty: 10,
    rating: 4.8,
    rank: 1,
    image: "/artisinal/1.png",
    images: ["/artisinal/1.png", "/artisinal/2.png", "/artisinal/3.png",],
    category: "Stationery",
    certifiedSustainable: true,
  }
];
