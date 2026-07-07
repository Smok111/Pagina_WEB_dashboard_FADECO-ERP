describe('Ventas (POS)', () => {
  beforeEach(() => {
    // Ignorar excepciones no capturadas de Next.js
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });

    // Burlar el middleware
    cy.setCookie('auth_token', 'dummy-token');

    // Mockear peticiones API
    cy.intercept('GET', '/api/sales', {
      statusCode: 200,
      body: []
    }).as('getSales');

    cy.intercept('GET', '/api/sales/clientes', {
      statusCode: 200,
      body: [
        { id: 1, nombres: 'Cliente Frecuente', numeroDocumento: '77777777', tipoDocumento: 'DNI' }
      ]
    }).as('getClients');

    cy.intercept('GET', '/api/inventory/productos', {
      statusCode: 200,
      body: [
        { id: 1, nombre: 'Producto de Prueba', codigo: 'PROD-001', stockActual: 10, precioVenta: 100.00 }
      ]
    }).as('getProducts');

    cy.intercept('POST', '/api/sales', {
      statusCode: 201,
      body: { message: 'Venta completada exitosamente' }
    }).as('createSale');

    // Visitar la página de ventas
    cy.visit('/ventas');
    cy.wait(['@getSales', '@getClients', '@getProducts']);
  });

  it('Debe abrir el modal, llenar el carrito y emitir una venta', () => {
    // Clic en "Nueva Venta"
    cy.contains('button', 'Nueva Venta').click();

    // Validar modal
    cy.contains('h3', 'Registro de Venta').should('be.visible');

    // Seleccionar cliente
    cy.contains('label', 'Cliente').parent().parent().find('select').select('1');

    // Seleccionar comprobante
    cy.contains('label', 'N° Comprobante').parent().find('select').select('BOLETA');

    // Buscar y añadir producto al carrito
    cy.get('input[placeholder*="Buscar producto"]').type('PROD');
    
    // Seleccionar el producto de la lista (dropdown)
    cy.contains('button', 'PROD-001').click();

    // Validar que el producto se añadió a la tabla del carrito
    cy.contains('td', 'Producto de Prueba').should('be.visible');

    // Enviar venta ("Cobrar y Emitir")
    cy.contains('button', 'Cobrar y Emitir').click();

    // Validar POST request
    cy.wait('@createSale').then((interception) => {
      expect(interception.request.body).to.deep.include({
        clienteId: "1",
        tipoDocumento: "BOLETA"
      });
      expect(interception.request.body.detalles[0]).to.deep.include({
        productoId: 1,
        cantidad: 1,
        precioUnitario: 100
      });
    });

    // Validar que el modal se cierra
    cy.contains('h3', 'Registro de Venta').should('not.exist');
  });
});
