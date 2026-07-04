const fetch = require('node-fetch');
async function main() {
  // Try to hit the API directly
  const id = 14; // we just created this in test_api_delete.js, wait no, 14 was deleted.
  // let's create 15
  const { PrismaClient } = require('@prisma/client');
  const prisma = new PrismaClient();
  const p = await prisma.producto.create({
    data: {
      codigoSistema: 'PRO-TEST-API',
      codigo: 'PRO-TEST-API',
      nombre: 'Test API Fetch Delete',
      categoriaId: 1,
      unidadMedidaId: 1,
      stockActual: 10,
      estado: true
    }
  });
  console.log("Created ID:", p.id);
  
  // Now hit the LIVE Vercel API!
  try {
    const res = await fetch('https://pagina-web-dashboard-fadeco-erp.vercel.app/api/inventory/productos', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: p.id })
    });
    const text = await res.text();
    console.log("Status:", res.status);
    console.log("Response:", text);
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
main();
