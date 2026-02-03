import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import bcrypt from "bcryptjs";
import "dotenv/config";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL no está configurada");
}

const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("🌱 Iniciando seed...");

  // Crear usuario admin
  const adminPassword = await bcrypt.hash("admin123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@ecommerce.com" },
    update: {},
    create: {
      email: "admin@ecommerce.com",
      password: adminPassword,
      nombre: "Admin",
      apellido: "Sistema",
      role: "ADMIN",
    },
  });
  console.log("✅ Usuario admin creado:", admin.email);

  // Crear categorías
  const categorias = [
    {
      nombre: "Computadoras",
      slug: "computadoras",
      descripcion: "PCs de escritorio, gaming y workstations",
    },
    {
      nombre: "Laptops",
      slug: "laptops",
      descripcion: "Portátiles para trabajo, gaming y uso general",
    },
    {
      nombre: "Monitores",
      slug: "monitores",
      descripcion: "Monitores gaming, profesionales y de oficina",
    },
    {
      nombre: "Periféricos",
      slug: "perifericos",
      descripcion: "Teclados, mouse, auriculares y accesorios",
    },
    {
      nombre: "Componentes",
      slug: "componentes",
      descripcion: "Procesadores, tarjetas gráficas, RAM y almacenamiento",
    },
  ];

  for (const cat of categorias) {
    await prisma.categoria.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }
  console.log("✅ Categorías creadas:", categorias.length);

  // Crear marcas
  const marcas = [
    { nombre: "ASUS", slug: "asus" },
    { nombre: "MSI", slug: "msi" },
    { nombre: "Logitech", slug: "logitech" },
    { nombre: "Razer", slug: "razer" },
    { nombre: "HP", slug: "hp" },
    { nombre: "Dell", slug: "dell" },
    { nombre: "Lenovo", slug: "lenovo" },
    { nombre: "Acer", slug: "acer" },
    { nombre: "Samsung", slug: "samsung" },
    { nombre: "LG", slug: "lg" },
    { nombre: "Intel", slug: "intel" },
    { nombre: "AMD", slug: "amd" },
    { nombre: "NVIDIA", slug: "nvidia" },
    { nombre: "Corsair", slug: "corsair" },
    { nombre: "HyperX", slug: "hyperx" },
    { nombre: "Kingston", slug: "kingston" },
    { nombre: "Western Digital", slug: "western-digital" },
    { nombre: "Seagate", slug: "seagate" },
  ];

  for (const marca of marcas) {
    await prisma.marca.upsert({
      where: { slug: marca.slug },
      update: {},
      create: marca,
    });
  }
  console.log("✅ Marcas creadas:", marcas.length);

  // Obtener IDs para crear productos de ejemplo
  const catLaptops = await prisma.categoria.findUnique({
    where: { slug: "laptops" },
  });
  const catMonitores = await prisma.categoria.findUnique({
    where: { slug: "monitores" },
  });
  const catPerifericos = await prisma.categoria.findUnique({
    where: { slug: "perifericos" },
  });

  const marcaAsus = await prisma.marca.findUnique({ where: { slug: "asus" } });
  const marcaLogitech = await prisma.marca.findUnique({
    where: { slug: "logitech" },
  });
  const marcaSamsung = await prisma.marca.findUnique({
    where: { slug: "samsung" },
  });

  if (catLaptops && catMonitores && catPerifericos && marcaAsus && marcaLogitech && marcaSamsung) {
    // Crear productos de ejemplo
    const productos = [
      {
        nombre: "ASUS ROG Strix G15",
        slug: "asus-rog-strix-g15",
        descripcion:
          "Laptop gaming con AMD Ryzen 7 y RTX 3060. Perfecta para gaming y trabajo creativo.",
        precio: 8500,
        stock: 10,
        sku: "LAP-ASUS-001",
        imagenes: [],
        destacado: true,
        categoriaId: catLaptops.id,
        marcaId: marcaAsus.id,
      },
      {
        nombre: 'Samsung Odyssey G5 27"',
        slug: "samsung-odyssey-g5-27",
        descripcion:
          "Monitor gaming curvo 27 pulgadas, 144Hz, 1ms. Experiencia inmersiva para gaming.",
        precio: 2200,
        stock: 15,
        sku: "MON-SAM-001",
        imagenes: [],
        destacado: true,
        categoriaId: catMonitores.id,
        marcaId: marcaSamsung.id,
      },
      {
        nombre: "Logitech G Pro X Superlight",
        slug: "logitech-g-pro-x-superlight",
        descripcion:
          "Mouse gaming inalámbrico ultraligero. El preferido de los profesionales de esports.",
        precio: 850,
        stock: 25,
        sku: "PER-LOG-001",
        imagenes: [],
        destacado: true,
        categoriaId: catPerifericos.id,
        marcaId: marcaLogitech.id,
      },
    ];

    for (const prod of productos) {
      const existing = await prisma.producto.findUnique({
        where: { slug: prod.slug },
      });

      if (!existing) {
        const producto = await prisma.producto.create({
          data: prod,
        });

        // Agregar especificaciones de ejemplo
        if (prod.slug === "asus-rog-strix-g15") {
          await prisma.especificacion.createMany({
            data: [
              { productoId: producto.id, nombre: "Procesador", valor: "AMD Ryzen 7 5800H" },
              { productoId: producto.id, nombre: "RAM", valor: "16GB DDR4" },
              { productoId: producto.id, nombre: "Almacenamiento", valor: "512GB SSD NVMe" },
              { productoId: producto.id, nombre: "GPU", valor: "NVIDIA RTX 3060 6GB" },
              { productoId: producto.id, nombre: "Pantalla", valor: '15.6" FHD 144Hz' },
            ],
          });
        }
      }
    }
    console.log("✅ Productos de ejemplo creados");
  }

  console.log("🎉 Seed completado exitosamente!");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
