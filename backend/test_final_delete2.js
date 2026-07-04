const fetch = require('node-fetch');

async function testDeleteRealProduct() {
  const BASE = 'https://pagina-web-dashboard-fadeco-erp.vercel.app';
  
  // Try deleting "Arena Fina" (ID=6, stock=4 - likely has stock/movement records)
  console.log('Attempting to delete "Arena Fina" (ID=6, stock=4)...');
  const delRes = await fetch(`${BASE}/api/inventory/productos/6`, { method: 'DELETE' });
  console.log(`Status: ${delRes.status}`);
  console.log(`Response: ${await delRes.text()}`);
  
  // Verify it's gone
  console.log('\nVerifying product list...');
  const listRes = await fetch(`${BASE}/api/inventory/productos`);
  const products = await listRes.json();
  console.log(`Remaining products: ${products.length}`);
  products.forEach(p => console.log(`  ID=${p.id} "${p.nombre}"`));
}

testDeleteRealProduct();
