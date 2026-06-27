import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@fadeco.com';
  const plainPassword = 'Admin123456*';
  
  const hashedPassword = await bcrypt.hash(plainPassword, 10);
  
  const user = await prisma.usuario.findUnique({ where: { email } });
  
  if (user) {
    await prisma.usuario.update({
      where: { email },
      data: { passwordHash: hashedPassword, rolId: 1 },
    });
    console.log('Admin user updated successfully.');
  } else {
    // Make sure we have a Empresa and Sucursal first
    let empresa = await prisma.empresa.findFirst();
    if (!empresa) {
        empresa = await prisma.empresa.create({
            data: {
                razonSocial: 'FADECO',
                ruc: '20123456789'
            }
        });
    }

    let sucursal = await prisma.sucursal.findFirst();
    if (!sucursal) {
        sucursal = await prisma.sucursal.create({
            data: {
                nombre: 'Sede Principal',
                empresaId: empresa.id
            }
        });
    }

    let rol = await prisma.rol.findFirst({ where: { id: 1 } });
    if (!rol) {
        rol = await prisma.rol.create({
            data: {
                id: 1,
                nombre: 'ADMINISTRADOR',
                descripcion: 'Administrador del sistema'
            }
        });
    }

    await prisma.usuario.create({
      data: {
        email,
        passwordHash: hashedPassword,
        nombres: 'Admin',
        apellidos: 'Principal',
        rolId: rol.id,
        sucursalId: sucursal.id
      }
    });
    console.log('Admin user created successfully.');
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
