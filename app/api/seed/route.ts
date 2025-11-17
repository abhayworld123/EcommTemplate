import { seedDatabase } from '@/lib/seed';

export async function GET() {
  try {
    await seedDatabase();
    return Response.json({ success: true, message: 'Database seeded successfully' });
  } catch (error) {
    return Response.json(
      { success: false, error: (error as Error).message },
      { status: 500 }
    );
  }
}

