#!/usr/bin/bash
mocha -u tdd -R spec qa/tests-crosspage.js
mocha -u tdd -R spec qa/tests-unit.js