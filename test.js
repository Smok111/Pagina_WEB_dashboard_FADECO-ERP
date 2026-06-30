async function run() {
  const res = await fetch("https://pagina-web-dashboard-fadeco-erp.vercel.app/api/maintenance/equipos/1", {
    method: "DELETE"
  });
  console.log("Status:", res.status);
  console.log("Headers:");
  res.headers.forEach((v, k) => console.log(k, v));
  const text = await res.text();
  console.log("Body:", text);
}
run();
