import chai from 'chai';
import Try from '../src/index.js';

chai.should();

describe ('Try', () => {

	it ('should capture successful computations', () => {
		let mutableVar;
		const t = Try(() => { mutableVar = 1; return "foo"; });
		t.isSuccess.should.equal (true);
		t.isFailure.should.equal (false);
		mutableVar.should.equal (1);
	});

	it ('should capture failing computations', () => {
		let mutableVar;
		const t = Try(() => { mutableVar = 2; throw new Error("meh"); });
		t.isSuccess.should.equal (false);
		t.isFailure.should.equal (true);
		mutableVar.should.equal (2);
	});

	describe ('#orThrow', () => {

		it ('should return successful values', () => {
			Try(() => 1).orThrow().should.equal (1);
		});

		it ('should throw failures', () => {
			const theErr = new Error("bad!");
			Try(() => { throw theErr; }).orThrow.should.Throw(theErr);
		});

	});

	describe ('#orElse', () => {

		it ('should return successful values', () => {
			Try(() => 1).orElse("fax").should.equal (1);
		});

		it ('should return an alternative on failure', () => {
			Try(() => { throw new Error("bix"); }).orElse("box").should.equal("box");
		});

	})

	describe ('#forEach', () => {

		it ('should perform a side-effecting computation with successful values', () => {
			let mutableVar = 0;
			Try(() => 1).forEach(x => mutableVar += x);
			mutableVar.should.equal (1);
		});

		it ('should do nothing with failed computations', () => {
			let mutableVar = 0;
			Try(() => { throw new Error("1"); }).forEach(x => mutableVar += x);
			mutableVar.should.equal (0);
		});

	});

	describe ('#handle', () => {

		it ('should do nothing to successful `Try`s', () => {
			const theTry = Try(() => 23);
			theTry.handle((err) => 40).should.equal (theTry);
			theTry.orThrow().should.equal(23);
		});

		it ('should handle failed `Try`s', () => {
			Try(() => { throw new Error(23); }).handle(() => 40).orThrow().should.equal (40);
		});

		it ('should capture failures to handle', () => {
			const theErr = new Error(40);
			Try(() => { throw new Error(23); }).handle(() => { throw theErr; }).orThrow.should.Throw(theErr);
		});

	});

	describe ('#map', () => {

		it ('should map successful values', () => {
			Try(() => "bippy").map(x => x.replace('b', 'd')).orThrow().should.equal("dippy");
		});

		it ('should do nothing to failed values', () => {
			const theErr = new Error("dingo");
			const theTry = Try(() => { throw theErr; });
			theTry.map(x => x.replace('i', 'o')).should.equal(theTry);
			theTry.orThrow.should.throw(theErr);
		});

		it ('should not catch exceptions thrown whilst mapping', () => {
			const theErr = new Error("catchy");
			(() => Try(() => 1).map(x => { throw theErr; })).should.Throw(theErr);
		});

	});

	describe ('#flatMap', () => {

		it ('should flatMap successful values together', () => {
			Try(() => "bippy").flatMap(x => Try(() => x.replace('b', 'd'))).orThrow().should.equal("dippy");
		});

		it ('should do nothing to failed values', () => {
			const theErr = new Error("dingo");
			const theTry = Try(() => { throw theErr; });
			theTry.flatMap(x => Try(() => x.replace('i', 'o'))).should.equal(theTry);
			theTry.orThrow.should.throw(theErr);
		});

		it ('should flatMap errors after successes', () => {
			const theFailedTry = Try(() => { throw new Error("poncho"); });
			Try(() => "bippy").flatMap(() => theFailedTry).should.equal (theFailedTry);
		});

		it ('should not catch exceptions thrown whilst mapping', () => {
			const theErr = new Error("catchy");
			(() => Try(() => 1).flatMap(x => { throw theErr; })).should.Throw(theErr);
		});

		it ('should check that the binding function returns a `Try`', () => {
			(() => Try(() => "mingy").flatMap(() => "mangy")).should.Throw ();
		});

	});

	describe ('#then', () => {

		it ('should act mostly like #map', () => {
			Try(() => "bippy").then(x => x.replace('b', 'd')).orThrow().should.equal("dippy");
			(() => {
				const theErr = new Error("dingo");
				const theTry = Try(() => { throw theErr; });
				theTry.then(x => x.replace('i', 'o')).should.equal(theTry);
				theTry.orThrow.should.throw(theErr);
			})();
		});

		it ('should act mostly like #flatMap', () => {
			Try(() => "bippy").then(x => Try(() => x.replace('b', 'd'))).orThrow().should.equal("dippy");
			(() => {
				const theErr = new Error("dingo");
				const theTry = Try(() => { throw theErr; });
				theTry.then(x => Try(() => x.replace('i', 'o'))).should.equal(theTry);
				theTry.orThrow.should.throw(theErr);
			})();
			(() => {
				const theFailedTry = Try(() => { throw new Error("poncho"); });
				Try(() => "bippy").then(() => theFailedTry).should.equal (theFailedTry);
			})();
		});

		it ('should capture errors thrown while thenning', () => {
			const theErr = new Error("then");
			Try(() => 1).then(() => { throw theErr; }).orThrow.should.Throw(theErr);
		});

	});

	describe ('#fold', () => {

		it ('should catamorphize successful values', () => {
			Try(() => 1).fold(x => x + 1, err => err.toString()).should.equal (2);
		});

		it ('should catamorphize failed values', () => {
			const theErr = new Error("cata");
			Try(() => { throw theErr; }).fold(x => x + 1, err => err.toString()).should.equal (theErr.toString());
		})
	});

	it ('should serialize successful values reasonably', () => {
		const json = JSON.parse(JSON.stringify(Try(() => 1)));
		Object.keys(json).should.have.members (['success', 'value']);
		json.success.should.equal (true);
		json.value.should.equal (1);
	});

	it ('should serialize failed values reasonably', () => {
		const json = JSON.parse(JSON.stringify(Try(() => { throw -1; })));
		Object.keys(json).should.have.members (['success', 'error']);
		json.success.should.equal (false);
		json.error.should.equal (-1);
	});

	describe ('.success', () => {

		it ('should wrap values', () => {
			const theTry = Try.success(1);
			theTry.should.be.an.instanceof (Try);
			theTry.isSuccess.should.equal (true);
			theTry.orThrow().should.equal (1);
		});

	});

	describe ('.fail', () => {

		it ('should wrap errors', () => {
			const theErr = new Error("wrongo-dongo");
			const theTry = Try.fail(theErr);
			theTry.should.be.an.instanceof (Try);
			theTry.isSuccess.should.equal (false);
			theTry.orThrow.should.Throw (theErr);
		});

	});

	it ('should be a real class', () => {
		(new Try(() => 1)).should.be.an.instanceof (Try);
		Try(() => 1).should.be.an.instanceof (Try);
	});

	it ('should require a function', () => {
		(() => Try(123)).should.Throw();
	})

})
