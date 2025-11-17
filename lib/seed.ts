import { createServerClient } from '@/lib/supabase-server';
import defaultProducts from '@/data/default-watches.json';
import householdServices from '@/data/default-household-services.json';
import householdServicesConfig from '@/data/default-household-services-config.json';
import watchesConfig from '@/data/default-watches-config.json';
import defaultOffers from '@/data/default-offers.json';
import { transformSiteConfigForDatabase } from './siteConfigTransformer';

export async function seedDatabase() {
  const supabase = await createServerClient();

  // Check if products already exist
  const { data: existingProducts } = await supabase
    .from('products')
    .select('id')
    .limit(1);

  if (existingProducts && existingProducts.length > 0) {
    console.log('Database already seeded');
    return;
  }

  // Use only household services (or uncomment defaultProducts to include watches)
  const allProducts = householdServices;
  const siteConfig = householdServicesConfig;
  
  // To include watches: 
  // const allProducts = [...defaultProducts, ...householdServices];
  // const siteConfig = householdServicesConfig; // or watchesConfig if you prefer watches config

  // Insert default products
  const { error: productsError } = await supabase
    .from('products')
    .insert(allProducts);

  if (productsError) {
    console.error('Error seeding products:', productsError);
    return;
  }

  // Insert default site config if available
  if (siteConfig) {
    const transformedConfig = transformSiteConfigForDatabase(siteConfig);

    const { error: configError } = await supabase
      .from('site_config')
      .upsert(transformedConfig, {
        onConflict: 'id'
      });

    if (configError) {
      console.error('Error seeding config:', configError);
      return;
    }
  }

  // Insert default offers
  const offersToInsert = defaultOffers.map((offer, index) => ({
    offer_id: offer.offerId,
    title: offer.title,
    description: offer.description,
    image_url: offer.imageUrl,
    cta_text: offer.ctaText,
    cta_link: offer.ctaLink,
    discount: offer.discount || 0,
    bg_gradient: offer.bgGradient || null,
    is_active: true,
    display_order: index + 1,
  }));

  const { error: offersError } = await supabase
    .from('offers')
    .upsert(offersToInsert, {
      onConflict: 'offer_id'
    });

  if (offersError) {
    console.error('Error seeding offers:', offersError);
    return;
  }

  console.log('Database seeded successfully with household services');
}

