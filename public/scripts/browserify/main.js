(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"/Users/sumitsourav/Work/Code/node_modules/underscore/underscore.js":[function(require,module,exports){
//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (typeof define === 'function' && define.amd) {
    define('underscore', [], function() {
      return _;
    });
  }
}.call(this));

},{}],"/Users/sumitsourav/Work/Code/public/scripts/components/DataTable.js":[function(require,module,exports){
var mc = module.exports
mc.Datatable = (function () {
    var ids = 0;

    var dt = {
        controller: function (cols, config) {
            this.cols = cols;
            this.config = config = config || {};

            this.currentSelection = [];

            if (config.url) {
                this.data = m.request({
                    url: config.url,
                    header: config.header, 
                    config: function (xhr) {
                        xhr.setRequestHeader('Authorization', config.authorization);
                    },
                    method: 'GET'
                });
            }

            if (config.data) {
                this.data = (typeof config.data == 'function' ? config.data : m.prop(config.data));
            }

            this.sort = function (target) {
                var key = target.parentNode.getAttribute('data-colkey'),
                    col = this.activeCols[key];
                
                if (this.lastSorted && this.lastSorted != key) {
                    this.activeCols[this.lastSorted]._sorted = 'none';
                }
                
                var reverse = (col._sorted == 'asc' ? -1 : 1);
                this.data(this.data().sort(function (a, b) {
                    a = a[key];
                    b = b[key];
                    return (a == b ? 0 : (a < b ? -1 : 1) * reverse);
                }));
                
                col._sorted = (reverse > 0 ? 'asc' : 'desc');
                
                this.lastSorted = key;
                
                m.render(this._tableEl, dt.contentsView(this));
            };

            this.onCellClick = function (target) {
                while (target.nodeName != 'TD' && target.nodeName != 'TABLE') target = target.parentNode;
                
                if (target.nodeName == 'TABLE') return;

                var colIndex = target.cellIndex,
                    col = this.dataRow[colIndex],
                    recordId = target.parentNode.getAttribute('data-record-id'),
                    idField = config.recordId || 'id',
                    row;

                this.data().some(function (r) {
                    if (r[idField] == recordId) {
                        row = r;
                        return true;
                    }
                });

                m.startComputation();
                var ret = this.config.onCellClick.call(this, row[col.field || col.key], row, col);
                m.endComputation();
                return ret;
            };

            this.onRowSelect = function (e, target) {
                var rs = this.config.rowSelect,
                    multi = rs.multiple,
                    callback = rs.callback,
                    sel = this.currentSelection || [],
                    lastSel = this.lastSelection,
                    inRange = false,
                    idField = config.recordId || 'id';

                if (typeof callback != 'function') return;

                while (target.nodeName != 'TR' && target.nodeName != 'TABLE') target = target.parentNode;

                if (target.nodeName == 'TABLE') return;

                var recordId = target.getAttribute('data-record-id');
                if (parseInt(recordId, 10) == recordId) recordId = parseInt(recordId, 10);

                m.startComputation();

                if (multi && e.ctrlKey) {
                    var i = sel.indexOf(recordId);
                    if (i == -1) {
                        sel.push(recordId);
                    } else {
                        sel.splice(i, 1);
                    }
                } else if (multi && e.shiftKey) {
                    clearSelection();
                    this.data().forEach(function (row) {
                        var id = row[idField];
                        if (inRange) {
                            if (sel.indexOf(id) == -1) sel.push(id);
                            if (id == lastSel || id == recordId) inRange = false;
                        } else {
                            if (id == lastSel || id == recordId) {
                                if (sel.indexOf(id) == -1) sel.push(id);
                                inRange = true;
                            }
                        }
                    });
                } else {
                    sel = (sel.length == 1 && sel[0] == recordId ? [] : [recordId]);
                }
                this.lastSelection = recordId;
                this.currentSelection = sel;
                callback(sel);
                m.endComputation();
            };

            this.onclick = function (e) {
                var target = e.target;
                if (target.nodeName == 'I' && /\bfa\-sort/.test(target.className)) return this.sort(target);
                if (this.config.rowSelect) {
                    this.onRowSelect(e, target);
                }
                if (typeof this.config.onCellClick == 'function') {
                    return this.onCellClick(target);
                }

            }.bind(this);

            this.setWidth = function (attrs, width) {
                if (!width) return;
                if (/^\d+$/.test(width)) width += 'px';
                if (!attrs.style) attrs.style = '';
                if (width) attrs.style += 'width:' + width + ';';
            };
        },
        view: function (ctrl, options) {
            var cols = ctrl.cols;
            ctrl.viewOptions = options;

            if (!ctrl.data()) {
                return m('div', 'Sorry, no data to display');
            }
            options = options || {};
            options.classNames = options.classNames || {};

            var attrs = {
                class: options.classNames.table || 'table table-striped table-bordered table-hover',
                config: function (el, isOld) {
                    if (isOld) return;
                    el.addEventListener('click', ctrl.onclick);
                    ctrl._tableEl = el;
                    m.module(el, {
                        controller: function () {
                            return ctrl;
                        },
                        view: dt.contentsView
                    });
                }
            };

            ctrl.setWidth(attrs, options.width);

            return m(
                'table',
                attrs
            );
        },
        contentsView: function (ctrl) {
            var cols = ctrl.cols,
                options = ctrl.viewOptions;

            return [
                dt.headView(ctrl, cols, options),
                dt.bodyView(ctrl, cols, options, ctrl.data()),
                dt.captionView(ctrl, options)
            ];
        },
        headView: function (ctrl, cols, options) {
            var matrix = [],
                rowNum = 0,
                dataRow = [];
            var calcDepth = function (maxDepth, col) {
                var depth = 0;
                if (!matrix[rowNum]) {
                    matrix[rowNum] = [];
                }
                matrix[rowNum].push(col);
                if (col.children) {
                    col._colspan = col.children.length;
                    rowNum++;
                    depth = col.children.reduce(calcDepth, 0) + 1;
                    rowNum--;
                    depth = Math.max(maxDepth, depth);
                } else {
                    dataRow.push(col);
                }
                col._depth = depth;
                return depth;
            };

            var maxDepth = cols.reduce(calcDepth, 0);
            ctrl.dataRow = dataRow;
            var activeCols = {};
            dataRow.forEach(function (col) {
                activeCols[col.key] = col;
            });
            ctrl.activeCols = activeCols;

            var buildHeaderRow = function (row, rowNum) {
                var buildHeaderCell = function (col) {
                    var attrs = {};
                    if (col._colspan && col._colspan > 1) attrs.colspan = col._colspan;
                    if (col.class) attrs.class = col.class;
                    if (!col._depth) {
                        attrs['data-colKey'] = col.key;
                        ctrl.setWidth(attrs, col.width);
                        if (rowNum < maxDepth) attrs.rowspan = maxDepth - rowNum + 1;
                        if (col._sorted && col._sorted != 'none') attrs.class = options.classNames.sorted || 'sorted';
                    }

                    return m(
                        'th',
                        attrs, [
                            (!col._depth && col.sortable ? m(
                                'i.fa', {
                                    class: {
                                        asc: 'fa-sort-asc',
                                        desc: 'fa-sort-desc',
                                        none: 'fa-sort'
                                    }[col._sorted || 'none']
                                }
                            ) : ''),
                            m.trust(' '),
                            col.label || col.key
                        ]
                    );
                };

                return m(
                    'tr',
                    row.map(buildHeaderCell)
                );
            };
            return m('thead', matrix.map(buildHeaderRow));
        },

        bodyView: function (ctrl, cols, options, data) {
            var idField = ctrl.config.recordId || 'id';
            var buildDataRow = function (row, rowIndex) {
                var buildDataCell = function (col) {
                    var value = row[col.field || col.key],
                        attrs = {};

                    if (typeof col.formatter == 'function') {
                        value = col.formatter.call(ctrl, value, row, col, attrs);
                    }
                    if (!attrs.class) attrs.class = '';
                    if (col._sorted && col._sorted != 'none') attrs.class += ' ' + (options.classNames.sorted || 'sorted');
                    if (col.class) attrs.class += ' ' + col.class;

                    if (!attrs.class) delete attrs.class;
                    return m(
                        'td',
                        attrs,
                        value
                    );
                };
                if (row[idField] === undefined) row[idField] = ids++;
                var recordId = row[idField];

                return m(
                    'tr', {
                        'data-record-id': recordId,
                        class: (rowIndex & 1 ? options.classNames.odd || 'odd' : options.classNames.even || 'even') +
                        (ctrl.currentSelection.indexOf(recordId) != -1 ? options.classNames.selected || ' selected' : '')
                    },
                    ctrl.dataRow.map(buildDataCell)
                );
            };
            return m('tbody', data.map(buildDataRow));
        },
        captionView: function (ctrl, options) {
            if (options.caption) return m('caption', options.caption);
        },
    };

    /* global document:false, window:false */
    function clearSelection() {
        if (document.selection && document.selection.empty) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
    }

    return dt;
})();
},{}],"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js":[function(require,module,exports){
var Auth = require('../models/Auth.js');

var Navbar = module.exports = {
  controller: function() {
    var ctrl = this;

    var links = (Auth.token() ?
    [
      { label: 'Tickets', href: '/tickets' },
      { label: 'New Ticket', href: '/ticketEdit' },
      (Auth.user_type() == 'Admin'? { label: 'Users', href: '/users' }:{}),
      { label:'Logout', href:'/logout' }
    ]:[
      { label: 'Login', href: '/login' },
      { label: 'Register', href: '/register' }
    ])
    .map(function(l){
      return m("li" + (m.route() === l.href ? '.active': ''), m("a[href='" + l.href + "']", l.normal?{}:{config: m.route}, l.label));
    });

    ctrl.links = m.prop(links);

    ctrl.iconDirection = m.prop('down');

    ctrl.toggle = function(){
      ctrl.iconDirection( ctrl.iconDirection()=='up' ? 'down':'up' );
    };
  },

  view: function(ctrl) {
    return m("nav.navbar.navbar-inverse.navbar-fixed-top", [
      m(".container", [
        m(".navbar-header",
          m('button.navbar-toggle', {onclick: ctrl.toggle}, m('.glyphicon.glyphicon-chevron-' + ctrl.iconDirection())),
          m("a.navbar-brand[href='/']", {config: m.route}, "Crossover Ticket System")
        ),
        m(".navbar-collapse." + ctrl.iconDirection(), 
          m("ul.nav.navbar-nav.navbar-right", ctrl.links())
        )
      ])
    ]);
  }
};
},{"../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/main.js":[function(require,module,exports){
// main.js

'use strict';

var _ = require('underscore');

var req = function(args) {
  return m.request(args)
}

m.route(document.body, "/", {
  "/": require('./pages/Tickets.js'),
  "/login": require('./pages/Login.js'),
  "/logout": require('./pages/Logout.js'),
  "/register": require('./pages/Register.js'),
  "/ticketEdit": require('./pages/TicketEdit.js'),
  "/verify/:code": require('./pages/Verify.js'),
  "/ticket": require('./pages/TicketPage.js'),
  "/userEdit": require('./pages/UserEdit.js'),
  "/tickets": require('./pages/Tickets.js'),
  "/reports": require('./pages/Report.js'),
  "/users": require('./pages/Users.js'),
  "/users/:id": require('./pages/UserDelete.js'),
  "/tasty": require('./pages/Tasty.js')
});

},{"./pages/Login.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Login.js","./pages/Logout.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Logout.js","./pages/Register.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Register.js","./pages/Report.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Report.js","./pages/Tasty.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Tasty.js","./pages/TicketEdit.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketEdit.js","./pages/TicketPage.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketPage.js","./pages/Tickets.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Tickets.js","./pages/UserDelete.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/UserDelete.js","./pages/UserEdit.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/UserEdit.js","./pages/Users.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Users.js","./pages/Verify.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Verify.js","underscore":"/Users/sumitsourav/Work/Code/node_modules/underscore/underscore.js"}],"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js":[function(require,module,exports){
var Auth = module.exports = {
  token: m.prop(localStorage.token),
  user_type: m.prop(localStorage.user_type),
  
  // trade credentials for a token
  login: function(email, password) {
    return m.request({
      method: 'POST',
      url: '/auth/login',
      data: {email:email, password:password},
      unwrapSuccess: function(res) {
        localStorage.token = res.auth_token;
        localStorage.user_type = res.user_type;

        Auth.user_type(res.user_type);

        return res.auth_token;
      }
    })
    .then(this.token);
  },

  // forget token
  logout: function(){
    this.token(false);
    delete localStorage.token;
  },

  // signup on the server for new login credentials
  register: function(email, password,name,type) {
    return m.request({
      method: 'POST',
      url: '/users',
      data: { user: { email: email, password: password, type: type, name: name}}
    });
  },

  // ensure verify token is correct
  verify: function(token) {
    return m.request({
      method: 'POST',
      url: '/auth/verify',
      data: { token: token }
    });
  },

  // get current user object
  user: function() {
    return Auth.req('/users/me');
  },

  // make an authenticated request
  req: function(options){
    if (typeof options == 'string') {
      options = { method: 'GET', url: options };
    }

    var oldConfig = options.config || function() {};

    options.config = function(xhr) {
      xhr.setRequestHeader("Authorization",  Auth.token());
      oldConfig(xhr);
    };

    // try request, if auth error, redirect
    // TODO: remember where the user was, originally
    var deferred = m.deferred();
    m.request(options).then(deferred.resolve, function(err) {
      if (err.status === 401) {
        Auth.originalRoute = m.route();
        m.route('/login');
      }
    });

    return deferred.promise;
  }
};
},{}],"/Users/sumitsourav/Work/Code/public/scripts/models/Ticket.js":[function(require,module,exports){
// Ticket model
var Auth = require('../models/Auth.js');
var Ticket = module.exports = {

    // Ticket = { id: integer, title: text, status: integer, agent_id: integer, customer_id: integer
    //     , department_id: integer, priorety: integer, done_date: datetime, created_at: datetime,
    //      updated_at: datetime }

    send: function (data,id) {
        return m.request({
            method: id ? 'PUT' : 'POST',
            url: '/tickets'+(id?'/'+id : '') 
            , config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            data: { ticket: data }
        });
    },
    download: function (user_id, report_format) {
        return m.request({
            method: 'POST',
            url: '/download_report', config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            data: {user_id:user_id, report_format:report_format},
        });
    },
    get: function (id) {
        return m.request({
            method: 'get',
            url: '/tickets/'+id,
            config: function (xhr) {
        xhr.setRequestHeader('Authorization', Auth.token());
    }

        });
    },
};

module.exports = Ticket;
},{"../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/models/User.js":[function(require,module,exports){
// User model
var Auth = require('../models/Auth.js');
var User = module.exports = {

    // Ticket = { id: integer, title: text, status: integer, agent_id: integer, customer_id: integer
    //     , department_id: integer, priorety: integer, done_date: datetime, created_at: datetime,
    //      updated_at: datetime }

    all: function (id) {
      return m.request({
          method: 'get',
          url: '/users',
          config: function (xhr) {
      xhr.setRequestHeader('Authorization', Auth.token());
    },
      });
    },

    get: function (id) {
        return m.request({
            method: 'get',
            url: '/users/'+id,
            config: function (xhr) {
        xhr.setRequestHeader('Authorization', Auth.token());
    }

        });
    },

    send: function (data,id) {
        return m.request({
            method: id ? 'PUT' : 'POST',
            url: '/users'+(id?'/'+id : '') 
            , config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            data: { user: data }
        });
    },

    delete: function (id) {
        return m.request({
            method: 'DELETE',
            url: '/users'+(id?'/'+id : '') 
            , config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            },
            data: { id: id }
        });
    },
};

module.exports = User;
},{"../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Login.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');

var Login = module.exports = {
  controller: function(){
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    this.login = function(e){
      e.preventDefault();
      Auth.login(e.target.email.value, e.target.password.value)
        .then(function(){
          m.route(Auth.originalRoute || '/', null, true);
        }, function(err){
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", err.message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      m("form.text-center.row.form-signin", {onsubmit:ctrl.login.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          m("h1", "Login"),
          ctrl.error(),
          m('.form-group', [
            m("label.sr-only[for='inputEmail']", "Email address"),
            m("input.form-control[name='email'][autofocus][id='inputEmail'][placeholder='Email address'][required][type='email']"),
          ]),
          m('.form-group', [
            m("label.sr-only[for='inputPassword']", "Password"),
            m("input.form-control[name='password'][autocomplete='off'][id='inputPassword'][placeholder='Password'][required][type='password']"),
          ]),
          m('.form-group',
            m("button.btn.btn-lg.btn-primary.btn-block[type='submit']", "Sign in")
          )
        ])
      )
    ])];
  }
};
},{"../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Logout.js":[function(require,module,exports){
var Auth = require('../models/Auth.js');

var Logout = module.exports = {
  controller: function(){
    Auth.logout();
    m.route('/login');
  },

  view: function(ctrl){
  }
};
},{"../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Register.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');

var Register = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.register = function(e) {
      e.preventDefault();

      if (e.target.password.value !== e.target.password2.value) {
        ctrl.error(m(".alert.alert-danger.animated.fadeInUp", 'Passwords must match.'));
        return;
      }

      Auth.register(e.target.email.value, e.target.password.value, e.target.name.value, e.target.type.value).then(function() {
          ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'Cool. Now you can login!'));
        }, function(err) {
          var message = 'An error occurred.';

          if (err && err.code && err.code === 11000) {
            message = 'There is already a user with that email address.';
          }

          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      m("form.text-center.row.form-signin", {onsubmit:ctrl.register.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          m("h1", "Register"),
          ctrl.error(),
          m('.form-group', [
            m("label.sr-only[for='inputEmail']", "Email address"),
            m("input.form-control[name='email'][autofocus][id='inputEmail'][placeholder='Email address'][required][type='email']"),
          ]),m('.form-group', [
            m("label.sr-only[for='inputname']", "Name"),
            m("input.form-control[name='name'][autofocus][id='inputname'][placeholder='Name'][required][type='name']"),
          ]),
          m('.form-group', [
            m("label.sr-only[for='inputPassword']", "Password"),
            m("input.form-control[name='password'][autocomplete='off'][id='inputPassword'][placeholder='Password'][required][type='password']"),
          ]),
          m('.form-group', [
            m("label.sr-only[for='inputPassword2']", "Password (again)"),
            m("input.form-control[name='password2'][autocomplete='off'][id='inputPassword2'][placeholder='Password (again)'][required][type='password']"),
          ]),m('.form-group', [
            m("label.sr-only[for='inputType']", "Type"),
            m("select.form-control[name='type'][required]",[m("option[value='Agent']","Agent"),m("option[value='Customer']",'Customer'),m("option[value='Admin']",'Admin')]),
          ]),
          m('.form-group',
            m("button.btn.btn-lg.btn-primary.btn-block[type='submit']", "Sign in")
          )
        ])
      )
    ])];
  }
};
},{"../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Report.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');
var TicketPage = require('../pages/TicketPage.js');

  var Reports = module.exports = {
    controller: function(){
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    this.report = function(e){
      e.preventDefault();
      Ticket.download(e.target.user_id.value, e.target.report_format.value)
        .then(function(){
          m.route(Ticket.originalRoute || '/', null, true);
        }, function(err){
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", err.message));
        });
    };

    this.datatable = new mc.Datatable.controller(
      // Columns definition:
      [
        { key: "title",label: "Title", sortable: true },
        { key: "agent_id",label: "Agent", sortable: true },
        { key: "customer_id",label: "Customer", sortable: true },
        { key: "priorety",label: "Priority"},
        { key: "status",label: "Status", sortable: true },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'report?user_id=2',
        authorization: Auth.token(),
        // Handler of click event on data cell
        // It receives the relevant information already resolved
        onCellClick: function (content, row, col) {
          console.log(content, row, col);
          m.route("/ticket",{id:row.id})
        }
      }
    );
  },

  view: function (ctrl) {
    return [Navbar, m('.container', [
      m('h1', 'Generate Report: Crossover Ticket System'),
      m('br'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'My Tickets'
      }),
      m("form.text-center.row.form-report", {onsubmit:ctrl.report.bind(ctrl)},
        m('.col-lg-6.col-md-6.col-sm-6.col-xs-12', [
          ctrl.error(),
          m("input.form-control[name='user_id'][autofocus][required][value='2'][type='hidden']"),
          m("input.form-control[name='report_format'][autofocus][required][value='PDF'][type='hidden']"),
          m("button.btn.btn-success.btn-block[type='submit']", "Download PDF")
        ])
      )
    ])];
  }
};
},{"../components/DataTable.js":"/Users/sumitsourav/Work/Code/public/scripts/components/DataTable.js","../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js","../models/Ticket.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Ticket.js","../pages/TicketPage.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketPage.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Tasty.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');

var Tasty = module.exports = {
  controller: function(){
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.user = m.prop();

    this.datatable = new mc.Datatable.controller(
        // Columns definition:
        [
            {key:"Empty"},
            {key:"Numbers", children:[
                {key:"SKU", label:"SKU", sortable:true},
                {key:"Quantity", sortable:true, class:'right-aligned'}
            ]},
            {key:"Text", children:[
                {key:"Item", sortable:true},
                {key:"Description", sortable:true, width:200}
            ]}
        ],
        // Other configuration:
        {
            // Address of the webserver supplying the data
            url:'data/stock.json',

            // Handler of click event on data cell
            // It receives the relevant information already resolved
            onCellClick: function (content, row, col) {
                console.log(content, row, col);
            }
        }
    );
  },
  
  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m('.container', [
      m('h1', 'tasty'),
        mc.Datatable.view(ctrl.datatable,  {
            caption:'this is the caption'
        })
    ])];
  }
};
},{"../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketEdit.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');

var TicketEdit = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.ticket = function(e){
      e.preventDefault();

      Ticket.send({title: e.target.title.value,body: e.target.body.value})
        .then(function(){
          ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'ticket has been saved'));
        }, function(err){
          var message = 'An error occurred.';
          
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      m("form.text-center.row.form-signin", {onsubmit:ctrl.ticket.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          m("h1", "New Ticket"),
          ctrl.error(),
          m('.form-group', [
            m("label.sr-only[for='inputTicket']", "Ticket description"),
            m("input.form-control[name='title'][autofocus][id='inputTitle'][placeholder='Title '][required][type='text']"),
          ]),m('.form-group', [
            m("label.sr-only[for='inputTicket']", "Ticket description"),
            m("textarea.form-control[name='body'][autofocus][id='inputbody'][placeholder='body '][required][type='text']"),
          ]),
         
          m('.form-group',
            m("button.btn.btn-lg.btn-primary.btn-block[type='submit']", "Save")
          )
        ])
      )
    ])];
  }
};
},{"../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js","../models/Ticket.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Ticket.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketPage.js":[function(require,module,exports){
// ticket page to view ticket a, comments  and notes if agent
var Ticket = require('../models/Ticket.js');
var Navbar = require('../components/Navbar.js');

var TicketPage = module.exports = {
  controller: function (args) {
    var ctrl = this;
    ctrl.error = m.prop('');

    ctrl.open = function (status) {
      ctrl.ticket().ticket.status = status
      Ticket.send({ status: status }, m.route.param().id)
        .then(function (ticket) {
          ctrl.ticket().ticket = ticket
        }, function (err) {
          var message = 'An error occurred.';
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    }

    Ticket.get(m.route.param().id)
      .then(function (ticket) {

        ctrl.ticket = m.prop(ticket)
      }, function (err) {
        var message = 'An error occurred.';
       m.route('/tickets')
        ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
      });
  },
  view: function (ctrl) {
    return [Navbar, m('.container', [[
      m("h2", "Ticket"),
      ctrl.error(),
      m("p", ctrl.ticket().ticket.title),m("p", ctrl.ticket().ticket.body),
      m("table.table.table-condensed.table-bordered", [
        m("thead", [
          m("tr", [
            m("th", "Customer"),
            m("th", "Agent"),
            m("th", "Creation Date"),
            m("th", "Done Date"),
            m("th", "Status"),
            m("th", "Priority"),
          ])
        ]),
        m("tbody", [
          m("tr", [
            m("td", ctrl.ticket().ticket.customer_id),
            m("td", ctrl.ticket().ticket.agent_id),
            m("td", ctrl.ticket().ticket.created_at),
            m("td", ctrl.ticket().ticket.done_date),
            m("td", ctrl.ticket().ticket.status),
            m("td", m("span.label", { class: ctrl.ticket().ticket.priorety == "low" ? "label-default" : ctrl.ticket().ticket.priorety == "medium" ? "label-primary" : "label-danger" }, ctrl.ticket().ticket.priorety))
          ]),
        ])
      ]),

      ctrl.ticket().ticket.status == 'closed' ? m("button.btn.btn-warning", { onclick: ctrl.open.bind(ctrl, 'opened') }, "Opened") :
        m("button.btn.btn-danger", { onclick: ctrl.open.bind(ctrl, 'closed') }, "Close")
      ]]
    )];
  }

}
},{"../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Ticket.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Ticket.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Tickets.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');
var TicketPage = require('../pages/TicketPage.js');

var Tickets = module.exports = {
  controller: function () {
    var ctrl = this;
    
    ctrl.prioretyFromate = function (value, row, col, attrs){
      if (value == 'high') attrs.class = 'label label-danger';
      return value;
    }
    
    this.datatable = new mc.Datatable.controller(
      // Columns definition:
      [
        { key: "title",label: "Title", sortable: true },
        { key: "agent_id",label: "Agent", sortable: true },
        { key: "customer_id",label: "Customer", sortable: true },
        { key: "priorety",label: "Priority"},
        { key: "status",label: "Status", sortable: true },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'tickets',
        authorization: Auth.token(),
        // Handler of click event on data cell
        // It receives the relevant information already resolved
        onCellClick: function (content, row, col) {
          console.log(content, row, col);
          m.route("/ticket",{id:row.id})
        }
      }
    );
  },

  view: function (ctrl) {
    return [Navbar, m('.container', [
      m('h1', 'Crossover Ticket System'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'My Tickets'
      }),
      m("a.btn.btn-primary.pull-right[href='/reports']", {config: m.route}, "Get Report")
    ])];
  }
};
},{"../components/DataTable.js":"/Users/sumitsourav/Work/Code/public/scripts/components/DataTable.js","../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js","../models/Ticket.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Ticket.js","../pages/TicketPage.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketPage.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/UserDelete.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var User = require('../models/User.js');

var UserDelete = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.get = function(e){
      e.preventDefault();

      User.delete(m.route.param().id)
        .then(function(){
          ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'user has been saved'));
        }, function(err){
          var message = 'An error occurred.';
          
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      ctrl.error(),
      m("form.text-center.row.form-user-delete", {onsubmit:ctrl.get.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3.mt-50', [
          m('.form-group',
            m("button.btn.btn-lg.btn-warning.btn-block[type='submit']", "Delete User?")
          )
        ])
      ),
    ])];
  }
};
},{"../components/DataTable.js":"/Users/sumitsourav/Work/Code/public/scripts/components/DataTable.js","../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js","../models/User.js":"/Users/sumitsourav/Work/Code/public/scripts/models/User.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/UserEdit.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var User = require('../models/User.js');

var UserEdit = module.exports = {
  controller: function(){
    ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.error = m.prop('');

    ctrl.get = function(e){
      e.preventDefault();

      User.send({name: e.target.name.value,status: e.target.status.value,phone: e.target.phone.value}, m.route.param().id)
        .then(function(){
          ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'user has been saved'));
        }, function(err){
          var message = 'An error occurred.';
          
          ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
        });
    };
  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      m("form.text-center.row.form-user-edit", {onsubmit:ctrl.get.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          m("h1", "Edit User"),
          ctrl.error(),
          m('.form-group', [
            m("label.[for='inputName']", "Name"),
            m("input.form-control[name='name'][autofocus][id='inputTitle'][placeholder='Name '][required][type='text']"),
          ]),
          m('.form-group', [
            m("label.[for='inputPhone']", "Phone"),
            m("input.form-control[name='phone'][autofocus][id='inputbody'][placeholder='Phone '][required][type='text']"),
          ]),
          m('.form-group.pull-left', [
            m("label.[for='inputStatus']", "Status"),
            m("input[name='status'][autofocus][id='inputStatusBlock'][value='blocked'][type='radio']"),
            m("label.radio-inline", "Block"),
            m("input.ml-20[name='status'][autofocus][id='inputStatusUnblock'][value='unblocked'][type='radio']"),
            m("label.radio-inline", "Unblock"),
          ]),
          m('.form-group',
            m("button.btn.btn-lg.btn-primary.btn-block[type='submit']", "Save")
          )
        ])
      ),
      m("a.btn.btn-warning.btn-xs.pull-right[href='/users/" + m.route.param().id + "'][data-method='delete']", {config: m.route}, "Delete User")
    ])];
  }
};
},{"../components/DataTable.js":"/Users/sumitsourav/Work/Code/public/scripts/components/DataTable.js","../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js","../models/User.js":"/Users/sumitsourav/Work/Code/public/scripts/models/User.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Users.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');

var users = module.exports = {
  controller: function () {
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.user = m.prop();

    ctrl.prioretyFromate = function(value, row, col, attrs) {
      if (value == 'high') attrs.class = 'label label-danger';

      return value;
    }

    this.datatable = new mc.Datatable.controller(
      // Columns definition:
      [
        { key: "email",label: "Email" },
        { key: "phone",label: "Phone" },
        { key: "type",label: "Type" },
        { key: "status",label: "Status" },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'users',
        authorization: Auth.token(),
        onCellClick: function (content, row, col) {
          console.log(content, row, col);
          m.route("/userEdit",{id:row.id})
        }
        // Handler of click event on data cell
        // It receives the relevant information already resolved
      }
    );
  },

  view: function (ctrl) {
    return [Navbar.view(ctrl.navbar), m('.container', [
      m('h1', 'Users management'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'All users'
      })
    ])];
  }
};
},{"../components/DataTable.js":"/Users/sumitsourav/Work/Code/public/scripts/components/DataTable.js","../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Verify.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var Auth = require('../models/Auth.js');

var Verify = module.exports = {
  controller: function(){
    var ctrl = this;
    ctrl.navbar = new Navbar.controller();
    ctrl.message = m.prop();

    Auth.verify(m.route.param("code")).then(function(){
      ctrl.message([
        'Sweet. Now, you can ',
        m('a[href="/login"]', {config: m.route}, 'login'),
        '.'
      ]);
    }, function(){
      ctrl.message('Hmm, there was something wrong with that code. Check your email again.');
    });
  },
  
  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m('.container', [
      m('h1', 'verify'),
      ctrl.message()
    ])];
  }
};
},{"../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}]},{},["/Users/sumitsourav/Work/Code/public/scripts/main.js"])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzIiwicHVibGljL3NjcmlwdHMvY29tcG9uZW50cy9EYXRhVGFibGUuanMiLCJwdWJsaWMvc2NyaXB0cy9jb21wb25lbnRzL05hdmJhci5qcyIsInB1YmxpYy9zY3JpcHRzL21haW4uanMiLCJwdWJsaWMvc2NyaXB0cy9tb2RlbHMvQXV0aC5qcyIsInB1YmxpYy9zY3JpcHRzL21vZGVscy9UaWNrZXQuanMiLCJwdWJsaWMvc2NyaXB0cy9tb2RlbHMvVXNlci5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL0xvZ2luLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvTG9nb3V0LmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvUmVnaXN0ZXIuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9SZXBvcnQuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9UYXN0eS5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1RpY2tldEVkaXQuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9UaWNrZXRQYWdlLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvVGlja2V0cy5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1VzZXJEZWxldGUuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9Vc2VyRWRpdC5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1VzZXJzLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvVmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN2Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM5REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDL0RBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUN0REE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLy8gICAgIFVuZGVyc2NvcmUuanMgMS44LjNcbi8vICAgICBodHRwOi8vdW5kZXJzY29yZWpzLm9yZ1xuLy8gICAgIChjKSAyMDA5LTIwMTUgSmVyZW15IEFzaGtlbmFzLCBEb2N1bWVudENsb3VkIGFuZCBJbnZlc3RpZ2F0aXZlIFJlcG9ydGVycyAmIEVkaXRvcnNcbi8vICAgICBVbmRlcnNjb3JlIG1heSBiZSBmcmVlbHkgZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIE1JVCBsaWNlbnNlLlxuXG4oZnVuY3Rpb24oKSB7XG5cbiAgLy8gQmFzZWxpbmUgc2V0dXBcbiAgLy8gLS0tLS0tLS0tLS0tLS1cblxuICAvLyBFc3RhYmxpc2ggdGhlIHJvb3Qgb2JqZWN0LCBgd2luZG93YCBpbiB0aGUgYnJvd3Nlciwgb3IgYGV4cG9ydHNgIG9uIHRoZSBzZXJ2ZXIuXG4gIHZhciByb290ID0gdGhpcztcblxuICAvLyBTYXZlIHRoZSBwcmV2aW91cyB2YWx1ZSBvZiB0aGUgYF9gIHZhcmlhYmxlLlxuICB2YXIgcHJldmlvdXNVbmRlcnNjb3JlID0gcm9vdC5fO1xuXG4gIC8vIFNhdmUgYnl0ZXMgaW4gdGhlIG1pbmlmaWVkIChidXQgbm90IGd6aXBwZWQpIHZlcnNpb246XG4gIHZhciBBcnJheVByb3RvID0gQXJyYXkucHJvdG90eXBlLCBPYmpQcm90byA9IE9iamVjdC5wcm90b3R5cGUsIEZ1bmNQcm90byA9IEZ1bmN0aW9uLnByb3RvdHlwZTtcblxuICAvLyBDcmVhdGUgcXVpY2sgcmVmZXJlbmNlIHZhcmlhYmxlcyBmb3Igc3BlZWQgYWNjZXNzIHRvIGNvcmUgcHJvdG90eXBlcy5cbiAgdmFyXG4gICAgcHVzaCAgICAgICAgICAgICA9IEFycmF5UHJvdG8ucHVzaCxcbiAgICBzbGljZSAgICAgICAgICAgID0gQXJyYXlQcm90by5zbGljZSxcbiAgICB0b1N0cmluZyAgICAgICAgID0gT2JqUHJvdG8udG9TdHJpbmcsXG4gICAgaGFzT3duUHJvcGVydHkgICA9IE9ialByb3RvLmhhc093blByb3BlcnR5O1xuXG4gIC8vIEFsbCAqKkVDTUFTY3JpcHQgNSoqIG5hdGl2ZSBmdW5jdGlvbiBpbXBsZW1lbnRhdGlvbnMgdGhhdCB3ZSBob3BlIHRvIHVzZVxuICAvLyBhcmUgZGVjbGFyZWQgaGVyZS5cbiAgdmFyXG4gICAgbmF0aXZlSXNBcnJheSAgICAgID0gQXJyYXkuaXNBcnJheSxcbiAgICBuYXRpdmVLZXlzICAgICAgICAgPSBPYmplY3Qua2V5cyxcbiAgICBuYXRpdmVCaW5kICAgICAgICAgPSBGdW5jUHJvdG8uYmluZCxcbiAgICBuYXRpdmVDcmVhdGUgICAgICAgPSBPYmplY3QuY3JlYXRlO1xuXG4gIC8vIE5ha2VkIGZ1bmN0aW9uIHJlZmVyZW5jZSBmb3Igc3Vycm9nYXRlLXByb3RvdHlwZS1zd2FwcGluZy5cbiAgdmFyIEN0b3IgPSBmdW5jdGlvbigpe307XG5cbiAgLy8gQ3JlYXRlIGEgc2FmZSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciB1c2UgYmVsb3cuXG4gIHZhciBfID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiBpbnN0YW5jZW9mIF8pIHJldHVybiBvYmo7XG4gICAgaWYgKCEodGhpcyBpbnN0YW5jZW9mIF8pKSByZXR1cm4gbmV3IF8ob2JqKTtcbiAgICB0aGlzLl93cmFwcGVkID0gb2JqO1xuICB9O1xuXG4gIC8vIEV4cG9ydCB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yICoqTm9kZS5qcyoqLCB3aXRoXG4gIC8vIGJhY2t3YXJkcy1jb21wYXRpYmlsaXR5IGZvciB0aGUgb2xkIGByZXF1aXJlKClgIEFQSS4gSWYgd2UncmUgaW5cbiAgLy8gdGhlIGJyb3dzZXIsIGFkZCBgX2AgYXMgYSBnbG9iYWwgb2JqZWN0LlxuICBpZiAodHlwZW9mIGV4cG9ydHMgIT09ICd1bmRlZmluZWQnKSB7XG4gICAgaWYgKHR5cGVvZiBtb2R1bGUgIT09ICd1bmRlZmluZWQnICYmIG1vZHVsZS5leHBvcnRzKSB7XG4gICAgICBleHBvcnRzID0gbW9kdWxlLmV4cG9ydHMgPSBfO1xuICAgIH1cbiAgICBleHBvcnRzLl8gPSBfO1xuICB9IGVsc2Uge1xuICAgIHJvb3QuXyA9IF87XG4gIH1cblxuICAvLyBDdXJyZW50IHZlcnNpb24uXG4gIF8uVkVSU0lPTiA9ICcxLjguMyc7XG5cbiAgLy8gSW50ZXJuYWwgZnVuY3Rpb24gdGhhdCByZXR1cm5zIGFuIGVmZmljaWVudCAoZm9yIGN1cnJlbnQgZW5naW5lcykgdmVyc2lvblxuICAvLyBvZiB0aGUgcGFzc2VkLWluIGNhbGxiYWNrLCB0byBiZSByZXBlYXRlZGx5IGFwcGxpZWQgaW4gb3RoZXIgVW5kZXJzY29yZVxuICAvLyBmdW5jdGlvbnMuXG4gIHZhciBvcHRpbWl6ZUNiID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAoY29udGV4dCA9PT0gdm9pZCAwKSByZXR1cm4gZnVuYztcbiAgICBzd2l0Y2ggKGFyZ0NvdW50ID09IG51bGwgPyAzIDogYXJnQ291bnQpIHtcbiAgICAgIGNhc2UgMTogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMjogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBvdGhlcikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBvdGhlcik7XG4gICAgICB9O1xuICAgICAgY2FzZSAzOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDQ6IHJldHVybiBmdW5jdGlvbihhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShjb250ZXh0LCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQSBtb3N0bHktaW50ZXJuYWwgZnVuY3Rpb24gdG8gZ2VuZXJhdGUgY2FsbGJhY2tzIHRoYXQgY2FuIGJlIGFwcGxpZWRcbiAgLy8gdG8gZWFjaCBlbGVtZW50IGluIGEgY29sbGVjdGlvbiwgcmV0dXJuaW5nIHRoZSBkZXNpcmVkIHJlc3VsdCDigJQgZWl0aGVyXG4gIC8vIGlkZW50aXR5LCBhbiBhcmJpdHJhcnkgY2FsbGJhY2ssIGEgcHJvcGVydHkgbWF0Y2hlciwgb3IgYSBwcm9wZXJ0eSBhY2Nlc3Nvci5cbiAgdmFyIGNiID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKHZhbHVlID09IG51bGwpIHJldHVybiBfLmlkZW50aXR5O1xuICAgIGlmIChfLmlzRnVuY3Rpb24odmFsdWUpKSByZXR1cm4gb3B0aW1pemVDYih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpO1xuICAgIGlmIChfLmlzT2JqZWN0KHZhbHVlKSkgcmV0dXJuIF8ubWF0Y2hlcih2YWx1ZSk7XG4gICAgcmV0dXJuIF8ucHJvcGVydHkodmFsdWUpO1xuICB9O1xuICBfLml0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gY2IodmFsdWUsIGNvbnRleHQsIEluZmluaXR5KTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYXNzaWduZXIgZnVuY3Rpb25zLlxuICB2YXIgY3JlYXRlQXNzaWduZXIgPSBmdW5jdGlvbihrZXlzRnVuYywgdW5kZWZpbmVkT25seSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHZhciBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgICAgaWYgKGxlbmd0aCA8IDIgfHwgb2JqID09IG51bGwpIHJldHVybiBvYmo7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIHZhciBzb3VyY2UgPSBhcmd1bWVudHNbaW5kZXhdLFxuICAgICAgICAgICAga2V5cyA9IGtleXNGdW5jKHNvdXJjZSksXG4gICAgICAgICAgICBsID0ga2V5cy5sZW5ndGg7XG4gICAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICAgICAgaWYgKCF1bmRlZmluZWRPbmx5IHx8IG9ialtrZXldID09PSB2b2lkIDApIG9ialtrZXldID0gc291cmNlW2tleV07XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIHJldHVybiBvYmo7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiBmb3IgY3JlYXRpbmcgYSBuZXcgb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSBhbm90aGVyLlxuICB2YXIgYmFzZUNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSkge1xuICAgIGlmICghXy5pc09iamVjdChwcm90b3R5cGUpKSByZXR1cm4ge307XG4gICAgaWYgKG5hdGl2ZUNyZWF0ZSkgcmV0dXJuIG5hdGl2ZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIEN0b3IucHJvdG90eXBlID0gcHJvdG90eXBlO1xuICAgIHZhciByZXN1bHQgPSBuZXcgQ3RvcjtcbiAgICBDdG9yLnByb3RvdHlwZSA9IG51bGw7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICB2YXIgcHJvcGVydHkgPSBmdW5jdGlvbihrZXkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gb2JqID09IG51bGwgPyB2b2lkIDAgOiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEhlbHBlciBmb3IgY29sbGVjdGlvbiBtZXRob2RzIHRvIGRldGVybWluZSB3aGV0aGVyIGEgY29sbGVjdGlvblxuICAvLyBzaG91bGQgYmUgaXRlcmF0ZWQgYXMgYW4gYXJyYXkgb3IgYXMgYW4gb2JqZWN0XG4gIC8vIFJlbGF0ZWQ6IGh0dHA6Ly9wZW9wbGUubW96aWxsYS5vcmcvfmpvcmVuZG9yZmYvZXM2LWRyYWZ0Lmh0bWwjc2VjLXRvbGVuZ3RoXG4gIC8vIEF2b2lkcyBhIHZlcnkgbmFzdHkgaU9TIDggSklUIGJ1ZyBvbiBBUk0tNjQuICMyMDk0XG4gIHZhciBNQVhfQVJSQVlfSU5ERVggPSBNYXRoLnBvdygyLCA1MykgLSAxO1xuICB2YXIgZ2V0TGVuZ3RoID0gcHJvcGVydHkoJ2xlbmd0aCcpO1xuICB2YXIgaXNBcnJheUxpa2UgPSBmdW5jdGlvbihjb2xsZWN0aW9uKSB7XG4gICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChjb2xsZWN0aW9uKTtcbiAgICByZXR1cm4gdHlwZW9mIGxlbmd0aCA9PSAnbnVtYmVyJyAmJiBsZW5ndGggPj0gMCAmJiBsZW5ndGggPD0gTUFYX0FSUkFZX0lOREVYO1xuICB9O1xuXG4gIC8vIENvbGxlY3Rpb24gRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gVGhlIGNvcm5lcnN0b25lLCBhbiBgZWFjaGAgaW1wbGVtZW50YXRpb24sIGFrYSBgZm9yRWFjaGAuXG4gIC8vIEhhbmRsZXMgcmF3IG9iamVjdHMgaW4gYWRkaXRpb24gdG8gYXJyYXktbGlrZXMuIFRyZWF0cyBhbGxcbiAgLy8gc3BhcnNlIGFycmF5LWxpa2VzIGFzIGlmIHRoZXkgd2VyZSBkZW5zZS5cbiAgXy5lYWNoID0gXy5mb3JFYWNoID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGksIGxlbmd0aDtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtpXSwgaSwgb2JqKTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2tleXNbaV1dLCBrZXlzW2ldLCBvYmopO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50LlxuICBfLm1hcCA9IF8uY29sbGVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgcmVzdWx0cyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIHJlc3VsdHNbaW5kZXhdID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDcmVhdGUgYSByZWR1Y2luZyBmdW5jdGlvbiBpdGVyYXRpbmcgbGVmdCBvciByaWdodC5cbiAgZnVuY3Rpb24gY3JlYXRlUmVkdWNlKGRpcikge1xuICAgIC8vIE9wdGltaXplZCBpdGVyYXRvciBmdW5jdGlvbiBhcyB1c2luZyBhcmd1bWVudHMubGVuZ3RoXG4gICAgLy8gaW4gdGhlIG1haW4gZnVuY3Rpb24gd2lsbCBkZW9wdGltaXplIHRoZSwgc2VlICMxOTkxLlxuICAgIGZ1bmN0aW9uIGl0ZXJhdG9yKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGtleXMsIGluZGV4LCBsZW5ndGgpIHtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgICAgbWVtbyA9IGl0ZXJhdGVlKG1lbW8sIG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH1cblxuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBtZW1vLCBjb250ZXh0KSB7XG4gICAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDQpO1xuICAgICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aCxcbiAgICAgICAgICBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIC8vIERldGVybWluZSB0aGUgaW5pdGlhbCB2YWx1ZSBpZiBub25lIGlzIHByb3ZpZGVkLlxuICAgICAgaWYgKGFyZ3VtZW50cy5sZW5ndGggPCAzKSB7XG4gICAgICAgIG1lbW8gPSBvYmpba2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXhdO1xuICAgICAgICBpbmRleCArPSBkaXI7XG4gICAgICB9XG4gICAgICByZXR1cm4gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCk7XG4gICAgfTtcbiAgfVxuXG4gIC8vICoqUmVkdWNlKiogYnVpbGRzIHVwIGEgc2luZ2xlIHJlc3VsdCBmcm9tIGEgbGlzdCBvZiB2YWx1ZXMsIGFrYSBgaW5qZWN0YCxcbiAgLy8gb3IgYGZvbGRsYC5cbiAgXy5yZWR1Y2UgPSBfLmZvbGRsID0gXy5pbmplY3QgPSBjcmVhdGVSZWR1Y2UoMSk7XG5cbiAgLy8gVGhlIHJpZ2h0LWFzc29jaWF0aXZlIHZlcnNpb24gb2YgcmVkdWNlLCBhbHNvIGtub3duIGFzIGBmb2xkcmAuXG4gIF8ucmVkdWNlUmlnaHQgPSBfLmZvbGRyID0gY3JlYXRlUmVkdWNlKC0xKTtcblxuICAvLyBSZXR1cm4gdGhlIGZpcnN0IHZhbHVlIHdoaWNoIHBhc3NlcyBhIHRydXRoIHRlc3QuIEFsaWFzZWQgYXMgYGRldGVjdGAuXG4gIF8uZmluZCA9IF8uZGV0ZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIga2V5O1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBrZXkgPSBfLmZpbmRJbmRleChvYmosIHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleSA9IF8uZmluZEtleShvYmosIHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgfVxuICAgIGlmIChrZXkgIT09IHZvaWQgMCAmJiBrZXkgIT09IC0xKSByZXR1cm4gb2JqW2tleV07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgdGhhdCBwYXNzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgc2VsZWN0YC5cbiAgXy5maWx0ZXIgPSBfLnNlbGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdHMgPSBbXTtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgaWYgKHByZWRpY2F0ZSh2YWx1ZSwgaW5kZXgsIGxpc3QpKSByZXN1bHRzLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIGZvciB3aGljaCBhIHRydXRoIHRlc3QgZmFpbHMuXG4gIF8ucmVqZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm5lZ2F0ZShjYihwcmVkaWNhdGUpKSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIHdoZXRoZXIgYWxsIG9mIHRoZSBlbGVtZW50cyBtYXRjaCBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFsbGAuXG4gIF8uZXZlcnkgPSBfLmFsbCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKCFwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiBhdCBsZWFzdCBvbmUgZWxlbWVudCBpbiB0aGUgb2JqZWN0IG1hdGNoZXMgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbnlgLlxuICBfLnNvbWUgPSBfLmFueSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICBsZW5ndGggPSAoa2V5cyB8fCBvYmopLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgaWYgKHByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gZmFsc2U7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIHRoZSBhcnJheSBvciBvYmplY3QgY29udGFpbnMgYSBnaXZlbiBpdGVtICh1c2luZyBgPT09YCkuXG4gIC8vIEFsaWFzZWQgYXMgYGluY2x1ZGVzYCBhbmQgYGluY2x1ZGVgLlxuICBfLmNvbnRhaW5zID0gXy5pbmNsdWRlcyA9IF8uaW5jbHVkZSA9IGZ1bmN0aW9uKG9iaiwgaXRlbSwgZnJvbUluZGV4LCBndWFyZCkge1xuICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICBpZiAodHlwZW9mIGZyb21JbmRleCAhPSAnbnVtYmVyJyB8fCBndWFyZCkgZnJvbUluZGV4ID0gMDtcbiAgICByZXR1cm4gXy5pbmRleE9mKG9iaiwgaXRlbSwgZnJvbUluZGV4KSA+PSAwO1xuICB9O1xuXG4gIC8vIEludm9rZSBhIG1ldGhvZCAod2l0aCBhcmd1bWVudHMpIG9uIGV2ZXJ5IGl0ZW0gaW4gYSBjb2xsZWN0aW9uLlxuICBfLmludm9rZSA9IGZ1bmN0aW9uKG9iaiwgbWV0aG9kKSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGlzRnVuYyA9IF8uaXNGdW5jdGlvbihtZXRob2QpO1xuICAgIHJldHVybiBfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgICB2YXIgZnVuYyA9IGlzRnVuYyA/IG1ldGhvZCA6IHZhbHVlW21ldGhvZF07XG4gICAgICByZXR1cm4gZnVuYyA9PSBudWxsID8gZnVuYyA6IGZ1bmMuYXBwbHkodmFsdWUsIGFyZ3MpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYG1hcGA6IGZldGNoaW5nIGEgcHJvcGVydHkuXG4gIF8ucGx1Y2sgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBfLm1hcChvYmosIF8ucHJvcGVydHkoa2V5KSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmlsdGVyYDogc2VsZWN0aW5nIG9ubHkgb2JqZWN0c1xuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLndoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubWF0Y2hlcihhdHRycykpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbmRgOiBnZXR0aW5nIHRoZSBmaXJzdCBvYmplY3RcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5maW5kV2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmluZChvYmosIF8ubWF0Y2hlcihhdHRycykpO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWF4aW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5tYXggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IC1JbmZpbml0eSwgbGFzdENvbXB1dGVkID0gLUluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlID4gcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPiBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IC1JbmZpbml0eSAmJiByZXN1bHQgPT09IC1JbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1pbmltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWluID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSBJbmZpbml0eSwgbGFzdENvbXB1dGVkID0gSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPCByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA8IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gSW5maW5pdHkgJiYgcmVzdWx0ID09PSBJbmZpbml0eSkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICAgIGxhc3RDb21wdXRlZCA9IGNvbXB1dGVkO1xuICAgICAgICB9XG4gICAgICB9KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBTaHVmZmxlIGEgY29sbGVjdGlvbiwgdXNpbmcgdGhlIG1vZGVybiB2ZXJzaW9uIG9mIHRoZVxuICAvLyBbRmlzaGVyLVlhdGVzIHNodWZmbGVdKGh0dHA6Ly9lbi53aWtpcGVkaWEub3JnL3dpa2kvRmlzaGVy4oCTWWF0ZXNfc2h1ZmZsZSkuXG4gIF8uc2h1ZmZsZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBzZXQgPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0gc2V0Lmxlbmd0aDtcbiAgICB2YXIgc2h1ZmZsZWQgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMCwgcmFuZDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHJhbmQgPSBfLnJhbmRvbSgwLCBpbmRleCk7XG4gICAgICBpZiAocmFuZCAhPT0gaW5kZXgpIHNodWZmbGVkW2luZGV4XSA9IHNodWZmbGVkW3JhbmRdO1xuICAgICAgc2h1ZmZsZWRbcmFuZF0gPSBzZXRbaW5kZXhdO1xuICAgIH1cbiAgICByZXR1cm4gc2h1ZmZsZWQ7XG4gIH07XG5cbiAgLy8gU2FtcGxlICoqbioqIHJhbmRvbSB2YWx1ZXMgZnJvbSBhIGNvbGxlY3Rpb24uXG4gIC8vIElmICoqbioqIGlzIG5vdCBzcGVjaWZpZWQsIHJldHVybnMgYSBzaW5nbGUgcmFuZG9tIGVsZW1lbnQuXG4gIC8vIFRoZSBpbnRlcm5hbCBgZ3VhcmRgIGFyZ3VtZW50IGFsbG93cyBpdCB0byB3b3JrIHdpdGggYG1hcGAuXG4gIF8uc2FtcGxlID0gZnVuY3Rpb24ob2JqLCBuLCBndWFyZCkge1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHtcbiAgICAgIGlmICghaXNBcnJheUxpa2Uob2JqKSkgb2JqID0gXy52YWx1ZXMob2JqKTtcbiAgICAgIHJldHVybiBvYmpbXy5yYW5kb20ob2JqLmxlbmd0aCAtIDEpXTtcbiAgICB9XG4gICAgcmV0dXJuIF8uc2h1ZmZsZShvYmopLnNsaWNlKDAsIE1hdGgubWF4KDAsIG4pKTtcbiAgfTtcblxuICAvLyBTb3J0IHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24gcHJvZHVjZWQgYnkgYW4gaXRlcmF0ZWUuXG4gIF8uc29ydEJ5ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHJldHVybiBfLnBsdWNrKF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICByZXR1cm4ge1xuICAgICAgICB2YWx1ZTogdmFsdWUsXG4gICAgICAgIGluZGV4OiBpbmRleCxcbiAgICAgICAgY3JpdGVyaWE6IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdClcbiAgICAgIH07XG4gICAgfSkuc29ydChmdW5jdGlvbihsZWZ0LCByaWdodCkge1xuICAgICAgdmFyIGEgPSBsZWZ0LmNyaXRlcmlhO1xuICAgICAgdmFyIGIgPSByaWdodC5jcml0ZXJpYTtcbiAgICAgIGlmIChhICE9PSBiKSB7XG4gICAgICAgIGlmIChhID4gYiB8fCBhID09PSB2b2lkIDApIHJldHVybiAxO1xuICAgICAgICBpZiAoYSA8IGIgfHwgYiA9PT0gdm9pZCAwKSByZXR1cm4gLTE7XG4gICAgICB9XG4gICAgICByZXR1cm4gbGVmdC5pbmRleCAtIHJpZ2h0LmluZGV4O1xuICAgIH0pLCAndmFsdWUnKTtcbiAgfTtcblxuICAvLyBBbiBpbnRlcm5hbCBmdW5jdGlvbiB1c2VkIGZvciBhZ2dyZWdhdGUgXCJncm91cCBieVwiIG9wZXJhdGlvbnMuXG4gIHZhciBncm91cCA9IGZ1bmN0aW9uKGJlaGF2aW9yKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4KSB7XG4gICAgICAgIHZhciBrZXkgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIG9iaik7XG4gICAgICAgIGJlaGF2aW9yKHJlc3VsdCwgdmFsdWUsIGtleSk7XG4gICAgICB9KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBHcm91cHMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbi4gUGFzcyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlXG4gIC8vIHRvIGdyb3VwIGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGUgY3JpdGVyaW9uLlxuICBfLmdyb3VwQnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XS5wdXNoKHZhbHVlKTsgZWxzZSByZXN1bHRba2V5XSA9IFt2YWx1ZV07XG4gIH0pO1xuXG4gIC8vIEluZGV4ZXMgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiwgc2ltaWxhciB0byBgZ3JvdXBCeWAsIGJ1dCBmb3JcbiAgLy8gd2hlbiB5b3Uga25vdyB0aGF0IHlvdXIgaW5kZXggdmFsdWVzIHdpbGwgYmUgdW5pcXVlLlxuICBfLmluZGV4QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICByZXN1bHRba2V5XSA9IHZhbHVlO1xuICB9KTtcblxuICAvLyBDb3VudHMgaW5zdGFuY2VzIG9mIGFuIG9iamVjdCB0aGF0IGdyb3VwIGJ5IGEgY2VydGFpbiBjcml0ZXJpb24uIFBhc3NcbiAgLy8gZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZSB0byBjb3VudCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlXG4gIC8vIGNyaXRlcmlvbi5cbiAgXy5jb3VudEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0rKzsgZWxzZSByZXN1bHRba2V5XSA9IDE7XG4gIH0pO1xuXG4gIC8vIFNhZmVseSBjcmVhdGUgYSByZWFsLCBsaXZlIGFycmF5IGZyb20gYW55dGhpbmcgaXRlcmFibGUuXG4gIF8udG9BcnJheSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghb2JqKSByZXR1cm4gW107XG4gICAgaWYgKF8uaXNBcnJheShvYmopKSByZXR1cm4gc2xpY2UuY2FsbChvYmopO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSByZXR1cm4gXy5tYXAob2JqLCBfLmlkZW50aXR5KTtcbiAgICByZXR1cm4gXy52YWx1ZXMob2JqKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiBhbiBvYmplY3QuXG4gIF8uc2l6ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIDA7XG4gICAgcmV0dXJuIGlzQXJyYXlMaWtlKG9iaikgPyBvYmoubGVuZ3RoIDogXy5rZXlzKG9iaikubGVuZ3RoO1xuICB9O1xuXG4gIC8vIFNwbGl0IGEgY29sbGVjdGlvbiBpbnRvIHR3byBhcnJheXM6IG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgc2F0aXNmeSB0aGUgZ2l2ZW5cbiAgLy8gcHJlZGljYXRlLCBhbmQgb25lIHdob3NlIGVsZW1lbnRzIGFsbCBkbyBub3Qgc2F0aXNmeSB0aGUgcHJlZGljYXRlLlxuICBfLnBhcnRpdGlvbiA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIgcGFzcyA9IFtdLCBmYWlsID0gW107XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7XG4gICAgICAocHJlZGljYXRlKHZhbHVlLCBrZXksIG9iaikgPyBwYXNzIDogZmFpbCkucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIFtwYXNzLCBmYWlsXTtcbiAgfTtcblxuICAvLyBBcnJheSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gR2V0IHRoZSBmaXJzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBmaXJzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYGhlYWRgIGFuZCBgdGFrZWAuIFRoZSAqKmd1YXJkKiogY2hlY2tcbiAgLy8gYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgXy5tYXBgLlxuICBfLmZpcnN0ID0gXy5oZWFkID0gXy50YWtlID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5WzBdO1xuICAgIHJldHVybiBfLmluaXRpYWwoYXJyYXksIGFycmF5Lmxlbmd0aCAtIG4pO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGxhc3QgZW50cnkgb2YgdGhlIGFycmF5LiBFc3BlY2lhbGx5IHVzZWZ1bCBvblxuICAvLyB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiBhbGwgdGhlIHZhbHVlcyBpblxuICAvLyB0aGUgYXJyYXksIGV4Y2x1ZGluZyB0aGUgbGFzdCBOLlxuICBfLmluaXRpYWwgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgMCwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gKG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKSkpO1xuICB9O1xuXG4gIC8vIEdldCB0aGUgbGFzdCBlbGVtZW50IG9mIGFuIGFycmF5LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIHRoZSBsYXN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS5cbiAgXy5sYXN0ID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgaWYgKGFycmF5ID09IG51bGwpIHJldHVybiB2b2lkIDA7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkgcmV0dXJuIGFycmF5W2FycmF5Lmxlbmd0aCAtIDFdO1xuICAgIHJldHVybiBfLnJlc3QoYXJyYXksIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIG4pKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBmaXJzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEFsaWFzZWQgYXMgYHRhaWxgIGFuZCBgZHJvcGAuXG4gIC8vIEVzcGVjaWFsbHkgdXNlZnVsIG9uIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nIGFuICoqbioqIHdpbGwgcmV0dXJuXG4gIC8vIHRoZSByZXN0IE4gdmFsdWVzIGluIHRoZSBhcnJheS5cbiAgXy5yZXN0ID0gXy50YWlsID0gXy5kcm9wID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIG4gPT0gbnVsbCB8fCBndWFyZCA/IDEgOiBuKTtcbiAgfTtcblxuICAvLyBUcmltIG91dCBhbGwgZmFsc3kgdmFsdWVzIGZyb20gYW4gYXJyYXkuXG4gIF8uY29tcGFjdCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBfLmlkZW50aXR5KTtcbiAgfTtcblxuICAvLyBJbnRlcm5hbCBpbXBsZW1lbnRhdGlvbiBvZiBhIHJlY3Vyc2l2ZSBgZmxhdHRlbmAgZnVuY3Rpb24uXG4gIHZhciBmbGF0dGVuID0gZnVuY3Rpb24oaW5wdXQsIHNoYWxsb3csIHN0cmljdCwgc3RhcnRJbmRleCkge1xuICAgIHZhciBvdXRwdXQgPSBbXSwgaWR4ID0gMDtcbiAgICBmb3IgKHZhciBpID0gc3RhcnRJbmRleCB8fCAwLCBsZW5ndGggPSBnZXRMZW5ndGgoaW5wdXQpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGlucHV0W2ldO1xuICAgICAgaWYgKGlzQXJyYXlMaWtlKHZhbHVlKSAmJiAoXy5pc0FycmF5KHZhbHVlKSB8fCBfLmlzQXJndW1lbnRzKHZhbHVlKSkpIHtcbiAgICAgICAgLy9mbGF0dGVuIGN1cnJlbnQgbGV2ZWwgb2YgYXJyYXkgb3IgYXJndW1lbnRzIG9iamVjdFxuICAgICAgICBpZiAoIXNoYWxsb3cpIHZhbHVlID0gZmxhdHRlbih2YWx1ZSwgc2hhbGxvdywgc3RyaWN0KTtcbiAgICAgICAgdmFyIGogPSAwLCBsZW4gPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgIG91dHB1dC5sZW5ndGggKz0gbGVuO1xuICAgICAgICB3aGlsZSAoaiA8IGxlbikge1xuICAgICAgICAgIG91dHB1dFtpZHgrK10gPSB2YWx1ZVtqKytdO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFzdHJpY3QpIHtcbiAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xuICB9O1xuXG4gIC8vIEZsYXR0ZW4gb3V0IGFuIGFycmF5LCBlaXRoZXIgcmVjdXJzaXZlbHkgKGJ5IGRlZmF1bHQpLCBvciBqdXN0IG9uZSBsZXZlbC5cbiAgXy5mbGF0dGVuID0gZnVuY3Rpb24oYXJyYXksIHNoYWxsb3cpIHtcbiAgICByZXR1cm4gZmxhdHRlbihhcnJheSwgc2hhbGxvdywgZmFsc2UpO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHZlcnNpb24gb2YgdGhlIGFycmF5IHRoYXQgZG9lcyBub3QgY29udGFpbiB0aGUgc3BlY2lmaWVkIHZhbHVlKHMpLlxuICBfLndpdGhvdXQgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmRpZmZlcmVuY2UoYXJyYXksIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhIGR1cGxpY2F0ZS1mcmVlIHZlcnNpb24gb2YgdGhlIGFycmF5LiBJZiB0aGUgYXJyYXkgaGFzIGFscmVhZHlcbiAgLy8gYmVlbiBzb3J0ZWQsIHlvdSBoYXZlIHRoZSBvcHRpb24gb2YgdXNpbmcgYSBmYXN0ZXIgYWxnb3JpdGhtLlxuICAvLyBBbGlhc2VkIGFzIGB1bmlxdWVgLlxuICBfLnVuaXEgPSBfLnVuaXF1ZSA9IGZ1bmN0aW9uKGFycmF5LCBpc1NvcnRlZCwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoIV8uaXNCb29sZWFuKGlzU29ydGVkKSkge1xuICAgICAgY29udGV4dCA9IGl0ZXJhdGVlO1xuICAgICAgaXRlcmF0ZWUgPSBpc1NvcnRlZDtcbiAgICAgIGlzU29ydGVkID0gZmFsc2U7XG4gICAgfVxuICAgIGlmIChpdGVyYXRlZSAhPSBudWxsKSBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIHNlZW4gPSBbXTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBhcnJheVtpXSxcbiAgICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlID8gaXRlcmF0ZWUodmFsdWUsIGksIGFycmF5KSA6IHZhbHVlO1xuICAgICAgaWYgKGlzU29ydGVkKSB7XG4gICAgICAgIGlmICghaSB8fCBzZWVuICE9PSBjb21wdXRlZCkgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICBzZWVuID0gY29tcHV0ZWQ7XG4gICAgICB9IGVsc2UgaWYgKGl0ZXJhdGVlKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhzZWVuLCBjb21wdXRlZCkpIHtcbiAgICAgICAgICBzZWVuLnB1c2goY29tcHV0ZWQpO1xuICAgICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghXy5jb250YWlucyhyZXN1bHQsIHZhbHVlKSkge1xuICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIHRoZSB1bmlvbjogZWFjaCBkaXN0aW5jdCBlbGVtZW50IGZyb20gYWxsIG9mXG4gIC8vIHRoZSBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLnVuaW9uID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW5pcShmbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSwgdHJ1ZSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyBldmVyeSBpdGVtIHNoYXJlZCBiZXR3ZWVuIGFsbCB0aGVcbiAgLy8gcGFzc2VkLWluIGFycmF5cy5cbiAgXy5pbnRlcnNlY3Rpb24gPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgYXJnc0xlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGl0ZW0gPSBhcnJheVtpXTtcbiAgICAgIGlmIChfLmNvbnRhaW5zKHJlc3VsdCwgaXRlbSkpIGNvbnRpbnVlO1xuICAgICAgZm9yICh2YXIgaiA9IDE7IGogPCBhcmdzTGVuZ3RoOyBqKyspIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKGFyZ3VtZW50c1tqXSwgaXRlbSkpIGJyZWFrO1xuICAgICAgfVxuICAgICAgaWYgKGogPT09IGFyZ3NMZW5ndGgpIHJlc3VsdC5wdXNoKGl0ZW0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFRha2UgdGhlIGRpZmZlcmVuY2UgYmV0d2VlbiBvbmUgYXJyYXkgYW5kIGEgbnVtYmVyIG9mIG90aGVyIGFycmF5cy5cbiAgLy8gT25seSB0aGUgZWxlbWVudHMgcHJlc2VudCBpbiBqdXN0IHRoZSBmaXJzdCBhcnJheSB3aWxsIHJlbWFpbi5cbiAgXy5kaWZmZXJlbmNlID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdCA9IGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlLCAxKTtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIGZ1bmN0aW9uKHZhbHVlKXtcbiAgICAgIHJldHVybiAhXy5jb250YWlucyhyZXN0LCB2YWx1ZSk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gWmlwIHRvZ2V0aGVyIG11bHRpcGxlIGxpc3RzIGludG8gYSBzaW5nbGUgYXJyYXkgLS0gZWxlbWVudHMgdGhhdCBzaGFyZVxuICAvLyBhbiBpbmRleCBnbyB0b2dldGhlci5cbiAgXy56aXAgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bnppcChhcmd1bWVudHMpO1xuICB9O1xuXG4gIC8vIENvbXBsZW1lbnQgb2YgXy56aXAuIFVuemlwIGFjY2VwdHMgYW4gYXJyYXkgb2YgYXJyYXlzIGFuZCBncm91cHNcbiAgLy8gZWFjaCBhcnJheSdzIGVsZW1lbnRzIG9uIHNoYXJlZCBpbmRpY2VzXG4gIF8udW56aXAgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciBsZW5ndGggPSBhcnJheSAmJiBfLm1heChhcnJheSwgZ2V0TGVuZ3RoKS5sZW5ndGggfHwgMDtcbiAgICB2YXIgcmVzdWx0ID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHJlc3VsdFtpbmRleF0gPSBfLnBsdWNrKGFycmF5LCBpbmRleCk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ29udmVydHMgbGlzdHMgaW50byBvYmplY3RzLiBQYXNzIGVpdGhlciBhIHNpbmdsZSBhcnJheSBvZiBgW2tleSwgdmFsdWVdYFxuICAvLyBwYWlycywgb3IgdHdvIHBhcmFsbGVsIGFycmF5cyBvZiB0aGUgc2FtZSBsZW5ndGggLS0gb25lIG9mIGtleXMsIGFuZCBvbmUgb2ZcbiAgLy8gdGhlIGNvcnJlc3BvbmRpbmcgdmFsdWVzLlxuICBfLm9iamVjdCA9IGZ1bmN0aW9uKGxpc3QsIHZhbHVlcykge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGxpc3QpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICh2YWx1ZXMpIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1dID0gdmFsdWVzW2ldO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgcmVzdWx0W2xpc3RbaV1bMF1dID0gbGlzdFtpXVsxXTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBmaW5kSW5kZXggYW5kIGZpbmRMYXN0SW5kZXggZnVuY3Rpb25zXG4gIGZ1bmN0aW9uIGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKGRpcikge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgICAgdmFyIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICB2YXIgaW5kZXggPSBkaXIgPiAwID8gMCA6IGxlbmd0aCAtIDE7XG4gICAgICBmb3IgKDsgaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gZGlyKSB7XG4gICAgICAgIGlmIChwcmVkaWNhdGUoYXJyYXlbaW5kZXhdLCBpbmRleCwgYXJyYXkpKSByZXR1cm4gaW5kZXg7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGluZGV4IG9uIGFuIGFycmF5LWxpa2UgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdFxuICBfLmZpbmRJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKDEpO1xuICBfLmZpbmRMYXN0SW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigtMSk7XG5cbiAgLy8gVXNlIGEgY29tcGFyYXRvciBmdW5jdGlvbiB0byBmaWd1cmUgb3V0IHRoZSBzbWFsbGVzdCBpbmRleCBhdCB3aGljaFxuICAvLyBhbiBvYmplY3Qgc2hvdWxkIGJlIGluc2VydGVkIHNvIGFzIHRvIG1haW50YWluIG9yZGVyLiBVc2VzIGJpbmFyeSBzZWFyY2guXG4gIF8uc29ydGVkSW5kZXggPSBmdW5jdGlvbihhcnJheSwgb2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIHZhciB2YWx1ZSA9IGl0ZXJhdGVlKG9iaik7XG4gICAgdmFyIGxvdyA9IDAsIGhpZ2ggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgIHdoaWxlIChsb3cgPCBoaWdoKSB7XG4gICAgICB2YXIgbWlkID0gTWF0aC5mbG9vcigobG93ICsgaGlnaCkgLyAyKTtcbiAgICAgIGlmIChpdGVyYXRlZShhcnJheVttaWRdKSA8IHZhbHVlKSBsb3cgPSBtaWQgKyAxOyBlbHNlIGhpZ2ggPSBtaWQ7XG4gICAgfVxuICAgIHJldHVybiBsb3c7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgaW5kZXhPZiBhbmQgbGFzdEluZGV4T2YgZnVuY3Rpb25zXG4gIGZ1bmN0aW9uIGNyZWF0ZUluZGV4RmluZGVyKGRpciwgcHJlZGljYXRlRmluZCwgc29ydGVkSW5kZXgpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyYXksIGl0ZW0sIGlkeCkge1xuICAgICAgdmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgICAgaWYgKHR5cGVvZiBpZHggPT0gJ251bWJlcicpIHtcbiAgICAgICAgaWYgKGRpciA+IDApIHtcbiAgICAgICAgICAgIGkgPSBpZHggPj0gMCA/IGlkeCA6IE1hdGgubWF4KGlkeCArIGxlbmd0aCwgaSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBsZW5ndGggPSBpZHggPj0gMCA/IE1hdGgubWluKGlkeCArIDEsIGxlbmd0aCkgOiBpZHggKyBsZW5ndGggKyAxO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKHNvcnRlZEluZGV4ICYmIGlkeCAmJiBsZW5ndGgpIHtcbiAgICAgICAgaWR4ID0gc29ydGVkSW5kZXgoYXJyYXksIGl0ZW0pO1xuICAgICAgICByZXR1cm4gYXJyYXlbaWR4XSA9PT0gaXRlbSA/IGlkeCA6IC0xO1xuICAgICAgfVxuICAgICAgaWYgKGl0ZW0gIT09IGl0ZW0pIHtcbiAgICAgICAgaWR4ID0gcHJlZGljYXRlRmluZChzbGljZS5jYWxsKGFycmF5LCBpLCBsZW5ndGgpLCBfLmlzTmFOKTtcbiAgICAgICAgcmV0dXJuIGlkeCA+PSAwID8gaWR4ICsgaSA6IC0xO1xuICAgICAgfVxuICAgICAgZm9yIChpZHggPSBkaXIgPiAwID8gaSA6IGxlbmd0aCAtIDE7IGlkeCA+PSAwICYmIGlkeCA8IGxlbmd0aDsgaWR4ICs9IGRpcikge1xuICAgICAgICBpZiAoYXJyYXlbaWR4XSA9PT0gaXRlbSkgcmV0dXJuIGlkeDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJuIHRoZSBwb3NpdGlvbiBvZiB0aGUgZmlyc3Qgb2NjdXJyZW5jZSBvZiBhbiBpdGVtIGluIGFuIGFycmF5LFxuICAvLyBvciAtMSBpZiB0aGUgaXRlbSBpcyBub3QgaW5jbHVkZWQgaW4gdGhlIGFycmF5LlxuICAvLyBJZiB0aGUgYXJyYXkgaXMgbGFyZ2UgYW5kIGFscmVhZHkgaW4gc29ydCBvcmRlciwgcGFzcyBgdHJ1ZWBcbiAgLy8gZm9yICoqaXNTb3J0ZWQqKiB0byB1c2UgYmluYXJ5IHNlYXJjaC5cbiAgXy5pbmRleE9mID0gY3JlYXRlSW5kZXhGaW5kZXIoMSwgXy5maW5kSW5kZXgsIF8uc29ydGVkSW5kZXgpO1xuICBfLmxhc3RJbmRleE9mID0gY3JlYXRlSW5kZXhGaW5kZXIoLTEsIF8uZmluZExhc3RJbmRleCk7XG5cbiAgLy8gR2VuZXJhdGUgYW4gaW50ZWdlciBBcnJheSBjb250YWluaW5nIGFuIGFyaXRobWV0aWMgcHJvZ3Jlc3Npb24uIEEgcG9ydCBvZlxuICAvLyB0aGUgbmF0aXZlIFB5dGhvbiBgcmFuZ2UoKWAgZnVuY3Rpb24uIFNlZVxuICAvLyBbdGhlIFB5dGhvbiBkb2N1bWVudGF0aW9uXShodHRwOi8vZG9jcy5weXRob24ub3JnL2xpYnJhcnkvZnVuY3Rpb25zLmh0bWwjcmFuZ2UpLlxuICBfLnJhbmdlID0gZnVuY3Rpb24oc3RhcnQsIHN0b3AsIHN0ZXApIHtcbiAgICBpZiAoc3RvcCA9PSBudWxsKSB7XG4gICAgICBzdG9wID0gc3RhcnQgfHwgMDtcbiAgICAgIHN0YXJ0ID0gMDtcbiAgICB9XG4gICAgc3RlcCA9IHN0ZXAgfHwgMTtcblxuICAgIHZhciBsZW5ndGggPSBNYXRoLm1heChNYXRoLmNlaWwoKHN0b3AgLSBzdGFydCkgLyBzdGVwKSwgMCk7XG4gICAgdmFyIHJhbmdlID0gQXJyYXkobGVuZ3RoKTtcblxuICAgIGZvciAodmFyIGlkeCA9IDA7IGlkeCA8IGxlbmd0aDsgaWR4KyssIHN0YXJ0ICs9IHN0ZXApIHtcbiAgICAgIHJhbmdlW2lkeF0gPSBzdGFydDtcbiAgICB9XG5cbiAgICByZXR1cm4gcmFuZ2U7XG4gIH07XG5cbiAgLy8gRnVuY3Rpb24gKGFoZW0pIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBEZXRlcm1pbmVzIHdoZXRoZXIgdG8gZXhlY3V0ZSBhIGZ1bmN0aW9uIGFzIGEgY29uc3RydWN0b3JcbiAgLy8gb3IgYSBub3JtYWwgZnVuY3Rpb24gd2l0aCB0aGUgcHJvdmlkZWQgYXJndW1lbnRzXG4gIHZhciBleGVjdXRlQm91bmQgPSBmdW5jdGlvbihzb3VyY2VGdW5jLCBib3VuZEZ1bmMsIGNvbnRleHQsIGNhbGxpbmdDb250ZXh0LCBhcmdzKSB7XG4gICAgaWYgKCEoY2FsbGluZ0NvbnRleHQgaW5zdGFuY2VvZiBib3VuZEZ1bmMpKSByZXR1cm4gc291cmNlRnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICB2YXIgc2VsZiA9IGJhc2VDcmVhdGUoc291cmNlRnVuYy5wcm90b3R5cGUpO1xuICAgIHZhciByZXN1bHQgPSBzb3VyY2VGdW5jLmFwcGx5KHNlbGYsIGFyZ3MpO1xuICAgIGlmIChfLmlzT2JqZWN0KHJlc3VsdCkpIHJldHVybiByZXN1bHQ7XG4gICAgcmV0dXJuIHNlbGY7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgZnVuY3Rpb24gYm91bmQgdG8gYSBnaXZlbiBvYmplY3QgKGFzc2lnbmluZyBgdGhpc2AsIGFuZCBhcmd1bWVudHMsXG4gIC8vIG9wdGlvbmFsbHkpLiBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgRnVuY3Rpb24uYmluZGAgaWZcbiAgLy8gYXZhaWxhYmxlLlxuICBfLmJpbmQgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0KSB7XG4gICAgaWYgKG5hdGl2ZUJpbmQgJiYgZnVuYy5iaW5kID09PSBuYXRpdmVCaW5kKSByZXR1cm4gbmF0aXZlQmluZC5hcHBseShmdW5jLCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICAgIGlmICghXy5pc0Z1bmN0aW9uKGZ1bmMpKSB0aHJvdyBuZXcgVHlwZUVycm9yKCdCaW5kIG11c3QgYmUgY2FsbGVkIG9uIGEgZnVuY3Rpb24nKTtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBleGVjdXRlQm91bmQoZnVuYywgYm91bmQsIGNvbnRleHQsIHRoaXMsIGFyZ3MuY29uY2F0KHNsaWNlLmNhbGwoYXJndW1lbnRzKSkpO1xuICAgIH07XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9O1xuXG4gIC8vIFBhcnRpYWxseSBhcHBseSBhIGZ1bmN0aW9uIGJ5IGNyZWF0aW5nIGEgdmVyc2lvbiB0aGF0IGhhcyBoYWQgc29tZSBvZiBpdHNcbiAgLy8gYXJndW1lbnRzIHByZS1maWxsZWQsIHdpdGhvdXQgY2hhbmdpbmcgaXRzIGR5bmFtaWMgYHRoaXNgIGNvbnRleHQuIF8gYWN0c1xuICAvLyBhcyBhIHBsYWNlaG9sZGVyLCBhbGxvd2luZyBhbnkgY29tYmluYXRpb24gb2YgYXJndW1lbnRzIHRvIGJlIHByZS1maWxsZWQuXG4gIF8ucGFydGlhbCA9IGZ1bmN0aW9uKGZ1bmMpIHtcbiAgICB2YXIgYm91bmRBcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICAgIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIHBvc2l0aW9uID0gMCwgbGVuZ3RoID0gYm91bmRBcmdzLmxlbmd0aDtcbiAgICAgIHZhciBhcmdzID0gQXJyYXkobGVuZ3RoKTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgYXJnc1tpXSA9IGJvdW5kQXJnc1tpXSA9PT0gXyA/IGFyZ3VtZW50c1twb3NpdGlvbisrXSA6IGJvdW5kQXJnc1tpXTtcbiAgICAgIH1cbiAgICAgIHdoaWxlIChwb3NpdGlvbiA8IGFyZ3VtZW50cy5sZW5ndGgpIGFyZ3MucHVzaChhcmd1bWVudHNbcG9zaXRpb24rK10pO1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgdGhpcywgdGhpcywgYXJncyk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gQmluZCBhIG51bWJlciBvZiBhbiBvYmplY3QncyBtZXRob2RzIHRvIHRoYXQgb2JqZWN0LiBSZW1haW5pbmcgYXJndW1lbnRzXG4gIC8vIGFyZSB0aGUgbWV0aG9kIG5hbWVzIHRvIGJlIGJvdW5kLiBVc2VmdWwgZm9yIGVuc3VyaW5nIHRoYXQgYWxsIGNhbGxiYWNrc1xuICAvLyBkZWZpbmVkIG9uIGFuIG9iamVjdCBiZWxvbmcgdG8gaXQuXG4gIF8uYmluZEFsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpLCBsZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoLCBrZXk7XG4gICAgaWYgKGxlbmd0aCA8PSAxKSB0aHJvdyBuZXcgRXJyb3IoJ2JpbmRBbGwgbXVzdCBiZSBwYXNzZWQgZnVuY3Rpb24gbmFtZXMnKTtcbiAgICBmb3IgKGkgPSAxOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleSA9IGFyZ3VtZW50c1tpXTtcbiAgICAgIG9ialtrZXldID0gXy5iaW5kKG9ialtrZXldLCBvYmopO1xuICAgIH1cbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIE1lbW9pemUgYW4gZXhwZW5zaXZlIGZ1bmN0aW9uIGJ5IHN0b3JpbmcgaXRzIHJlc3VsdHMuXG4gIF8ubWVtb2l6ZSA9IGZ1bmN0aW9uKGZ1bmMsIGhhc2hlcikge1xuICAgIHZhciBtZW1vaXplID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgICB2YXIgY2FjaGUgPSBtZW1vaXplLmNhY2hlO1xuICAgICAgdmFyIGFkZHJlc3MgPSAnJyArIChoYXNoZXIgPyBoYXNoZXIuYXBwbHkodGhpcywgYXJndW1lbnRzKSA6IGtleSk7XG4gICAgICBpZiAoIV8uaGFzKGNhY2hlLCBhZGRyZXNzKSkgY2FjaGVbYWRkcmVzc10gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICByZXR1cm4gY2FjaGVbYWRkcmVzc107XG4gICAgfTtcbiAgICBtZW1vaXplLmNhY2hlID0ge307XG4gICAgcmV0dXJuIG1lbW9pemU7XG4gIH07XG5cbiAgLy8gRGVsYXlzIGEgZnVuY3Rpb24gZm9yIHRoZSBnaXZlbiBudW1iZXIgb2YgbWlsbGlzZWNvbmRzLCBhbmQgdGhlbiBjYWxsc1xuICAvLyBpdCB3aXRoIHRoZSBhcmd1bWVudHMgc3VwcGxpZWQuXG4gIF8uZGVsYXkgPSBmdW5jdGlvbihmdW5jLCB3YWl0KSB7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgcmV0dXJuIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KG51bGwsIGFyZ3MpO1xuICAgIH0sIHdhaXQpO1xuICB9O1xuXG4gIC8vIERlZmVycyBhIGZ1bmN0aW9uLCBzY2hlZHVsaW5nIGl0IHRvIHJ1biBhZnRlciB0aGUgY3VycmVudCBjYWxsIHN0YWNrIGhhc1xuICAvLyBjbGVhcmVkLlxuICBfLmRlZmVyID0gXy5wYXJ0aWFsKF8uZGVsYXksIF8sIDEpO1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgd2hlbiBpbnZva2VkLCB3aWxsIG9ubHkgYmUgdHJpZ2dlcmVkIGF0IG1vc3Qgb25jZVxuICAvLyBkdXJpbmcgYSBnaXZlbiB3aW5kb3cgb2YgdGltZS4gTm9ybWFsbHksIHRoZSB0aHJvdHRsZWQgZnVuY3Rpb24gd2lsbCBydW5cbiAgLy8gYXMgbXVjaCBhcyBpdCBjYW4sIHdpdGhvdXQgZXZlciBnb2luZyBtb3JlIHRoYW4gb25jZSBwZXIgYHdhaXRgIGR1cmF0aW9uO1xuICAvLyBidXQgaWYgeW91J2QgbGlrZSB0byBkaXNhYmxlIHRoZSBleGVjdXRpb24gb24gdGhlIGxlYWRpbmcgZWRnZSwgcGFzc1xuICAvLyBge2xlYWRpbmc6IGZhbHNlfWAuIFRvIGRpc2FibGUgZXhlY3V0aW9uIG9uIHRoZSB0cmFpbGluZyBlZGdlLCBkaXR0by5cbiAgXy50aHJvdHRsZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIG9wdGlvbnMpIHtcbiAgICB2YXIgY29udGV4dCwgYXJncywgcmVzdWx0O1xuICAgIHZhciB0aW1lb3V0ID0gbnVsbDtcbiAgICB2YXIgcHJldmlvdXMgPSAwO1xuICAgIGlmICghb3B0aW9ucykgb3B0aW9ucyA9IHt9O1xuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgcHJldmlvdXMgPSBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlID8gMCA6IF8ubm93KCk7XG4gICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICB9O1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBub3cgPSBfLm5vdygpO1xuICAgICAgaWYgKCFwcmV2aW91cyAmJiBvcHRpb25zLmxlYWRpbmcgPT09IGZhbHNlKSBwcmV2aW91cyA9IG5vdztcbiAgICAgIHZhciByZW1haW5pbmcgPSB3YWl0IC0gKG5vdyAtIHByZXZpb3VzKTtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIGlmIChyZW1haW5pbmcgPD0gMCB8fCByZW1haW5pbmcgPiB3YWl0KSB7XG4gICAgICAgIGlmICh0aW1lb3V0KSB7XG4gICAgICAgICAgY2xlYXJUaW1lb3V0KHRpbWVvdXQpO1xuICAgICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICB9XG4gICAgICAgIHByZXZpb3VzID0gbm93O1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH0gZWxzZSBpZiAoIXRpbWVvdXQgJiYgb3B0aW9ucy50cmFpbGluZyAhPT0gZmFsc2UpIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHJlbWFpbmluZyk7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCBhcyBsb25nIGFzIGl0IGNvbnRpbnVlcyB0byBiZSBpbnZva2VkLCB3aWxsIG5vdFxuICAvLyBiZSB0cmlnZ2VyZWQuIFRoZSBmdW5jdGlvbiB3aWxsIGJlIGNhbGxlZCBhZnRlciBpdCBzdG9wcyBiZWluZyBjYWxsZWQgZm9yXG4gIC8vIE4gbWlsbGlzZWNvbmRzLiBJZiBgaW1tZWRpYXRlYCBpcyBwYXNzZWQsIHRyaWdnZXIgdGhlIGZ1bmN0aW9uIG9uIHRoZVxuICAvLyBsZWFkaW5nIGVkZ2UsIGluc3RlYWQgb2YgdGhlIHRyYWlsaW5nLlxuICBfLmRlYm91bmNlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgaW1tZWRpYXRlKSB7XG4gICAgdmFyIHRpbWVvdXQsIGFyZ3MsIGNvbnRleHQsIHRpbWVzdGFtcCwgcmVzdWx0O1xuXG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbGFzdCA9IF8ubm93KCkgLSB0aW1lc3RhbXA7XG5cbiAgICAgIGlmIChsYXN0IDwgd2FpdCAmJiBsYXN0ID49IDApIHtcbiAgICAgICAgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQgLSBsYXN0KTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgICBpZiAoIWltbWVkaWF0ZSkge1xuICAgICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgdGltZXN0YW1wID0gXy5ub3coKTtcbiAgICAgIHZhciBjYWxsTm93ID0gaW1tZWRpYXRlICYmICF0aW1lb3V0O1xuICAgICAgaWYgKCF0aW1lb3V0KSB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCk7XG4gICAgICBpZiAoY2FsbE5vdykge1xuICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9XG5cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBmdW5jdGlvbiBwYXNzZWQgYXMgYW4gYXJndW1lbnQgdG8gdGhlIHNlY29uZCxcbiAgLy8gYWxsb3dpbmcgeW91IHRvIGFkanVzdCBhcmd1bWVudHMsIHJ1biBjb2RlIGJlZm9yZSBhbmQgYWZ0ZXIsIGFuZFxuICAvLyBjb25kaXRpb25hbGx5IGV4ZWN1dGUgdGhlIG9yaWdpbmFsIGZ1bmN0aW9uLlxuICBfLndyYXAgPSBmdW5jdGlvbihmdW5jLCB3cmFwcGVyKSB7XG4gICAgcmV0dXJuIF8ucGFydGlhbCh3cmFwcGVyLCBmdW5jKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgbmVnYXRlZCB2ZXJzaW9uIG9mIHRoZSBwYXNzZWQtaW4gcHJlZGljYXRlLlxuICBfLm5lZ2F0ZSA9IGZ1bmN0aW9uKHByZWRpY2F0ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiAhcHJlZGljYXRlLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCBpcyB0aGUgY29tcG9zaXRpb24gb2YgYSBsaXN0IG9mIGZ1bmN0aW9ucywgZWFjaFxuICAvLyBjb25zdW1pbmcgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgZnVuY3Rpb24gdGhhdCBmb2xsb3dzLlxuICBfLmNvbXBvc2UgPSBmdW5jdGlvbigpIHtcbiAgICB2YXIgYXJncyA9IGFyZ3VtZW50cztcbiAgICB2YXIgc3RhcnQgPSBhcmdzLmxlbmd0aCAtIDE7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGkgPSBzdGFydDtcbiAgICAgIHZhciByZXN1bHQgPSBhcmdzW3N0YXJ0XS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgd2hpbGUgKGktLSkgcmVzdWx0ID0gYXJnc1tpXS5jYWxsKHRoaXMsIHJlc3VsdCk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIG9uIGFuZCBhZnRlciB0aGUgTnRoIGNhbGwuXG4gIF8uYWZ0ZXIgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzIDwgMSkge1xuICAgICAgICByZXR1cm4gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBvbmx5IGJlIGV4ZWN1dGVkIHVwIHRvIChidXQgbm90IGluY2x1ZGluZykgdGhlIE50aCBjYWxsLlxuICBfLmJlZm9yZSA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgdmFyIG1lbW87XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPiAwKSB7XG4gICAgICAgIG1lbW8gPSBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgICBpZiAodGltZXMgPD0gMSkgZnVuYyA9IG51bGw7XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgZXhlY3V0ZWQgYXQgbW9zdCBvbmUgdGltZSwgbm8gbWF0dGVyIGhvd1xuICAvLyBvZnRlbiB5b3UgY2FsbCBpdC4gVXNlZnVsIGZvciBsYXp5IGluaXRpYWxpemF0aW9uLlxuICBfLm9uY2UgPSBfLnBhcnRpYWwoXy5iZWZvcmUsIDIpO1xuXG4gIC8vIE9iamVjdCBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEtleXMgaW4gSUUgPCA5IHRoYXQgd29uJ3QgYmUgaXRlcmF0ZWQgYnkgYGZvciBrZXkgaW4gLi4uYCBhbmQgdGh1cyBtaXNzZWQuXG4gIHZhciBoYXNFbnVtQnVnID0gIXt0b1N0cmluZzogbnVsbH0ucHJvcGVydHlJc0VudW1lcmFibGUoJ3RvU3RyaW5nJyk7XG4gIHZhciBub25FbnVtZXJhYmxlUHJvcHMgPSBbJ3ZhbHVlT2YnLCAnaXNQcm90b3R5cGVPZicsICd0b1N0cmluZycsXG4gICAgICAgICAgICAgICAgICAgICAgJ3Byb3BlcnR5SXNFbnVtZXJhYmxlJywgJ2hhc093blByb3BlcnR5JywgJ3RvTG9jYWxlU3RyaW5nJ107XG5cbiAgZnVuY3Rpb24gY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpIHtcbiAgICB2YXIgbm9uRW51bUlkeCA9IG5vbkVudW1lcmFibGVQcm9wcy5sZW5ndGg7XG4gICAgdmFyIGNvbnN0cnVjdG9yID0gb2JqLmNvbnN0cnVjdG9yO1xuICAgIHZhciBwcm90byA9IChfLmlzRnVuY3Rpb24oY29uc3RydWN0b3IpICYmIGNvbnN0cnVjdG9yLnByb3RvdHlwZSkgfHwgT2JqUHJvdG87XG5cbiAgICAvLyBDb25zdHJ1Y3RvciBpcyBhIHNwZWNpYWwgY2FzZS5cbiAgICB2YXIgcHJvcCA9ICdjb25zdHJ1Y3Rvcic7XG4gICAgaWYgKF8uaGFzKG9iaiwgcHJvcCkgJiYgIV8uY29udGFpbnMoa2V5cywgcHJvcCkpIGtleXMucHVzaChwcm9wKTtcblxuICAgIHdoaWxlIChub25FbnVtSWR4LS0pIHtcbiAgICAgIHByb3AgPSBub25FbnVtZXJhYmxlUHJvcHNbbm9uRW51bUlkeF07XG4gICAgICBpZiAocHJvcCBpbiBvYmogJiYgb2JqW3Byb3BdICE9PSBwcm90b1twcm9wXSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkge1xuICAgICAgICBrZXlzLnB1c2gocHJvcCk7XG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgLy8gUmV0cmlldmUgdGhlIG5hbWVzIG9mIGFuIG9iamVjdCdzIG93biBwcm9wZXJ0aWVzLlxuICAvLyBEZWxlZ2F0ZXMgdG8gKipFQ01BU2NyaXB0IDUqKidzIG5hdGl2ZSBgT2JqZWN0LmtleXNgXG4gIF8ua2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgaWYgKG5hdGl2ZUtleXMpIHJldHVybiBuYXRpdmVLZXlzKG9iaik7XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBpZiAoXy5oYXMob2JqLCBrZXkpKSBrZXlzLnB1c2goa2V5KTtcbiAgICAvLyBBaGVtLCBJRSA8IDkuXG4gICAgaWYgKGhhc0VudW1CdWcpIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBrZXlzKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSBhbGwgdGhlIHByb3BlcnR5IG5hbWVzIG9mIGFuIG9iamVjdC5cbiAgXy5hbGxLZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIHRoZSB2YWx1ZXMgb2YgYW4gb2JqZWN0J3MgcHJvcGVydGllcy5cbiAgXy52YWx1ZXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgdmFsdWVzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YWx1ZXNbaV0gPSBvYmpba2V5c1tpXV07XG4gICAgfVxuICAgIHJldHVybiB2YWx1ZXM7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgcmVzdWx0cyBvZiBhcHBseWluZyB0aGUgaXRlcmF0ZWUgdG8gZWFjaCBlbGVtZW50IG9mIHRoZSBvYmplY3RcbiAgLy8gSW4gY29udHJhc3QgdG8gXy5tYXAgaXQgcmV0dXJucyBhbiBvYmplY3RcbiAgXy5tYXBPYmplY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAgXy5rZXlzKG9iaiksXG4gICAgICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGgsXG4gICAgICAgICAgcmVzdWx0cyA9IHt9LFxuICAgICAgICAgIGN1cnJlbnRLZXk7XG4gICAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICAgIGN1cnJlbnRLZXkgPSBrZXlzW2luZGV4XTtcbiAgICAgICAgcmVzdWx0c1tjdXJyZW50S2V5XSA9IGl0ZXJhdGVlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENvbnZlcnQgYW4gb2JqZWN0IGludG8gYSBsaXN0IG9mIGBba2V5LCB2YWx1ZV1gIHBhaXJzLlxuICBfLnBhaXJzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHBhaXJzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBwYWlyc1tpXSA9IFtrZXlzW2ldLCBvYmpba2V5c1tpXV1dO1xuICAgIH1cbiAgICByZXR1cm4gcGFpcnM7XG4gIH07XG5cbiAgLy8gSW52ZXJ0IHRoZSBrZXlzIGFuZCB2YWx1ZXMgb2YgYW4gb2JqZWN0LiBUaGUgdmFsdWVzIG11c3QgYmUgc2VyaWFsaXphYmxlLlxuICBfLmludmVydCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciByZXN1bHQgPSB7fTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICByZXN1bHRbb2JqW2tleXNbaV1dXSA9IGtleXNbaV07XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgc29ydGVkIGxpc3Qgb2YgdGhlIGZ1bmN0aW9uIG5hbWVzIGF2YWlsYWJsZSBvbiB0aGUgb2JqZWN0LlxuICAvLyBBbGlhc2VkIGFzIGBtZXRob2RzYFxuICBfLmZ1bmN0aW9ucyA9IF8ubWV0aG9kcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBuYW1lcyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIHtcbiAgICAgIGlmIChfLmlzRnVuY3Rpb24ob2JqW2tleV0pKSBuYW1lcy5wdXNoKGtleSk7XG4gICAgfVxuICAgIHJldHVybiBuYW1lcy5zb3J0KCk7XG4gIH07XG5cbiAgLy8gRXh0ZW5kIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBwcm9wZXJ0aWVzIGluIHBhc3NlZC1pbiBvYmplY3QocykuXG4gIF8uZXh0ZW5kID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzKTtcblxuICAvLyBBc3NpZ25zIGEgZ2l2ZW4gb2JqZWN0IHdpdGggYWxsIHRoZSBvd24gcHJvcGVydGllcyBpbiB0aGUgcGFzc2VkLWluIG9iamVjdChzKVxuICAvLyAoaHR0cHM6Ly9kZXZlbG9wZXIubW96aWxsYS5vcmcvZG9jcy9XZWIvSmF2YVNjcmlwdC9SZWZlcmVuY2UvR2xvYmFsX09iamVjdHMvT2JqZWN0L2Fzc2lnbilcbiAgXy5leHRlbmRPd24gPSBfLmFzc2lnbiA9IGNyZWF0ZUFzc2lnbmVyKF8ua2V5cyk7XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3Qga2V5IG9uIGFuIG9iamVjdCB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0XG4gIF8uZmluZEtleSA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopLCBrZXk7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIGtleSA9IGtleXNbaV07XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtrZXldLCBrZXksIG9iaikpIHJldHVybiBrZXk7XG4gICAgfVxuICB9O1xuXG4gIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCBvbmx5IGNvbnRhaW5pbmcgdGhlIHdoaXRlbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ucGljayA9IGZ1bmN0aW9uKG9iamVjdCwgb2l0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9LCBvYmogPSBvYmplY3QsIGl0ZXJhdGVlLCBrZXlzO1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHJlc3VsdDtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKG9pdGVyYXRlZSkpIHtcbiAgICAgIGtleXMgPSBfLmFsbEtleXMob2JqKTtcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihvaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXlzID0gZmxhdHRlbihhcmd1bWVudHMsIGZhbHNlLCBmYWxzZSwgMSk7XG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikgeyByZXR1cm4ga2V5IGluIG9iajsgfTtcbiAgICAgIG9iaiA9IE9iamVjdChvYmopO1xuICAgIH1cbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICB2YXIgdmFsdWUgPSBvYmpba2V5XTtcbiAgICAgIGlmIChpdGVyYXRlZSh2YWx1ZSwga2V5LCBvYmopKSByZXN1bHRba2V5XSA9IHZhbHVlO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgd2l0aG91dCB0aGUgYmxhY2tsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5vbWl0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmIChfLmlzRnVuY3Rpb24oaXRlcmF0ZWUpKSB7XG4gICAgICBpdGVyYXRlZSA9IF8ubmVnYXRlKGl0ZXJhdGVlKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdmFyIGtleXMgPSBfLm1hcChmbGF0dGVuKGFyZ3VtZW50cywgZmFsc2UsIGZhbHNlLCAxKSwgU3RyaW5nKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSkge1xuICAgICAgICByZXR1cm4gIV8uY29udGFpbnMoa2V5cywga2V5KTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBfLnBpY2sob2JqLCBpdGVyYXRlZSwgY29udGV4dCk7XG4gIH07XG5cbiAgLy8gRmlsbCBpbiBhIGdpdmVuIG9iamVjdCB3aXRoIGRlZmF1bHQgcHJvcGVydGllcy5cbiAgXy5kZWZhdWx0cyA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cywgdHJ1ZSk7XG5cbiAgLy8gQ3JlYXRlcyBhbiBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIHRoZSBnaXZlbiBwcm90b3R5cGUgb2JqZWN0LlxuICAvLyBJZiBhZGRpdGlvbmFsIHByb3BlcnRpZXMgYXJlIHByb3ZpZGVkIHRoZW4gdGhleSB3aWxsIGJlIGFkZGVkIHRvIHRoZVxuICAvLyBjcmVhdGVkIG9iamVjdC5cbiAgXy5jcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUsIHByb3BzKSB7XG4gICAgdmFyIHJlc3VsdCA9IGJhc2VDcmVhdGUocHJvdG90eXBlKTtcbiAgICBpZiAocHJvcHMpIF8uZXh0ZW5kT3duKHJlc3VsdCwgcHJvcHMpO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgKHNoYWxsb3ctY2xvbmVkKSBkdXBsaWNhdGUgb2YgYW4gb2JqZWN0LlxuICBfLmNsb25lID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBvYmo7XG4gICAgcmV0dXJuIF8uaXNBcnJheShvYmopID8gb2JqLnNsaWNlKCkgOiBfLmV4dGVuZCh7fSwgb2JqKTtcbiAgfTtcblxuICAvLyBJbnZva2VzIGludGVyY2VwdG9yIHdpdGggdGhlIG9iaiwgYW5kIHRoZW4gcmV0dXJucyBvYmouXG4gIC8vIFRoZSBwcmltYXJ5IHB1cnBvc2Ugb2YgdGhpcyBtZXRob2QgaXMgdG8gXCJ0YXAgaW50b1wiIGEgbWV0aG9kIGNoYWluLCBpblxuICAvLyBvcmRlciB0byBwZXJmb3JtIG9wZXJhdGlvbnMgb24gaW50ZXJtZWRpYXRlIHJlc3VsdHMgd2l0aGluIHRoZSBjaGFpbi5cbiAgXy50YXAgPSBmdW5jdGlvbihvYmosIGludGVyY2VwdG9yKSB7XG4gICAgaW50ZXJjZXB0b3Iob2JqKTtcbiAgICByZXR1cm4gb2JqO1xuICB9O1xuXG4gIC8vIFJldHVybnMgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmlzTWF0Y2ggPSBmdW5jdGlvbihvYmplY3QsIGF0dHJzKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMoYXR0cnMpLCBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICBpZiAob2JqZWN0ID09IG51bGwpIHJldHVybiAhbGVuZ3RoO1xuICAgIHZhciBvYmogPSBPYmplY3Qob2JqZWN0KTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChhdHRyc1trZXldICE9PSBvYmpba2V5XSB8fCAhKGtleSBpbiBvYmopKSByZXR1cm4gZmFsc2U7XG4gICAgfVxuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG5cbiAgLy8gSW50ZXJuYWwgcmVjdXJzaXZlIGNvbXBhcmlzb24gZnVuY3Rpb24gZm9yIGBpc0VxdWFsYC5cbiAgdmFyIGVxID0gZnVuY3Rpb24oYSwgYiwgYVN0YWNrLCBiU3RhY2spIHtcbiAgICAvLyBJZGVudGljYWwgb2JqZWN0cyBhcmUgZXF1YWwuIGAwID09PSAtMGAsIGJ1dCB0aGV5IGFyZW4ndCBpZGVudGljYWwuXG4gICAgLy8gU2VlIHRoZSBbSGFybW9ueSBgZWdhbGAgcHJvcG9zYWxdKGh0dHA6Ly93aWtpLmVjbWFzY3JpcHQub3JnL2Rva3UucGhwP2lkPWhhcm1vbnk6ZWdhbCkuXG4gICAgaWYgKGEgPT09IGIpIHJldHVybiBhICE9PSAwIHx8IDEgLyBhID09PSAxIC8gYjtcbiAgICAvLyBBIHN0cmljdCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeSBiZWNhdXNlIGBudWxsID09IHVuZGVmaW5lZGAuXG4gICAgaWYgKGEgPT0gbnVsbCB8fCBiID09IG51bGwpIHJldHVybiBhID09PSBiO1xuICAgIC8vIFVud3JhcCBhbnkgd3JhcHBlZCBvYmplY3RzLlxuICAgIGlmIChhIGluc3RhbmNlb2YgXykgYSA9IGEuX3dyYXBwZWQ7XG4gICAgaWYgKGIgaW5zdGFuY2VvZiBfKSBiID0gYi5fd3JhcHBlZDtcbiAgICAvLyBDb21wYXJlIGBbW0NsYXNzXV1gIG5hbWVzLlxuICAgIHZhciBjbGFzc05hbWUgPSB0b1N0cmluZy5jYWxsKGEpO1xuICAgIGlmIChjbGFzc05hbWUgIT09IHRvU3RyaW5nLmNhbGwoYikpIHJldHVybiBmYWxzZTtcbiAgICBzd2l0Y2ggKGNsYXNzTmFtZSkge1xuICAgICAgLy8gU3RyaW5ncywgbnVtYmVycywgcmVndWxhciBleHByZXNzaW9ucywgZGF0ZXMsIGFuZCBib29sZWFucyBhcmUgY29tcGFyZWQgYnkgdmFsdWUuXG4gICAgICBjYXNlICdbb2JqZWN0IFJlZ0V4cF0nOlxuICAgICAgLy8gUmVnRXhwcyBhcmUgY29lcmNlZCB0byBzdHJpbmdzIGZvciBjb21wYXJpc29uIChOb3RlOiAnJyArIC9hL2kgPT09ICcvYS9pJylcbiAgICAgIGNhc2UgJ1tvYmplY3QgU3RyaW5nXSc6XG4gICAgICAgIC8vIFByaW1pdGl2ZXMgYW5kIHRoZWlyIGNvcnJlc3BvbmRpbmcgb2JqZWN0IHdyYXBwZXJzIGFyZSBlcXVpdmFsZW50OyB0aHVzLCBgXCI1XCJgIGlzXG4gICAgICAgIC8vIGVxdWl2YWxlbnQgdG8gYG5ldyBTdHJpbmcoXCI1XCIpYC5cbiAgICAgICAgcmV0dXJuICcnICsgYSA9PT0gJycgKyBiO1xuICAgICAgY2FzZSAnW29iamVjdCBOdW1iZXJdJzpcbiAgICAgICAgLy8gYE5hTmBzIGFyZSBlcXVpdmFsZW50LCBidXQgbm9uLXJlZmxleGl2ZS5cbiAgICAgICAgLy8gT2JqZWN0KE5hTikgaXMgZXF1aXZhbGVudCB0byBOYU5cbiAgICAgICAgaWYgKCthICE9PSArYSkgcmV0dXJuICtiICE9PSArYjtcbiAgICAgICAgLy8gQW4gYGVnYWxgIGNvbXBhcmlzb24gaXMgcGVyZm9ybWVkIGZvciBvdGhlciBudW1lcmljIHZhbHVlcy5cbiAgICAgICAgcmV0dXJuICthID09PSAwID8gMSAvICthID09PSAxIC8gYiA6ICthID09PSArYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgRGF0ZV0nOlxuICAgICAgY2FzZSAnW29iamVjdCBCb29sZWFuXSc6XG4gICAgICAgIC8vIENvZXJjZSBkYXRlcyBhbmQgYm9vbGVhbnMgdG8gbnVtZXJpYyBwcmltaXRpdmUgdmFsdWVzLiBEYXRlcyBhcmUgY29tcGFyZWQgYnkgdGhlaXJcbiAgICAgICAgLy8gbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zLiBOb3RlIHRoYXQgaW52YWxpZCBkYXRlcyB3aXRoIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9uc1xuICAgICAgICAvLyBvZiBgTmFOYCBhcmUgbm90IGVxdWl2YWxlbnQuXG4gICAgICAgIHJldHVybiArYSA9PT0gK2I7XG4gICAgfVxuXG4gICAgdmFyIGFyZUFycmF5cyA9IGNsYXNzTmFtZSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgICBpZiAoIWFyZUFycmF5cykge1xuICAgICAgaWYgKHR5cGVvZiBhICE9ICdvYmplY3QnIHx8IHR5cGVvZiBiICE9ICdvYmplY3QnKSByZXR1cm4gZmFsc2U7XG5cbiAgICAgIC8vIE9iamVjdHMgd2l0aCBkaWZmZXJlbnQgY29uc3RydWN0b3JzIGFyZSBub3QgZXF1aXZhbGVudCwgYnV0IGBPYmplY3RgcyBvciBgQXJyYXlgc1xuICAgICAgLy8gZnJvbSBkaWZmZXJlbnQgZnJhbWVzIGFyZS5cbiAgICAgIHZhciBhQ3RvciA9IGEuY29uc3RydWN0b3IsIGJDdG9yID0gYi5jb25zdHJ1Y3RvcjtcbiAgICAgIGlmIChhQ3RvciAhPT0gYkN0b3IgJiYgIShfLmlzRnVuY3Rpb24oYUN0b3IpICYmIGFDdG9yIGluc3RhbmNlb2YgYUN0b3IgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfLmlzRnVuY3Rpb24oYkN0b3IpICYmIGJDdG9yIGluc3RhbmNlb2YgYkN0b3IpXG4gICAgICAgICAgICAgICAgICAgICAgICAgICYmICgnY29uc3RydWN0b3InIGluIGEgJiYgJ2NvbnN0cnVjdG9yJyBpbiBiKSkge1xuICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIEFzc3VtZSBlcXVhbGl0eSBmb3IgY3ljbGljIHN0cnVjdHVyZXMuIFRoZSBhbGdvcml0aG0gZm9yIGRldGVjdGluZyBjeWNsaWNcbiAgICAvLyBzdHJ1Y3R1cmVzIGlzIGFkYXB0ZWQgZnJvbSBFUyA1LjEgc2VjdGlvbiAxNS4xMi4zLCBhYnN0cmFjdCBvcGVyYXRpb24gYEpPYC5cblxuICAgIC8vIEluaXRpYWxpemluZyBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICAvLyBJdCdzIGRvbmUgaGVyZSBzaW5jZSB3ZSBvbmx5IG5lZWQgdGhlbSBmb3Igb2JqZWN0cyBhbmQgYXJyYXlzIGNvbXBhcmlzb24uXG4gICAgYVN0YWNrID0gYVN0YWNrIHx8IFtdO1xuICAgIGJTdGFjayA9IGJTdGFjayB8fCBbXTtcbiAgICB2YXIgbGVuZ3RoID0gYVN0YWNrLmxlbmd0aDtcbiAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgIC8vIExpbmVhciBzZWFyY2guIFBlcmZvcm1hbmNlIGlzIGludmVyc2VseSBwcm9wb3J0aW9uYWwgdG8gdGhlIG51bWJlciBvZlxuICAgICAgLy8gdW5pcXVlIG5lc3RlZCBzdHJ1Y3R1cmVzLlxuICAgICAgaWYgKGFTdGFja1tsZW5ndGhdID09PSBhKSByZXR1cm4gYlN0YWNrW2xlbmd0aF0gPT09IGI7XG4gICAgfVxuXG4gICAgLy8gQWRkIHRoZSBmaXJzdCBvYmplY3QgdG8gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wdXNoKGEpO1xuICAgIGJTdGFjay5wdXNoKGIpO1xuXG4gICAgLy8gUmVjdXJzaXZlbHkgY29tcGFyZSBvYmplY3RzIGFuZCBhcnJheXMuXG4gICAgaWYgKGFyZUFycmF5cykge1xuICAgICAgLy8gQ29tcGFyZSBhcnJheSBsZW5ndGhzIHRvIGRldGVybWluZSBpZiBhIGRlZXAgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkuXG4gICAgICBsZW5ndGggPSBhLmxlbmd0aDtcbiAgICAgIGlmIChsZW5ndGggIT09IGIubGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgdGhlIGNvbnRlbnRzLCBpZ25vcmluZyBub24tbnVtZXJpYyBwcm9wZXJ0aWVzLlxuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIGlmICghZXEoYVtsZW5ndGhdLCBiW2xlbmd0aF0sIGFTdGFjaywgYlN0YWNrKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICAvLyBEZWVwIGNvbXBhcmUgb2JqZWN0cy5cbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKGEpLCBrZXk7XG4gICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgIC8vIEVuc3VyZSB0aGF0IGJvdGggb2JqZWN0cyBjb250YWluIHRoZSBzYW1lIG51bWJlciBvZiBwcm9wZXJ0aWVzIGJlZm9yZSBjb21wYXJpbmcgZGVlcCBlcXVhbGl0eS5cbiAgICAgIGlmIChfLmtleXMoYikubGVuZ3RoICE9PSBsZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICAvLyBEZWVwIGNvbXBhcmUgZWFjaCBtZW1iZXJcbiAgICAgICAga2V5ID0ga2V5c1tsZW5ndGhdO1xuICAgICAgICBpZiAoIShfLmhhcyhiLCBrZXkpICYmIGVxKGFba2V5XSwgYltrZXldLCBhU3RhY2ssIGJTdGFjaykpKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfVxuICAgIC8vIFJlbW92ZSB0aGUgZmlyc3Qgb2JqZWN0IGZyb20gdGhlIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIGFTdGFjay5wb3AoKTtcbiAgICBiU3RhY2sucG9wKCk7XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gUGVyZm9ybSBhIGRlZXAgY29tcGFyaXNvbiB0byBjaGVjayBpZiB0d28gb2JqZWN0cyBhcmUgZXF1YWwuXG4gIF8uaXNFcXVhbCA9IGZ1bmN0aW9uKGEsIGIpIHtcbiAgICByZXR1cm4gZXEoYSwgYik7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiBhcnJheSwgc3RyaW5nLCBvciBvYmplY3QgZW1wdHk/XG4gIC8vIEFuIFwiZW1wdHlcIiBvYmplY3QgaGFzIG5vIGVudW1lcmFibGUgb3duLXByb3BlcnRpZXMuXG4gIF8uaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogPT0gbnVsbCkgcmV0dXJuIHRydWU7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikgJiYgKF8uaXNBcnJheShvYmopIHx8IF8uaXNTdHJpbmcob2JqKSB8fCBfLmlzQXJndW1lbnRzKG9iaikpKSByZXR1cm4gb2JqLmxlbmd0aCA9PT0gMDtcbiAgICByZXR1cm4gXy5rZXlzKG9iaikubGVuZ3RoID09PSAwO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBET00gZWxlbWVudD9cbiAgXy5pc0VsZW1lbnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gISEob2JqICYmIG9iai5ub2RlVHlwZSA9PT0gMSk7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhbiBhcnJheT9cbiAgLy8gRGVsZWdhdGVzIHRvIEVDTUE1J3MgbmF0aXZlIEFycmF5LmlzQXJyYXlcbiAgXy5pc0FycmF5ID0gbmF0aXZlSXNBcnJheSB8fCBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBBcnJheV0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgYW4gb2JqZWN0P1xuICBfLmlzT2JqZWN0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHR5cGUgPSB0eXBlb2Ygb2JqO1xuICAgIHJldHVybiB0eXBlID09PSAnZnVuY3Rpb24nIHx8IHR5cGUgPT09ICdvYmplY3QnICYmICEhb2JqO1xuICB9O1xuXG4gIC8vIEFkZCBzb21lIGlzVHlwZSBtZXRob2RzOiBpc0FyZ3VtZW50cywgaXNGdW5jdGlvbiwgaXNTdHJpbmcsIGlzTnVtYmVyLCBpc0RhdGUsIGlzUmVnRXhwLCBpc0Vycm9yLlxuICBfLmVhY2goWydBcmd1bWVudHMnLCAnRnVuY3Rpb24nLCAnU3RyaW5nJywgJ051bWJlcicsICdEYXRlJywgJ1JlZ0V4cCcsICdFcnJvciddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgX1snaXMnICsgbmFtZV0gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0ICcgKyBuYW1lICsgJ10nO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIERlZmluZSBhIGZhbGxiYWNrIHZlcnNpb24gb2YgdGhlIG1ldGhvZCBpbiBicm93c2VycyAoYWhlbSwgSUUgPCA5KSwgd2hlcmVcbiAgLy8gdGhlcmUgaXNuJ3QgYW55IGluc3BlY3RhYmxlIFwiQXJndW1lbnRzXCIgdHlwZS5cbiAgaWYgKCFfLmlzQXJndW1lbnRzKGFyZ3VtZW50cykpIHtcbiAgICBfLmlzQXJndW1lbnRzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5oYXMob2JqLCAnY2FsbGVlJyk7XG4gICAgfTtcbiAgfVxuXG4gIC8vIE9wdGltaXplIGBpc0Z1bmN0aW9uYCBpZiBhcHByb3ByaWF0ZS4gV29yayBhcm91bmQgc29tZSB0eXBlb2YgYnVncyBpbiBvbGQgdjgsXG4gIC8vIElFIDExICgjMTYyMSksIGFuZCBpbiBTYWZhcmkgOCAoIzE5MjkpLlxuICBpZiAodHlwZW9mIC8uLyAhPSAnZnVuY3Rpb24nICYmIHR5cGVvZiBJbnQ4QXJyYXkgIT0gJ29iamVjdCcpIHtcbiAgICBfLmlzRnVuY3Rpb24gPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiB0eXBlb2Ygb2JqID09ICdmdW5jdGlvbicgfHwgZmFsc2U7XG4gICAgfTtcbiAgfVxuXG4gIC8vIElzIGEgZ2l2ZW4gb2JqZWN0IGEgZmluaXRlIG51bWJlcj9cbiAgXy5pc0Zpbml0ZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBpc0Zpbml0ZShvYmopICYmICFpc05hTihwYXJzZUZsb2F0KG9iaikpO1xuICB9O1xuXG4gIC8vIElzIHRoZSBnaXZlbiB2YWx1ZSBgTmFOYD8gKE5hTiBpcyB0aGUgb25seSBudW1iZXIgd2hpY2ggZG9lcyBub3QgZXF1YWwgaXRzZWxmKS5cbiAgXy5pc05hTiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBfLmlzTnVtYmVyKG9iaikgJiYgb2JqICE9PSArb2JqO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYSBib29sZWFuP1xuICBfLmlzQm9vbGVhbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHRydWUgfHwgb2JqID09PSBmYWxzZSB8fCB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEJvb2xlYW5dJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGVxdWFsIHRvIG51bGw/XG4gIF8uaXNOdWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gbnVsbDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIHVuZGVmaW5lZD9cbiAgXy5pc1VuZGVmaW5lZCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IHZvaWQgMDtcbiAgfTtcblxuICAvLyBTaG9ydGN1dCBmdW5jdGlvbiBmb3IgY2hlY2tpbmcgaWYgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHByb3BlcnR5IGRpcmVjdGx5XG4gIC8vIG9uIGl0c2VsZiAoaW4gb3RoZXIgd29yZHMsIG5vdCBvbiBhIHByb3RvdHlwZSkuXG4gIF8uaGFzID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gb2JqICE9IG51bGwgJiYgaGFzT3duUHJvcGVydHkuY2FsbChvYmosIGtleSk7XG4gIH07XG5cbiAgLy8gVXRpbGl0eSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBSdW4gVW5kZXJzY29yZS5qcyBpbiAqbm9Db25mbGljdCogbW9kZSwgcmV0dXJuaW5nIHRoZSBgX2AgdmFyaWFibGUgdG8gaXRzXG4gIC8vIHByZXZpb3VzIG93bmVyLiBSZXR1cm5zIGEgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5ub0NvbmZsaWN0ID0gZnVuY3Rpb24oKSB7XG4gICAgcm9vdC5fID0gcHJldmlvdXNVbmRlcnNjb3JlO1xuICAgIHJldHVybiB0aGlzO1xuICB9O1xuXG4gIC8vIEtlZXAgdGhlIGlkZW50aXR5IGZ1bmN0aW9uIGFyb3VuZCBmb3IgZGVmYXVsdCBpdGVyYXRlZXMuXG4gIF8uaWRlbnRpdHkgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiB2YWx1ZTtcbiAgfTtcblxuICAvLyBQcmVkaWNhdGUtZ2VuZXJhdGluZyBmdW5jdGlvbnMuIE9mdGVuIHVzZWZ1bCBvdXRzaWRlIG9mIFVuZGVyc2NvcmUuXG4gIF8uY29uc3RhbnQgPSBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9O1xuICB9O1xuXG4gIF8ubm9vcCA9IGZ1bmN0aW9uKCl7fTtcblxuICBfLnByb3BlcnR5ID0gcHJvcGVydHk7XG5cbiAgLy8gR2VuZXJhdGVzIGEgZnVuY3Rpb24gZm9yIGEgZ2l2ZW4gb2JqZWN0IHRoYXQgcmV0dXJucyBhIGdpdmVuIHByb3BlcnR5LlxuICBfLnByb3BlcnR5T2YgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09IG51bGwgPyBmdW5jdGlvbigpe30gOiBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHJldHVybiBvYmpba2V5XTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBwcmVkaWNhdGUgZm9yIGNoZWNraW5nIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZlxuICAvLyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5tYXRjaGVyID0gXy5tYXRjaGVzID0gZnVuY3Rpb24oYXR0cnMpIHtcbiAgICBhdHRycyA9IF8uZXh0ZW5kT3duKHt9LCBhdHRycyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIF8uaXNNYXRjaChvYmosIGF0dHJzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJ1biBhIGZ1bmN0aW9uICoqbioqIHRpbWVzLlxuICBfLnRpbWVzID0gZnVuY3Rpb24obiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgYWNjdW0gPSBBcnJheShNYXRoLm1heCgwLCBuKSk7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IG47IGkrKykgYWNjdW1baV0gPSBpdGVyYXRlZShpKTtcbiAgICByZXR1cm4gYWNjdW07XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgcmFuZG9tIGludGVnZXIgYmV0d2VlbiBtaW4gYW5kIG1heCAoaW5jbHVzaXZlKS5cbiAgXy5yYW5kb20gPSBmdW5jdGlvbihtaW4sIG1heCkge1xuICAgIGlmIChtYXggPT0gbnVsbCkge1xuICAgICAgbWF4ID0gbWluO1xuICAgICAgbWluID0gMDtcbiAgICB9XG4gICAgcmV0dXJuIG1pbiArIE1hdGguZmxvb3IoTWF0aC5yYW5kb20oKSAqIChtYXggLSBtaW4gKyAxKSk7XG4gIH07XG5cbiAgLy8gQSAocG9zc2libHkgZmFzdGVyKSB3YXkgdG8gZ2V0IHRoZSBjdXJyZW50IHRpbWVzdGFtcCBhcyBhbiBpbnRlZ2VyLlxuICBfLm5vdyA9IERhdGUubm93IHx8IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBuZXcgRGF0ZSgpLmdldFRpbWUoKTtcbiAgfTtcblxuICAgLy8gTGlzdCBvZiBIVE1MIGVudGl0aWVzIGZvciBlc2NhcGluZy5cbiAgdmFyIGVzY2FwZU1hcCA9IHtcbiAgICAnJic6ICcmYW1wOycsXG4gICAgJzwnOiAnJmx0OycsXG4gICAgJz4nOiAnJmd0OycsXG4gICAgJ1wiJzogJyZxdW90OycsXG4gICAgXCInXCI6ICcmI3gyNzsnLFxuICAgICdgJzogJyYjeDYwOydcbiAgfTtcbiAgdmFyIHVuZXNjYXBlTWFwID0gXy5pbnZlcnQoZXNjYXBlTWFwKTtcblxuICAvLyBGdW5jdGlvbnMgZm9yIGVzY2FwaW5nIGFuZCB1bmVzY2FwaW5nIHN0cmluZ3MgdG8vZnJvbSBIVE1MIGludGVycG9sYXRpb24uXG4gIHZhciBjcmVhdGVFc2NhcGVyID0gZnVuY3Rpb24obWFwKSB7XG4gICAgdmFyIGVzY2FwZXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgICAgcmV0dXJuIG1hcFttYXRjaF07XG4gICAgfTtcbiAgICAvLyBSZWdleGVzIGZvciBpZGVudGlmeWluZyBhIGtleSB0aGF0IG5lZWRzIHRvIGJlIGVzY2FwZWRcbiAgICB2YXIgc291cmNlID0gJyg/OicgKyBfLmtleXMobWFwKS5qb2luKCd8JykgKyAnKSc7XG4gICAgdmFyIHRlc3RSZWdleHAgPSBSZWdFeHAoc291cmNlKTtcbiAgICB2YXIgcmVwbGFjZVJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UsICdnJyk7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKHN0cmluZykge1xuICAgICAgc3RyaW5nID0gc3RyaW5nID09IG51bGwgPyAnJyA6ICcnICsgc3RyaW5nO1xuICAgICAgcmV0dXJuIHRlc3RSZWdleHAudGVzdChzdHJpbmcpID8gc3RyaW5nLnJlcGxhY2UocmVwbGFjZVJlZ2V4cCwgZXNjYXBlcikgOiBzdHJpbmc7XG4gICAgfTtcbiAgfTtcbiAgXy5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKGVzY2FwZU1hcCk7XG4gIF8udW5lc2NhcGUgPSBjcmVhdGVFc2NhcGVyKHVuZXNjYXBlTWFwKTtcblxuICAvLyBJZiB0aGUgdmFsdWUgb2YgdGhlIG5hbWVkIGBwcm9wZXJ0eWAgaXMgYSBmdW5jdGlvbiB0aGVuIGludm9rZSBpdCB3aXRoIHRoZVxuICAvLyBgb2JqZWN0YCBhcyBjb250ZXh0OyBvdGhlcndpc2UsIHJldHVybiBpdC5cbiAgXy5yZXN1bHQgPSBmdW5jdGlvbihvYmplY3QsIHByb3BlcnR5LCBmYWxsYmFjaykge1xuICAgIHZhciB2YWx1ZSA9IG9iamVjdCA9PSBudWxsID8gdm9pZCAwIDogb2JqZWN0W3Byb3BlcnR5XTtcbiAgICBpZiAodmFsdWUgPT09IHZvaWQgMCkge1xuICAgICAgdmFsdWUgPSBmYWxsYmFjaztcbiAgICB9XG4gICAgcmV0dXJuIF8uaXNGdW5jdGlvbih2YWx1ZSkgPyB2YWx1ZS5jYWxsKG9iamVjdCkgOiB2YWx1ZTtcbiAgfTtcblxuICAvLyBHZW5lcmF0ZSBhIHVuaXF1ZSBpbnRlZ2VyIGlkICh1bmlxdWUgd2l0aGluIHRoZSBlbnRpcmUgY2xpZW50IHNlc3Npb24pLlxuICAvLyBVc2VmdWwgZm9yIHRlbXBvcmFyeSBET00gaWRzLlxuICB2YXIgaWRDb3VudGVyID0gMDtcbiAgXy51bmlxdWVJZCA9IGZ1bmN0aW9uKHByZWZpeCkge1xuICAgIHZhciBpZCA9ICsraWRDb3VudGVyICsgJyc7XG4gICAgcmV0dXJuIHByZWZpeCA/IHByZWZpeCArIGlkIDogaWQ7XG4gIH07XG5cbiAgLy8gQnkgZGVmYXVsdCwgVW5kZXJzY29yZSB1c2VzIEVSQi1zdHlsZSB0ZW1wbGF0ZSBkZWxpbWl0ZXJzLCBjaGFuZ2UgdGhlXG4gIC8vIGZvbGxvd2luZyB0ZW1wbGF0ZSBzZXR0aW5ncyB0byB1c2UgYWx0ZXJuYXRpdmUgZGVsaW1pdGVycy5cbiAgXy50ZW1wbGF0ZVNldHRpbmdzID0ge1xuICAgIGV2YWx1YXRlICAgIDogLzwlKFtcXHNcXFNdKz8pJT4vZyxcbiAgICBpbnRlcnBvbGF0ZSA6IC88JT0oW1xcc1xcU10rPyklPi9nLFxuICAgIGVzY2FwZSAgICAgIDogLzwlLShbXFxzXFxTXSs/KSU+L2dcbiAgfTtcblxuICAvLyBXaGVuIGN1c3RvbWl6aW5nIGB0ZW1wbGF0ZVNldHRpbmdzYCwgaWYgeW91IGRvbid0IHdhbnQgdG8gZGVmaW5lIGFuXG4gIC8vIGludGVycG9sYXRpb24sIGV2YWx1YXRpb24gb3IgZXNjYXBpbmcgcmVnZXgsIHdlIG5lZWQgb25lIHRoYXQgaXNcbiAgLy8gZ3VhcmFudGVlZCBub3QgdG8gbWF0Y2guXG4gIHZhciBub01hdGNoID0gLyguKV4vO1xuXG4gIC8vIENlcnRhaW4gY2hhcmFjdGVycyBuZWVkIHRvIGJlIGVzY2FwZWQgc28gdGhhdCB0aGV5IGNhbiBiZSBwdXQgaW50byBhXG4gIC8vIHN0cmluZyBsaXRlcmFsLlxuICB2YXIgZXNjYXBlcyA9IHtcbiAgICBcIidcIjogICAgICBcIidcIixcbiAgICAnXFxcXCc6ICAgICAnXFxcXCcsXG4gICAgJ1xccic6ICAgICAncicsXG4gICAgJ1xcbic6ICAgICAnbicsXG4gICAgJ1xcdTIwMjgnOiAndTIwMjgnLFxuICAgICdcXHUyMDI5JzogJ3UyMDI5J1xuICB9O1xuXG4gIHZhciBlc2NhcGVyID0gL1xcXFx8J3xcXHJ8XFxufFxcdTIwMjh8XFx1MjAyOS9nO1xuXG4gIHZhciBlc2NhcGVDaGFyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICByZXR1cm4gJ1xcXFwnICsgZXNjYXBlc1ttYXRjaF07XG4gIH07XG5cbiAgLy8gSmF2YVNjcmlwdCBtaWNyby10ZW1wbGF0aW5nLCBzaW1pbGFyIHRvIEpvaG4gUmVzaWcncyBpbXBsZW1lbnRhdGlvbi5cbiAgLy8gVW5kZXJzY29yZSB0ZW1wbGF0aW5nIGhhbmRsZXMgYXJiaXRyYXJ5IGRlbGltaXRlcnMsIHByZXNlcnZlcyB3aGl0ZXNwYWNlLFxuICAvLyBhbmQgY29ycmVjdGx5IGVzY2FwZXMgcXVvdGVzIHdpdGhpbiBpbnRlcnBvbGF0ZWQgY29kZS5cbiAgLy8gTkI6IGBvbGRTZXR0aW5nc2Agb25seSBleGlzdHMgZm9yIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5LlxuICBfLnRlbXBsYXRlID0gZnVuY3Rpb24odGV4dCwgc2V0dGluZ3MsIG9sZFNldHRpbmdzKSB7XG4gICAgaWYgKCFzZXR0aW5ncyAmJiBvbGRTZXR0aW5ncykgc2V0dGluZ3MgPSBvbGRTZXR0aW5ncztcbiAgICBzZXR0aW5ncyA9IF8uZGVmYXVsdHMoe30sIHNldHRpbmdzLCBfLnRlbXBsYXRlU2V0dGluZ3MpO1xuXG4gICAgLy8gQ29tYmluZSBkZWxpbWl0ZXJzIGludG8gb25lIHJlZ3VsYXIgZXhwcmVzc2lvbiB2aWEgYWx0ZXJuYXRpb24uXG4gICAgdmFyIG1hdGNoZXIgPSBSZWdFeHAoW1xuICAgICAgKHNldHRpbmdzLmVzY2FwZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuaW50ZXJwb2xhdGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmV2YWx1YXRlIHx8IG5vTWF0Y2gpLnNvdXJjZVxuICAgIF0uam9pbignfCcpICsgJ3wkJywgJ2cnKTtcblxuICAgIC8vIENvbXBpbGUgdGhlIHRlbXBsYXRlIHNvdXJjZSwgZXNjYXBpbmcgc3RyaW5nIGxpdGVyYWxzIGFwcHJvcHJpYXRlbHkuXG4gICAgdmFyIGluZGV4ID0gMDtcbiAgICB2YXIgc291cmNlID0gXCJfX3ArPSdcIjtcbiAgICB0ZXh0LnJlcGxhY2UobWF0Y2hlciwgZnVuY3Rpb24obWF0Y2gsIGVzY2FwZSwgaW50ZXJwb2xhdGUsIGV2YWx1YXRlLCBvZmZzZXQpIHtcbiAgICAgIHNvdXJjZSArPSB0ZXh0LnNsaWNlKGluZGV4LCBvZmZzZXQpLnJlcGxhY2UoZXNjYXBlciwgZXNjYXBlQ2hhcik7XG4gICAgICBpbmRleCA9IG9mZnNldCArIG1hdGNoLmxlbmd0aDtcblxuICAgICAgaWYgKGVzY2FwZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGVzY2FwZSArIFwiKSk9PW51bGw/Jyc6Xy5lc2NhcGUoX190KSkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChpbnRlcnBvbGF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInK1xcbigoX190PShcIiArIGludGVycG9sYXRlICsgXCIpKT09bnVsbD8nJzpfX3QpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoZXZhbHVhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJztcXG5cIiArIGV2YWx1YXRlICsgXCJcXG5fX3ArPSdcIjtcbiAgICAgIH1cblxuICAgICAgLy8gQWRvYmUgVk1zIG5lZWQgdGhlIG1hdGNoIHJldHVybmVkIHRvIHByb2R1Y2UgdGhlIGNvcnJlY3Qgb2ZmZXN0LlxuICAgICAgcmV0dXJuIG1hdGNoO1xuICAgIH0pO1xuICAgIHNvdXJjZSArPSBcIic7XFxuXCI7XG5cbiAgICAvLyBJZiBhIHZhcmlhYmxlIGlzIG5vdCBzcGVjaWZpZWQsIHBsYWNlIGRhdGEgdmFsdWVzIGluIGxvY2FsIHNjb3BlLlxuICAgIGlmICghc2V0dGluZ3MudmFyaWFibGUpIHNvdXJjZSA9ICd3aXRoKG9ianx8e30pe1xcbicgKyBzb3VyY2UgKyAnfVxcbic7XG5cbiAgICBzb3VyY2UgPSBcInZhciBfX3QsX19wPScnLF9faj1BcnJheS5wcm90b3R5cGUuam9pbixcIiArXG4gICAgICBcInByaW50PWZ1bmN0aW9uKCl7X19wKz1fX2ouY2FsbChhcmd1bWVudHMsJycpO307XFxuXCIgK1xuICAgICAgc291cmNlICsgJ3JldHVybiBfX3A7XFxuJztcblxuICAgIHRyeSB7XG4gICAgICB2YXIgcmVuZGVyID0gbmV3IEZ1bmN0aW9uKHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonLCAnXycsIHNvdXJjZSk7XG4gICAgfSBjYXRjaCAoZSkge1xuICAgICAgZS5zb3VyY2UgPSBzb3VyY2U7XG4gICAgICB0aHJvdyBlO1xuICAgIH1cblxuICAgIHZhciB0ZW1wbGF0ZSA9IGZ1bmN0aW9uKGRhdGEpIHtcbiAgICAgIHJldHVybiByZW5kZXIuY2FsbCh0aGlzLCBkYXRhLCBfKTtcbiAgICB9O1xuXG4gICAgLy8gUHJvdmlkZSB0aGUgY29tcGlsZWQgc291cmNlIGFzIGEgY29udmVuaWVuY2UgZm9yIHByZWNvbXBpbGF0aW9uLlxuICAgIHZhciBhcmd1bWVudCA9IHNldHRpbmdzLnZhcmlhYmxlIHx8ICdvYmonO1xuICAgIHRlbXBsYXRlLnNvdXJjZSA9ICdmdW5jdGlvbignICsgYXJndW1lbnQgKyAnKXtcXG4nICsgc291cmNlICsgJ30nO1xuXG4gICAgcmV0dXJuIHRlbXBsYXRlO1xuICB9O1xuXG4gIC8vIEFkZCBhIFwiY2hhaW5cIiBmdW5jdGlvbi4gU3RhcnQgY2hhaW5pbmcgYSB3cmFwcGVkIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLmNoYWluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGluc3RhbmNlID0gXyhvYmopO1xuICAgIGluc3RhbmNlLl9jaGFpbiA9IHRydWU7XG4gICAgcmV0dXJuIGluc3RhbmNlO1xuICB9O1xuXG4gIC8vIE9PUFxuICAvLyAtLS0tLS0tLS0tLS0tLS1cbiAgLy8gSWYgVW5kZXJzY29yZSBpcyBjYWxsZWQgYXMgYSBmdW5jdGlvbiwgaXQgcmV0dXJucyBhIHdyYXBwZWQgb2JqZWN0IHRoYXRcbiAgLy8gY2FuIGJlIHVzZWQgT08tc3R5bGUuIFRoaXMgd3JhcHBlciBob2xkcyBhbHRlcmVkIHZlcnNpb25zIG9mIGFsbCB0aGVcbiAgLy8gdW5kZXJzY29yZSBmdW5jdGlvbnMuIFdyYXBwZWQgb2JqZWN0cyBtYXkgYmUgY2hhaW5lZC5cblxuICAvLyBIZWxwZXIgZnVuY3Rpb24gdG8gY29udGludWUgY2hhaW5pbmcgaW50ZXJtZWRpYXRlIHJlc3VsdHMuXG4gIHZhciByZXN1bHQgPSBmdW5jdGlvbihpbnN0YW5jZSwgb2JqKSB7XG4gICAgcmV0dXJuIGluc3RhbmNlLl9jaGFpbiA/IF8ob2JqKS5jaGFpbigpIDogb2JqO1xuICB9O1xuXG4gIC8vIEFkZCB5b3VyIG93biBjdXN0b20gZnVuY3Rpb25zIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5taXhpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIF8uZWFjaChfLmZ1bmN0aW9ucyhvYmopLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgICB2YXIgZnVuYyA9IF9bbmFtZV0gPSBvYmpbbmFtZV07XG4gICAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgYXJncyA9IFt0aGlzLl93cmFwcGVkXTtcbiAgICAgICAgcHVzaC5hcHBseShhcmdzLCBhcmd1bWVudHMpO1xuICAgICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIGZ1bmMuYXBwbHkoXywgYXJncykpO1xuICAgICAgfTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBBZGQgYWxsIG9mIHRoZSBVbmRlcnNjb3JlIGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlciBvYmplY3QuXG4gIF8ubWl4aW4oXyk7XG5cbiAgLy8gQWRkIGFsbCBtdXRhdG9yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsncG9wJywgJ3B1c2gnLCAncmV2ZXJzZScsICdzaGlmdCcsICdzb3J0JywgJ3NwbGljZScsICd1bnNoaWZ0J10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG9iaiA9IHRoaXMuX3dyYXBwZWQ7XG4gICAgICBtZXRob2QuYXBwbHkob2JqLCBhcmd1bWVudHMpO1xuICAgICAgaWYgKChuYW1lID09PSAnc2hpZnQnIHx8IG5hbWUgPT09ICdzcGxpY2UnKSAmJiBvYmoubGVuZ3RoID09PSAwKSBkZWxldGUgb2JqWzBdO1xuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBvYmopO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEFkZCBhbGwgYWNjZXNzb3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydjb25jYXQnLCAnam9pbicsICdzbGljZSddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiByZXN1bHQodGhpcywgbWV0aG9kLmFwcGx5KHRoaXMuX3dyYXBwZWQsIGFyZ3VtZW50cykpO1xuICAgIH07XG4gIH0pO1xuXG4gIC8vIEV4dHJhY3RzIHRoZSByZXN1bHQgZnJvbSBhIHdyYXBwZWQgYW5kIGNoYWluZWQgb2JqZWN0LlxuICBfLnByb3RvdHlwZS52YWx1ZSA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIFByb3ZpZGUgdW53cmFwcGluZyBwcm94eSBmb3Igc29tZSBtZXRob2RzIHVzZWQgaW4gZW5naW5lIG9wZXJhdGlvbnNcbiAgLy8gc3VjaCBhcyBhcml0aG1ldGljIGFuZCBKU09OIHN0cmluZ2lmaWNhdGlvbi5cbiAgXy5wcm90b3R5cGUudmFsdWVPZiA9IF8ucHJvdG90eXBlLnRvSlNPTiA9IF8ucHJvdG90eXBlLnZhbHVlO1xuXG4gIF8ucHJvdG90eXBlLnRvU3RyaW5nID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuICcnICsgdGhpcy5fd3JhcHBlZDtcbiAgfTtcblxuICAvLyBBTUQgcmVnaXN0cmF0aW9uIGhhcHBlbnMgYXQgdGhlIGVuZCBmb3IgY29tcGF0aWJpbGl0eSB3aXRoIEFNRCBsb2FkZXJzXG4gIC8vIHRoYXQgbWF5IG5vdCBlbmZvcmNlIG5leHQtdHVybiBzZW1hbnRpY3Mgb24gbW9kdWxlcy4gRXZlbiB0aG91Z2ggZ2VuZXJhbFxuICAvLyBwcmFjdGljZSBmb3IgQU1EIHJlZ2lzdHJhdGlvbiBpcyB0byBiZSBhbm9ueW1vdXMsIHVuZGVyc2NvcmUgcmVnaXN0ZXJzXG4gIC8vIGFzIGEgbmFtZWQgbW9kdWxlIGJlY2F1c2UsIGxpa2UgalF1ZXJ5LCBpdCBpcyBhIGJhc2UgbGlicmFyeSB0aGF0IGlzXG4gIC8vIHBvcHVsYXIgZW5vdWdoIHRvIGJlIGJ1bmRsZWQgaW4gYSB0aGlyZCBwYXJ0eSBsaWIsIGJ1dCBub3QgYmUgcGFydCBvZlxuICAvLyBhbiBBTUQgbG9hZCByZXF1ZXN0LiBUaG9zZSBjYXNlcyBjb3VsZCBnZW5lcmF0ZSBhbiBlcnJvciB3aGVuIGFuXG4gIC8vIGFub255bW91cyBkZWZpbmUoKSBpcyBjYWxsZWQgb3V0c2lkZSBvZiBhIGxvYWRlciByZXF1ZXN0LlxuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKCd1bmRlcnNjb3JlJywgW10sIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIF87XG4gICAgfSk7XG4gIH1cbn0uY2FsbCh0aGlzKSk7XG4iLCJ2YXIgbWMgPSBtb2R1bGUuZXhwb3J0c1xubWMuRGF0YXRhYmxlID0gKGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgaWRzID0gMDtcblxuICAgIHZhciBkdCA9IHtcbiAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKGNvbHMsIGNvbmZpZykge1xuICAgICAgICAgICAgdGhpcy5jb2xzID0gY29scztcbiAgICAgICAgICAgIHRoaXMuY29uZmlnID0gY29uZmlnID0gY29uZmlnIHx8IHt9O1xuXG4gICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWxlY3Rpb24gPSBbXTtcblxuICAgICAgICAgICAgaWYgKGNvbmZpZy51cmwpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgICAgICAgICB1cmw6IGNvbmZpZy51cmwsXG4gICAgICAgICAgICAgICAgICAgIGhlYWRlcjogY29uZmlnLmhlYWRlciwgXG4gICAgICAgICAgICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBjb25maWcuYXV0aG9yaXphdGlvbik7XG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIG1ldGhvZDogJ0dFVCdcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKGNvbmZpZy5kYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gKHR5cGVvZiBjb25maWcuZGF0YSA9PSAnZnVuY3Rpb24nID8gY29uZmlnLmRhdGEgOiBtLnByb3AoY29uZmlnLmRhdGEpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zb3J0ID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgICAgIHZhciBrZXkgPSB0YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtY29sa2V5JyksXG4gICAgICAgICAgICAgICAgICAgIGNvbCA9IHRoaXMuYWN0aXZlQ29sc1trZXldO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0aGlzLmxhc3RTb3J0ZWQgJiYgdGhpcy5sYXN0U29ydGVkICE9IGtleSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmFjdGl2ZUNvbHNbdGhpcy5sYXN0U29ydGVkXS5fc29ydGVkID0gJ25vbmUnO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB2YXIgcmV2ZXJzZSA9IChjb2wuX3NvcnRlZCA9PSAnYXNjJyA/IC0xIDogMSk7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhKHRoaXMuZGF0YSgpLnNvcnQoZnVuY3Rpb24gKGEsIGIpIHtcbiAgICAgICAgICAgICAgICAgICAgYSA9IGFba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgYiA9IGJba2V5XTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIChhID09IGIgPyAwIDogKGEgPCBiID8gLTEgOiAxKSAqIHJldmVyc2UpO1xuICAgICAgICAgICAgICAgIH0pKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBjb2wuX3NvcnRlZCA9IChyZXZlcnNlID4gMCA/ICdhc2MnIDogJ2Rlc2MnKTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RTb3J0ZWQgPSBrZXk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgbS5yZW5kZXIodGhpcy5fdGFibGVFbCwgZHQuY29udGVudHNWaWV3KHRoaXMpKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMub25DZWxsQ2xpY2sgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgd2hpbGUgKHRhcmdldC5ub2RlTmFtZSAhPSAnVEQnICYmIHRhcmdldC5ub2RlTmFtZSAhPSAnVEFCTEUnKSB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdUQUJMRScpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHZhciBjb2xJbmRleCA9IHRhcmdldC5jZWxsSW5kZXgsXG4gICAgICAgICAgICAgICAgICAgIGNvbCA9IHRoaXMuZGF0YVJvd1tjb2xJbmRleF0sXG4gICAgICAgICAgICAgICAgICAgIHJlY29yZElkID0gdGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLXJlY29yZC1pZCcpLFxuICAgICAgICAgICAgICAgICAgICBpZEZpZWxkID0gY29uZmlnLnJlY29yZElkIHx8ICdpZCcsXG4gICAgICAgICAgICAgICAgICAgIHJvdztcblxuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSgpLnNvbWUoZnVuY3Rpb24gKHIpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJbaWRGaWVsZF0gPT0gcmVjb3JkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdyA9IHI7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgbS5zdGFydENvbXB1dGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgdmFyIHJldCA9IHRoaXMuY29uZmlnLm9uQ2VsbENsaWNrLmNhbGwodGhpcywgcm93W2NvbC5maWVsZCB8fCBjb2wua2V5XSwgcm93LCBjb2wpO1xuICAgICAgICAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gcmV0O1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5vblJvd1NlbGVjdCA9IGZ1bmN0aW9uIChlLCB0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICB2YXIgcnMgPSB0aGlzLmNvbmZpZy5yb3dTZWxlY3QsXG4gICAgICAgICAgICAgICAgICAgIG11bHRpID0gcnMubXVsdGlwbGUsXG4gICAgICAgICAgICAgICAgICAgIGNhbGxiYWNrID0gcnMuY2FsbGJhY2ssXG4gICAgICAgICAgICAgICAgICAgIHNlbCA9IHRoaXMuY3VycmVudFNlbGVjdGlvbiB8fCBbXSxcbiAgICAgICAgICAgICAgICAgICAgbGFzdFNlbCA9IHRoaXMubGFzdFNlbGVjdGlvbixcbiAgICAgICAgICAgICAgICAgICAgaW5SYW5nZSA9IGZhbHNlLFxuICAgICAgICAgICAgICAgICAgICBpZEZpZWxkID0gY29uZmlnLnJlY29yZElkIHx8ICdpZCc7XG5cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNhbGxiYWNrICE9ICdmdW5jdGlvbicpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHdoaWxlICh0YXJnZXQubm9kZU5hbWUgIT0gJ1RSJyAmJiB0YXJnZXQubm9kZU5hbWUgIT0gJ1RBQkxFJykgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG5cbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdUQUJMRScpIHJldHVybjtcblxuICAgICAgICAgICAgICAgIHZhciByZWNvcmRJZCA9IHRhcmdldC5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVjb3JkLWlkJyk7XG4gICAgICAgICAgICAgICAgaWYgKHBhcnNlSW50KHJlY29yZElkLCAxMCkgPT0gcmVjb3JkSWQpIHJlY29yZElkID0gcGFyc2VJbnQocmVjb3JkSWQsIDEwKTtcblxuICAgICAgICAgICAgICAgIG0uc3RhcnRDb21wdXRhdGlvbigpO1xuXG4gICAgICAgICAgICAgICAgaWYgKG11bHRpICYmIGUuY3RybEtleSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgaSA9IHNlbC5pbmRleE9mKHJlY29yZElkKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGkgPT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5wdXNoKHJlY29yZElkKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNlbC5zcGxpY2UoaSwgMSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKG11bHRpICYmIGUuc2hpZnRLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgY2xlYXJTZWxlY3Rpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5kYXRhKCkuZm9yRWFjaChmdW5jdGlvbiAocm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaWQgPSByb3dbaWRGaWVsZF07XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoaW5SYW5nZSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWwuaW5kZXhPZihpZCkgPT0gLTEpIHNlbC5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQgPT0gbGFzdFNlbCB8fCBpZCA9PSByZWNvcmRJZCkgaW5SYW5nZSA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaWQgPT0gbGFzdFNlbCB8fCBpZCA9PSByZWNvcmRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsLmluZGV4T2YoaWQpID09IC0xKSBzZWwucHVzaChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGluUmFuZ2UgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgc2VsID0gKHNlbC5sZW5ndGggPT0gMSAmJiBzZWxbMF0gPT0gcmVjb3JkSWQgPyBbXSA6IFtyZWNvcmRJZF0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB0aGlzLmxhc3RTZWxlY3Rpb24gPSByZWNvcmRJZDtcbiAgICAgICAgICAgICAgICB0aGlzLmN1cnJlbnRTZWxlY3Rpb24gPSBzZWw7XG4gICAgICAgICAgICAgICAgY2FsbGJhY2soc2VsKTtcbiAgICAgICAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLm9uY2xpY2sgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIHZhciB0YXJnZXQgPSBlLnRhcmdldDtcbiAgICAgICAgICAgICAgICBpZiAodGFyZ2V0Lm5vZGVOYW1lID09ICdJJyAmJiAvXFxiZmFcXC1zb3J0Ly50ZXN0KHRhcmdldC5jbGFzc05hbWUpKSByZXR1cm4gdGhpcy5zb3J0KHRhcmdldCk7XG4gICAgICAgICAgICAgICAgaWYgKHRoaXMuY29uZmlnLnJvd1NlbGVjdCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLm9uUm93U2VsZWN0KGUsIHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgdGhpcy5jb25maWcub25DZWxsQ2xpY2sgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5vbkNlbGxDbGljayh0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpO1xuXG4gICAgICAgICAgICB0aGlzLnNldFdpZHRoID0gZnVuY3Rpb24gKGF0dHJzLCB3aWR0aCkge1xuICAgICAgICAgICAgICAgIGlmICghd2lkdGgpIHJldHVybjtcbiAgICAgICAgICAgICAgICBpZiAoL15cXGQrJC8udGVzdCh3aWR0aCkpIHdpZHRoICs9ICdweCc7XG4gICAgICAgICAgICAgICAgaWYgKCFhdHRycy5zdHlsZSkgYXR0cnMuc3R5bGUgPSAnJztcbiAgICAgICAgICAgICAgICBpZiAod2lkdGgpIGF0dHJzLnN0eWxlICs9ICd3aWR0aDonICsgd2lkdGggKyAnOyc7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9LFxuICAgICAgICB2aWV3OiBmdW5jdGlvbiAoY3RybCwgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIGNvbHMgPSBjdHJsLmNvbHM7XG4gICAgICAgICAgICBjdHJsLnZpZXdPcHRpb25zID0gb3B0aW9ucztcblxuICAgICAgICAgICAgaWYgKCFjdHJsLmRhdGEoKSkge1xuICAgICAgICAgICAgICAgIHJldHVybiBtKCdkaXYnLCAnU29ycnksIG5vIGRhdGEgdG8gZGlzcGxheScpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgb3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgICAgICAgICBvcHRpb25zLmNsYXNzTmFtZXMgPSBvcHRpb25zLmNsYXNzTmFtZXMgfHwge307XG5cbiAgICAgICAgICAgIHZhciBhdHRycyA9IHtcbiAgICAgICAgICAgICAgICBjbGFzczogb3B0aW9ucy5jbGFzc05hbWVzLnRhYmxlIHx8ICd0YWJsZSB0YWJsZS1zdHJpcGVkIHRhYmxlLWJvcmRlcmVkIHRhYmxlLWhvdmVyJyxcbiAgICAgICAgICAgICAgICBjb25maWc6IGZ1bmN0aW9uIChlbCwgaXNPbGQpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGlzT2xkKSByZXR1cm47XG4gICAgICAgICAgICAgICAgICAgIGVsLmFkZEV2ZW50TGlzdGVuZXIoJ2NsaWNrJywgY3RybC5vbmNsaWNrKTtcbiAgICAgICAgICAgICAgICAgICAgY3RybC5fdGFibGVFbCA9IGVsO1xuICAgICAgICAgICAgICAgICAgICBtLm1vZHVsZShlbCwge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBjdHJsO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZpZXc6IGR0LmNvbnRlbnRzVmlld1xuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICBjdHJsLnNldFdpZHRoKGF0dHJzLCBvcHRpb25zLndpZHRoKTtcblxuICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgJ3RhYmxlJyxcbiAgICAgICAgICAgICAgICBhdHRyc1xuICAgICAgICAgICAgKTtcbiAgICAgICAgfSxcbiAgICAgICAgY29udGVudHNWaWV3OiBmdW5jdGlvbiAoY3RybCkge1xuICAgICAgICAgICAgdmFyIGNvbHMgPSBjdHJsLmNvbHMsXG4gICAgICAgICAgICAgICAgb3B0aW9ucyA9IGN0cmwudmlld09wdGlvbnM7XG5cbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgZHQuaGVhZFZpZXcoY3RybCwgY29scywgb3B0aW9ucyksXG4gICAgICAgICAgICAgICAgZHQuYm9keVZpZXcoY3RybCwgY29scywgb3B0aW9ucywgY3RybC5kYXRhKCkpLFxuICAgICAgICAgICAgICAgIGR0LmNhcHRpb25WaWV3KGN0cmwsIG9wdGlvbnMpXG4gICAgICAgICAgICBdO1xuICAgICAgICB9LFxuICAgICAgICBoZWFkVmlldzogZnVuY3Rpb24gKGN0cmwsIGNvbHMsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBtYXRyaXggPSBbXSxcbiAgICAgICAgICAgICAgICByb3dOdW0gPSAwLFxuICAgICAgICAgICAgICAgIGRhdGFSb3cgPSBbXTtcbiAgICAgICAgICAgIHZhciBjYWxjRGVwdGggPSBmdW5jdGlvbiAobWF4RGVwdGgsIGNvbCkge1xuICAgICAgICAgICAgICAgIHZhciBkZXB0aCA9IDA7XG4gICAgICAgICAgICAgICAgaWYgKCFtYXRyaXhbcm93TnVtXSkge1xuICAgICAgICAgICAgICAgICAgICBtYXRyaXhbcm93TnVtXSA9IFtdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBtYXRyaXhbcm93TnVtXS5wdXNoKGNvbCk7XG4gICAgICAgICAgICAgICAgaWYgKGNvbC5jaGlsZHJlbikge1xuICAgICAgICAgICAgICAgICAgICBjb2wuX2NvbHNwYW4gPSBjb2wuY2hpbGRyZW4ubGVuZ3RoO1xuICAgICAgICAgICAgICAgICAgICByb3dOdW0rKztcbiAgICAgICAgICAgICAgICAgICAgZGVwdGggPSBjb2wuY2hpbGRyZW4ucmVkdWNlKGNhbGNEZXB0aCwgMCkgKyAxO1xuICAgICAgICAgICAgICAgICAgICByb3dOdW0tLTtcbiAgICAgICAgICAgICAgICAgICAgZGVwdGggPSBNYXRoLm1heChtYXhEZXB0aCwgZGVwdGgpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGFSb3cucHVzaChjb2wpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBjb2wuX2RlcHRoID0gZGVwdGg7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGRlcHRoO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIG1heERlcHRoID0gY29scy5yZWR1Y2UoY2FsY0RlcHRoLCAwKTtcbiAgICAgICAgICAgIGN0cmwuZGF0YVJvdyA9IGRhdGFSb3c7XG4gICAgICAgICAgICB2YXIgYWN0aXZlQ29scyA9IHt9O1xuICAgICAgICAgICAgZGF0YVJvdy5mb3JFYWNoKGZ1bmN0aW9uIChjb2wpIHtcbiAgICAgICAgICAgICAgICBhY3RpdmVDb2xzW2NvbC5rZXldID0gY29sO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICBjdHJsLmFjdGl2ZUNvbHMgPSBhY3RpdmVDb2xzO1xuXG4gICAgICAgICAgICB2YXIgYnVpbGRIZWFkZXJSb3cgPSBmdW5jdGlvbiAocm93LCByb3dOdW0pIHtcbiAgICAgICAgICAgICAgICB2YXIgYnVpbGRIZWFkZXJDZWxsID0gZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgYXR0cnMgPSB7fTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbC5fY29sc3BhbiAmJiBjb2wuX2NvbHNwYW4gPiAxKSBhdHRycy5jb2xzcGFuID0gY29sLl9jb2xzcGFuO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sLmNsYXNzKSBhdHRycy5jbGFzcyA9IGNvbC5jbGFzcztcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFjb2wuX2RlcHRoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRyc1snZGF0YS1jb2xLZXknXSA9IGNvbC5rZXk7XG4gICAgICAgICAgICAgICAgICAgICAgICBjdHJsLnNldFdpZHRoKGF0dHJzLCBjb2wud2lkdGgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvd051bSA8IG1heERlcHRoKSBhdHRycy5yb3dzcGFuID0gbWF4RGVwdGggLSByb3dOdW0gKyAxO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNvbC5fc29ydGVkICYmIGNvbC5fc29ydGVkICE9ICdub25lJykgYXR0cnMuY2xhc3MgPSBvcHRpb25zLmNsYXNzTmFtZXMuc29ydGVkIHx8ICdzb3J0ZWQnO1xuICAgICAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgICAgICAgICAndGgnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnMsIFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAoIWNvbC5fZGVwdGggJiYgY29sLnNvcnRhYmxlID8gbShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ2kuZmEnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczoge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGFzYzogJ2ZhLXNvcnQtYXNjJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkZXNjOiAnZmEtc29ydC1kZXNjJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBub25lOiAnZmEtc29ydCdcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1bY29sLl9zb3J0ZWQgfHwgJ25vbmUnXVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKSA6ICcnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBtLnRydXN0KCcgJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sLmxhYmVsIHx8IGNvbC5rZXlcbiAgICAgICAgICAgICAgICAgICAgICAgIF1cbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgICAgICd0cicsXG4gICAgICAgICAgICAgICAgICAgIHJvdy5tYXAoYnVpbGRIZWFkZXJDZWxsKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3RoZWFkJywgbWF0cml4Lm1hcChidWlsZEhlYWRlclJvdykpO1xuICAgICAgICB9LFxuXG4gICAgICAgIGJvZHlWaWV3OiBmdW5jdGlvbiAoY3RybCwgY29scywgb3B0aW9ucywgZGF0YSkge1xuICAgICAgICAgICAgdmFyIGlkRmllbGQgPSBjdHJsLmNvbmZpZy5yZWNvcmRJZCB8fCAnaWQnO1xuICAgICAgICAgICAgdmFyIGJ1aWxkRGF0YVJvdyA9IGZ1bmN0aW9uIChyb3csIHJvd0luZGV4KSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ1aWxkRGF0YUNlbGwgPSBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB2YWx1ZSA9IHJvd1tjb2wuZmllbGQgfHwgY29sLmtleV0sXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRycyA9IHt9O1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY29sLmZvcm1hdHRlciA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZSA9IGNvbC5mb3JtYXR0ZXIuY2FsbChjdHJsLCB2YWx1ZSwgcm93LCBjb2wsIGF0dHJzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJzLmNsYXNzKSBhdHRycy5jbGFzcyA9ICcnO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sLl9zb3J0ZWQgJiYgY29sLl9zb3J0ZWQgIT0gJ25vbmUnKSBhdHRycy5jbGFzcyArPSAnICcgKyAob3B0aW9ucy5jbGFzc05hbWVzLnNvcnRlZCB8fCAnc29ydGVkJyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wuY2xhc3MpIGF0dHJzLmNsYXNzICs9ICcgJyArIGNvbC5jbGFzcztcblxuICAgICAgICAgICAgICAgICAgICBpZiAoIWF0dHJzLmNsYXNzKSBkZWxldGUgYXR0cnMuY2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RkJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzLFxuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgICAgIGlmIChyb3dbaWRGaWVsZF0gPT09IHVuZGVmaW5lZCkgcm93W2lkRmllbGRdID0gaWRzKys7XG4gICAgICAgICAgICAgICAgdmFyIHJlY29yZElkID0gcm93W2lkRmllbGRdO1xuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgICAgICd0cicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICdkYXRhLXJlY29yZC1pZCc6IHJlY29yZElkLFxuICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IChyb3dJbmRleCAmIDEgPyBvcHRpb25zLmNsYXNzTmFtZXMub2RkIHx8ICdvZGQnIDogb3B0aW9ucy5jbGFzc05hbWVzLmV2ZW4gfHwgJ2V2ZW4nKSArXG4gICAgICAgICAgICAgICAgICAgICAgICAoY3RybC5jdXJyZW50U2VsZWN0aW9uLmluZGV4T2YocmVjb3JkSWQpICE9IC0xID8gb3B0aW9ucy5jbGFzc05hbWVzLnNlbGVjdGVkIHx8ICcgc2VsZWN0ZWQnIDogJycpXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIGN0cmwuZGF0YVJvdy5tYXAoYnVpbGREYXRhQ2VsbClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBtKCd0Ym9keScsIGRhdGEubWFwKGJ1aWxkRGF0YVJvdykpO1xuICAgICAgICB9LFxuICAgICAgICBjYXB0aW9uVmlldzogZnVuY3Rpb24gKGN0cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIGlmIChvcHRpb25zLmNhcHRpb24pIHJldHVybiBtKCdjYXB0aW9uJywgb3B0aW9ucy5jYXB0aW9uKTtcbiAgICAgICAgfSxcbiAgICB9O1xuXG4gICAgLyogZ2xvYmFsIGRvY3VtZW50OmZhbHNlLCB3aW5kb3c6ZmFsc2UgKi9cbiAgICBmdW5jdGlvbiBjbGVhclNlbGVjdGlvbigpIHtcbiAgICAgICAgaWYgKGRvY3VtZW50LnNlbGVjdGlvbiAmJiBkb2N1bWVudC5zZWxlY3Rpb24uZW1wdHkpIHtcbiAgICAgICAgICAgIGRvY3VtZW50LnNlbGVjdGlvbi5lbXB0eSgpO1xuICAgICAgICB9IGVsc2UgaWYgKHdpbmRvdy5nZXRTZWxlY3Rpb24pIHtcbiAgICAgICAgICAgIHdpbmRvdy5nZXRTZWxlY3Rpb24oKS5yZW1vdmVBbGxSYW5nZXMoKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiBkdDtcbn0pKCk7IiwidmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgTmF2YmFyID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIHZhciBsaW5rcyA9IChBdXRoLnRva2VuKCkgP1xuICAgIFtcbiAgICAgIHsgbGFiZWw6ICdUaWNrZXRzJywgaHJlZjogJy90aWNrZXRzJyB9LFxuICAgICAgeyBsYWJlbDogJ05ldyBUaWNrZXQnLCBocmVmOiAnL3RpY2tldEVkaXQnIH0sXG4gICAgICAoQXV0aC51c2VyX3R5cGUoKSA9PSAnQWRtaW4nPyB7IGxhYmVsOiAnVXNlcnMnLCBocmVmOiAnL3VzZXJzJyB9Ont9KSxcbiAgICAgIHsgbGFiZWw6J0xvZ291dCcsIGhyZWY6Jy9sb2dvdXQnIH1cbiAgICBdOltcbiAgICAgIHsgbGFiZWw6ICdMb2dpbicsIGhyZWY6ICcvbG9naW4nIH0sXG4gICAgICB7IGxhYmVsOiAnUmVnaXN0ZXInLCBocmVmOiAnL3JlZ2lzdGVyJyB9XG4gICAgXSlcbiAgICAubWFwKGZ1bmN0aW9uKGwpe1xuICAgICAgcmV0dXJuIG0oXCJsaVwiICsgKG0ucm91dGUoKSA9PT0gbC5ocmVmID8gJy5hY3RpdmUnOiAnJyksIG0oXCJhW2hyZWY9J1wiICsgbC5ocmVmICsgXCInXVwiLCBsLm5vcm1hbD97fTp7Y29uZmlnOiBtLnJvdXRlfSwgbC5sYWJlbCkpO1xuICAgIH0pO1xuXG4gICAgY3RybC5saW5rcyA9IG0ucHJvcChsaW5rcyk7XG5cbiAgICBjdHJsLmljb25EaXJlY3Rpb24gPSBtLnByb3AoJ2Rvd24nKTtcblxuICAgIGN0cmwudG9nZ2xlID0gZnVuY3Rpb24oKXtcbiAgICAgIGN0cmwuaWNvbkRpcmVjdGlvbiggY3RybC5pY29uRGlyZWN0aW9uKCk9PSd1cCcgPyAnZG93bic6J3VwJyApO1xuICAgIH07XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCkge1xuICAgIHJldHVybiBtKFwibmF2Lm5hdmJhci5uYXZiYXItaW52ZXJzZS5uYXZiYXItZml4ZWQtdG9wXCIsIFtcbiAgICAgIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgICAgbShcIi5uYXZiYXItaGVhZGVyXCIsXG4gICAgICAgICAgbSgnYnV0dG9uLm5hdmJhci10b2dnbGUnLCB7b25jbGljazogY3RybC50b2dnbGV9LCBtKCcuZ2x5cGhpY29uLmdseXBoaWNvbi1jaGV2cm9uLScgKyBjdHJsLmljb25EaXJlY3Rpb24oKSkpLFxuICAgICAgICAgIG0oXCJhLm5hdmJhci1icmFuZFtocmVmPScvJ11cIiwge2NvbmZpZzogbS5yb3V0ZX0sIFwiQ3Jvc3NvdmVyIFRpY2tldCBTeXN0ZW1cIilcbiAgICAgICAgKSxcbiAgICAgICAgbShcIi5uYXZiYXItY29sbGFwc2UuXCIgKyBjdHJsLmljb25EaXJlY3Rpb24oKSwgXG4gICAgICAgICAgbShcInVsLm5hdi5uYXZiYXItbmF2Lm5hdmJhci1yaWdodFwiLCBjdHJsLmxpbmtzKCkpXG4gICAgICAgIClcbiAgICAgIF0pXG4gICAgXSk7XG4gIH1cbn07IiwiLy8gbWFpbi5qc1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgcmVxID0gZnVuY3Rpb24oYXJncykge1xuICByZXR1cm4gbS5yZXF1ZXN0KGFyZ3MpXG59XG5cbm0ucm91dGUoZG9jdW1lbnQuYm9keSwgXCIvXCIsIHtcbiAgXCIvXCI6IHJlcXVpcmUoJy4vcGFnZXMvVGlja2V0cy5qcycpLFxuICBcIi9sb2dpblwiOiByZXF1aXJlKCcuL3BhZ2VzL0xvZ2luLmpzJyksXG4gIFwiL2xvZ291dFwiOiByZXF1aXJlKCcuL3BhZ2VzL0xvZ291dC5qcycpLFxuICBcIi9yZWdpc3RlclwiOiByZXF1aXJlKCcuL3BhZ2VzL1JlZ2lzdGVyLmpzJyksXG4gIFwiL3RpY2tldEVkaXRcIjogcmVxdWlyZSgnLi9wYWdlcy9UaWNrZXRFZGl0LmpzJyksXG4gIFwiL3ZlcmlmeS86Y29kZVwiOiByZXF1aXJlKCcuL3BhZ2VzL1ZlcmlmeS5qcycpLFxuICBcIi90aWNrZXRcIjogcmVxdWlyZSgnLi9wYWdlcy9UaWNrZXRQYWdlLmpzJyksXG4gIFwiL3VzZXJFZGl0XCI6IHJlcXVpcmUoJy4vcGFnZXMvVXNlckVkaXQuanMnKSxcbiAgXCIvdGlja2V0c1wiOiByZXF1aXJlKCcuL3BhZ2VzL1RpY2tldHMuanMnKSxcbiAgXCIvcmVwb3J0c1wiOiByZXF1aXJlKCcuL3BhZ2VzL1JlcG9ydC5qcycpLFxuICBcIi91c2Vyc1wiOiByZXF1aXJlKCcuL3BhZ2VzL1VzZXJzLmpzJyksXG4gIFwiL3VzZXJzLzppZFwiOiByZXF1aXJlKCcuL3BhZ2VzL1VzZXJEZWxldGUuanMnKSxcbiAgXCIvdGFzdHlcIjogcmVxdWlyZSgnLi9wYWdlcy9UYXN0eS5qcycpXG59KTtcbiIsInZhciBBdXRoID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRva2VuOiBtLnByb3AobG9jYWxTdG9yYWdlLnRva2VuKSxcbiAgdXNlcl90eXBlOiBtLnByb3AobG9jYWxTdG9yYWdlLnVzZXJfdHlwZSksXG4gIFxuICAvLyB0cmFkZSBjcmVkZW50aWFscyBmb3IgYSB0b2tlblxuICBsb2dpbjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkKSB7XG4gICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogJy9hdXRoL2xvZ2luJyxcbiAgICAgIGRhdGE6IHtlbWFpbDplbWFpbCwgcGFzc3dvcmQ6cGFzc3dvcmR9LFxuICAgICAgdW53cmFwU3VjY2VzczogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS50b2tlbiA9IHJlcy5hdXRoX3Rva2VuO1xuICAgICAgICBsb2NhbFN0b3JhZ2UudXNlcl90eXBlID0gcmVzLnVzZXJfdHlwZTtcblxuICAgICAgICBBdXRoLnVzZXJfdHlwZShyZXMudXNlcl90eXBlKTtcblxuICAgICAgICByZXR1cm4gcmVzLmF1dGhfdG9rZW47XG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbih0aGlzLnRva2VuKTtcbiAgfSxcblxuICAvLyBmb3JnZXQgdG9rZW5cbiAgbG9nb3V0OiBmdW5jdGlvbigpe1xuICAgIHRoaXMudG9rZW4oZmFsc2UpO1xuICAgIGRlbGV0ZSBsb2NhbFN0b3JhZ2UudG9rZW47XG4gIH0sXG5cbiAgLy8gc2lnbnVwIG9uIHRoZSBzZXJ2ZXIgZm9yIG5ldyBsb2dpbiBjcmVkZW50aWFsc1xuICByZWdpc3RlcjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkLG5hbWUsdHlwZSkge1xuICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgZGF0YTogeyB1c2VyOiB7IGVtYWlsOiBlbWFpbCwgcGFzc3dvcmQ6IHBhc3N3b3JkLCB0eXBlOiB0eXBlLCBuYW1lOiBuYW1lfX1cbiAgICB9KTtcbiAgfSxcblxuICAvLyBlbnN1cmUgdmVyaWZ5IHRva2VuIGlzIGNvcnJlY3RcbiAgdmVyaWZ5OiBmdW5jdGlvbih0b2tlbikge1xuICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6ICcvYXV0aC92ZXJpZnknLFxuICAgICAgZGF0YTogeyB0b2tlbjogdG9rZW4gfVxuICAgIH0pO1xuICB9LFxuXG4gIC8vIGdldCBjdXJyZW50IHVzZXIgb2JqZWN0XG4gIHVzZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBBdXRoLnJlcSgnL3VzZXJzL21lJyk7XG4gIH0sXG5cbiAgLy8gbWFrZSBhbiBhdXRoZW50aWNhdGVkIHJlcXVlc3RcbiAgcmVxOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ3N0cmluZycpIHtcbiAgICAgIG9wdGlvbnMgPSB7IG1ldGhvZDogJ0dFVCcsIHVybDogb3B0aW9ucyB9O1xuICAgIH1cblxuICAgIHZhciBvbGRDb25maWcgPSBvcHRpb25zLmNvbmZpZyB8fCBmdW5jdGlvbigpIHt9O1xuXG4gICAgb3B0aW9ucy5jb25maWcgPSBmdW5jdGlvbih4aHIpIHtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQXV0aG9yaXphdGlvblwiLCAgQXV0aC50b2tlbigpKTtcbiAgICAgIG9sZENvbmZpZyh4aHIpO1xuICAgIH07XG5cbiAgICAvLyB0cnkgcmVxdWVzdCwgaWYgYXV0aCBlcnJvciwgcmVkaXJlY3RcbiAgICAvLyBUT0RPOiByZW1lbWJlciB3aGVyZSB0aGUgdXNlciB3YXMsIG9yaWdpbmFsbHlcbiAgICB2YXIgZGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG4gICAgbS5yZXF1ZXN0KG9wdGlvbnMpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIEF1dGgub3JpZ2luYWxSb3V0ZSA9IG0ucm91dGUoKTtcbiAgICAgICAgbS5yb3V0ZSgnL2xvZ2luJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxufTsiLCIvLyBUaWNrZXQgbW9kZWxcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBUaWNrZXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8vIFRpY2tldCA9IHsgaWQ6IGludGVnZXIsIHRpdGxlOiB0ZXh0LCBzdGF0dXM6IGludGVnZXIsIGFnZW50X2lkOiBpbnRlZ2VyLCBjdXN0b21lcl9pZDogaW50ZWdlclxuICAgIC8vICAgICAsIGRlcGFydG1lbnRfaWQ6IGludGVnZXIsIHByaW9yZXR5OiBpbnRlZ2VyLCBkb25lX2RhdGU6IGRhdGV0aW1lLCBjcmVhdGVkX2F0OiBkYXRldGltZSxcbiAgICAvLyAgICAgIHVwZGF0ZWRfYXQ6IGRhdGV0aW1lIH1cblxuICAgIHNlbmQ6IGZ1bmN0aW9uIChkYXRhLGlkKSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiBpZCA/ICdQVVQnIDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL3RpY2tldHMnKyhpZD8nLycraWQgOiAnJykgXG4gICAgICAgICAgICAsIGNvbmZpZzogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgQXV0aC50b2tlbigpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkYXRhOiB7IHRpY2tldDogZGF0YSB9XG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZG93bmxvYWQ6IGZ1bmN0aW9uICh1c2VyX2lkLCByZXBvcnRfZm9ybWF0KSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvZG93bmxvYWRfcmVwb3J0JywgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHt1c2VyX2lkOnVzZXJfaWQsIHJlcG9ydF9mb3JtYXQ6cmVwb3J0X2Zvcm1hdH0sXG4gICAgICAgIH0pO1xuICAgIH0sXG4gICAgZ2V0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgdXJsOiAnL3RpY2tldHMvJytpZCxcbiAgICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHhocikge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpY2tldDsiLCIvLyBVc2VyIG1vZGVsXG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG52YXIgVXNlciA9IG1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLy8gVGlja2V0ID0geyBpZDogaW50ZWdlciwgdGl0bGU6IHRleHQsIHN0YXR1czogaW50ZWdlciwgYWdlbnRfaWQ6IGludGVnZXIsIGN1c3RvbWVyX2lkOiBpbnRlZ2VyXG4gICAgLy8gICAgICwgZGVwYXJ0bWVudF9pZDogaW50ZWdlciwgcHJpb3JldHk6IGludGVnZXIsIGRvbmVfZGF0ZTogZGF0ZXRpbWUsIGNyZWF0ZWRfYXQ6IGRhdGV0aW1lLFxuICAgIC8vICAgICAgdXBkYXRlZF9hdDogZGF0ZXRpbWUgfVxuXG4gICAgYWxsOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgdXJsOiAnL3VzZXJzJyxcbiAgICAgICAgICBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgQXV0aC50b2tlbigpKTtcbiAgICB9LFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGdldDogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICAgIHVybDogJy91c2Vycy8nK2lkLFxuICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgQXV0aC50b2tlbigpKTtcbiAgICB9XG5cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHNlbmQ6IGZ1bmN0aW9uIChkYXRhLGlkKSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiBpZCA/ICdQVVQnIDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL3VzZXJzJysoaWQ/Jy8nK2lkIDogJycpIFxuICAgICAgICAgICAgLCBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogeyB1c2VyOiBkYXRhIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRlbGV0ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgIHVybDogJy91c2VycycrKGlkPycvJytpZCA6ICcnKSBcbiAgICAgICAgICAgICwgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHsgaWQ6IGlkIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlcjsiLCJ2YXIgTmF2YmFyID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9OYXZiYXIuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcblxudmFyIExvZ2luID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwubmF2YmFyID0gbmV3IE5hdmJhci5jb250cm9sbGVyKCk7XG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgICB0aGlzLmxvZ2luID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICBBdXRoLmxvZ2luKGUudGFyZ2V0LmVtYWlsLnZhbHVlLCBlLnRhcmdldC5wYXNzd29yZC52YWx1ZSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICBtLnJvdXRlKEF1dGgub3JpZ2luYWxSb3V0ZSB8fCAnLycsIG51bGwsIHRydWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgZXJyLm1lc3NhZ2UpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbihjdHJsKXtcbiAgICByZXR1cm4gW05hdmJhci52aWV3KGN0cmwubmF2YmFyKSwgbShcIi5jb250YWluZXJcIiwgW1xuICAgICAgbShcImZvcm0udGV4dC1jZW50ZXIucm93LmZvcm0tc2lnbmluXCIsIHtvbnN1Ym1pdDpjdHJsLmxvZ2luLmJpbmQoY3RybCl9LFxuICAgICAgICBtKCcuY29sLXNtLTYuY29sLXNtLW9mZnNldC0zJywgW1xuICAgICAgICAgIG0oXCJoMVwiLCBcIkxvZ2luXCIpLFxuICAgICAgICAgIGN0cmwuZXJyb3IoKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRFbWFpbCddXCIsIFwiRW1haWwgYWRkcmVzc1wiKSxcbiAgICAgICAgICAgIG0oXCJpbnB1dC5mb3JtLWNvbnRyb2xbbmFtZT0nZW1haWwnXVthdXRvZm9jdXNdW2lkPSdpbnB1dEVtYWlsJ11bcGxhY2Vob2xkZXI9J0VtYWlsIGFkZHJlc3MnXVtyZXF1aXJlZF1bdHlwZT0nZW1haWwnXVwiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRQYXNzd29yZCddXCIsIFwiUGFzc3dvcmRcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3Bhc3N3b3JkJ11bYXV0b2NvbXBsZXRlPSdvZmYnXVtpZD0naW5wdXRQYXNzd29yZCddW3BsYWNlaG9sZGVyPSdQYXNzd29yZCddW3JlcXVpcmVkXVt0eXBlPSdwYXNzd29yZCddXCIpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgIG0oXCJidXR0b24uYnRuLmJ0bi1sZy5idG4tcHJpbWFyeS5idG4tYmxvY2tbdHlwZT0nc3VibWl0J11cIiwgXCJTaWduIGluXCIpXG4gICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgKVxuICAgIF0pXTtcbiAgfVxufTsiLCJ2YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciBMb2dvdXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBBdXRoLmxvZ291dCgpO1xuICAgIG0ucm91dGUoJy9sb2dpbicpO1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgUmVnaXN0ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC5yZWdpc3RlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKGUudGFyZ2V0LnBhc3N3b3JkLnZhbHVlICE9PSBlLnRhcmdldC5wYXNzd29yZDIudmFsdWUpIHtcbiAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCAnUGFzc3dvcmRzIG11c3QgbWF0Y2guJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIEF1dGgucmVnaXN0ZXIoZS50YXJnZXQuZW1haWwudmFsdWUsIGUudGFyZ2V0LnBhc3N3b3JkLnZhbHVlLCBlLnRhcmdldC5uYW1lLnZhbHVlLCBlLnRhcmdldC50eXBlLnZhbHVlKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1zdWNjZXNzLmFuaW1hdGVkLmZhZGVJblVwXCIsICdDb29sLiBOb3cgeW91IGNhbiBsb2dpbiEnKSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG5cbiAgICAgICAgICBpZiAoZXJyICYmIGVyci5jb2RlICYmIGVyci5jb2RlID09PSAxMTAwMCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9ICdUaGVyZSBpcyBhbHJlYWR5IGEgdXNlciB3aXRoIHRoYXQgZW1haWwgYWRkcmVzcy4nO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHJldHVybiBbTmF2YmFyLnZpZXcoY3RybC5uYXZiYXIpLCBtKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICBtKFwiZm9ybS50ZXh0LWNlbnRlci5yb3cuZm9ybS1zaWduaW5cIiwge29uc3VibWl0OmN0cmwucmVnaXN0ZXIuYmluZChjdHJsKX0sXG4gICAgICAgIG0oJy5jb2wtc20tNi5jb2wtc20tb2Zmc2V0LTMnLCBbXG4gICAgICAgICAgbShcImgxXCIsIFwiUmVnaXN0ZXJcIiksXG4gICAgICAgICAgY3RybC5lcnJvcigpLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dEVtYWlsJ11cIiwgXCJFbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSdlbWFpbCddW2F1dG9mb2N1c11baWQ9J2lucHV0RW1haWwnXVtwbGFjZWhvbGRlcj0nRW1haWwgYWRkcmVzcyddW3JlcXVpcmVkXVt0eXBlPSdlbWFpbCddXCIpLFxuICAgICAgICAgIF0pLG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dG5hbWUnXVwiLCBcIk5hbWVcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J25hbWUnXVthdXRvZm9jdXNdW2lkPSdpbnB1dG5hbWUnXVtwbGFjZWhvbGRlcj0nTmFtZSddW3JlcXVpcmVkXVt0eXBlPSduYW1lJ11cIiksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0UGFzc3dvcmQnXVwiLCBcIlBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSdwYXNzd29yZCddW2F1dG9jb21wbGV0ZT0nb2ZmJ11baWQ9J2lucHV0UGFzc3dvcmQnXVtwbGFjZWhvbGRlcj0nUGFzc3dvcmQnXVtyZXF1aXJlZF1bdHlwZT0ncGFzc3dvcmQnXVwiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRQYXNzd29yZDInXVwiLCBcIlBhc3N3b3JkIChhZ2FpbilcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3Bhc3N3b3JkMiddW2F1dG9jb21wbGV0ZT0nb2ZmJ11baWQ9J2lucHV0UGFzc3dvcmQyJ11bcGxhY2Vob2xkZXI9J1Bhc3N3b3JkIChhZ2FpbiknXVtyZXF1aXJlZF1bdHlwZT0ncGFzc3dvcmQnXVwiKSxcbiAgICAgICAgICBdKSxtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRUeXBlJ11cIiwgXCJUeXBlXCIpLFxuICAgICAgICAgICAgbShcInNlbGVjdC5mb3JtLWNvbnRyb2xbbmFtZT0ndHlwZSddW3JlcXVpcmVkXVwiLFttKFwib3B0aW9uW3ZhbHVlPSdBZ2VudCddXCIsXCJBZ2VudFwiKSxtKFwib3B0aW9uW3ZhbHVlPSdDdXN0b21lciddXCIsJ0N1c3RvbWVyJyksbShcIm9wdGlvblt2YWx1ZT0nQWRtaW4nXVwiLCdBZG1pbicpXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLWxnLmJ0bi1wcmltYXJ5LmJ0bi1ibG9ja1t0eXBlPSdzdWJtaXQnXVwiLCBcIlNpZ24gaW5cIilcbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgXSldO1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIG1jID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9EYXRhVGFibGUuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBUaWNrZXQgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGlja2V0LmpzJyk7XG52YXIgVGlja2V0UGFnZSA9IHJlcXVpcmUoJy4uL3BhZ2VzL1RpY2tldFBhZ2UuanMnKTtcblxuICB2YXIgUmVwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwubmF2YmFyID0gbmV3IE5hdmJhci5jb250cm9sbGVyKCk7XG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgICB0aGlzLnJlcG9ydCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgVGlja2V0LmRvd25sb2FkKGUudGFyZ2V0LnVzZXJfaWQudmFsdWUsIGUudGFyZ2V0LnJlcG9ydF9mb3JtYXQudmFsdWUpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgbS5yb3V0ZShUaWNrZXQub3JpZ2luYWxSb3V0ZSB8fCAnLycsIG51bGwsIHRydWUpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgZXJyLm1lc3NhZ2UpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHRoaXMuZGF0YXRhYmxlID0gbmV3IG1jLkRhdGF0YWJsZS5jb250cm9sbGVyKFxuICAgICAgLy8gQ29sdW1ucyBkZWZpbml0aW9uOlxuICAgICAgW1xuICAgICAgICB7IGtleTogXCJ0aXRsZVwiLGxhYmVsOiBcIlRpdGxlXCIsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHsga2V5OiBcImFnZW50X2lkXCIsbGFiZWw6IFwiQWdlbnRcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBrZXk6IFwiY3VzdG9tZXJfaWRcIixsYWJlbDogXCJDdXN0b21lclwiLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGtleTogXCJwcmlvcmV0eVwiLGxhYmVsOiBcIlByaW9yaXR5XCJ9LFxuICAgICAgICB7IGtleTogXCJzdGF0dXNcIixsYWJlbDogXCJTdGF0dXNcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIF0sXG4gICAgICAvLyBPdGhlciBjb25maWd1cmF0aW9uOlxuICAgICAge1xuICAgICAgICAvLyBBZGRyZXNzIG9mIHRoZSB3ZWJzZXJ2ZXIgc3VwcGx5aW5nIHRoZSBkYXRhXG4gICAgICAgIHVybDogJ3JlcG9ydD91c2VyX2lkPTInLFxuICAgICAgICBhdXRob3JpemF0aW9uOiBBdXRoLnRva2VuKCksXG4gICAgICAgIC8vIEhhbmRsZXIgb2YgY2xpY2sgZXZlbnQgb24gZGF0YSBjZWxsXG4gICAgICAgIC8vIEl0IHJlY2VpdmVzIHRoZSByZWxldmFudCBpbmZvcm1hdGlvbiBhbHJlYWR5IHJlc29sdmVkXG4gICAgICAgIG9uQ2VsbENsaWNrOiBmdW5jdGlvbiAoY29udGVudCwgcm93LCBjb2wpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjb250ZW50LCByb3csIGNvbCk7XG4gICAgICAgICAgbS5yb3V0ZShcIi90aWNrZXRcIix7aWQ6cm93LmlkfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gW05hdmJhciwgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgIG0oJ2gxJywgJ0dlbmVyYXRlIFJlcG9ydDogQ3Jvc3NvdmVyIFRpY2tldCBTeXN0ZW0nKSxcbiAgICAgIG0oJ2JyJyksXG4gICAgICBtYy5EYXRhdGFibGUudmlldyhjdHJsLmRhdGF0YWJsZSwge1xuICAgICAgICBjYXB0aW9uOiAnTXkgVGlja2V0cydcbiAgICAgIH0pLFxuICAgICAgbShcImZvcm0udGV4dC1jZW50ZXIucm93LmZvcm0tcmVwb3J0XCIsIHtvbnN1Ym1pdDpjdHJsLnJlcG9ydC5iaW5kKGN0cmwpfSxcbiAgICAgICAgbSgnLmNvbC1sZy02LmNvbC1tZC02LmNvbC1zbS02LmNvbC14cy0xMicsIFtcbiAgICAgICAgICBjdHJsLmVycm9yKCksXG4gICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSd1c2VyX2lkJ11bYXV0b2ZvY3VzXVtyZXF1aXJlZF1bdmFsdWU9JzInXVt0eXBlPSdoaWRkZW4nXVwiKSxcbiAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3JlcG9ydF9mb3JtYXQnXVthdXRvZm9jdXNdW3JlcXVpcmVkXVt2YWx1ZT0nUERGJ11bdHlwZT0naGlkZGVuJ11cIiksXG4gICAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLXN1Y2Nlc3MuYnRuLWJsb2NrW3R5cGU9J3N1Ym1pdCddXCIsIFwiRG93bmxvYWQgUERGXCIpXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgXSldO1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgVGFzdHkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLnVzZXIgPSBtLnByb3AoKTtcblxuICAgIHRoaXMuZGF0YXRhYmxlID0gbmV3IG1jLkRhdGF0YWJsZS5jb250cm9sbGVyKFxuICAgICAgICAvLyBDb2x1bW5zIGRlZmluaXRpb246XG4gICAgICAgIFtcbiAgICAgICAgICAgIHtrZXk6XCJFbXB0eVwifSxcbiAgICAgICAgICAgIHtrZXk6XCJOdW1iZXJzXCIsIGNoaWxkcmVuOltcbiAgICAgICAgICAgICAgICB7a2V5OlwiU0tVXCIsIGxhYmVsOlwiU0tVXCIsIHNvcnRhYmxlOnRydWV9LFxuICAgICAgICAgICAgICAgIHtrZXk6XCJRdWFudGl0eVwiLCBzb3J0YWJsZTp0cnVlLCBjbGFzczoncmlnaHQtYWxpZ25lZCd9XG4gICAgICAgICAgICBdfSxcbiAgICAgICAgICAgIHtrZXk6XCJUZXh0XCIsIGNoaWxkcmVuOltcbiAgICAgICAgICAgICAgICB7a2V5OlwiSXRlbVwiLCBzb3J0YWJsZTp0cnVlfSxcbiAgICAgICAgICAgICAgICB7a2V5OlwiRGVzY3JpcHRpb25cIiwgc29ydGFibGU6dHJ1ZSwgd2lkdGg6MjAwfVxuICAgICAgICAgICAgXX1cbiAgICAgICAgXSxcbiAgICAgICAgLy8gT3RoZXIgY29uZmlndXJhdGlvbjpcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gQWRkcmVzcyBvZiB0aGUgd2Vic2VydmVyIHN1cHBseWluZyB0aGUgZGF0YVxuICAgICAgICAgICAgdXJsOidkYXRhL3N0b2NrLmpzb24nLFxuXG4gICAgICAgICAgICAvLyBIYW5kbGVyIG9mIGNsaWNrIGV2ZW50IG9uIGRhdGEgY2VsbFxuICAgICAgICAgICAgLy8gSXQgcmVjZWl2ZXMgdGhlIHJlbGV2YW50IGluZm9ybWF0aW9uIGFscmVhZHkgcmVzb2x2ZWRcbiAgICAgICAgICAgIG9uQ2VsbENsaWNrOiBmdW5jdGlvbiAoY29udGVudCwgcm93LCBjb2wpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb250ZW50LCByb3csIGNvbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICApO1xuICB9LFxuICBcbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oJy5jb250YWluZXInLCBbXG4gICAgICBtKCdoMScsICd0YXN0eScpLFxuICAgICAgICBtYy5EYXRhdGFibGUudmlldyhjdHJsLmRhdGF0YWJsZSwgIHtcbiAgICAgICAgICAgIGNhcHRpb246J3RoaXMgaXMgdGhlIGNhcHRpb24nXG4gICAgICAgIH0pXG4gICAgXSldO1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xudmFyIFRpY2tldCA9IHJlcXVpcmUoJy4uL21vZGVscy9UaWNrZXQuanMnKTtcblxudmFyIFRpY2tldEVkaXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC50aWNrZXQgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgVGlja2V0LnNlbmQoe3RpdGxlOiBlLnRhcmdldC50aXRsZS52YWx1ZSxib2R5OiBlLnRhcmdldC5ib2R5LnZhbHVlfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtc3VjY2Vzcy5hbmltYXRlZC5mYWRlSW5VcFwiLCAndGlja2V0IGhhcyBiZWVuIHNhdmVkJykpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG4gICAgICAgICAgXG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBtZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgIG0oXCJmb3JtLnRleHQtY2VudGVyLnJvdy5mb3JtLXNpZ25pblwiLCB7b25zdWJtaXQ6Y3RybC50aWNrZXQuYmluZChjdHJsKX0sXG4gICAgICAgIG0oJy5jb2wtc20tNi5jb2wtc20tb2Zmc2V0LTMnLCBbXG4gICAgICAgICAgbShcImgxXCIsIFwiTmV3IFRpY2tldFwiKSxcbiAgICAgICAgICBjdHJsLmVycm9yKCksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0VGlja2V0J11cIiwgXCJUaWNrZXQgZGVzY3JpcHRpb25cIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3RpdGxlJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRUaXRsZSddW3BsYWNlaG9sZGVyPSdUaXRsZSAnXVtyZXF1aXJlZF1bdHlwZT0ndGV4dCddXCIpLFxuICAgICAgICAgIF0pLG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dFRpY2tldCddXCIsIFwiVGlja2V0IGRlc2NyaXB0aW9uXCIpLFxuICAgICAgICAgICAgbShcInRleHRhcmVhLmZvcm0tY29udHJvbFtuYW1lPSdib2R5J11bYXV0b2ZvY3VzXVtpZD0naW5wdXRib2R5J11bcGxhY2Vob2xkZXI9J2JvZHkgJ11bcmVxdWlyZWRdW3R5cGU9J3RleHQnXVwiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgIFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgIG0oXCJidXR0b24uYnRuLmJ0bi1sZy5idG4tcHJpbWFyeS5idG4tYmxvY2tbdHlwZT0nc3VibWl0J11cIiwgXCJTYXZlXCIpXG4gICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgKVxuICAgIF0pXTtcbiAgfVxufTsiLCIvLyB0aWNrZXQgcGFnZSB0byB2aWV3IHRpY2tldCBhLCBjb21tZW50cyAgYW5kIG5vdGVzIGlmIGFnZW50XG52YXIgVGlja2V0ID0gcmVxdWlyZSgnLi4vbW9kZWxzL1RpY2tldC5qcycpO1xudmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG5cbnZhciBUaWNrZXRQYWdlID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChhcmdzKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC5vcGVuID0gZnVuY3Rpb24gKHN0YXR1cykge1xuICAgICAgY3RybC50aWNrZXQoKS50aWNrZXQuc3RhdHVzID0gc3RhdHVzXG4gICAgICBUaWNrZXQuc2VuZCh7IHN0YXR1czogc3RhdHVzIH0sIG0ucm91dGUucGFyYW0oKS5pZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24gKHRpY2tldCkge1xuICAgICAgICAgIGN0cmwudGlja2V0KCkudGlja2V0ID0gdGlja2V0XG4gICAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgICB2YXIgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZC4nO1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBUaWNrZXQuZ2V0KG0ucm91dGUucGFyYW0oKS5pZClcbiAgICAgIC50aGVuKGZ1bmN0aW9uICh0aWNrZXQpIHtcblxuICAgICAgICBjdHJsLnRpY2tldCA9IG0ucHJvcCh0aWNrZXQpXG4gICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG4gICAgICAgbS5yb3V0ZSgnL3RpY2tldHMnKVxuICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtZGFuZ2VyLmFuaW1hdGVkLmZhZGVJblVwXCIsIG1lc3NhZ2UpKTtcbiAgICAgIH0pO1xuICB9LFxuICB2aWV3OiBmdW5jdGlvbiAoY3RybCkge1xuICAgIHJldHVybiBbTmF2YmFyLCBtKCcuY29udGFpbmVyJywgW1tcbiAgICAgIG0oXCJoMlwiLCBcIlRpY2tldFwiKSxcbiAgICAgIGN0cmwuZXJyb3IoKSxcbiAgICAgIG0oXCJwXCIsIGN0cmwudGlja2V0KCkudGlja2V0LnRpdGxlKSxtKFwicFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5ib2R5KSxcbiAgICAgIG0oXCJ0YWJsZS50YWJsZS50YWJsZS1jb25kZW5zZWQudGFibGUtYm9yZGVyZWRcIiwgW1xuICAgICAgICBtKFwidGhlYWRcIiwgW1xuICAgICAgICAgIG0oXCJ0clwiLCBbXG4gICAgICAgICAgICBtKFwidGhcIiwgXCJDdXN0b21lclwiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIkFnZW50XCIpLFxuICAgICAgICAgICAgbShcInRoXCIsIFwiQ3JlYXRpb24gRGF0ZVwiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIkRvbmUgRGF0ZVwiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIlN0YXR1c1wiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIlByaW9yaXR5XCIpLFxuICAgICAgICAgIF0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKFwidGJvZHlcIiwgW1xuICAgICAgICAgIG0oXCJ0clwiLCBbXG4gICAgICAgICAgICBtKFwidGRcIiwgY3RybC50aWNrZXQoKS50aWNrZXQuY3VzdG9tZXJfaWQpLFxuICAgICAgICAgICAgbShcInRkXCIsIGN0cmwudGlja2V0KCkudGlja2V0LmFnZW50X2lkKSxcbiAgICAgICAgICAgIG0oXCJ0ZFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5jcmVhdGVkX2F0KSxcbiAgICAgICAgICAgIG0oXCJ0ZFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5kb25lX2RhdGUpLFxuICAgICAgICAgICAgbShcInRkXCIsIGN0cmwudGlja2V0KCkudGlja2V0LnN0YXR1cyksXG4gICAgICAgICAgICBtKFwidGRcIiwgbShcInNwYW4ubGFiZWxcIiwgeyBjbGFzczogY3RybC50aWNrZXQoKS50aWNrZXQucHJpb3JldHkgPT0gXCJsb3dcIiA/IFwibGFiZWwtZGVmYXVsdFwiIDogY3RybC50aWNrZXQoKS50aWNrZXQucHJpb3JldHkgPT0gXCJtZWRpdW1cIiA/IFwibGFiZWwtcHJpbWFyeVwiIDogXCJsYWJlbC1kYW5nZXJcIiB9LCBjdHJsLnRpY2tldCgpLnRpY2tldC5wcmlvcmV0eSkpXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pXG4gICAgICBdKSxcblxuICAgICAgY3RybC50aWNrZXQoKS50aWNrZXQuc3RhdHVzID09ICdjbG9zZWQnID8gbShcImJ1dHRvbi5idG4uYnRuLXdhcm5pbmdcIiwgeyBvbmNsaWNrOiBjdHJsLm9wZW4uYmluZChjdHJsLCAnb3BlbmVkJykgfSwgXCJPcGVuZWRcIikgOlxuICAgICAgICBtKFwiYnV0dG9uLmJ0bi5idG4tZGFuZ2VyXCIsIHsgb25jbGljazogY3RybC5vcGVuLmJpbmQoY3RybCwgJ2Nsb3NlZCcpIH0sIFwiQ2xvc2VcIilcbiAgICAgIF1dXG4gICAgKV07XG4gIH1cblxufSIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIG1jID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9EYXRhVGFibGUuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBUaWNrZXQgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGlja2V0LmpzJyk7XG52YXIgVGlja2V0UGFnZSA9IHJlcXVpcmUoJy4uL3BhZ2VzL1RpY2tldFBhZ2UuanMnKTtcblxudmFyIFRpY2tldHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcbiAgICBcbiAgICBjdHJsLnByaW9yZXR5RnJvbWF0ZSA9IGZ1bmN0aW9uICh2YWx1ZSwgcm93LCBjb2wsIGF0dHJzKXtcbiAgICAgIGlmICh2YWx1ZSA9PSAnaGlnaCcpIGF0dHJzLmNsYXNzID0gJ2xhYmVsIGxhYmVsLWRhbmdlcic7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuICAgIFxuICAgIHRoaXMuZGF0YXRhYmxlID0gbmV3IG1jLkRhdGF0YWJsZS5jb250cm9sbGVyKFxuICAgICAgLy8gQ29sdW1ucyBkZWZpbml0aW9uOlxuICAgICAgW1xuICAgICAgICB7IGtleTogXCJ0aXRsZVwiLGxhYmVsOiBcIlRpdGxlXCIsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHsga2V5OiBcImFnZW50X2lkXCIsbGFiZWw6IFwiQWdlbnRcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBrZXk6IFwiY3VzdG9tZXJfaWRcIixsYWJlbDogXCJDdXN0b21lclwiLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGtleTogXCJwcmlvcmV0eVwiLGxhYmVsOiBcIlByaW9yaXR5XCJ9LFxuICAgICAgICB7IGtleTogXCJzdGF0dXNcIixsYWJlbDogXCJTdGF0dXNcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIF0sXG4gICAgICAvLyBPdGhlciBjb25maWd1cmF0aW9uOlxuICAgICAge1xuICAgICAgICAvLyBBZGRyZXNzIG9mIHRoZSB3ZWJzZXJ2ZXIgc3VwcGx5aW5nIHRoZSBkYXRhXG4gICAgICAgIHVybDogJ3RpY2tldHMnLFxuICAgICAgICBhdXRob3JpemF0aW9uOiBBdXRoLnRva2VuKCksXG4gICAgICAgIC8vIEhhbmRsZXIgb2YgY2xpY2sgZXZlbnQgb24gZGF0YSBjZWxsXG4gICAgICAgIC8vIEl0IHJlY2VpdmVzIHRoZSByZWxldmFudCBpbmZvcm1hdGlvbiBhbHJlYWR5IHJlc29sdmVkXG4gICAgICAgIG9uQ2VsbENsaWNrOiBmdW5jdGlvbiAoY29udGVudCwgcm93LCBjb2wpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjb250ZW50LCByb3csIGNvbCk7XG4gICAgICAgICAgbS5yb3V0ZShcIi90aWNrZXRcIix7aWQ6cm93LmlkfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gW05hdmJhciwgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgIG0oJ2gxJywgJ0Nyb3Nzb3ZlciBUaWNrZXQgU3lzdGVtJyksXG4gICAgICBtYy5EYXRhdGFibGUudmlldyhjdHJsLmRhdGF0YWJsZSwge1xuICAgICAgICBjYXB0aW9uOiAnTXkgVGlja2V0cydcbiAgICAgIH0pLFxuICAgICAgbShcImEuYnRuLmJ0bi1wcmltYXJ5LnB1bGwtcmlnaHRbaHJlZj0nL3JlcG9ydHMnXVwiLCB7Y29uZmlnOiBtLnJvdXRlfSwgXCJHZXQgUmVwb3J0XCIpXG4gICAgXSldO1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIG1jID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9EYXRhVGFibGUuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBVc2VyID0gcmVxdWlyZSgnLi4vbW9kZWxzL1VzZXIuanMnKTtcblxudmFyIFVzZXJEZWxldGUgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC5nZXQgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgVXNlci5kZWxldGUobS5yb3V0ZS5wYXJhbSgpLmlkKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1zdWNjZXNzLmFuaW1hdGVkLmZhZGVJblVwXCIsICd1c2VyIGhhcyBiZWVuIHNhdmVkJykpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG4gICAgICAgICAgXG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBtZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgIGN0cmwuZXJyb3IoKSxcbiAgICAgIG0oXCJmb3JtLnRleHQtY2VudGVyLnJvdy5mb3JtLXVzZXItZGVsZXRlXCIsIHtvbnN1Ym1pdDpjdHJsLmdldC5iaW5kKGN0cmwpfSxcbiAgICAgICAgbSgnLmNvbC1zbS02LmNvbC1zbS1vZmZzZXQtMy5tdC01MCcsIFtcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKFwiYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXdhcm5pbmcuYnRuLWJsb2NrW3R5cGU9J3N1Ym1pdCddXCIsIFwiRGVsZXRlIFVzZXI/XCIpXG4gICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgKSxcbiAgICBdKV07XG4gIH1cbn07IiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgbWMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL0RhdGFUYWJsZS5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xudmFyIFVzZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvVXNlci5qcycpO1xuXG52YXIgVXNlckVkaXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC5nZXQgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgVXNlci5zZW5kKHtuYW1lOiBlLnRhcmdldC5uYW1lLnZhbHVlLHN0YXR1czogZS50YXJnZXQuc3RhdHVzLnZhbHVlLHBob25lOiBlLnRhcmdldC5waG9uZS52YWx1ZX0sIG0ucm91dGUucGFyYW0oKS5pZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtc3VjY2Vzcy5hbmltYXRlZC5mYWRlSW5VcFwiLCAndXNlciBoYXMgYmVlbiBzYXZlZCcpKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICB2YXIgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZC4nO1xuICAgICAgICAgIFxuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHJldHVybiBbTmF2YmFyLnZpZXcoY3RybC5uYXZiYXIpLCBtKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICBtKFwiZm9ybS50ZXh0LWNlbnRlci5yb3cuZm9ybS11c2VyLWVkaXRcIiwge29uc3VibWl0OmN0cmwuZ2V0LmJpbmQoY3RybCl9LFxuICAgICAgICBtKCcuY29sLXNtLTYuY29sLXNtLW9mZnNldC0zJywgW1xuICAgICAgICAgIG0oXCJoMVwiLCBcIkVkaXQgVXNlclwiKSxcbiAgICAgICAgICBjdHJsLmVycm9yKCksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuW2Zvcj0naW5wdXROYW1lJ11cIiwgXCJOYW1lXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSduYW1lJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRUaXRsZSddW3BsYWNlaG9sZGVyPSdOYW1lICddW3JlcXVpcmVkXVt0eXBlPSd0ZXh0J11cIiksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuW2Zvcj0naW5wdXRQaG9uZSddXCIsIFwiUGhvbmVcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3Bob25lJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRib2R5J11bcGxhY2Vob2xkZXI9J1Bob25lICddW3JlcXVpcmVkXVt0eXBlPSd0ZXh0J11cIiksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAucHVsbC1sZWZ0JywgW1xuICAgICAgICAgICAgbShcImxhYmVsLltmb3I9J2lucHV0U3RhdHVzJ11cIiwgXCJTdGF0dXNcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXRbbmFtZT0nc3RhdHVzJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRTdGF0dXNCbG9jayddW3ZhbHVlPSdibG9ja2VkJ11bdHlwZT0ncmFkaW8nXVwiKSxcbiAgICAgICAgICAgIG0oXCJsYWJlbC5yYWRpby1pbmxpbmVcIiwgXCJCbG9ja1wiKSxcbiAgICAgICAgICAgIG0oXCJpbnB1dC5tbC0yMFtuYW1lPSdzdGF0dXMnXVthdXRvZm9jdXNdW2lkPSdpbnB1dFN0YXR1c1VuYmxvY2snXVt2YWx1ZT0ndW5ibG9ja2VkJ11bdHlwZT0ncmFkaW8nXVwiKSxcbiAgICAgICAgICAgIG0oXCJsYWJlbC5yYWRpby1pbmxpbmVcIiwgXCJVbmJsb2NrXCIpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgIG0oXCJidXR0b24uYnRuLmJ0bi1sZy5idG4tcHJpbWFyeS5idG4tYmxvY2tbdHlwZT0nc3VibWl0J11cIiwgXCJTYXZlXCIpXG4gICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgKSxcbiAgICAgIG0oXCJhLmJ0bi5idG4td2FybmluZy5idG4teHMucHVsbC1yaWdodFtocmVmPScvdXNlcnMvXCIgKyBtLnJvdXRlLnBhcmFtKCkuaWQgKyBcIiddW2RhdGEtbWV0aG9kPSdkZWxldGUnXVwiLCB7Y29uZmlnOiBtLnJvdXRlfSwgXCJEZWxldGUgVXNlclwiKVxuICAgIF0pXTtcbiAgfVxufTsiLCJ2YXIgTmF2YmFyID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9OYXZiYXIuanMnKTtcbnZhciBtYyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvRGF0YVRhYmxlLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciB1c2VycyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwubmF2YmFyID0gbmV3IE5hdmJhci5jb250cm9sbGVyKCk7XG4gICAgY3RybC51c2VyID0gbS5wcm9wKCk7XG5cbiAgICBjdHJsLnByaW9yZXR5RnJvbWF0ZSA9IGZ1bmN0aW9uKHZhbHVlLCByb3csIGNvbCwgYXR0cnMpIHtcbiAgICAgIGlmICh2YWx1ZSA9PSAnaGlnaCcpIGF0dHJzLmNsYXNzID0gJ2xhYmVsIGxhYmVsLWRhbmdlcic7XG5cbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGF0YWJsZSA9IG5ldyBtYy5EYXRhdGFibGUuY29udHJvbGxlcihcbiAgICAgIC8vIENvbHVtbnMgZGVmaW5pdGlvbjpcbiAgICAgIFtcbiAgICAgICAgeyBrZXk6IFwiZW1haWxcIixsYWJlbDogXCJFbWFpbFwiIH0sXG4gICAgICAgIHsga2V5OiBcInBob25lXCIsbGFiZWw6IFwiUGhvbmVcIiB9LFxuICAgICAgICB7IGtleTogXCJ0eXBlXCIsbGFiZWw6IFwiVHlwZVwiIH0sXG4gICAgICAgIHsga2V5OiBcInN0YXR1c1wiLGxhYmVsOiBcIlN0YXR1c1wiIH0sXG4gICAgICBdLFxuICAgICAgLy8gT3RoZXIgY29uZmlndXJhdGlvbjpcbiAgICAgIHtcbiAgICAgICAgLy8gQWRkcmVzcyBvZiB0aGUgd2Vic2VydmVyIHN1cHBseWluZyB0aGUgZGF0YVxuICAgICAgICB1cmw6ICd1c2VycycsXG4gICAgICAgIGF1dGhvcml6YXRpb246IEF1dGgudG9rZW4oKSxcbiAgICAgICAgb25DZWxsQ2xpY2s6IGZ1bmN0aW9uIChjb250ZW50LCByb3csIGNvbCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGNvbnRlbnQsIHJvdywgY29sKTtcbiAgICAgICAgICBtLnJvdXRlKFwiL3VzZXJFZGl0XCIse2lkOnJvdy5pZH0pXG4gICAgICAgIH1cbiAgICAgICAgLy8gSGFuZGxlciBvZiBjbGljayBldmVudCBvbiBkYXRhIGNlbGxcbiAgICAgICAgLy8gSXQgcmVjZWl2ZXMgdGhlIHJlbGV2YW50IGluZm9ybWF0aW9uIGFscmVhZHkgcmVzb2x2ZWRcbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uIChjdHJsKSB7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oJy5jb250YWluZXInLCBbXG4gICAgICBtKCdoMScsICdVc2VycyBtYW5hZ2VtZW50JyksXG4gICAgICBtYy5EYXRhdGFibGUudmlldyhjdHJsLmRhdGF0YWJsZSwge1xuICAgICAgICBjYXB0aW9uOiAnQWxsIHVzZXJzJ1xuICAgICAgfSlcbiAgICBdKV07XG4gIH1cbn07IiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciBWZXJpZnkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoKTtcblxuICAgIEF1dGgudmVyaWZ5KG0ucm91dGUucGFyYW0oXCJjb2RlXCIpKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICBjdHJsLm1lc3NhZ2UoW1xuICAgICAgICAnU3dlZXQuIE5vdywgeW91IGNhbiAnLFxuICAgICAgICBtKCdhW2hyZWY9XCIvbG9naW5cIl0nLCB7Y29uZmlnOiBtLnJvdXRlfSwgJ2xvZ2luJyksXG4gICAgICAgICcuJ1xuICAgICAgXSk7XG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIGN0cmwubWVzc2FnZSgnSG1tLCB0aGVyZSB3YXMgc29tZXRoaW5nIHdyb25nIHdpdGggdGhhdCBjb2RlLiBDaGVjayB5b3VyIGVtYWlsIGFnYWluLicpO1xuICAgIH0pO1xuICB9LFxuICBcbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oJy5jb250YWluZXInLCBbXG4gICAgICBtKCdoMScsICd2ZXJpZnknKSxcbiAgICAgIGN0cmwubWVzc2FnZSgpXG4gICAgXSldO1xuICB9XG59OyJdfQ==
