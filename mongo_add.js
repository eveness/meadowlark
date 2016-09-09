var credentials = require('./credentials.js');
var mongoose = require('mongoose');
var opts = {
	server: {
		socketOption: { keepAlive: 1 }
	}
};
var Vacation = require('./models/vacation.js');

mongoose.connect(credentials.mongo.development.connectionString, opts);

new Vacation({
    name: 'Однодневный тур по реке Худ',
    slug: 'hood-river-day-trip',
    category: 'Однодневный тур',
    sku: 'HR199',
    description: 'Проведите день в плавании по реке Колумбия и насладитесь сваренным по традиционным рецептам пивом на реке Худ!',
    priceInCents: 9995,
    tags: ['однодневный тур', 'река худ', 'плавание', 'виндсерфинг', 'пивоварни'],
    inSeason: true,
    maximumGuests: 16,
    available: true,
    packagesSold: 0,
}).save();

new Vacation({
    name: 'Отдых в Орегон Коуст',
    slug: 'oregon-coast-getaway',
    category: 'Отдых на выходных',
    sku: 'OC39',
    description: 'Насладитесь океанским воздухом и причудливыми прибрежными городками!',
    priceInCents: 269995,
    tags: ['отдых на выходных', 'орегон коуст', 'прогулки по пляжу'],
    inSeason: false,
    maximumGuests: 8,
    available: true,
    packagesSold: 0,
}).save();

new Vacation({
    name: 'Скалолазание в Бенде',
    slug: 'rock-climbing-in-bend',
    category: 'Приключение',
    sku: 'B99',
    description: 'Пощекочите себе нервы горным восхождением на пустынной возвышенности.',
    priceInCents: 289995,
    tags: ['отдых на выходных', 'бенд', 'пустынная возвышенность', 'скалолазание'],
    inSeason: true,
    requiresWaiver: true,
    maximumGuests: 4,
    available: false,
    packagesSold: 0,
    notes: 'Гид по данному туру в настоящий момент восстанавливается после лыжной травмы..',
}).save();
