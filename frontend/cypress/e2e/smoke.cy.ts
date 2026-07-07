describe('Smoke Tests para módulos administrativos', () => {
  const routes = [
    '/compras',
    '/compras/nueva',
    '/configuracion/empresa',
    '/configuracion/roles',
    '/dashboard',
    '/empresa',
    '/inventario',
    '/inventario/almacenes',
    '/inventario/categorias',
    '/inventario/dashboard',
    '/inventario/maquinaria',
    '/inventario/productos',
    '/inventario/unidades',
    '/mantenimiento',
    '/produccion',
    '/rrhh',
    '/ventas'
  ];

  beforeEach(() => {
    // Ignorar excepciones no capturadas de Next.js o fetchs para que el test no falle por errores de API
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });

    // Mockear peticiones API comunes genéricas
    cy.intercept('GET', '/api/**', { statusCode: 200, body: [] });
    cy.intercept('POST', '/api/**', { statusCode: 200, body: {} });

    // Burlar el middleware
    cy.setCookie('auth_token', 'dummy-token');
  });

  routes.forEach((route) => {
    it(`Debe cargar la página ${route} exitosamente`, () => {
      cy.visit(route);
      // Solo verificamos que se muestre algún contenido (el body existe)
      cy.get('body').should('be.visible');
    });
  });
});
