// Dependencies
const Code = require ('code');
const Lab = require ('lab');

// Constants
const expect = Code.expect;
const lab = exports.lab = Lab.script();

// Tests
lab.test ('Hello', done => {
	expect (1 + 1).to.be.equal (2);
	done ();
});
