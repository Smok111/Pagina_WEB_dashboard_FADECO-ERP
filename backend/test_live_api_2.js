const fetch = require('node-fetch');

async function testLiveApi() {
  console.log("Creating a test product on live API...");
  const createRes = await fetch('https://pagina-web-dashboard-fadeco-erp.vercel.app/api/inventory/productos', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      nombre: 'Test Delete Me New 2',
      descripcion: 'will be deleted',
      categoriaId: 1,
      unidadMedidaId: 1,
      stockActual: 0,
      stockMinimo: 0,
      costo: 0,
      precioVenta: 0
    })
  });
  
  if (!createRes.ok) {
    console.error("Failed to create", await createRes.text());
    return;
  }
  const created = await createRes.json();
  console.log("Created ID:", created.id);

  const delRes = await fetch(`https://pagina-web-dashboard-fadeco-erp.vercel.app/api/inventory/productos/${created.id}`, {
    method: 'DELETE'
  });
  console.log("Status:", delRes.status);
  console.log("Response:", await delRes.text());
}

testLiveApi();
