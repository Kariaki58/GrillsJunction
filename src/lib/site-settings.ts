export interface SiteSettings {
  businessName: string;
  siteTitle: string;
  siteDescription: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  openingTime: string;
  closingTime: string;
  deliveryFee: number;
  minimumOrder: number;
  maintenanceMode: boolean;
  maintenanceMessage: string;
}

export const defaultSiteSettings: SiteSettings = {
  businessName: 'GrillsJunction',
  siteTitle: 'GrillsJunction | Lagos Premium BBQ Experience',
  siteDescription: 'Luxury African BBQ specializing in Asun, Grilled Chicken, Catfish, and more.',
  address: '123 Lekki Phase 1',
  city: 'Lagos',
  state: 'Lagos State',
  zipCode: '106104',
  openingTime: '10:00',
  closingTime: '23:59',
  deliveryFee: 2000,
  minimumOrder: 10000,
  maintenanceMode: false,
  maintenanceMessage: 'We are currently under maintenance. Please try again later.',
};

export interface SiteSettingsRow {
  id: number;
  business_name: string;
  site_title: string;
  site_description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  opening_time: string;
  closing_time: string;
  delivery_fee: string | number;
  minimum_order: string | number;
  maintenance_mode: boolean;
  maintenance_message: string;
  updated_at: string;
}

export function mapSiteSettingsRow(row: Partial<SiteSettingsRow> | null): SiteSettings {
  if (!row) {
    return defaultSiteSettings;
  }

  return {
    businessName: row.business_name ?? defaultSiteSettings.businessName,
    siteTitle: row.site_title ?? defaultSiteSettings.siteTitle,
    siteDescription: row.site_description ?? defaultSiteSettings.siteDescription,
    address: row.address ?? defaultSiteSettings.address,
    city: row.city ?? defaultSiteSettings.city,
    state: row.state ?? defaultSiteSettings.state,
    zipCode: row.zip_code ?? defaultSiteSettings.zipCode,
    openingTime: row.opening_time ?? defaultSiteSettings.openingTime,
    closingTime: row.closing_time ?? defaultSiteSettings.closingTime,
    deliveryFee: Number(row.delivery_fee ?? defaultSiteSettings.deliveryFee),
    minimumOrder: Number(row.minimum_order ?? defaultSiteSettings.minimumOrder),
    maintenanceMode: row.maintenance_mode ?? defaultSiteSettings.maintenanceMode,
    maintenanceMessage: row.maintenance_message ?? defaultSiteSettings.maintenanceMessage,
  };
}

export function mapSiteSettingsToRow(settings: SiteSettings): Partial<SiteSettingsRow> {
  return {
    id: 1,
    business_name: settings.businessName,
    site_title: settings.siteTitle,
    site_description: settings.siteDescription,
    address: settings.address,
    city: settings.city,
    state: settings.state,
    zip_code: settings.zipCode,
    opening_time: settings.openingTime,
    closing_time: settings.closingTime,
    delivery_fee: settings.deliveryFee,
    minimum_order: settings.minimumOrder,
    maintenance_mode: settings.maintenanceMode,
    maintenance_message: settings.maintenanceMessage,
  };
}
