export interface PricingFeature {
  text: string;
  included: boolean;
}

export interface PricingService {
  title: string;
  price: string;
  frequency: string;
  vAvantagePrice: string;
  description: string;
  features: PricingFeature[];
  popular: boolean;
}

export interface PricingData {
  services: PricingService[];
  footnotes: string[];
}
