// Use built-in fetch

async function deleteAllProducts() {
  const BASE = 'https://pagina-web-dashboard-fadeco-erp.vercel.app';
  
  console.log("Fetching all products...");
  const listRes = await fetch(`${BASE}/api/inventory/productos`);
  const products = await listRes.json();
  
  console.log(`Found ${products.length} products to delete.`);
  
  for (const p of products) {
    console.log(`Attempting to delete "${p.nombre}" (ID=${p.id})...`);
    const delRes = await fetch(`${BASE}/api/inventory/productos/${p.id}`, { method: 'DELETE' });
    if (delRes.status === 200 || delRes.status === 201) {
      console.log(`Successfully deleted ID=${p.id}`);
    } else {
      console.log(`Failed to delete ID=${p.id}, Status: ${delRes.status}`);
      try {
        console.log(`Response: ${await delRes.text()}`);
      } catch (e) {
        console.log("Could not read response text.");
      }
    }
  }
  
  console.log("Done.");
}

deleteAllProducts();
