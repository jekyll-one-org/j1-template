describe('J1 Template Dev - Base Tests', function() {
  it('Visit the Starter Web', function() {
    // open the main page
    cy.visit('http://localhost:41000/')
    // enable debugger-alike behaviour 
    cy.pause()
    // accept cookies
    cy.get('a.cb-enable').click()
    // open another page
    cy.visit('http://localhost:41000/pages/bookshelf/biography/')
  })
})