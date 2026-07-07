describe('Compras e Ingreso a Almacén', () => {
  beforeEach(() => {
    cy.on('uncaught:exception', (err, runnable) => {
      return false;
    });

    cy.setCookie('auth_token', 'dummy-token');

    cy.intercept('GET', '/api/purchases', {
      statusCode: 200,
      body: []
    }).as('getPurchases');

    cy.intercept('GET', '/api/purchases/proveedores', {
      statusCode: 200,
      body: [
        { id: 1, razonSocial: 'Proveedor de Prueba SAC', ruc: '20123456789' }
      ]
    }).as('getProviders');

    cy.intercept('GET', '/api/inventory/almacenes', {
      statusCode: 200,
      body: [
        { id: 1, nombre: 'Almacén Principal' }
      ]
    }).as('getWarehouses');

    cy.intercept('GET', '/api/inventory/productos', {
      statusCode: 200,
      body: [
        { id: 1, nombre: 'Materia Prima 1', codigo: 'MP-001', stockActual: 50, costo: 10.00 }
      ]
    }).as('getProducts');

    cy.intercept('POST', '/api/purchases', {
      statusCode: 201,
      body: { message: 'Compra registrada exitosamente', id: 999 }
    }).as('createPurchase');

    cy.visit('/compras');
    cy.wait(['@getPurchases', '@getProviders', '@getWarehouses', '@getProducts']);
  });

  it('Debe abrir el modal de compra, llenar detalles y procesar ingreso', () => {
    cy.contains('button', 'Nueva Compra').click();

    cy.contains('h3', 'Registrar Ingreso por Compra').should('be.visible');

    // Seleccionar Proveedor
    cy.contains('label', 'Proveedor').parent().parent().find('select').select('1');

    // Seleccionar Almacén Destino
    cy.contains('label', 'Almacén Destino').parent().find('select').select('1');

    // Seleccionar Tipo Comprobante
    cy.contains('label', 'Tipo Comprobante').parent().find('select').select('FACTURA');

    // Llenar N° Documento
    cy.contains('label', 'N° Documento').parent().find('input').type('F001-00123');

    // Agregar producto
    cy.get('input[placeholder*="Buscar producto"]').type('MP-001');
    cy.contains('button', 'MP-001').click();

    // Validar producto en tabla
    cy.contains('td', 'Materia Prima 1').should('be.visible');

    // Enviar formulario
    cy.contains('button', 'Procesar Compra e Ingresar').click();

    // Validar request
    cy.wait('@createPurchase').then((interception) => {
      expect(interception.request.body).to.deep.include({
        proveedorId: "1",
        almacenId: "1",
        tipoDocumento: "FACTURA",
        numeroDocumento: "F001-00123"
      });
      expect(interception.request.body.detalles[0]).to.deep.include({
        productoId: 1,
        cantidad: 1,
        precioUnitario: 10
      });
    });

    cy.contains('h3', 'Registrar Ingreso por Compra').should('not.exist');
  });
});
