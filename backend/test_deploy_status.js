const fetch = require('node-fetch');
async function main() {
  console.log("Checking if backend is up...");
  try {
    const res = await fetch('https://pagina-web-dashboard-fadeco-erp.vercel.app/api/inventory/productos/999999', {
      method: 'DELETE'
    });
    console.log("Status:", res.status); // if 400, backend is UP (because 999999 is caught by our catch block). If 404, backend is still DOWN/OLD.
  } catch (e) {
    console.error(e);
  }
}
main();
