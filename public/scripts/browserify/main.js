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
      (Auth.user_type() == 'Agent'? { label: 'Reports', href: '/my_reports' }:{}),
      (Auth.user_type() == 'Admin'? { label: 'Reports', href: '/my_reports' }:{}),
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
  "/my_reports": require('./pages/MyReports.js'),
  "/users": require('./pages/Users.js'),
  "/users/:id": require('./pages/UserDelete.js'),
  "/tasty": require('./pages/Tasty.js')
});

},{"./pages/Login.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Login.js","./pages/Logout.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Logout.js","./pages/MyReports.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/MyReports.js","./pages/Register.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Register.js","./pages/Tasty.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Tasty.js","./pages/TicketEdit.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketEdit.js","./pages/TicketPage.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketPage.js","./pages/Tickets.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Tickets.js","./pages/UserDelete.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/UserDelete.js","./pages/UserEdit.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/UserEdit.js","./pages/Users.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Users.js","./pages/Verify.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/Verify.js","underscore":"/Users/sumitsourav/Work/Code/node_modules/underscore/underscore.js"}],"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js":[function(require,module,exports){
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

    download: function () {
        return m.request({
            method: 'get',
            url: '/download_report',
            config: function (xhr) {
                xhr.setRequestHeader('Authorization', Auth.token());
            }
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
},{"../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/MyReports.js":[function(require,module,exports){
var Navbar = require('../components/Navbar.js');
var mc = require('../components/DataTable.js');
var Auth = require('../models/Auth.js');
var Ticket = require('../models/Ticket.js');
var TicketPage = require('../pages/TicketPage.js');

m.route.mode = "pathname";

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
        { key: "customer_id",label: "Customer", sortable: true },
        { key: "priorety",label: "Priority"},
        { key: "status",label: "Status", sortable: true },
      ],
      // Other configuration:
      {
        // Address of the webserver supplying the data
        url: 'reports',
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
      m('h1', 'Last Month Report'),
      mc.Datatable.view(ctrl.datatable, {
        caption: 'Tickets closed last month'
      }),
      m("a.btn.btn-primary.pull-right[href='/download_report']", {config: m.route}, "Export Report")
    ])];
  }
};

},{"../components/DataTable.js":"/Users/sumitsourav/Work/Code/public/scripts/components/DataTable.js","../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js","../models/Ticket.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Ticket.js","../pages/TicketPage.js":"/Users/sumitsourav/Work/Code/public/scripts/pages/TicketPage.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Register.js":[function(require,module,exports){
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
},{"../components/Navbar.js":"/Users/sumitsourav/Work/Code/public/scripts/components/Navbar.js","../models/Auth.js":"/Users/sumitsourav/Work/Code/public/scripts/models/Auth.js"}],"/Users/sumitsourav/Work/Code/public/scripts/pages/Tasty.js":[function(require,module,exports){
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzIiwicHVibGljL3NjcmlwdHMvY29tcG9uZW50cy9EYXRhVGFibGUuanMiLCJwdWJsaWMvc2NyaXB0cy9jb21wb25lbnRzL05hdmJhci5qcyIsInB1YmxpYy9zY3JpcHRzL21haW4uanMiLCJwdWJsaWMvc2NyaXB0cy9tb2RlbHMvQXV0aC5qcyIsInB1YmxpYy9zY3JpcHRzL21vZGVscy9UaWNrZXQuanMiLCJwdWJsaWMvc2NyaXB0cy9tb2RlbHMvVXNlci5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL0xvZ2luLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvTG9nb3V0LmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvTXlSZXBvcnRzLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvUmVnaXN0ZXIuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9UYXN0eS5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1RpY2tldEVkaXQuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9UaWNrZXRQYWdlLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvVGlja2V0cy5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1VzZXJEZWxldGUuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9Vc2VyRWRpdC5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1VzZXJzLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvVmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ1ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzlEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ25FQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNoREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNyQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBIiwiZmlsZSI6ImdlbmVyYXRlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzQ29udGVudCI6WyIoZnVuY3Rpb24gZSh0LG4scil7ZnVuY3Rpb24gcyhvLHUpe2lmKCFuW29dKXtpZighdFtvXSl7dmFyIGE9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtpZighdSYmYSlyZXR1cm4gYShvLCEwKTtpZihpKXJldHVybiBpKG8sITApO3ZhciBmPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIrbytcIidcIik7dGhyb3cgZi5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGZ9dmFyIGw9bltvXT17ZXhwb3J0czp7fX07dFtvXVswXS5jYWxsKGwuZXhwb3J0cyxmdW5jdGlvbihlKXt2YXIgbj10W29dWzFdW2VdO3JldHVybiBzKG4/bjplKX0sbCxsLmV4cG9ydHMsZSx0LG4scil9cmV0dXJuIG5bb10uZXhwb3J0c312YXIgaT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2Zvcih2YXIgbz0wO288ci5sZW5ndGg7bysrKXMocltvXSk7cmV0dXJuIHN9KSIsIi8vICAgICBVbmRlcnNjb3JlLmpzIDEuOC4zXG4vLyAgICAgaHR0cDovL3VuZGVyc2NvcmVqcy5vcmdcbi8vICAgICAoYykgMjAwOS0yMDE1IEplcmVteSBBc2hrZW5hcywgRG9jdW1lbnRDbG91ZCBhbmQgSW52ZXN0aWdhdGl2ZSBSZXBvcnRlcnMgJiBFZGl0b3JzXG4vLyAgICAgVW5kZXJzY29yZSBtYXkgYmUgZnJlZWx5IGRpc3RyaWJ1dGVkIHVuZGVyIHRoZSBNSVQgbGljZW5zZS5cblxuKGZ1bmN0aW9uKCkge1xuXG4gIC8vIEJhc2VsaW5lIHNldHVwXG4gIC8vIC0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRXN0YWJsaXNoIHRoZSByb290IG9iamVjdCwgYHdpbmRvd2AgaW4gdGhlIGJyb3dzZXIsIG9yIGBleHBvcnRzYCBvbiB0aGUgc2VydmVyLlxuICB2YXIgcm9vdCA9IHRoaXM7XG5cbiAgLy8gU2F2ZSB0aGUgcHJldmlvdXMgdmFsdWUgb2YgdGhlIGBfYCB2YXJpYWJsZS5cbiAgdmFyIHByZXZpb3VzVW5kZXJzY29yZSA9IHJvb3QuXztcblxuICAvLyBTYXZlIGJ5dGVzIGluIHRoZSBtaW5pZmllZCAoYnV0IG5vdCBnemlwcGVkKSB2ZXJzaW9uOlxuICB2YXIgQXJyYXlQcm90byA9IEFycmF5LnByb3RvdHlwZSwgT2JqUHJvdG8gPSBPYmplY3QucHJvdG90eXBlLCBGdW5jUHJvdG8gPSBGdW5jdGlvbi5wcm90b3R5cGU7XG5cbiAgLy8gQ3JlYXRlIHF1aWNrIHJlZmVyZW5jZSB2YXJpYWJsZXMgZm9yIHNwZWVkIGFjY2VzcyB0byBjb3JlIHByb3RvdHlwZXMuXG4gIHZhclxuICAgIHB1c2ggICAgICAgICAgICAgPSBBcnJheVByb3RvLnB1c2gsXG4gICAgc2xpY2UgICAgICAgICAgICA9IEFycmF5UHJvdG8uc2xpY2UsXG4gICAgdG9TdHJpbmcgICAgICAgICA9IE9ialByb3RvLnRvU3RyaW5nLFxuICAgIGhhc093blByb3BlcnR5ICAgPSBPYmpQcm90by5oYXNPd25Qcm9wZXJ0eTtcblxuICAvLyBBbGwgKipFQ01BU2NyaXB0IDUqKiBuYXRpdmUgZnVuY3Rpb24gaW1wbGVtZW50YXRpb25zIHRoYXQgd2UgaG9wZSB0byB1c2VcbiAgLy8gYXJlIGRlY2xhcmVkIGhlcmUuXG4gIHZhclxuICAgIG5hdGl2ZUlzQXJyYXkgICAgICA9IEFycmF5LmlzQXJyYXksXG4gICAgbmF0aXZlS2V5cyAgICAgICAgID0gT2JqZWN0LmtleXMsXG4gICAgbmF0aXZlQmluZCAgICAgICAgID0gRnVuY1Byb3RvLmJpbmQsXG4gICAgbmF0aXZlQ3JlYXRlICAgICAgID0gT2JqZWN0LmNyZWF0ZTtcblxuICAvLyBOYWtlZCBmdW5jdGlvbiByZWZlcmVuY2UgZm9yIHN1cnJvZ2F0ZS1wcm90b3R5cGUtc3dhcHBpbmcuXG4gIHZhciBDdG9yID0gZnVuY3Rpb24oKXt9O1xuXG4gIC8vIENyZWF0ZSBhIHNhZmUgcmVmZXJlbmNlIHRvIHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgdXNlIGJlbG93LlxuICB2YXIgXyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmIChvYmogaW5zdGFuY2VvZiBfKSByZXR1cm4gb2JqO1xuICAgIGlmICghKHRoaXMgaW5zdGFuY2VvZiBfKSkgcmV0dXJuIG5ldyBfKG9iaik7XG4gICAgdGhpcy5fd3JhcHBlZCA9IG9iajtcbiAgfTtcblxuICAvLyBFeHBvcnQgdGhlIFVuZGVyc2NvcmUgb2JqZWN0IGZvciAqKk5vZGUuanMqKiwgd2l0aFxuICAvLyBiYWNrd2FyZHMtY29tcGF0aWJpbGl0eSBmb3IgdGhlIG9sZCBgcmVxdWlyZSgpYCBBUEkuIElmIHdlJ3JlIGluXG4gIC8vIHRoZSBicm93c2VyLCBhZGQgYF9gIGFzIGEgZ2xvYmFsIG9iamVjdC5cbiAgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIGlmICh0eXBlb2YgbW9kdWxlICE9PSAndW5kZWZpbmVkJyAmJiBtb2R1bGUuZXhwb3J0cykge1xuICAgICAgZXhwb3J0cyA9IG1vZHVsZS5leHBvcnRzID0gXztcbiAgICB9XG4gICAgZXhwb3J0cy5fID0gXztcbiAgfSBlbHNlIHtcbiAgICByb290Ll8gPSBfO1xuICB9XG5cbiAgLy8gQ3VycmVudCB2ZXJzaW9uLlxuICBfLlZFUlNJT04gPSAnMS44LjMnO1xuXG4gIC8vIEludGVybmFsIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyBhbiBlZmZpY2llbnQgKGZvciBjdXJyZW50IGVuZ2luZXMpIHZlcnNpb25cbiAgLy8gb2YgdGhlIHBhc3NlZC1pbiBjYWxsYmFjaywgdG8gYmUgcmVwZWF0ZWRseSBhcHBsaWVkIGluIG90aGVyIFVuZGVyc2NvcmVcbiAgLy8gZnVuY3Rpb25zLlxuICB2YXIgb3B0aW1pemVDYiA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQsIGFyZ0NvdW50KSB7XG4gICAgaWYgKGNvbnRleHQgPT09IHZvaWQgMCkgcmV0dXJuIGZ1bmM7XG4gICAgc3dpdGNoIChhcmdDb3VudCA9PSBudWxsID8gMyA6IGFyZ0NvdW50KSB7XG4gICAgICBjYXNlIDE6IHJldHVybiBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDI6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgb3RoZXIpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgb3RoZXIpO1xuICAgICAgfTtcbiAgICAgIGNhc2UgMzogcmV0dXJuIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbik7XG4gICAgICB9O1xuICAgICAgY2FzZSA0OiByZXR1cm4gZnVuY3Rpb24oYWNjdW11bGF0b3IsIHZhbHVlLCBpbmRleCwgY29sbGVjdGlvbikge1xuICAgICAgICByZXR1cm4gZnVuYy5jYWxsKGNvbnRleHQsIGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkoY29udGV4dCwgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEEgbW9zdGx5LWludGVybmFsIGZ1bmN0aW9uIHRvIGdlbmVyYXRlIGNhbGxiYWNrcyB0aGF0IGNhbiBiZSBhcHBsaWVkXG4gIC8vIHRvIGVhY2ggZWxlbWVudCBpbiBhIGNvbGxlY3Rpb24sIHJldHVybmluZyB0aGUgZGVzaXJlZCByZXN1bHQg4oCUIGVpdGhlclxuICAvLyBpZGVudGl0eSwgYW4gYXJiaXRyYXJ5IGNhbGxiYWNrLCBhIHByb3BlcnR5IG1hdGNoZXIsIG9yIGEgcHJvcGVydHkgYWNjZXNzb3IuXG4gIHZhciBjYiA9IGZ1bmN0aW9uKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmICh2YWx1ZSA9PSBudWxsKSByZXR1cm4gXy5pZGVudGl0eTtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKHZhbHVlKSkgcmV0dXJuIG9wdGltaXplQ2IodmFsdWUsIGNvbnRleHQsIGFyZ0NvdW50KTtcbiAgICBpZiAoXy5pc09iamVjdCh2YWx1ZSkpIHJldHVybiBfLm1hdGNoZXIodmFsdWUpO1xuICAgIHJldHVybiBfLnByb3BlcnR5KHZhbHVlKTtcbiAgfTtcbiAgXy5pdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIGNiKHZhbHVlLCBjb250ZXh0LCBJbmZpbml0eSk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGFzc2lnbmVyIGZ1bmN0aW9ucy5cbiAgdmFyIGNyZWF0ZUFzc2lnbmVyID0gZnVuY3Rpb24oa2V5c0Z1bmMsIHVuZGVmaW5lZE9ubHkpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICB2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICAgIGlmIChsZW5ndGggPCAyIHx8IG9iaiA9PSBudWxsKSByZXR1cm4gb2JqO1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAxOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICB2YXIgc291cmNlID0gYXJndW1lbnRzW2luZGV4XSxcbiAgICAgICAgICAgIGtleXMgPSBrZXlzRnVuYyhzb3VyY2UpLFxuICAgICAgICAgICAgbCA9IGtleXMubGVuZ3RoO1xuICAgICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGw7IGkrKykge1xuICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgIGlmICghdW5kZWZpbmVkT25seSB8fCBvYmpba2V5XSA9PT0gdm9pZCAwKSBvYmpba2V5XSA9IHNvdXJjZVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICByZXR1cm4gb2JqO1xuICAgIH07XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gZm9yIGNyZWF0aW5nIGEgbmV3IG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gYW5vdGhlci5cbiAgdmFyIGJhc2VDcmVhdGUgPSBmdW5jdGlvbihwcm90b3R5cGUpIHtcbiAgICBpZiAoIV8uaXNPYmplY3QocHJvdG90eXBlKSkgcmV0dXJuIHt9O1xuICAgIGlmIChuYXRpdmVDcmVhdGUpIHJldHVybiBuYXRpdmVDcmVhdGUocHJvdG90eXBlKTtcbiAgICBDdG9yLnByb3RvdHlwZSA9IHByb3RvdHlwZTtcbiAgICB2YXIgcmVzdWx0ID0gbmV3IEN0b3I7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBudWxsO1xuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgdmFyIHByb3BlcnR5ID0gZnVuY3Rpb24oa2V5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIG9iaiA9PSBudWxsID8gdm9pZCAwIDogb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBIZWxwZXIgZm9yIGNvbGxlY3Rpb24gbWV0aG9kcyB0byBkZXRlcm1pbmUgd2hldGhlciBhIGNvbGxlY3Rpb25cbiAgLy8gc2hvdWxkIGJlIGl0ZXJhdGVkIGFzIGFuIGFycmF5IG9yIGFzIGFuIG9iamVjdFxuICAvLyBSZWxhdGVkOiBodHRwOi8vcGVvcGxlLm1vemlsbGEub3JnL35qb3JlbmRvcmZmL2VzNi1kcmFmdC5odG1sI3NlYy10b2xlbmd0aFxuICAvLyBBdm9pZHMgYSB2ZXJ5IG5hc3R5IGlPUyA4IEpJVCBidWcgb24gQVJNLTY0LiAjMjA5NFxuICB2YXIgTUFYX0FSUkFZX0lOREVYID0gTWF0aC5wb3coMiwgNTMpIC0gMTtcbiAgdmFyIGdldExlbmd0aCA9IHByb3BlcnR5KCdsZW5ndGgnKTtcbiAgdmFyIGlzQXJyYXlMaWtlID0gZnVuY3Rpb24oY29sbGVjdGlvbikge1xuICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoY29sbGVjdGlvbik7XG4gICAgcmV0dXJuIHR5cGVvZiBsZW5ndGggPT0gJ251bWJlcicgJiYgbGVuZ3RoID49IDAgJiYgbGVuZ3RoIDw9IE1BWF9BUlJBWV9JTkRFWDtcbiAgfTtcblxuICAvLyBDb2xsZWN0aW9uIEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFRoZSBjb3JuZXJzdG9uZSwgYW4gYGVhY2hgIGltcGxlbWVudGF0aW9uLCBha2EgYGZvckVhY2hgLlxuICAvLyBIYW5kbGVzIHJhdyBvYmplY3RzIGluIGFkZGl0aW9uIHRvIGFycmF5LWxpa2VzLiBUcmVhdHMgYWxsXG4gIC8vIHNwYXJzZSBhcnJheS1saWtlcyBhcyBpZiB0aGV5IHdlcmUgZGVuc2UuXG4gIF8uZWFjaCA9IF8uZm9yRWFjaCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBpLCBsZW5ndGg7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgIGZvciAoaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpbaV0sIGksIG9iaik7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGl0ZXJhdGVlKG9ialtrZXlzW2ldXSwga2V5c1tpXSwgb2JqKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudC5cbiAgXy5tYXAgPSBfLmNvbGxlY3QgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgIHJlc3VsdHMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICByZXN1bHRzW2luZGV4XSA9IGl0ZXJhdGVlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ3JlYXRlIGEgcmVkdWNpbmcgZnVuY3Rpb24gaXRlcmF0aW5nIGxlZnQgb3IgcmlnaHQuXG4gIGZ1bmN0aW9uIGNyZWF0ZVJlZHVjZShkaXIpIHtcbiAgICAvLyBPcHRpbWl6ZWQgaXRlcmF0b3IgZnVuY3Rpb24gYXMgdXNpbmcgYXJndW1lbnRzLmxlbmd0aFxuICAgIC8vIGluIHRoZSBtYWluIGZ1bmN0aW9uIHdpbGwgZGVvcHRpbWl6ZSB0aGUsIHNlZSAjMTk5MS5cbiAgICBmdW5jdGlvbiBpdGVyYXRvcihvYmosIGl0ZXJhdGVlLCBtZW1vLCBrZXlzLCBpbmRleCwgbGVuZ3RoKSB7XG4gICAgICBmb3IgKDsgaW5kZXggPj0gMCAmJiBpbmRleCA8IGxlbmd0aDsgaW5kZXggKz0gZGlyKSB7XG4gICAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICAgIG1lbW8gPSBpdGVyYXRlZShtZW1vLCBvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gbWVtbztcbiAgICB9XG5cbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgbWVtbywgY29udGV4dCkge1xuICAgICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0LCA0KTtcbiAgICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGgsXG4gICAgICAgICAgaW5kZXggPSBkaXIgPiAwID8gMCA6IGxlbmd0aCAtIDE7XG4gICAgICAvLyBEZXRlcm1pbmUgdGhlIGluaXRpYWwgdmFsdWUgaWYgbm9uZSBpcyBwcm92aWRlZC5cbiAgICAgIGlmIChhcmd1bWVudHMubGVuZ3RoIDwgMykge1xuICAgICAgICBtZW1vID0gb2JqW2tleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4XTtcbiAgICAgICAgaW5kZXggKz0gZGlyO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGl0ZXJhdG9yKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGtleXMsIGluZGV4LCBsZW5ndGgpO1xuICAgIH07XG4gIH1cblxuICAvLyAqKlJlZHVjZSoqIGJ1aWxkcyB1cCBhIHNpbmdsZSByZXN1bHQgZnJvbSBhIGxpc3Qgb2YgdmFsdWVzLCBha2EgYGluamVjdGAsXG4gIC8vIG9yIGBmb2xkbGAuXG4gIF8ucmVkdWNlID0gXy5mb2xkbCA9IF8uaW5qZWN0ID0gY3JlYXRlUmVkdWNlKDEpO1xuXG4gIC8vIFRoZSByaWdodC1hc3NvY2lhdGl2ZSB2ZXJzaW9uIG9mIHJlZHVjZSwgYWxzbyBrbm93biBhcyBgZm9sZHJgLlxuICBfLnJlZHVjZVJpZ2h0ID0gXy5mb2xkciA9IGNyZWF0ZVJlZHVjZSgtMSk7XG5cbiAgLy8gUmV0dXJuIHRoZSBmaXJzdCB2YWx1ZSB3aGljaCBwYXNzZXMgYSB0cnV0aCB0ZXN0LiBBbGlhc2VkIGFzIGBkZXRlY3RgLlxuICBfLmZpbmQgPSBfLmRldGVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgdmFyIGtleTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkge1xuICAgICAga2V5ID0gXy5maW5kSW5kZXgob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIH0gZWxzZSB7XG4gICAgICBrZXkgPSBfLmZpbmRLZXkob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIH1cbiAgICBpZiAoa2V5ICE9PSB2b2lkIDAgJiYga2V5ICE9PSAtMSkgcmV0dXJuIG9ialtrZXldO1xuICB9O1xuXG4gIC8vIFJldHVybiBhbGwgdGhlIGVsZW1lbnRzIHRoYXQgcGFzcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYHNlbGVjdGAuXG4gIF8uZmlsdGVyID0gXy5zZWxlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHRzID0gW107XG4gICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIGlmIChwcmVkaWNhdGUodmFsdWUsIGluZGV4LCBsaXN0KSkgcmVzdWx0cy5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyBmb3Igd2hpY2ggYSB0cnV0aCB0ZXN0IGZhaWxzLlxuICBfLnJlamVjdCA9IGZ1bmN0aW9uKG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5uZWdhdGUoY2IocHJlZGljYXRlKSksIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIERldGVybWluZSB3aGV0aGVyIGFsbCBvZiB0aGUgZWxlbWVudHMgbWF0Y2ggYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBhbGxgLlxuICBfLmV2ZXJ5ID0gXy5hbGwgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmICghcHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgYXQgbGVhc3Qgb25lIGVsZW1lbnQgaW4gdGhlIG9iamVjdCBtYXRjaGVzIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYW55YC5cbiAgXy5zb21lID0gXy5hbnkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSAhaXNBcnJheUxpa2Uob2JqKSAmJiBfLmtleXMob2JqKSxcbiAgICAgICAgbGVuZ3RoID0gKGtleXMgfHwgb2JqKS5sZW5ndGg7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgdmFyIGN1cnJlbnRLZXkgPSBrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleDtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopKSByZXR1cm4gdHJ1ZTtcbiAgICB9XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9O1xuXG4gIC8vIERldGVybWluZSBpZiB0aGUgYXJyYXkgb3Igb2JqZWN0IGNvbnRhaW5zIGEgZ2l2ZW4gaXRlbSAodXNpbmcgYD09PWApLlxuICAvLyBBbGlhc2VkIGFzIGBpbmNsdWRlc2AgYW5kIGBpbmNsdWRlYC5cbiAgXy5jb250YWlucyA9IF8uaW5jbHVkZXMgPSBfLmluY2x1ZGUgPSBmdW5jdGlvbihvYmosIGl0ZW0sIGZyb21JbmRleCwgZ3VhcmQpIHtcbiAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgaWYgKHR5cGVvZiBmcm9tSW5kZXggIT0gJ251bWJlcicgfHwgZ3VhcmQpIGZyb21JbmRleCA9IDA7XG4gICAgcmV0dXJuIF8uaW5kZXhPZihvYmosIGl0ZW0sIGZyb21JbmRleCkgPj0gMDtcbiAgfTtcblxuICAvLyBJbnZva2UgYSBtZXRob2QgKHdpdGggYXJndW1lbnRzKSBvbiBldmVyeSBpdGVtIGluIGEgY29sbGVjdGlvbi5cbiAgXy5pbnZva2UgPSBmdW5jdGlvbihvYmosIG1ldGhvZCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBpc0Z1bmMgPSBfLmlzRnVuY3Rpb24obWV0aG9kKTtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSkge1xuICAgICAgdmFyIGZ1bmMgPSBpc0Z1bmMgPyBtZXRob2QgOiB2YWx1ZVttZXRob2RdO1xuICAgICAgcmV0dXJuIGZ1bmMgPT0gbnVsbCA/IGZ1bmMgOiBmdW5jLmFwcGx5KHZhbHVlLCBhcmdzKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBtYXBgOiBmZXRjaGluZyBhIHByb3BlcnR5LlxuICBfLnBsdWNrID0gZnVuY3Rpb24ob2JqLCBrZXkpIHtcbiAgICByZXR1cm4gXy5tYXAob2JqLCBfLnByb3BlcnR5KGtleSkpO1xuICB9O1xuXG4gIC8vIENvbnZlbmllbmNlIHZlcnNpb24gb2YgYSBjb21tb24gdXNlIGNhc2Ugb2YgYGZpbHRlcmA6IHNlbGVjdGluZyBvbmx5IG9iamVjdHNcbiAgLy8gY29udGFpbmluZyBzcGVjaWZpYyBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy53aGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaW5kYDogZ2V0dGluZyB0aGUgZmlyc3Qgb2JqZWN0XG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uZmluZFdoZXJlID0gZnVuY3Rpb24ob2JqLCBhdHRycykge1xuICAgIHJldHVybiBfLmZpbmQob2JqLCBfLm1hdGNoZXIoYXR0cnMpKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gdGhlIG1heGltdW0gZWxlbWVudCAob3IgZWxlbWVudC1iYXNlZCBjb21wdXRhdGlvbikuXG4gIF8ubWF4ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSAtSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IC1JbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA+IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkID4gbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSAtSW5maW5pdHkgJiYgcmVzdWx0ID09PSAtSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtaW5pbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1pbiA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gSW5maW5pdHksIGxhc3RDb21wdXRlZCA9IEluZmluaXR5LFxuICAgICAgICB2YWx1ZSwgY29tcHV0ZWQ7XG4gICAgaWYgKGl0ZXJhdGVlID09IG51bGwgJiYgb2JqICE9IG51bGwpIHtcbiAgICAgIG9iaiA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IG9iai5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICB2YWx1ZSA9IG9ialtpXTtcbiAgICAgICAgaWYgKHZhbHVlIDwgcmVzdWx0KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpO1xuICAgICAgICBpZiAoY29tcHV0ZWQgPCBsYXN0Q29tcHV0ZWQgfHwgY29tcHV0ZWQgPT09IEluZmluaXR5ICYmIHJlc3VsdCA9PT0gSW5maW5pdHkpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgICBsYXN0Q29tcHV0ZWQgPSBjb21wdXRlZDtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gU2h1ZmZsZSBhIGNvbGxlY3Rpb24sIHVzaW5nIHRoZSBtb2Rlcm4gdmVyc2lvbiBvZiB0aGVcbiAgLy8gW0Zpc2hlci1ZYXRlcyBzaHVmZmxlXShodHRwOi8vZW4ud2lraXBlZGlhLm9yZy93aWtpL0Zpc2hlcuKAk1lhdGVzX3NodWZmbGUpLlxuICBfLnNodWZmbGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgc2V0ID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IHNldC5sZW5ndGg7XG4gICAgdmFyIHNodWZmbGVkID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDAsIHJhbmQ7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByYW5kID0gXy5yYW5kb20oMCwgaW5kZXgpO1xuICAgICAgaWYgKHJhbmQgIT09IGluZGV4KSBzaHVmZmxlZFtpbmRleF0gPSBzaHVmZmxlZFtyYW5kXTtcbiAgICAgIHNodWZmbGVkW3JhbmRdID0gc2V0W2luZGV4XTtcbiAgICB9XG4gICAgcmV0dXJuIHNodWZmbGVkO1xuICB9O1xuXG4gIC8vIFNhbXBsZSAqKm4qKiByYW5kb20gdmFsdWVzIGZyb20gYSBjb2xsZWN0aW9uLlxuICAvLyBJZiAqKm4qKiBpcyBub3Qgc3BlY2lmaWVkLCByZXR1cm5zIGEgc2luZ2xlIHJhbmRvbSBlbGVtZW50LlxuICAvLyBUaGUgaW50ZXJuYWwgYGd1YXJkYCBhcmd1bWVudCBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBtYXBgLlxuICBfLnNhbXBsZSA9IGZ1bmN0aW9uKG9iaiwgbiwgZ3VhcmQpIHtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSB7XG4gICAgICBpZiAoIWlzQXJyYXlMaWtlKG9iaikpIG9iaiA9IF8udmFsdWVzKG9iaik7XG4gICAgICByZXR1cm4gb2JqW18ucmFuZG9tKG9iai5sZW5ndGggLSAxKV07XG4gICAgfVxuICAgIHJldHVybiBfLnNodWZmbGUob2JqKS5zbGljZSgwLCBNYXRoLm1heCgwLCBuKSk7XG4gIH07XG5cbiAgLy8gU29ydCB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uIHByb2R1Y2VkIGJ5IGFuIGl0ZXJhdGVlLlxuICBfLnNvcnRCeSA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICByZXR1cm4gXy5wbHVjayhfLm1hcChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgdmFsdWU6IHZhbHVlLFxuICAgICAgICBpbmRleDogaW5kZXgsXG4gICAgICAgIGNyaXRlcmlhOiBpdGVyYXRlZSh2YWx1ZSwgaW5kZXgsIGxpc3QpXG4gICAgICB9O1xuICAgIH0pLnNvcnQoZnVuY3Rpb24obGVmdCwgcmlnaHQpIHtcbiAgICAgIHZhciBhID0gbGVmdC5jcml0ZXJpYTtcbiAgICAgIHZhciBiID0gcmlnaHQuY3JpdGVyaWE7XG4gICAgICBpZiAoYSAhPT0gYikge1xuICAgICAgICBpZiAoYSA+IGIgfHwgYSA9PT0gdm9pZCAwKSByZXR1cm4gMTtcbiAgICAgICAgaWYgKGEgPCBiIHx8IGIgPT09IHZvaWQgMCkgcmV0dXJuIC0xO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGxlZnQuaW5kZXggLSByaWdodC5pbmRleDtcbiAgICB9KSwgJ3ZhbHVlJyk7XG4gIH07XG5cbiAgLy8gQW4gaW50ZXJuYWwgZnVuY3Rpb24gdXNlZCBmb3IgYWdncmVnYXRlIFwiZ3JvdXAgYnlcIiBvcGVyYXRpb25zLlxuICB2YXIgZ3JvdXAgPSBmdW5jdGlvbihiZWhhdmlvcikge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCkge1xuICAgICAgICB2YXIga2V5ID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBvYmopO1xuICAgICAgICBiZWhhdmlvcihyZXN1bHQsIHZhbHVlLCBrZXkpO1xuICAgICAgfSk7XG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gR3JvdXBzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24uIFBhc3MgZWl0aGVyIGEgc3RyaW5nIGF0dHJpYnV0ZVxuICAvLyB0byBncm91cCBieSwgb3IgYSBmdW5jdGlvbiB0aGF0IHJldHVybnMgdGhlIGNyaXRlcmlvbi5cbiAgXy5ncm91cEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgaWYgKF8uaGFzKHJlc3VsdCwga2V5KSkgcmVzdWx0W2tleV0ucHVzaCh2YWx1ZSk7IGVsc2UgcmVzdWx0W2tleV0gPSBbdmFsdWVdO1xuICB9KTtcblxuICAvLyBJbmRleGVzIHRoZSBvYmplY3QncyB2YWx1ZXMgYnkgYSBjcml0ZXJpb24sIHNpbWlsYXIgdG8gYGdyb3VwQnlgLCBidXQgZm9yXG4gIC8vIHdoZW4geW91IGtub3cgdGhhdCB5b3VyIGluZGV4IHZhbHVlcyB3aWxsIGJlIHVuaXF1ZS5cbiAgXy5pbmRleEJ5ID0gZ3JvdXAoZnVuY3Rpb24ocmVzdWx0LCB2YWx1ZSwga2V5KSB7XG4gICAgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgfSk7XG5cbiAgLy8gQ291bnRzIGluc3RhbmNlcyBvZiBhbiBvYmplY3QgdGhhdCBncm91cCBieSBhIGNlcnRhaW4gY3JpdGVyaW9uLiBQYXNzXG4gIC8vIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGUgdG8gY291bnQgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZVxuICAvLyBjcml0ZXJpb24uXG4gIF8uY291bnRCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldKys7IGVsc2UgcmVzdWx0W2tleV0gPSAxO1xuICB9KTtcblxuICAvLyBTYWZlbHkgY3JlYXRlIGEgcmVhbCwgbGl2ZSBhcnJheSBmcm9tIGFueXRoaW5nIGl0ZXJhYmxlLlxuICBfLnRvQXJyYXkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIW9iaikgcmV0dXJuIFtdO1xuICAgIGlmIChfLmlzQXJyYXkob2JqKSkgcmV0dXJuIHNsaWNlLmNhbGwob2JqKTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSkgcmV0dXJuIF8ubWFwKG9iaiwgXy5pZGVudGl0eSk7XG4gICAgcmV0dXJuIF8udmFsdWVzKG9iaik7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBudW1iZXIgb2YgZWxlbWVudHMgaW4gYW4gb2JqZWN0LlxuICBfLnNpemUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiAwO1xuICAgIHJldHVybiBpc0FycmF5TGlrZShvYmopID8gb2JqLmxlbmd0aCA6IF8ua2V5cyhvYmopLmxlbmd0aDtcbiAgfTtcblxuICAvLyBTcGxpdCBhIGNvbGxlY3Rpb24gaW50byB0d28gYXJyYXlzOiBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIHNhdGlzZnkgdGhlIGdpdmVuXG4gIC8vIHByZWRpY2F0ZSwgYW5kIG9uZSB3aG9zZSBlbGVtZW50cyBhbGwgZG8gbm90IHNhdGlzZnkgdGhlIHByZWRpY2F0ZS5cbiAgXy5wYXJ0aXRpb24gPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIHBhc3MgPSBbXSwgZmFpbCA9IFtdO1xuICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBrZXksIG9iaikge1xuICAgICAgKHByZWRpY2F0ZSh2YWx1ZSwga2V5LCBvYmopID8gcGFzcyA6IGZhaWwpLnB1c2godmFsdWUpO1xuICAgIH0pO1xuICAgIHJldHVybiBbcGFzcywgZmFpbF07XG4gIH07XG5cbiAgLy8gQXJyYXkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEdldCB0aGUgZmlyc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgZmlyc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LiBBbGlhc2VkIGFzIGBoZWFkYCBhbmQgYHRha2VgLiBUaGUgKipndWFyZCoqIGNoZWNrXG4gIC8vIGFsbG93cyBpdCB0byB3b3JrIHdpdGggYF8ubWFwYC5cbiAgXy5maXJzdCA9IF8uaGVhZCA9IF8udGFrZSA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVswXTtcbiAgICByZXR1cm4gXy5pbml0aWFsKGFycmF5LCBhcnJheS5sZW5ndGggLSBuKTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGV2ZXJ5dGhpbmcgYnV0IHRoZSBsYXN0IGVudHJ5IG9mIHRoZSBhcnJheS4gRXNwZWNpYWxseSB1c2VmdWwgb25cbiAgLy8gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gYWxsIHRoZSB2YWx1ZXMgaW5cbiAgLy8gdGhlIGFycmF5LCBleGNsdWRpbmcgdGhlIGxhc3QgTi5cbiAgXy5pbml0aWFsID0gZnVuY3Rpb24oYXJyYXksIG4sIGd1YXJkKSB7XG4gICAgcmV0dXJuIHNsaWNlLmNhbGwoYXJyYXksIDAsIE1hdGgubWF4KDAsIGFycmF5Lmxlbmd0aCAtIChuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbikpKTtcbiAgfTtcblxuICAvLyBHZXQgdGhlIGxhc3QgZWxlbWVudCBvZiBhbiBhcnJheS4gUGFzc2luZyAqKm4qKiB3aWxsIHJldHVybiB0aGUgbGFzdCBOXG4gIC8vIHZhbHVlcyBpbiB0aGUgYXJyYXkuXG4gIF8ubGFzdCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIGlmIChhcnJheSA9PSBudWxsKSByZXR1cm4gdm9pZCAwO1xuICAgIGlmIChuID09IG51bGwgfHwgZ3VhcmQpIHJldHVybiBhcnJheVthcnJheS5sZW5ndGggLSAxXTtcbiAgICByZXR1cm4gXy5yZXN0KGFycmF5LCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSBuKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgZmlyc3QgZW50cnkgb2YgdGhlIGFycmF5LiBBbGlhc2VkIGFzIGB0YWlsYCBhbmQgYGRyb3BgLlxuICAvLyBFc3BlY2lhbGx5IHVzZWZ1bCBvbiB0aGUgYXJndW1lbnRzIG9iamVjdC4gUGFzc2luZyBhbiAqKm4qKiB3aWxsIHJldHVyblxuICAvLyB0aGUgcmVzdCBOIHZhbHVlcyBpbiB0aGUgYXJyYXkuXG4gIF8ucmVzdCA9IF8udGFpbCA9IF8uZHJvcCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCBuID09IG51bGwgfHwgZ3VhcmQgPyAxIDogbik7XG4gIH07XG5cbiAgLy8gVHJpbSBvdXQgYWxsIGZhbHN5IHZhbHVlcyBmcm9tIGFuIGFycmF5LlxuICBfLmNvbXBhY3QgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgXy5pZGVudGl0eSk7XG4gIH07XG5cbiAgLy8gSW50ZXJuYWwgaW1wbGVtZW50YXRpb24gb2YgYSByZWN1cnNpdmUgYGZsYXR0ZW5gIGZ1bmN0aW9uLlxuICB2YXIgZmxhdHRlbiA9IGZ1bmN0aW9uKGlucHV0LCBzaGFsbG93LCBzdHJpY3QsIHN0YXJ0SW5kZXgpIHtcbiAgICB2YXIgb3V0cHV0ID0gW10sIGlkeCA9IDA7XG4gICAgZm9yICh2YXIgaSA9IHN0YXJ0SW5kZXggfHwgMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGlucHV0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgdmFsdWUgPSBpbnB1dFtpXTtcbiAgICAgIGlmIChpc0FycmF5TGlrZSh2YWx1ZSkgJiYgKF8uaXNBcnJheSh2YWx1ZSkgfHwgXy5pc0FyZ3VtZW50cyh2YWx1ZSkpKSB7XG4gICAgICAgIC8vZmxhdHRlbiBjdXJyZW50IGxldmVsIG9mIGFycmF5IG9yIGFyZ3VtZW50cyBvYmplY3RcbiAgICAgICAgaWYgKCFzaGFsbG93KSB2YWx1ZSA9IGZsYXR0ZW4odmFsdWUsIHNoYWxsb3csIHN0cmljdCk7XG4gICAgICAgIHZhciBqID0gMCwgbGVuID0gdmFsdWUubGVuZ3RoO1xuICAgICAgICBvdXRwdXQubGVuZ3RoICs9IGxlbjtcbiAgICAgICAgd2hpbGUgKGogPCBsZW4pIHtcbiAgICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWVbaisrXTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmICghc3RyaWN0KSB7XG4gICAgICAgIG91dHB1dFtpZHgrK10gPSB2YWx1ZTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbiAgfTtcblxuICAvLyBGbGF0dGVuIG91dCBhbiBhcnJheSwgZWl0aGVyIHJlY3Vyc2l2ZWx5IChieSBkZWZhdWx0KSwgb3IganVzdCBvbmUgbGV2ZWwuXG4gIF8uZmxhdHRlbiA9IGZ1bmN0aW9uKGFycmF5LCBzaGFsbG93KSB7XG4gICAgcmV0dXJuIGZsYXR0ZW4oYXJyYXksIHNoYWxsb3csIGZhbHNlKTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSB2ZXJzaW9uIG9mIHRoZSBhcnJheSB0aGF0IGRvZXMgbm90IGNvbnRhaW4gdGhlIHNwZWNpZmllZCB2YWx1ZShzKS5cbiAgXy53aXRob3V0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5kaWZmZXJlbmNlKGFycmF5LCBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSkpO1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYSBkdXBsaWNhdGUtZnJlZSB2ZXJzaW9uIG9mIHRoZSBhcnJheS4gSWYgdGhlIGFycmF5IGhhcyBhbHJlYWR5XG4gIC8vIGJlZW4gc29ydGVkLCB5b3UgaGF2ZSB0aGUgb3B0aW9uIG9mIHVzaW5nIGEgZmFzdGVyIGFsZ29yaXRobS5cbiAgLy8gQWxpYXNlZCBhcyBgdW5pcXVlYC5cbiAgXy51bmlxID0gXy51bmlxdWUgPSBmdW5jdGlvbihhcnJheSwgaXNTb3J0ZWQsIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKCFfLmlzQm9vbGVhbihpc1NvcnRlZCkpIHtcbiAgICAgIGNvbnRleHQgPSBpdGVyYXRlZTtcbiAgICAgIGl0ZXJhdGVlID0gaXNTb3J0ZWQ7XG4gICAgICBpc1NvcnRlZCA9IGZhbHNlO1xuICAgIH1cbiAgICBpZiAoaXRlcmF0ZWUgIT0gbnVsbCkgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBzZWVuID0gW107XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gYXJyYXlbaV0sXG4gICAgICAgICAgY29tcHV0ZWQgPSBpdGVyYXRlZSA/IGl0ZXJhdGVlKHZhbHVlLCBpLCBhcnJheSkgOiB2YWx1ZTtcbiAgICAgIGlmIChpc1NvcnRlZCkge1xuICAgICAgICBpZiAoIWkgfHwgc2VlbiAhPT0gY29tcHV0ZWQpIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgICAgc2VlbiA9IGNvbXB1dGVkO1xuICAgICAgfSBlbHNlIGlmIChpdGVyYXRlZSkge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoc2VlbiwgY29tcHV0ZWQpKSB7XG4gICAgICAgICAgc2Vlbi5wdXNoKGNvbXB1dGVkKTtcbiAgICAgICAgICByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIV8uY29udGFpbnMocmVzdWx0LCB2YWx1ZSkpIHtcbiAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFByb2R1Y2UgYW4gYXJyYXkgdGhhdCBjb250YWlucyB0aGUgdW5pb246IGVhY2ggZGlzdGluY3QgZWxlbWVudCBmcm9tIGFsbCBvZlxuICAvLyB0aGUgcGFzc2VkLWluIGFycmF5cy5cbiAgXy51bmlvbiA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuaXEoZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgZXZlcnkgaXRlbSBzaGFyZWQgYmV0d2VlbiBhbGwgdGhlXG4gIC8vIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8uaW50ZXJzZWN0aW9uID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgcmVzdWx0ID0gW107XG4gICAgdmFyIGFyZ3NMZW5ndGggPSBhcmd1bWVudHMubGVuZ3RoO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBpdGVtID0gYXJyYXlbaV07XG4gICAgICBpZiAoXy5jb250YWlucyhyZXN1bHQsIGl0ZW0pKSBjb250aW51ZTtcbiAgICAgIGZvciAodmFyIGogPSAxOyBqIDwgYXJnc0xlbmd0aDsgaisrKSB7XG4gICAgICAgIGlmICghXy5jb250YWlucyhhcmd1bWVudHNbal0sIGl0ZW0pKSBicmVhaztcbiAgICAgIH1cbiAgICAgIGlmIChqID09PSBhcmdzTGVuZ3RoKSByZXN1bHQucHVzaChpdGVtKTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBUYWtlIHRoZSBkaWZmZXJlbmNlIGJldHdlZW4gb25lIGFycmF5IGFuZCBhIG51bWJlciBvZiBvdGhlciBhcnJheXMuXG4gIC8vIE9ubHkgdGhlIGVsZW1lbnRzIHByZXNlbnQgaW4ganVzdCB0aGUgZmlyc3QgYXJyYXkgd2lsbCByZW1haW4uXG4gIF8uZGlmZmVyZW5jZSA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3QgPSBmbGF0dGVuKGFyZ3VtZW50cywgdHJ1ZSwgdHJ1ZSwgMSk7XG4gICAgcmV0dXJuIF8uZmlsdGVyKGFycmF5LCBmdW5jdGlvbih2YWx1ZSl7XG4gICAgICByZXR1cm4gIV8uY29udGFpbnMocmVzdCwgdmFsdWUpO1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIFppcCB0b2dldGhlciBtdWx0aXBsZSBsaXN0cyBpbnRvIGEgc2luZ2xlIGFycmF5IC0tIGVsZW1lbnRzIHRoYXQgc2hhcmVcbiAgLy8gYW4gaW5kZXggZ28gdG9nZXRoZXIuXG4gIF8uemlwID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIF8udW56aXAoYXJndW1lbnRzKTtcbiAgfTtcblxuICAvLyBDb21wbGVtZW50IG9mIF8uemlwLiBVbnppcCBhY2NlcHRzIGFuIGFycmF5IG9mIGFycmF5cyBhbmQgZ3JvdXBzXG4gIC8vIGVhY2ggYXJyYXkncyBlbGVtZW50cyBvbiBzaGFyZWQgaW5kaWNlc1xuICBfLnVuemlwID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICB2YXIgbGVuZ3RoID0gYXJyYXkgJiYgXy5tYXgoYXJyYXksIGdldExlbmd0aCkubGVuZ3RoIHx8IDA7XG4gICAgdmFyIHJlc3VsdCA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICByZXN1bHRbaW5kZXhdID0gXy5wbHVjayhhcnJheSwgaW5kZXgpO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIENvbnZlcnRzIGxpc3RzIGludG8gb2JqZWN0cy4gUGFzcyBlaXRoZXIgYSBzaW5nbGUgYXJyYXkgb2YgYFtrZXksIHZhbHVlXWBcbiAgLy8gcGFpcnMsIG9yIHR3byBwYXJhbGxlbCBhcnJheXMgb2YgdGhlIHNhbWUgbGVuZ3RoIC0tIG9uZSBvZiBrZXlzLCBhbmQgb25lIG9mXG4gIC8vIHRoZSBjb3JyZXNwb25kaW5nIHZhbHVlcy5cbiAgXy5vYmplY3QgPSBmdW5jdGlvbihsaXN0LCB2YWx1ZXMpIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChsaXN0KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAodmFsdWVzKSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldXSA9IHZhbHVlc1tpXTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHJlc3VsdFtsaXN0W2ldWzBdXSA9IGxpc3RbaV1bMV07XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gR2VuZXJhdG9yIGZ1bmN0aW9uIHRvIGNyZWF0ZSB0aGUgZmluZEluZGV4IGFuZCBmaW5kTGFzdEluZGV4IGZ1bmN0aW9uc1xuICBmdW5jdGlvbiBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcihkaXIpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oYXJyYXksIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgICAgcHJlZGljYXRlID0gY2IocHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICAgIHZhciBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpO1xuICAgICAgdmFyIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICBpZiAocHJlZGljYXRlKGFycmF5W2luZGV4XSwgaW5kZXgsIGFycmF5KSkgcmV0dXJuIGluZGV4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBpbmRleCBvbiBhbiBhcnJheS1saWtlIHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcbiAgXy5maW5kSW5kZXggPSBjcmVhdGVQcmVkaWNhdGVJbmRleEZpbmRlcigxKTtcbiAgXy5maW5kTGFzdEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoLTEpO1xuXG4gIC8vIFVzZSBhIGNvbXBhcmF0b3IgZnVuY3Rpb24gdG8gZmlndXJlIG91dCB0aGUgc21hbGxlc3QgaW5kZXggYXQgd2hpY2hcbiAgLy8gYW4gb2JqZWN0IHNob3VsZCBiZSBpbnNlcnRlZCBzbyBhcyB0byBtYWludGFpbiBvcmRlci4gVXNlcyBiaW5hcnkgc2VhcmNoLlxuICBfLnNvcnRlZEluZGV4ID0gZnVuY3Rpb24oYXJyYXksIG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0LCAxKTtcbiAgICB2YXIgdmFsdWUgPSBpdGVyYXRlZShvYmopO1xuICAgIHZhciBsb3cgPSAwLCBoaWdoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICB3aGlsZSAobG93IDwgaGlnaCkge1xuICAgICAgdmFyIG1pZCA9IE1hdGguZmxvb3IoKGxvdyArIGhpZ2gpIC8gMik7XG4gICAgICBpZiAoaXRlcmF0ZWUoYXJyYXlbbWlkXSkgPCB2YWx1ZSkgbG93ID0gbWlkICsgMTsgZWxzZSBoaWdoID0gbWlkO1xuICAgIH1cbiAgICByZXR1cm4gbG93O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGluZGV4T2YgYW5kIGxhc3RJbmRleE9mIGZ1bmN0aW9uc1xuICBmdW5jdGlvbiBjcmVhdGVJbmRleEZpbmRlcihkaXIsIHByZWRpY2F0ZUZpbmQsIHNvcnRlZEluZGV4KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBpdGVtLCBpZHgpIHtcbiAgICAgIHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIGlmICh0eXBlb2YgaWR4ID09ICdudW1iZXInKSB7XG4gICAgICAgIGlmIChkaXIgPiAwKSB7XG4gICAgICAgICAgICBpID0gaWR4ID49IDAgPyBpZHggOiBNYXRoLm1heChpZHggKyBsZW5ndGgsIGkpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGVuZ3RoID0gaWR4ID49IDAgPyBNYXRoLm1pbihpZHggKyAxLCBsZW5ndGgpIDogaWR4ICsgbGVuZ3RoICsgMTtcbiAgICAgICAgfVxuICAgICAgfSBlbHNlIGlmIChzb3J0ZWRJbmRleCAmJiBpZHggJiYgbGVuZ3RoKSB7XG4gICAgICAgIGlkeCA9IHNvcnRlZEluZGV4KGFycmF5LCBpdGVtKTtcbiAgICAgICAgcmV0dXJuIGFycmF5W2lkeF0gPT09IGl0ZW0gPyBpZHggOiAtMTtcbiAgICAgIH1cbiAgICAgIGlmIChpdGVtICE9PSBpdGVtKSB7XG4gICAgICAgIGlkeCA9IHByZWRpY2F0ZUZpbmQoc2xpY2UuY2FsbChhcnJheSwgaSwgbGVuZ3RoKSwgXy5pc05hTik7XG4gICAgICAgIHJldHVybiBpZHggPj0gMCA/IGlkeCArIGkgOiAtMTtcbiAgICAgIH1cbiAgICAgIGZvciAoaWR4ID0gZGlyID4gMCA/IGkgOiBsZW5ndGggLSAxOyBpZHggPj0gMCAmJiBpZHggPCBsZW5ndGg7IGlkeCArPSBkaXIpIHtcbiAgICAgICAgaWYgKGFycmF5W2lkeF0gPT09IGl0ZW0pIHJldHVybiBpZHg7XG4gICAgICB9XG4gICAgICByZXR1cm4gLTE7XG4gICAgfTtcbiAgfVxuXG4gIC8vIFJldHVybiB0aGUgcG9zaXRpb24gb2YgdGhlIGZpcnN0IG9jY3VycmVuY2Ugb2YgYW4gaXRlbSBpbiBhbiBhcnJheSxcbiAgLy8gb3IgLTEgaWYgdGhlIGl0ZW0gaXMgbm90IGluY2x1ZGVkIGluIHRoZSBhcnJheS5cbiAgLy8gSWYgdGhlIGFycmF5IGlzIGxhcmdlIGFuZCBhbHJlYWR5IGluIHNvcnQgb3JkZXIsIHBhc3MgYHRydWVgXG4gIC8vIGZvciAqKmlzU29ydGVkKiogdG8gdXNlIGJpbmFyeSBzZWFyY2guXG4gIF8uaW5kZXhPZiA9IGNyZWF0ZUluZGV4RmluZGVyKDEsIF8uZmluZEluZGV4LCBfLnNvcnRlZEluZGV4KTtcbiAgXy5sYXN0SW5kZXhPZiA9IGNyZWF0ZUluZGV4RmluZGVyKC0xLCBfLmZpbmRMYXN0SW5kZXgpO1xuXG4gIC8vIEdlbmVyYXRlIGFuIGludGVnZXIgQXJyYXkgY29udGFpbmluZyBhbiBhcml0aG1ldGljIHByb2dyZXNzaW9uLiBBIHBvcnQgb2ZcbiAgLy8gdGhlIG5hdGl2ZSBQeXRob24gYHJhbmdlKClgIGZ1bmN0aW9uLiBTZWVcbiAgLy8gW3RoZSBQeXRob24gZG9jdW1lbnRhdGlvbl0oaHR0cDovL2RvY3MucHl0aG9uLm9yZy9saWJyYXJ5L2Z1bmN0aW9ucy5odG1sI3JhbmdlKS5cbiAgXy5yYW5nZSA9IGZ1bmN0aW9uKHN0YXJ0LCBzdG9wLCBzdGVwKSB7XG4gICAgaWYgKHN0b3AgPT0gbnVsbCkge1xuICAgICAgc3RvcCA9IHN0YXJ0IHx8IDA7XG4gICAgICBzdGFydCA9IDA7XG4gICAgfVxuICAgIHN0ZXAgPSBzdGVwIHx8IDE7XG5cbiAgICB2YXIgbGVuZ3RoID0gTWF0aC5tYXgoTWF0aC5jZWlsKChzdG9wIC0gc3RhcnQpIC8gc3RlcCksIDApO1xuICAgIHZhciByYW5nZSA9IEFycmF5KGxlbmd0aCk7XG5cbiAgICBmb3IgKHZhciBpZHggPSAwOyBpZHggPCBsZW5ndGg7IGlkeCsrLCBzdGFydCArPSBzdGVwKSB7XG4gICAgICByYW5nZVtpZHhdID0gc3RhcnQ7XG4gICAgfVxuXG4gICAgcmV0dXJuIHJhbmdlO1xuICB9O1xuXG4gIC8vIEZ1bmN0aW9uIChhaGVtKSBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gRGV0ZXJtaW5lcyB3aGV0aGVyIHRvIGV4ZWN1dGUgYSBmdW5jdGlvbiBhcyBhIGNvbnN0cnVjdG9yXG4gIC8vIG9yIGEgbm9ybWFsIGZ1bmN0aW9uIHdpdGggdGhlIHByb3ZpZGVkIGFyZ3VtZW50c1xuICB2YXIgZXhlY3V0ZUJvdW5kID0gZnVuY3Rpb24oc291cmNlRnVuYywgYm91bmRGdW5jLCBjb250ZXh0LCBjYWxsaW5nQ29udGV4dCwgYXJncykge1xuICAgIGlmICghKGNhbGxpbmdDb250ZXh0IGluc3RhbmNlb2YgYm91bmRGdW5jKSkgcmV0dXJuIHNvdXJjZUZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgdmFyIHNlbGYgPSBiYXNlQ3JlYXRlKHNvdXJjZUZ1bmMucHJvdG90eXBlKTtcbiAgICB2YXIgcmVzdWx0ID0gc291cmNlRnVuYy5hcHBseShzZWxmLCBhcmdzKTtcbiAgICBpZiAoXy5pc09iamVjdChyZXN1bHQpKSByZXR1cm4gcmVzdWx0O1xuICAgIHJldHVybiBzZWxmO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIGZ1bmN0aW9uIGJvdW5kIHRvIGEgZ2l2ZW4gb2JqZWN0IChhc3NpZ25pbmcgYHRoaXNgLCBhbmQgYXJndW1lbnRzLFxuICAvLyBvcHRpb25hbGx5KS4gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYEZ1bmN0aW9uLmJpbmRgIGlmXG4gIC8vIGF2YWlsYWJsZS5cbiAgXy5iaW5kID0gZnVuY3Rpb24oZnVuYywgY29udGV4dCkge1xuICAgIGlmIChuYXRpdmVCaW5kICYmIGZ1bmMuYmluZCA9PT0gbmF0aXZlQmluZCkgcmV0dXJuIG5hdGl2ZUJpbmQuYXBwbHkoZnVuYywgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgICBpZiAoIV8uaXNGdW5jdGlvbihmdW5jKSkgdGhyb3cgbmV3IFR5cGVFcnJvcignQmluZCBtdXN0IGJlIGNhbGxlZCBvbiBhIGZ1bmN0aW9uJyk7XG4gICAgdmFyIGFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMik7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCBjb250ZXh0LCB0aGlzLCBhcmdzLmNvbmNhdChzbGljZS5jYWxsKGFyZ3VtZW50cykpKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBQYXJ0aWFsbHkgYXBwbHkgYSBmdW5jdGlvbiBieSBjcmVhdGluZyBhIHZlcnNpb24gdGhhdCBoYXMgaGFkIHNvbWUgb2YgaXRzXG4gIC8vIGFyZ3VtZW50cyBwcmUtZmlsbGVkLCB3aXRob3V0IGNoYW5naW5nIGl0cyBkeW5hbWljIGB0aGlzYCBjb250ZXh0LiBfIGFjdHNcbiAgLy8gYXMgYSBwbGFjZWhvbGRlciwgYWxsb3dpbmcgYW55IGNvbWJpbmF0aW9uIG9mIGFyZ3VtZW50cyB0byBiZSBwcmUtZmlsbGVkLlxuICBfLnBhcnRpYWwgPSBmdW5jdGlvbihmdW5jKSB7XG4gICAgdmFyIGJvdW5kQXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKTtcbiAgICB2YXIgYm91bmQgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBwb3NpdGlvbiA9IDAsIGxlbmd0aCA9IGJvdW5kQXJncy5sZW5ndGg7XG4gICAgICB2YXIgYXJncyA9IEFycmF5KGxlbmd0aCk7XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGFyZ3NbaV0gPSBib3VuZEFyZ3NbaV0gPT09IF8gPyBhcmd1bWVudHNbcG9zaXRpb24rK10gOiBib3VuZEFyZ3NbaV07XG4gICAgICB9XG4gICAgICB3aGlsZSAocG9zaXRpb24gPCBhcmd1bWVudHMubGVuZ3RoKSBhcmdzLnB1c2goYXJndW1lbnRzW3Bvc2l0aW9uKytdKTtcbiAgICAgIHJldHVybiBleGVjdXRlQm91bmQoZnVuYywgYm91bmQsIHRoaXMsIHRoaXMsIGFyZ3MpO1xuICAgIH07XG4gICAgcmV0dXJuIGJvdW5kO1xuICB9O1xuXG4gIC8vIEJpbmQgYSBudW1iZXIgb2YgYW4gb2JqZWN0J3MgbWV0aG9kcyB0byB0aGF0IG9iamVjdC4gUmVtYWluaW5nIGFyZ3VtZW50c1xuICAvLyBhcmUgdGhlIG1ldGhvZCBuYW1lcyB0byBiZSBib3VuZC4gVXNlZnVsIGZvciBlbnN1cmluZyB0aGF0IGFsbCBjYWxsYmFja3NcbiAgLy8gZGVmaW5lZCBvbiBhbiBvYmplY3QgYmVsb25nIHRvIGl0LlxuICBfLmJpbmRBbGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaSwgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aCwga2V5O1xuICAgIGlmIChsZW5ndGggPD0gMSkgdGhyb3cgbmV3IEVycm9yKCdiaW5kQWxsIG11c3QgYmUgcGFzc2VkIGZ1bmN0aW9uIG5hbWVzJyk7XG4gICAgZm9yIChpID0gMTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBhcmd1bWVudHNbaV07XG4gICAgICBvYmpba2V5XSA9IF8uYmluZChvYmpba2V5XSwgb2JqKTtcbiAgICB9XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBNZW1vaXplIGFuIGV4cGVuc2l2ZSBmdW5jdGlvbiBieSBzdG9yaW5nIGl0cyByZXN1bHRzLlxuICBfLm1lbW9pemUgPSBmdW5jdGlvbihmdW5jLCBoYXNoZXIpIHtcbiAgICB2YXIgbWVtb2l6ZSA9IGZ1bmN0aW9uKGtleSkge1xuICAgICAgdmFyIGNhY2hlID0gbWVtb2l6ZS5jYWNoZTtcbiAgICAgIHZhciBhZGRyZXNzID0gJycgKyAoaGFzaGVyID8gaGFzaGVyLmFwcGx5KHRoaXMsIGFyZ3VtZW50cykgOiBrZXkpO1xuICAgICAgaWYgKCFfLmhhcyhjYWNoZSwgYWRkcmVzcykpIGNhY2hlW2FkZHJlc3NdID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgcmV0dXJuIGNhY2hlW2FkZHJlc3NdO1xuICAgIH07XG4gICAgbWVtb2l6ZS5jYWNoZSA9IHt9O1xuICAgIHJldHVybiBtZW1vaXplO1xuICB9O1xuXG4gIC8vIERlbGF5cyBhIGZ1bmN0aW9uIGZvciB0aGUgZ2l2ZW4gbnVtYmVyIG9mIG1pbGxpc2Vjb25kcywgYW5kIHRoZW4gY2FsbHNcbiAgLy8gaXQgd2l0aCB0aGUgYXJndW1lbnRzIHN1cHBsaWVkLlxuICBfLmRlbGF5ID0gZnVuY3Rpb24oZnVuYywgd2FpdCkge1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHJldHVybiBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG4gICAgICByZXR1cm4gZnVuYy5hcHBseShudWxsLCBhcmdzKTtcbiAgICB9LCB3YWl0KTtcbiAgfTtcblxuICAvLyBEZWZlcnMgYSBmdW5jdGlvbiwgc2NoZWR1bGluZyBpdCB0byBydW4gYWZ0ZXIgdGhlIGN1cnJlbnQgY2FsbCBzdGFjayBoYXNcbiAgLy8gY2xlYXJlZC5cbiAgXy5kZWZlciA9IF8ucGFydGlhbChfLmRlbGF5LCBfLCAxKTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIHdoZW4gaW52b2tlZCwgd2lsbCBvbmx5IGJlIHRyaWdnZXJlZCBhdCBtb3N0IG9uY2VcbiAgLy8gZHVyaW5nIGEgZ2l2ZW4gd2luZG93IG9mIHRpbWUuIE5vcm1hbGx5LCB0aGUgdGhyb3R0bGVkIGZ1bmN0aW9uIHdpbGwgcnVuXG4gIC8vIGFzIG11Y2ggYXMgaXQgY2FuLCB3aXRob3V0IGV2ZXIgZ29pbmcgbW9yZSB0aGFuIG9uY2UgcGVyIGB3YWl0YCBkdXJhdGlvbjtcbiAgLy8gYnV0IGlmIHlvdSdkIGxpa2UgdG8gZGlzYWJsZSB0aGUgZXhlY3V0aW9uIG9uIHRoZSBsZWFkaW5nIGVkZ2UsIHBhc3NcbiAgLy8gYHtsZWFkaW5nOiBmYWxzZX1gLiBUbyBkaXNhYmxlIGV4ZWN1dGlvbiBvbiB0aGUgdHJhaWxpbmcgZWRnZSwgZGl0dG8uXG4gIF8udGhyb3R0bGUgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBvcHRpb25zKSB7XG4gICAgdmFyIGNvbnRleHQsIGFyZ3MsIHJlc3VsdDtcbiAgICB2YXIgdGltZW91dCA9IG51bGw7XG4gICAgdmFyIHByZXZpb3VzID0gMDtcbiAgICBpZiAoIW9wdGlvbnMpIG9wdGlvbnMgPSB7fTtcbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHByZXZpb3VzID0gb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSA/IDAgOiBfLm5vdygpO1xuICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgfTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgbm93ID0gXy5ub3coKTtcbiAgICAgIGlmICghcHJldmlvdXMgJiYgb3B0aW9ucy5sZWFkaW5nID09PSBmYWxzZSkgcHJldmlvdXMgPSBub3c7XG4gICAgICB2YXIgcmVtYWluaW5nID0gd2FpdCAtIChub3cgLSBwcmV2aW91cyk7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICBpZiAocmVtYWluaW5nIDw9IDAgfHwgcmVtYWluaW5nID4gd2FpdCkge1xuICAgICAgICBpZiAodGltZW91dCkge1xuICAgICAgICAgIGNsZWFyVGltZW91dCh0aW1lb3V0KTtcbiAgICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgICBwcmV2aW91cyA9IG5vdztcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgaWYgKCF0aW1lb3V0KSBjb250ZXh0ID0gYXJncyA9IG51bGw7XG4gICAgICB9IGVsc2UgaWYgKCF0aW1lb3V0ICYmIG9wdGlvbnMudHJhaWxpbmcgIT09IGZhbHNlKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCByZW1haW5pbmcpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiwgdGhhdCwgYXMgbG9uZyBhcyBpdCBjb250aW51ZXMgdG8gYmUgaW52b2tlZCwgd2lsbCBub3RcbiAgLy8gYmUgdHJpZ2dlcmVkLiBUaGUgZnVuY3Rpb24gd2lsbCBiZSBjYWxsZWQgYWZ0ZXIgaXQgc3RvcHMgYmVpbmcgY2FsbGVkIGZvclxuICAvLyBOIG1pbGxpc2Vjb25kcy4gSWYgYGltbWVkaWF0ZWAgaXMgcGFzc2VkLCB0cmlnZ2VyIHRoZSBmdW5jdGlvbiBvbiB0aGVcbiAgLy8gbGVhZGluZyBlZGdlLCBpbnN0ZWFkIG9mIHRoZSB0cmFpbGluZy5cbiAgXy5kZWJvdW5jZSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQsIGltbWVkaWF0ZSkge1xuICAgIHZhciB0aW1lb3V0LCBhcmdzLCBjb250ZXh0LCB0aW1lc3RhbXAsIHJlc3VsdDtcblxuICAgIHZhciBsYXRlciA9IGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIGxhc3QgPSBfLm5vdygpIC0gdGltZXN0YW1wO1xuXG4gICAgICBpZiAobGFzdCA8IHdhaXQgJiYgbGFzdCA+PSAwKSB7XG4gICAgICAgIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0IC0gbGFzdCk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB0aW1lb3V0ID0gbnVsbDtcbiAgICAgICAgaWYgKCFpbW1lZGlhdGUpIHtcbiAgICAgICAgICByZXN1bHQgPSBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGNvbnRleHQgPSB0aGlzO1xuICAgICAgYXJncyA9IGFyZ3VtZW50cztcbiAgICAgIHRpbWVzdGFtcCA9IF8ubm93KCk7XG4gICAgICB2YXIgY2FsbE5vdyA9IGltbWVkaWF0ZSAmJiAhdGltZW91dDtcbiAgICAgIGlmICghdGltZW91dCkgdGltZW91dCA9IHNldFRpbWVvdXQobGF0ZXIsIHdhaXQpO1xuICAgICAgaWYgKGNhbGxOb3cpIHtcbiAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfVxuXG4gICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgZnVuY3Rpb24gcGFzc2VkIGFzIGFuIGFyZ3VtZW50IHRvIHRoZSBzZWNvbmQsXG4gIC8vIGFsbG93aW5nIHlvdSB0byBhZGp1c3QgYXJndW1lbnRzLCBydW4gY29kZSBiZWZvcmUgYW5kIGFmdGVyLCBhbmRcbiAgLy8gY29uZGl0aW9uYWxseSBleGVjdXRlIHRoZSBvcmlnaW5hbCBmdW5jdGlvbi5cbiAgXy53cmFwID0gZnVuY3Rpb24oZnVuYywgd3JhcHBlcikge1xuICAgIHJldHVybiBfLnBhcnRpYWwod3JhcHBlciwgZnVuYyk7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIG5lZ2F0ZWQgdmVyc2lvbiBvZiB0aGUgcGFzc2VkLWluIHByZWRpY2F0ZS5cbiAgXy5uZWdhdGUgPSBmdW5jdGlvbihwcmVkaWNhdGUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gIXByZWRpY2F0ZS5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgaXMgdGhlIGNvbXBvc2l0aW9uIG9mIGEgbGlzdCBvZiBmdW5jdGlvbnMsIGVhY2hcbiAgLy8gY29uc3VtaW5nIHRoZSByZXR1cm4gdmFsdWUgb2YgdGhlIGZ1bmN0aW9uIHRoYXQgZm9sbG93cy5cbiAgXy5jb21wb3NlID0gZnVuY3Rpb24oKSB7XG4gICAgdmFyIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgdmFyIHN0YXJ0ID0gYXJncy5sZW5ndGggLSAxO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBpID0gc3RhcnQ7XG4gICAgICB2YXIgcmVzdWx0ID0gYXJnc1tzdGFydF0uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHdoaWxlIChpLS0pIHJlc3VsdCA9IGFyZ3NbaV0uY2FsbCh0aGlzLCByZXN1bHQpO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCBvbiBhbmQgYWZ0ZXIgdGhlIE50aCBjYWxsLlxuICBfLmFmdGVyID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA8IDEpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IHdpbGwgb25seSBiZSBleGVjdXRlZCB1cCB0byAoYnV0IG5vdCBpbmNsdWRpbmcpIHRoZSBOdGggY2FsbC5cbiAgXy5iZWZvcmUgPSBmdW5jdGlvbih0aW1lcywgZnVuYykge1xuICAgIHZhciBtZW1vO1xuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIGlmICgtLXRpbWVzID4gMCkge1xuICAgICAgICBtZW1vID0gZnVuYy5hcHBseSh0aGlzLCBhcmd1bWVudHMpO1xuICAgICAgfVxuICAgICAgaWYgKHRpbWVzIDw9IDEpIGZ1bmMgPSBudWxsO1xuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGV4ZWN1dGVkIGF0IG1vc3Qgb25lIHRpbWUsIG5vIG1hdHRlciBob3dcbiAgLy8gb2Z0ZW4geW91IGNhbGwgaXQuIFVzZWZ1bCBmb3IgbGF6eSBpbml0aWFsaXphdGlvbi5cbiAgXy5vbmNlID0gXy5wYXJ0aWFsKF8uYmVmb3JlLCAyKTtcblxuICAvLyBPYmplY3QgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBLZXlzIGluIElFIDwgOSB0aGF0IHdvbid0IGJlIGl0ZXJhdGVkIGJ5IGBmb3Iga2V5IGluIC4uLmAgYW5kIHRodXMgbWlzc2VkLlxuICB2YXIgaGFzRW51bUJ1ZyA9ICF7dG9TdHJpbmc6IG51bGx9LnByb3BlcnR5SXNFbnVtZXJhYmxlKCd0b1N0cmluZycpO1xuICB2YXIgbm9uRW51bWVyYWJsZVByb3BzID0gWyd2YWx1ZU9mJywgJ2lzUHJvdG90eXBlT2YnLCAndG9TdHJpbmcnLFxuICAgICAgICAgICAgICAgICAgICAgICdwcm9wZXJ0eUlzRW51bWVyYWJsZScsICdoYXNPd25Qcm9wZXJ0eScsICd0b0xvY2FsZVN0cmluZyddO1xuXG4gIGZ1bmN0aW9uIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBrZXlzKSB7XG4gICAgdmFyIG5vbkVudW1JZHggPSBub25FbnVtZXJhYmxlUHJvcHMubGVuZ3RoO1xuICAgIHZhciBjb25zdHJ1Y3RvciA9IG9iai5jb25zdHJ1Y3RvcjtcbiAgICB2YXIgcHJvdG8gPSAoXy5pc0Z1bmN0aW9uKGNvbnN0cnVjdG9yKSAmJiBjb25zdHJ1Y3Rvci5wcm90b3R5cGUpIHx8IE9ialByb3RvO1xuXG4gICAgLy8gQ29uc3RydWN0b3IgaXMgYSBzcGVjaWFsIGNhc2UuXG4gICAgdmFyIHByb3AgPSAnY29uc3RydWN0b3InO1xuICAgIGlmIChfLmhhcyhvYmosIHByb3ApICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSBrZXlzLnB1c2gocHJvcCk7XG5cbiAgICB3aGlsZSAobm9uRW51bUlkeC0tKSB7XG4gICAgICBwcm9wID0gbm9uRW51bWVyYWJsZVByb3BzW25vbkVudW1JZHhdO1xuICAgICAgaWYgKHByb3AgaW4gb2JqICYmIG9ialtwcm9wXSAhPT0gcHJvdG9bcHJvcF0gJiYgIV8uY29udGFpbnMoa2V5cywgcHJvcCkpIHtcbiAgICAgICAga2V5cy5wdXNoKHByb3ApO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIC8vIFJldHJpZXZlIHRoZSBuYW1lcyBvZiBhbiBvYmplY3QncyBvd24gcHJvcGVydGllcy5cbiAgLy8gRGVsZWdhdGVzIHRvICoqRUNNQVNjcmlwdCA1KioncyBuYXRpdmUgYE9iamVjdC5rZXlzYFxuICBfLmtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIGlmIChuYXRpdmVLZXlzKSByZXR1cm4gbmF0aXZlS2V5cyhvYmopO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikgaWYgKF8uaGFzKG9iaiwga2V5KSkga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgYWxsIHRoZSBwcm9wZXJ0eSBuYW1lcyBvZiBhbiBvYmplY3QuXG4gIF8uYWxsS2V5cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gW107XG4gICAgdmFyIGtleXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSBrZXlzLnB1c2goa2V5KTtcbiAgICAvLyBBaGVtLCBJRSA8IDkuXG4gICAgaWYgKGhhc0VudW1CdWcpIGNvbGxlY3ROb25FbnVtUHJvcHMob2JqLCBrZXlzKTtcbiAgICByZXR1cm4ga2V5cztcbiAgfTtcblxuICAvLyBSZXRyaWV2ZSB0aGUgdmFsdWVzIG9mIGFuIG9iamVjdCdzIHByb3BlcnRpZXMuXG4gIF8udmFsdWVzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICB2YXIgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgdmFyIHZhbHVlcyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFsdWVzW2ldID0gb2JqW2tleXNbaV1dO1xuICAgIH1cbiAgICByZXR1cm4gdmFsdWVzO1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIHJlc3VsdHMgb2YgYXBwbHlpbmcgdGhlIGl0ZXJhdGVlIHRvIGVhY2ggZWxlbWVudCBvZiB0aGUgb2JqZWN0XG4gIC8vIEluIGNvbnRyYXN0IHRvIF8ubWFwIGl0IHJldHVybnMgYW4gb2JqZWN0XG4gIF8ubWFwT2JqZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoLFxuICAgICAgICAgIHJlc3VsdHMgPSB7fSxcbiAgICAgICAgICBjdXJyZW50S2V5O1xuICAgICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgICBjdXJyZW50S2V5ID0ga2V5c1tpbmRleF07XG4gICAgICAgIHJlc3VsdHNbY3VycmVudEtleV0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgICB9XG4gICAgICByZXR1cm4gcmVzdWx0cztcbiAgfTtcblxuICAvLyBDb252ZXJ0IGFuIG9iamVjdCBpbnRvIGEgbGlzdCBvZiBgW2tleSwgdmFsdWVdYCBwYWlycy5cbiAgXy5wYWlycyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciBwYWlycyA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcGFpcnNbaV0gPSBba2V5c1tpXSwgb2JqW2tleXNbaV1dXTtcbiAgICB9XG4gICAgcmV0dXJuIHBhaXJzO1xuICB9O1xuXG4gIC8vIEludmVydCB0aGUga2V5cyBhbmQgdmFsdWVzIG9mIGFuIG9iamVjdC4gVGhlIHZhbHVlcyBtdXN0IGJlIHNlcmlhbGl6YWJsZS5cbiAgXy5pbnZlcnQgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgcmVzdWx0ID0ge307XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgcmVzdWx0W29ialtrZXlzW2ldXV0gPSBrZXlzW2ldO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHNvcnRlZCBsaXN0IG9mIHRoZSBmdW5jdGlvbiBuYW1lcyBhdmFpbGFibGUgb24gdGhlIG9iamVjdC5cbiAgLy8gQWxpYXNlZCBhcyBgbWV0aG9kc2BcbiAgXy5mdW5jdGlvbnMgPSBfLm1ldGhvZHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgbmFtZXMgPSBbXTtcbiAgICBmb3IgKHZhciBrZXkgaW4gb2JqKSB7XG4gICAgICBpZiAoXy5pc0Z1bmN0aW9uKG9ialtrZXldKSkgbmFtZXMucHVzaChrZXkpO1xuICAgIH1cbiAgICByZXR1cm4gbmFtZXMuc29ydCgpO1xuICB9O1xuXG4gIC8vIEV4dGVuZCBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgcHJvcGVydGllcyBpbiBwYXNzZWQtaW4gb2JqZWN0KHMpLlxuICBfLmV4dGVuZCA9IGNyZWF0ZUFzc2lnbmVyKF8uYWxsS2V5cyk7XG5cbiAgLy8gQXNzaWducyBhIGdpdmVuIG9iamVjdCB3aXRoIGFsbCB0aGUgb3duIHByb3BlcnRpZXMgaW4gdGhlIHBhc3NlZC1pbiBvYmplY3QocylcbiAgLy8gKGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0dsb2JhbF9PYmplY3RzL09iamVjdC9hc3NpZ24pXG4gIF8uZXh0ZW5kT3duID0gXy5hc3NpZ24gPSBjcmVhdGVBc3NpZ25lcihfLmtleXMpO1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGtleSBvbiBhbiBvYmplY3QgdGhhdCBwYXNzZXMgYSBwcmVkaWNhdGUgdGVzdFxuICBfLmZpbmRLZXkgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgdmFyIGtleXMgPSBfLmtleXMob2JqKSwga2V5O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKHByZWRpY2F0ZShvYmpba2V5XSwga2V5LCBvYmopKSByZXR1cm4ga2V5O1xuICAgIH1cbiAgfTtcblxuICAvLyBSZXR1cm4gYSBjb3B5IG9mIHRoZSBvYmplY3Qgb25seSBjb250YWluaW5nIHRoZSB3aGl0ZWxpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLnBpY2sgPSBmdW5jdGlvbihvYmplY3QsIG9pdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciByZXN1bHQgPSB7fSwgb2JqID0gb2JqZWN0LCBpdGVyYXRlZSwga2V5cztcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiByZXN1bHQ7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihvaXRlcmF0ZWUpKSB7XG4gICAgICBrZXlzID0gXy5hbGxLZXlzKG9iaik7XG4gICAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2Iob2l0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5cyA9IGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHsgcmV0dXJuIGtleSBpbiBvYmo7IH07XG4gICAgICBvYmogPSBPYmplY3Qob2JqKTtcbiAgICB9XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgdmFyIHZhbHVlID0gb2JqW2tleV07XG4gICAgICBpZiAoaXRlcmF0ZWUodmFsdWUsIGtleSwgb2JqKSkgcmVzdWx0W2tleV0gPSB2YWx1ZTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IHdpdGhvdXQgdGhlIGJsYWNrbGlzdGVkIHByb3BlcnRpZXMuXG4gIF8ub21pdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpZiAoXy5pc0Z1bmN0aW9uKGl0ZXJhdGVlKSkge1xuICAgICAgaXRlcmF0ZWUgPSBfLm5lZ2F0ZShpdGVyYXRlZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHZhciBrZXlzID0gXy5tYXAoZmxhdHRlbihhcmd1bWVudHMsIGZhbHNlLCBmYWxzZSwgMSksIFN0cmluZyk7XG4gICAgICBpdGVyYXRlZSA9IGZ1bmN0aW9uKHZhbHVlLCBrZXkpIHtcbiAgICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKGtleXMsIGtleSk7XG4gICAgICB9O1xuICAgIH1cbiAgICByZXR1cm4gXy5waWNrKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpO1xuICB9O1xuXG4gIC8vIEZpbGwgaW4gYSBnaXZlbiBvYmplY3Qgd2l0aCBkZWZhdWx0IHByb3BlcnRpZXMuXG4gIF8uZGVmYXVsdHMgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMsIHRydWUpO1xuXG4gIC8vIENyZWF0ZXMgYW4gb2JqZWN0IHRoYXQgaW5oZXJpdHMgZnJvbSB0aGUgZ2l2ZW4gcHJvdG90eXBlIG9iamVjdC5cbiAgLy8gSWYgYWRkaXRpb25hbCBwcm9wZXJ0aWVzIGFyZSBwcm92aWRlZCB0aGVuIHRoZXkgd2lsbCBiZSBhZGRlZCB0byB0aGVcbiAgLy8gY3JlYXRlZCBvYmplY3QuXG4gIF8uY3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlLCBwcm9wcykge1xuICAgIHZhciByZXN1bHQgPSBiYXNlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgaWYgKHByb3BzKSBfLmV4dGVuZE93bihyZXN1bHQsIHByb3BzKTtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIChzaGFsbG93LWNsb25lZCkgZHVwbGljYXRlIG9mIGFuIG9iamVjdC5cbiAgXy5jbG9uZSA9IGZ1bmN0aW9uKG9iaikge1xuICAgIGlmICghXy5pc09iamVjdChvYmopKSByZXR1cm4gb2JqO1xuICAgIHJldHVybiBfLmlzQXJyYXkob2JqKSA/IG9iai5zbGljZSgpIDogXy5leHRlbmQoe30sIG9iaik7XG4gIH07XG5cbiAgLy8gSW52b2tlcyBpbnRlcmNlcHRvciB3aXRoIHRoZSBvYmosIGFuZCB0aGVuIHJldHVybnMgb2JqLlxuICAvLyBUaGUgcHJpbWFyeSBwdXJwb3NlIG9mIHRoaXMgbWV0aG9kIGlzIHRvIFwidGFwIGludG9cIiBhIG1ldGhvZCBjaGFpbiwgaW5cbiAgLy8gb3JkZXIgdG8gcGVyZm9ybSBvcGVyYXRpb25zIG9uIGludGVybWVkaWF0ZSByZXN1bHRzIHdpdGhpbiB0aGUgY2hhaW4uXG4gIF8udGFwID0gZnVuY3Rpb24ob2JqLCBpbnRlcmNlcHRvcikge1xuICAgIGludGVyY2VwdG9yKG9iaik7XG4gICAgcmV0dXJuIG9iajtcbiAgfTtcblxuICAvLyBSZXR1cm5zIHdoZXRoZXIgYW4gb2JqZWN0IGhhcyBhIGdpdmVuIHNldCBvZiBga2V5OnZhbHVlYCBwYWlycy5cbiAgXy5pc01hdGNoID0gZnVuY3Rpb24ob2JqZWN0LCBhdHRycykge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKGF0dHJzKSwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgaWYgKG9iamVjdCA9PSBudWxsKSByZXR1cm4gIWxlbmd0aDtcbiAgICB2YXIgb2JqID0gT2JqZWN0KG9iamVjdCk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIGtleSA9IGtleXNbaV07XG4gICAgICBpZiAoYXR0cnNba2V5XSAhPT0gb2JqW2tleV0gfHwgIShrZXkgaW4gb2JqKSkgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuXG4gIC8vIEludGVybmFsIHJlY3Vyc2l2ZSBjb21wYXJpc29uIGZ1bmN0aW9uIGZvciBgaXNFcXVhbGAuXG4gIHZhciBlcSA9IGZ1bmN0aW9uKGEsIGIsIGFTdGFjaywgYlN0YWNrKSB7XG4gICAgLy8gSWRlbnRpY2FsIG9iamVjdHMgYXJlIGVxdWFsLiBgMCA9PT0gLTBgLCBidXQgdGhleSBhcmVuJ3QgaWRlbnRpY2FsLlxuICAgIC8vIFNlZSB0aGUgW0hhcm1vbnkgYGVnYWxgIHByb3Bvc2FsXShodHRwOi8vd2lraS5lY21hc2NyaXB0Lm9yZy9kb2t1LnBocD9pZD1oYXJtb255OmVnYWwpLlxuICAgIGlmIChhID09PSBiKSByZXR1cm4gYSAhPT0gMCB8fCAxIC8gYSA9PT0gMSAvIGI7XG4gICAgLy8gQSBzdHJpY3QgY29tcGFyaXNvbiBpcyBuZWNlc3NhcnkgYmVjYXVzZSBgbnVsbCA9PSB1bmRlZmluZWRgLlxuICAgIGlmIChhID09IG51bGwgfHwgYiA9PSBudWxsKSByZXR1cm4gYSA9PT0gYjtcbiAgICAvLyBVbndyYXAgYW55IHdyYXBwZWQgb2JqZWN0cy5cbiAgICBpZiAoYSBpbnN0YW5jZW9mIF8pIGEgPSBhLl93cmFwcGVkO1xuICAgIGlmIChiIGluc3RhbmNlb2YgXykgYiA9IGIuX3dyYXBwZWQ7XG4gICAgLy8gQ29tcGFyZSBgW1tDbGFzc11dYCBuYW1lcy5cbiAgICB2YXIgY2xhc3NOYW1lID0gdG9TdHJpbmcuY2FsbChhKTtcbiAgICBpZiAoY2xhc3NOYW1lICE9PSB0b1N0cmluZy5jYWxsKGIpKSByZXR1cm4gZmFsc2U7XG4gICAgc3dpdGNoIChjbGFzc05hbWUpIHtcbiAgICAgIC8vIFN0cmluZ3MsIG51bWJlcnMsIHJlZ3VsYXIgZXhwcmVzc2lvbnMsIGRhdGVzLCBhbmQgYm9vbGVhbnMgYXJlIGNvbXBhcmVkIGJ5IHZhbHVlLlxuICAgICAgY2FzZSAnW29iamVjdCBSZWdFeHBdJzpcbiAgICAgIC8vIFJlZ0V4cHMgYXJlIGNvZXJjZWQgdG8gc3RyaW5ncyBmb3IgY29tcGFyaXNvbiAoTm90ZTogJycgKyAvYS9pID09PSAnL2EvaScpXG4gICAgICBjYXNlICdbb2JqZWN0IFN0cmluZ10nOlxuICAgICAgICAvLyBQcmltaXRpdmVzIGFuZCB0aGVpciBjb3JyZXNwb25kaW5nIG9iamVjdCB3cmFwcGVycyBhcmUgZXF1aXZhbGVudDsgdGh1cywgYFwiNVwiYCBpc1xuICAgICAgICAvLyBlcXVpdmFsZW50IHRvIGBuZXcgU3RyaW5nKFwiNVwiKWAuXG4gICAgICAgIHJldHVybiAnJyArIGEgPT09ICcnICsgYjtcbiAgICAgIGNhc2UgJ1tvYmplY3QgTnVtYmVyXSc6XG4gICAgICAgIC8vIGBOYU5gcyBhcmUgZXF1aXZhbGVudCwgYnV0IG5vbi1yZWZsZXhpdmUuXG4gICAgICAgIC8vIE9iamVjdChOYU4pIGlzIGVxdWl2YWxlbnQgdG8gTmFOXG4gICAgICAgIGlmICgrYSAhPT0gK2EpIHJldHVybiArYiAhPT0gK2I7XG4gICAgICAgIC8vIEFuIGBlZ2FsYCBjb21wYXJpc29uIGlzIHBlcmZvcm1lZCBmb3Igb3RoZXIgbnVtZXJpYyB2YWx1ZXMuXG4gICAgICAgIHJldHVybiArYSA9PT0gMCA/IDEgLyArYSA9PT0gMSAvIGIgOiArYSA9PT0gK2I7XG4gICAgICBjYXNlICdbb2JqZWN0IERhdGVdJzpcbiAgICAgIGNhc2UgJ1tvYmplY3QgQm9vbGVhbl0nOlxuICAgICAgICAvLyBDb2VyY2UgZGF0ZXMgYW5kIGJvb2xlYW5zIHRvIG51bWVyaWMgcHJpbWl0aXZlIHZhbHVlcy4gRGF0ZXMgYXJlIGNvbXBhcmVkIGJ5IHRoZWlyXG4gICAgICAgIC8vIG1pbGxpc2Vjb25kIHJlcHJlc2VudGF0aW9ucy4gTm90ZSB0aGF0IGludmFsaWQgZGF0ZXMgd2l0aCBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnNcbiAgICAgICAgLy8gb2YgYE5hTmAgYXJlIG5vdCBlcXVpdmFsZW50LlxuICAgICAgICByZXR1cm4gK2EgPT09ICtiO1xuICAgIH1cblxuICAgIHZhciBhcmVBcnJheXMgPSBjbGFzc05hbWUgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gICAgaWYgKCFhcmVBcnJheXMpIHtcbiAgICAgIGlmICh0eXBlb2YgYSAhPSAnb2JqZWN0JyB8fCB0eXBlb2YgYiAhPSAnb2JqZWN0JykgcmV0dXJuIGZhbHNlO1xuXG4gICAgICAvLyBPYmplY3RzIHdpdGggZGlmZmVyZW50IGNvbnN0cnVjdG9ycyBhcmUgbm90IGVxdWl2YWxlbnQsIGJ1dCBgT2JqZWN0YHMgb3IgYEFycmF5YHNcbiAgICAgIC8vIGZyb20gZGlmZmVyZW50IGZyYW1lcyBhcmUuXG4gICAgICB2YXIgYUN0b3IgPSBhLmNvbnN0cnVjdG9yLCBiQ3RvciA9IGIuY29uc3RydWN0b3I7XG4gICAgICBpZiAoYUN0b3IgIT09IGJDdG9yICYmICEoXy5pc0Z1bmN0aW9uKGFDdG9yKSAmJiBhQ3RvciBpbnN0YW5jZW9mIGFDdG9yICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgXy5pc0Z1bmN0aW9uKGJDdG9yKSAmJiBiQ3RvciBpbnN0YW5jZW9mIGJDdG9yKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAmJiAoJ2NvbnN0cnVjdG9yJyBpbiBhICYmICdjb25zdHJ1Y3RvcicgaW4gYikpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBBc3N1bWUgZXF1YWxpdHkgZm9yIGN5Y2xpYyBzdHJ1Y3R1cmVzLiBUaGUgYWxnb3JpdGhtIGZvciBkZXRlY3RpbmcgY3ljbGljXG4gICAgLy8gc3RydWN0dXJlcyBpcyBhZGFwdGVkIGZyb20gRVMgNS4xIHNlY3Rpb24gMTUuMTIuMywgYWJzdHJhY3Qgb3BlcmF0aW9uIGBKT2AuXG5cbiAgICAvLyBJbml0aWFsaXppbmcgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgLy8gSXQncyBkb25lIGhlcmUgc2luY2Ugd2Ugb25seSBuZWVkIHRoZW0gZm9yIG9iamVjdHMgYW5kIGFycmF5cyBjb21wYXJpc29uLlxuICAgIGFTdGFjayA9IGFTdGFjayB8fCBbXTtcbiAgICBiU3RhY2sgPSBiU3RhY2sgfHwgW107XG4gICAgdmFyIGxlbmd0aCA9IGFTdGFjay5sZW5ndGg7XG4gICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAvLyBMaW5lYXIgc2VhcmNoLiBQZXJmb3JtYW5jZSBpcyBpbnZlcnNlbHkgcHJvcG9ydGlvbmFsIHRvIHRoZSBudW1iZXIgb2ZcbiAgICAgIC8vIHVuaXF1ZSBuZXN0ZWQgc3RydWN0dXJlcy5cbiAgICAgIGlmIChhU3RhY2tbbGVuZ3RoXSA9PT0gYSkgcmV0dXJuIGJTdGFja1tsZW5ndGhdID09PSBiO1xuICAgIH1cblxuICAgIC8vIEFkZCB0aGUgZmlyc3Qgb2JqZWN0IHRvIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucHVzaChhKTtcbiAgICBiU3RhY2sucHVzaChiKTtcblxuICAgIC8vIFJlY3Vyc2l2ZWx5IGNvbXBhcmUgb2JqZWN0cyBhbmQgYXJyYXlzLlxuICAgIGlmIChhcmVBcnJheXMpIHtcbiAgICAgIC8vIENvbXBhcmUgYXJyYXkgbGVuZ3RocyB0byBkZXRlcm1pbmUgaWYgYSBkZWVwIGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5LlxuICAgICAgbGVuZ3RoID0gYS5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoICE9PSBiLmxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgLy8gRGVlcCBjb21wYXJlIHRoZSBjb250ZW50cywgaWdub3Jpbmcgbm9uLW51bWVyaWMgcHJvcGVydGllcy5cbiAgICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgICBpZiAoIWVxKGFbbGVuZ3RoXSwgYltsZW5ndGhdLCBhU3RhY2ssIGJTdGFjaykpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9IGVsc2Uge1xuICAgICAgLy8gRGVlcCBjb21wYXJlIG9iamVjdHMuXG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhhKSwga2V5O1xuICAgICAgbGVuZ3RoID0ga2V5cy5sZW5ndGg7XG4gICAgICAvLyBFbnN1cmUgdGhhdCBib3RoIG9iamVjdHMgY29udGFpbiB0aGUgc2FtZSBudW1iZXIgb2YgcHJvcGVydGllcyBiZWZvcmUgY29tcGFyaW5nIGRlZXAgZXF1YWxpdHkuXG4gICAgICBpZiAoXy5rZXlzKGIpLmxlbmd0aCAhPT0gbGVuZ3RoKSByZXR1cm4gZmFsc2U7XG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgLy8gRGVlcCBjb21wYXJlIGVhY2ggbWVtYmVyXG4gICAgICAgIGtleSA9IGtleXNbbGVuZ3RoXTtcbiAgICAgICAgaWYgKCEoXy5oYXMoYiwga2V5KSAmJiBlcShhW2tleV0sIGJba2V5XSwgYVN0YWNrLCBiU3RhY2spKSkgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH1cbiAgICAvLyBSZW1vdmUgdGhlIGZpcnN0IG9iamVjdCBmcm9tIHRoZSBzdGFjayBvZiB0cmF2ZXJzZWQgb2JqZWN0cy5cbiAgICBhU3RhY2sucG9wKCk7XG4gICAgYlN0YWNrLnBvcCgpO1xuICAgIHJldHVybiB0cnVlO1xuICB9O1xuXG4gIC8vIFBlcmZvcm0gYSBkZWVwIGNvbXBhcmlzb24gdG8gY2hlY2sgaWYgdHdvIG9iamVjdHMgYXJlIGVxdWFsLlxuICBfLmlzRXF1YWwgPSBmdW5jdGlvbihhLCBiKSB7XG4gICAgcmV0dXJuIGVxKGEsIGIpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gYXJyYXksIHN0cmluZywgb3Igb2JqZWN0IGVtcHR5P1xuICAvLyBBbiBcImVtcHR5XCIgb2JqZWN0IGhhcyBubyBlbnVtZXJhYmxlIG93bi1wcm9wZXJ0aWVzLlxuICBfLmlzRW1wdHkgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqID09IG51bGwpIHJldHVybiB0cnVlO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopICYmIChfLmlzQXJyYXkob2JqKSB8fCBfLmlzU3RyaW5nKG9iaikgfHwgXy5pc0FyZ3VtZW50cyhvYmopKSkgcmV0dXJuIG9iai5sZW5ndGggPT09IDA7XG4gICAgcmV0dXJuIF8ua2V5cyhvYmopLmxlbmd0aCA9PT0gMDtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgRE9NIGVsZW1lbnQ/XG4gIF8uaXNFbGVtZW50ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuICEhKG9iaiAmJiBvYmoubm9kZVR5cGUgPT09IDEpO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgYW4gYXJyYXk/XG4gIC8vIERlbGVnYXRlcyB0byBFQ01BNSdzIG5hdGl2ZSBBcnJheS5pc0FycmF5XG4gIF8uaXNBcnJheSA9IG5hdGl2ZUlzQXJyYXkgfHwgZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQXJyYXldJztcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhcmlhYmxlIGFuIG9iamVjdD9cbiAgXy5pc09iamVjdCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciB0eXBlID0gdHlwZW9mIG9iajtcbiAgICByZXR1cm4gdHlwZSA9PT0gJ2Z1bmN0aW9uJyB8fCB0eXBlID09PSAnb2JqZWN0JyAmJiAhIW9iajtcbiAgfTtcblxuICAvLyBBZGQgc29tZSBpc1R5cGUgbWV0aG9kczogaXNBcmd1bWVudHMsIGlzRnVuY3Rpb24sIGlzU3RyaW5nLCBpc051bWJlciwgaXNEYXRlLCBpc1JlZ0V4cCwgaXNFcnJvci5cbiAgXy5lYWNoKFsnQXJndW1lbnRzJywgJ0Z1bmN0aW9uJywgJ1N0cmluZycsICdOdW1iZXInLCAnRGF0ZScsICdSZWdFeHAnLCAnRXJyb3InXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIF9bJ2lzJyArIG5hbWVdID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCAnICsgbmFtZSArICddJztcbiAgICB9O1xuICB9KTtcblxuICAvLyBEZWZpbmUgYSBmYWxsYmFjayB2ZXJzaW9uIG9mIHRoZSBtZXRob2QgaW4gYnJvd3NlcnMgKGFoZW0sIElFIDwgOSksIHdoZXJlXG4gIC8vIHRoZXJlIGlzbid0IGFueSBpbnNwZWN0YWJsZSBcIkFyZ3VtZW50c1wiIHR5cGUuXG4gIGlmICghXy5pc0FyZ3VtZW50cyhhcmd1bWVudHMpKSB7XG4gICAgXy5pc0FyZ3VtZW50cyA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIF8uaGFzKG9iaiwgJ2NhbGxlZScpO1xuICAgIH07XG4gIH1cblxuICAvLyBPcHRpbWl6ZSBgaXNGdW5jdGlvbmAgaWYgYXBwcm9wcmlhdGUuIFdvcmsgYXJvdW5kIHNvbWUgdHlwZW9mIGJ1Z3MgaW4gb2xkIHY4LFxuICAvLyBJRSAxMSAoIzE2MjEpLCBhbmQgaW4gU2FmYXJpIDggKCMxOTI5KS5cbiAgaWYgKHR5cGVvZiAvLi8gIT0gJ2Z1bmN0aW9uJyAmJiB0eXBlb2YgSW50OEFycmF5ICE9ICdvYmplY3QnKSB7XG4gICAgXy5pc0Z1bmN0aW9uID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gdHlwZW9mIG9iaiA9PSAnZnVuY3Rpb24nIHx8IGZhbHNlO1xuICAgIH07XG4gIH1cblxuICAvLyBJcyBhIGdpdmVuIG9iamVjdCBhIGZpbml0ZSBudW1iZXI/XG4gIF8uaXNGaW5pdGUgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gaXNGaW5pdGUob2JqKSAmJiAhaXNOYU4ocGFyc2VGbG9hdChvYmopKTtcbiAgfTtcblxuICAvLyBJcyB0aGUgZ2l2ZW4gdmFsdWUgYE5hTmA/IChOYU4gaXMgdGhlIG9ubHkgbnVtYmVyIHdoaWNoIGRvZXMgbm90IGVxdWFsIGl0c2VsZikuXG4gIF8uaXNOYU4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gXy5pc051bWJlcihvYmopICYmIG9iaiAhPT0gK29iajtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGEgYm9vbGVhbj9cbiAgXy5pc0Jvb2xlYW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB0cnVlIHx8IG9iaiA9PT0gZmFsc2UgfHwgdG9TdHJpbmcuY2FsbChvYmopID09PSAnW29iamVjdCBCb29sZWFuXSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBlcXVhbCB0byBudWxsP1xuICBfLmlzTnVsbCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT09IG51bGw7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSB1bmRlZmluZWQ/XG4gIF8uaXNVbmRlZmluZWQgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSB2b2lkIDA7XG4gIH07XG5cbiAgLy8gU2hvcnRjdXQgZnVuY3Rpb24gZm9yIGNoZWNraW5nIGlmIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBwcm9wZXJ0eSBkaXJlY3RseVxuICAvLyBvbiBpdHNlbGYgKGluIG90aGVyIHdvcmRzLCBub3Qgb24gYSBwcm90b3R5cGUpLlxuICBfLmhhcyA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIG9iaiAhPSBudWxsICYmIGhhc093blByb3BlcnR5LmNhbGwob2JqLCBrZXkpO1xuICB9O1xuXG4gIC8vIFV0aWxpdHkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gUnVuIFVuZGVyc2NvcmUuanMgaW4gKm5vQ29uZmxpY3QqIG1vZGUsIHJldHVybmluZyB0aGUgYF9gIHZhcmlhYmxlIHRvIGl0c1xuICAvLyBwcmV2aW91cyBvd25lci4gUmV0dXJucyBhIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubm9Db25mbGljdCA9IGZ1bmN0aW9uKCkge1xuICAgIHJvb3QuXyA9IHByZXZpb3VzVW5kZXJzY29yZTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyBLZWVwIHRoZSBpZGVudGl0eSBmdW5jdGlvbiBhcm91bmQgZm9yIGRlZmF1bHQgaXRlcmF0ZWVzLlxuICBfLmlkZW50aXR5ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gdmFsdWU7XG4gIH07XG5cbiAgLy8gUHJlZGljYXRlLWdlbmVyYXRpbmcgZnVuY3Rpb25zLiBPZnRlbiB1c2VmdWwgb3V0c2lkZSBvZiBVbmRlcnNjb3JlLlxuICBfLmNvbnN0YW50ID0gZnVuY3Rpb24odmFsdWUpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfTtcbiAgfTtcblxuICBfLm5vb3AgPSBmdW5jdGlvbigpe307XG5cbiAgXy5wcm9wZXJ0eSA9IHByb3BlcnR5O1xuXG4gIC8vIEdlbmVyYXRlcyBhIGZ1bmN0aW9uIGZvciBhIGdpdmVuIG9iamVjdCB0aGF0IHJldHVybnMgYSBnaXZlbiBwcm9wZXJ0eS5cbiAgXy5wcm9wZXJ0eU9mID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PSBudWxsID8gZnVuY3Rpb24oKXt9IDogZnVuY3Rpb24oa2V5KSB7XG4gICAgICByZXR1cm4gb2JqW2tleV07XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgcHJlZGljYXRlIGZvciBjaGVja2luZyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2ZcbiAgLy8gYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ubWF0Y2hlciA9IF8ubWF0Y2hlcyA9IGZ1bmN0aW9uKGF0dHJzKSB7XG4gICAgYXR0cnMgPSBfLmV4dGVuZE93bih7fSwgYXR0cnMpO1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmlzTWF0Y2gob2JqLCBhdHRycyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSdW4gYSBmdW5jdGlvbiAqKm4qKiB0aW1lcy5cbiAgXy50aW1lcyA9IGZ1bmN0aW9uKG4sIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIGFjY3VtID0gQXJyYXkoTWF0aC5tYXgoMCwgbikpO1xuICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuOyBpKyspIGFjY3VtW2ldID0gaXRlcmF0ZWUoaSk7XG4gICAgcmV0dXJuIGFjY3VtO1xuICB9O1xuXG4gIC8vIFJldHVybiBhIHJhbmRvbSBpbnRlZ2VyIGJldHdlZW4gbWluIGFuZCBtYXggKGluY2x1c2l2ZSkuXG4gIF8ucmFuZG9tID0gZnVuY3Rpb24obWluLCBtYXgpIHtcbiAgICBpZiAobWF4ID09IG51bGwpIHtcbiAgICAgIG1heCA9IG1pbjtcbiAgICAgIG1pbiA9IDA7XG4gICAgfVxuICAgIHJldHVybiBtaW4gKyBNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiAobWF4IC0gbWluICsgMSkpO1xuICB9O1xuXG4gIC8vIEEgKHBvc3NpYmx5IGZhc3Rlcikgd2F5IHRvIGdldCB0aGUgY3VycmVudCB0aW1lc3RhbXAgYXMgYW4gaW50ZWdlci5cbiAgXy5ub3cgPSBEYXRlLm5vdyB8fCBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH07XG5cbiAgIC8vIExpc3Qgb2YgSFRNTCBlbnRpdGllcyBmb3IgZXNjYXBpbmcuXG4gIHZhciBlc2NhcGVNYXAgPSB7XG4gICAgJyYnOiAnJmFtcDsnLFxuICAgICc8JzogJyZsdDsnLFxuICAgICc+JzogJyZndDsnLFxuICAgICdcIic6ICcmcXVvdDsnLFxuICAgIFwiJ1wiOiAnJiN4Mjc7JyxcbiAgICAnYCc6ICcmI3g2MDsnXG4gIH07XG4gIHZhciB1bmVzY2FwZU1hcCA9IF8uaW52ZXJ0KGVzY2FwZU1hcCk7XG5cbiAgLy8gRnVuY3Rpb25zIGZvciBlc2NhcGluZyBhbmQgdW5lc2NhcGluZyBzdHJpbmdzIHRvL2Zyb20gSFRNTCBpbnRlcnBvbGF0aW9uLlxuICB2YXIgY3JlYXRlRXNjYXBlciA9IGZ1bmN0aW9uKG1hcCkge1xuICAgIHZhciBlc2NhcGVyID0gZnVuY3Rpb24obWF0Y2gpIHtcbiAgICAgIHJldHVybiBtYXBbbWF0Y2hdO1xuICAgIH07XG4gICAgLy8gUmVnZXhlcyBmb3IgaWRlbnRpZnlpbmcgYSBrZXkgdGhhdCBuZWVkcyB0byBiZSBlc2NhcGVkXG4gICAgdmFyIHNvdXJjZSA9ICcoPzonICsgXy5rZXlzKG1hcCkuam9pbignfCcpICsgJyknO1xuICAgIHZhciB0ZXN0UmVnZXhwID0gUmVnRXhwKHNvdXJjZSk7XG4gICAgdmFyIHJlcGxhY2VSZWdleHAgPSBSZWdFeHAoc291cmNlLCAnZycpO1xuICAgIHJldHVybiBmdW5jdGlvbihzdHJpbmcpIHtcbiAgICAgIHN0cmluZyA9IHN0cmluZyA9PSBudWxsID8gJycgOiAnJyArIHN0cmluZztcbiAgICAgIHJldHVybiB0ZXN0UmVnZXhwLnRlc3Qoc3RyaW5nKSA/IHN0cmluZy5yZXBsYWNlKHJlcGxhY2VSZWdleHAsIGVzY2FwZXIpIDogc3RyaW5nO1xuICAgIH07XG4gIH07XG4gIF8uZXNjYXBlID0gY3JlYXRlRXNjYXBlcihlc2NhcGVNYXApO1xuICBfLnVuZXNjYXBlID0gY3JlYXRlRXNjYXBlcih1bmVzY2FwZU1hcCk7XG5cbiAgLy8gSWYgdGhlIHZhbHVlIG9mIHRoZSBuYW1lZCBgcHJvcGVydHlgIGlzIGEgZnVuY3Rpb24gdGhlbiBpbnZva2UgaXQgd2l0aCB0aGVcbiAgLy8gYG9iamVjdGAgYXMgY29udGV4dDsgb3RoZXJ3aXNlLCByZXR1cm4gaXQuXG4gIF8ucmVzdWx0ID0gZnVuY3Rpb24ob2JqZWN0LCBwcm9wZXJ0eSwgZmFsbGJhY2spIHtcbiAgICB2YXIgdmFsdWUgPSBvYmplY3QgPT0gbnVsbCA/IHZvaWQgMCA6IG9iamVjdFtwcm9wZXJ0eV07XG4gICAgaWYgKHZhbHVlID09PSB2b2lkIDApIHtcbiAgICAgIHZhbHVlID0gZmFsbGJhY2s7XG4gICAgfVxuICAgIHJldHVybiBfLmlzRnVuY3Rpb24odmFsdWUpID8gdmFsdWUuY2FsbChvYmplY3QpIDogdmFsdWU7XG4gIH07XG5cbiAgLy8gR2VuZXJhdGUgYSB1bmlxdWUgaW50ZWdlciBpZCAodW5pcXVlIHdpdGhpbiB0aGUgZW50aXJlIGNsaWVudCBzZXNzaW9uKS5cbiAgLy8gVXNlZnVsIGZvciB0ZW1wb3JhcnkgRE9NIGlkcy5cbiAgdmFyIGlkQ291bnRlciA9IDA7XG4gIF8udW5pcXVlSWQgPSBmdW5jdGlvbihwcmVmaXgpIHtcbiAgICB2YXIgaWQgPSArK2lkQ291bnRlciArICcnO1xuICAgIHJldHVybiBwcmVmaXggPyBwcmVmaXggKyBpZCA6IGlkO1xuICB9O1xuXG4gIC8vIEJ5IGRlZmF1bHQsIFVuZGVyc2NvcmUgdXNlcyBFUkItc3R5bGUgdGVtcGxhdGUgZGVsaW1pdGVycywgY2hhbmdlIHRoZVxuICAvLyBmb2xsb3dpbmcgdGVtcGxhdGUgc2V0dGluZ3MgdG8gdXNlIGFsdGVybmF0aXZlIGRlbGltaXRlcnMuXG4gIF8udGVtcGxhdGVTZXR0aW5ncyA9IHtcbiAgICBldmFsdWF0ZSAgICA6IC88JShbXFxzXFxTXSs/KSU+L2csXG4gICAgaW50ZXJwb2xhdGUgOiAvPCU9KFtcXHNcXFNdKz8pJT4vZyxcbiAgICBlc2NhcGUgICAgICA6IC88JS0oW1xcc1xcU10rPyklPi9nXG4gIH07XG5cbiAgLy8gV2hlbiBjdXN0b21pemluZyBgdGVtcGxhdGVTZXR0aW5nc2AsIGlmIHlvdSBkb24ndCB3YW50IHRvIGRlZmluZSBhblxuICAvLyBpbnRlcnBvbGF0aW9uLCBldmFsdWF0aW9uIG9yIGVzY2FwaW5nIHJlZ2V4LCB3ZSBuZWVkIG9uZSB0aGF0IGlzXG4gIC8vIGd1YXJhbnRlZWQgbm90IHRvIG1hdGNoLlxuICB2YXIgbm9NYXRjaCA9IC8oLileLztcblxuICAvLyBDZXJ0YWluIGNoYXJhY3RlcnMgbmVlZCB0byBiZSBlc2NhcGVkIHNvIHRoYXQgdGhleSBjYW4gYmUgcHV0IGludG8gYVxuICAvLyBzdHJpbmcgbGl0ZXJhbC5cbiAgdmFyIGVzY2FwZXMgPSB7XG4gICAgXCInXCI6ICAgICAgXCInXCIsXG4gICAgJ1xcXFwnOiAgICAgJ1xcXFwnLFxuICAgICdcXHInOiAgICAgJ3InLFxuICAgICdcXG4nOiAgICAgJ24nLFxuICAgICdcXHUyMDI4JzogJ3UyMDI4JyxcbiAgICAnXFx1MjAyOSc6ICd1MjAyOSdcbiAgfTtcblxuICB2YXIgZXNjYXBlciA9IC9cXFxcfCd8XFxyfFxcbnxcXHUyMDI4fFxcdTIwMjkvZztcblxuICB2YXIgZXNjYXBlQ2hhciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgcmV0dXJuICdcXFxcJyArIGVzY2FwZXNbbWF0Y2hdO1xuICB9O1xuXG4gIC8vIEphdmFTY3JpcHQgbWljcm8tdGVtcGxhdGluZywgc2ltaWxhciB0byBKb2huIFJlc2lnJ3MgaW1wbGVtZW50YXRpb24uXG4gIC8vIFVuZGVyc2NvcmUgdGVtcGxhdGluZyBoYW5kbGVzIGFyYml0cmFyeSBkZWxpbWl0ZXJzLCBwcmVzZXJ2ZXMgd2hpdGVzcGFjZSxcbiAgLy8gYW5kIGNvcnJlY3RseSBlc2NhcGVzIHF1b3RlcyB3aXRoaW4gaW50ZXJwb2xhdGVkIGNvZGUuXG4gIC8vIE5COiBgb2xkU2V0dGluZ3NgIG9ubHkgZXhpc3RzIGZvciBiYWNrd2FyZHMgY29tcGF0aWJpbGl0eS5cbiAgXy50ZW1wbGF0ZSA9IGZ1bmN0aW9uKHRleHQsIHNldHRpbmdzLCBvbGRTZXR0aW5ncykge1xuICAgIGlmICghc2V0dGluZ3MgJiYgb2xkU2V0dGluZ3MpIHNldHRpbmdzID0gb2xkU2V0dGluZ3M7XG4gICAgc2V0dGluZ3MgPSBfLmRlZmF1bHRzKHt9LCBzZXR0aW5ncywgXy50ZW1wbGF0ZVNldHRpbmdzKTtcblxuICAgIC8vIENvbWJpbmUgZGVsaW1pdGVycyBpbnRvIG9uZSByZWd1bGFyIGV4cHJlc3Npb24gdmlhIGFsdGVybmF0aW9uLlxuICAgIHZhciBtYXRjaGVyID0gUmVnRXhwKFtcbiAgICAgIChzZXR0aW5ncy5lc2NhcGUgfHwgbm9NYXRjaCkuc291cmNlLFxuICAgICAgKHNldHRpbmdzLmludGVycG9sYXRlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5ldmFsdWF0ZSB8fCBub01hdGNoKS5zb3VyY2VcbiAgICBdLmpvaW4oJ3wnKSArICd8JCcsICdnJyk7XG5cbiAgICAvLyBDb21waWxlIHRoZSB0ZW1wbGF0ZSBzb3VyY2UsIGVzY2FwaW5nIHN0cmluZyBsaXRlcmFscyBhcHByb3ByaWF0ZWx5LlxuICAgIHZhciBpbmRleCA9IDA7XG4gICAgdmFyIHNvdXJjZSA9IFwiX19wKz0nXCI7XG4gICAgdGV4dC5yZXBsYWNlKG1hdGNoZXIsIGZ1bmN0aW9uKG1hdGNoLCBlc2NhcGUsIGludGVycG9sYXRlLCBldmFsdWF0ZSwgb2Zmc2V0KSB7XG4gICAgICBzb3VyY2UgKz0gdGV4dC5zbGljZShpbmRleCwgb2Zmc2V0KS5yZXBsYWNlKGVzY2FwZXIsIGVzY2FwZUNoYXIpO1xuICAgICAgaW5kZXggPSBvZmZzZXQgKyBtYXRjaC5sZW5ndGg7XG5cbiAgICAgIGlmIChlc2NhcGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBlc2NhcGUgKyBcIikpPT1udWxsPycnOl8uZXNjYXBlKF9fdCkpK1xcbidcIjtcbiAgICAgIH0gZWxzZSBpZiAoaW50ZXJwb2xhdGUpIHtcbiAgICAgICAgc291cmNlICs9IFwiJytcXG4oKF9fdD0oXCIgKyBpbnRlcnBvbGF0ZSArIFwiKSk9PW51bGw/Jyc6X190KStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGV2YWx1YXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIic7XFxuXCIgKyBldmFsdWF0ZSArIFwiXFxuX19wKz0nXCI7XG4gICAgICB9XG5cbiAgICAgIC8vIEFkb2JlIFZNcyBuZWVkIHRoZSBtYXRjaCByZXR1cm5lZCB0byBwcm9kdWNlIHRoZSBjb3JyZWN0IG9mZmVzdC5cbiAgICAgIHJldHVybiBtYXRjaDtcbiAgICB9KTtcbiAgICBzb3VyY2UgKz0gXCInO1xcblwiO1xuXG4gICAgLy8gSWYgYSB2YXJpYWJsZSBpcyBub3Qgc3BlY2lmaWVkLCBwbGFjZSBkYXRhIHZhbHVlcyBpbiBsb2NhbCBzY29wZS5cbiAgICBpZiAoIXNldHRpbmdzLnZhcmlhYmxlKSBzb3VyY2UgPSAnd2l0aChvYmp8fHt9KXtcXG4nICsgc291cmNlICsgJ31cXG4nO1xuXG4gICAgc291cmNlID0gXCJ2YXIgX190LF9fcD0nJyxfX2o9QXJyYXkucHJvdG90eXBlLmpvaW4sXCIgK1xuICAgICAgXCJwcmludD1mdW5jdGlvbigpe19fcCs9X19qLmNhbGwoYXJndW1lbnRzLCcnKTt9O1xcblwiICtcbiAgICAgIHNvdXJjZSArICdyZXR1cm4gX19wO1xcbic7XG5cbiAgICB0cnkge1xuICAgICAgdmFyIHJlbmRlciA9IG5ldyBGdW5jdGlvbihzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJywgJ18nLCBzb3VyY2UpO1xuICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgIGUuc291cmNlID0gc291cmNlO1xuICAgICAgdGhyb3cgZTtcbiAgICB9XG5cbiAgICB2YXIgdGVtcGxhdGUgPSBmdW5jdGlvbihkYXRhKSB7XG4gICAgICByZXR1cm4gcmVuZGVyLmNhbGwodGhpcywgZGF0YSwgXyk7XG4gICAgfTtcblxuICAgIC8vIFByb3ZpZGUgdGhlIGNvbXBpbGVkIHNvdXJjZSBhcyBhIGNvbnZlbmllbmNlIGZvciBwcmVjb21waWxhdGlvbi5cbiAgICB2YXIgYXJndW1lbnQgPSBzZXR0aW5ncy52YXJpYWJsZSB8fCAnb2JqJztcbiAgICB0ZW1wbGF0ZS5zb3VyY2UgPSAnZnVuY3Rpb24oJyArIGFyZ3VtZW50ICsgJyl7XFxuJyArIHNvdXJjZSArICd9JztcblxuICAgIHJldHVybiB0ZW1wbGF0ZTtcbiAgfTtcblxuICAvLyBBZGQgYSBcImNoYWluXCIgZnVuY3Rpb24uIFN0YXJ0IGNoYWluaW5nIGEgd3JhcHBlZCBVbmRlcnNjb3JlIG9iamVjdC5cbiAgXy5jaGFpbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBpbnN0YW5jZSA9IF8ob2JqKTtcbiAgICBpbnN0YW5jZS5fY2hhaW4gPSB0cnVlO1xuICAgIHJldHVybiBpbnN0YW5jZTtcbiAgfTtcblxuICAvLyBPT1BcbiAgLy8gLS0tLS0tLS0tLS0tLS0tXG4gIC8vIElmIFVuZGVyc2NvcmUgaXMgY2FsbGVkIGFzIGEgZnVuY3Rpb24sIGl0IHJldHVybnMgYSB3cmFwcGVkIG9iamVjdCB0aGF0XG4gIC8vIGNhbiBiZSB1c2VkIE9PLXN0eWxlLiBUaGlzIHdyYXBwZXIgaG9sZHMgYWx0ZXJlZCB2ZXJzaW9ucyBvZiBhbGwgdGhlXG4gIC8vIHVuZGVyc2NvcmUgZnVuY3Rpb25zLiBXcmFwcGVkIG9iamVjdHMgbWF5IGJlIGNoYWluZWQuXG5cbiAgLy8gSGVscGVyIGZ1bmN0aW9uIHRvIGNvbnRpbnVlIGNoYWluaW5nIGludGVybWVkaWF0ZSByZXN1bHRzLlxuICB2YXIgcmVzdWx0ID0gZnVuY3Rpb24oaW5zdGFuY2UsIG9iaikge1xuICAgIHJldHVybiBpbnN0YW5jZS5fY2hhaW4gPyBfKG9iaikuY2hhaW4oKSA6IG9iajtcbiAgfTtcblxuICAvLyBBZGQgeW91ciBvd24gY3VzdG9tIGZ1bmN0aW9ucyB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8ubWl4aW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICBfLmVhY2goXy5mdW5jdGlvbnMob2JqKSwgZnVuY3Rpb24obmFtZSkge1xuICAgICAgdmFyIGZ1bmMgPSBfW25hbWVdID0gb2JqW25hbWVdO1xuICAgICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIGFyZ3MgPSBbdGhpcy5fd3JhcHBlZF07XG4gICAgICAgIHB1c2guYXBwbHkoYXJncywgYXJndW1lbnRzKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBmdW5jLmFwcGx5KF8sIGFyZ3MpKTtcbiAgICAgIH07XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQWRkIGFsbCBvZiB0aGUgVW5kZXJzY29yZSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIgb2JqZWN0LlxuICBfLm1peGluKF8pO1xuXG4gIC8vIEFkZCBhbGwgbXV0YXRvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ3BvcCcsICdwdXNoJywgJ3JldmVyc2UnLCAnc2hpZnQnLCAnc29ydCcsICdzcGxpY2UnLCAndW5zaGlmdCddLCBmdW5jdGlvbihuYW1lKSB7XG4gICAgdmFyIG1ldGhvZCA9IEFycmF5UHJvdG9bbmFtZV07XG4gICAgXy5wcm90b3R5cGVbbmFtZV0gPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBvYmogPSB0aGlzLl93cmFwcGVkO1xuICAgICAgbWV0aG9kLmFwcGx5KG9iaiwgYXJndW1lbnRzKTtcbiAgICAgIGlmICgobmFtZSA9PT0gJ3NoaWZ0JyB8fCBuYW1lID09PSAnc3BsaWNlJykgJiYgb2JqLmxlbmd0aCA9PT0gMCkgZGVsZXRlIG9ialswXTtcbiAgICAgIHJldHVybiByZXN1bHQodGhpcywgb2JqKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBBZGQgYWxsIGFjY2Vzc29yIEFycmF5IGZ1bmN0aW9ucyB0byB0aGUgd3JhcHBlci5cbiAgXy5lYWNoKFsnY29uY2F0JywgJ2pvaW4nLCAnc2xpY2UnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG1ldGhvZC5hcHBseSh0aGlzLl93cmFwcGVkLCBhcmd1bWVudHMpKTtcbiAgICB9O1xuICB9KTtcblxuICAvLyBFeHRyYWN0cyB0aGUgcmVzdWx0IGZyb20gYSB3cmFwcGVkIGFuZCBjaGFpbmVkIG9iamVjdC5cbiAgXy5wcm90b3R5cGUudmFsdWUgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gdGhpcy5fd3JhcHBlZDtcbiAgfTtcblxuICAvLyBQcm92aWRlIHVud3JhcHBpbmcgcHJveHkgZm9yIHNvbWUgbWV0aG9kcyB1c2VkIGluIGVuZ2luZSBvcGVyYXRpb25zXG4gIC8vIHN1Y2ggYXMgYXJpdGhtZXRpYyBhbmQgSlNPTiBzdHJpbmdpZmljYXRpb24uXG4gIF8ucHJvdG90eXBlLnZhbHVlT2YgPSBfLnByb3RvdHlwZS50b0pTT04gPSBfLnByb3RvdHlwZS52YWx1ZTtcblxuICBfLnByb3RvdHlwZS50b1N0cmluZyA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiAnJyArIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gQU1EIHJlZ2lzdHJhdGlvbiBoYXBwZW5zIGF0IHRoZSBlbmQgZm9yIGNvbXBhdGliaWxpdHkgd2l0aCBBTUQgbG9hZGVyc1xuICAvLyB0aGF0IG1heSBub3QgZW5mb3JjZSBuZXh0LXR1cm4gc2VtYW50aWNzIG9uIG1vZHVsZXMuIEV2ZW4gdGhvdWdoIGdlbmVyYWxcbiAgLy8gcHJhY3RpY2UgZm9yIEFNRCByZWdpc3RyYXRpb24gaXMgdG8gYmUgYW5vbnltb3VzLCB1bmRlcnNjb3JlIHJlZ2lzdGVyc1xuICAvLyBhcyBhIG5hbWVkIG1vZHVsZSBiZWNhdXNlLCBsaWtlIGpRdWVyeSwgaXQgaXMgYSBiYXNlIGxpYnJhcnkgdGhhdCBpc1xuICAvLyBwb3B1bGFyIGVub3VnaCB0byBiZSBidW5kbGVkIGluIGEgdGhpcmQgcGFydHkgbGliLCBidXQgbm90IGJlIHBhcnQgb2ZcbiAgLy8gYW4gQU1EIGxvYWQgcmVxdWVzdC4gVGhvc2UgY2FzZXMgY291bGQgZ2VuZXJhdGUgYW4gZXJyb3Igd2hlbiBhblxuICAvLyBhbm9ueW1vdXMgZGVmaW5lKCkgaXMgY2FsbGVkIG91dHNpZGUgb2YgYSBsb2FkZXIgcmVxdWVzdC5cbiAgaWYgKHR5cGVvZiBkZWZpbmUgPT09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCkge1xuICAgIGRlZmluZSgndW5kZXJzY29yZScsIFtdLCBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBfO1xuICAgIH0pO1xuICB9XG59LmNhbGwodGhpcykpO1xuIiwidmFyIG1jID0gbW9kdWxlLmV4cG9ydHNcbm1jLkRhdGF0YWJsZSA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGlkcyA9IDA7XG5cbiAgICB2YXIgZHQgPSB7XG4gICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uIChjb2xzLCBjb25maWcpIHtcbiAgICAgICAgICAgIHRoaXMuY29scyA9IGNvbHM7XG4gICAgICAgICAgICB0aGlzLmNvbmZpZyA9IGNvbmZpZyA9IGNvbmZpZyB8fCB7fTtcblxuICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gW107XG5cbiAgICAgICAgICAgIGlmIChjb25maWcudXJsKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhID0gbS5yZXF1ZXN0KHtcbiAgICAgICAgICAgICAgICAgICAgdXJsOiBjb25maWcudXJsLFxuICAgICAgICAgICAgICAgICAgICBoZWFkZXI6IGNvbmZpZy5oZWFkZXIsIFxuICAgICAgICAgICAgICAgICAgICBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgY29uZmlnLmF1dGhvcml6YXRpb24pO1xuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBtZXRob2Q6ICdHRVQnXG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjb25maWcuZGF0YSkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9ICh0eXBlb2YgY29uZmlnLmRhdGEgPT0gJ2Z1bmN0aW9uJyA/IGNvbmZpZy5kYXRhIDogbS5wcm9wKGNvbmZpZy5kYXRhKSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc29ydCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICB2YXIga2V5ID0gdGFyZ2V0LnBhcmVudE5vZGUuZ2V0QXR0cmlidXRlKCdkYXRhLWNvbGtleScpLFxuICAgICAgICAgICAgICAgICAgICBjb2wgPSB0aGlzLmFjdGl2ZUNvbHNba2V5XTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5sYXN0U29ydGVkICYmIHRoaXMubGFzdFNvcnRlZCAhPSBrZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hY3RpdmVDb2xzW3RoaXMubGFzdFNvcnRlZF0uX3NvcnRlZCA9ICdub25lJztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdmFyIHJldmVyc2UgPSAoY29sLl9zb3J0ZWQgPT0gJ2FzYycgPyAtMSA6IDEpO1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSh0aGlzLmRhdGEoKS5zb3J0KGZ1bmN0aW9uIChhLCBiKSB7XG4gICAgICAgICAgICAgICAgICAgIGEgPSBhW2tleV07XG4gICAgICAgICAgICAgICAgICAgIGIgPSBiW2tleV07XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAoYSA9PSBiID8gMCA6IChhIDwgYiA/IC0xIDogMSkgKiByZXZlcnNlKTtcbiAgICAgICAgICAgICAgICB9KSk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgY29sLl9zb3J0ZWQgPSAocmV2ZXJzZSA+IDAgPyAnYXNjJyA6ICdkZXNjJyk7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0U29ydGVkID0ga2V5O1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIG0ucmVuZGVyKHRoaXMuX3RhYmxlRWwsIGR0LmNvbnRlbnRzVmlldyh0aGlzKSk7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLm9uQ2VsbENsaWNrID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAgICAgICAgIHdoaWxlICh0YXJnZXQubm9kZU5hbWUgIT0gJ1REJyAmJiB0YXJnZXQubm9kZU5hbWUgIT0gJ1RBQkxFJykgdGFyZ2V0ID0gdGFyZ2V0LnBhcmVudE5vZGU7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PSAnVEFCTEUnKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB2YXIgY29sSW5kZXggPSB0YXJnZXQuY2VsbEluZGV4LFxuICAgICAgICAgICAgICAgICAgICBjb2wgPSB0aGlzLmRhdGFSb3dbY29sSW5kZXhdLFxuICAgICAgICAgICAgICAgICAgICByZWNvcmRJZCA9IHRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1yZWNvcmQtaWQnKSxcbiAgICAgICAgICAgICAgICAgICAgaWRGaWVsZCA9IGNvbmZpZy5yZWNvcmRJZCB8fCAnaWQnLFxuICAgICAgICAgICAgICAgICAgICByb3c7XG5cbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEoKS5zb21lKGZ1bmN0aW9uIChyKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyW2lkRmllbGRdID09IHJlY29yZElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3cgPSByO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIG0uc3RhcnRDb21wdXRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHZhciByZXQgPSB0aGlzLmNvbmZpZy5vbkNlbGxDbGljay5jYWxsKHRoaXMsIHJvd1tjb2wuZmllbGQgfHwgY29sLmtleV0sIHJvdywgY29sKTtcbiAgICAgICAgICAgICAgICBtLmVuZENvbXB1dGF0aW9uKCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJldDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMub25Sb3dTZWxlY3QgPSBmdW5jdGlvbiAoZSwgdGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdmFyIHJzID0gdGhpcy5jb25maWcucm93U2VsZWN0LFxuICAgICAgICAgICAgICAgICAgICBtdWx0aSA9IHJzLm11bHRpcGxlLFxuICAgICAgICAgICAgICAgICAgICBjYWxsYmFjayA9IHJzLmNhbGxiYWNrLFxuICAgICAgICAgICAgICAgICAgICBzZWwgPSB0aGlzLmN1cnJlbnRTZWxlY3Rpb24gfHwgW10sXG4gICAgICAgICAgICAgICAgICAgIGxhc3RTZWwgPSB0aGlzLmxhc3RTZWxlY3Rpb24sXG4gICAgICAgICAgICAgICAgICAgIGluUmFuZ2UgPSBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgaWRGaWVsZCA9IGNvbmZpZy5yZWNvcmRJZCB8fCAnaWQnO1xuXG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjYWxsYmFjayAhPSAnZnVuY3Rpb24nKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB3aGlsZSAodGFyZ2V0Lm5vZGVOYW1lICE9ICdUUicgJiYgdGFyZ2V0Lm5vZGVOYW1lICE9ICdUQUJMRScpIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuXG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PSAnVEFCTEUnKSByZXR1cm47XG5cbiAgICAgICAgICAgICAgICB2YXIgcmVjb3JkSWQgPSB0YXJnZXQuZ2V0QXR0cmlidXRlKCdkYXRhLXJlY29yZC1pZCcpO1xuICAgICAgICAgICAgICAgIGlmIChwYXJzZUludChyZWNvcmRJZCwgMTApID09IHJlY29yZElkKSByZWNvcmRJZCA9IHBhcnNlSW50KHJlY29yZElkLCAxMCk7XG5cbiAgICAgICAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcblxuICAgICAgICAgICAgICAgIGlmIChtdWx0aSAmJiBlLmN0cmxLZXkpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGkgPSBzZWwuaW5kZXhPZihyZWNvcmRJZCk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpID09IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWwucHVzaChyZWNvcmRJZCk7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBzZWwuc3BsaWNlKGksIDEpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIGlmIChtdWx0aSAmJiBlLnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIGNsZWFyU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZGF0YSgpLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIGlkID0gcm93W2lkRmllbGRdO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGluUmFuZ2UpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoc2VsLmluZGV4T2YoaWQpID09IC0xKSBzZWwucHVzaChpZCk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkID09IGxhc3RTZWwgfHwgaWQgPT0gcmVjb3JkSWQpIGluUmFuZ2UgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlkID09IGxhc3RTZWwgfHwgaWQgPT0gcmVjb3JkSWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbC5pbmRleE9mKGlkKSA9PSAtMSkgc2VsLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpblJhbmdlID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHNlbCA9IChzZWwubGVuZ3RoID09IDEgJiYgc2VsWzBdID09IHJlY29yZElkID8gW10gOiBbcmVjb3JkSWRdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5sYXN0U2VsZWN0aW9uID0gcmVjb3JkSWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5jdXJyZW50U2VsZWN0aW9uID0gc2VsO1xuICAgICAgICAgICAgICAgIGNhbGxiYWNrKHNlbCk7XG4gICAgICAgICAgICAgICAgbS5lbmRDb21wdXRhdGlvbigpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5vbmNsaWNrID0gZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICAgICB2YXIgdGFyZ2V0ID0gZS50YXJnZXQ7XG4gICAgICAgICAgICAgICAgaWYgKHRhcmdldC5ub2RlTmFtZSA9PSAnSScgJiYgL1xcYmZhXFwtc29ydC8udGVzdCh0YXJnZXQuY2xhc3NOYW1lKSkgcmV0dXJuIHRoaXMuc29ydCh0YXJnZXQpO1xuICAgICAgICAgICAgICAgIGlmICh0aGlzLmNvbmZpZy5yb3dTZWxlY3QpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5vblJvd1NlbGVjdChlLCB0YXJnZXQpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBpZiAodHlwZW9mIHRoaXMuY29uZmlnLm9uQ2VsbENsaWNrID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMub25DZWxsQ2xpY2sodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIH0uYmluZCh0aGlzKTtcblxuICAgICAgICAgICAgdGhpcy5zZXRXaWR0aCA9IGZ1bmN0aW9uIChhdHRycywgd2lkdGgpIHtcbiAgICAgICAgICAgICAgICBpZiAoIXdpZHRoKSByZXR1cm47XG4gICAgICAgICAgICAgICAgaWYgKC9eXFxkKyQvLnRlc3Qod2lkdGgpKSB3aWR0aCArPSAncHgnO1xuICAgICAgICAgICAgICAgIGlmICghYXR0cnMuc3R5bGUpIGF0dHJzLnN0eWxlID0gJyc7XG4gICAgICAgICAgICAgICAgaWYgKHdpZHRoKSBhdHRycy5zdHlsZSArPSAnd2lkdGg6JyArIHdpZHRoICsgJzsnO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSxcbiAgICAgICAgdmlldzogZnVuY3Rpb24gKGN0cmwsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgIHZhciBjb2xzID0gY3RybC5jb2xzO1xuICAgICAgICAgICAgY3RybC52aWV3T3B0aW9ucyA9IG9wdGlvbnM7XG5cbiAgICAgICAgICAgIGlmICghY3RybC5kYXRhKCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbSgnZGl2JywgJ1NvcnJ5LCBubyBkYXRhIHRvIGRpc3BsYXknKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgICAgICAgb3B0aW9ucy5jbGFzc05hbWVzID0gb3B0aW9ucy5jbGFzc05hbWVzIHx8IHt9O1xuXG4gICAgICAgICAgICB2YXIgYXR0cnMgPSB7XG4gICAgICAgICAgICAgICAgY2xhc3M6IG9wdGlvbnMuY2xhc3NOYW1lcy50YWJsZSB8fCAndGFibGUgdGFibGUtc3RyaXBlZCB0YWJsZS1ib3JkZXJlZCB0YWJsZS1ob3ZlcicsXG4gICAgICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbiAoZWwsIGlzT2xkKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChpc09sZCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgICAgICBlbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGN0cmwub25jbGljayk7XG4gICAgICAgICAgICAgICAgICAgIGN0cmwuX3RhYmxlRWwgPSBlbDtcbiAgICAgICAgICAgICAgICAgICAgbS5tb2R1bGUoZWwsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gY3RybDtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgICAgICB2aWV3OiBkdC5jb250ZW50c1ZpZXdcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgY3RybC5zZXRXaWR0aChhdHRycywgb3B0aW9ucy53aWR0aCk7XG5cbiAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICd0YWJsZScsXG4gICAgICAgICAgICAgICAgYXR0cnNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH0sXG4gICAgICAgIGNvbnRlbnRzVmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICAgICAgICAgIHZhciBjb2xzID0gY3RybC5jb2xzLFxuICAgICAgICAgICAgICAgIG9wdGlvbnMgPSBjdHJsLnZpZXdPcHRpb25zO1xuXG4gICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgIGR0LmhlYWRWaWV3KGN0cmwsIGNvbHMsIG9wdGlvbnMpLFxuICAgICAgICAgICAgICAgIGR0LmJvZHlWaWV3KGN0cmwsIGNvbHMsIG9wdGlvbnMsIGN0cmwuZGF0YSgpKSxcbiAgICAgICAgICAgICAgICBkdC5jYXB0aW9uVmlldyhjdHJsLCBvcHRpb25zKVxuICAgICAgICAgICAgXTtcbiAgICAgICAgfSxcbiAgICAgICAgaGVhZFZpZXc6IGZ1bmN0aW9uIChjdHJsLCBjb2xzLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgbWF0cml4ID0gW10sXG4gICAgICAgICAgICAgICAgcm93TnVtID0gMCxcbiAgICAgICAgICAgICAgICBkYXRhUm93ID0gW107XG4gICAgICAgICAgICB2YXIgY2FsY0RlcHRoID0gZnVuY3Rpb24gKG1heERlcHRoLCBjb2wpIHtcbiAgICAgICAgICAgICAgICB2YXIgZGVwdGggPSAwO1xuICAgICAgICAgICAgICAgIGlmICghbWF0cml4W3Jvd051bV0pIHtcbiAgICAgICAgICAgICAgICAgICAgbWF0cml4W3Jvd051bV0gPSBbXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgbWF0cml4W3Jvd051bV0ucHVzaChjb2wpO1xuICAgICAgICAgICAgICAgIGlmIChjb2wuY2hpbGRyZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgY29sLl9jb2xzcGFuID0gY29sLmNoaWxkcmVuLmxlbmd0aDtcbiAgICAgICAgICAgICAgICAgICAgcm93TnVtKys7XG4gICAgICAgICAgICAgICAgICAgIGRlcHRoID0gY29sLmNoaWxkcmVuLnJlZHVjZShjYWxjRGVwdGgsIDApICsgMTtcbiAgICAgICAgICAgICAgICAgICAgcm93TnVtLS07XG4gICAgICAgICAgICAgICAgICAgIGRlcHRoID0gTWF0aC5tYXgobWF4RGVwdGgsIGRlcHRoKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBkYXRhUm93LnB1c2goY29sKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgY29sLl9kZXB0aCA9IGRlcHRoO1xuICAgICAgICAgICAgICAgIHJldHVybiBkZXB0aDtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciBtYXhEZXB0aCA9IGNvbHMucmVkdWNlKGNhbGNEZXB0aCwgMCk7XG4gICAgICAgICAgICBjdHJsLmRhdGFSb3cgPSBkYXRhUm93O1xuICAgICAgICAgICAgdmFyIGFjdGl2ZUNvbHMgPSB7fTtcbiAgICAgICAgICAgIGRhdGFSb3cuZm9yRWFjaChmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICAgICAgYWN0aXZlQ29sc1tjb2wua2V5XSA9IGNvbDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgY3RybC5hY3RpdmVDb2xzID0gYWN0aXZlQ29scztcblxuICAgICAgICAgICAgdmFyIGJ1aWxkSGVhZGVyUm93ID0gZnVuY3Rpb24gKHJvdywgcm93TnVtKSB7XG4gICAgICAgICAgICAgICAgdmFyIGJ1aWxkSGVhZGVyQ2VsbCA9IGZ1bmN0aW9uIChjb2wpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGF0dHJzID0ge307XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wuX2NvbHNwYW4gJiYgY29sLl9jb2xzcGFuID4gMSkgYXR0cnMuY29sc3BhbiA9IGNvbC5fY29sc3BhbjtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbC5jbGFzcykgYXR0cnMuY2xhc3MgPSBjb2wuY2xhc3M7XG4gICAgICAgICAgICAgICAgICAgIGlmICghY29sLl9kZXB0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnNbJ2RhdGEtY29sS2V5J10gPSBjb2wua2V5O1xuICAgICAgICAgICAgICAgICAgICAgICAgY3RybC5zZXRXaWR0aChhdHRycywgY29sLndpZHRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3dOdW0gPCBtYXhEZXB0aCkgYXR0cnMucm93c3BhbiA9IG1heERlcHRoIC0gcm93TnVtICsgMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjb2wuX3NvcnRlZCAmJiBjb2wuX3NvcnRlZCAhPSAnbm9uZScpIGF0dHJzLmNsYXNzID0gb3B0aW9ucy5jbGFzc05hbWVzLnNvcnRlZCB8fCAnc29ydGVkJztcbiAgICAgICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICAgICAgICAgJ3RoJyxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzLCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgKCFjb2wuX2RlcHRoICYmIGNvbC5zb3J0YWJsZSA/IG0oXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICdpLmZhJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhc2M6ICdmYS1zb3J0LWFzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgZGVzYzogJ2ZhLXNvcnQtZGVzYycsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgbm9uZTogJ2ZhLXNvcnQnXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9W2NvbC5fc29ydGVkIHx8ICdub25lJ11cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICkgOiAnJyksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbS50cnVzdCgnICcpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbC5sYWJlbCB8fCBjb2wua2V5XG4gICAgICAgICAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICAgICAndHInLFxuICAgICAgICAgICAgICAgICAgICByb3cubWFwKGJ1aWxkSGVhZGVyQ2VsbClcbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJldHVybiBtKCd0aGVhZCcsIG1hdHJpeC5tYXAoYnVpbGRIZWFkZXJSb3cpKTtcbiAgICAgICAgfSxcblxuICAgICAgICBib2R5VmlldzogZnVuY3Rpb24gKGN0cmwsIGNvbHMsIG9wdGlvbnMsIGRhdGEpIHtcbiAgICAgICAgICAgIHZhciBpZEZpZWxkID0gY3RybC5jb25maWcucmVjb3JkSWQgfHwgJ2lkJztcbiAgICAgICAgICAgIHZhciBidWlsZERhdGFSb3cgPSBmdW5jdGlvbiAocm93LCByb3dJbmRleCkge1xuICAgICAgICAgICAgICAgIHZhciBidWlsZERhdGFDZWxsID0gZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgdmFsdWUgPSByb3dbY29sLmZpZWxkIHx8IGNvbC5rZXldLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnMgPSB7fTtcblxuICAgICAgICAgICAgICAgICAgICBpZiAodHlwZW9mIGNvbC5mb3JtYXR0ZXIgPT0gJ2Z1bmN0aW9uJykge1xuICAgICAgICAgICAgICAgICAgICAgICAgdmFsdWUgPSBjb2wuZm9ybWF0dGVyLmNhbGwoY3RybCwgdmFsdWUsIHJvdywgY29sLCBhdHRycyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhdHRycy5jbGFzcykgYXR0cnMuY2xhc3MgPSAnJztcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbC5fc29ydGVkICYmIGNvbC5fc29ydGVkICE9ICdub25lJykgYXR0cnMuY2xhc3MgKz0gJyAnICsgKG9wdGlvbnMuY2xhc3NOYW1lcy5zb3J0ZWQgfHwgJ3NvcnRlZCcpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sLmNsYXNzKSBhdHRycy5jbGFzcyArPSAnICcgKyBjb2wuY2xhc3M7XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKCFhdHRycy5jbGFzcykgZGVsZXRlIGF0dHJzLmNsYXNzO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAgICAgICAgICd0ZCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRycyxcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICBpZiAocm93W2lkRmllbGRdID09PSB1bmRlZmluZWQpIHJvd1tpZEZpZWxkXSA9IGlkcysrO1xuICAgICAgICAgICAgICAgIHZhciByZWNvcmRJZCA9IHJvd1tpZEZpZWxkXTtcblxuICAgICAgICAgICAgICAgIHJldHVybiBtKFxuICAgICAgICAgICAgICAgICAgICAndHInLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAnZGF0YS1yZWNvcmQtaWQnOiByZWNvcmRJZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiAocm93SW5kZXggJiAxID8gb3B0aW9ucy5jbGFzc05hbWVzLm9kZCB8fCAnb2RkJyA6IG9wdGlvbnMuY2xhc3NOYW1lcy5ldmVuIHx8ICdldmVuJykgK1xuICAgICAgICAgICAgICAgICAgICAgICAgKGN0cmwuY3VycmVudFNlbGVjdGlvbi5pbmRleE9mKHJlY29yZElkKSAhPSAtMSA/IG9wdGlvbnMuY2xhc3NOYW1lcy5zZWxlY3RlZCB8fCAnIHNlbGVjdGVkJyA6ICcnKVxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICBjdHJsLmRhdGFSb3cubWFwKGJ1aWxkRGF0YUNlbGwpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gbSgndGJvZHknLCBkYXRhLm1hcChidWlsZERhdGFSb3cpKTtcbiAgICAgICAgfSxcbiAgICAgICAgY2FwdGlvblZpZXc6IGZ1bmN0aW9uIChjdHJsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICBpZiAob3B0aW9ucy5jYXB0aW9uKSByZXR1cm4gbSgnY2FwdGlvbicsIG9wdGlvbnMuY2FwdGlvbik7XG4gICAgICAgIH0sXG4gICAgfTtcblxuICAgIC8qIGdsb2JhbCBkb2N1bWVudDpmYWxzZSwgd2luZG93OmZhbHNlICovXG4gICAgZnVuY3Rpb24gY2xlYXJTZWxlY3Rpb24oKSB7XG4gICAgICAgIGlmIChkb2N1bWVudC5zZWxlY3Rpb24gJiYgZG9jdW1lbnQuc2VsZWN0aW9uLmVtcHR5KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5zZWxlY3Rpb24uZW1wdHkoKTtcbiAgICAgICAgfSBlbHNlIGlmICh3aW5kb3cuZ2V0U2VsZWN0aW9uKSB7XG4gICAgICAgICAgICB3aW5kb3cuZ2V0U2VsZWN0aW9uKCkucmVtb3ZlQWxsUmFuZ2VzKCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gZHQ7XG59KSgpOyIsInZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcblxudmFyIE5hdmJhciA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgICB2YXIgbGlua3MgPSAoQXV0aC50b2tlbigpID9cbiAgICBbXG4gICAgICB7IGxhYmVsOiAnVGlja2V0cycsIGhyZWY6ICcvdGlja2V0cycgfSxcbiAgICAgIHsgbGFiZWw6ICdOZXcgVGlja2V0JywgaHJlZjogJy90aWNrZXRFZGl0JyB9LFxuICAgICAgKEF1dGgudXNlcl90eXBlKCkgPT0gJ0FnZW50Jz8geyBsYWJlbDogJ1JlcG9ydHMnLCBocmVmOiAnL215X3JlcG9ydHMnIH06e30pLFxuICAgICAgKEF1dGgudXNlcl90eXBlKCkgPT0gJ0FkbWluJz8geyBsYWJlbDogJ1JlcG9ydHMnLCBocmVmOiAnL215X3JlcG9ydHMnIH06e30pLFxuICAgICAgKEF1dGgudXNlcl90eXBlKCkgPT0gJ0FkbWluJz8geyBsYWJlbDogJ1VzZXJzJywgaHJlZjogJy91c2VycycgfTp7fSksXG4gICAgICB7IGxhYmVsOidMb2dvdXQnLCBocmVmOicvbG9nb3V0JyB9XG4gICAgXTpbXG4gICAgICB7IGxhYmVsOiAnTG9naW4nLCBocmVmOiAnL2xvZ2luJyB9LFxuICAgICAgeyBsYWJlbDogJ1JlZ2lzdGVyJywgaHJlZjogJy9yZWdpc3RlcicgfVxuICAgIF0pXG4gICAgLm1hcChmdW5jdGlvbihsKXtcbiAgICAgIHJldHVybiBtKFwibGlcIiArIChtLnJvdXRlKCkgPT09IGwuaHJlZiA/ICcuYWN0aXZlJzogJycpLCBtKFwiYVtocmVmPSdcIiArIGwuaHJlZiArIFwiJ11cIiwgbC5ub3JtYWw/e306e2NvbmZpZzogbS5yb3V0ZX0sIGwubGFiZWwpKTtcbiAgICB9KTtcblxuICAgIGN0cmwubGlua3MgPSBtLnByb3AobGlua3MpO1xuXG4gICAgY3RybC5pY29uRGlyZWN0aW9uID0gbS5wcm9wKCdkb3duJyk7XG5cbiAgICBjdHJsLnRvZ2dsZSA9IGZ1bmN0aW9uKCl7XG4gICAgICBjdHJsLmljb25EaXJlY3Rpb24oIGN0cmwuaWNvbkRpcmVjdGlvbigpPT0ndXAnID8gJ2Rvd24nOid1cCcgKTtcbiAgICB9O1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpIHtcbiAgICByZXR1cm4gbShcIm5hdi5uYXZiYXIubmF2YmFyLWludmVyc2UubmF2YmFyLWZpeGVkLXRvcFwiLCBbXG4gICAgICBtKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICAgIG0oXCIubmF2YmFyLWhlYWRlclwiLFxuICAgICAgICAgIG0oJ2J1dHRvbi5uYXZiYXItdG9nZ2xlJywge29uY2xpY2s6IGN0cmwudG9nZ2xlfSwgbSgnLmdseXBoaWNvbi5nbHlwaGljb24tY2hldnJvbi0nICsgY3RybC5pY29uRGlyZWN0aW9uKCkpKSxcbiAgICAgICAgICBtKFwiYS5uYXZiYXItYnJhbmRbaHJlZj0nLyddXCIsIHtjb25maWc6IG0ucm91dGV9LCBcIkNyb3Nzb3ZlciBUaWNrZXQgU3lzdGVtXCIpXG4gICAgICAgICksXG4gICAgICAgIG0oXCIubmF2YmFyLWNvbGxhcHNlLlwiICsgY3RybC5pY29uRGlyZWN0aW9uKCksXG4gICAgICAgICAgbShcInVsLm5hdi5uYXZiYXItbmF2Lm5hdmJhci1yaWdodFwiLCBjdHJsLmxpbmtzKCkpXG4gICAgICAgIClcbiAgICAgIF0pXG4gICAgXSk7XG4gIH1cbn07XG4iLCIvLyBtYWluLmpzXG5cbid1c2Ugc3RyaWN0JztcblxudmFyIF8gPSByZXF1aXJlKCd1bmRlcnNjb3JlJyk7XG5cbnZhciByZXEgPSBmdW5jdGlvbihhcmdzKSB7XG4gIHJldHVybiBtLnJlcXVlc3QoYXJncylcbn1cblxubS5yb3V0ZShkb2N1bWVudC5ib2R5LCBcIi9cIiwge1xuICBcIi9cIjogcmVxdWlyZSgnLi9wYWdlcy9UaWNrZXRzLmpzJyksXG4gIFwiL2xvZ2luXCI6IHJlcXVpcmUoJy4vcGFnZXMvTG9naW4uanMnKSxcbiAgXCIvbG9nb3V0XCI6IHJlcXVpcmUoJy4vcGFnZXMvTG9nb3V0LmpzJyksXG4gIFwiL3JlZ2lzdGVyXCI6IHJlcXVpcmUoJy4vcGFnZXMvUmVnaXN0ZXIuanMnKSxcbiAgXCIvdGlja2V0RWRpdFwiOiByZXF1aXJlKCcuL3BhZ2VzL1RpY2tldEVkaXQuanMnKSxcbiAgXCIvdmVyaWZ5Lzpjb2RlXCI6IHJlcXVpcmUoJy4vcGFnZXMvVmVyaWZ5LmpzJyksXG4gIFwiL3RpY2tldFwiOiByZXF1aXJlKCcuL3BhZ2VzL1RpY2tldFBhZ2UuanMnKSxcbiAgXCIvdXNlckVkaXRcIjogcmVxdWlyZSgnLi9wYWdlcy9Vc2VyRWRpdC5qcycpLFxuICBcIi90aWNrZXRzXCI6IHJlcXVpcmUoJy4vcGFnZXMvVGlja2V0cy5qcycpLFxuICBcIi9teV9yZXBvcnRzXCI6IHJlcXVpcmUoJy4vcGFnZXMvTXlSZXBvcnRzLmpzJyksXG4gIFwiL3VzZXJzXCI6IHJlcXVpcmUoJy4vcGFnZXMvVXNlcnMuanMnKSxcbiAgXCIvdXNlcnMvOmlkXCI6IHJlcXVpcmUoJy4vcGFnZXMvVXNlckRlbGV0ZS5qcycpLFxuICBcIi90YXN0eVwiOiByZXF1aXJlKCcuL3BhZ2VzL1Rhc3R5LmpzJylcbn0pO1xuIiwidmFyIEF1dGggPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgdG9rZW46IG0ucHJvcChsb2NhbFN0b3JhZ2UudG9rZW4pLFxuICB1c2VyX3R5cGU6IG0ucHJvcChsb2NhbFN0b3JhZ2UudXNlcl90eXBlKSxcbiAgXG4gIC8vIHRyYWRlIGNyZWRlbnRpYWxzIGZvciBhIHRva2VuXG4gIGxvZ2luOiBmdW5jdGlvbihlbWFpbCwgcGFzc3dvcmQpIHtcbiAgICByZXR1cm4gbS5yZXF1ZXN0KHtcbiAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgdXJsOiAnL2F1dGgvbG9naW4nLFxuICAgICAgZGF0YToge2VtYWlsOmVtYWlsLCBwYXNzd29yZDpwYXNzd29yZH0sXG4gICAgICB1bndyYXBTdWNjZXNzOiBmdW5jdGlvbihyZXMpIHtcbiAgICAgICAgbG9jYWxTdG9yYWdlLnRva2VuID0gcmVzLmF1dGhfdG9rZW47XG4gICAgICAgIGxvY2FsU3RvcmFnZS51c2VyX3R5cGUgPSByZXMudXNlcl90eXBlO1xuXG4gICAgICAgIEF1dGgudXNlcl90eXBlKHJlcy51c2VyX3R5cGUpO1xuXG4gICAgICAgIHJldHVybiByZXMuYXV0aF90b2tlbjtcbiAgICAgIH1cbiAgICB9KVxuICAgIC50aGVuKHRoaXMudG9rZW4pO1xuICB9LFxuXG4gIC8vIGZvcmdldCB0b2tlblxuICBsb2dvdXQ6IGZ1bmN0aW9uKCl7XG4gICAgdGhpcy50b2tlbihmYWxzZSk7XG4gICAgZGVsZXRlIGxvY2FsU3RvcmFnZS50b2tlbjtcbiAgfSxcblxuICAvLyBzaWdudXAgb24gdGhlIHNlcnZlciBmb3IgbmV3IGxvZ2luIGNyZWRlbnRpYWxzXG4gIHJlZ2lzdGVyOiBmdW5jdGlvbihlbWFpbCwgcGFzc3dvcmQsbmFtZSx0eXBlKSB7XG4gICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogJy91c2VycycsXG4gICAgICBkYXRhOiB7IHVzZXI6IHsgZW1haWw6IGVtYWlsLCBwYXNzd29yZDogcGFzc3dvcmQsIHR5cGU6IHR5cGUsIG5hbWU6IG5hbWV9fVxuICAgIH0pO1xuICB9LFxuXG4gIC8vIGVuc3VyZSB2ZXJpZnkgdG9rZW4gaXMgY29ycmVjdFxuICB2ZXJpZnk6IGZ1bmN0aW9uKHRva2VuKSB7XG4gICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogJy9hdXRoL3ZlcmlmeScsXG4gICAgICBkYXRhOiB7IHRva2VuOiB0b2tlbiB9XG4gICAgfSk7XG4gIH0sXG5cbiAgLy8gZ2V0IGN1cnJlbnQgdXNlciBvYmplY3RcbiAgdXNlcjogZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIEF1dGgucmVxKCcvdXNlcnMvbWUnKTtcbiAgfSxcblxuICAvLyBtYWtlIGFuIGF1dGhlbnRpY2F0ZWQgcmVxdWVzdFxuICByZXE6IGZ1bmN0aW9uKG9wdGlvbnMpe1xuICAgIGlmICh0eXBlb2Ygb3B0aW9ucyA9PSAnc3RyaW5nJykge1xuICAgICAgb3B0aW9ucyA9IHsgbWV0aG9kOiAnR0VUJywgdXJsOiBvcHRpb25zIH07XG4gICAgfVxuXG4gICAgdmFyIG9sZENvbmZpZyA9IG9wdGlvbnMuY29uZmlnIHx8IGZ1bmN0aW9uKCkge307XG5cbiAgICBvcHRpb25zLmNvbmZpZyA9IGZ1bmN0aW9uKHhocikge1xuICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoXCJBdXRob3JpemF0aW9uXCIsICBBdXRoLnRva2VuKCkpO1xuICAgICAgb2xkQ29uZmlnKHhocik7XG4gICAgfTtcblxuICAgIC8vIHRyeSByZXF1ZXN0LCBpZiBhdXRoIGVycm9yLCByZWRpcmVjdFxuICAgIC8vIFRPRE86IHJlbWVtYmVyIHdoZXJlIHRoZSB1c2VyIHdhcywgb3JpZ2luYWxseVxuICAgIHZhciBkZWZlcnJlZCA9IG0uZGVmZXJyZWQoKTtcbiAgICBtLnJlcXVlc3Qob3B0aW9ucykudGhlbihkZWZlcnJlZC5yZXNvbHZlLCBmdW5jdGlvbihlcnIpIHtcbiAgICAgIGlmIChlcnIuc3RhdHVzID09PSA0MDEpIHtcbiAgICAgICAgQXV0aC5vcmlnaW5hbFJvdXRlID0gbS5yb3V0ZSgpO1xuICAgICAgICBtLnJvdXRlKCcvbG9naW4nKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICAgIHJldHVybiBkZWZlcnJlZC5wcm9taXNlO1xuICB9XG59OyIsIi8vIFRpY2tldCBtb2RlbFxudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xudmFyIFRpY2tldCA9IG1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLy8gVGlja2V0ID0geyBpZDogaW50ZWdlciwgdGl0bGU6IHRleHQsIHN0YXR1czogaW50ZWdlciwgYWdlbnRfaWQ6IGludGVnZXIsIGN1c3RvbWVyX2lkOiBpbnRlZ2VyXG4gICAgLy8gICAgICwgZGVwYXJ0bWVudF9pZDogaW50ZWdlciwgcHJpb3JldHk6IGludGVnZXIsIGRvbmVfZGF0ZTogZGF0ZXRpbWUsIGNyZWF0ZWRfYXQ6IGRhdGV0aW1lLFxuICAgIC8vICAgICAgdXBkYXRlZF9hdDogZGF0ZXRpbWUgfVxuXG4gICAgc2VuZDogZnVuY3Rpb24gKGRhdGEsaWQpIHtcbiAgICAgICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICAgICAgICBtZXRob2Q6IGlkID8gJ1BVVCcgOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvdGlja2V0cycrKGlkPycvJytpZCA6ICcnKVxuICAgICAgICAgICAgLCBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogeyB0aWNrZXQ6IGRhdGEgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZG93bmxvYWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgdXJsOiAnL2Rvd25sb2FkX3JlcG9ydCcsXG4gICAgICAgICAgICBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZXR1cm4gbS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgICB1cmw6ICcvdGlja2V0cy8nK2lkLFxuICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgQXV0aC50b2tlbigpKTtcbiAgICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRpY2tldDtcbiIsIi8vIFVzZXIgbW9kZWxcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBVc2VyID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgICAvLyBUaWNrZXQgPSB7IGlkOiBpbnRlZ2VyLCB0aXRsZTogdGV4dCwgc3RhdHVzOiBpbnRlZ2VyLCBhZ2VudF9pZDogaW50ZWdlciwgY3VzdG9tZXJfaWQ6IGludGVnZXJcbiAgICAvLyAgICAgLCBkZXBhcnRtZW50X2lkOiBpbnRlZ2VyLCBwcmlvcmV0eTogaW50ZWdlciwgZG9uZV9kYXRlOiBkYXRldGltZSwgY3JlYXRlZF9hdDogZGF0ZXRpbWUsXG4gICAgLy8gICAgICB1cGRhdGVkX2F0OiBkYXRldGltZSB9XG5cbiAgICBhbGw6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBnZXQ6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZXR1cm4gbS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgICB1cmw6ICcvdXNlcnMvJytpZCxcbiAgICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHhocikge1xuICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgfVxuXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBzZW5kOiBmdW5jdGlvbiAoZGF0YSxpZCkge1xuICAgICAgICByZXR1cm4gbS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIG1ldGhvZDogaWQgPyAnUFVUJyA6ICdQT1NUJyxcbiAgICAgICAgICAgIHVybDogJy91c2VycycrKGlkPycvJytpZCA6ICcnKVxuICAgICAgICAgICAgLCBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogeyB1c2VyOiBkYXRhIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRlbGV0ZTogZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgICAgICAgIHVybDogJy91c2VycycrKGlkPycvJytpZCA6ICcnKVxuICAgICAgICAgICAgLCBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZGF0YTogeyBpZDogaWQgfVxuICAgICAgICB9KTtcbiAgICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBVc2VyO1xuIiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciBMb2dpbiA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgIHZhciBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgQXV0aC5sb2dpbihlLnRhcmdldC5lbWFpbC52YWx1ZSwgZS50YXJnZXQucGFzc3dvcmQudmFsdWUpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgbS5yb3V0ZShBdXRoLm9yaWdpbmFsUm91dGUgfHwgJy8nLCBudWxsLCB0cnVlKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtZGFuZ2VyLmFuaW1hdGVkLmZhZGVJblVwXCIsIGVyci5tZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgIG0oXCJmb3JtLnRleHQtY2VudGVyLnJvdy5mb3JtLXNpZ25pblwiLCB7b25zdWJtaXQ6Y3RybC5sb2dpbi5iaW5kKGN0cmwpfSxcbiAgICAgICAgbSgnLmNvbC1zbS02LmNvbC1zbS1vZmZzZXQtMycsIFtcbiAgICAgICAgICBtKFwiaDFcIiwgXCJMb2dpblwiKSxcbiAgICAgICAgICBjdHJsLmVycm9yKCksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0RW1haWwnXVwiLCBcIkVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J2VtYWlsJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRFbWFpbCddW3BsYWNlaG9sZGVyPSdFbWFpbCBhZGRyZXNzJ11bcmVxdWlyZWRdW3R5cGU9J2VtYWlsJ11cIiksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0UGFzc3dvcmQnXVwiLCBcIlBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSdwYXNzd29yZCddW2F1dG9jb21wbGV0ZT0nb2ZmJ11baWQ9J2lucHV0UGFzc3dvcmQnXVtwbGFjZWhvbGRlcj0nUGFzc3dvcmQnXVtyZXF1aXJlZF1bdHlwZT0ncGFzc3dvcmQnXVwiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKFwiYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXByaW1hcnkuYnRuLWJsb2NrW3R5cGU9J3N1Ym1pdCddXCIsIFwiU2lnbiBpblwiKVxuICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgIClcbiAgICBdKV07XG4gIH1cbn07IiwidmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgTG9nb3V0ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgQXV0aC5sb2dvdXQoKTtcbiAgICBtLnJvdXRlKCcvbG9naW4nKTtcbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbihjdHJsKXtcbiAgfVxufTsiLCJ2YXIgTmF2YmFyID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9OYXZiYXIuanMnKTtcbnZhciBtYyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvRGF0YVRhYmxlLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG52YXIgVGlja2V0ID0gcmVxdWlyZSgnLi4vbW9kZWxzL1RpY2tldC5qcycpO1xudmFyIFRpY2tldFBhZ2UgPSByZXF1aXJlKCcuLi9wYWdlcy9UaWNrZXRQYWdlLmpzJyk7XG5cbm0ucm91dGUubW9kZSA9IFwicGF0aG5hbWVcIjtcblxudmFyIFRpY2tldHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIGN0cmwucHJpb3JldHlGcm9tYXRlID0gZnVuY3Rpb24gKHZhbHVlLCByb3csIGNvbCwgYXR0cnMpe1xuICAgICAgaWYgKHZhbHVlID09ICdoaWdoJykgYXR0cnMuY2xhc3MgPSAnbGFiZWwgbGFiZWwtZGFuZ2VyJztcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGF0YWJsZSA9IG5ldyBtYy5EYXRhdGFibGUuY29udHJvbGxlcihcbiAgICAgIC8vIENvbHVtbnMgZGVmaW5pdGlvbjpcbiAgICAgIFtcbiAgICAgICAgeyBrZXk6IFwidGl0bGVcIixsYWJlbDogXCJUaXRsZVwiLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGtleTogXCJjdXN0b21lcl9pZFwiLGxhYmVsOiBcIkN1c3RvbWVyXCIsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHsga2V5OiBcInByaW9yZXR5XCIsbGFiZWw6IFwiUHJpb3JpdHlcIn0sXG4gICAgICAgIHsga2V5OiBcInN0YXR1c1wiLGxhYmVsOiBcIlN0YXR1c1wiLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgXSxcbiAgICAgIC8vIE90aGVyIGNvbmZpZ3VyYXRpb246XG4gICAgICB7XG4gICAgICAgIC8vIEFkZHJlc3Mgb2YgdGhlIHdlYnNlcnZlciBzdXBwbHlpbmcgdGhlIGRhdGFcbiAgICAgICAgdXJsOiAncmVwb3J0cycsXG4gICAgICAgIGF1dGhvcml6YXRpb246IEF1dGgudG9rZW4oKSxcbiAgICAgICAgLy8gSGFuZGxlciBvZiBjbGljayBldmVudCBvbiBkYXRhIGNlbGxcbiAgICAgICAgLy8gSXQgcmVjZWl2ZXMgdGhlIHJlbGV2YW50IGluZm9ybWF0aW9uIGFscmVhZHkgcmVzb2x2ZWRcbiAgICAgICAgb25DZWxsQ2xpY2s6IGZ1bmN0aW9uIChjb250ZW50LCByb3csIGNvbCkge1xuICAgICAgICAgIGNvbnNvbGUubG9nKGNvbnRlbnQsIHJvdywgY29sKTtcbiAgICAgICAgICBtLnJvdXRlKFwiL3RpY2tldFwiLHtpZDpyb3cuaWR9KVxuICAgICAgICB9XG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbiAoY3RybCkge1xuICAgIHJldHVybiBbTmF2YmFyLCBtKCcuY29udGFpbmVyJywgW1xuICAgICAgbSgnaDEnLCAnTGFzdCBNb250aCBSZXBvcnQnKSxcbiAgICAgIG1jLkRhdGF0YWJsZS52aWV3KGN0cmwuZGF0YXRhYmxlLCB7XG4gICAgICAgIGNhcHRpb246ICdUaWNrZXRzIGNsb3NlZCBsYXN0IG1vbnRoJ1xuICAgICAgfSksXG4gICAgICBtKFwiYS5idG4uYnRuLXByaW1hcnkucHVsbC1yaWdodFtocmVmPScvZG93bmxvYWRfcmVwb3J0J11cIiwge2NvbmZpZzogbS5yb3V0ZX0sIFwiRXhwb3J0IFJlcG9ydFwiKVxuICAgIF0pXTtcbiAgfVxufTtcbiIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgUmVnaXN0ZXIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC5yZWdpc3RlciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgaWYgKGUudGFyZ2V0LnBhc3N3b3JkLnZhbHVlICE9PSBlLnRhcmdldC5wYXNzd29yZDIudmFsdWUpIHtcbiAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCAnUGFzc3dvcmRzIG11c3QgbWF0Y2guJykpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIEF1dGgucmVnaXN0ZXIoZS50YXJnZXQuZW1haWwudmFsdWUsIGUudGFyZ2V0LnBhc3N3b3JkLnZhbHVlLCBlLnRhcmdldC5uYW1lLnZhbHVlLCBlLnRhcmdldC50eXBlLnZhbHVlKS50aGVuKGZ1bmN0aW9uKCkge1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1zdWNjZXNzLmFuaW1hdGVkLmZhZGVJblVwXCIsICdDb29sLiBOb3cgeW91IGNhbiBsb2dpbiEnKSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycikge1xuICAgICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG5cbiAgICAgICAgICBpZiAoZXJyICYmIGVyci5jb2RlICYmIGVyci5jb2RlID09PSAxMTAwMCkge1xuICAgICAgICAgICAgbWVzc2FnZSA9ICdUaGVyZSBpcyBhbHJlYWR5IGEgdXNlciB3aXRoIHRoYXQgZW1haWwgYWRkcmVzcy4nO1xuICAgICAgICAgIH1cblxuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHJldHVybiBbTmF2YmFyLnZpZXcoY3RybC5uYXZiYXIpLCBtKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICBtKFwiZm9ybS50ZXh0LWNlbnRlci5yb3cuZm9ybS1zaWduaW5cIiwge29uc3VibWl0OmN0cmwucmVnaXN0ZXIuYmluZChjdHJsKX0sXG4gICAgICAgIG0oJy5jb2wtc20tNi5jb2wtc20tb2Zmc2V0LTMnLCBbXG4gICAgICAgICAgbShcImgxXCIsIFwiUmVnaXN0ZXJcIiksXG4gICAgICAgICAgY3RybC5lcnJvcigpLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dEVtYWlsJ11cIiwgXCJFbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSdlbWFpbCddW2F1dG9mb2N1c11baWQ9J2lucHV0RW1haWwnXVtwbGFjZWhvbGRlcj0nRW1haWwgYWRkcmVzcyddW3JlcXVpcmVkXVt0eXBlPSdlbWFpbCddXCIpLFxuICAgICAgICAgIF0pLG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dG5hbWUnXVwiLCBcIk5hbWVcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J25hbWUnXVthdXRvZm9jdXNdW2lkPSdpbnB1dG5hbWUnXVtwbGFjZWhvbGRlcj0nTmFtZSddW3JlcXVpcmVkXVt0eXBlPSduYW1lJ11cIiksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0UGFzc3dvcmQnXVwiLCBcIlBhc3N3b3JkXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSdwYXNzd29yZCddW2F1dG9jb21wbGV0ZT0nb2ZmJ11baWQ9J2lucHV0UGFzc3dvcmQnXVtwbGFjZWhvbGRlcj0nUGFzc3dvcmQnXVtyZXF1aXJlZF1bdHlwZT0ncGFzc3dvcmQnXVwiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRQYXNzd29yZDInXVwiLCBcIlBhc3N3b3JkIChhZ2FpbilcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3Bhc3N3b3JkMiddW2F1dG9jb21wbGV0ZT0nb2ZmJ11baWQ9J2lucHV0UGFzc3dvcmQyJ11bcGxhY2Vob2xkZXI9J1Bhc3N3b3JkIChhZ2FpbiknXVtyZXF1aXJlZF1bdHlwZT0ncGFzc3dvcmQnXVwiKSxcbiAgICAgICAgICBdKSxtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRUeXBlJ11cIiwgXCJUeXBlXCIpLFxuICAgICAgICAgICAgbShcInNlbGVjdC5mb3JtLWNvbnRyb2xbbmFtZT0ndHlwZSddW3JlcXVpcmVkXVwiLFttKFwib3B0aW9uW3ZhbHVlPSdBZ2VudCddXCIsXCJBZ2VudFwiKSxtKFwib3B0aW9uW3ZhbHVlPSdDdXN0b21lciddXCIsJ0N1c3RvbWVyJyksbShcIm9wdGlvblt2YWx1ZT0nQWRtaW4nXVwiLCdBZG1pbicpXSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLWxnLmJ0bi1wcmltYXJ5LmJ0bi1ibG9ja1t0eXBlPSdzdWJtaXQnXVwiLCBcIlNpZ24gaW5cIilcbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgXSldO1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgVGFzdHkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLnVzZXIgPSBtLnByb3AoKTtcblxuICAgIHRoaXMuZGF0YXRhYmxlID0gbmV3IG1jLkRhdGF0YWJsZS5jb250cm9sbGVyKFxuICAgICAgICAvLyBDb2x1bW5zIGRlZmluaXRpb246XG4gICAgICAgIFtcbiAgICAgICAgICAgIHtrZXk6XCJFbXB0eVwifSxcbiAgICAgICAgICAgIHtrZXk6XCJOdW1iZXJzXCIsIGNoaWxkcmVuOltcbiAgICAgICAgICAgICAgICB7a2V5OlwiU0tVXCIsIGxhYmVsOlwiU0tVXCIsIHNvcnRhYmxlOnRydWV9LFxuICAgICAgICAgICAgICAgIHtrZXk6XCJRdWFudGl0eVwiLCBzb3J0YWJsZTp0cnVlLCBjbGFzczoncmlnaHQtYWxpZ25lZCd9XG4gICAgICAgICAgICBdfSxcbiAgICAgICAgICAgIHtrZXk6XCJUZXh0XCIsIGNoaWxkcmVuOltcbiAgICAgICAgICAgICAgICB7a2V5OlwiSXRlbVwiLCBzb3J0YWJsZTp0cnVlfSxcbiAgICAgICAgICAgICAgICB7a2V5OlwiRGVzY3JpcHRpb25cIiwgc29ydGFibGU6dHJ1ZSwgd2lkdGg6MjAwfVxuICAgICAgICAgICAgXX1cbiAgICAgICAgXSxcbiAgICAgICAgLy8gT3RoZXIgY29uZmlndXJhdGlvbjpcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gQWRkcmVzcyBvZiB0aGUgd2Vic2VydmVyIHN1cHBseWluZyB0aGUgZGF0YVxuICAgICAgICAgICAgdXJsOidkYXRhL3N0b2NrLmpzb24nLFxuXG4gICAgICAgICAgICAvLyBIYW5kbGVyIG9mIGNsaWNrIGV2ZW50IG9uIGRhdGEgY2VsbFxuICAgICAgICAgICAgLy8gSXQgcmVjZWl2ZXMgdGhlIHJlbGV2YW50IGluZm9ybWF0aW9uIGFscmVhZHkgcmVzb2x2ZWRcbiAgICAgICAgICAgIG9uQ2VsbENsaWNrOiBmdW5jdGlvbiAoY29udGVudCwgcm93LCBjb2wpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmxvZyhjb250ZW50LCByb3csIGNvbCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICApO1xuICB9LFxuICBcbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oJy5jb250YWluZXInLCBbXG4gICAgICBtKCdoMScsICd0YXN0eScpLFxuICAgICAgICBtYy5EYXRhdGFibGUudmlldyhjdHJsLmRhdGF0YWJsZSwgIHtcbiAgICAgICAgICAgIGNhcHRpb246J3RoaXMgaXMgdGhlIGNhcHRpb24nXG4gICAgICAgIH0pXG4gICAgXSldO1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xudmFyIFRpY2tldCA9IHJlcXVpcmUoJy4uL21vZGVscy9UaWNrZXQuanMnKTtcblxudmFyIFRpY2tldEVkaXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC50aWNrZXQgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgVGlja2V0LnNlbmQoe3RpdGxlOiBlLnRhcmdldC50aXRsZS52YWx1ZSxib2R5OiBlLnRhcmdldC5ib2R5LnZhbHVlfSlcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtc3VjY2Vzcy5hbmltYXRlZC5mYWRlSW5VcFwiLCAndGlja2V0IGhhcyBiZWVuIHNhdmVkJykpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG4gICAgICAgICAgXG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBtZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgIG0oXCJmb3JtLnRleHQtY2VudGVyLnJvdy5mb3JtLXNpZ25pblwiLCB7b25zdWJtaXQ6Y3RybC50aWNrZXQuYmluZChjdHJsKX0sXG4gICAgICAgIG0oJy5jb2wtc20tNi5jb2wtc20tb2Zmc2V0LTMnLCBbXG4gICAgICAgICAgbShcImgxXCIsIFwiTmV3IFRpY2tldFwiKSxcbiAgICAgICAgICBjdHJsLmVycm9yKCksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0VGlja2V0J11cIiwgXCJUaWNrZXQgZGVzY3JpcHRpb25cIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3RpdGxlJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRUaXRsZSddW3BsYWNlaG9sZGVyPSdUaXRsZSAnXVtyZXF1aXJlZF1bdHlwZT0ndGV4dCddXCIpLFxuICAgICAgICAgIF0pLG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dFRpY2tldCddXCIsIFwiVGlja2V0IGRlc2NyaXB0aW9uXCIpLFxuICAgICAgICAgICAgbShcInRleHRhcmVhLmZvcm0tY29udHJvbFtuYW1lPSdib2R5J11bYXV0b2ZvY3VzXVtpZD0naW5wdXRib2R5J11bcGxhY2Vob2xkZXI9J2JvZHkgJ11bcmVxdWlyZWRdW3R5cGU9J3RleHQnXVwiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgIFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJyxcbiAgICAgICAgICAgIG0oXCJidXR0b24uYnRuLmJ0bi1sZy5idG4tcHJpbWFyeS5idG4tYmxvY2tbdHlwZT0nc3VibWl0J11cIiwgXCJTYXZlXCIpXG4gICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgKVxuICAgIF0pXTtcbiAgfVxufTsiLCIvLyB0aWNrZXQgcGFnZSB0byB2aWV3IHRpY2tldCBhLCBjb21tZW50cyAgYW5kIG5vdGVzIGlmIGFnZW50XG52YXIgVGlja2V0ID0gcmVxdWlyZSgnLi4vbW9kZWxzL1RpY2tldC5qcycpO1xudmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG5cbnZhciBUaWNrZXRQYWdlID0gbW9kdWxlLmV4cG9ydHMgPSB7XG5cbiAgY29udHJvbGxlcjogZnVuY3Rpb24gKGFyZ3MpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgICBjdHJsLm9wZW4gPSBmdW5jdGlvbiAoc3RhdHVzKSB7XG4gICAgICBjdHJsLnRpY2tldCgpLnRpY2tldC5zdGF0dXMgPSBzdGF0dXNcbiAgICAgIFRpY2tldC5zZW5kKHsgc3RhdHVzOiBzdGF0dXMgfSwgbS5yb3V0ZS5wYXJhbSgpLmlkKVxuICAgICAgICAudGhlbihmdW5jdGlvbiAodGlja2V0KSB7XG4gICAgICAgICAgY3RybC50aWNrZXQoKS50aWNrZXQgPSB0aWNrZXRcbiAgICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBtZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIFRpY2tldC5nZXQobS5yb3V0ZS5wYXJhbSgpLmlkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHRpY2tldCkge1xuXG4gICAgICAgIGN0cmwudGlja2V0ID0gbS5wcm9wKHRpY2tldClcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQuJztcbiAgICAgICBtLnJvdXRlKCcvdGlja2V0cycpXG4gICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgfSk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gW05hdmJhciwgbSgnLmNvbnRhaW5lcicsIFtbXG4gICAgICBtKFwiaDJcIiwgXCJUaWNrZXRcIiksXG4gICAgICBjdHJsLmVycm9yKCksXG4gICAgICBtKFwicFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC50aXRsZSksbShcInBcIiwgY3RybC50aWNrZXQoKS50aWNrZXQuYm9keSksXG4gICAgICBtKFwidGFibGUudGFibGUudGFibGUtY29uZGVuc2VkLnRhYmxlLWJvcmRlcmVkXCIsIFtcbiAgICAgICAgbShcInRoZWFkXCIsIFtcbiAgICAgICAgICBtKFwidHJcIiwgW1xuICAgICAgICAgICAgbShcInRoXCIsIFwiQ3VzdG9tZXJcIiksXG4gICAgICAgICAgICBtKFwidGhcIiwgXCJBZ2VudFwiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIkNyZWF0aW9uIERhdGVcIiksXG4gICAgICAgICAgICBtKFwidGhcIiwgXCJEb25lIERhdGVcIiksXG4gICAgICAgICAgICBtKFwidGhcIiwgXCJTdGF0dXNcIiksXG4gICAgICAgICAgICBtKFwidGhcIiwgXCJQcmlvcml0eVwiKSxcbiAgICAgICAgICBdKVxuICAgICAgICBdKSxcbiAgICAgICAgbShcInRib2R5XCIsIFtcbiAgICAgICAgICBtKFwidHJcIiwgW1xuICAgICAgICAgICAgbShcInRkXCIsIGN0cmwudGlja2V0KCkudGlja2V0LmN1c3RvbWVyX2lkKSxcbiAgICAgICAgICAgIG0oXCJ0ZFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5hZ2VudF9pZCksXG4gICAgICAgICAgICBtKFwidGRcIiwgY3RybC50aWNrZXQoKS50aWNrZXQuY3JlYXRlZF9hdCksXG4gICAgICAgICAgICBtKFwidGRcIiwgY3RybC50aWNrZXQoKS50aWNrZXQuZG9uZV9kYXRlKSxcbiAgICAgICAgICAgIG0oXCJ0ZFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5zdGF0dXMpLFxuICAgICAgICAgICAgbShcInRkXCIsIG0oXCJzcGFuLmxhYmVsXCIsIHsgY2xhc3M6IGN0cmwudGlja2V0KCkudGlja2V0LnByaW9yZXR5ID09IFwibG93XCIgPyBcImxhYmVsLWRlZmF1bHRcIiA6IGN0cmwudGlja2V0KCkudGlja2V0LnByaW9yZXR5ID09IFwibWVkaXVtXCIgPyBcImxhYmVsLXByaW1hcnlcIiA6IFwibGFiZWwtZGFuZ2VyXCIgfSwgY3RybC50aWNrZXQoKS50aWNrZXQucHJpb3JldHkpKVxuICAgICAgICAgIF0pLFxuICAgICAgICBdKVxuICAgICAgXSksXG5cbiAgICAgIGN0cmwudGlja2V0KCkudGlja2V0LnN0YXR1cyA9PSAnY2xvc2VkJyA/IG0oXCJidXR0b24uYnRuLmJ0bi13YXJuaW5nXCIsIHsgb25jbGljazogY3RybC5vcGVuLmJpbmQoY3RybCwgJ29wZW5lZCcpIH0sIFwiT3BlbmVkXCIpIDpcbiAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLWRhbmdlclwiLCB7IG9uY2xpY2s6IGN0cmwub3Blbi5iaW5kKGN0cmwsICdjbG9zZWQnKSB9LCBcIkNsb3NlXCIpXG4gICAgICBdXVxuICAgICldO1xuICB9XG5cbn1cbiIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIG1jID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9EYXRhVGFibGUuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBUaWNrZXQgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGlja2V0LmpzJyk7XG52YXIgVGlja2V0UGFnZSA9IHJlcXVpcmUoJy4uL3BhZ2VzL1RpY2tldFBhZ2UuanMnKTtcblxudmFyIFRpY2tldHMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcblxuICAgIGN0cmwucHJpb3JldHlGcm9tYXRlID0gZnVuY3Rpb24gKHZhbHVlLCByb3csIGNvbCwgYXR0cnMpe1xuICAgICAgaWYgKHZhbHVlID09ICdoaWdoJykgYXR0cnMuY2xhc3MgPSAnbGFiZWwgbGFiZWwtZGFuZ2VyJztcbiAgICAgIHJldHVybiB2YWx1ZTtcbiAgICB9XG5cbiAgICB0aGlzLmRhdGF0YWJsZSA9IG5ldyBtYy5EYXRhdGFibGUuY29udHJvbGxlcihcbiAgICAgIC8vIENvbHVtbnMgZGVmaW5pdGlvbjpcbiAgICAgIFtcbiAgICAgICAgeyBrZXk6IFwidGl0bGVcIixsYWJlbDogXCJUaXRsZVwiLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGtleTogXCJhZ2VudF9pZFwiLGxhYmVsOiBcIkFnZW50XCIsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHsga2V5OiBcImN1c3RvbWVyX2lkXCIsbGFiZWw6IFwiQ3VzdG9tZXJcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBrZXk6IFwicHJpb3JldHlcIixsYWJlbDogXCJQcmlvcml0eVwifSxcbiAgICAgICAgeyBrZXk6IFwic3RhdHVzXCIsbGFiZWw6IFwiU3RhdHVzXCIsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICBdLFxuICAgICAgLy8gT3RoZXIgY29uZmlndXJhdGlvbjpcbiAgICAgIHtcbiAgICAgICAgLy8gQWRkcmVzcyBvZiB0aGUgd2Vic2VydmVyIHN1cHBseWluZyB0aGUgZGF0YVxuICAgICAgICB1cmw6ICd0aWNrZXRzJyxcbiAgICAgICAgYXV0aG9yaXphdGlvbjogQXV0aC50b2tlbigpLFxuICAgICAgICAvLyBIYW5kbGVyIG9mIGNsaWNrIGV2ZW50IG9uIGRhdGEgY2VsbFxuICAgICAgICAvLyBJdCByZWNlaXZlcyB0aGUgcmVsZXZhbnQgaW5mb3JtYXRpb24gYWxyZWFkeSByZXNvbHZlZFxuICAgICAgICBvbkNlbGxDbGljazogZnVuY3Rpb24gKGNvbnRlbnQsIHJvdywgY29sKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY29udGVudCwgcm93LCBjb2wpO1xuICAgICAgICAgIG0ucm91dGUoXCIvdGlja2V0XCIse2lkOnJvdy5pZH0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICApO1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uIChjdHJsKSB7XG4gICAgcmV0dXJuIFtOYXZiYXIsIG0oJy5jb250YWluZXInLCBbXG4gICAgICBtKCdoMScsICdDcm9zc292ZXIgVGlja2V0IFN5c3RlbScpLFxuICAgICAgbWMuRGF0YXRhYmxlLnZpZXcoY3RybC5kYXRhdGFibGUsIHtcbiAgICAgICAgY2FwdGlvbjogJ015IFRpY2tldHMnXG4gICAgICB9KSxcbiAgICBdKV07XG4gIH1cbn07XG4iLCJ2YXIgTmF2YmFyID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9OYXZiYXIuanMnKTtcbnZhciBtYyA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvRGF0YVRhYmxlLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG52YXIgVXNlciA9IHJlcXVpcmUoJy4uL21vZGVscy9Vc2VyLmpzJyk7XG5cbnZhciBVc2VyRGVsZXRlID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcblxuICAgIGN0cmwuZ2V0ID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIFVzZXIuZGVsZXRlKG0ucm91dGUucGFyYW0oKS5pZClcbiAgICAgICAgLnRoZW4oZnVuY3Rpb24oKXtcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtc3VjY2Vzcy5hbmltYXRlZC5mYWRlSW5VcFwiLCAndXNlciBoYXMgYmVlbiBzYXZlZCcpKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKXtcbiAgICAgICAgICB2YXIgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZC4nO1xuICAgICAgICAgIFxuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHJldHVybiBbTmF2YmFyLnZpZXcoY3RybC5uYXZiYXIpLCBtKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICBjdHJsLmVycm9yKCksXG4gICAgICBtKFwiZm9ybS50ZXh0LWNlbnRlci5yb3cuZm9ybS11c2VyLWRlbGV0ZVwiLCB7b25zdWJtaXQ6Y3RybC5nZXQuYmluZChjdHJsKX0sXG4gICAgICAgIG0oJy5jb2wtc20tNi5jb2wtc20tb2Zmc2V0LTMubXQtNTAnLCBbXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLWxnLmJ0bi13YXJuaW5nLmJ0bi1ibG9ja1t0eXBlPSdzdWJtaXQnXVwiLCBcIkRlbGV0ZSBVc2VyP1wiKVxuICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgICksXG4gICAgXSldO1xuICB9XG59OyIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIG1jID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9EYXRhVGFibGUuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBVc2VyID0gcmVxdWlyZSgnLi4vbW9kZWxzL1VzZXIuanMnKTtcblxudmFyIFVzZXJFZGl0ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcblxuICAgIGN0cmwuZ2V0ID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIFVzZXIuc2VuZCh7bmFtZTogZS50YXJnZXQubmFtZS52YWx1ZSxzdGF0dXM6IGUudGFyZ2V0LnN0YXR1cy52YWx1ZSxwaG9uZTogZS50YXJnZXQucGhvbmUudmFsdWV9LCBtLnJvdXRlLnBhcmFtKCkuaWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LXN1Y2Nlc3MuYW5pbWF0ZWQuZmFkZUluVXBcIiwgJ3VzZXIgaGFzIGJlZW4gc2F2ZWQnKSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgdmFyIG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQuJztcbiAgICAgICAgICBcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtZGFuZ2VyLmFuaW1hdGVkLmZhZGVJblVwXCIsIG1lc3NhZ2UpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbihjdHJsKXtcbiAgICByZXR1cm4gW05hdmJhci52aWV3KGN0cmwubmF2YmFyKSwgbShcIi5jb250YWluZXJcIiwgW1xuICAgICAgbShcImZvcm0udGV4dC1jZW50ZXIucm93LmZvcm0tdXNlci1lZGl0XCIsIHtvbnN1Ym1pdDpjdHJsLmdldC5iaW5kKGN0cmwpfSxcbiAgICAgICAgbSgnLmNvbC1zbS02LmNvbC1zbS1vZmZzZXQtMycsIFtcbiAgICAgICAgICBtKFwiaDFcIiwgXCJFZGl0IFVzZXJcIiksXG4gICAgICAgICAgY3RybC5lcnJvcigpLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLltmb3I9J2lucHV0TmFtZSddXCIsIFwiTmFtZVwiKSxcbiAgICAgICAgICAgIG0oXCJpbnB1dC5mb3JtLWNvbnRyb2xbbmFtZT0nbmFtZSddW2F1dG9mb2N1c11baWQ9J2lucHV0VGl0bGUnXVtwbGFjZWhvbGRlcj0nTmFtZSAnXVtyZXF1aXJlZF1bdHlwZT0ndGV4dCddXCIpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLltmb3I9J2lucHV0UGhvbmUnXVwiLCBcIlBob25lXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSdwaG9uZSddW2F1dG9mb2N1c11baWQ9J2lucHV0Ym9keSddW3BsYWNlaG9sZGVyPSdQaG9uZSAnXVtyZXF1aXJlZF1bdHlwZT0ndGV4dCddXCIpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwLnB1bGwtbGVmdCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5bZm9yPSdpbnB1dFN0YXR1cyddXCIsIFwiU3RhdHVzXCIpLFxuICAgICAgICAgICAgbShcImlucHV0W25hbWU9J3N0YXR1cyddW2F1dG9mb2N1c11baWQ9J2lucHV0U3RhdHVzQmxvY2snXVt2YWx1ZT0nYmxvY2tlZCddW3R5cGU9J3JhZGlvJ11cIiksXG4gICAgICAgICAgICBtKFwibGFiZWwucmFkaW8taW5saW5lXCIsIFwiQmxvY2tcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQubWwtMjBbbmFtZT0nc3RhdHVzJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRTdGF0dXNVbmJsb2NrJ11bdmFsdWU9J3VuYmxvY2tlZCddW3R5cGU9J3JhZGlvJ11cIiksXG4gICAgICAgICAgICBtKFwibGFiZWwucmFkaW8taW5saW5lXCIsIFwiVW5ibG9ja1wiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKFwiYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXByaW1hcnkuYnRuLWJsb2NrW3R5cGU9J3N1Ym1pdCddXCIsIFwiU2F2ZVwiKVxuICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgICksXG4gICAgICBtKFwiYS5idG4uYnRuLXdhcm5pbmcuYnRuLXhzLnB1bGwtcmlnaHRbaHJlZj0nL3VzZXJzL1wiICsgbS5yb3V0ZS5wYXJhbSgpLmlkICsgXCInXVtkYXRhLW1ldGhvZD0nZGVsZXRlJ11cIiwge2NvbmZpZzogbS5yb3V0ZX0sIFwiRGVsZXRlIFVzZXJcIilcbiAgICBdKV07XG4gIH1cbn07IiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgbWMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL0RhdGFUYWJsZS5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgdXNlcnMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwudXNlciA9IG0ucHJvcCgpO1xuXG4gICAgY3RybC5wcmlvcmV0eUZyb21hdGUgPSBmdW5jdGlvbih2YWx1ZSwgcm93LCBjb2wsIGF0dHJzKSB7XG4gICAgICBpZiAodmFsdWUgPT0gJ2hpZ2gnKSBhdHRycy5jbGFzcyA9ICdsYWJlbCBsYWJlbC1kYW5nZXInO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YXRhYmxlID0gbmV3IG1jLkRhdGF0YWJsZS5jb250cm9sbGVyKFxuICAgICAgLy8gQ29sdW1ucyBkZWZpbml0aW9uOlxuICAgICAgW1xuICAgICAgICB7IGtleTogXCJlbWFpbFwiLGxhYmVsOiBcIkVtYWlsXCIgfSxcbiAgICAgICAgeyBrZXk6IFwicGhvbmVcIixsYWJlbDogXCJQaG9uZVwiIH0sXG4gICAgICAgIHsga2V5OiBcInR5cGVcIixsYWJlbDogXCJUeXBlXCIgfSxcbiAgICAgICAgeyBrZXk6IFwic3RhdHVzXCIsbGFiZWw6IFwiU3RhdHVzXCIgfSxcbiAgICAgIF0sXG4gICAgICAvLyBPdGhlciBjb25maWd1cmF0aW9uOlxuICAgICAge1xuICAgICAgICAvLyBBZGRyZXNzIG9mIHRoZSB3ZWJzZXJ2ZXIgc3VwcGx5aW5nIHRoZSBkYXRhXG4gICAgICAgIHVybDogJ3VzZXJzJyxcbiAgICAgICAgYXV0aG9yaXphdGlvbjogQXV0aC50b2tlbigpLFxuICAgICAgICBvbkNlbGxDbGljazogZnVuY3Rpb24gKGNvbnRlbnQsIHJvdywgY29sKSB7XG4gICAgICAgICAgY29uc29sZS5sb2coY29udGVudCwgcm93LCBjb2wpO1xuICAgICAgICAgIG0ucm91dGUoXCIvdXNlckVkaXRcIix7aWQ6cm93LmlkfSlcbiAgICAgICAgfVxuICAgICAgICAvLyBIYW5kbGVyIG9mIGNsaWNrIGV2ZW50IG9uIGRhdGEgY2VsbFxuICAgICAgICAvLyBJdCByZWNlaXZlcyB0aGUgcmVsZXZhbnQgaW5mb3JtYXRpb24gYWxyZWFkeSByZXNvbHZlZFxuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gW05hdmJhci52aWV3KGN0cmwubmF2YmFyKSwgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgIG0oJ2gxJywgJ1VzZXJzIG1hbmFnZW1lbnQnKSxcbiAgICAgIG1jLkRhdGF0YWJsZS52aWV3KGN0cmwuZGF0YXRhYmxlLCB7XG4gICAgICAgIGNhcHRpb246ICdBbGwgdXNlcnMnXG4gICAgICB9KVxuICAgIF0pXTtcbiAgfVxufTtcbiIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgVmVyaWZ5ID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uKCl7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwubmF2YmFyID0gbmV3IE5hdmJhci5jb250cm9sbGVyKCk7XG4gICAgY3RybC5tZXNzYWdlID0gbS5wcm9wKCk7XG5cbiAgICBBdXRoLnZlcmlmeShtLnJvdXRlLnBhcmFtKFwiY29kZVwiKSkudGhlbihmdW5jdGlvbigpe1xuICAgICAgY3RybC5tZXNzYWdlKFtcbiAgICAgICAgJ1N3ZWV0LiBOb3csIHlvdSBjYW4gJyxcbiAgICAgICAgbSgnYVtocmVmPVwiL2xvZ2luXCJdJywge2NvbmZpZzogbS5yb3V0ZX0sICdsb2dpbicpLFxuICAgICAgICAnLidcbiAgICAgIF0pO1xuICAgIH0sIGZ1bmN0aW9uKCl7XG4gICAgICBjdHJsLm1lc3NhZ2UoJ0htbSwgdGhlcmUgd2FzIHNvbWV0aGluZyB3cm9uZyB3aXRoIHRoYXQgY29kZS4gQ2hlY2sgeW91ciBlbWFpbCBhZ2Fpbi4nKTtcbiAgICB9KTtcbiAgfSxcbiAgXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHJldHVybiBbTmF2YmFyLnZpZXcoY3RybC5uYXZiYXIpLCBtKCcuY29udGFpbmVyJywgW1xuICAgICAgbSgnaDEnLCAndmVyaWZ5JyksXG4gICAgICBjdHJsLm1lc3NhZ2UoKVxuICAgIF0pXTtcbiAgfVxufTsiXX0=
