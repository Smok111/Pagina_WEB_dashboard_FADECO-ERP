import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const soldadura = await prisma.areaProduccion.findFirst({ where: { nombre: 'Soldadura' } });
  
  if (!soldadura) {
    await prisma.areaProduccion.create({
      data: {
        nombre: 'Soldadura',
        descripcion: 'Área de soldadura y estructuras metálicas'
      }
    });
    console.log('Área Soldadura creada exitosamente.');
  } else {
    console.log('Área Soldadura ya existe.');
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
