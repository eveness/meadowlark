var Browser = require('zombie'),
    assert = require('chai').assert;
var browser;

suite('Межстраничные тесты', function() {
    setup(function() {
        browser = new Browser();
        Browser.localhost('localhost', 3000);
    });

    test('запрос расценок для групп со страницы туров по реке Худ '
        + 'должен заполнять поле реферрера', function(done) {
        var referrer = '/tours/hood-river';
        browser.visit(referrer, function() {
            browser.clickLink('.requestGroupRate', function(done) {
                console.log(browser.field('referrer').value);
                assert(browser.field('referrer').value === referrer);
                done();
            });
            done();
        });
    });

    test('запрос расценок для групп со страницы туров '
        + 'пансионата "Oregon Coast" должен '
        + 'заполнять поле реферрера', function(done) {
        var referrer = '/tours/oregon-coast';
        browser.visit(referrer, function() {
            browser.clickLink('.requestGroupRate', function(done) {
                console.log(browser.field('referrer').value);
                assert(browser.field('referrer').value === referrer);
                done();
            });
            done();
        });
    });

    test('посещение страницы "Запрос цены для групп" напрямую '
        + 'должен приводить к пустому полю реферрера', function(done) {
        browser.visit('/tours/request-group-rate', function(done) {
            assert(browser.field('referrer').value === '');
            done();
        });
        done();
    });
});