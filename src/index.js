function Try(block) {
  if (!(this instanceof Try)) return new Try(block);
  
  if (typeof block !== 'function') {
    throw new TypeError(`value ${block} passed to Try should have been a function`);
  }

  let value;
  let error;
  let success;

  try {
    value = block();
    success = true;
  } catch (caught) {
    error = caught;
    success = false;
  }

  /** Does this `Try` contain a successfully-computed value?
    */
  this.isSuccess = success;

  /** Did the computation wrapped by this `Try` fail? 
    */
  this.isFailure = !success;

  /** Get the value of this `Try`, or return the argument if the computation failed. */
  this.orElse = (alternative) => success ? value : alternative;

  /** Get the value of this `Try`, or throw the error raised during computation. */
  this.orThrow = () => {
    if (success) return value;
    else throw error;
  };

  /** If this `Try` contains a value, call the argument with that value for side-effects. */
  this.forEach = (cb) => success && cb(value);

  /** If this `Try` contains a value, return this `Try`.
    * Otherwise, attempt to handle the error by passing the error to the argument:
    * - If the argument returns a value, then return a successful `Try` containing that value
    * - If the argument raises an error, then return a failed `Try` with that error.
    */
  this.handle = (handler) => success ? this : Try(() => handler(error));

  /** Transform the value in this `Try`, if it exists, with the argument function.
    * Any errors thrown by the argument are thrown immediately. Contrast with `then`.
    */
  this.map = (fn) => {
    if (success) {
      const next = fn(value);
      return Try(() => next);
    } else {
      return this;
    }
  }

  /** Transform the value in this `Try`, if it exists, with the argument function, which
    * should return another `Try`; otherwise, return this `Try`.
    * Any errors thrown by the argument are thrown immediately. Contrast with `then`.
    */
  this.flatMap = (fn) => {
    if (success) {
      const next = fn(value);
      console.assert(next instanceof Try, 
        `The function passed to Try.flatMap should have returned another Try (got ${next} instead)`);
      return next;
    } else {
      return this;
    }
  }

  /** Idiomatic Javascript pseudo-monadic `map`/`flatMap`.
    * Transform the value contained in this `Try` using the provided function:
    * - If it returns another `Try`, that `Try`.
    * - If it returns a value, a successful `Try` containing that value.
    * - If it raises an error, a failed `Try` containing that error.
    */
  this.then = (fn) => {
      if (success) {
        const next = Try(() => fn(value));
        if (next.isSuccess) {
          return (next.orThrow() instanceof Try) ? next.orThrow() : next;
        } else {
          return next;
        }
      } else {
        return this;
      }
    };

  /** Catamorphism.
    * Pass a successful value into the first argument, or the error into the second.
    */
  this.fold = (onSuccess, onFailure) => success ? onSuccess(value) : onFailure(error);

  this.toJSON = () => ({ success, value, error: error });

  return Object.freeze(this);
};

/** Wrap an eagerly-evaluated value in a `Try`. */
Try.success = (value) => Try(() => value);

/** Wrap an eagerly-evaluated error in a `Try`. */
Try.fail = (err) => Try(() => { throw err; });

module.exports = Try;
