describe('Inventario - Productos', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });

    cy.setCookie('auth_token', 'dummy-token');

    cy.intercept('GET', '/api/inventory/productos', {
      statusCode: 200,
      body: []
    }).as('getProducts');

    cy.intercept('GET', '/api/inventory/categorias', {
      statusCode: 200,
      body: [
        { id: 1, nombre: 'Materiales de Construcción' }
      ]
    }).as('getCategories');

    cy.intercept('GET', '/api/inventory/unidades-medida', {
      statusCode: 200,
      body: [
        { id: 1, nombre: 'Bolsa', codigo: 'BOL' }
      ]
    }).as('getUnits');

    cy.intercept('GET', '/api/inventory/almacenes', {
      statusCode: 200,
      body: [
        { id: 1, nombre: 'Almacén Central' }
      ]
    }).as('getWarehouses');

    cy.intercept('POST', '/api/inventory/productos', {
      statusCode: 201,
      body: { message: 'Producto creado' }
    }).as('createProduct');

    cy.visit('/inventario/productos');
    cy.wait(['@getProducts', '@getCategories', '@getUnits', '@getWarehouses']);
  });

  it('Debe abrir el modal, llenar el formulario y guardar el producto', () => {
    cy.contains('button', 'Nuevo Producto').click();

    cy.contains('h2', 'Nuevo Producto').should('be.visible');

    // Nombre
    cy.contains('label', 'Nombre del Producto').parent().find('input').type('Cemento Portland');

    // Categoría (usa select de radix UI, pero podemos seleccionar el trigger o forzar si falla)
    // Wait, the select is a Shadcn UI / Radix select. It doesn't use <select> tag in DOM directly, it uses button trigger.
    // We have to click the trigger and then click the item.
    cy.contains('label', 'Categoría').parent().find('button').click();
    cy.contains('div[role="option"]', 'Materiales de Construcción').click();

    // Unidad de Medida
    cy.contains('label', 'Unidad de Medida').parent().find('button').click();
    cy.contains('div[role="option"]', 'Bolsa').click();

    // Costo y Precio (usando el label directamente)
    cy.contains('label', 'Costo').parent().find('input').clear().type('20.50');
    cy.contains('label', 'Precio de Venta').parent().find('input').clear().type('25.00');

    // Guardar
    cy.contains('button', 'Guardar').click();

    cy.wait('@createProduct').then((interception) => {
      expect(interception.request.body).to.deep.include({
        nombre: 'Cemento Portland',
        categoriaId: "1",
        unidadMedidaId: "1",
        costo: "20.50",
        precioVenta: "25.00"
      });
    });

    cy.contains('h2', 'Nuevo Producto').should('not.exist');
  });
});
