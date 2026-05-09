export interface Product {
  id: number;
  product_id: string;
  product_name: string;
  category: string;
  main_category: string;
  discounted_price: number | null;
  actual_price: number | null;
  discount_percentage: number | null;
  rating: number | null;
  rating_count: number | null;
  review_title: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  pagination: Pagination;
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface TopReviewed {
  product_name: string;
  rating_count: number;
  rating: number;
}

export interface DiscountBucket {
  range: string;
  count: number;
}

export interface CategoryRating {
  category: string;
  avg_rating: number;
}

export interface Summary {
  total_products: number;
  avg_rating: number;
  avg_discount_pct: number;
  total_reviews: number;
}

export interface AnalyticsData {
  categoryDistribution: CategoryCount[];
  topReviewed: TopReviewed[];
  discountDistribution: DiscountBucket[];
  categoryRating: CategoryRating[];
  summary: Summary;
}

export interface FilterState {
  search: string;
  category: string;
  minRating: number;
  maxRating: number;
  page: number;
  limit: number;
}
