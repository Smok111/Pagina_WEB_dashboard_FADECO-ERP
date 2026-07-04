const fetch = require('node-fetch');

async function testDeleteExistingProduct() {
  const BASE = 'https://pagina-web-dashboard-fadeco-erp.vercel.app';
  
  // First, get the list of products
  console.log("Fetching products...");
  const listRes = await fetch(`${BASE}/api/inventory/productos`);
  const products = await listRes.json();
  console.log(`Found ${products.length} products:`);
  products.forEach(p => console.log(`  ID=${p.id} "${p.nombre}" stock=${p.stockActual}`));
  
  // Try deleting the "Test API Fetch Delete" product (created in tests)
  const testProduct = products.find(p => p.nombre.includes('Test'));
  if (testProduct) {
    console.log(`\nAttempting to delete "${testProduct.nombre}" (ID=${testProduct.id})...`);
    const delRes = await fetch(`${BASE}/api/inventory/productos/${testProduct.id}`, { method: 'DELETE' });
    console.log(`Status: ${delRes.status}`);
    console.log(`Response: ${await delRes.text()}`);
  } else {
    console.log("\nNo test product found. Trying to delete the LAST product in the list...");
    const last = products[products.length - 1];
    if (last) {
      console.log(`Attempting to delete "${last.nombre}" (ID=${last.id})...`);
      const delRes = await fetch(`${BASE}/api/inventory/productos/${last.id}`, { method: 'DELETE' });
      console.log(`Status: ${delRes.status}`);
      console.log(`Response: ${await delRes.text()}`);
    }
  }
}

testDeleteExistingProduct();
