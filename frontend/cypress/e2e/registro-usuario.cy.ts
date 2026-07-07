describe('Registro de Usuario', () => {
  beforeEach(() => {
    // Interceptar llamadas al API para evitar requerir el backend
    cy.intercept('GET', '/api/users', {
      statusCode: 200,
      body: [
        {
          id: 1,
          nombres: 'Admin',
          apellidos: 'Principal',
          email: 'admin@test.com',
          activo: true,
          rolId: 1,
          sucursalId: 1,
          rol: { nombre: 'SUPERADMIN' },
          sucursal: { nombre: 'Principal' }
        }
      ]
    }).as('getUsers');

    cy.intercept('GET', '/api/roles', {
      statusCode: 200,
      body: [
        { id: 1, nombre: 'SUPERADMIN' },
        { id: 2, nombre: 'CAJERO' }
      ]
    }).as('getRoles');

    cy.intercept('POST', '/api/users', {
      statusCode: 201,
      body: { message: 'Usuario creado exitosamente' }
    }).as('createUser');

    // Bypass authentication middleware
    cy.setCookie('auth_token', 'dummy-token');

    // Visitar la página de usuarios
    cy.visit('/configuracion/usuarios');
    cy.wait(['@getUsers', '@getRoles']);
  });

  it('Debe abrir el modal y permitir el registro de un nuevo usuario', () => {
    // Hacer clic en "Nuevo Usuario"
    cy.contains('button', 'Nuevo Usuario').click();

    // Verificar que el modal se abre
    cy.contains('h3', 'Nuevo Usuario').should('be.visible');

    // Llenar el formulario
    cy.contains('label', 'Nombres').parent().find('input').type('Juan');
    cy.contains('label', 'Apellidos').parent().find('input').type('Perez');
    cy.contains('label', 'Correo Electrónico').parent().find('input').type('juan.perez@test.com');
    cy.contains('label', 'Contraseña').parent().find('input').type('password123');
    
    // Seleccionar rol y estado
    cy.contains('label', 'Rol del Usuario').parent().find('select').select('CAJERO');
    cy.contains('label', 'Estado').parent().find('select').select('true'); // Activo

    // Guardar usuario
    cy.contains('button', 'Guardar Usuario').click();

    // Verificar que se hizo la petición POST con los datos correctos
    cy.wait('@createUser').then((interception) => {
      expect(interception.request.body).to.deep.include({
        nombres: 'Juan',
        apellidos: 'Perez',
        email: 'juan.perez@test.com',
        password: 'password123',
        rolId: '2', // Id del rol CAJERO según el mock
        activo: true
      });
    });

    // Verificar que el modal se cierra (el h3 "Nuevo Usuario" ya no debe existir)
    cy.contains('h3', 'Nuevo Usuario').should('not.exist');
  });
});
