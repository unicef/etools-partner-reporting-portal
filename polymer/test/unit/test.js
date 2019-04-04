describe('frontend tests', function() {
  it('should pass', function() {
    expect(true).toBe(true);
  });
});

describe('ajax calls', function() {

  // beforeEach(function() {
  //   jasmine.Ajax.install();
  // });

  // afterEach(function() {
  //   jasmine.Ajax.uninstall();
  // });

  it('should call ajax asynchronously', function() {
    var doneFn = jasmine.createSpy('success');

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function(args) {
      if(this.readyState === this.DONE) {
        doneFn(this.responseText);
      }
    };

    xhr.open('GET', 'some/cool/url');
    xhr.send();

    expect(jasmine.Ajax.requests.mostRecent().url).toBe('some/cool/url');
  });
});