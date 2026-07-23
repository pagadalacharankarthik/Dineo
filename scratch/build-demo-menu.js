const { PrismaClient } = require("@prisma/client");
const { PrismaNeon } = require("@prisma/adapter-neon");
const { neonConfig } = require("@neondatabase/serverless");
const ws = require("ws");
require("dotenv").config({ path: ".env.local" });

neonConfig.webSocketConstructor = ws;

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const adapter = new PrismaNeon({ connectionString });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Rebuilding 'demo' restaurant menu...");

  // 1. Find or create the demo restaurant
  let rest = await prisma.restaurant.findUnique({
    where: { slug: "demo" }
  });

  if (!rest) {
    // We need an owner user for the demo restaurant. We'll find any restaurant owner user or use the first user
    const firstUser = await prisma.user.findFirst({
      where: { role: "RESTAURANT_OWNER" }
    });

    if (!firstUser) {
      throw new Error("No RESTAURANT_OWNER found in the DB. Please create a user first.");
    }

    rest = await prisma.restaurant.create({
      data: {
        name: "Spicy Pepper Bistro",
        slug: "demo",
        ownerId: firstUser.id
      }
    });
  }

  // 2. Clean up existing categories (which cascades to menuItems)
  await prisma.category.deleteMany({
    where: { restaurantId: rest.id }
  });

  // 3. Update restaurant details
  await prisma.restaurant.update({
    where: { id: rest.id },
    data: {
      name: "Spicy Pepper Bistro",
      description: "Wood-fired artisanal pizzas, gourmet burgers, and refreshing craft mocktails.",
      logo: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=150&h=150&q=80",
      coverImage: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=800&q=80",
      address: "5-001, Balaji Colony, Tirupati",
      city: "Tirupati",
      state: "Andhra Pradesh",
      pincode: "517102",
      mobile: "9986334251",
      email: "order@spicybistro.com",
      website: "https://spicybistro.com"
    }
  });

  // 4. Create premium categories and items
  const bestSellers = await prisma.category.create({
    data: {
      restaurantId: rest.id,
      name: "🔥 Best Sellers",
      displayOrder: 0
    }
  });

  const mains = await prisma.category.create({
    data: {
      restaurantId: rest.id,
      name: "🍕 Pizzas & Burgers",
      displayOrder: 1
    }
  });

  const beverages = await prisma.category.create({
    data: {
      restaurantId: rest.id,
      name: "🥤 Beverages",
      displayOrder: 2
    }
  });

  const starters = await prisma.category.create({
    data: {
      restaurantId: rest.id,
      name: "🍗 Gourmet Starters",
      displayOrder: 3
    }
  });

  // 5. Populate menu items
  // Best Sellers
  await prisma.menuItem.create({
    data: {
      restaurantId: rest.id,
      categoryId: bestSellers.id,
      name: "Classic Cheeseburger",
      description: "Juicy flame-grilled patty, melting cheddar, dill pickles, fresh lettuce, tomatoes, and house burger sauce.",
      price: 149,
      imageUrl: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80",
      isVeg: false,
      isBestSeller: true
    }
  });

  await prisma.menuItem.create({
    data: {
      restaurantId: rest.id,
      categoryId: bestSellers.id,
      name: "Spicy Paneer Tikka Pizza",
      description: "Wood-fired thin crust, spiced paneer tikka, green peppers, red onions, coriander, and melting mozzarella.",
      price: 299,
      imageUrl: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80",
      isVeg: true,
      isBestSeller: true
    }
  });

  // Pizzas & Burgers
  await prisma.menuItem.create({
    data: {
      restaurantId: rest.id,
      categoryId: mains.id,
      name: "Crunchy Double Patty Burger",
      description: "Double vegetable patty, layered with double cheese slices, jalapenos, and chipotle mayo.",
      price: 199,
      imageUrl: "https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=300&q=80",
      isVeg: true
    }
  });

  // Beverages
  await prisma.menuItem.create({
    data: {
      restaurantId: rest.id,
      categoryId: beverages.id,
      name: "Fresh Mint Mojito",
      description: "Refreshing lime wedges, garden fresh mint leaves, raw cane sugar, and sparkling soda over crushed ice.",
      price: 99,
      imageUrl: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=300&q=80",
      isVeg: true,
      isRecommended: true
    }
  });

  await prisma.menuItem.create({
    data: {
      restaurantId: rest.id,
      categoryId: beverages.id,
      name: "Iced Caramel Macchiato",
      description: "Rich espresso combined with milk and vanilla syrup, served over ice and topped with caramel drizzle.",
      price: 129,
      imageUrl: "https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=300&q=80",
      isVeg: true
    }
  });

  // Starters
  await prisma.menuItem.create({
    data: {
      restaurantId: rest.id,
      categoryId: starters.id,
      name: "Wok-Tossed Chilli Chicken",
      description: "Succulent chicken chunks tossed with crisp bell peppers, green chillies, spring onions, and spicy dark soy sauce.",
      price: 169,
      imageUrl: "https://static.toiimg.com/thumb/53094926.cms?width=500&height=400",
      isVeg: false,
      isChefSpecial: true
    }
  });

  await prisma.menuItem.create({
    data: {
      restaurantId: rest.id,
      categoryId: starters.id,
      name: "Pepper Chicken Curry Leaves",
      description: "Pan-fried tender chicken sautéed with heavy crushed black pepper, spices, and fresh aromatic curry leaves.",
      price: 179,
      imageUrl: "https://www.cookwithkushi.com/wp-content/uploads/2025/06/pepper_chicken_kali_mirch_recipe.jpg",
      isVeg: false
    }
  });

  console.log("Demo Menu rebuilt successfully!");
}

main()
  .catch((e) => {
    console.error("Error rebuilding demo menu:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
