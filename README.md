# try-monad

A small, reasonably featureful wrapper for somewhat more fluent use of `try/catch` in javascript.

## Install:

```bash
yarn add try-monad
```
or
```bash
npm install --save try-monad
```

You know how it works.

## Use:

Read the [source code](src/index.js)! It's really basic and has tons of inline doc comments and whatnot.

### Use (for lazy people only):

```javascript
import Try from 'try-monad';

const tryMyThing = Try(() => { dangerouslyComputeThing(); });

if (tryMyThing.isSuccess) {
	console.log("a winner is me!");
	console.log("won with: " + tryMyThing.orThrow());
}

if (tryMyThing.isFailure) {
	console.log("darnit");
	tryMyThing.handle(err => {
		console.log("failed with: " + err);
	});
}

tryMyThing.map(result => "RESULT: " + result);

tryMyThing.flatMap(result => Try(() => anotherDangerousThing(result)));

tryMyThing.fold(value => ..., error => ...);
```

### Does it serialize?

You bet it does:
```javascript
JSON.stringify(Try.success(1))
// {"success": true, "value": 1}

JSON.stringify(Try.fail("bah!"))
// {"success": false, "error": "bah!"}
```

### Is it one of those `Thenable` things?

ugh. yes. yes it is. give it a whirl and see.


## License

Do what you want with it. Name-drop me if you really like it.

See the [LICENSE](COPYING) for the details.