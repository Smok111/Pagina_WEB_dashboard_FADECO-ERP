import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const name = 'Almacén de Maquinaria';
  
  const existing = await prisma.almacen.findFirst({
    where: { nombre: name }
  });

  if (!existing) {
    const ultimo = await prisma.almacen.findFirst({
      orderBy: { id: 'desc' },
    });
    const codigo = `ALM-${String((ultimo?.id || 0) + 1).padStart(3, '0')}`;
    
    await prisma.almacen.create({
      data: {
        codigo,
        nombre: name,
        ubicacion: 'Planta Principal',
        responsable: 'Jefe de Mantenimiento'
      }
    });
    console.log('Almacén de Maquinaria creado exitosamente.');
  } else {
    console.log('El almacén ya existe.');
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
