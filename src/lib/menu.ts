export interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  rating: number;
  desc: string;
  image: string;
  badge: string | null;
}

export const menuItems: MenuItem[] = [
  { id: 1, name: 'Special Lagos Asun', category: 'Asun', price: 4500, rating: 4.9, desc: 'Fiery goat meat, hand-cut and slow grilled with scotch bonnets.', image: 'asun-special', badge: 'Best Seller' },
  { id: 2, name: 'Flame BBQ Chicken', category: 'Chicken', price: 6500, rating: 4.8, desc: 'Half chicken marinated in house spices for 24 hours.', image: 'bbq-chicken', badge: 'Popular' },
  { id: 3, name: 'Premium Grilled Catfish', category: 'Fish', price: 8500, rating: 5.0, desc: 'Whole point-and-kill catfish, expertly seasoned.', image: 'catfish-bbq', badge: 'Fresh' },
  { id: 4, name: 'Suya Spiced Beef BBQ', category: 'Beef', price: 5500, rating: 4.7, desc: 'Tender beef chunks with yaji spice and grilled onions.', image: 'beef-bbq', badge: null },
  { id: 5, name: 'Signature Turkey Wings', category: 'Turkey', price: 4800, rating: 4.6, desc: 'Massive turkey wings, grilled till crispy and golden.', image: 'turkey-bbq', badge: null },
  { id: 6, name: 'Spicy Goat Chops', category: 'Asun', price: 7000, rating: 4.8, desc: 'Thick cut goat chops grilled over wood fire.', image: 'asun-special', badge: 'New' },
];

export const menuCategories = ['All', 'Asun', 'Chicken', 'Fish', 'Beef', 'Turkey', 'Drinks'] as const;

export type MenuCategory = (typeof menuCategories)[number];

export const featuredCategories = [
  { name: 'Asun', menuCategory: 'Asun' as const, image: 'asun-special' },
  { name: 'Grilled Chicken', menuCategory: 'Chicken' as const, image: 'bbq-chicken' },
  { name: 'Catfish BBQ', menuCategory: 'Fish' as const, image: 'catfish-bbq' },
  { name: 'Beef BBQ', menuCategory: 'Beef' as const, image: 'beef-bbq' },
];

export function getCategoryItemCount(category: string): number {
  return menuItems.filter((item) => item.category === category).length;
}

export function isMenuCategory(value: string | null): value is MenuCategory {
  return menuCategories.includes(value as MenuCategory);
}

export const DELIVERY_FEE = 1500;
