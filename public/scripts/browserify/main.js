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
      // (Auth.user_type() == 'Agent'? { label: 'Reports', href: '/my_reports' }:{}),
      (Auth.user_type() != 'Customer'? { label: 'Reports', href: '/my_reports' }:{}),
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

    ticket_pdf: function () {
      return m.request({
          method: 'get',
          url: '/download_report',
          config: function (xhr) {
            xhr.setRequestHeader('Authorization', Auth.token());
            },
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


    Ticket.ticket_pdf()
      .then(function (report) {
        ctrl.report  = report
      }, function (err) {
        var message = 'An error occurred.';
        m.route('/reports')
        ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
      });

    // Ticket.ticket_pdf()
    // .then(function(report_file){
    //     ctrl.report_file = report_file
    //     ctrl.error(m(".alert.alert-success.animated.fadeInUp", 'user has been saved'));
    //   }, function(err){
    //     var message = 'An error occurred.';
        
    //     ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
    //   });


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
      m("a.btn.btn-primary.btn-xs.pull-right[href='/" + ctrl.report.report_file + "'][target='_blank']", "Download PDF")
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
      m("p", ctrl.ticket().ticket.title),
      m("p", ctrl.ticket().ticket.body),
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

      ctrl.ticket().ticket.status == 'closed' ? m("button.btn.btn-warning", { onclick: ctrl.open.bind(ctrl, 'opened') }, "ReOpen") :
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

  controller: function(args){
    var ctrl = this;
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

    User.get(m.route.param().id)
      .then(function (user) {
        ctrl.user = user
      }, function (err) {
        var message = 'An error occurred.';
        m.route('/users')
        ctrl.error(m(".alert.alert-danger.animated.fadeInUp", message));
      });

  },

  view: function(ctrl){
    return [Navbar.view(ctrl.navbar), m(".container", [
      m("form.text-center.row.form-user-edit", {onsubmit:ctrl.get.bind(ctrl)},
        m('.col-sm-6.col-sm-offset-3', [
          ctrl.error(),
          m("h1", ctrl.user.name),
          m('.form-group', [
            m("label.[for='inputName']", "Name"),
            m("input.form-control[name='name'][autofocus][id='inputTitle'][placeholder='Name '][type='text']", {value: ctrl.user.name}),
          ]),
          m('.form-group', [
            m("label.[for='inputPhone']", "Phone"),
            m("input.form-control[name='phone'][autofocus][id='inputbody'][placeholder='Phone '][type='text']", {value: ctrl.user.phone}),
          ]),
          m('.form-group.pull-left', [
            m("label.[for='inputStatus']", "Status"),
            m("input[name='status'][autofocus][id='inputStatusBlock'][value='blocked'][type='radio']", {}),
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
        { key: "name",label: "Name" },
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvdW5kZXJzY29yZS91bmRlcnNjb3JlLmpzIiwicHVibGljL3NjcmlwdHMvY29tcG9uZW50cy9EYXRhVGFibGUuanMiLCJwdWJsaWMvc2NyaXB0cy9jb21wb25lbnRzL05hdmJhci5qcyIsInB1YmxpYy9zY3JpcHRzL21haW4uanMiLCJwdWJsaWMvc2NyaXB0cy9tb2RlbHMvQXV0aC5qcyIsInB1YmxpYy9zY3JpcHRzL21vZGVscy9UaWNrZXQuanMiLCJwdWJsaWMvc2NyaXB0cy9tb2RlbHMvVXNlci5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL0xvZ2luLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvTG9nb3V0LmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvTXlSZXBvcnRzLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvUmVnaXN0ZXIuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9UYXN0eS5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1RpY2tldEVkaXQuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9UaWNrZXRQYWdlLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvVGlja2V0cy5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1VzZXJEZWxldGUuanMiLCJwdWJsaWMvc2NyaXB0cy9wYWdlcy9Vc2VyRWRpdC5qcyIsInB1YmxpYy9zY3JpcHRzL3BhZ2VzL1VzZXJzLmpzIiwicHVibGljL3NjcmlwdHMvcGFnZXMvVmVyaWZ5LmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDNWdEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOVNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzdDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3pCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzVFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuREE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDVkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3ZFQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDOURBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDN0NBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ2hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQ3JDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNsRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDaERBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvLyAgICAgVW5kZXJzY29yZS5qcyAxLjguM1xuLy8gICAgIGh0dHA6Ly91bmRlcnNjb3JlanMub3JnXG4vLyAgICAgKGMpIDIwMDktMjAxNSBKZXJlbXkgQXNoa2VuYXMsIERvY3VtZW50Q2xvdWQgYW5kIEludmVzdGlnYXRpdmUgUmVwb3J0ZXJzICYgRWRpdG9yc1xuLy8gICAgIFVuZGVyc2NvcmUgbWF5IGJlIGZyZWVseSBkaXN0cmlidXRlZCB1bmRlciB0aGUgTUlUIGxpY2Vuc2UuXG5cbihmdW5jdGlvbigpIHtcblxuICAvLyBCYXNlbGluZSBzZXR1cFxuICAvLyAtLS0tLS0tLS0tLS0tLVxuXG4gIC8vIEVzdGFibGlzaCB0aGUgcm9vdCBvYmplY3QsIGB3aW5kb3dgIGluIHRoZSBicm93c2VyLCBvciBgZXhwb3J0c2Agb24gdGhlIHNlcnZlci5cbiAgdmFyIHJvb3QgPSB0aGlzO1xuXG4gIC8vIFNhdmUgdGhlIHByZXZpb3VzIHZhbHVlIG9mIHRoZSBgX2AgdmFyaWFibGUuXG4gIHZhciBwcmV2aW91c1VuZGVyc2NvcmUgPSByb290Ll87XG5cbiAgLy8gU2F2ZSBieXRlcyBpbiB0aGUgbWluaWZpZWQgKGJ1dCBub3QgZ3ppcHBlZCkgdmVyc2lvbjpcbiAgdmFyIEFycmF5UHJvdG8gPSBBcnJheS5wcm90b3R5cGUsIE9ialByb3RvID0gT2JqZWN0LnByb3RvdHlwZSwgRnVuY1Byb3RvID0gRnVuY3Rpb24ucHJvdG90eXBlO1xuXG4gIC8vIENyZWF0ZSBxdWljayByZWZlcmVuY2UgdmFyaWFibGVzIGZvciBzcGVlZCBhY2Nlc3MgdG8gY29yZSBwcm90b3R5cGVzLlxuICB2YXJcbiAgICBwdXNoICAgICAgICAgICAgID0gQXJyYXlQcm90by5wdXNoLFxuICAgIHNsaWNlICAgICAgICAgICAgPSBBcnJheVByb3RvLnNsaWNlLFxuICAgIHRvU3RyaW5nICAgICAgICAgPSBPYmpQcm90by50b1N0cmluZyxcbiAgICBoYXNPd25Qcm9wZXJ0eSAgID0gT2JqUHJvdG8uaGFzT3duUHJvcGVydHk7XG5cbiAgLy8gQWxsICoqRUNNQVNjcmlwdCA1KiogbmF0aXZlIGZ1bmN0aW9uIGltcGxlbWVudGF0aW9ucyB0aGF0IHdlIGhvcGUgdG8gdXNlXG4gIC8vIGFyZSBkZWNsYXJlZCBoZXJlLlxuICB2YXJcbiAgICBuYXRpdmVJc0FycmF5ICAgICAgPSBBcnJheS5pc0FycmF5LFxuICAgIG5hdGl2ZUtleXMgICAgICAgICA9IE9iamVjdC5rZXlzLFxuICAgIG5hdGl2ZUJpbmQgICAgICAgICA9IEZ1bmNQcm90by5iaW5kLFxuICAgIG5hdGl2ZUNyZWF0ZSAgICAgICA9IE9iamVjdC5jcmVhdGU7XG5cbiAgLy8gTmFrZWQgZnVuY3Rpb24gcmVmZXJlbmNlIGZvciBzdXJyb2dhdGUtcHJvdG90eXBlLXN3YXBwaW5nLlxuICB2YXIgQ3RvciA9IGZ1bmN0aW9uKCl7fTtcblxuICAvLyBDcmVhdGUgYSBzYWZlIHJlZmVyZW5jZSB0byB0aGUgVW5kZXJzY29yZSBvYmplY3QgZm9yIHVzZSBiZWxvdy5cbiAgdmFyIF8gPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAob2JqIGluc3RhbmNlb2YgXykgcmV0dXJuIG9iajtcbiAgICBpZiAoISh0aGlzIGluc3RhbmNlb2YgXykpIHJldHVybiBuZXcgXyhvYmopO1xuICAgIHRoaXMuX3dyYXBwZWQgPSBvYmo7XG4gIH07XG5cbiAgLy8gRXhwb3J0IHRoZSBVbmRlcnNjb3JlIG9iamVjdCBmb3IgKipOb2RlLmpzKiosIHdpdGhcbiAgLy8gYmFja3dhcmRzLWNvbXBhdGliaWxpdHkgZm9yIHRoZSBvbGQgYHJlcXVpcmUoKWAgQVBJLiBJZiB3ZSdyZSBpblxuICAvLyB0aGUgYnJvd3NlciwgYWRkIGBfYCBhcyBhIGdsb2JhbCBvYmplY3QuXG4gIGlmICh0eXBlb2YgZXhwb3J0cyAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICBpZiAodHlwZW9mIG1vZHVsZSAhPT0gJ3VuZGVmaW5lZCcgJiYgbW9kdWxlLmV4cG9ydHMpIHtcbiAgICAgIGV4cG9ydHMgPSBtb2R1bGUuZXhwb3J0cyA9IF87XG4gICAgfVxuICAgIGV4cG9ydHMuXyA9IF87XG4gIH0gZWxzZSB7XG4gICAgcm9vdC5fID0gXztcbiAgfVxuXG4gIC8vIEN1cnJlbnQgdmVyc2lvbi5cbiAgXy5WRVJTSU9OID0gJzEuOC4zJztcblxuICAvLyBJbnRlcm5hbCBmdW5jdGlvbiB0aGF0IHJldHVybnMgYW4gZWZmaWNpZW50IChmb3IgY3VycmVudCBlbmdpbmVzKSB2ZXJzaW9uXG4gIC8vIG9mIHRoZSBwYXNzZWQtaW4gY2FsbGJhY2ssIHRvIGJlIHJlcGVhdGVkbHkgYXBwbGllZCBpbiBvdGhlciBVbmRlcnNjb3JlXG4gIC8vIGZ1bmN0aW9ucy5cbiAgdmFyIG9wdGltaXplQ2IgPSBmdW5jdGlvbihmdW5jLCBjb250ZXh0LCBhcmdDb3VudCkge1xuICAgIGlmIChjb250ZXh0ID09PSB2b2lkIDApIHJldHVybiBmdW5jO1xuICAgIHN3aXRjaCAoYXJnQ291bnQgPT0gbnVsbCA/IDMgOiBhcmdDb3VudCkge1xuICAgICAgY2FzZSAxOiByZXR1cm4gZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSk7XG4gICAgICB9O1xuICAgICAgY2FzZSAyOiByZXR1cm4gZnVuY3Rpb24odmFsdWUsIG90aGVyKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmNhbGwoY29udGV4dCwgdmFsdWUsIG90aGVyKTtcbiAgICAgIH07XG4gICAgICBjYXNlIDM6IHJldHVybiBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pO1xuICAgICAgfTtcbiAgICAgIGNhc2UgNDogcmV0dXJuIGZ1bmN0aW9uKGFjY3VtdWxhdG9yLCB2YWx1ZSwgaW5kZXgsIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgcmV0dXJuIGZ1bmMuY2FsbChjb250ZXh0LCBhY2N1bXVsYXRvciwgdmFsdWUsIGluZGV4LCBjb2xsZWN0aW9uKTtcbiAgICAgIH07XG4gICAgfVxuICAgIHJldHVybiBmdW5jdGlvbigpIHtcbiAgICAgIHJldHVybiBmdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3VtZW50cyk7XG4gICAgfTtcbiAgfTtcblxuICAvLyBBIG1vc3RseS1pbnRlcm5hbCBmdW5jdGlvbiB0byBnZW5lcmF0ZSBjYWxsYmFja3MgdGhhdCBjYW4gYmUgYXBwbGllZFxuICAvLyB0byBlYWNoIGVsZW1lbnQgaW4gYSBjb2xsZWN0aW9uLCByZXR1cm5pbmcgdGhlIGRlc2lyZWQgcmVzdWx0IOKAlCBlaXRoZXJcbiAgLy8gaWRlbnRpdHksIGFuIGFyYml0cmFyeSBjYWxsYmFjaywgYSBwcm9wZXJ0eSBtYXRjaGVyLCBvciBhIHByb3BlcnR5IGFjY2Vzc29yLlxuICB2YXIgY2IgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCwgYXJnQ291bnQpIHtcbiAgICBpZiAodmFsdWUgPT0gbnVsbCkgcmV0dXJuIF8uaWRlbnRpdHk7XG4gICAgaWYgKF8uaXNGdW5jdGlvbih2YWx1ZSkpIHJldHVybiBvcHRpbWl6ZUNiKHZhbHVlLCBjb250ZXh0LCBhcmdDb3VudCk7XG4gICAgaWYgKF8uaXNPYmplY3QodmFsdWUpKSByZXR1cm4gXy5tYXRjaGVyKHZhbHVlKTtcbiAgICByZXR1cm4gXy5wcm9wZXJ0eSh2YWx1ZSk7XG4gIH07XG4gIF8uaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBjYih2YWx1ZSwgY29udGV4dCwgSW5maW5pdHkpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhc3NpZ25lciBmdW5jdGlvbnMuXG4gIHZhciBjcmVhdGVBc3NpZ25lciA9IGZ1bmN0aW9uKGtleXNGdW5jLCB1bmRlZmluZWRPbmx5KSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaikge1xuICAgICAgdmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG4gICAgICBpZiAobGVuZ3RoIDwgMiB8fCBvYmogPT0gbnVsbCkgcmV0dXJuIG9iajtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMTsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgdmFyIHNvdXJjZSA9IGFyZ3VtZW50c1tpbmRleF0sXG4gICAgICAgICAgICBrZXlzID0ga2V5c0Z1bmMoc291cmNlKSxcbiAgICAgICAgICAgIGwgPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsOyBpKyspIHtcbiAgICAgICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgICAgICBpZiAoIXVuZGVmaW5lZE9ubHkgfHwgb2JqW2tleV0gPT09IHZvaWQgMCkgb2JqW2tleV0gPSBzb3VyY2Vba2V5XTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIG9iajtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIGZvciBjcmVhdGluZyBhIG5ldyBvYmplY3QgdGhhdCBpbmhlcml0cyBmcm9tIGFub3RoZXIuXG4gIHZhciBiYXNlQ3JlYXRlID0gZnVuY3Rpb24ocHJvdG90eXBlKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KHByb3RvdHlwZSkpIHJldHVybiB7fTtcbiAgICBpZiAobmF0aXZlQ3JlYXRlKSByZXR1cm4gbmF0aXZlQ3JlYXRlKHByb3RvdHlwZSk7XG4gICAgQ3Rvci5wcm90b3R5cGUgPSBwcm90b3R5cGU7XG4gICAgdmFyIHJlc3VsdCA9IG5ldyBDdG9yO1xuICAgIEN0b3IucHJvdG90eXBlID0gbnVsbDtcbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIHZhciBwcm9wZXJ0eSA9IGZ1bmN0aW9uKGtleSkge1xuICAgIHJldHVybiBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBvYmogPT0gbnVsbCA/IHZvaWQgMCA6IG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gSGVscGVyIGZvciBjb2xsZWN0aW9uIG1ldGhvZHMgdG8gZGV0ZXJtaW5lIHdoZXRoZXIgYSBjb2xsZWN0aW9uXG4gIC8vIHNob3VsZCBiZSBpdGVyYXRlZCBhcyBhbiBhcnJheSBvciBhcyBhbiBvYmplY3RcbiAgLy8gUmVsYXRlZDogaHR0cDovL3Blb3BsZS5tb3ppbGxhLm9yZy9+am9yZW5kb3JmZi9lczYtZHJhZnQuaHRtbCNzZWMtdG9sZW5ndGhcbiAgLy8gQXZvaWRzIGEgdmVyeSBuYXN0eSBpT1MgOCBKSVQgYnVnIG9uIEFSTS02NC4gIzIwOTRcbiAgdmFyIE1BWF9BUlJBWV9JTkRFWCA9IE1hdGgucG93KDIsIDUzKSAtIDE7XG4gIHZhciBnZXRMZW5ndGggPSBwcm9wZXJ0eSgnbGVuZ3RoJyk7XG4gIHZhciBpc0FycmF5TGlrZSA9IGZ1bmN0aW9uKGNvbGxlY3Rpb24pIHtcbiAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGNvbGxlY3Rpb24pO1xuICAgIHJldHVybiB0eXBlb2YgbGVuZ3RoID09ICdudW1iZXInICYmIGxlbmd0aCA+PSAwICYmIGxlbmd0aCA8PSBNQVhfQVJSQVlfSU5ERVg7XG4gIH07XG5cbiAgLy8gQ29sbGVjdGlvbiBGdW5jdGlvbnNcbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS1cblxuICAvLyBUaGUgY29ybmVyc3RvbmUsIGFuIGBlYWNoYCBpbXBsZW1lbnRhdGlvbiwgYWthIGBmb3JFYWNoYC5cbiAgLy8gSGFuZGxlcyByYXcgb2JqZWN0cyBpbiBhZGRpdGlvbiB0byBhcnJheS1saWtlcy4gVHJlYXRzIGFsbFxuICAvLyBzcGFyc2UgYXJyYXktbGlrZXMgYXMgaWYgdGhleSB3ZXJlIGRlbnNlLlxuICBfLmVhY2ggPSBfLmZvckVhY2ggPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIgaSwgbGVuZ3RoO1xuICAgIGlmIChpc0FycmF5TGlrZShvYmopKSB7XG4gICAgICBmb3IgKGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaXRlcmF0ZWUob2JqW2ldLCBpLCBvYmopO1xuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgICAgZm9yIChpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBpdGVyYXRlZShvYmpba2V5c1tpXV0sIGtleXNbaV0sIG9iaik7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQuXG4gIF8ubWFwID0gXy5jb2xsZWN0ID0gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICByZXN1bHRzID0gQXJyYXkobGVuZ3RoKTtcbiAgICBmb3IgKHZhciBpbmRleCA9IDA7IGluZGV4IDwgbGVuZ3RoOyBpbmRleCsrKSB7XG4gICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgcmVzdWx0c1tpbmRleF0gPSBpdGVyYXRlZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaik7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHRzO1xuICB9O1xuXG4gIC8vIENyZWF0ZSBhIHJlZHVjaW5nIGZ1bmN0aW9uIGl0ZXJhdGluZyBsZWZ0IG9yIHJpZ2h0LlxuICBmdW5jdGlvbiBjcmVhdGVSZWR1Y2UoZGlyKSB7XG4gICAgLy8gT3B0aW1pemVkIGl0ZXJhdG9yIGZ1bmN0aW9uIGFzIHVzaW5nIGFyZ3VtZW50cy5sZW5ndGhcbiAgICAvLyBpbiB0aGUgbWFpbiBmdW5jdGlvbiB3aWxsIGRlb3B0aW1pemUgdGhlLCBzZWUgIzE5OTEuXG4gICAgZnVuY3Rpb24gaXRlcmF0b3Iob2JqLCBpdGVyYXRlZSwgbWVtbywga2V5cywgaW5kZXgsIGxlbmd0aCkge1xuICAgICAgZm9yICg7IGluZGV4ID49IDAgJiYgaW5kZXggPCBsZW5ndGg7IGluZGV4ICs9IGRpcikge1xuICAgICAgICB2YXIgY3VycmVudEtleSA9IGtleXMgPyBrZXlzW2luZGV4XSA6IGluZGV4O1xuICAgICAgICBtZW1vID0gaXRlcmF0ZWUobWVtbywgb2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIG1lbW87XG4gICAgfVxuXG4gICAgcmV0dXJuIGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIG1lbW8sIGNvbnRleHQpIHtcbiAgICAgIGl0ZXJhdGVlID0gb3B0aW1pemVDYihpdGVyYXRlZSwgY29udGV4dCwgNCk7XG4gICAgICB2YXIga2V5cyA9ICFpc0FycmF5TGlrZShvYmopICYmIF8ua2V5cyhvYmopLFxuICAgICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoLFxuICAgICAgICAgIGluZGV4ID0gZGlyID4gMCA/IDAgOiBsZW5ndGggLSAxO1xuICAgICAgLy8gRGV0ZXJtaW5lIHRoZSBpbml0aWFsIHZhbHVlIGlmIG5vbmUgaXMgcHJvdmlkZWQuXG4gICAgICBpZiAoYXJndW1lbnRzLmxlbmd0aCA8IDMpIHtcbiAgICAgICAgbWVtbyA9IG9ialtrZXlzID8ga2V5c1tpbmRleF0gOiBpbmRleF07XG4gICAgICAgIGluZGV4ICs9IGRpcjtcbiAgICAgIH1cbiAgICAgIHJldHVybiBpdGVyYXRvcihvYmosIGl0ZXJhdGVlLCBtZW1vLCBrZXlzLCBpbmRleCwgbGVuZ3RoKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gKipSZWR1Y2UqKiBidWlsZHMgdXAgYSBzaW5nbGUgcmVzdWx0IGZyb20gYSBsaXN0IG9mIHZhbHVlcywgYWthIGBpbmplY3RgLFxuICAvLyBvciBgZm9sZGxgLlxuICBfLnJlZHVjZSA9IF8uZm9sZGwgPSBfLmluamVjdCA9IGNyZWF0ZVJlZHVjZSgxKTtcblxuICAvLyBUaGUgcmlnaHQtYXNzb2NpYXRpdmUgdmVyc2lvbiBvZiByZWR1Y2UsIGFsc28ga25vd24gYXMgYGZvbGRyYC5cbiAgXy5yZWR1Y2VSaWdodCA9IF8uZm9sZHIgPSBjcmVhdGVSZWR1Y2UoLTEpO1xuXG4gIC8vIFJldHVybiB0aGUgZmlyc3QgdmFsdWUgd2hpY2ggcGFzc2VzIGEgdHJ1dGggdGVzdC4gQWxpYXNlZCBhcyBgZGV0ZWN0YC5cbiAgXy5maW5kID0gXy5kZXRlY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHZhciBrZXk7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHtcbiAgICAgIGtleSA9IF8uZmluZEluZGV4KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9IGVsc2Uge1xuICAgICAga2V5ID0gXy5maW5kS2V5KG9iaiwgcHJlZGljYXRlLCBjb250ZXh0KTtcbiAgICB9XG4gICAgaWYgKGtleSAhPT0gdm9pZCAwICYmIGtleSAhPT0gLTEpIHJldHVybiBvYmpba2V5XTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYWxsIHRoZSBlbGVtZW50cyB0aGF0IHBhc3MgYSB0cnV0aCB0ZXN0LlxuICAvLyBBbGlhc2VkIGFzIGBzZWxlY3RgLlxuICBfLmZpbHRlciA9IF8uc2VsZWN0ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICBpZiAocHJlZGljYXRlKHZhbHVlLCBpbmRleCwgbGlzdCkpIHJlc3VsdHMucHVzaCh2YWx1ZSk7XG4gICAgfSk7XG4gICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGFsbCB0aGUgZWxlbWVudHMgZm9yIHdoaWNoIGEgdHJ1dGggdGVzdCBmYWlscy5cbiAgXy5yZWplY3QgPSBmdW5jdGlvbihvYmosIHByZWRpY2F0ZSwgY29udGV4dCkge1xuICAgIHJldHVybiBfLmZpbHRlcihvYmosIF8ubmVnYXRlKGNiKHByZWRpY2F0ZSkpLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgd2hldGhlciBhbGwgb2YgdGhlIGVsZW1lbnRzIG1hdGNoIGEgdHJ1dGggdGVzdC5cbiAgLy8gQWxpYXNlZCBhcyBgYWxsYC5cbiAgXy5ldmVyeSA9IF8uYWxsID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAoIXByZWRpY2F0ZShvYmpbY3VycmVudEtleV0sIGN1cnJlbnRLZXksIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cbiAgLy8gRGV0ZXJtaW5lIGlmIGF0IGxlYXN0IG9uZSBlbGVtZW50IGluIHRoZSBvYmplY3QgbWF0Y2hlcyBhIHRydXRoIHRlc3QuXG4gIC8vIEFsaWFzZWQgYXMgYGFueWAuXG4gIF8uc29tZSA9IF8uYW55ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gIWlzQXJyYXlMaWtlKG9iaikgJiYgXy5rZXlzKG9iaiksXG4gICAgICAgIGxlbmd0aCA9IChrZXlzIHx8IG9iaikubGVuZ3RoO1xuICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgIHZhciBjdXJyZW50S2V5ID0ga2V5cyA/IGtleXNbaW5kZXhdIDogaW5kZXg7XG4gICAgICBpZiAocHJlZGljYXRlKG9ialtjdXJyZW50S2V5XSwgY3VycmVudEtleSwgb2JqKSkgcmV0dXJuIHRydWU7XG4gICAgfVxuICAgIHJldHVybiBmYWxzZTtcbiAgfTtcblxuICAvLyBEZXRlcm1pbmUgaWYgdGhlIGFycmF5IG9yIG9iamVjdCBjb250YWlucyBhIGdpdmVuIGl0ZW0gKHVzaW5nIGA9PT1gKS5cbiAgLy8gQWxpYXNlZCBhcyBgaW5jbHVkZXNgIGFuZCBgaW5jbHVkZWAuXG4gIF8uY29udGFpbnMgPSBfLmluY2x1ZGVzID0gXy5pbmNsdWRlID0gZnVuY3Rpb24ob2JqLCBpdGVtLCBmcm9tSW5kZXgsIGd1YXJkKSB7XG4gICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgIGlmICh0eXBlb2YgZnJvbUluZGV4ICE9ICdudW1iZXInIHx8IGd1YXJkKSBmcm9tSW5kZXggPSAwO1xuICAgIHJldHVybiBfLmluZGV4T2Yob2JqLCBpdGVtLCBmcm9tSW5kZXgpID49IDA7XG4gIH07XG5cbiAgLy8gSW52b2tlIGEgbWV0aG9kICh3aXRoIGFyZ3VtZW50cykgb24gZXZlcnkgaXRlbSBpbiBhIGNvbGxlY3Rpb24uXG4gIF8uaW52b2tlID0gZnVuY3Rpb24ob2JqLCBtZXRob2QpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICB2YXIgaXNGdW5jID0gXy5pc0Z1bmN0aW9uKG1ldGhvZCk7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgZnVuY3Rpb24odmFsdWUpIHtcbiAgICAgIHZhciBmdW5jID0gaXNGdW5jID8gbWV0aG9kIDogdmFsdWVbbWV0aG9kXTtcbiAgICAgIHJldHVybiBmdW5jID09IG51bGwgPyBmdW5jIDogZnVuYy5hcHBseSh2YWx1ZSwgYXJncyk7XG4gICAgfSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgbWFwYDogZmV0Y2hpbmcgYSBwcm9wZXJ0eS5cbiAgXy5wbHVjayA9IGZ1bmN0aW9uKG9iaiwga2V5KSB7XG4gICAgcmV0dXJuIF8ubWFwKG9iaiwgXy5wcm9wZXJ0eShrZXkpKTtcbiAgfTtcblxuICAvLyBDb252ZW5pZW5jZSB2ZXJzaW9uIG9mIGEgY29tbW9uIHVzZSBjYXNlIG9mIGBmaWx0ZXJgOiBzZWxlY3Rpbmcgb25seSBvYmplY3RzXG4gIC8vIGNvbnRhaW5pbmcgc3BlY2lmaWMgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8ud2hlcmUgPSBmdW5jdGlvbihvYmosIGF0dHJzKSB7XG4gICAgcmV0dXJuIF8uZmlsdGVyKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gQ29udmVuaWVuY2UgdmVyc2lvbiBvZiBhIGNvbW1vbiB1c2UgY2FzZSBvZiBgZmluZGA6IGdldHRpbmcgdGhlIGZpcnN0IG9iamVjdFxuICAvLyBjb250YWluaW5nIHNwZWNpZmljIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLmZpbmRXaGVyZSA9IGZ1bmN0aW9uKG9iaiwgYXR0cnMpIHtcbiAgICByZXR1cm4gXy5maW5kKG9iaiwgXy5tYXRjaGVyKGF0dHJzKSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIHRoZSBtYXhpbXVtIGVsZW1lbnQgKG9yIGVsZW1lbnQtYmFzZWQgY29tcHV0YXRpb24pLlxuICBfLm1heCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0gLUluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSAtSW5maW5pdHksXG4gICAgICAgIHZhbHVlLCBjb21wdXRlZDtcbiAgICBpZiAoaXRlcmF0ZWUgPT0gbnVsbCAmJiBvYmogIT0gbnVsbCkge1xuICAgICAgb2JqID0gaXNBcnJheUxpa2Uob2JqKSA/IG9iaiA6IF8udmFsdWVzKG9iaik7XG4gICAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gb2JqLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZhbHVlID0gb2JqW2ldO1xuICAgICAgICBpZiAodmFsdWUgPiByZXN1bHQpIHtcbiAgICAgICAgICByZXN1bHQgPSB2YWx1ZTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH0gZWxzZSB7XG4gICAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICAgIF8uZWFjaChvYmosIGZ1bmN0aW9uKHZhbHVlLCBpbmRleCwgbGlzdCkge1xuICAgICAgICBjb21wdXRlZCA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgbGlzdCk7XG4gICAgICAgIGlmIChjb21wdXRlZCA+IGxhc3RDb21wdXRlZCB8fCBjb21wdXRlZCA9PT0gLUluZmluaXR5ICYmIHJlc3VsdCA9PT0gLUluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbWluaW11bSBlbGVtZW50IChvciBlbGVtZW50LWJhc2VkIGNvbXB1dGF0aW9uKS5cbiAgXy5taW4gPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgdmFyIHJlc3VsdCA9IEluZmluaXR5LCBsYXN0Q29tcHV0ZWQgPSBJbmZpbml0eSxcbiAgICAgICAgdmFsdWUsIGNvbXB1dGVkO1xuICAgIGlmIChpdGVyYXRlZSA9PSBudWxsICYmIG9iaiAhPSBudWxsKSB7XG4gICAgICBvYmogPSBpc0FycmF5TGlrZShvYmopID8gb2JqIDogXy52YWx1ZXMob2JqKTtcbiAgICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBvYmoubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFsdWUgPSBvYmpbaV07XG4gICAgICAgIGlmICh2YWx1ZSA8IHJlc3VsdCkge1xuICAgICAgICAgIHJlc3VsdCA9IHZhbHVlO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgICAgXy5lYWNoKG9iaiwgZnVuY3Rpb24odmFsdWUsIGluZGV4LCBsaXN0KSB7XG4gICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KTtcbiAgICAgICAgaWYgKGNvbXB1dGVkIDwgbGFzdENvbXB1dGVkIHx8IGNvbXB1dGVkID09PSBJbmZpbml0eSAmJiByZXN1bHQgPT09IEluZmluaXR5KSB7XG4gICAgICAgICAgcmVzdWx0ID0gdmFsdWU7XG4gICAgICAgICAgbGFzdENvbXB1dGVkID0gY29tcHV0ZWQ7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIFNodWZmbGUgYSBjb2xsZWN0aW9uLCB1c2luZyB0aGUgbW9kZXJuIHZlcnNpb24gb2YgdGhlXG4gIC8vIFtGaXNoZXItWWF0ZXMgc2h1ZmZsZV0oaHR0cDovL2VuLndpa2lwZWRpYS5vcmcvd2lraS9GaXNoZXLigJNZYXRlc19zaHVmZmxlKS5cbiAgXy5zaHVmZmxlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHNldCA9IGlzQXJyYXlMaWtlKG9iaikgPyBvYmogOiBfLnZhbHVlcyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBzZXQubGVuZ3RoO1xuICAgIHZhciBzaHVmZmxlZCA9IEFycmF5KGxlbmd0aCk7XG4gICAgZm9yICh2YXIgaW5kZXggPSAwLCByYW5kOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmFuZCA9IF8ucmFuZG9tKDAsIGluZGV4KTtcbiAgICAgIGlmIChyYW5kICE9PSBpbmRleCkgc2h1ZmZsZWRbaW5kZXhdID0gc2h1ZmZsZWRbcmFuZF07XG4gICAgICBzaHVmZmxlZFtyYW5kXSA9IHNldFtpbmRleF07XG4gICAgfVxuICAgIHJldHVybiBzaHVmZmxlZDtcbiAgfTtcblxuICAvLyBTYW1wbGUgKipuKiogcmFuZG9tIHZhbHVlcyBmcm9tIGEgY29sbGVjdGlvbi5cbiAgLy8gSWYgKipuKiogaXMgbm90IHNwZWNpZmllZCwgcmV0dXJucyBhIHNpbmdsZSByYW5kb20gZWxlbWVudC5cbiAgLy8gVGhlIGludGVybmFsIGBndWFyZGAgYXJndW1lbnQgYWxsb3dzIGl0IHRvIHdvcmsgd2l0aCBgbWFwYC5cbiAgXy5zYW1wbGUgPSBmdW5jdGlvbihvYmosIG4sIGd1YXJkKSB7XG4gICAgaWYgKG4gPT0gbnVsbCB8fCBndWFyZCkge1xuICAgICAgaWYgKCFpc0FycmF5TGlrZShvYmopKSBvYmogPSBfLnZhbHVlcyhvYmopO1xuICAgICAgcmV0dXJuIG9ialtfLnJhbmRvbShvYmoubGVuZ3RoIC0gMSldO1xuICAgIH1cbiAgICByZXR1cm4gXy5zaHVmZmxlKG9iaikuc2xpY2UoMCwgTWF0aC5tYXgoMCwgbikpO1xuICB9O1xuXG4gIC8vIFNvcnQgdGhlIG9iamVjdCdzIHZhbHVlcyBieSBhIGNyaXRlcmlvbiBwcm9kdWNlZCBieSBhbiBpdGVyYXRlZS5cbiAgXy5zb3J0QnkgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgcmV0dXJuIF8ucGx1Y2soXy5tYXAob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgsIGxpc3QpIHtcbiAgICAgIHJldHVybiB7XG4gICAgICAgIHZhbHVlOiB2YWx1ZSxcbiAgICAgICAgaW5kZXg6IGluZGV4LFxuICAgICAgICBjcml0ZXJpYTogaXRlcmF0ZWUodmFsdWUsIGluZGV4LCBsaXN0KVxuICAgICAgfTtcbiAgICB9KS5zb3J0KGZ1bmN0aW9uKGxlZnQsIHJpZ2h0KSB7XG4gICAgICB2YXIgYSA9IGxlZnQuY3JpdGVyaWE7XG4gICAgICB2YXIgYiA9IHJpZ2h0LmNyaXRlcmlhO1xuICAgICAgaWYgKGEgIT09IGIpIHtcbiAgICAgICAgaWYgKGEgPiBiIHx8IGEgPT09IHZvaWQgMCkgcmV0dXJuIDE7XG4gICAgICAgIGlmIChhIDwgYiB8fCBiID09PSB2b2lkIDApIHJldHVybiAtMTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBsZWZ0LmluZGV4IC0gcmlnaHQuaW5kZXg7XG4gICAgfSksICd2YWx1ZScpO1xuICB9O1xuXG4gIC8vIEFuIGludGVybmFsIGZ1bmN0aW9uIHVzZWQgZm9yIGFnZ3JlZ2F0ZSBcImdyb3VwIGJ5XCIgb3BlcmF0aW9ucy5cbiAgdmFyIGdyb3VwID0gZnVuY3Rpb24oYmVoYXZpb3IpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCk7XG4gICAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwgaW5kZXgpIHtcbiAgICAgICAgdmFyIGtleSA9IGl0ZXJhdGVlKHZhbHVlLCBpbmRleCwgb2JqKTtcbiAgICAgICAgYmVoYXZpb3IocmVzdWx0LCB2YWx1ZSwga2V5KTtcbiAgICAgIH0pO1xuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIEdyb3VwcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLiBQYXNzIGVpdGhlciBhIHN0cmluZyBhdHRyaWJ1dGVcbiAgLy8gdG8gZ3JvdXAgYnksIG9yIGEgZnVuY3Rpb24gdGhhdCByZXR1cm5zIHRoZSBjcml0ZXJpb24uXG4gIF8uZ3JvdXBCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIGlmIChfLmhhcyhyZXN1bHQsIGtleSkpIHJlc3VsdFtrZXldLnB1c2godmFsdWUpOyBlbHNlIHJlc3VsdFtrZXldID0gW3ZhbHVlXTtcbiAgfSk7XG5cbiAgLy8gSW5kZXhlcyB0aGUgb2JqZWN0J3MgdmFsdWVzIGJ5IGEgY3JpdGVyaW9uLCBzaW1pbGFyIHRvIGBncm91cEJ5YCwgYnV0IGZvclxuICAvLyB3aGVuIHlvdSBrbm93IHRoYXQgeW91ciBpbmRleCB2YWx1ZXMgd2lsbCBiZSB1bmlxdWUuXG4gIF8uaW5kZXhCeSA9IGdyb3VwKGZ1bmN0aW9uKHJlc3VsdCwgdmFsdWUsIGtleSkge1xuICAgIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gIH0pO1xuXG4gIC8vIENvdW50cyBpbnN0YW5jZXMgb2YgYW4gb2JqZWN0IHRoYXQgZ3JvdXAgYnkgYSBjZXJ0YWluIGNyaXRlcmlvbi4gUGFzc1xuICAvLyBlaXRoZXIgYSBzdHJpbmcgYXR0cmlidXRlIHRvIGNvdW50IGJ5LCBvciBhIGZ1bmN0aW9uIHRoYXQgcmV0dXJucyB0aGVcbiAgLy8gY3JpdGVyaW9uLlxuICBfLmNvdW50QnkgPSBncm91cChmdW5jdGlvbihyZXN1bHQsIHZhbHVlLCBrZXkpIHtcbiAgICBpZiAoXy5oYXMocmVzdWx0LCBrZXkpKSByZXN1bHRba2V5XSsrOyBlbHNlIHJlc3VsdFtrZXldID0gMTtcbiAgfSk7XG5cbiAgLy8gU2FmZWx5IGNyZWF0ZSBhIHJlYWwsIGxpdmUgYXJyYXkgZnJvbSBhbnl0aGluZyBpdGVyYWJsZS5cbiAgXy50b0FycmF5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFvYmopIHJldHVybiBbXTtcbiAgICBpZiAoXy5pc0FycmF5KG9iaikpIHJldHVybiBzbGljZS5jYWxsKG9iaik7XG4gICAgaWYgKGlzQXJyYXlMaWtlKG9iaikpIHJldHVybiBfLm1hcChvYmosIF8uaWRlbnRpdHkpO1xuICAgIHJldHVybiBfLnZhbHVlcyhvYmopO1xuICB9O1xuXG4gIC8vIFJldHVybiB0aGUgbnVtYmVyIG9mIGVsZW1lbnRzIGluIGFuIG9iamVjdC5cbiAgXy5zaXplID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gMDtcbiAgICByZXR1cm4gaXNBcnJheUxpa2Uob2JqKSA/IG9iai5sZW5ndGggOiBfLmtleXMob2JqKS5sZW5ndGg7XG4gIH07XG5cbiAgLy8gU3BsaXQgYSBjb2xsZWN0aW9uIGludG8gdHdvIGFycmF5czogb25lIHdob3NlIGVsZW1lbnRzIGFsbCBzYXRpc2Z5IHRoZSBnaXZlblxuICAvLyBwcmVkaWNhdGUsIGFuZCBvbmUgd2hvc2UgZWxlbWVudHMgYWxsIGRvIG5vdCBzYXRpc2Z5IHRoZSBwcmVkaWNhdGUuXG4gIF8ucGFydGl0aW9uID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBwYXNzID0gW10sIGZhaWwgPSBbXTtcbiAgICBfLmVhY2gob2JqLCBmdW5jdGlvbih2YWx1ZSwga2V5LCBvYmopIHtcbiAgICAgIChwcmVkaWNhdGUodmFsdWUsIGtleSwgb2JqKSA/IHBhc3MgOiBmYWlsKS5wdXNoKHZhbHVlKTtcbiAgICB9KTtcbiAgICByZXR1cm4gW3Bhc3MsIGZhaWxdO1xuICB9O1xuXG4gIC8vIEFycmF5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS1cblxuICAvLyBHZXQgdGhlIGZpcnN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGZpcnN0IE5cbiAgLy8gdmFsdWVzIGluIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgaGVhZGAgYW5kIGB0YWtlYC4gVGhlICoqZ3VhcmQqKiBjaGVja1xuICAvLyBhbGxvd3MgaXQgdG8gd29yayB3aXRoIGBfLm1hcGAuXG4gIF8uZmlyc3QgPSBfLmhlYWQgPSBfLnRha2UgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbMF07XG4gICAgcmV0dXJuIF8uaW5pdGlhbChhcnJheSwgYXJyYXkubGVuZ3RoIC0gbik7XG4gIH07XG5cbiAgLy8gUmV0dXJucyBldmVyeXRoaW5nIGJ1dCB0aGUgbGFzdCBlbnRyeSBvZiB0aGUgYXJyYXkuIEVzcGVjaWFsbHkgdXNlZnVsIG9uXG4gIC8vIHRoZSBhcmd1bWVudHMgb2JqZWN0LiBQYXNzaW5nICoqbioqIHdpbGwgcmV0dXJuIGFsbCB0aGUgdmFsdWVzIGluXG4gIC8vIHRoZSBhcnJheSwgZXhjbHVkaW5nIHRoZSBsYXN0IE4uXG4gIF8uaW5pdGlhbCA9IGZ1bmN0aW9uKGFycmF5LCBuLCBndWFyZCkge1xuICAgIHJldHVybiBzbGljZS5jYWxsKGFycmF5LCAwLCBNYXRoLm1heCgwLCBhcnJheS5sZW5ndGggLSAobiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pKSk7XG4gIH07XG5cbiAgLy8gR2V0IHRoZSBsYXN0IGVsZW1lbnQgb2YgYW4gYXJyYXkuIFBhc3NpbmcgKipuKiogd2lsbCByZXR1cm4gdGhlIGxhc3QgTlxuICAvLyB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLmxhc3QgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICBpZiAoYXJyYXkgPT0gbnVsbCkgcmV0dXJuIHZvaWQgMDtcbiAgICBpZiAobiA9PSBudWxsIHx8IGd1YXJkKSByZXR1cm4gYXJyYXlbYXJyYXkubGVuZ3RoIC0gMV07XG4gICAgcmV0dXJuIF8ucmVzdChhcnJheSwgTWF0aC5tYXgoMCwgYXJyYXkubGVuZ3RoIC0gbikpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgZXZlcnl0aGluZyBidXQgdGhlIGZpcnN0IGVudHJ5IG9mIHRoZSBhcnJheS4gQWxpYXNlZCBhcyBgdGFpbGAgYW5kIGBkcm9wYC5cbiAgLy8gRXNwZWNpYWxseSB1c2VmdWwgb24gdGhlIGFyZ3VtZW50cyBvYmplY3QuIFBhc3NpbmcgYW4gKipuKiogd2lsbCByZXR1cm5cbiAgLy8gdGhlIHJlc3QgTiB2YWx1ZXMgaW4gdGhlIGFycmF5LlxuICBfLnJlc3QgPSBfLnRhaWwgPSBfLmRyb3AgPSBmdW5jdGlvbihhcnJheSwgbiwgZ3VhcmQpIHtcbiAgICByZXR1cm4gc2xpY2UuY2FsbChhcnJheSwgbiA9PSBudWxsIHx8IGd1YXJkID8gMSA6IG4pO1xuICB9O1xuXG4gIC8vIFRyaW0gb3V0IGFsbCBmYWxzeSB2YWx1ZXMgZnJvbSBhbiBhcnJheS5cbiAgXy5jb21wYWN0ID0gZnVuY3Rpb24oYXJyYXkpIHtcbiAgICByZXR1cm4gXy5maWx0ZXIoYXJyYXksIF8uaWRlbnRpdHkpO1xuICB9O1xuXG4gIC8vIEludGVybmFsIGltcGxlbWVudGF0aW9uIG9mIGEgcmVjdXJzaXZlIGBmbGF0dGVuYCBmdW5jdGlvbi5cbiAgdmFyIGZsYXR0ZW4gPSBmdW5jdGlvbihpbnB1dCwgc2hhbGxvdywgc3RyaWN0LCBzdGFydEluZGV4KSB7XG4gICAgdmFyIG91dHB1dCA9IFtdLCBpZHggPSAwO1xuICAgIGZvciAodmFyIGkgPSBzdGFydEluZGV4IHx8IDAsIGxlbmd0aCA9IGdldExlbmd0aChpbnB1dCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgdmFyIHZhbHVlID0gaW5wdXRbaV07XG4gICAgICBpZiAoaXNBcnJheUxpa2UodmFsdWUpICYmIChfLmlzQXJyYXkodmFsdWUpIHx8IF8uaXNBcmd1bWVudHModmFsdWUpKSkge1xuICAgICAgICAvL2ZsYXR0ZW4gY3VycmVudCBsZXZlbCBvZiBhcnJheSBvciBhcmd1bWVudHMgb2JqZWN0XG4gICAgICAgIGlmICghc2hhbGxvdykgdmFsdWUgPSBmbGF0dGVuKHZhbHVlLCBzaGFsbG93LCBzdHJpY3QpO1xuICAgICAgICB2YXIgaiA9IDAsIGxlbiA9IHZhbHVlLmxlbmd0aDtcbiAgICAgICAgb3V0cHV0Lmxlbmd0aCArPSBsZW47XG4gICAgICAgIHdoaWxlIChqIDwgbGVuKSB7XG4gICAgICAgICAgb3V0cHV0W2lkeCsrXSA9IHZhbHVlW2orK107XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoIXN0cmljdCkge1xuICAgICAgICBvdXRwdXRbaWR4KytdID0gdmFsdWU7XG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG4gIH07XG5cbiAgLy8gRmxhdHRlbiBvdXQgYW4gYXJyYXksIGVpdGhlciByZWN1cnNpdmVseSAoYnkgZGVmYXVsdCksIG9yIGp1c3Qgb25lIGxldmVsLlxuICBfLmZsYXR0ZW4gPSBmdW5jdGlvbihhcnJheSwgc2hhbGxvdykge1xuICAgIHJldHVybiBmbGF0dGVuKGFycmF5LCBzaGFsbG93LCBmYWxzZSk7XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgdmVyc2lvbiBvZiB0aGUgYXJyYXkgdGhhdCBkb2VzIG5vdCBjb250YWluIHRoZSBzcGVjaWZpZWQgdmFsdWUocykuXG4gIF8ud2l0aG91dCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgcmV0dXJuIF8uZGlmZmVyZW5jZShhcnJheSwgc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpKTtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGEgZHVwbGljYXRlLWZyZWUgdmVyc2lvbiBvZiB0aGUgYXJyYXkuIElmIHRoZSBhcnJheSBoYXMgYWxyZWFkeVxuICAvLyBiZWVuIHNvcnRlZCwgeW91IGhhdmUgdGhlIG9wdGlvbiBvZiB1c2luZyBhIGZhc3RlciBhbGdvcml0aG0uXG4gIC8vIEFsaWFzZWQgYXMgYHVuaXF1ZWAuXG4gIF8udW5pcSA9IF8udW5pcXVlID0gZnVuY3Rpb24oYXJyYXksIGlzU29ydGVkLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIGlmICghXy5pc0Jvb2xlYW4oaXNTb3J0ZWQpKSB7XG4gICAgICBjb250ZXh0ID0gaXRlcmF0ZWU7XG4gICAgICBpdGVyYXRlZSA9IGlzU29ydGVkO1xuICAgICAgaXNTb3J0ZWQgPSBmYWxzZTtcbiAgICB9XG4gICAgaWYgKGl0ZXJhdGVlICE9IG51bGwpIGl0ZXJhdGVlID0gY2IoaXRlcmF0ZWUsIGNvbnRleHQpO1xuICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICB2YXIgc2VlbiA9IFtdO1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgoYXJyYXkpOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciB2YWx1ZSA9IGFycmF5W2ldLFxuICAgICAgICAgIGNvbXB1dGVkID0gaXRlcmF0ZWUgPyBpdGVyYXRlZSh2YWx1ZSwgaSwgYXJyYXkpIDogdmFsdWU7XG4gICAgICBpZiAoaXNTb3J0ZWQpIHtcbiAgICAgICAgaWYgKCFpIHx8IHNlZW4gIT09IGNvbXB1dGVkKSByZXN1bHQucHVzaCh2YWx1ZSk7XG4gICAgICAgIHNlZW4gPSBjb21wdXRlZDtcbiAgICAgIH0gZWxzZSBpZiAoaXRlcmF0ZWUpIHtcbiAgICAgICAgaWYgKCFfLmNvbnRhaW5zKHNlZW4sIGNvbXB1dGVkKSkge1xuICAgICAgICAgIHNlZW4ucHVzaChjb21wdXRlZCk7XG4gICAgICAgICAgcmVzdWx0LnB1c2godmFsdWUpO1xuICAgICAgICB9XG4gICAgICB9IGVsc2UgaWYgKCFfLmNvbnRhaW5zKHJlc3VsdCwgdmFsdWUpKSB7XG4gICAgICAgIHJlc3VsdC5wdXNoKHZhbHVlKTtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBQcm9kdWNlIGFuIGFycmF5IHRoYXQgY29udGFpbnMgdGhlIHVuaW9uOiBlYWNoIGRpc3RpbmN0IGVsZW1lbnQgZnJvbSBhbGwgb2ZcbiAgLy8gdGhlIHBhc3NlZC1pbiBhcnJheXMuXG4gIF8udW5pb24gPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gXy51bmlxKGZsYXR0ZW4oYXJndW1lbnRzLCB0cnVlLCB0cnVlKSk7XG4gIH07XG5cbiAgLy8gUHJvZHVjZSBhbiBhcnJheSB0aGF0IGNvbnRhaW5zIGV2ZXJ5IGl0ZW0gc2hhcmVkIGJldHdlZW4gYWxsIHRoZVxuICAvLyBwYXNzZWQtaW4gYXJyYXlzLlxuICBfLmludGVyc2VjdGlvbiA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIHJlc3VsdCA9IFtdO1xuICAgIHZhciBhcmdzTGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIgaXRlbSA9IGFycmF5W2ldO1xuICAgICAgaWYgKF8uY29udGFpbnMocmVzdWx0LCBpdGVtKSkgY29udGludWU7XG4gICAgICBmb3IgKHZhciBqID0gMTsgaiA8IGFyZ3NMZW5ndGg7IGorKykge1xuICAgICAgICBpZiAoIV8uY29udGFpbnMoYXJndW1lbnRzW2pdLCBpdGVtKSkgYnJlYWs7XG4gICAgICB9XG4gICAgICBpZiAoaiA9PT0gYXJnc0xlbmd0aCkgcmVzdWx0LnB1c2goaXRlbSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgLy8gVGFrZSB0aGUgZGlmZmVyZW5jZSBiZXR3ZWVuIG9uZSBhcnJheSBhbmQgYSBudW1iZXIgb2Ygb3RoZXIgYXJyYXlzLlxuICAvLyBPbmx5IHRoZSBlbGVtZW50cyBwcmVzZW50IGluIGp1c3QgdGhlIGZpcnN0IGFycmF5IHdpbGwgcmVtYWluLlxuICBfLmRpZmZlcmVuY2UgPSBmdW5jdGlvbihhcnJheSkge1xuICAgIHZhciByZXN0ID0gZmxhdHRlbihhcmd1bWVudHMsIHRydWUsIHRydWUsIDEpO1xuICAgIHJldHVybiBfLmZpbHRlcihhcnJheSwgZnVuY3Rpb24odmFsdWUpe1xuICAgICAgcmV0dXJuICFfLmNvbnRhaW5zKHJlc3QsIHZhbHVlKTtcbiAgICB9KTtcbiAgfTtcblxuICAvLyBaaXAgdG9nZXRoZXIgbXVsdGlwbGUgbGlzdHMgaW50byBhIHNpbmdsZSBhcnJheSAtLSBlbGVtZW50cyB0aGF0IHNoYXJlXG4gIC8vIGFuIGluZGV4IGdvIHRvZ2V0aGVyLlxuICBfLnppcCA9IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBfLnVuemlwKGFyZ3VtZW50cyk7XG4gIH07XG5cbiAgLy8gQ29tcGxlbWVudCBvZiBfLnppcC4gVW56aXAgYWNjZXB0cyBhbiBhcnJheSBvZiBhcnJheXMgYW5kIGdyb3Vwc1xuICAvLyBlYWNoIGFycmF5J3MgZWxlbWVudHMgb24gc2hhcmVkIGluZGljZXNcbiAgXy51bnppcCA9IGZ1bmN0aW9uKGFycmF5KSB7XG4gICAgdmFyIGxlbmd0aCA9IGFycmF5ICYmIF8ubWF4KGFycmF5LCBnZXRMZW5ndGgpLmxlbmd0aCB8fCAwO1xuICAgIHZhciByZXN1bHQgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaW5kZXggPSAwOyBpbmRleCA8IGxlbmd0aDsgaW5kZXgrKykge1xuICAgICAgcmVzdWx0W2luZGV4XSA9IF8ucGx1Y2soYXJyYXksIGluZGV4KTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDb252ZXJ0cyBsaXN0cyBpbnRvIG9iamVjdHMuIFBhc3MgZWl0aGVyIGEgc2luZ2xlIGFycmF5IG9mIGBba2V5LCB2YWx1ZV1gXG4gIC8vIHBhaXJzLCBvciB0d28gcGFyYWxsZWwgYXJyYXlzIG9mIHRoZSBzYW1lIGxlbmd0aCAtLSBvbmUgb2Yga2V5cywgYW5kIG9uZSBvZlxuICAvLyB0aGUgY29ycmVzcG9uZGluZyB2YWx1ZXMuXG4gIF8ub2JqZWN0ID0gZnVuY3Rpb24obGlzdCwgdmFsdWVzKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBnZXRMZW5ndGgobGlzdCk7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgaWYgKHZhbHVlcykge1xuICAgICAgICByZXN1bHRbbGlzdFtpXV0gPSB2YWx1ZXNbaV07XG4gICAgICB9IGVsc2Uge1xuICAgICAgICByZXN1bHRbbGlzdFtpXVswXV0gPSBsaXN0W2ldWzFdO1xuICAgICAgfVxuICAgIH1cbiAgICByZXR1cm4gcmVzdWx0O1xuICB9O1xuXG4gIC8vIEdlbmVyYXRvciBmdW5jdGlvbiB0byBjcmVhdGUgdGhlIGZpbmRJbmRleCBhbmQgZmluZExhc3RJbmRleCBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoZGlyKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKGFycmF5LCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICAgIHByZWRpY2F0ZSA9IGNiKHByZWRpY2F0ZSwgY29udGV4dCk7XG4gICAgICB2YXIgbGVuZ3RoID0gZ2V0TGVuZ3RoKGFycmF5KTtcbiAgICAgIHZhciBpbmRleCA9IGRpciA+IDAgPyAwIDogbGVuZ3RoIC0gMTtcbiAgICAgIGZvciAoOyBpbmRleCA+PSAwICYmIGluZGV4IDwgbGVuZ3RoOyBpbmRleCArPSBkaXIpIHtcbiAgICAgICAgaWYgKHByZWRpY2F0ZShhcnJheVtpbmRleF0sIGluZGV4LCBhcnJheSkpIHJldHVybiBpbmRleDtcbiAgICAgIH1cbiAgICAgIHJldHVybiAtMTtcbiAgICB9O1xuICB9XG5cbiAgLy8gUmV0dXJucyB0aGUgZmlyc3QgaW5kZXggb24gYW4gYXJyYXktbGlrZSB0aGF0IHBhc3NlcyBhIHByZWRpY2F0ZSB0ZXN0XG4gIF8uZmluZEluZGV4ID0gY3JlYXRlUHJlZGljYXRlSW5kZXhGaW5kZXIoMSk7XG4gIF8uZmluZExhc3RJbmRleCA9IGNyZWF0ZVByZWRpY2F0ZUluZGV4RmluZGVyKC0xKTtcblxuICAvLyBVc2UgYSBjb21wYXJhdG9yIGZ1bmN0aW9uIHRvIGZpZ3VyZSBvdXQgdGhlIHNtYWxsZXN0IGluZGV4IGF0IHdoaWNoXG4gIC8vIGFuIG9iamVjdCBzaG91bGQgYmUgaW5zZXJ0ZWQgc28gYXMgdG8gbWFpbnRhaW4gb3JkZXIuIFVzZXMgYmluYXJ5IHNlYXJjaC5cbiAgXy5zb3J0ZWRJbmRleCA9IGZ1bmN0aW9uKGFycmF5LCBvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaXRlcmF0ZWUgPSBjYihpdGVyYXRlZSwgY29udGV4dCwgMSk7XG4gICAgdmFyIHZhbHVlID0gaXRlcmF0ZWUob2JqKTtcbiAgICB2YXIgbG93ID0gMCwgaGlnaCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgd2hpbGUgKGxvdyA8IGhpZ2gpIHtcbiAgICAgIHZhciBtaWQgPSBNYXRoLmZsb29yKChsb3cgKyBoaWdoKSAvIDIpO1xuICAgICAgaWYgKGl0ZXJhdGVlKGFycmF5W21pZF0pIDwgdmFsdWUpIGxvdyA9IG1pZCArIDE7IGVsc2UgaGlnaCA9IG1pZDtcbiAgICB9XG4gICAgcmV0dXJuIGxvdztcbiAgfTtcblxuICAvLyBHZW5lcmF0b3IgZnVuY3Rpb24gdG8gY3JlYXRlIHRoZSBpbmRleE9mIGFuZCBsYXN0SW5kZXhPZiBmdW5jdGlvbnNcbiAgZnVuY3Rpb24gY3JlYXRlSW5kZXhGaW5kZXIoZGlyLCBwcmVkaWNhdGVGaW5kLCBzb3J0ZWRJbmRleCkge1xuICAgIHJldHVybiBmdW5jdGlvbihhcnJheSwgaXRlbSwgaWR4KSB7XG4gICAgICB2YXIgaSA9IDAsIGxlbmd0aCA9IGdldExlbmd0aChhcnJheSk7XG4gICAgICBpZiAodHlwZW9mIGlkeCA9PSAnbnVtYmVyJykge1xuICAgICAgICBpZiAoZGlyID4gMCkge1xuICAgICAgICAgICAgaSA9IGlkeCA+PSAwID8gaWR4IDogTWF0aC5tYXgoaWR4ICsgbGVuZ3RoLCBpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGxlbmd0aCA9IGlkeCA+PSAwID8gTWF0aC5taW4oaWR4ICsgMSwgbGVuZ3RoKSA6IGlkeCArIGxlbmd0aCArIDE7XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAoc29ydGVkSW5kZXggJiYgaWR4ICYmIGxlbmd0aCkge1xuICAgICAgICBpZHggPSBzb3J0ZWRJbmRleChhcnJheSwgaXRlbSk7XG4gICAgICAgIHJldHVybiBhcnJheVtpZHhdID09PSBpdGVtID8gaWR4IDogLTE7XG4gICAgICB9XG4gICAgICBpZiAoaXRlbSAhPT0gaXRlbSkge1xuICAgICAgICBpZHggPSBwcmVkaWNhdGVGaW5kKHNsaWNlLmNhbGwoYXJyYXksIGksIGxlbmd0aCksIF8uaXNOYU4pO1xuICAgICAgICByZXR1cm4gaWR4ID49IDAgPyBpZHggKyBpIDogLTE7XG4gICAgICB9XG4gICAgICBmb3IgKGlkeCA9IGRpciA+IDAgPyBpIDogbGVuZ3RoIC0gMTsgaWR4ID49IDAgJiYgaWR4IDwgbGVuZ3RoOyBpZHggKz0gZGlyKSB7XG4gICAgICAgIGlmIChhcnJheVtpZHhdID09PSBpdGVtKSByZXR1cm4gaWR4O1xuICAgICAgfVxuICAgICAgcmV0dXJuIC0xO1xuICAgIH07XG4gIH1cblxuICAvLyBSZXR1cm4gdGhlIHBvc2l0aW9uIG9mIHRoZSBmaXJzdCBvY2N1cnJlbmNlIG9mIGFuIGl0ZW0gaW4gYW4gYXJyYXksXG4gIC8vIG9yIC0xIGlmIHRoZSBpdGVtIGlzIG5vdCBpbmNsdWRlZCBpbiB0aGUgYXJyYXkuXG4gIC8vIElmIHRoZSBhcnJheSBpcyBsYXJnZSBhbmQgYWxyZWFkeSBpbiBzb3J0IG9yZGVyLCBwYXNzIGB0cnVlYFxuICAvLyBmb3IgKippc1NvcnRlZCoqIHRvIHVzZSBiaW5hcnkgc2VhcmNoLlxuICBfLmluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigxLCBfLmZpbmRJbmRleCwgXy5zb3J0ZWRJbmRleCk7XG4gIF8ubGFzdEluZGV4T2YgPSBjcmVhdGVJbmRleEZpbmRlcigtMSwgXy5maW5kTGFzdEluZGV4KTtcblxuICAvLyBHZW5lcmF0ZSBhbiBpbnRlZ2VyIEFycmF5IGNvbnRhaW5pbmcgYW4gYXJpdGhtZXRpYyBwcm9ncmVzc2lvbi4gQSBwb3J0IG9mXG4gIC8vIHRoZSBuYXRpdmUgUHl0aG9uIGByYW5nZSgpYCBmdW5jdGlvbi4gU2VlXG4gIC8vIFt0aGUgUHl0aG9uIGRvY3VtZW50YXRpb25dKGh0dHA6Ly9kb2NzLnB5dGhvbi5vcmcvbGlicmFyeS9mdW5jdGlvbnMuaHRtbCNyYW5nZSkuXG4gIF8ucmFuZ2UgPSBmdW5jdGlvbihzdGFydCwgc3RvcCwgc3RlcCkge1xuICAgIGlmIChzdG9wID09IG51bGwpIHtcbiAgICAgIHN0b3AgPSBzdGFydCB8fCAwO1xuICAgICAgc3RhcnQgPSAwO1xuICAgIH1cbiAgICBzdGVwID0gc3RlcCB8fCAxO1xuXG4gICAgdmFyIGxlbmd0aCA9IE1hdGgubWF4KE1hdGguY2VpbCgoc3RvcCAtIHN0YXJ0KSAvIHN0ZXApLCAwKTtcbiAgICB2YXIgcmFuZ2UgPSBBcnJheShsZW5ndGgpO1xuXG4gICAgZm9yICh2YXIgaWR4ID0gMDsgaWR4IDwgbGVuZ3RoOyBpZHgrKywgc3RhcnQgKz0gc3RlcCkge1xuICAgICAgcmFuZ2VbaWR4XSA9IHN0YXJ0O1xuICAgIH1cblxuICAgIHJldHVybiByYW5nZTtcbiAgfTtcblxuICAvLyBGdW5jdGlvbiAoYWhlbSkgRnVuY3Rpb25zXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIERldGVybWluZXMgd2hldGhlciB0byBleGVjdXRlIGEgZnVuY3Rpb24gYXMgYSBjb25zdHJ1Y3RvclxuICAvLyBvciBhIG5vcm1hbCBmdW5jdGlvbiB3aXRoIHRoZSBwcm92aWRlZCBhcmd1bWVudHNcbiAgdmFyIGV4ZWN1dGVCb3VuZCA9IGZ1bmN0aW9uKHNvdXJjZUZ1bmMsIGJvdW5kRnVuYywgY29udGV4dCwgY2FsbGluZ0NvbnRleHQsIGFyZ3MpIHtcbiAgICBpZiAoIShjYWxsaW5nQ29udGV4dCBpbnN0YW5jZW9mIGJvdW5kRnVuYykpIHJldHVybiBzb3VyY2VGdW5jLmFwcGx5KGNvbnRleHQsIGFyZ3MpO1xuICAgIHZhciBzZWxmID0gYmFzZUNyZWF0ZShzb3VyY2VGdW5jLnByb3RvdHlwZSk7XG4gICAgdmFyIHJlc3VsdCA9IHNvdXJjZUZ1bmMuYXBwbHkoc2VsZiwgYXJncyk7XG4gICAgaWYgKF8uaXNPYmplY3QocmVzdWx0KSkgcmV0dXJuIHJlc3VsdDtcbiAgICByZXR1cm4gc2VsZjtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSBmdW5jdGlvbiBib3VuZCB0byBhIGdpdmVuIG9iamVjdCAoYXNzaWduaW5nIGB0aGlzYCwgYW5kIGFyZ3VtZW50cyxcbiAgLy8gb3B0aW9uYWxseSkuIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBGdW5jdGlvbi5iaW5kYCBpZlxuICAvLyBhdmFpbGFibGUuXG4gIF8uYmluZCA9IGZ1bmN0aW9uKGZ1bmMsIGNvbnRleHQpIHtcbiAgICBpZiAobmF0aXZlQmluZCAmJiBmdW5jLmJpbmQgPT09IG5hdGl2ZUJpbmQpIHJldHVybiBuYXRpdmVCaW5kLmFwcGx5KGZ1bmMsIHNsaWNlLmNhbGwoYXJndW1lbnRzLCAxKSk7XG4gICAgaWYgKCFfLmlzRnVuY3Rpb24oZnVuYykpIHRocm93IG5ldyBUeXBlRXJyb3IoJ0JpbmQgbXVzdCBiZSBjYWxsZWQgb24gYSBmdW5jdGlvbicpO1xuICAgIHZhciBhcmdzID0gc2xpY2UuY2FsbChhcmd1bWVudHMsIDIpO1xuICAgIHZhciBib3VuZCA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIGV4ZWN1dGVCb3VuZChmdW5jLCBib3VuZCwgY29udGV4dCwgdGhpcywgYXJncy5jb25jYXQoc2xpY2UuY2FsbChhcmd1bWVudHMpKSk7XG4gICAgfTtcbiAgICByZXR1cm4gYm91bmQ7XG4gIH07XG5cbiAgLy8gUGFydGlhbGx5IGFwcGx5IGEgZnVuY3Rpb24gYnkgY3JlYXRpbmcgYSB2ZXJzaW9uIHRoYXQgaGFzIGhhZCBzb21lIG9mIGl0c1xuICAvLyBhcmd1bWVudHMgcHJlLWZpbGxlZCwgd2l0aG91dCBjaGFuZ2luZyBpdHMgZHluYW1pYyBgdGhpc2AgY29udGV4dC4gXyBhY3RzXG4gIC8vIGFzIGEgcGxhY2Vob2xkZXIsIGFsbG93aW5nIGFueSBjb21iaW5hdGlvbiBvZiBhcmd1bWVudHMgdG8gYmUgcHJlLWZpbGxlZC5cbiAgXy5wYXJ0aWFsID0gZnVuY3Rpb24oZnVuYykge1xuICAgIHZhciBib3VuZEFyZ3MgPSBzbGljZS5jYWxsKGFyZ3VtZW50cywgMSk7XG4gICAgdmFyIGJvdW5kID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAwLCBsZW5ndGggPSBib3VuZEFyZ3MubGVuZ3RoO1xuICAgICAgdmFyIGFyZ3MgPSBBcnJheShsZW5ndGgpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAgICBhcmdzW2ldID0gYm91bmRBcmdzW2ldID09PSBfID8gYXJndW1lbnRzW3Bvc2l0aW9uKytdIDogYm91bmRBcmdzW2ldO1xuICAgICAgfVxuICAgICAgd2hpbGUgKHBvc2l0aW9uIDwgYXJndW1lbnRzLmxlbmd0aCkgYXJncy5wdXNoKGFyZ3VtZW50c1twb3NpdGlvbisrXSk7XG4gICAgICByZXR1cm4gZXhlY3V0ZUJvdW5kKGZ1bmMsIGJvdW5kLCB0aGlzLCB0aGlzLCBhcmdzKTtcbiAgICB9O1xuICAgIHJldHVybiBib3VuZDtcbiAgfTtcblxuICAvLyBCaW5kIGEgbnVtYmVyIG9mIGFuIG9iamVjdCdzIG1ldGhvZHMgdG8gdGhhdCBvYmplY3QuIFJlbWFpbmluZyBhcmd1bWVudHNcbiAgLy8gYXJlIHRoZSBtZXRob2QgbmFtZXMgdG8gYmUgYm91bmQuIFVzZWZ1bCBmb3IgZW5zdXJpbmcgdGhhdCBhbGwgY2FsbGJhY2tzXG4gIC8vIGRlZmluZWQgb24gYW4gb2JqZWN0IGJlbG9uZyB0byBpdC5cbiAgXy5iaW5kQWxsID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIGksIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGgsIGtleTtcbiAgICBpZiAobGVuZ3RoIDw9IDEpIHRocm93IG5ldyBFcnJvcignYmluZEFsbCBtdXN0IGJlIHBhc3NlZCBmdW5jdGlvbiBuYW1lcycpO1xuICAgIGZvciAoaSA9IDE7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0gYXJndW1lbnRzW2ldO1xuICAgICAgb2JqW2tleV0gPSBfLmJpbmQob2JqW2tleV0sIG9iaik7XG4gICAgfVxuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gTWVtb2l6ZSBhbiBleHBlbnNpdmUgZnVuY3Rpb24gYnkgc3RvcmluZyBpdHMgcmVzdWx0cy5cbiAgXy5tZW1vaXplID0gZnVuY3Rpb24oZnVuYywgaGFzaGVyKSB7XG4gICAgdmFyIG1lbW9pemUgPSBmdW5jdGlvbihrZXkpIHtcbiAgICAgIHZhciBjYWNoZSA9IG1lbW9pemUuY2FjaGU7XG4gICAgICB2YXIgYWRkcmVzcyA9ICcnICsgKGhhc2hlciA/IGhhc2hlci5hcHBseSh0aGlzLCBhcmd1bWVudHMpIDoga2V5KTtcbiAgICAgIGlmICghXy5oYXMoY2FjaGUsIGFkZHJlc3MpKSBjYWNoZVthZGRyZXNzXSA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIHJldHVybiBjYWNoZVthZGRyZXNzXTtcbiAgICB9O1xuICAgIG1lbW9pemUuY2FjaGUgPSB7fTtcbiAgICByZXR1cm4gbWVtb2l6ZTtcbiAgfTtcblxuICAvLyBEZWxheXMgYSBmdW5jdGlvbiBmb3IgdGhlIGdpdmVuIG51bWJlciBvZiBtaWxsaXNlY29uZHMsIGFuZCB0aGVuIGNhbGxzXG4gIC8vIGl0IHdpdGggdGhlIGFyZ3VtZW50cyBzdXBwbGllZC5cbiAgXy5kZWxheSA9IGZ1bmN0aW9uKGZ1bmMsIHdhaXQpIHtcbiAgICB2YXIgYXJncyA9IHNsaWNlLmNhbGwoYXJndW1lbnRzLCAyKTtcbiAgICByZXR1cm4gc2V0VGltZW91dChmdW5jdGlvbigpe1xuICAgICAgcmV0dXJuIGZ1bmMuYXBwbHkobnVsbCwgYXJncyk7XG4gICAgfSwgd2FpdCk7XG4gIH07XG5cbiAgLy8gRGVmZXJzIGEgZnVuY3Rpb24sIHNjaGVkdWxpbmcgaXQgdG8gcnVuIGFmdGVyIHRoZSBjdXJyZW50IGNhbGwgc3RhY2sgaGFzXG4gIC8vIGNsZWFyZWQuXG4gIF8uZGVmZXIgPSBfLnBhcnRpYWwoXy5kZWxheSwgXywgMSk7XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uLCB0aGF0LCB3aGVuIGludm9rZWQsIHdpbGwgb25seSBiZSB0cmlnZ2VyZWQgYXQgbW9zdCBvbmNlXG4gIC8vIGR1cmluZyBhIGdpdmVuIHdpbmRvdyBvZiB0aW1lLiBOb3JtYWxseSwgdGhlIHRocm90dGxlZCBmdW5jdGlvbiB3aWxsIHJ1blxuICAvLyBhcyBtdWNoIGFzIGl0IGNhbiwgd2l0aG91dCBldmVyIGdvaW5nIG1vcmUgdGhhbiBvbmNlIHBlciBgd2FpdGAgZHVyYXRpb247XG4gIC8vIGJ1dCBpZiB5b3UnZCBsaWtlIHRvIGRpc2FibGUgdGhlIGV4ZWN1dGlvbiBvbiB0aGUgbGVhZGluZyBlZGdlLCBwYXNzXG4gIC8vIGB7bGVhZGluZzogZmFsc2V9YC4gVG8gZGlzYWJsZSBleGVjdXRpb24gb24gdGhlIHRyYWlsaW5nIGVkZ2UsIGRpdHRvLlxuICBfLnRocm90dGxlID0gZnVuY3Rpb24oZnVuYywgd2FpdCwgb3B0aW9ucykge1xuICAgIHZhciBjb250ZXh0LCBhcmdzLCByZXN1bHQ7XG4gICAgdmFyIHRpbWVvdXQgPSBudWxsO1xuICAgIHZhciBwcmV2aW91cyA9IDA7XG4gICAgaWYgKCFvcHRpb25zKSBvcHRpb25zID0ge307XG4gICAgdmFyIGxhdGVyID0gZnVuY3Rpb24oKSB7XG4gICAgICBwcmV2aW91cyA9IG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UgPyAwIDogXy5ub3coKTtcbiAgICAgIHRpbWVvdXQgPSBudWxsO1xuICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgIH07XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgdmFyIG5vdyA9IF8ubm93KCk7XG4gICAgICBpZiAoIXByZXZpb3VzICYmIG9wdGlvbnMubGVhZGluZyA9PT0gZmFsc2UpIHByZXZpb3VzID0gbm93O1xuICAgICAgdmFyIHJlbWFpbmluZyA9IHdhaXQgLSAobm93IC0gcHJldmlvdXMpO1xuICAgICAgY29udGV4dCA9IHRoaXM7XG4gICAgICBhcmdzID0gYXJndW1lbnRzO1xuICAgICAgaWYgKHJlbWFpbmluZyA8PSAwIHx8IHJlbWFpbmluZyA+IHdhaXQpIHtcbiAgICAgICAgaWYgKHRpbWVvdXQpIHtcbiAgICAgICAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG4gICAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIH1cbiAgICAgICAgcHJldmlvdXMgPSBub3c7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGlmICghdGltZW91dCkgY29udGV4dCA9IGFyZ3MgPSBudWxsO1xuICAgICAgfSBlbHNlIGlmICghdGltZW91dCAmJiBvcHRpb25zLnRyYWlsaW5nICE9PSBmYWxzZSkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgcmVtYWluaW5nKTtcbiAgICAgIH1cbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24sIHRoYXQsIGFzIGxvbmcgYXMgaXQgY29udGludWVzIHRvIGJlIGludm9rZWQsIHdpbGwgbm90XG4gIC8vIGJlIHRyaWdnZXJlZC4gVGhlIGZ1bmN0aW9uIHdpbGwgYmUgY2FsbGVkIGFmdGVyIGl0IHN0b3BzIGJlaW5nIGNhbGxlZCBmb3JcbiAgLy8gTiBtaWxsaXNlY29uZHMuIElmIGBpbW1lZGlhdGVgIGlzIHBhc3NlZCwgdHJpZ2dlciB0aGUgZnVuY3Rpb24gb24gdGhlXG4gIC8vIGxlYWRpbmcgZWRnZSwgaW5zdGVhZCBvZiB0aGUgdHJhaWxpbmcuXG4gIF8uZGVib3VuY2UgPSBmdW5jdGlvbihmdW5jLCB3YWl0LCBpbW1lZGlhdGUpIHtcbiAgICB2YXIgdGltZW91dCwgYXJncywgY29udGV4dCwgdGltZXN0YW1wLCByZXN1bHQ7XG5cbiAgICB2YXIgbGF0ZXIgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBsYXN0ID0gXy5ub3coKSAtIHRpbWVzdGFtcDtcblxuICAgICAgaWYgKGxhc3QgPCB3YWl0ICYmIGxhc3QgPj0gMCkge1xuICAgICAgICB0aW1lb3V0ID0gc2V0VGltZW91dChsYXRlciwgd2FpdCAtIGxhc3QpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgdGltZW91dCA9IG51bGw7XG4gICAgICAgIGlmICghaW1tZWRpYXRlKSB7XG4gICAgICAgICAgcmVzdWx0ID0gZnVuYy5hcHBseShjb250ZXh0LCBhcmdzKTtcbiAgICAgICAgICBpZiAoIXRpbWVvdXQpIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgICAgfVxuICAgICAgfVxuICAgIH07XG5cbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBjb250ZXh0ID0gdGhpcztcbiAgICAgIGFyZ3MgPSBhcmd1bWVudHM7XG4gICAgICB0aW1lc3RhbXAgPSBfLm5vdygpO1xuICAgICAgdmFyIGNhbGxOb3cgPSBpbW1lZGlhdGUgJiYgIXRpbWVvdXQ7XG4gICAgICBpZiAoIXRpbWVvdXQpIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGxhdGVyLCB3YWl0KTtcbiAgICAgIGlmIChjYWxsTm93KSB7XG4gICAgICAgIHJlc3VsdCA9IGZ1bmMuYXBwbHkoY29udGV4dCwgYXJncyk7XG4gICAgICAgIGNvbnRleHQgPSBhcmdzID0gbnVsbDtcbiAgICAgIH1cblxuICAgICAgcmV0dXJuIHJlc3VsdDtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgdGhlIGZpcnN0IGZ1bmN0aW9uIHBhc3NlZCBhcyBhbiBhcmd1bWVudCB0byB0aGUgc2Vjb25kLFxuICAvLyBhbGxvd2luZyB5b3UgdG8gYWRqdXN0IGFyZ3VtZW50cywgcnVuIGNvZGUgYmVmb3JlIGFuZCBhZnRlciwgYW5kXG4gIC8vIGNvbmRpdGlvbmFsbHkgZXhlY3V0ZSB0aGUgb3JpZ2luYWwgZnVuY3Rpb24uXG4gIF8ud3JhcCA9IGZ1bmN0aW9uKGZ1bmMsIHdyYXBwZXIpIHtcbiAgICByZXR1cm4gXy5wYXJ0aWFsKHdyYXBwZXIsIGZ1bmMpO1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBuZWdhdGVkIHZlcnNpb24gb2YgdGhlIHBhc3NlZC1pbiBwcmVkaWNhdGUuXG4gIF8ubmVnYXRlID0gZnVuY3Rpb24ocHJlZGljYXRlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuICFwcmVkaWNhdGUuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICB9O1xuICB9O1xuXG4gIC8vIFJldHVybnMgYSBmdW5jdGlvbiB0aGF0IGlzIHRoZSBjb21wb3NpdGlvbiBvZiBhIGxpc3Qgb2YgZnVuY3Rpb25zLCBlYWNoXG4gIC8vIGNvbnN1bWluZyB0aGUgcmV0dXJuIHZhbHVlIG9mIHRoZSBmdW5jdGlvbiB0aGF0IGZvbGxvd3MuXG4gIF8uY29tcG9zZSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBzdGFydCA9IGFyZ3MubGVuZ3RoIC0gMTtcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgaSA9IHN0YXJ0O1xuICAgICAgdmFyIHJlc3VsdCA9IGFyZ3Nbc3RhcnRdLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB3aGlsZSAoaS0tKSByZXN1bHQgPSBhcmdzW2ldLmNhbGwodGhpcywgcmVzdWx0KTtcbiAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgb24gYW5kIGFmdGVyIHRoZSBOdGggY2FsbC5cbiAgXy5hZnRlciA9IGZ1bmN0aW9uKHRpbWVzLCBmdW5jKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgaWYgKC0tdGltZXMgPCAxKSB7XG4gICAgICAgIHJldHVybiBmdW5jLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgICB9XG4gICAgfTtcbiAgfTtcblxuICAvLyBSZXR1cm5zIGEgZnVuY3Rpb24gdGhhdCB3aWxsIG9ubHkgYmUgZXhlY3V0ZWQgdXAgdG8gKGJ1dCBub3QgaW5jbHVkaW5nKSB0aGUgTnRoIGNhbGwuXG4gIF8uYmVmb3JlID0gZnVuY3Rpb24odGltZXMsIGZ1bmMpIHtcbiAgICB2YXIgbWVtbztcbiAgICByZXR1cm4gZnVuY3Rpb24oKSB7XG4gICAgICBpZiAoLS10aW1lcyA+IDApIHtcbiAgICAgICAgbWVtbyA9IGZ1bmMuYXBwbHkodGhpcywgYXJndW1lbnRzKTtcbiAgICAgIH1cbiAgICAgIGlmICh0aW1lcyA8PSAxKSBmdW5jID0gbnVsbDtcbiAgICAgIHJldHVybiBtZW1vO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIGZ1bmN0aW9uIHRoYXQgd2lsbCBiZSBleGVjdXRlZCBhdCBtb3N0IG9uZSB0aW1lLCBubyBtYXR0ZXIgaG93XG4gIC8vIG9mdGVuIHlvdSBjYWxsIGl0LiBVc2VmdWwgZm9yIGxhenkgaW5pdGlhbGl6YXRpb24uXG4gIF8ub25jZSA9IF8ucGFydGlhbChfLmJlZm9yZSwgMik7XG5cbiAgLy8gT2JqZWN0IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tXG5cbiAgLy8gS2V5cyBpbiBJRSA8IDkgdGhhdCB3b24ndCBiZSBpdGVyYXRlZCBieSBgZm9yIGtleSBpbiAuLi5gIGFuZCB0aHVzIG1pc3NlZC5cbiAgdmFyIGhhc0VudW1CdWcgPSAhe3RvU3RyaW5nOiBudWxsfS5wcm9wZXJ0eUlzRW51bWVyYWJsZSgndG9TdHJpbmcnKTtcbiAgdmFyIG5vbkVudW1lcmFibGVQcm9wcyA9IFsndmFsdWVPZicsICdpc1Byb3RvdHlwZU9mJywgJ3RvU3RyaW5nJyxcbiAgICAgICAgICAgICAgICAgICAgICAncHJvcGVydHlJc0VudW1lcmFibGUnLCAnaGFzT3duUHJvcGVydHknLCAndG9Mb2NhbGVTdHJpbmcnXTtcblxuICBmdW5jdGlvbiBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cykge1xuICAgIHZhciBub25FbnVtSWR4ID0gbm9uRW51bWVyYWJsZVByb3BzLmxlbmd0aDtcbiAgICB2YXIgY29uc3RydWN0b3IgPSBvYmouY29uc3RydWN0b3I7XG4gICAgdmFyIHByb3RvID0gKF8uaXNGdW5jdGlvbihjb25zdHJ1Y3RvcikgJiYgY29uc3RydWN0b3IucHJvdG90eXBlKSB8fCBPYmpQcm90bztcblxuICAgIC8vIENvbnN0cnVjdG9yIGlzIGEgc3BlY2lhbCBjYXNlLlxuICAgIHZhciBwcm9wID0gJ2NvbnN0cnVjdG9yJztcbiAgICBpZiAoXy5oYXMob2JqLCBwcm9wKSAmJiAhXy5jb250YWlucyhrZXlzLCBwcm9wKSkga2V5cy5wdXNoKHByb3ApO1xuXG4gICAgd2hpbGUgKG5vbkVudW1JZHgtLSkge1xuICAgICAgcHJvcCA9IG5vbkVudW1lcmFibGVQcm9wc1tub25FbnVtSWR4XTtcbiAgICAgIGlmIChwcm9wIGluIG9iaiAmJiBvYmpbcHJvcF0gIT09IHByb3RvW3Byb3BdICYmICFfLmNvbnRhaW5zKGtleXMsIHByb3ApKSB7XG4gICAgICAgIGtleXMucHVzaChwcm9wKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cblxuICAvLyBSZXRyaWV2ZSB0aGUgbmFtZXMgb2YgYW4gb2JqZWN0J3Mgb3duIHByb3BlcnRpZXMuXG4gIC8vIERlbGVnYXRlcyB0byAqKkVDTUFTY3JpcHQgNSoqJ3MgbmF0aXZlIGBPYmplY3Qua2V5c2BcbiAgXy5rZXlzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKCFfLmlzT2JqZWN0KG9iaikpIHJldHVybiBbXTtcbiAgICBpZiAobmF0aXZlS2V5cykgcmV0dXJuIG5hdGl2ZUtleXMob2JqKTtcbiAgICB2YXIga2V5cyA9IFtdO1xuICAgIGZvciAodmFyIGtleSBpbiBvYmopIGlmIChfLmhhcyhvYmosIGtleSkpIGtleXMucHVzaChrZXkpO1xuICAgIC8vIEFoZW0sIElFIDwgOS5cbiAgICBpZiAoaGFzRW51bUJ1ZykgY29sbGVjdE5vbkVudW1Qcm9wcyhvYmosIGtleXMpO1xuICAgIHJldHVybiBrZXlzO1xuICB9O1xuXG4gIC8vIFJldHJpZXZlIGFsbCB0aGUgcHJvcGVydHkgbmFtZXMgb2YgYW4gb2JqZWN0LlxuICBfLmFsbEtleXMgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIFtdO1xuICAgIHZhciBrZXlzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikga2V5cy5wdXNoKGtleSk7XG4gICAgLy8gQWhlbSwgSUUgPCA5LlxuICAgIGlmIChoYXNFbnVtQnVnKSBjb2xsZWN0Tm9uRW51bVByb3BzKG9iaiwga2V5cyk7XG4gICAgcmV0dXJuIGtleXM7XG4gIH07XG5cbiAgLy8gUmV0cmlldmUgdGhlIHZhbHVlcyBvZiBhbiBvYmplY3QncyBwcm9wZXJ0aWVzLlxuICBfLnZhbHVlcyA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgdmFyIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIHZhciB2YWx1ZXMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhbHVlc1tpXSA9IG9ialtrZXlzW2ldXTtcbiAgICB9XG4gICAgcmV0dXJuIHZhbHVlcztcbiAgfTtcblxuICAvLyBSZXR1cm5zIHRoZSByZXN1bHRzIG9mIGFwcGx5aW5nIHRoZSBpdGVyYXRlZSB0byBlYWNoIGVsZW1lbnQgb2YgdGhlIG9iamVjdFxuICAvLyBJbiBjb250cmFzdCB0byBfLm1hcCBpdCByZXR1cm5zIGFuIG9iamVjdFxuICBfLm1hcE9iamVjdCA9IGZ1bmN0aW9uKG9iaiwgaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICBpdGVyYXRlZSA9IGNiKGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgICB2YXIga2V5cyA9ICBfLmtleXMob2JqKSxcbiAgICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aCxcbiAgICAgICAgICByZXN1bHRzID0ge30sXG4gICAgICAgICAgY3VycmVudEtleTtcbiAgICAgIGZvciAodmFyIGluZGV4ID0gMDsgaW5kZXggPCBsZW5ndGg7IGluZGV4KyspIHtcbiAgICAgICAgY3VycmVudEtleSA9IGtleXNbaW5kZXhdO1xuICAgICAgICByZXN1bHRzW2N1cnJlbnRLZXldID0gaXRlcmF0ZWUob2JqW2N1cnJlbnRLZXldLCBjdXJyZW50S2V5LCBvYmopO1xuICAgICAgfVxuICAgICAgcmV0dXJuIHJlc3VsdHM7XG4gIH07XG5cbiAgLy8gQ29udmVydCBhbiBvYmplY3QgaW50byBhIGxpc3Qgb2YgYFtrZXksIHZhbHVlXWAgcGFpcnMuXG4gIF8ucGFpcnMgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhvYmopO1xuICAgIHZhciBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICB2YXIgcGFpcnMgPSBBcnJheShsZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHBhaXJzW2ldID0gW2tleXNbaV0sIG9ialtrZXlzW2ldXV07XG4gICAgfVxuICAgIHJldHVybiBwYWlycztcbiAgfTtcblxuICAvLyBJbnZlcnQgdGhlIGtleXMgYW5kIHZhbHVlcyBvZiBhbiBvYmplY3QuIFRoZSB2YWx1ZXMgbXVzdCBiZSBzZXJpYWxpemFibGUuXG4gIF8uaW52ZXJ0ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIHJlc3VsdCA9IHt9O1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaik7XG4gICAgZm9yICh2YXIgaSA9IDAsIGxlbmd0aCA9IGtleXMubGVuZ3RoOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHJlc3VsdFtvYmpba2V5c1tpXV1dID0ga2V5c1tpXTtcbiAgICB9XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSBzb3J0ZWQgbGlzdCBvZiB0aGUgZnVuY3Rpb24gbmFtZXMgYXZhaWxhYmxlIG9uIHRoZSBvYmplY3QuXG4gIC8vIEFsaWFzZWQgYXMgYG1ldGhvZHNgXG4gIF8uZnVuY3Rpb25zID0gXy5tZXRob2RzID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgdmFyIG5hbWVzID0gW107XG4gICAgZm9yICh2YXIga2V5IGluIG9iaikge1xuICAgICAgaWYgKF8uaXNGdW5jdGlvbihvYmpba2V5XSkpIG5hbWVzLnB1c2goa2V5KTtcbiAgICB9XG4gICAgcmV0dXJuIG5hbWVzLnNvcnQoKTtcbiAgfTtcblxuICAvLyBFeHRlbmQgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIHByb3BlcnRpZXMgaW4gcGFzc2VkLWluIG9iamVjdChzKS5cbiAgXy5leHRlbmQgPSBjcmVhdGVBc3NpZ25lcihfLmFsbEtleXMpO1xuXG4gIC8vIEFzc2lnbnMgYSBnaXZlbiBvYmplY3Qgd2l0aCBhbGwgdGhlIG93biBwcm9wZXJ0aWVzIGluIHRoZSBwYXNzZWQtaW4gb2JqZWN0KHMpXG4gIC8vIChodHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9kb2NzL1dlYi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9PYmplY3QvYXNzaWduKVxuICBfLmV4dGVuZE93biA9IF8uYXNzaWduID0gY3JlYXRlQXNzaWduZXIoXy5rZXlzKTtcblxuICAvLyBSZXR1cm5zIHRoZSBmaXJzdCBrZXkgb24gYW4gb2JqZWN0IHRoYXQgcGFzc2VzIGEgcHJlZGljYXRlIHRlc3RcbiAgXy5maW5kS2V5ID0gZnVuY3Rpb24ob2JqLCBwcmVkaWNhdGUsIGNvbnRleHQpIHtcbiAgICBwcmVkaWNhdGUgPSBjYihwcmVkaWNhdGUsIGNvbnRleHQpO1xuICAgIHZhciBrZXlzID0gXy5rZXlzKG9iaiksIGtleTtcbiAgICBmb3IgKHZhciBpID0gMCwgbGVuZ3RoID0ga2V5cy5sZW5ndGg7IGkgPCBsZW5ndGg7IGkrKykge1xuICAgICAga2V5ID0ga2V5c1tpXTtcbiAgICAgIGlmIChwcmVkaWNhdGUob2JqW2tleV0sIGtleSwgb2JqKSkgcmV0dXJuIGtleTtcbiAgICB9XG4gIH07XG5cbiAgLy8gUmV0dXJuIGEgY29weSBvZiB0aGUgb2JqZWN0IG9ubHkgY29udGFpbmluZyB0aGUgd2hpdGVsaXN0ZWQgcHJvcGVydGllcy5cbiAgXy5waWNrID0gZnVuY3Rpb24ob2JqZWN0LCBvaXRlcmF0ZWUsIGNvbnRleHQpIHtcbiAgICB2YXIgcmVzdWx0ID0ge30sIG9iaiA9IG9iamVjdCwgaXRlcmF0ZWUsIGtleXM7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gcmVzdWx0O1xuICAgIGlmIChfLmlzRnVuY3Rpb24ob2l0ZXJhdGVlKSkge1xuICAgICAga2V5cyA9IF8uYWxsS2V5cyhvYmopO1xuICAgICAgaXRlcmF0ZWUgPSBvcHRpbWl6ZUNiKG9pdGVyYXRlZSwgY29udGV4dCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGtleXMgPSBmbGF0dGVuKGFyZ3VtZW50cywgZmFsc2UsIGZhbHNlLCAxKTtcbiAgICAgIGl0ZXJhdGVlID0gZnVuY3Rpb24odmFsdWUsIGtleSwgb2JqKSB7IHJldHVybiBrZXkgaW4gb2JqOyB9O1xuICAgICAgb2JqID0gT2JqZWN0KG9iaik7XG4gICAgfVxuICAgIGZvciAodmFyIGkgPSAwLCBsZW5ndGggPSBrZXlzLmxlbmd0aDsgaSA8IGxlbmd0aDsgaSsrKSB7XG4gICAgICB2YXIga2V5ID0ga2V5c1tpXTtcbiAgICAgIHZhciB2YWx1ZSA9IG9ialtrZXldO1xuICAgICAgaWYgKGl0ZXJhdGVlKHZhbHVlLCBrZXksIG9iaikpIHJlc3VsdFtrZXldID0gdmFsdWU7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH07XG5cbiAgIC8vIFJldHVybiBhIGNvcHkgb2YgdGhlIG9iamVjdCB3aXRob3V0IHRoZSBibGFja2xpc3RlZCBwcm9wZXJ0aWVzLlxuICBfLm9taXQgPSBmdW5jdGlvbihvYmosIGl0ZXJhdGVlLCBjb250ZXh0KSB7XG4gICAgaWYgKF8uaXNGdW5jdGlvbihpdGVyYXRlZSkpIHtcbiAgICAgIGl0ZXJhdGVlID0gXy5uZWdhdGUoaXRlcmF0ZWUpO1xuICAgIH0gZWxzZSB7XG4gICAgICB2YXIga2V5cyA9IF8ubWFwKGZsYXR0ZW4oYXJndW1lbnRzLCBmYWxzZSwgZmFsc2UsIDEpLCBTdHJpbmcpO1xuICAgICAgaXRlcmF0ZWUgPSBmdW5jdGlvbih2YWx1ZSwga2V5KSB7XG4gICAgICAgIHJldHVybiAhXy5jb250YWlucyhrZXlzLCBrZXkpO1xuICAgICAgfTtcbiAgICB9XG4gICAgcmV0dXJuIF8ucGljayhvYmosIGl0ZXJhdGVlLCBjb250ZXh0KTtcbiAgfTtcblxuICAvLyBGaWxsIGluIGEgZ2l2ZW4gb2JqZWN0IHdpdGggZGVmYXVsdCBwcm9wZXJ0aWVzLlxuICBfLmRlZmF1bHRzID0gY3JlYXRlQXNzaWduZXIoXy5hbGxLZXlzLCB0cnVlKTtcblxuICAvLyBDcmVhdGVzIGFuIG9iamVjdCB0aGF0IGluaGVyaXRzIGZyb20gdGhlIGdpdmVuIHByb3RvdHlwZSBvYmplY3QuXG4gIC8vIElmIGFkZGl0aW9uYWwgcHJvcGVydGllcyBhcmUgcHJvdmlkZWQgdGhlbiB0aGV5IHdpbGwgYmUgYWRkZWQgdG8gdGhlXG4gIC8vIGNyZWF0ZWQgb2JqZWN0LlxuICBfLmNyZWF0ZSA9IGZ1bmN0aW9uKHByb3RvdHlwZSwgcHJvcHMpIHtcbiAgICB2YXIgcmVzdWx0ID0gYmFzZUNyZWF0ZShwcm90b3R5cGUpO1xuICAgIGlmIChwcm9wcykgXy5leHRlbmRPd24ocmVzdWx0LCBwcm9wcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfTtcblxuICAvLyBDcmVhdGUgYSAoc2hhbGxvdy1jbG9uZWQpIGR1cGxpY2F0ZSBvZiBhbiBvYmplY3QuXG4gIF8uY2xvbmUgPSBmdW5jdGlvbihvYmopIHtcbiAgICBpZiAoIV8uaXNPYmplY3Qob2JqKSkgcmV0dXJuIG9iajtcbiAgICByZXR1cm4gXy5pc0FycmF5KG9iaikgPyBvYmouc2xpY2UoKSA6IF8uZXh0ZW5kKHt9LCBvYmopO1xuICB9O1xuXG4gIC8vIEludm9rZXMgaW50ZXJjZXB0b3Igd2l0aCB0aGUgb2JqLCBhbmQgdGhlbiByZXR1cm5zIG9iai5cbiAgLy8gVGhlIHByaW1hcnkgcHVycG9zZSBvZiB0aGlzIG1ldGhvZCBpcyB0byBcInRhcCBpbnRvXCIgYSBtZXRob2QgY2hhaW4sIGluXG4gIC8vIG9yZGVyIHRvIHBlcmZvcm0gb3BlcmF0aW9ucyBvbiBpbnRlcm1lZGlhdGUgcmVzdWx0cyB3aXRoaW4gdGhlIGNoYWluLlxuICBfLnRhcCA9IGZ1bmN0aW9uKG9iaiwgaW50ZXJjZXB0b3IpIHtcbiAgICBpbnRlcmNlcHRvcihvYmopO1xuICAgIHJldHVybiBvYmo7XG4gIH07XG5cbiAgLy8gUmV0dXJucyB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYSBnaXZlbiBzZXQgb2YgYGtleTp2YWx1ZWAgcGFpcnMuXG4gIF8uaXNNYXRjaCA9IGZ1bmN0aW9uKG9iamVjdCwgYXR0cnMpIHtcbiAgICB2YXIga2V5cyA9IF8ua2V5cyhhdHRycyksIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgIGlmIChvYmplY3QgPT0gbnVsbCkgcmV0dXJuICFsZW5ndGg7XG4gICAgdmFyIG9iaiA9IE9iamVjdChvYmplY3QpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbGVuZ3RoOyBpKyspIHtcbiAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgaWYgKGF0dHJzW2tleV0gIT09IG9ialtrZXldIHx8ICEoa2V5IGluIG9iaikpIHJldHVybiBmYWxzZTtcbiAgICB9XG4gICAgcmV0dXJuIHRydWU7XG4gIH07XG5cblxuICAvLyBJbnRlcm5hbCByZWN1cnNpdmUgY29tcGFyaXNvbiBmdW5jdGlvbiBmb3IgYGlzRXF1YWxgLlxuICB2YXIgZXEgPSBmdW5jdGlvbihhLCBiLCBhU3RhY2ssIGJTdGFjaykge1xuICAgIC8vIElkZW50aWNhbCBvYmplY3RzIGFyZSBlcXVhbC4gYDAgPT09IC0wYCwgYnV0IHRoZXkgYXJlbid0IGlkZW50aWNhbC5cbiAgICAvLyBTZWUgdGhlIFtIYXJtb255IGBlZ2FsYCBwcm9wb3NhbF0oaHR0cDovL3dpa2kuZWNtYXNjcmlwdC5vcmcvZG9rdS5waHA/aWQ9aGFybW9ueTplZ2FsKS5cbiAgICBpZiAoYSA9PT0gYikgcmV0dXJuIGEgIT09IDAgfHwgMSAvIGEgPT09IDEgLyBiO1xuICAgIC8vIEEgc3RyaWN0IGNvbXBhcmlzb24gaXMgbmVjZXNzYXJ5IGJlY2F1c2UgYG51bGwgPT0gdW5kZWZpbmVkYC5cbiAgICBpZiAoYSA9PSBudWxsIHx8IGIgPT0gbnVsbCkgcmV0dXJuIGEgPT09IGI7XG4gICAgLy8gVW53cmFwIGFueSB3cmFwcGVkIG9iamVjdHMuXG4gICAgaWYgKGEgaW5zdGFuY2VvZiBfKSBhID0gYS5fd3JhcHBlZDtcbiAgICBpZiAoYiBpbnN0YW5jZW9mIF8pIGIgPSBiLl93cmFwcGVkO1xuICAgIC8vIENvbXBhcmUgYFtbQ2xhc3NdXWAgbmFtZXMuXG4gICAgdmFyIGNsYXNzTmFtZSA9IHRvU3RyaW5nLmNhbGwoYSk7XG4gICAgaWYgKGNsYXNzTmFtZSAhPT0gdG9TdHJpbmcuY2FsbChiKSkgcmV0dXJuIGZhbHNlO1xuICAgIHN3aXRjaCAoY2xhc3NOYW1lKSB7XG4gICAgICAvLyBTdHJpbmdzLCBudW1iZXJzLCByZWd1bGFyIGV4cHJlc3Npb25zLCBkYXRlcywgYW5kIGJvb2xlYW5zIGFyZSBjb21wYXJlZCBieSB2YWx1ZS5cbiAgICAgIGNhc2UgJ1tvYmplY3QgUmVnRXhwXSc6XG4gICAgICAvLyBSZWdFeHBzIGFyZSBjb2VyY2VkIHRvIHN0cmluZ3MgZm9yIGNvbXBhcmlzb24gKE5vdGU6ICcnICsgL2EvaSA9PT0gJy9hL2knKVxuICAgICAgY2FzZSAnW29iamVjdCBTdHJpbmddJzpcbiAgICAgICAgLy8gUHJpbWl0aXZlcyBhbmQgdGhlaXIgY29ycmVzcG9uZGluZyBvYmplY3Qgd3JhcHBlcnMgYXJlIGVxdWl2YWxlbnQ7IHRodXMsIGBcIjVcImAgaXNcbiAgICAgICAgLy8gZXF1aXZhbGVudCB0byBgbmV3IFN0cmluZyhcIjVcIilgLlxuICAgICAgICByZXR1cm4gJycgKyBhID09PSAnJyArIGI7XG4gICAgICBjYXNlICdbb2JqZWN0IE51bWJlcl0nOlxuICAgICAgICAvLyBgTmFOYHMgYXJlIGVxdWl2YWxlbnQsIGJ1dCBub24tcmVmbGV4aXZlLlxuICAgICAgICAvLyBPYmplY3QoTmFOKSBpcyBlcXVpdmFsZW50IHRvIE5hTlxuICAgICAgICBpZiAoK2EgIT09ICthKSByZXR1cm4gK2IgIT09ICtiO1xuICAgICAgICAvLyBBbiBgZWdhbGAgY29tcGFyaXNvbiBpcyBwZXJmb3JtZWQgZm9yIG90aGVyIG51bWVyaWMgdmFsdWVzLlxuICAgICAgICByZXR1cm4gK2EgPT09IDAgPyAxIC8gK2EgPT09IDEgLyBiIDogK2EgPT09ICtiO1xuICAgICAgY2FzZSAnW29iamVjdCBEYXRlXSc6XG4gICAgICBjYXNlICdbb2JqZWN0IEJvb2xlYW5dJzpcbiAgICAgICAgLy8gQ29lcmNlIGRhdGVzIGFuZCBib29sZWFucyB0byBudW1lcmljIHByaW1pdGl2ZSB2YWx1ZXMuIERhdGVzIGFyZSBjb21wYXJlZCBieSB0aGVpclxuICAgICAgICAvLyBtaWxsaXNlY29uZCByZXByZXNlbnRhdGlvbnMuIE5vdGUgdGhhdCBpbnZhbGlkIGRhdGVzIHdpdGggbWlsbGlzZWNvbmQgcmVwcmVzZW50YXRpb25zXG4gICAgICAgIC8vIG9mIGBOYU5gIGFyZSBub3QgZXF1aXZhbGVudC5cbiAgICAgICAgcmV0dXJuICthID09PSArYjtcbiAgICB9XG5cbiAgICB2YXIgYXJlQXJyYXlzID0gY2xhc3NOYW1lID09PSAnW29iamVjdCBBcnJheV0nO1xuICAgIGlmICghYXJlQXJyYXlzKSB7XG4gICAgICBpZiAodHlwZW9mIGEgIT0gJ29iamVjdCcgfHwgdHlwZW9mIGIgIT0gJ29iamVjdCcpIHJldHVybiBmYWxzZTtcblxuICAgICAgLy8gT2JqZWN0cyB3aXRoIGRpZmZlcmVudCBjb25zdHJ1Y3RvcnMgYXJlIG5vdCBlcXVpdmFsZW50LCBidXQgYE9iamVjdGBzIG9yIGBBcnJheWBzXG4gICAgICAvLyBmcm9tIGRpZmZlcmVudCBmcmFtZXMgYXJlLlxuICAgICAgdmFyIGFDdG9yID0gYS5jb25zdHJ1Y3RvciwgYkN0b3IgPSBiLmNvbnN0cnVjdG9yO1xuICAgICAgaWYgKGFDdG9yICE9PSBiQ3RvciAmJiAhKF8uaXNGdW5jdGlvbihhQ3RvcikgJiYgYUN0b3IgaW5zdGFuY2VvZiBhQ3RvciAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8uaXNGdW5jdGlvbihiQ3RvcikgJiYgYkN0b3IgaW5zdGFuY2VvZiBiQ3RvcilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgJiYgKCdjb25zdHJ1Y3RvcicgaW4gYSAmJiAnY29uc3RydWN0b3InIGluIGIpKSB7XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gQXNzdW1lIGVxdWFsaXR5IGZvciBjeWNsaWMgc3RydWN0dXJlcy4gVGhlIGFsZ29yaXRobSBmb3IgZGV0ZWN0aW5nIGN5Y2xpY1xuICAgIC8vIHN0cnVjdHVyZXMgaXMgYWRhcHRlZCBmcm9tIEVTIDUuMSBzZWN0aW9uIDE1LjEyLjMsIGFic3RyYWN0IG9wZXJhdGlvbiBgSk9gLlxuXG4gICAgLy8gSW5pdGlhbGl6aW5nIHN0YWNrIG9mIHRyYXZlcnNlZCBvYmplY3RzLlxuICAgIC8vIEl0J3MgZG9uZSBoZXJlIHNpbmNlIHdlIG9ubHkgbmVlZCB0aGVtIGZvciBvYmplY3RzIGFuZCBhcnJheXMgY29tcGFyaXNvbi5cbiAgICBhU3RhY2sgPSBhU3RhY2sgfHwgW107XG4gICAgYlN0YWNrID0gYlN0YWNrIHx8IFtdO1xuICAgIHZhciBsZW5ndGggPSBhU3RhY2subGVuZ3RoO1xuICAgIHdoaWxlIChsZW5ndGgtLSkge1xuICAgICAgLy8gTGluZWFyIHNlYXJjaC4gUGVyZm9ybWFuY2UgaXMgaW52ZXJzZWx5IHByb3BvcnRpb25hbCB0byB0aGUgbnVtYmVyIG9mXG4gICAgICAvLyB1bmlxdWUgbmVzdGVkIHN0cnVjdHVyZXMuXG4gICAgICBpZiAoYVN0YWNrW2xlbmd0aF0gPT09IGEpIHJldHVybiBiU3RhY2tbbGVuZ3RoXSA9PT0gYjtcbiAgICB9XG5cbiAgICAvLyBBZGQgdGhlIGZpcnN0IG9iamVjdCB0byB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnB1c2goYSk7XG4gICAgYlN0YWNrLnB1c2goYik7XG5cbiAgICAvLyBSZWN1cnNpdmVseSBjb21wYXJlIG9iamVjdHMgYW5kIGFycmF5cy5cbiAgICBpZiAoYXJlQXJyYXlzKSB7XG4gICAgICAvLyBDb21wYXJlIGFycmF5IGxlbmd0aHMgdG8gZGV0ZXJtaW5lIGlmIGEgZGVlcCBjb21wYXJpc29uIGlzIG5lY2Vzc2FyeS5cbiAgICAgIGxlbmd0aCA9IGEubGVuZ3RoO1xuICAgICAgaWYgKGxlbmd0aCAhPT0gYi5sZW5ndGgpIHJldHVybiBmYWxzZTtcbiAgICAgIC8vIERlZXAgY29tcGFyZSB0aGUgY29udGVudHMsIGlnbm9yaW5nIG5vbi1udW1lcmljIHByb3BlcnRpZXMuXG4gICAgICB3aGlsZSAobGVuZ3RoLS0pIHtcbiAgICAgICAgaWYgKCFlcShhW2xlbmd0aF0sIGJbbGVuZ3RoXSwgYVN0YWNrLCBiU3RhY2spKSByZXR1cm4gZmFsc2U7XG4gICAgICB9XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIERlZXAgY29tcGFyZSBvYmplY3RzLlxuICAgICAgdmFyIGtleXMgPSBfLmtleXMoYSksIGtleTtcbiAgICAgIGxlbmd0aCA9IGtleXMubGVuZ3RoO1xuICAgICAgLy8gRW5zdXJlIHRoYXQgYm90aCBvYmplY3RzIGNvbnRhaW4gdGhlIHNhbWUgbnVtYmVyIG9mIHByb3BlcnRpZXMgYmVmb3JlIGNvbXBhcmluZyBkZWVwIGVxdWFsaXR5LlxuICAgICAgaWYgKF8ua2V5cyhiKS5sZW5ndGggIT09IGxlbmd0aCkgcmV0dXJuIGZhbHNlO1xuICAgICAgd2hpbGUgKGxlbmd0aC0tKSB7XG4gICAgICAgIC8vIERlZXAgY29tcGFyZSBlYWNoIG1lbWJlclxuICAgICAgICBrZXkgPSBrZXlzW2xlbmd0aF07XG4gICAgICAgIGlmICghKF8uaGFzKGIsIGtleSkgJiYgZXEoYVtrZXldLCBiW2tleV0sIGFTdGFjaywgYlN0YWNrKSkpIHJldHVybiBmYWxzZTtcbiAgICAgIH1cbiAgICB9XG4gICAgLy8gUmVtb3ZlIHRoZSBmaXJzdCBvYmplY3QgZnJvbSB0aGUgc3RhY2sgb2YgdHJhdmVyc2VkIG9iamVjdHMuXG4gICAgYVN0YWNrLnBvcCgpO1xuICAgIGJTdGFjay5wb3AoKTtcbiAgICByZXR1cm4gdHJ1ZTtcbiAgfTtcblxuICAvLyBQZXJmb3JtIGEgZGVlcCBjb21wYXJpc29uIHRvIGNoZWNrIGlmIHR3byBvYmplY3RzIGFyZSBlcXVhbC5cbiAgXy5pc0VxdWFsID0gZnVuY3Rpb24oYSwgYikge1xuICAgIHJldHVybiBlcShhLCBiKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIGFycmF5LCBzdHJpbmcsIG9yIG9iamVjdCBlbXB0eT9cbiAgLy8gQW4gXCJlbXB0eVwiIG9iamVjdCBoYXMgbm8gZW51bWVyYWJsZSBvd24tcHJvcGVydGllcy5cbiAgXy5pc0VtcHR5ID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgaWYgKG9iaiA9PSBudWxsKSByZXR1cm4gdHJ1ZTtcbiAgICBpZiAoaXNBcnJheUxpa2Uob2JqKSAmJiAoXy5pc0FycmF5KG9iaikgfHwgXy5pc1N0cmluZyhvYmopIHx8IF8uaXNBcmd1bWVudHMob2JqKSkpIHJldHVybiBvYmoubGVuZ3RoID09PSAwO1xuICAgIHJldHVybiBfLmtleXMob2JqKS5sZW5ndGggPT09IDA7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIERPTSBlbGVtZW50P1xuICBfLmlzRWxlbWVudCA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiAhIShvYmogJiYgb2JqLm5vZGVUeXBlID09PSAxKTtcbiAgfTtcblxuICAvLyBJcyBhIGdpdmVuIHZhbHVlIGFuIGFycmF5P1xuICAvLyBEZWxlZ2F0ZXMgdG8gRUNNQTUncyBuYXRpdmUgQXJyYXkuaXNBcnJheVxuICBfLmlzQXJyYXkgPSBuYXRpdmVJc0FycmF5IHx8IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiB0b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YXJpYWJsZSBhbiBvYmplY3Q/XG4gIF8uaXNPYmplY3QgPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgdHlwZSA9IHR5cGVvZiBvYmo7XG4gICAgcmV0dXJuIHR5cGUgPT09ICdmdW5jdGlvbicgfHwgdHlwZSA9PT0gJ29iamVjdCcgJiYgISFvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHNvbWUgaXNUeXBlIG1ldGhvZHM6IGlzQXJndW1lbnRzLCBpc0Z1bmN0aW9uLCBpc1N0cmluZywgaXNOdW1iZXIsIGlzRGF0ZSwgaXNSZWdFeHAsIGlzRXJyb3IuXG4gIF8uZWFjaChbJ0FyZ3VtZW50cycsICdGdW5jdGlvbicsICdTdHJpbmcnLCAnTnVtYmVyJywgJ0RhdGUnLCAnUmVnRXhwJywgJ0Vycm9yJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICBfWydpcycgKyBuYW1lXSA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgJyArIG5hbWUgKyAnXSc7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRGVmaW5lIGEgZmFsbGJhY2sgdmVyc2lvbiBvZiB0aGUgbWV0aG9kIGluIGJyb3dzZXJzIChhaGVtLCBJRSA8IDkpLCB3aGVyZVxuICAvLyB0aGVyZSBpc24ndCBhbnkgaW5zcGVjdGFibGUgXCJBcmd1bWVudHNcIiB0eXBlLlxuICBpZiAoIV8uaXNBcmd1bWVudHMoYXJndW1lbnRzKSkge1xuICAgIF8uaXNBcmd1bWVudHMgPSBmdW5jdGlvbihvYmopIHtcbiAgICAgIHJldHVybiBfLmhhcyhvYmosICdjYWxsZWUnKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gT3B0aW1pemUgYGlzRnVuY3Rpb25gIGlmIGFwcHJvcHJpYXRlLiBXb3JrIGFyb3VuZCBzb21lIHR5cGVvZiBidWdzIGluIG9sZCB2OCxcbiAgLy8gSUUgMTEgKCMxNjIxKSwgYW5kIGluIFNhZmFyaSA4ICgjMTkyOSkuXG4gIGlmICh0eXBlb2YgLy4vICE9ICdmdW5jdGlvbicgJiYgdHlwZW9mIEludDhBcnJheSAhPSAnb2JqZWN0Jykge1xuICAgIF8uaXNGdW5jdGlvbiA9IGZ1bmN0aW9uKG9iaikge1xuICAgICAgcmV0dXJuIHR5cGVvZiBvYmogPT0gJ2Z1bmN0aW9uJyB8fCBmYWxzZTtcbiAgICB9O1xuICB9XG5cbiAgLy8gSXMgYSBnaXZlbiBvYmplY3QgYSBmaW5pdGUgbnVtYmVyP1xuICBfLmlzRmluaXRlID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIGlzRmluaXRlKG9iaikgJiYgIWlzTmFOKHBhcnNlRmxvYXQob2JqKSk7XG4gIH07XG5cbiAgLy8gSXMgdGhlIGdpdmVuIHZhbHVlIGBOYU5gPyAoTmFOIGlzIHRoZSBvbmx5IG51bWJlciB3aGljaCBkb2VzIG5vdCBlcXVhbCBpdHNlbGYpLlxuICBfLmlzTmFOID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIF8uaXNOdW1iZXIob2JqKSAmJiBvYmogIT09ICtvYmo7XG4gIH07XG5cbiAgLy8gSXMgYSBnaXZlbiB2YWx1ZSBhIGJvb2xlYW4/XG4gIF8uaXNCb29sZWFuID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdHJ1ZSB8fCBvYmogPT09IGZhbHNlIHx8IHRvU3RyaW5nLmNhbGwob2JqKSA9PT0gJ1tvYmplY3QgQm9vbGVhbl0nO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFsdWUgZXF1YWwgdG8gbnVsbD9cbiAgXy5pc051bGwgPSBmdW5jdGlvbihvYmopIHtcbiAgICByZXR1cm4gb2JqID09PSBudWxsO1xuICB9O1xuXG4gIC8vIElzIGEgZ2l2ZW4gdmFyaWFibGUgdW5kZWZpbmVkP1xuICBfLmlzVW5kZWZpbmVkID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgcmV0dXJuIG9iaiA9PT0gdm9pZCAwO1xuICB9O1xuXG4gIC8vIFNob3J0Y3V0IGZ1bmN0aW9uIGZvciBjaGVja2luZyBpZiBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gcHJvcGVydHkgZGlyZWN0bHlcbiAgLy8gb24gaXRzZWxmIChpbiBvdGhlciB3b3Jkcywgbm90IG9uIGEgcHJvdG90eXBlKS5cbiAgXy5oYXMgPSBmdW5jdGlvbihvYmosIGtleSkge1xuICAgIHJldHVybiBvYmogIT0gbnVsbCAmJiBoYXNPd25Qcm9wZXJ0eS5jYWxsKG9iaiwga2V5KTtcbiAgfTtcblxuICAvLyBVdGlsaXR5IEZ1bmN0aW9uc1xuICAvLyAtLS0tLS0tLS0tLS0tLS0tLVxuXG4gIC8vIFJ1biBVbmRlcnNjb3JlLmpzIGluICpub0NvbmZsaWN0KiBtb2RlLCByZXR1cm5pbmcgdGhlIGBfYCB2YXJpYWJsZSB0byBpdHNcbiAgLy8gcHJldmlvdXMgb3duZXIuIFJldHVybnMgYSByZWZlcmVuY2UgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm5vQ29uZmxpY3QgPSBmdW5jdGlvbigpIHtcbiAgICByb290Ll8gPSBwcmV2aW91c1VuZGVyc2NvcmU7XG4gICAgcmV0dXJuIHRoaXM7XG4gIH07XG5cbiAgLy8gS2VlcCB0aGUgaWRlbnRpdHkgZnVuY3Rpb24gYXJvdW5kIGZvciBkZWZhdWx0IGl0ZXJhdGVlcy5cbiAgXy5pZGVudGl0eSA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9O1xuXG4gIC8vIFByZWRpY2F0ZS1nZW5lcmF0aW5nIGZ1bmN0aW9ucy4gT2Z0ZW4gdXNlZnVsIG91dHNpZGUgb2YgVW5kZXJzY29yZS5cbiAgXy5jb25zdGFudCA9IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgcmV0dXJuIGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH07XG4gIH07XG5cbiAgXy5ub29wID0gZnVuY3Rpb24oKXt9O1xuXG4gIF8ucHJvcGVydHkgPSBwcm9wZXJ0eTtcblxuICAvLyBHZW5lcmF0ZXMgYSBmdW5jdGlvbiBmb3IgYSBnaXZlbiBvYmplY3QgdGhhdCByZXR1cm5zIGEgZ2l2ZW4gcHJvcGVydHkuXG4gIF8ucHJvcGVydHlPZiA9IGZ1bmN0aW9uKG9iaikge1xuICAgIHJldHVybiBvYmogPT0gbnVsbCA/IGZ1bmN0aW9uKCl7fSA6IGZ1bmN0aW9uKGtleSkge1xuICAgICAgcmV0dXJuIG9ialtrZXldO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUmV0dXJucyBhIHByZWRpY2F0ZSBmb3IgY2hlY2tpbmcgd2hldGhlciBhbiBvYmplY3QgaGFzIGEgZ2l2ZW4gc2V0IG9mXG4gIC8vIGBrZXk6dmFsdWVgIHBhaXJzLlxuICBfLm1hdGNoZXIgPSBfLm1hdGNoZXMgPSBmdW5jdGlvbihhdHRycykge1xuICAgIGF0dHJzID0gXy5leHRlbmRPd24oe30sIGF0dHJzKTtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqKSB7XG4gICAgICByZXR1cm4gXy5pc01hdGNoKG9iaiwgYXR0cnMpO1xuICAgIH07XG4gIH07XG5cbiAgLy8gUnVuIGEgZnVuY3Rpb24gKipuKiogdGltZXMuXG4gIF8udGltZXMgPSBmdW5jdGlvbihuLCBpdGVyYXRlZSwgY29udGV4dCkge1xuICAgIHZhciBhY2N1bSA9IEFycmF5KE1hdGgubWF4KDAsIG4pKTtcbiAgICBpdGVyYXRlZSA9IG9wdGltaXplQ2IoaXRlcmF0ZWUsIGNvbnRleHQsIDEpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgbjsgaSsrKSBhY2N1bVtpXSA9IGl0ZXJhdGVlKGkpO1xuICAgIHJldHVybiBhY2N1bTtcbiAgfTtcblxuICAvLyBSZXR1cm4gYSByYW5kb20gaW50ZWdlciBiZXR3ZWVuIG1pbiBhbmQgbWF4IChpbmNsdXNpdmUpLlxuICBfLnJhbmRvbSA9IGZ1bmN0aW9uKG1pbiwgbWF4KSB7XG4gICAgaWYgKG1heCA9PSBudWxsKSB7XG4gICAgICBtYXggPSBtaW47XG4gICAgICBtaW4gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gbWluICsgTWF0aC5mbG9vcihNYXRoLnJhbmRvbSgpICogKG1heCAtIG1pbiArIDEpKTtcbiAgfTtcblxuICAvLyBBIChwb3NzaWJseSBmYXN0ZXIpIHdheSB0byBnZXQgdGhlIGN1cnJlbnQgdGltZXN0YW1wIGFzIGFuIGludGVnZXIuXG4gIF8ubm93ID0gRGF0ZS5ub3cgfHwgZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkuZ2V0VGltZSgpO1xuICB9O1xuXG4gICAvLyBMaXN0IG9mIEhUTUwgZW50aXRpZXMgZm9yIGVzY2FwaW5nLlxuICB2YXIgZXNjYXBlTWFwID0ge1xuICAgICcmJzogJyZhbXA7JyxcbiAgICAnPCc6ICcmbHQ7JyxcbiAgICAnPic6ICcmZ3Q7JyxcbiAgICAnXCInOiAnJnF1b3Q7JyxcbiAgICBcIidcIjogJyYjeDI3OycsXG4gICAgJ2AnOiAnJiN4NjA7J1xuICB9O1xuICB2YXIgdW5lc2NhcGVNYXAgPSBfLmludmVydChlc2NhcGVNYXApO1xuXG4gIC8vIEZ1bmN0aW9ucyBmb3IgZXNjYXBpbmcgYW5kIHVuZXNjYXBpbmcgc3RyaW5ncyB0by9mcm9tIEhUTUwgaW50ZXJwb2xhdGlvbi5cbiAgdmFyIGNyZWF0ZUVzY2FwZXIgPSBmdW5jdGlvbihtYXApIHtcbiAgICB2YXIgZXNjYXBlciA9IGZ1bmN0aW9uKG1hdGNoKSB7XG4gICAgICByZXR1cm4gbWFwW21hdGNoXTtcbiAgICB9O1xuICAgIC8vIFJlZ2V4ZXMgZm9yIGlkZW50aWZ5aW5nIGEga2V5IHRoYXQgbmVlZHMgdG8gYmUgZXNjYXBlZFxuICAgIHZhciBzb3VyY2UgPSAnKD86JyArIF8ua2V5cyhtYXApLmpvaW4oJ3wnKSArICcpJztcbiAgICB2YXIgdGVzdFJlZ2V4cCA9IFJlZ0V4cChzb3VyY2UpO1xuICAgIHZhciByZXBsYWNlUmVnZXhwID0gUmVnRXhwKHNvdXJjZSwgJ2cnKTtcbiAgICByZXR1cm4gZnVuY3Rpb24oc3RyaW5nKSB7XG4gICAgICBzdHJpbmcgPSBzdHJpbmcgPT0gbnVsbCA/ICcnIDogJycgKyBzdHJpbmc7XG4gICAgICByZXR1cm4gdGVzdFJlZ2V4cC50ZXN0KHN0cmluZykgPyBzdHJpbmcucmVwbGFjZShyZXBsYWNlUmVnZXhwLCBlc2NhcGVyKSA6IHN0cmluZztcbiAgICB9O1xuICB9O1xuICBfLmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIoZXNjYXBlTWFwKTtcbiAgXy51bmVzY2FwZSA9IGNyZWF0ZUVzY2FwZXIodW5lc2NhcGVNYXApO1xuXG4gIC8vIElmIHRoZSB2YWx1ZSBvZiB0aGUgbmFtZWQgYHByb3BlcnR5YCBpcyBhIGZ1bmN0aW9uIHRoZW4gaW52b2tlIGl0IHdpdGggdGhlXG4gIC8vIGBvYmplY3RgIGFzIGNvbnRleHQ7IG90aGVyd2lzZSwgcmV0dXJuIGl0LlxuICBfLnJlc3VsdCA9IGZ1bmN0aW9uKG9iamVjdCwgcHJvcGVydHksIGZhbGxiYWNrKSB7XG4gICAgdmFyIHZhbHVlID0gb2JqZWN0ID09IG51bGwgPyB2b2lkIDAgOiBvYmplY3RbcHJvcGVydHldO1xuICAgIGlmICh2YWx1ZSA9PT0gdm9pZCAwKSB7XG4gICAgICB2YWx1ZSA9IGZhbGxiYWNrO1xuICAgIH1cbiAgICByZXR1cm4gXy5pc0Z1bmN0aW9uKHZhbHVlKSA/IHZhbHVlLmNhbGwob2JqZWN0KSA6IHZhbHVlO1xuICB9O1xuXG4gIC8vIEdlbmVyYXRlIGEgdW5pcXVlIGludGVnZXIgaWQgKHVuaXF1ZSB3aXRoaW4gdGhlIGVudGlyZSBjbGllbnQgc2Vzc2lvbikuXG4gIC8vIFVzZWZ1bCBmb3IgdGVtcG9yYXJ5IERPTSBpZHMuXG4gIHZhciBpZENvdW50ZXIgPSAwO1xuICBfLnVuaXF1ZUlkID0gZnVuY3Rpb24ocHJlZml4KSB7XG4gICAgdmFyIGlkID0gKytpZENvdW50ZXIgKyAnJztcbiAgICByZXR1cm4gcHJlZml4ID8gcHJlZml4ICsgaWQgOiBpZDtcbiAgfTtcblxuICAvLyBCeSBkZWZhdWx0LCBVbmRlcnNjb3JlIHVzZXMgRVJCLXN0eWxlIHRlbXBsYXRlIGRlbGltaXRlcnMsIGNoYW5nZSB0aGVcbiAgLy8gZm9sbG93aW5nIHRlbXBsYXRlIHNldHRpbmdzIHRvIHVzZSBhbHRlcm5hdGl2ZSBkZWxpbWl0ZXJzLlxuICBfLnRlbXBsYXRlU2V0dGluZ3MgPSB7XG4gICAgZXZhbHVhdGUgICAgOiAvPCUoW1xcc1xcU10rPyklPi9nLFxuICAgIGludGVycG9sYXRlIDogLzwlPShbXFxzXFxTXSs/KSU+L2csXG4gICAgZXNjYXBlICAgICAgOiAvPCUtKFtcXHNcXFNdKz8pJT4vZ1xuICB9O1xuXG4gIC8vIFdoZW4gY3VzdG9taXppbmcgYHRlbXBsYXRlU2V0dGluZ3NgLCBpZiB5b3UgZG9uJ3Qgd2FudCB0byBkZWZpbmUgYW5cbiAgLy8gaW50ZXJwb2xhdGlvbiwgZXZhbHVhdGlvbiBvciBlc2NhcGluZyByZWdleCwgd2UgbmVlZCBvbmUgdGhhdCBpc1xuICAvLyBndWFyYW50ZWVkIG5vdCB0byBtYXRjaC5cbiAgdmFyIG5vTWF0Y2ggPSAvKC4pXi87XG5cbiAgLy8gQ2VydGFpbiBjaGFyYWN0ZXJzIG5lZWQgdG8gYmUgZXNjYXBlZCBzbyB0aGF0IHRoZXkgY2FuIGJlIHB1dCBpbnRvIGFcbiAgLy8gc3RyaW5nIGxpdGVyYWwuXG4gIHZhciBlc2NhcGVzID0ge1xuICAgIFwiJ1wiOiAgICAgIFwiJ1wiLFxuICAgICdcXFxcJzogICAgICdcXFxcJyxcbiAgICAnXFxyJzogICAgICdyJyxcbiAgICAnXFxuJzogICAgICduJyxcbiAgICAnXFx1MjAyOCc6ICd1MjAyOCcsXG4gICAgJ1xcdTIwMjknOiAndTIwMjknXG4gIH07XG5cbiAgdmFyIGVzY2FwZXIgPSAvXFxcXHwnfFxccnxcXG58XFx1MjAyOHxcXHUyMDI5L2c7XG5cbiAgdmFyIGVzY2FwZUNoYXIgPSBmdW5jdGlvbihtYXRjaCkge1xuICAgIHJldHVybiAnXFxcXCcgKyBlc2NhcGVzW21hdGNoXTtcbiAgfTtcblxuICAvLyBKYXZhU2NyaXB0IG1pY3JvLXRlbXBsYXRpbmcsIHNpbWlsYXIgdG8gSm9obiBSZXNpZydzIGltcGxlbWVudGF0aW9uLlxuICAvLyBVbmRlcnNjb3JlIHRlbXBsYXRpbmcgaGFuZGxlcyBhcmJpdHJhcnkgZGVsaW1pdGVycywgcHJlc2VydmVzIHdoaXRlc3BhY2UsXG4gIC8vIGFuZCBjb3JyZWN0bHkgZXNjYXBlcyBxdW90ZXMgd2l0aGluIGludGVycG9sYXRlZCBjb2RlLlxuICAvLyBOQjogYG9sZFNldHRpbmdzYCBvbmx5IGV4aXN0cyBmb3IgYmFja3dhcmRzIGNvbXBhdGliaWxpdHkuXG4gIF8udGVtcGxhdGUgPSBmdW5jdGlvbih0ZXh0LCBzZXR0aW5ncywgb2xkU2V0dGluZ3MpIHtcbiAgICBpZiAoIXNldHRpbmdzICYmIG9sZFNldHRpbmdzKSBzZXR0aW5ncyA9IG9sZFNldHRpbmdzO1xuICAgIHNldHRpbmdzID0gXy5kZWZhdWx0cyh7fSwgc2V0dGluZ3MsIF8udGVtcGxhdGVTZXR0aW5ncyk7XG5cbiAgICAvLyBDb21iaW5lIGRlbGltaXRlcnMgaW50byBvbmUgcmVndWxhciBleHByZXNzaW9uIHZpYSBhbHRlcm5hdGlvbi5cbiAgICB2YXIgbWF0Y2hlciA9IFJlZ0V4cChbXG4gICAgICAoc2V0dGluZ3MuZXNjYXBlIHx8IG5vTWF0Y2gpLnNvdXJjZSxcbiAgICAgIChzZXR0aW5ncy5pbnRlcnBvbGF0ZSB8fCBub01hdGNoKS5zb3VyY2UsXG4gICAgICAoc2V0dGluZ3MuZXZhbHVhdGUgfHwgbm9NYXRjaCkuc291cmNlXG4gICAgXS5qb2luKCd8JykgKyAnfCQnLCAnZycpO1xuXG4gICAgLy8gQ29tcGlsZSB0aGUgdGVtcGxhdGUgc291cmNlLCBlc2NhcGluZyBzdHJpbmcgbGl0ZXJhbHMgYXBwcm9wcmlhdGVseS5cbiAgICB2YXIgaW5kZXggPSAwO1xuICAgIHZhciBzb3VyY2UgPSBcIl9fcCs9J1wiO1xuICAgIHRleHQucmVwbGFjZShtYXRjaGVyLCBmdW5jdGlvbihtYXRjaCwgZXNjYXBlLCBpbnRlcnBvbGF0ZSwgZXZhbHVhdGUsIG9mZnNldCkge1xuICAgICAgc291cmNlICs9IHRleHQuc2xpY2UoaW5kZXgsIG9mZnNldCkucmVwbGFjZShlc2NhcGVyLCBlc2NhcGVDaGFyKTtcbiAgICAgIGluZGV4ID0gb2Zmc2V0ICsgbWF0Y2gubGVuZ3RoO1xuXG4gICAgICBpZiAoZXNjYXBlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgZXNjYXBlICsgXCIpKT09bnVsbD8nJzpfLmVzY2FwZShfX3QpKStcXG4nXCI7XG4gICAgICB9IGVsc2UgaWYgKGludGVycG9sYXRlKSB7XG4gICAgICAgIHNvdXJjZSArPSBcIicrXFxuKChfX3Q9KFwiICsgaW50ZXJwb2xhdGUgKyBcIikpPT1udWxsPycnOl9fdCkrXFxuJ1wiO1xuICAgICAgfSBlbHNlIGlmIChldmFsdWF0ZSkge1xuICAgICAgICBzb3VyY2UgKz0gXCInO1xcblwiICsgZXZhbHVhdGUgKyBcIlxcbl9fcCs9J1wiO1xuICAgICAgfVxuXG4gICAgICAvLyBBZG9iZSBWTXMgbmVlZCB0aGUgbWF0Y2ggcmV0dXJuZWQgdG8gcHJvZHVjZSB0aGUgY29ycmVjdCBvZmZlc3QuXG4gICAgICByZXR1cm4gbWF0Y2g7XG4gICAgfSk7XG4gICAgc291cmNlICs9IFwiJztcXG5cIjtcblxuICAgIC8vIElmIGEgdmFyaWFibGUgaXMgbm90IHNwZWNpZmllZCwgcGxhY2UgZGF0YSB2YWx1ZXMgaW4gbG9jYWwgc2NvcGUuXG4gICAgaWYgKCFzZXR0aW5ncy52YXJpYWJsZSkgc291cmNlID0gJ3dpdGgob2JqfHx7fSl7XFxuJyArIHNvdXJjZSArICd9XFxuJztcblxuICAgIHNvdXJjZSA9IFwidmFyIF9fdCxfX3A9JycsX19qPUFycmF5LnByb3RvdHlwZS5qb2luLFwiICtcbiAgICAgIFwicHJpbnQ9ZnVuY3Rpb24oKXtfX3ArPV9fai5jYWxsKGFyZ3VtZW50cywnJyk7fTtcXG5cIiArXG4gICAgICBzb3VyY2UgKyAncmV0dXJuIF9fcDtcXG4nO1xuXG4gICAgdHJ5IHtcbiAgICAgIHZhciByZW5kZXIgPSBuZXcgRnVuY3Rpb24oc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaicsICdfJywgc291cmNlKTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgICBlLnNvdXJjZSA9IHNvdXJjZTtcbiAgICAgIHRocm93IGU7XG4gICAgfVxuXG4gICAgdmFyIHRlbXBsYXRlID0gZnVuY3Rpb24oZGF0YSkge1xuICAgICAgcmV0dXJuIHJlbmRlci5jYWxsKHRoaXMsIGRhdGEsIF8pO1xuICAgIH07XG5cbiAgICAvLyBQcm92aWRlIHRoZSBjb21waWxlZCBzb3VyY2UgYXMgYSBjb252ZW5pZW5jZSBmb3IgcHJlY29tcGlsYXRpb24uXG4gICAgdmFyIGFyZ3VtZW50ID0gc2V0dGluZ3MudmFyaWFibGUgfHwgJ29iaic7XG4gICAgdGVtcGxhdGUuc291cmNlID0gJ2Z1bmN0aW9uKCcgKyBhcmd1bWVudCArICcpe1xcbicgKyBzb3VyY2UgKyAnfSc7XG5cbiAgICByZXR1cm4gdGVtcGxhdGU7XG4gIH07XG5cbiAgLy8gQWRkIGEgXCJjaGFpblwiIGZ1bmN0aW9uLiBTdGFydCBjaGFpbmluZyBhIHdyYXBwZWQgVW5kZXJzY29yZSBvYmplY3QuXG4gIF8uY2hhaW4gPSBmdW5jdGlvbihvYmopIHtcbiAgICB2YXIgaW5zdGFuY2UgPSBfKG9iaik7XG4gICAgaW5zdGFuY2UuX2NoYWluID0gdHJ1ZTtcbiAgICByZXR1cm4gaW5zdGFuY2U7XG4gIH07XG5cbiAgLy8gT09QXG4gIC8vIC0tLS0tLS0tLS0tLS0tLVxuICAvLyBJZiBVbmRlcnNjb3JlIGlzIGNhbGxlZCBhcyBhIGZ1bmN0aW9uLCBpdCByZXR1cm5zIGEgd3JhcHBlZCBvYmplY3QgdGhhdFxuICAvLyBjYW4gYmUgdXNlZCBPTy1zdHlsZS4gVGhpcyB3cmFwcGVyIGhvbGRzIGFsdGVyZWQgdmVyc2lvbnMgb2YgYWxsIHRoZVxuICAvLyB1bmRlcnNjb3JlIGZ1bmN0aW9ucy4gV3JhcHBlZCBvYmplY3RzIG1heSBiZSBjaGFpbmVkLlxuXG4gIC8vIEhlbHBlciBmdW5jdGlvbiB0byBjb250aW51ZSBjaGFpbmluZyBpbnRlcm1lZGlhdGUgcmVzdWx0cy5cbiAgdmFyIHJlc3VsdCA9IGZ1bmN0aW9uKGluc3RhbmNlLCBvYmopIHtcbiAgICByZXR1cm4gaW5zdGFuY2UuX2NoYWluID8gXyhvYmopLmNoYWluKCkgOiBvYmo7XG4gIH07XG5cbiAgLy8gQWRkIHlvdXIgb3duIGN1c3RvbSBmdW5jdGlvbnMgdG8gdGhlIFVuZGVyc2NvcmUgb2JqZWN0LlxuICBfLm1peGluID0gZnVuY3Rpb24ob2JqKSB7XG4gICAgXy5lYWNoKF8uZnVuY3Rpb25zKG9iaiksIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICAgIHZhciBmdW5jID0gX1tuYW1lXSA9IG9ialtuYW1lXTtcbiAgICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBhcmdzID0gW3RoaXMuX3dyYXBwZWRdO1xuICAgICAgICBwdXNoLmFwcGx5KGFyZ3MsIGFyZ3VtZW50cyk7XG4gICAgICAgIHJldHVybiByZXN1bHQodGhpcywgZnVuYy5hcHBseShfLCBhcmdzKSk7XG4gICAgICB9O1xuICAgIH0pO1xuICB9O1xuXG4gIC8vIEFkZCBhbGwgb2YgdGhlIFVuZGVyc2NvcmUgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyIG9iamVjdC5cbiAgXy5taXhpbihfKTtcblxuICAvLyBBZGQgYWxsIG11dGF0b3IgQXJyYXkgZnVuY3Rpb25zIHRvIHRoZSB3cmFwcGVyLlxuICBfLmVhY2goWydwb3AnLCAncHVzaCcsICdyZXZlcnNlJywgJ3NoaWZ0JywgJ3NvcnQnLCAnc3BsaWNlJywgJ3Vuc2hpZnQnXSwgZnVuY3Rpb24obmFtZSkge1xuICAgIHZhciBtZXRob2QgPSBBcnJheVByb3RvW25hbWVdO1xuICAgIF8ucHJvdG90eXBlW25hbWVdID0gZnVuY3Rpb24oKSB7XG4gICAgICB2YXIgb2JqID0gdGhpcy5fd3JhcHBlZDtcbiAgICAgIG1ldGhvZC5hcHBseShvYmosIGFyZ3VtZW50cyk7XG4gICAgICBpZiAoKG5hbWUgPT09ICdzaGlmdCcgfHwgbmFtZSA9PT0gJ3NwbGljZScpICYmIG9iai5sZW5ndGggPT09IDApIGRlbGV0ZSBvYmpbMF07XG4gICAgICByZXR1cm4gcmVzdWx0KHRoaXMsIG9iaik7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gQWRkIGFsbCBhY2Nlc3NvciBBcnJheSBmdW5jdGlvbnMgdG8gdGhlIHdyYXBwZXIuXG4gIF8uZWFjaChbJ2NvbmNhdCcsICdqb2luJywgJ3NsaWNlJ10sIGZ1bmN0aW9uKG5hbWUpIHtcbiAgICB2YXIgbWV0aG9kID0gQXJyYXlQcm90b1tuYW1lXTtcbiAgICBfLnByb3RvdHlwZVtuYW1lXSA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIHJlc3VsdCh0aGlzLCBtZXRob2QuYXBwbHkodGhpcy5fd3JhcHBlZCwgYXJndW1lbnRzKSk7XG4gICAgfTtcbiAgfSk7XG5cbiAgLy8gRXh0cmFjdHMgdGhlIHJlc3VsdCBmcm9tIGEgd3JhcHBlZCBhbmQgY2hhaW5lZCBvYmplY3QuXG4gIF8ucHJvdG90eXBlLnZhbHVlID0gZnVuY3Rpb24oKSB7XG4gICAgcmV0dXJuIHRoaXMuX3dyYXBwZWQ7XG4gIH07XG5cbiAgLy8gUHJvdmlkZSB1bndyYXBwaW5nIHByb3h5IGZvciBzb21lIG1ldGhvZHMgdXNlZCBpbiBlbmdpbmUgb3BlcmF0aW9uc1xuICAvLyBzdWNoIGFzIGFyaXRobWV0aWMgYW5kIEpTT04gc3RyaW5naWZpY2F0aW9uLlxuICBfLnByb3RvdHlwZS52YWx1ZU9mID0gXy5wcm90b3R5cGUudG9KU09OID0gXy5wcm90b3R5cGUudmFsdWU7XG5cbiAgXy5wcm90b3R5cGUudG9TdHJpbmcgPSBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gJycgKyB0aGlzLl93cmFwcGVkO1xuICB9O1xuXG4gIC8vIEFNRCByZWdpc3RyYXRpb24gaGFwcGVucyBhdCB0aGUgZW5kIGZvciBjb21wYXRpYmlsaXR5IHdpdGggQU1EIGxvYWRlcnNcbiAgLy8gdGhhdCBtYXkgbm90IGVuZm9yY2UgbmV4dC10dXJuIHNlbWFudGljcyBvbiBtb2R1bGVzLiBFdmVuIHRob3VnaCBnZW5lcmFsXG4gIC8vIHByYWN0aWNlIGZvciBBTUQgcmVnaXN0cmF0aW9uIGlzIHRvIGJlIGFub255bW91cywgdW5kZXJzY29yZSByZWdpc3RlcnNcbiAgLy8gYXMgYSBuYW1lZCBtb2R1bGUgYmVjYXVzZSwgbGlrZSBqUXVlcnksIGl0IGlzIGEgYmFzZSBsaWJyYXJ5IHRoYXQgaXNcbiAgLy8gcG9wdWxhciBlbm91Z2ggdG8gYmUgYnVuZGxlZCBpbiBhIHRoaXJkIHBhcnR5IGxpYiwgYnV0IG5vdCBiZSBwYXJ0IG9mXG4gIC8vIGFuIEFNRCBsb2FkIHJlcXVlc3QuIFRob3NlIGNhc2VzIGNvdWxkIGdlbmVyYXRlIGFuIGVycm9yIHdoZW4gYW5cbiAgLy8gYW5vbnltb3VzIGRlZmluZSgpIGlzIGNhbGxlZCBvdXRzaWRlIG9mIGEgbG9hZGVyIHJlcXVlc3QuXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoJ3VuZGVyc2NvcmUnLCBbXSwgZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gXztcbiAgICB9KTtcbiAgfVxufS5jYWxsKHRoaXMpKTtcbiIsInZhciBtYyA9IG1vZHVsZS5leHBvcnRzXG5tYy5EYXRhdGFibGUgPSAoZnVuY3Rpb24gKCkge1xuICAgIHZhciBpZHMgPSAwO1xuXG4gICAgdmFyIGR0ID0ge1xuICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoY29scywgY29uZmlnKSB7XG4gICAgICAgICAgICB0aGlzLmNvbHMgPSBjb2xzO1xuICAgICAgICAgICAgdGhpcy5jb25maWcgPSBjb25maWcgPSBjb25maWcgfHwge307XG5cbiAgICAgICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IFtdO1xuXG4gICAgICAgICAgICBpZiAoY29uZmlnLnVybCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGF0YSA9IG0ucmVxdWVzdCh7XG4gICAgICAgICAgICAgICAgICAgIHVybDogY29uZmlnLnVybCxcbiAgICAgICAgICAgICAgICAgICAgaGVhZGVyOiBjb25maWcuaGVhZGVyLCBcbiAgICAgICAgICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIGNvbmZpZy5hdXRob3JpemF0aW9uKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgbWV0aG9kOiAnR0VUJ1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoY29uZmlnLmRhdGEpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEgPSAodHlwZW9mIGNvbmZpZy5kYXRhID09ICdmdW5jdGlvbicgPyBjb25maWcuZGF0YSA6IG0ucHJvcChjb25maWcuZGF0YSkpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLnNvcnQgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdmFyIGtleSA9IHRhcmdldC5wYXJlbnROb2RlLmdldEF0dHJpYnV0ZSgnZGF0YS1jb2xrZXknKSxcbiAgICAgICAgICAgICAgICAgICAgY29sID0gdGhpcy5hY3RpdmVDb2xzW2tleV07XG4gICAgICAgICAgICAgICAgXG4gICAgICAgICAgICAgICAgaWYgKHRoaXMubGFzdFNvcnRlZCAmJiB0aGlzLmxhc3RTb3J0ZWQgIT0ga2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuYWN0aXZlQ29sc1t0aGlzLmxhc3RTb3J0ZWRdLl9zb3J0ZWQgPSAnbm9uZSc7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHZhciByZXZlcnNlID0gKGNvbC5fc29ydGVkID09ICdhc2MnID8gLTEgOiAxKTtcbiAgICAgICAgICAgICAgICB0aGlzLmRhdGEodGhpcy5kYXRhKCkuc29ydChmdW5jdGlvbiAoYSwgYikge1xuICAgICAgICAgICAgICAgICAgICBhID0gYVtrZXldO1xuICAgICAgICAgICAgICAgICAgICBiID0gYltrZXldO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gKGEgPT0gYiA/IDAgOiAoYSA8IGIgPyAtMSA6IDEpICogcmV2ZXJzZSk7XG4gICAgICAgICAgICAgICAgfSkpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGNvbC5fc29ydGVkID0gKHJldmVyc2UgPiAwID8gJ2FzYycgOiAnZGVzYycpO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFNvcnRlZCA9IGtleTtcbiAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgICAgICBtLnJlbmRlcih0aGlzLl90YWJsZUVsLCBkdC5jb250ZW50c1ZpZXcodGhpcykpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdGhpcy5vbkNlbGxDbGljayA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgICAgICAgICB3aGlsZSAodGFyZ2V0Lm5vZGVOYW1lICE9ICdURCcgJiYgdGFyZ2V0Lm5vZGVOYW1lICE9ICdUQUJMRScpIHRhcmdldCA9IHRhcmdldC5wYXJlbnROb2RlO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQubm9kZU5hbWUgPT0gJ1RBQkxFJykgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdmFyIGNvbEluZGV4ID0gdGFyZ2V0LmNlbGxJbmRleCxcbiAgICAgICAgICAgICAgICAgICAgY29sID0gdGhpcy5kYXRhUm93W2NvbEluZGV4XSxcbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkSWQgPSB0YXJnZXQucGFyZW50Tm9kZS5nZXRBdHRyaWJ1dGUoJ2RhdGEtcmVjb3JkLWlkJyksXG4gICAgICAgICAgICAgICAgICAgIGlkRmllbGQgPSBjb25maWcucmVjb3JkSWQgfHwgJ2lkJyxcbiAgICAgICAgICAgICAgICAgICAgcm93O1xuXG4gICAgICAgICAgICAgICAgdGhpcy5kYXRhKCkuc29tZShmdW5jdGlvbiAocikge1xuICAgICAgICAgICAgICAgICAgICBpZiAocltpZEZpZWxkXSA9PSByZWNvcmRJZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm93ID0gcjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgICAgICBtLnN0YXJ0Q29tcHV0YXRpb24oKTtcbiAgICAgICAgICAgICAgICB2YXIgcmV0ID0gdGhpcy5jb25maWcub25DZWxsQ2xpY2suY2FsbCh0aGlzLCByb3dbY29sLmZpZWxkIHx8IGNvbC5rZXldLCByb3csIGNvbCk7XG4gICAgICAgICAgICAgICAgbS5lbmRDb21wdXRhdGlvbigpO1xuICAgICAgICAgICAgICAgIHJldHVybiByZXQ7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB0aGlzLm9uUm93U2VsZWN0ID0gZnVuY3Rpb24gKGUsIHRhcmdldCkge1xuICAgICAgICAgICAgICAgIHZhciBycyA9IHRoaXMuY29uZmlnLnJvd1NlbGVjdCxcbiAgICAgICAgICAgICAgICAgICAgbXVsdGkgPSBycy5tdWx0aXBsZSxcbiAgICAgICAgICAgICAgICAgICAgY2FsbGJhY2sgPSBycy5jYWxsYmFjayxcbiAgICAgICAgICAgICAgICAgICAgc2VsID0gdGhpcy5jdXJyZW50U2VsZWN0aW9uIHx8IFtdLFxuICAgICAgICAgICAgICAgICAgICBsYXN0U2VsID0gdGhpcy5sYXN0U2VsZWN0aW9uLFxuICAgICAgICAgICAgICAgICAgICBpblJhbmdlID0gZmFsc2UsXG4gICAgICAgICAgICAgICAgICAgIGlkRmllbGQgPSBjb25maWcucmVjb3JkSWQgfHwgJ2lkJztcblxuICAgICAgICAgICAgICAgIGlmICh0eXBlb2YgY2FsbGJhY2sgIT0gJ2Z1bmN0aW9uJykgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgd2hpbGUgKHRhcmdldC5ub2RlTmFtZSAhPSAnVFInICYmIHRhcmdldC5ub2RlTmFtZSAhPSAnVEFCTEUnKSB0YXJnZXQgPSB0YXJnZXQucGFyZW50Tm9kZTtcblxuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQubm9kZU5hbWUgPT0gJ1RBQkxFJykgcmV0dXJuO1xuXG4gICAgICAgICAgICAgICAgdmFyIHJlY29yZElkID0gdGFyZ2V0LmdldEF0dHJpYnV0ZSgnZGF0YS1yZWNvcmQtaWQnKTtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VJbnQocmVjb3JkSWQsIDEwKSA9PSByZWNvcmRJZCkgcmVjb3JkSWQgPSBwYXJzZUludChyZWNvcmRJZCwgMTApO1xuXG4gICAgICAgICAgICAgICAgbS5zdGFydENvbXB1dGF0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICBpZiAobXVsdGkgJiYgZS5jdHJsS2V5KSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBpID0gc2VsLmluZGV4T2YocmVjb3JkSWQpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoaSA9PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsLnB1c2gocmVjb3JkSWQpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgc2VsLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0gZWxzZSBpZiAobXVsdGkgJiYgZS5zaGlmdEtleSkge1xuICAgICAgICAgICAgICAgICAgICBjbGVhclNlbGVjdGlvbigpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmRhdGEoKS5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpZCA9IHJvd1tpZEZpZWxkXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpblJhbmdlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHNlbC5pbmRleE9mKGlkKSA9PSAtMSkgc2VsLnB1c2goaWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZCA9PSBsYXN0U2VsIHx8IGlkID09IHJlY29yZElkKSBpblJhbmdlID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChpZCA9PSBsYXN0U2VsIHx8IGlkID09IHJlY29yZElkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChzZWwuaW5kZXhPZihpZCkgPT0gLTEpIHNlbC5wdXNoKGlkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaW5SYW5nZSA9IHRydWU7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBzZWwgPSAoc2VsLmxlbmd0aCA9PSAxICYmIHNlbFswXSA9PSByZWNvcmRJZCA/IFtdIDogW3JlY29yZElkXSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHRoaXMubGFzdFNlbGVjdGlvbiA9IHJlY29yZElkO1xuICAgICAgICAgICAgICAgIHRoaXMuY3VycmVudFNlbGVjdGlvbiA9IHNlbDtcbiAgICAgICAgICAgICAgICBjYWxsYmFjayhzZWwpO1xuICAgICAgICAgICAgICAgIG0uZW5kQ29tcHV0YXRpb24oKTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHRoaXMub25jbGljayA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdmFyIHRhcmdldCA9IGUudGFyZ2V0O1xuICAgICAgICAgICAgICAgIGlmICh0YXJnZXQubm9kZU5hbWUgPT0gJ0knICYmIC9cXGJmYVxcLXNvcnQvLnRlc3QodGFyZ2V0LmNsYXNzTmFtZSkpIHJldHVybiB0aGlzLnNvcnQodGFyZ2V0KTtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5jb25maWcucm93U2VsZWN0KSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMub25Sb3dTZWxlY3QoZSwgdGFyZ2V0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiB0aGlzLmNvbmZpZy5vbkNlbGxDbGljayA9PSAnZnVuY3Rpb24nKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLm9uQ2VsbENsaWNrKHRhcmdldCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9LmJpbmQodGhpcyk7XG5cbiAgICAgICAgICAgIHRoaXMuc2V0V2lkdGggPSBmdW5jdGlvbiAoYXR0cnMsIHdpZHRoKSB7XG4gICAgICAgICAgICAgICAgaWYgKCF3aWR0aCkgcmV0dXJuO1xuICAgICAgICAgICAgICAgIGlmICgvXlxcZCskLy50ZXN0KHdpZHRoKSkgd2lkdGggKz0gJ3B4JztcbiAgICAgICAgICAgICAgICBpZiAoIWF0dHJzLnN0eWxlKSBhdHRycy5zdHlsZSA9ICcnO1xuICAgICAgICAgICAgICAgIGlmICh3aWR0aCkgYXR0cnMuc3R5bGUgKz0gJ3dpZHRoOicgKyB3aWR0aCArICc7JztcbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIHZpZXc6IGZ1bmN0aW9uIChjdHJsLCBvcHRpb25zKSB7XG4gICAgICAgICAgICB2YXIgY29scyA9IGN0cmwuY29scztcbiAgICAgICAgICAgIGN0cmwudmlld09wdGlvbnMgPSBvcHRpb25zO1xuXG4gICAgICAgICAgICBpZiAoIWN0cmwuZGF0YSgpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG0oJ2RpdicsICdTb3JyeSwgbm8gZGF0YSB0byBkaXNwbGF5Jyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgICAgICAgIG9wdGlvbnMuY2xhc3NOYW1lcyA9IG9wdGlvbnMuY2xhc3NOYW1lcyB8fCB7fTtcblxuICAgICAgICAgICAgdmFyIGF0dHJzID0ge1xuICAgICAgICAgICAgICAgIGNsYXNzOiBvcHRpb25zLmNsYXNzTmFtZXMudGFibGUgfHwgJ3RhYmxlIHRhYmxlLXN0cmlwZWQgdGFibGUtYm9yZGVyZWQgdGFibGUtaG92ZXInLFxuICAgICAgICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24gKGVsLCBpc09sZCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoaXNPbGQpIHJldHVybjtcbiAgICAgICAgICAgICAgICAgICAgZWwuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBjdHJsLm9uY2xpY2spO1xuICAgICAgICAgICAgICAgICAgICBjdHJsLl90YWJsZUVsID0gZWw7XG4gICAgICAgICAgICAgICAgICAgIG0ubW9kdWxlKGVsLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN0cmw7XG4gICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgdmlldzogZHQuY29udGVudHNWaWV3XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIGN0cmwuc2V0V2lkdGgoYXR0cnMsIG9wdGlvbnMud2lkdGgpO1xuXG4gICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAndGFibGUnLFxuICAgICAgICAgICAgICAgIGF0dHJzXG4gICAgICAgICAgICApO1xuICAgICAgICB9LFxuICAgICAgICBjb250ZW50c1ZpZXc6IGZ1bmN0aW9uIChjdHJsKSB7XG4gICAgICAgICAgICB2YXIgY29scyA9IGN0cmwuY29scyxcbiAgICAgICAgICAgICAgICBvcHRpb25zID0gY3RybC52aWV3T3B0aW9ucztcblxuICAgICAgICAgICAgcmV0dXJuIFtcbiAgICAgICAgICAgICAgICBkdC5oZWFkVmlldyhjdHJsLCBjb2xzLCBvcHRpb25zKSxcbiAgICAgICAgICAgICAgICBkdC5ib2R5VmlldyhjdHJsLCBjb2xzLCBvcHRpb25zLCBjdHJsLmRhdGEoKSksXG4gICAgICAgICAgICAgICAgZHQuY2FwdGlvblZpZXcoY3RybCwgb3B0aW9ucylcbiAgICAgICAgICAgIF07XG4gICAgICAgIH0sXG4gICAgICAgIGhlYWRWaWV3OiBmdW5jdGlvbiAoY3RybCwgY29scywgb3B0aW9ucykge1xuICAgICAgICAgICAgdmFyIG1hdHJpeCA9IFtdLFxuICAgICAgICAgICAgICAgIHJvd051bSA9IDAsXG4gICAgICAgICAgICAgICAgZGF0YVJvdyA9IFtdO1xuICAgICAgICAgICAgdmFyIGNhbGNEZXB0aCA9IGZ1bmN0aW9uIChtYXhEZXB0aCwgY29sKSB7XG4gICAgICAgICAgICAgICAgdmFyIGRlcHRoID0gMDtcbiAgICAgICAgICAgICAgICBpZiAoIW1hdHJpeFtyb3dOdW1dKSB7XG4gICAgICAgICAgICAgICAgICAgIG1hdHJpeFtyb3dOdW1dID0gW107XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIG1hdHJpeFtyb3dOdW1dLnB1c2goY29sKTtcbiAgICAgICAgICAgICAgICBpZiAoY29sLmNoaWxkcmVuKSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbC5fY29sc3BhbiA9IGNvbC5jaGlsZHJlbi5sZW5ndGg7XG4gICAgICAgICAgICAgICAgICAgIHJvd051bSsrO1xuICAgICAgICAgICAgICAgICAgICBkZXB0aCA9IGNvbC5jaGlsZHJlbi5yZWR1Y2UoY2FsY0RlcHRoLCAwKSArIDE7XG4gICAgICAgICAgICAgICAgICAgIHJvd051bS0tO1xuICAgICAgICAgICAgICAgICAgICBkZXB0aCA9IE1hdGgubWF4KG1heERlcHRoLCBkZXB0aCk7XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgZGF0YVJvdy5wdXNoKGNvbCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGNvbC5fZGVwdGggPSBkZXB0aDtcbiAgICAgICAgICAgICAgICByZXR1cm4gZGVwdGg7XG4gICAgICAgICAgICB9O1xuXG4gICAgICAgICAgICB2YXIgbWF4RGVwdGggPSBjb2xzLnJlZHVjZShjYWxjRGVwdGgsIDApO1xuICAgICAgICAgICAgY3RybC5kYXRhUm93ID0gZGF0YVJvdztcbiAgICAgICAgICAgIHZhciBhY3RpdmVDb2xzID0ge307XG4gICAgICAgICAgICBkYXRhUm93LmZvckVhY2goZnVuY3Rpb24gKGNvbCkge1xuICAgICAgICAgICAgICAgIGFjdGl2ZUNvbHNbY29sLmtleV0gPSBjb2w7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGN0cmwuYWN0aXZlQ29scyA9IGFjdGl2ZUNvbHM7XG5cbiAgICAgICAgICAgIHZhciBidWlsZEhlYWRlclJvdyA9IGZ1bmN0aW9uIChyb3csIHJvd051bSkge1xuICAgICAgICAgICAgICAgIHZhciBidWlsZEhlYWRlckNlbGwgPSBmdW5jdGlvbiAoY29sKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBhdHRycyA9IHt9O1xuICAgICAgICAgICAgICAgICAgICBpZiAoY29sLl9jb2xzcGFuICYmIGNvbC5fY29sc3BhbiA+IDEpIGF0dHJzLmNvbHNwYW4gPSBjb2wuX2NvbHNwYW47XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wuY2xhc3MpIGF0dHJzLmNsYXNzID0gY29sLmNsYXNzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWNvbC5fZGVwdGgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzWydkYXRhLWNvbEtleSddID0gY29sLmtleTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGN0cmwuc2V0V2lkdGgoYXR0cnMsIGNvbC53aWR0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm93TnVtIDwgbWF4RGVwdGgpIGF0dHJzLnJvd3NwYW4gPSBtYXhEZXB0aCAtIHJvd051bSArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29sLl9zb3J0ZWQgJiYgY29sLl9zb3J0ZWQgIT0gJ25vbmUnKSBhdHRycy5jbGFzcyA9IG9wdGlvbnMuY2xhc3NOYW1lcy5zb3J0ZWQgfHwgJ3NvcnRlZCc7XG4gICAgICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAgICAgICAgICd0aCcsXG4gICAgICAgICAgICAgICAgICAgICAgICBhdHRycywgW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICghY29sLl9kZXB0aCAmJiBjb2wuc29ydGFibGUgPyBtKFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaS5mYScsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzOiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYXNjOiAnZmEtc29ydC1hc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGRlc2M6ICdmYS1zb3J0LWRlc2MnLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG5vbmU6ICdmYS1zb3J0J1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfVtjb2wuX3NvcnRlZCB8fCAnbm9uZSddXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICApIDogJycpLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG0udHJ1c3QoJyAnKSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2wubGFiZWwgfHwgY29sLmtleVxuICAgICAgICAgICAgICAgICAgICAgICAgXVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAgICAgJ3RyJyxcbiAgICAgICAgICAgICAgICAgICAgcm93Lm1hcChidWlsZEhlYWRlckNlbGwpXG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH07XG4gICAgICAgICAgICByZXR1cm4gbSgndGhlYWQnLCBtYXRyaXgubWFwKGJ1aWxkSGVhZGVyUm93KSk7XG4gICAgICAgIH0sXG5cbiAgICAgICAgYm9keVZpZXc6IGZ1bmN0aW9uIChjdHJsLCBjb2xzLCBvcHRpb25zLCBkYXRhKSB7XG4gICAgICAgICAgICB2YXIgaWRGaWVsZCA9IGN0cmwuY29uZmlnLnJlY29yZElkIHx8ICdpZCc7XG4gICAgICAgICAgICB2YXIgYnVpbGREYXRhUm93ID0gZnVuY3Rpb24gKHJvdywgcm93SW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2YXIgYnVpbGREYXRhQ2VsbCA9IGZ1bmN0aW9uIChjb2wpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbHVlID0gcm93W2NvbC5maWVsZCB8fCBjb2wua2V5XSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF0dHJzID0ge307XG5cbiAgICAgICAgICAgICAgICAgICAgaWYgKHR5cGVvZiBjb2wuZm9ybWF0dGVyID09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbHVlID0gY29sLmZvcm1hdHRlci5jYWxsKGN0cmwsIHZhbHVlLCByb3csIGNvbCwgYXR0cnMpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGlmICghYXR0cnMuY2xhc3MpIGF0dHJzLmNsYXNzID0gJyc7XG4gICAgICAgICAgICAgICAgICAgIGlmIChjb2wuX3NvcnRlZCAmJiBjb2wuX3NvcnRlZCAhPSAnbm9uZScpIGF0dHJzLmNsYXNzICs9ICcgJyArIChvcHRpb25zLmNsYXNzTmFtZXMuc29ydGVkIHx8ICdzb3J0ZWQnKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGNvbC5jbGFzcykgYXR0cnMuY2xhc3MgKz0gJyAnICsgY29sLmNsYXNzO1xuXG4gICAgICAgICAgICAgICAgICAgIGlmICghYXR0cnMuY2xhc3MpIGRlbGV0ZSBhdHRycy5jbGFzcztcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG0oXG4gICAgICAgICAgICAgICAgICAgICAgICAndGQnLFxuICAgICAgICAgICAgICAgICAgICAgICAgYXR0cnMsXG4gICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH07XG4gICAgICAgICAgICAgICAgaWYgKHJvd1tpZEZpZWxkXSA9PT0gdW5kZWZpbmVkKSByb3dbaWRGaWVsZF0gPSBpZHMrKztcbiAgICAgICAgICAgICAgICB2YXIgcmVjb3JkSWQgPSByb3dbaWRGaWVsZF07XG5cbiAgICAgICAgICAgICAgICByZXR1cm4gbShcbiAgICAgICAgICAgICAgICAgICAgJ3RyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgJ2RhdGEtcmVjb3JkLWlkJzogcmVjb3JkSWQsXG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogKHJvd0luZGV4ICYgMSA/IG9wdGlvbnMuY2xhc3NOYW1lcy5vZGQgfHwgJ29kZCcgOiBvcHRpb25zLmNsYXNzTmFtZXMuZXZlbiB8fCAnZXZlbicpICtcbiAgICAgICAgICAgICAgICAgICAgICAgIChjdHJsLmN1cnJlbnRTZWxlY3Rpb24uaW5kZXhPZihyZWNvcmRJZCkgIT0gLTEgPyBvcHRpb25zLmNsYXNzTmFtZXMuc2VsZWN0ZWQgfHwgJyBzZWxlY3RlZCcgOiAnJylcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgY3RybC5kYXRhUm93Lm1hcChidWlsZERhdGFDZWxsKVxuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9O1xuICAgICAgICAgICAgcmV0dXJuIG0oJ3Rib2R5JywgZGF0YS5tYXAoYnVpbGREYXRhUm93KSk7XG4gICAgICAgIH0sXG4gICAgICAgIGNhcHRpb25WaWV3OiBmdW5jdGlvbiAoY3RybCwgb3B0aW9ucykge1xuICAgICAgICAgICAgaWYgKG9wdGlvbnMuY2FwdGlvbikgcmV0dXJuIG0oJ2NhcHRpb24nLCBvcHRpb25zLmNhcHRpb24pO1xuICAgICAgICB9LFxuICAgIH07XG5cbiAgICAvKiBnbG9iYWwgZG9jdW1lbnQ6ZmFsc2UsIHdpbmRvdzpmYWxzZSAqL1xuICAgIGZ1bmN0aW9uIGNsZWFyU2VsZWN0aW9uKCkge1xuICAgICAgICBpZiAoZG9jdW1lbnQuc2VsZWN0aW9uICYmIGRvY3VtZW50LnNlbGVjdGlvbi5lbXB0eSkge1xuICAgICAgICAgICAgZG9jdW1lbnQuc2VsZWN0aW9uLmVtcHR5KCk7XG4gICAgICAgIH0gZWxzZSBpZiAod2luZG93LmdldFNlbGVjdGlvbikge1xuICAgICAgICAgICAgd2luZG93LmdldFNlbGVjdGlvbigpLnJlbW92ZUFsbFJhbmdlcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGR0O1xufSkoKTsiLCJ2YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciBOYXZiYXIgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgdmFyIGxpbmtzID0gKEF1dGgudG9rZW4oKSA/XG4gICAgW1xuICAgICAgeyBsYWJlbDogJ1RpY2tldHMnLCBocmVmOiAnL3RpY2tldHMnIH0sXG4gICAgICB7IGxhYmVsOiAnTmV3IFRpY2tldCcsIGhyZWY6ICcvdGlja2V0RWRpdCcgfSxcbiAgICAgIC8vIChBdXRoLnVzZXJfdHlwZSgpID09ICdBZ2VudCc/IHsgbGFiZWw6ICdSZXBvcnRzJywgaHJlZjogJy9teV9yZXBvcnRzJyB9Ont9KSxcbiAgICAgIChBdXRoLnVzZXJfdHlwZSgpICE9ICdDdXN0b21lcic/IHsgbGFiZWw6ICdSZXBvcnRzJywgaHJlZjogJy9teV9yZXBvcnRzJyB9Ont9KSxcbiAgICAgIChBdXRoLnVzZXJfdHlwZSgpID09ICdBZG1pbic/IHsgbGFiZWw6ICdVc2VycycsIGhyZWY6ICcvdXNlcnMnIH06e30pLFxuICAgICAgeyBsYWJlbDonTG9nb3V0JywgaHJlZjonL2xvZ291dCcgfVxuICAgIF06W1xuICAgICAgeyBsYWJlbDogJ0xvZ2luJywgaHJlZjogJy9sb2dpbicgfSxcbiAgICAgIHsgbGFiZWw6ICdSZWdpc3RlcicsIGhyZWY6ICcvcmVnaXN0ZXInIH1cbiAgICBdKVxuICAgIC5tYXAoZnVuY3Rpb24obCl7XG4gICAgICByZXR1cm4gbShcImxpXCIgKyAobS5yb3V0ZSgpID09PSBsLmhyZWYgPyAnLmFjdGl2ZSc6ICcnKSwgbShcImFbaHJlZj0nXCIgKyBsLmhyZWYgKyBcIiddXCIsIGwubm9ybWFsP3t9Ontjb25maWc6IG0ucm91dGV9LCBsLmxhYmVsKSk7XG4gICAgfSk7XG5cbiAgICBjdHJsLmxpbmtzID0gbS5wcm9wKGxpbmtzKTtcblxuICAgIGN0cmwuaWNvbkRpcmVjdGlvbiA9IG0ucHJvcCgnZG93bicpO1xuXG4gICAgY3RybC50b2dnbGUgPSBmdW5jdGlvbigpe1xuICAgICAgY3RybC5pY29uRGlyZWN0aW9uKCBjdHJsLmljb25EaXJlY3Rpb24oKT09J3VwJyA/ICdkb3duJzondXAnICk7XG4gICAgfTtcbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbihjdHJsKSB7XG4gICAgcmV0dXJuIG0oXCJuYXYubmF2YmFyLm5hdmJhci1pbnZlcnNlLm5hdmJhci1maXhlZC10b3BcIiwgW1xuICAgICAgbShcIi5jb250YWluZXJcIiwgW1xuICAgICAgICBtKFwiLm5hdmJhci1oZWFkZXJcIixcbiAgICAgICAgICBtKCdidXR0b24ubmF2YmFyLXRvZ2dsZScsIHtvbmNsaWNrOiBjdHJsLnRvZ2dsZX0sIG0oJy5nbHlwaGljb24uZ2x5cGhpY29uLWNoZXZyb24tJyArIGN0cmwuaWNvbkRpcmVjdGlvbigpKSksXG4gICAgICAgICAgbShcImEubmF2YmFyLWJyYW5kW2hyZWY9Jy8nXVwiLCB7Y29uZmlnOiBtLnJvdXRlfSwgXCJDcm9zc292ZXIgVGlja2V0IFN5c3RlbVwiKVxuICAgICAgICApLFxuICAgICAgICBtKFwiLm5hdmJhci1jb2xsYXBzZS5cIiArIGN0cmwuaWNvbkRpcmVjdGlvbigpLFxuICAgICAgICAgIG0oXCJ1bC5uYXYubmF2YmFyLW5hdi5uYXZiYXItcmlnaHRcIiwgY3RybC5saW5rcygpKVxuICAgICAgICApXG4gICAgICBdKVxuICAgIF0pO1xuICB9XG59O1xuIiwiLy8gbWFpbi5qc1xuXG4ndXNlIHN0cmljdCc7XG5cbnZhciBfID0gcmVxdWlyZSgndW5kZXJzY29yZScpO1xuXG52YXIgcmVxID0gZnVuY3Rpb24oYXJncykge1xuICByZXR1cm4gbS5yZXF1ZXN0KGFyZ3MpXG59XG5cbm0ucm91dGUoZG9jdW1lbnQuYm9keSwgXCIvXCIsIHtcbiAgXCIvXCI6IHJlcXVpcmUoJy4vcGFnZXMvVGlja2V0cy5qcycpLFxuICBcIi9sb2dpblwiOiByZXF1aXJlKCcuL3BhZ2VzL0xvZ2luLmpzJyksXG4gIFwiL2xvZ291dFwiOiByZXF1aXJlKCcuL3BhZ2VzL0xvZ291dC5qcycpLFxuICBcIi9yZWdpc3RlclwiOiByZXF1aXJlKCcuL3BhZ2VzL1JlZ2lzdGVyLmpzJyksXG4gIFwiL3RpY2tldEVkaXRcIjogcmVxdWlyZSgnLi9wYWdlcy9UaWNrZXRFZGl0LmpzJyksXG4gIFwiL3ZlcmlmeS86Y29kZVwiOiByZXF1aXJlKCcuL3BhZ2VzL1ZlcmlmeS5qcycpLFxuICBcIi90aWNrZXRcIjogcmVxdWlyZSgnLi9wYWdlcy9UaWNrZXRQYWdlLmpzJyksXG4gIFwiL3VzZXJFZGl0XCI6IHJlcXVpcmUoJy4vcGFnZXMvVXNlckVkaXQuanMnKSxcbiAgXCIvdGlja2V0c1wiOiByZXF1aXJlKCcuL3BhZ2VzL1RpY2tldHMuanMnKSxcbiAgXCIvbXlfcmVwb3J0c1wiOiByZXF1aXJlKCcuL3BhZ2VzL015UmVwb3J0cy5qcycpLFxuICBcIi91c2Vyc1wiOiByZXF1aXJlKCcuL3BhZ2VzL1VzZXJzLmpzJyksXG4gIFwiL3VzZXJzLzppZFwiOiByZXF1aXJlKCcuL3BhZ2VzL1VzZXJEZWxldGUuanMnKSxcbiAgXCIvdGFzdHlcIjogcmVxdWlyZSgnLi9wYWdlcy9UYXN0eS5qcycpXG59KTtcbiIsInZhciBBdXRoID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIHRva2VuOiBtLnByb3AobG9jYWxTdG9yYWdlLnRva2VuKSxcbiAgdXNlcl90eXBlOiBtLnByb3AobG9jYWxTdG9yYWdlLnVzZXJfdHlwZSksXG4gIFxuICAvLyB0cmFkZSBjcmVkZW50aWFscyBmb3IgYSB0b2tlblxuICBsb2dpbjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkKSB7XG4gICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgIHVybDogJy9hdXRoL2xvZ2luJyxcbiAgICAgIGRhdGE6IHtlbWFpbDplbWFpbCwgcGFzc3dvcmQ6cGFzc3dvcmR9LFxuICAgICAgdW53cmFwU3VjY2VzczogZnVuY3Rpb24ocmVzKSB7XG4gICAgICAgIGxvY2FsU3RvcmFnZS50b2tlbiA9IHJlcy5hdXRoX3Rva2VuO1xuICAgICAgICBsb2NhbFN0b3JhZ2UudXNlcl90eXBlID0gcmVzLnVzZXJfdHlwZTtcblxuICAgICAgICBBdXRoLnVzZXJfdHlwZShyZXMudXNlcl90eXBlKTtcblxuICAgICAgICByZXR1cm4gcmVzLmF1dGhfdG9rZW47XG4gICAgICB9XG4gICAgfSlcbiAgICAudGhlbih0aGlzLnRva2VuKTtcbiAgfSxcblxuICAvLyBmb3JnZXQgdG9rZW5cbiAgbG9nb3V0OiBmdW5jdGlvbigpe1xuICAgIHRoaXMudG9rZW4oZmFsc2UpO1xuICAgIGRlbGV0ZSBsb2NhbFN0b3JhZ2UudG9rZW47XG4gIH0sXG5cbiAgLy8gc2lnbnVwIG9uIHRoZSBzZXJ2ZXIgZm9yIG5ldyBsb2dpbiBjcmVkZW50aWFsc1xuICByZWdpc3RlcjogZnVuY3Rpb24oZW1haWwsIHBhc3N3b3JkLG5hbWUsdHlwZSkge1xuICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6ICcvdXNlcnMnLFxuICAgICAgZGF0YTogeyB1c2VyOiB7IGVtYWlsOiBlbWFpbCwgcGFzc3dvcmQ6IHBhc3N3b3JkLCB0eXBlOiB0eXBlLCBuYW1lOiBuYW1lfX1cbiAgICB9KTtcbiAgfSxcblxuICAvLyBlbnN1cmUgdmVyaWZ5IHRva2VuIGlzIGNvcnJlY3RcbiAgdmVyaWZ5OiBmdW5jdGlvbih0b2tlbikge1xuICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgbWV0aG9kOiAnUE9TVCcsXG4gICAgICB1cmw6ICcvYXV0aC92ZXJpZnknLFxuICAgICAgZGF0YTogeyB0b2tlbjogdG9rZW4gfVxuICAgIH0pO1xuICB9LFxuXG4gIC8vIGdldCBjdXJyZW50IHVzZXIgb2JqZWN0XG4gIHVzZXI6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiBBdXRoLnJlcSgnL3VzZXJzL21lJyk7XG4gIH0sXG5cbiAgLy8gbWFrZSBhbiBhdXRoZW50aWNhdGVkIHJlcXVlc3RcbiAgcmVxOiBmdW5jdGlvbihvcHRpb25zKXtcbiAgICBpZiAodHlwZW9mIG9wdGlvbnMgPT0gJ3N0cmluZycpIHtcbiAgICAgIG9wdGlvbnMgPSB7IG1ldGhvZDogJ0dFVCcsIHVybDogb3B0aW9ucyB9O1xuICAgIH1cblxuICAgIHZhciBvbGRDb25maWcgPSBvcHRpb25zLmNvbmZpZyB8fCBmdW5jdGlvbigpIHt9O1xuXG4gICAgb3B0aW9ucy5jb25maWcgPSBmdW5jdGlvbih4aHIpIHtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiQXV0aG9yaXphdGlvblwiLCAgQXV0aC50b2tlbigpKTtcbiAgICAgIG9sZENvbmZpZyh4aHIpO1xuICAgIH07XG5cbiAgICAvLyB0cnkgcmVxdWVzdCwgaWYgYXV0aCBlcnJvciwgcmVkaXJlY3RcbiAgICAvLyBUT0RPOiByZW1lbWJlciB3aGVyZSB0aGUgdXNlciB3YXMsIG9yaWdpbmFsbHlcbiAgICB2YXIgZGVmZXJyZWQgPSBtLmRlZmVycmVkKCk7XG4gICAgbS5yZXF1ZXN0KG9wdGlvbnMpLnRoZW4oZGVmZXJyZWQucmVzb2x2ZSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICBpZiAoZXJyLnN0YXR1cyA9PT0gNDAxKSB7XG4gICAgICAgIEF1dGgub3JpZ2luYWxSb3V0ZSA9IG0ucm91dGUoKTtcbiAgICAgICAgbS5yb3V0ZSgnL2xvZ2luJyk7XG4gICAgICB9XG4gICAgfSk7XG5cbiAgICByZXR1cm4gZGVmZXJyZWQucHJvbWlzZTtcbiAgfVxufTsiLCIvLyBUaWNrZXQgbW9kZWxcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBUaWNrZXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblxuICAgIC8vIFRpY2tldCA9IHsgaWQ6IGludGVnZXIsIHRpdGxlOiB0ZXh0LCBzdGF0dXM6IGludGVnZXIsIGFnZW50X2lkOiBpbnRlZ2VyLCBjdXN0b21lcl9pZDogaW50ZWdlclxuICAgIC8vICAgICAsIGRlcGFydG1lbnRfaWQ6IGludGVnZXIsIHByaW9yZXR5OiBpbnRlZ2VyLCBkb25lX2RhdGU6IGRhdGV0aW1lLCBjcmVhdGVkX2F0OiBkYXRldGltZSxcbiAgICAvLyAgICAgIHVwZGF0ZWRfYXQ6IGRhdGV0aW1lIH1cblxuICAgIHNlbmQ6IGZ1bmN0aW9uIChkYXRhLGlkKSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiBpZCA/ICdQVVQnIDogJ1BPU1QnLFxuICAgICAgICAgICAgdXJsOiAnL3RpY2tldHMnKyhpZD8nLycraWQgOiAnJylcbiAgICAgICAgICAgICwgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHsgdGlja2V0OiBkYXRhIH1cbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHRpY2tldF9wZGY6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgdXJsOiAnL2Rvd25sb2FkX3JlcG9ydCcsXG4gICAgICAgICAgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgfSk7XG4gICAgfSxcblxuICAgIGRvd25sb2FkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgICAgbWV0aG9kOiAnZ2V0JyxcbiAgICAgICAgICAgIHVybDogJy9kb3dubG9hZF9yZXBvcnQnLFxuICAgICAgICAgICAgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgdXJsOiAnL3RpY2tldHMvJytpZCxcbiAgICAgICAgICAgIGNvbmZpZzogZnVuY3Rpb24gKHhocikge1xuICAgICAgICAgICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcignQXV0aG9yaXphdGlvbicsIEF1dGgudG9rZW4oKSk7XG4gICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBUaWNrZXQ7XG4iLCIvLyBVc2VyIG1vZGVsXG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG52YXIgVXNlciA9IG1vZHVsZS5leHBvcnRzID0ge1xuXG4gICAgLy8gVGlja2V0ID0geyBpZDogaW50ZWdlciwgdGl0bGU6IHRleHQsIHN0YXR1czogaW50ZWdlciwgYWdlbnRfaWQ6IGludGVnZXIsIGN1c3RvbWVyX2lkOiBpbnRlZ2VyXG4gICAgLy8gICAgICwgZGVwYXJ0bWVudF9pZDogaW50ZWdlciwgcHJpb3JldHk6IGludGVnZXIsIGRvbmVfZGF0ZTogZGF0ZXRpbWUsIGNyZWF0ZWRfYXQ6IGRhdGV0aW1lLFxuICAgIC8vICAgICAgdXBkYXRlZF9hdDogZGF0ZXRpbWUgfVxuXG4gICAgYWxsOiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgIHJldHVybiBtLnJlcXVlc3Qoe1xuICAgICAgICAgIG1ldGhvZDogJ2dldCcsXG4gICAgICAgICAgdXJsOiAnL3VzZXJzJyxcbiAgICAgICAgICBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKCdBdXRob3JpemF0aW9uJywgQXV0aC50b2tlbigpKTtcbiAgICAgICAgICAgIH0sXG4gICAgICB9KTtcbiAgICB9LFxuXG4gICAgZ2V0OiBmdW5jdGlvbiAoaWQpIHtcbiAgICAgICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICAgICAgICBtZXRob2Q6ICdnZXQnLFxuICAgICAgICAgICAgdXJsOiAnL3VzZXJzLycraWQsXG4gICAgICAgICAgICBjb25maWc6IGZ1bmN0aW9uICh4aHIpIHtcbiAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgIH1cblxuICAgICAgICB9KTtcbiAgICB9LFxuXG4gICAgc2VuZDogZnVuY3Rpb24gKGRhdGEsaWQpIHtcbiAgICAgICAgcmV0dXJuIG0ucmVxdWVzdCh7XG4gICAgICAgICAgICBtZXRob2Q6IGlkID8gJ1BVVCcgOiAnUE9TVCcsXG4gICAgICAgICAgICB1cmw6ICcvdXNlcnMnKyhpZD8nLycraWQgOiAnJylcbiAgICAgICAgICAgICwgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHsgdXNlcjogZGF0YSB9XG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBkZWxldGU6IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICByZXR1cm4gbS5yZXF1ZXN0KHtcbiAgICAgICAgICAgIG1ldGhvZDogJ0RFTEVURScsXG4gICAgICAgICAgICB1cmw6ICcvdXNlcnMnKyhpZD8nLycraWQgOiAnJylcbiAgICAgICAgICAgICwgY29uZmlnOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ0F1dGhvcml6YXRpb24nLCBBdXRoLnRva2VuKCkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IHsgaWQ6IGlkIH1cbiAgICAgICAgfSk7XG4gICAgfSxcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gVXNlcjtcbiIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgTG9naW4gPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcblxuICAgIHRoaXMubG9naW4gPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgIEF1dGgubG9naW4oZS50YXJnZXQuZW1haWwudmFsdWUsIGUudGFyZ2V0LnBhc3N3b3JkLnZhbHVlKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgIG0ucm91dGUoQXV0aC5vcmlnaW5hbFJvdXRlIHx8ICcvJywgbnVsbCwgdHJ1ZSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBlcnIubWVzc2FnZSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuICB9LFxuXG4gIHZpZXc6IGZ1bmN0aW9uKGN0cmwpe1xuICAgIHJldHVybiBbTmF2YmFyLnZpZXcoY3RybC5uYXZiYXIpLCBtKFwiLmNvbnRhaW5lclwiLCBbXG4gICAgICBtKFwiZm9ybS50ZXh0LWNlbnRlci5yb3cuZm9ybS1zaWduaW5cIiwge29uc3VibWl0OmN0cmwubG9naW4uYmluZChjdHJsKX0sXG4gICAgICAgIG0oJy5jb2wtc20tNi5jb2wtc20tb2Zmc2V0LTMnLCBbXG4gICAgICAgICAgbShcImgxXCIsIFwiTG9naW5cIiksXG4gICAgICAgICAgY3RybC5lcnJvcigpLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dEVtYWlsJ11cIiwgXCJFbWFpbCBhZGRyZXNzXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSdlbWFpbCddW2F1dG9mb2N1c11baWQ9J2lucHV0RW1haWwnXVtwbGFjZWhvbGRlcj0nRW1haWwgYWRkcmVzcyddW3JlcXVpcmVkXVt0eXBlPSdlbWFpbCddXCIpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dFBhc3N3b3JkJ11cIiwgXCJQYXNzd29yZFwiKSxcbiAgICAgICAgICAgIG0oXCJpbnB1dC5mb3JtLWNvbnRyb2xbbmFtZT0ncGFzc3dvcmQnXVthdXRvY29tcGxldGU9J29mZiddW2lkPSdpbnB1dFBhc3N3b3JkJ11bcGxhY2Vob2xkZXI9J1Bhc3N3b3JkJ11bcmVxdWlyZWRdW3R5cGU9J3Bhc3N3b3JkJ11cIiksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLWxnLmJ0bi1wcmltYXJ5LmJ0bi1ibG9ja1t0eXBlPSdzdWJtaXQnXVwiLCBcIlNpZ24gaW5cIilcbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgXSldO1xuICB9XG59OyIsInZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcblxudmFyIExvZ291dCA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgIEF1dGgubG9nb3V0KCk7XG4gICAgbS5yb3V0ZSgnL2xvZ2luJyk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gIH1cbn07IiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgbWMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL0RhdGFUYWJsZS5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xudmFyIFRpY2tldCA9IHJlcXVpcmUoJy4uL21vZGVscy9UaWNrZXQuanMnKTtcbnZhciBUaWNrZXRQYWdlID0gcmVxdWlyZSgnLi4vcGFnZXMvVGlja2V0UGFnZS5qcycpO1xuXG5tLnJvdXRlLm1vZGUgPSBcInBhdGhuYW1lXCI7XG5cbnZhciBUaWNrZXRzID0gbW9kdWxlLmV4cG9ydHMgPSB7XG4gIGNvbnRyb2xsZXI6IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG5cbiAgICBjdHJsLnByaW9yZXR5RnJvbWF0ZSA9IGZ1bmN0aW9uICh2YWx1ZSwgcm93LCBjb2wsIGF0dHJzKXtcbiAgICAgIGlmICh2YWx1ZSA9PSAnaGlnaCcpIGF0dHJzLmNsYXNzID0gJ2xhYmVsIGxhYmVsLWRhbmdlcic7XG4gICAgICByZXR1cm4gdmFsdWU7XG4gICAgfVxuXG5cbiAgICBUaWNrZXQudGlja2V0X3BkZigpXG4gICAgICAudGhlbihmdW5jdGlvbiAocmVwb3J0KSB7XG4gICAgICAgIGN0cmwucmVwb3J0ICA9IHJlcG9ydFxuICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICB2YXIgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZC4nO1xuICAgICAgICBtLnJvdXRlKCcvcmVwb3J0cycpXG4gICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgfSk7XG5cbiAgICAvLyBUaWNrZXQudGlja2V0X3BkZigpXG4gICAgLy8gLnRoZW4oZnVuY3Rpb24ocmVwb3J0X2ZpbGUpe1xuICAgIC8vICAgICBjdHJsLnJlcG9ydF9maWxlID0gcmVwb3J0X2ZpbGVcbiAgICAvLyAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LXN1Y2Nlc3MuYW5pbWF0ZWQuZmFkZUluVXBcIiwgJ3VzZXIgaGFzIGJlZW4gc2F2ZWQnKSk7XG4gICAgLy8gICB9LCBmdW5jdGlvbihlcnIpe1xuICAgIC8vICAgICB2YXIgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZC4nO1xuICAgICAgICBcbiAgICAvLyAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBtZXNzYWdlKSk7XG4gICAgLy8gICB9KTtcblxuXG4gICAgdGhpcy5kYXRhdGFibGUgPSBuZXcgbWMuRGF0YXRhYmxlLmNvbnRyb2xsZXIoXG4gICAgICAvLyBDb2x1bW5zIGRlZmluaXRpb246XG4gICAgICBbXG4gICAgICAgIHsga2V5OiBcInRpdGxlXCIsbGFiZWw6IFwiVGl0bGVcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBrZXk6IFwiY3VzdG9tZXJfaWRcIixsYWJlbDogXCJDdXN0b21lclwiLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGtleTogXCJwcmlvcmV0eVwiLGxhYmVsOiBcIlByaW9yaXR5XCJ9LFxuICAgICAgICB7IGtleTogXCJzdGF0dXNcIixsYWJlbDogXCJTdGF0dXNcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIF0sXG4gICAgICAvLyBPdGhlciBjb25maWd1cmF0aW9uOlxuICAgICAge1xuICAgICAgICAvLyBBZGRyZXNzIG9mIHRoZSB3ZWJzZXJ2ZXIgc3VwcGx5aW5nIHRoZSBkYXRhXG4gICAgICAgIHVybDogJ3JlcG9ydHMnLFxuICAgICAgICBhdXRob3JpemF0aW9uOiBBdXRoLnRva2VuKCksXG4gICAgICAgIC8vIEhhbmRsZXIgb2YgY2xpY2sgZXZlbnQgb24gZGF0YSBjZWxsXG4gICAgICAgIC8vIEl0IHJlY2VpdmVzIHRoZSByZWxldmFudCBpbmZvcm1hdGlvbiBhbHJlYWR5IHJlc29sdmVkXG4gICAgICAgIG9uQ2VsbENsaWNrOiBmdW5jdGlvbiAoY29udGVudCwgcm93LCBjb2wpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjb250ZW50LCByb3csIGNvbCk7XG4gICAgICAgICAgbS5yb3V0ZShcIi90aWNrZXRcIix7aWQ6cm93LmlkfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gW05hdmJhciwgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgIG0oJ2gxJywgJ0xhc3QgTW9udGggUmVwb3J0JyksXG4gICAgICBtYy5EYXRhdGFibGUudmlldyhjdHJsLmRhdGF0YWJsZSwge1xuICAgICAgICBjYXB0aW9uOiAnVGlja2V0cyBjbG9zZWQgbGFzdCBtb250aCdcbiAgICAgIH0pLCAgICAgIFxuICAgICAgbShcImEuYnRuLmJ0bi1wcmltYXJ5LmJ0bi14cy5wdWxsLXJpZ2h0W2hyZWY9Jy9cIiArIGN0cmwucmVwb3J0LnJlcG9ydF9maWxlICsgXCInXVt0YXJnZXQ9J19ibGFuayddXCIsIFwiRG93bmxvYWQgUERGXCIpXG4gICAgXSldO1xuICB9XG59O1xuIiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciBSZWdpc3RlciA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwubmF2YmFyID0gbmV3IE5hdmJhci5jb250cm9sbGVyKCk7XG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgICBjdHJsLnJlZ2lzdGVyID0gZnVuY3Rpb24oZSkge1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBpZiAoZS50YXJnZXQucGFzc3dvcmQudmFsdWUgIT09IGUudGFyZ2V0LnBhc3N3b3JkMi52YWx1ZSkge1xuICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtZGFuZ2VyLmFuaW1hdGVkLmZhZGVJblVwXCIsICdQYXNzd29yZHMgbXVzdCBtYXRjaC4nKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgQXV0aC5yZWdpc3RlcihlLnRhcmdldC5lbWFpbC52YWx1ZSwgZS50YXJnZXQucGFzc3dvcmQudmFsdWUsIGUudGFyZ2V0Lm5hbWUudmFsdWUsIGUudGFyZ2V0LnR5cGUudmFsdWUpLnRoZW4oZnVuY3Rpb24oKSB7XG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LXN1Y2Nlc3MuYW5pbWF0ZWQuZmFkZUluVXBcIiwgJ0Nvb2wuIE5vdyB5b3UgY2FuIGxvZ2luIScpKTtcbiAgICAgICAgfSwgZnVuY3Rpb24oZXJyKSB7XG4gICAgICAgICAgdmFyIG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQuJztcblxuICAgICAgICAgIGlmIChlcnIgJiYgZXJyLmNvZGUgJiYgZXJyLmNvZGUgPT09IDExMDAwKSB7XG4gICAgICAgICAgICBtZXNzYWdlID0gJ1RoZXJlIGlzIGFscmVhZHkgYSB1c2VyIHdpdGggdGhhdCBlbWFpbCBhZGRyZXNzLic7XG4gICAgICAgICAgfVxuXG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBtZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgIG0oXCJmb3JtLnRleHQtY2VudGVyLnJvdy5mb3JtLXNpZ25pblwiLCB7b25zdWJtaXQ6Y3RybC5yZWdpc3Rlci5iaW5kKGN0cmwpfSxcbiAgICAgICAgbSgnLmNvbC1zbS02LmNvbC1zbS1vZmZzZXQtMycsIFtcbiAgICAgICAgICBtKFwiaDFcIiwgXCJSZWdpc3RlclwiKSxcbiAgICAgICAgICBjdHJsLmVycm9yKCksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0RW1haWwnXVwiLCBcIkVtYWlsIGFkZHJlc3NcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J2VtYWlsJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRFbWFpbCddW3BsYWNlaG9sZGVyPSdFbWFpbCBhZGRyZXNzJ11bcmVxdWlyZWRdW3R5cGU9J2VtYWlsJ11cIiksXG4gICAgICAgICAgXSksbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0bmFtZSddXCIsIFwiTmFtZVwiKSxcbiAgICAgICAgICAgIG0oXCJpbnB1dC5mb3JtLWNvbnRyb2xbbmFtZT0nbmFtZSddW2F1dG9mb2N1c11baWQ9J2lucHV0bmFtZSddW3BsYWNlaG9sZGVyPSdOYW1lJ11bcmVxdWlyZWRdW3R5cGU9J25hbWUnXVwiKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRQYXNzd29yZCddXCIsIFwiUGFzc3dvcmRcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3Bhc3N3b3JkJ11bYXV0b2NvbXBsZXRlPSdvZmYnXVtpZD0naW5wdXRQYXNzd29yZCddW3BsYWNlaG9sZGVyPSdQYXNzd29yZCddW3JlcXVpcmVkXVt0eXBlPSdwYXNzd29yZCddXCIpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dFBhc3N3b3JkMiddXCIsIFwiUGFzc3dvcmQgKGFnYWluKVwiKSxcbiAgICAgICAgICAgIG0oXCJpbnB1dC5mb3JtLWNvbnRyb2xbbmFtZT0ncGFzc3dvcmQyJ11bYXV0b2NvbXBsZXRlPSdvZmYnXVtpZD0naW5wdXRQYXNzd29yZDInXVtwbGFjZWhvbGRlcj0nUGFzc3dvcmQgKGFnYWluKSddW3JlcXVpcmVkXVt0eXBlPSdwYXNzd29yZCddXCIpLFxuICAgICAgICAgIF0pLG0oJy5mb3JtLWdyb3VwJywgW1xuICAgICAgICAgICAgbShcImxhYmVsLnNyLW9ubHlbZm9yPSdpbnB1dFR5cGUnXVwiLCBcIlR5cGVcIiksXG4gICAgICAgICAgICBtKFwic2VsZWN0LmZvcm0tY29udHJvbFtuYW1lPSd0eXBlJ11bcmVxdWlyZWRdXCIsW20oXCJvcHRpb25bdmFsdWU9J0FnZW50J11cIixcIkFnZW50XCIpLG0oXCJvcHRpb25bdmFsdWU9J0N1c3RvbWVyJ11cIiwnQ3VzdG9tZXInKSxtKFwib3B0aW9uW3ZhbHVlPSdBZG1pbiddXCIsJ0FkbWluJyldKSxcbiAgICAgICAgICBdKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKFwiYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXByaW1hcnkuYnRuLWJsb2NrW3R5cGU9J3N1Ym1pdCddXCIsIFwiU2lnbiBpblwiKVxuICAgICAgICAgIClcbiAgICAgICAgXSlcbiAgICAgIClcbiAgICBdKV07XG4gIH1cbn07IiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciBUYXN0eSA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgIHZhciBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwudXNlciA9IG0ucHJvcCgpO1xuXG4gICAgdGhpcy5kYXRhdGFibGUgPSBuZXcgbWMuRGF0YXRhYmxlLmNvbnRyb2xsZXIoXG4gICAgICAgIC8vIENvbHVtbnMgZGVmaW5pdGlvbjpcbiAgICAgICAgW1xuICAgICAgICAgICAge2tleTpcIkVtcHR5XCJ9LFxuICAgICAgICAgICAge2tleTpcIk51bWJlcnNcIiwgY2hpbGRyZW46W1xuICAgICAgICAgICAgICAgIHtrZXk6XCJTS1VcIiwgbGFiZWw6XCJTS1VcIiwgc29ydGFibGU6dHJ1ZX0sXG4gICAgICAgICAgICAgICAge2tleTpcIlF1YW50aXR5XCIsIHNvcnRhYmxlOnRydWUsIGNsYXNzOidyaWdodC1hbGlnbmVkJ31cbiAgICAgICAgICAgIF19LFxuICAgICAgICAgICAge2tleTpcIlRleHRcIiwgY2hpbGRyZW46W1xuICAgICAgICAgICAgICAgIHtrZXk6XCJJdGVtXCIsIHNvcnRhYmxlOnRydWV9LFxuICAgICAgICAgICAgICAgIHtrZXk6XCJEZXNjcmlwdGlvblwiLCBzb3J0YWJsZTp0cnVlLCB3aWR0aDoyMDB9XG4gICAgICAgICAgICBdfVxuICAgICAgICBdLFxuICAgICAgICAvLyBPdGhlciBjb25maWd1cmF0aW9uOlxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBBZGRyZXNzIG9mIHRoZSB3ZWJzZXJ2ZXIgc3VwcGx5aW5nIHRoZSBkYXRhXG4gICAgICAgICAgICB1cmw6J2RhdGEvc3RvY2suanNvbicsXG5cbiAgICAgICAgICAgIC8vIEhhbmRsZXIgb2YgY2xpY2sgZXZlbnQgb24gZGF0YSBjZWxsXG4gICAgICAgICAgICAvLyBJdCByZWNlaXZlcyB0aGUgcmVsZXZhbnQgaW5mb3JtYXRpb24gYWxyZWFkeSByZXNvbHZlZFxuICAgICAgICAgICAgb25DZWxsQ2xpY2s6IGZ1bmN0aW9uIChjb250ZW50LCByb3csIGNvbCkge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGNvbnRlbnQsIHJvdywgY29sKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICk7XG4gIH0sXG4gIFxuICB2aWV3OiBmdW5jdGlvbihjdHJsKXtcbiAgICByZXR1cm4gW05hdmJhci52aWV3KGN0cmwubmF2YmFyKSwgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgIG0oJ2gxJywgJ3Rhc3R5JyksXG4gICAgICAgIG1jLkRhdGF0YWJsZS52aWV3KGN0cmwuZGF0YXRhYmxlLCAge1xuICAgICAgICAgICAgY2FwdGlvbjondGhpcyBpcyB0aGUgY2FwdGlvbidcbiAgICAgICAgfSlcbiAgICBdKV07XG4gIH1cbn07IiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG52YXIgVGlja2V0ID0gcmVxdWlyZSgnLi4vbW9kZWxzL1RpY2tldC5qcycpO1xuXG52YXIgVGlja2V0RWRpdCA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbigpe1xuICAgIGN0cmwgPSB0aGlzO1xuICAgIGN0cmwubmF2YmFyID0gbmV3IE5hdmJhci5jb250cm9sbGVyKCk7XG4gICAgY3RybC5lcnJvciA9IG0ucHJvcCgnJyk7XG5cbiAgICBjdHJsLnRpY2tldCA9IGZ1bmN0aW9uKGUpe1xuICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICBUaWNrZXQuc2VuZCh7dGl0bGU6IGUudGFyZ2V0LnRpdGxlLnZhbHVlLGJvZHk6IGUudGFyZ2V0LmJvZHkudmFsdWV9KVxuICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1zdWNjZXNzLmFuaW1hdGVkLmZhZGVJblVwXCIsICd0aWNrZXQgaGFzIGJlZW4gc2F2ZWQnKSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgdmFyIG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQuJztcbiAgICAgICAgICBcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtZGFuZ2VyLmFuaW1hdGVkLmZhZGVJblVwXCIsIG1lc3NhZ2UpKTtcbiAgICAgICAgfSk7XG4gICAgfTtcbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbihjdHJsKXtcbiAgICByZXR1cm4gW05hdmJhci52aWV3KGN0cmwubmF2YmFyKSwgbShcIi5jb250YWluZXJcIiwgW1xuICAgICAgbShcImZvcm0udGV4dC1jZW50ZXIucm93LmZvcm0tc2lnbmluXCIsIHtvbnN1Ym1pdDpjdHJsLnRpY2tldC5iaW5kKGN0cmwpfSxcbiAgICAgICAgbSgnLmNvbC1zbS02LmNvbC1zbS1vZmZzZXQtMycsIFtcbiAgICAgICAgICBtKFwiaDFcIiwgXCJOZXcgVGlja2V0XCIpLFxuICAgICAgICAgIGN0cmwuZXJyb3IoKSxcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5zci1vbmx5W2Zvcj0naW5wdXRUaWNrZXQnXVwiLCBcIlRpY2tldCBkZXNjcmlwdGlvblwiKSxcbiAgICAgICAgICAgIG0oXCJpbnB1dC5mb3JtLWNvbnRyb2xbbmFtZT0ndGl0bGUnXVthdXRvZm9jdXNdW2lkPSdpbnB1dFRpdGxlJ11bcGxhY2Vob2xkZXI9J1RpdGxlICddW3JlcXVpcmVkXVt0eXBlPSd0ZXh0J11cIiksXG4gICAgICAgICAgXSksbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuc3Itb25seVtmb3I9J2lucHV0VGlja2V0J11cIiwgXCJUaWNrZXQgZGVzY3JpcHRpb25cIiksXG4gICAgICAgICAgICBtKFwidGV4dGFyZWEuZm9ybS1jb250cm9sW25hbWU9J2JvZHknXVthdXRvZm9jdXNdW2lkPSdpbnB1dGJvZHknXVtwbGFjZWhvbGRlcj0nYm9keSAnXVtyZXF1aXJlZF1bdHlwZT0ndGV4dCddXCIpLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLWxnLmJ0bi1wcmltYXJ5LmJ0bi1ibG9ja1t0eXBlPSdzdWJtaXQnXVwiLCBcIlNhdmVcIilcbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICApXG4gICAgXSldO1xuICB9XG59OyIsIi8vIHRpY2tldCBwYWdlIHRvIHZpZXcgdGlja2V0IGEsIGNvbW1lbnRzICBhbmQgbm90ZXMgaWYgYWdlbnRcbnZhciBUaWNrZXQgPSByZXF1aXJlKCcuLi9tb2RlbHMvVGlja2V0LmpzJyk7XG52YXIgTmF2YmFyID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9OYXZiYXIuanMnKTtcblxudmFyIFRpY2tldFBhZ2UgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBjb250cm9sbGVyOiBmdW5jdGlvbiAoYXJncykge1xuICAgIHZhciBjdHJsID0gdGhpcztcbiAgICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcblxuICAgIGN0cmwub3BlbiA9IGZ1bmN0aW9uIChzdGF0dXMpIHtcbiAgICAgIGN0cmwudGlja2V0KCkudGlja2V0LnN0YXR1cyA9IHN0YXR1c1xuICAgICAgVGlja2V0LnNlbmQoeyBzdGF0dXM6IHN0YXR1cyB9LCBtLnJvdXRlLnBhcmFtKCkuaWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uICh0aWNrZXQpIHtcbiAgICAgICAgICBjdHJsLnRpY2tldCgpLnRpY2tldCA9IHRpY2tldFxuICAgICAgICB9LCBmdW5jdGlvbiAoZXJyKSB7XG4gICAgICAgICAgdmFyIG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQuJztcbiAgICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtZGFuZ2VyLmFuaW1hdGVkLmZhZGVJblVwXCIsIG1lc3NhZ2UpKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgVGlja2V0LmdldChtLnJvdXRlLnBhcmFtKCkuaWQpXG4gICAgICAudGhlbihmdW5jdGlvbiAodGlja2V0KSB7XG4gICAgICAgIGN0cmwudGlja2V0ID0gbS5wcm9wKHRpY2tldClcbiAgICAgIH0sIGZ1bmN0aW9uIChlcnIpIHtcbiAgICAgICAgdmFyIG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQuJztcbiAgICAgICBtLnJvdXRlKCcvdGlja2V0cycpXG4gICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgfSk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gW05hdmJhciwgbSgnLmNvbnRhaW5lcicsIFtbXG4gICAgICBtKFwiaDJcIiwgXCJUaWNrZXRcIiksXG4gICAgICBjdHJsLmVycm9yKCksXG4gICAgICBtKFwicFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC50aXRsZSksXG4gICAgICBtKFwicFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5ib2R5KSxcbiAgICAgIG0oXCJ0YWJsZS50YWJsZS50YWJsZS1jb25kZW5zZWQudGFibGUtYm9yZGVyZWRcIiwgW1xuICAgICAgICBtKFwidGhlYWRcIiwgW1xuICAgICAgICAgIG0oXCJ0clwiLCBbXG4gICAgICAgICAgICBtKFwidGhcIiwgXCJDdXN0b21lclwiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIkFnZW50XCIpLFxuICAgICAgICAgICAgbShcInRoXCIsIFwiQ3JlYXRpb24gRGF0ZVwiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIkRvbmUgRGF0ZVwiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIlN0YXR1c1wiKSxcbiAgICAgICAgICAgIG0oXCJ0aFwiLCBcIlByaW9yaXR5XCIpLFxuICAgICAgICAgIF0pXG4gICAgICAgIF0pLFxuICAgICAgICBtKFwidGJvZHlcIiwgW1xuICAgICAgICAgIG0oXCJ0clwiLCBbXG4gICAgICAgICAgICBtKFwidGRcIiwgY3RybC50aWNrZXQoKS50aWNrZXQuY3VzdG9tZXJfaWQpLFxuICAgICAgICAgICAgbShcInRkXCIsIGN0cmwudGlja2V0KCkudGlja2V0LmFnZW50X2lkKSxcbiAgICAgICAgICAgIG0oXCJ0ZFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5jcmVhdGVkX2F0KSxcbiAgICAgICAgICAgIG0oXCJ0ZFwiLCBjdHJsLnRpY2tldCgpLnRpY2tldC5kb25lX2RhdGUpLFxuICAgICAgICAgICAgbShcInRkXCIsIGN0cmwudGlja2V0KCkudGlja2V0LnN0YXR1cyksXG4gICAgICAgICAgICBtKFwidGRcIiwgbShcInNwYW4ubGFiZWxcIiwgeyBjbGFzczogY3RybC50aWNrZXQoKS50aWNrZXQucHJpb3JldHkgPT0gXCJsb3dcIiA/IFwibGFiZWwtZGVmYXVsdFwiIDogY3RybC50aWNrZXQoKS50aWNrZXQucHJpb3JldHkgPT0gXCJtZWRpdW1cIiA/IFwibGFiZWwtcHJpbWFyeVwiIDogXCJsYWJlbC1kYW5nZXJcIiB9LCBjdHJsLnRpY2tldCgpLnRpY2tldC5wcmlvcmV0eSkpXG4gICAgICAgICAgXSksXG4gICAgICAgIF0pXG4gICAgICBdKSxcblxuICAgICAgY3RybC50aWNrZXQoKS50aWNrZXQuc3RhdHVzID09ICdjbG9zZWQnID8gbShcImJ1dHRvbi5idG4uYnRuLXdhcm5pbmdcIiwgeyBvbmNsaWNrOiBjdHJsLm9wZW4uYmluZChjdHJsLCAnb3BlbmVkJykgfSwgXCJSZU9wZW5cIikgOlxuICAgICAgICBtKFwiYnV0dG9uLmJ0bi5idG4tZGFuZ2VyXCIsIHsgb25jbGljazogY3RybC5vcGVuLmJpbmQoY3RybCwgJ2Nsb3NlZCcpIH0sIFwiQ2xvc2VcIilcbiAgICAgIF1dXG4gICAgKV07XG4gIH1cblxufVxuIiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgbWMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL0RhdGFUYWJsZS5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xudmFyIFRpY2tldCA9IHJlcXVpcmUoJy4uL21vZGVscy9UaWNrZXQuanMnKTtcbnZhciBUaWNrZXRQYWdlID0gcmVxdWlyZSgnLi4vcGFnZXMvVGlja2V0UGFnZS5qcycpO1xuXG52YXIgVGlja2V0cyA9IG1vZHVsZS5leHBvcnRzID0ge1xuICBjb250cm9sbGVyOiBmdW5jdGlvbiAoKSB7XG4gICAgdmFyIGN0cmwgPSB0aGlzO1xuXG4gICAgY3RybC5wcmlvcmV0eUZyb21hdGUgPSBmdW5jdGlvbiAodmFsdWUsIHJvdywgY29sLCBhdHRycyl7XG4gICAgICBpZiAodmFsdWUgPT0gJ2hpZ2gnKSBhdHRycy5jbGFzcyA9ICdsYWJlbCBsYWJlbC1kYW5nZXInO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YXRhYmxlID0gbmV3IG1jLkRhdGF0YWJsZS5jb250cm9sbGVyKFxuICAgICAgLy8gQ29sdW1ucyBkZWZpbml0aW9uOlxuICAgICAgW1xuICAgICAgICB7IGtleTogXCJ0aXRsZVwiLGxhYmVsOiBcIlRpdGxlXCIsIHNvcnRhYmxlOiB0cnVlIH0sXG4gICAgICAgIHsga2V5OiBcImFnZW50X2lkXCIsbGFiZWw6IFwiQWdlbnRcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgICAgeyBrZXk6IFwiY3VzdG9tZXJfaWRcIixsYWJlbDogXCJDdXN0b21lclwiLCBzb3J0YWJsZTogdHJ1ZSB9LFxuICAgICAgICB7IGtleTogXCJwcmlvcmV0eVwiLGxhYmVsOiBcIlByaW9yaXR5XCJ9LFxuICAgICAgICB7IGtleTogXCJzdGF0dXNcIixsYWJlbDogXCJTdGF0dXNcIiwgc29ydGFibGU6IHRydWUgfSxcbiAgICAgIF0sXG4gICAgICAvLyBPdGhlciBjb25maWd1cmF0aW9uOlxuICAgICAge1xuICAgICAgICAvLyBBZGRyZXNzIG9mIHRoZSB3ZWJzZXJ2ZXIgc3VwcGx5aW5nIHRoZSBkYXRhXG4gICAgICAgIHVybDogJ3RpY2tldHMnLFxuICAgICAgICBhdXRob3JpemF0aW9uOiBBdXRoLnRva2VuKCksXG4gICAgICAgIC8vIEhhbmRsZXIgb2YgY2xpY2sgZXZlbnQgb24gZGF0YSBjZWxsXG4gICAgICAgIC8vIEl0IHJlY2VpdmVzIHRoZSByZWxldmFudCBpbmZvcm1hdGlvbiBhbHJlYWR5IHJlc29sdmVkXG4gICAgICAgIG9uQ2VsbENsaWNrOiBmdW5jdGlvbiAoY29udGVudCwgcm93LCBjb2wpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjb250ZW50LCByb3csIGNvbCk7XG4gICAgICAgICAgbS5yb3V0ZShcIi90aWNrZXRcIix7aWQ6cm93LmlkfSlcbiAgICAgICAgfVxuICAgICAgfVxuICAgICk7XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24gKGN0cmwpIHtcbiAgICByZXR1cm4gW05hdmJhciwgbSgnLmNvbnRhaW5lcicsIFtcbiAgICAgIG0oJ2gxJywgJ0Nyb3Nzb3ZlciBUaWNrZXQgU3lzdGVtJyksXG4gICAgICBtYy5EYXRhdGFibGUudmlldyhjdHJsLmRhdGF0YWJsZSwge1xuICAgICAgICBjYXB0aW9uOiAnTXkgVGlja2V0cydcbiAgICAgIH0pLFxuICAgIF0pXTtcbiAgfVxufTtcbiIsInZhciBOYXZiYXIgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL05hdmJhci5qcycpO1xudmFyIG1jID0gcmVxdWlyZSgnLi4vY29tcG9uZW50cy9EYXRhVGFibGUuanMnKTtcbnZhciBBdXRoID0gcmVxdWlyZSgnLi4vbW9kZWxzL0F1dGguanMnKTtcbnZhciBVc2VyID0gcmVxdWlyZSgnLi4vbW9kZWxzL1VzZXIuanMnKTtcblxudmFyIFVzZXJEZWxldGUgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwuZXJyb3IgPSBtLnByb3AoJycpO1xuXG4gICAgY3RybC5nZXQgPSBmdW5jdGlvbihlKXtcbiAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgVXNlci5kZWxldGUobS5yb3V0ZS5wYXJhbSgpLmlkKVxuICAgICAgICAudGhlbihmdW5jdGlvbigpe1xuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1zdWNjZXNzLmFuaW1hdGVkLmZhZGVJblVwXCIsICd1c2VyIGhhcyBiZWVuIHNhdmVkJykpO1xuICAgICAgICB9LCBmdW5jdGlvbihlcnIpe1xuICAgICAgICAgIHZhciBtZXNzYWdlID0gJ0FuIGVycm9yIG9jY3VycmVkLic7XG4gICAgICAgICAgXG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LWRhbmdlci5hbmltYXRlZC5mYWRlSW5VcFwiLCBtZXNzYWdlKSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgIGN0cmwuZXJyb3IoKSxcbiAgICAgIG0oXCJmb3JtLnRleHQtY2VudGVyLnJvdy5mb3JtLXVzZXItZGVsZXRlXCIsIHtvbnN1Ym1pdDpjdHJsLmdldC5iaW5kKGN0cmwpfSxcbiAgICAgICAgbSgnLmNvbC1zbS02LmNvbC1zbS1vZmZzZXQtMy5tdC01MCcsIFtcbiAgICAgICAgICBtKCcuZm9ybS1ncm91cCcsXG4gICAgICAgICAgICBtKFwiYnV0dG9uLmJ0bi5idG4tbGcuYnRuLXdhcm5pbmcuYnRuLWJsb2NrW3R5cGU9J3N1Ym1pdCddXCIsIFwiRGVsZXRlIFVzZXI/XCIpXG4gICAgICAgICAgKVxuICAgICAgICBdKVxuICAgICAgKSxcbiAgICBdKV07XG4gIH1cbn07IiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgbWMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL0RhdGFUYWJsZS5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xudmFyIFVzZXIgPSByZXF1aXJlKCcuLi9tb2RlbHMvVXNlci5qcycpO1xuXG52YXIgVXNlckVkaXQgPSBtb2R1bGUuZXhwb3J0cyA9IHtcblxuICBjb250cm9sbGVyOiBmdW5jdGlvbihhcmdzKXtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLmVycm9yID0gbS5wcm9wKCcnKTtcblxuICAgIGN0cmwuZ2V0ID0gZnVuY3Rpb24oZSl7XG4gICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgIFVzZXIuc2VuZCh7bmFtZTogZS50YXJnZXQubmFtZS52YWx1ZSxzdGF0dXM6IGUudGFyZ2V0LnN0YXR1cy52YWx1ZSxwaG9uZTogZS50YXJnZXQucGhvbmUudmFsdWV9LCBtLnJvdXRlLnBhcmFtKCkuaWQpXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICAgICAgY3RybC5lcnJvcihtKFwiLmFsZXJ0LmFsZXJ0LXN1Y2Nlc3MuYW5pbWF0ZWQuZmFkZUluVXBcIiwgJ3VzZXIgaGFzIGJlZW4gc2F2ZWQnKSk7XG4gICAgICAgIH0sIGZ1bmN0aW9uKGVycil7XG4gICAgICAgICAgdmFyIG1lc3NhZ2UgPSAnQW4gZXJyb3Igb2NjdXJyZWQuJztcblxuICAgICAgICAgIGN0cmwuZXJyb3IobShcIi5hbGVydC5hbGVydC1kYW5nZXIuYW5pbWF0ZWQuZmFkZUluVXBcIiwgbWVzc2FnZSkpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgVXNlci5nZXQobS5yb3V0ZS5wYXJhbSgpLmlkKVxuICAgICAgLnRoZW4oZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgY3RybC51c2VyID0gdXNlclxuICAgICAgfSwgZnVuY3Rpb24gKGVycikge1xuICAgICAgICB2YXIgbWVzc2FnZSA9ICdBbiBlcnJvciBvY2N1cnJlZC4nO1xuICAgICAgICBtLnJvdXRlKCcvdXNlcnMnKVxuICAgICAgICBjdHJsLmVycm9yKG0oXCIuYWxlcnQuYWxlcnQtZGFuZ2VyLmFuaW1hdGVkLmZhZGVJblVwXCIsIG1lc3NhZ2UpKTtcbiAgICAgIH0pO1xuXG4gIH0sXG5cbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oXCIuY29udGFpbmVyXCIsIFtcbiAgICAgIG0oXCJmb3JtLnRleHQtY2VudGVyLnJvdy5mb3JtLXVzZXItZWRpdFwiLCB7b25zdWJtaXQ6Y3RybC5nZXQuYmluZChjdHJsKX0sXG4gICAgICAgIG0oJy5jb2wtc20tNi5jb2wtc20tb2Zmc2V0LTMnLCBbXG4gICAgICAgICAgY3RybC5lcnJvcigpLFxuICAgICAgICAgIG0oXCJoMVwiLCBjdHJsLnVzZXIubmFtZSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuW2Zvcj0naW5wdXROYW1lJ11cIiwgXCJOYW1lXCIpLFxuICAgICAgICAgICAgbShcImlucHV0LmZvcm0tY29udHJvbFtuYW1lPSduYW1lJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRUaXRsZSddW3BsYWNlaG9sZGVyPSdOYW1lICddW3R5cGU9J3RleHQnXVwiLCB7dmFsdWU6IGN0cmwudXNlci5uYW1lfSksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLCBbXG4gICAgICAgICAgICBtKFwibGFiZWwuW2Zvcj0naW5wdXRQaG9uZSddXCIsIFwiUGhvbmVcIiksXG4gICAgICAgICAgICBtKFwiaW5wdXQuZm9ybS1jb250cm9sW25hbWU9J3Bob25lJ11bYXV0b2ZvY3VzXVtpZD0naW5wdXRib2R5J11bcGxhY2Vob2xkZXI9J1Bob25lICddW3R5cGU9J3RleHQnXVwiLCB7dmFsdWU6IGN0cmwudXNlci5waG9uZX0pLFxuICAgICAgICAgIF0pLFxuICAgICAgICAgIG0oJy5mb3JtLWdyb3VwLnB1bGwtbGVmdCcsIFtcbiAgICAgICAgICAgIG0oXCJsYWJlbC5bZm9yPSdpbnB1dFN0YXR1cyddXCIsIFwiU3RhdHVzXCIpLFxuICAgICAgICAgICAgbShcImlucHV0W25hbWU9J3N0YXR1cyddW2F1dG9mb2N1c11baWQ9J2lucHV0U3RhdHVzQmxvY2snXVt2YWx1ZT0nYmxvY2tlZCddW3R5cGU9J3JhZGlvJ11cIiwge30pLFxuICAgICAgICAgICAgbShcImxhYmVsLnJhZGlvLWlubGluZVwiLCBcIkJsb2NrXCIpLFxuICAgICAgICAgICAgbShcImlucHV0Lm1sLTIwW25hbWU9J3N0YXR1cyddW2F1dG9mb2N1c11baWQ9J2lucHV0U3RhdHVzVW5ibG9jayddW3ZhbHVlPSd1bmJsb2NrZWQnXVt0eXBlPSdyYWRpbyddXCIpLFxuICAgICAgICAgICAgbShcImxhYmVsLnJhZGlvLWlubGluZVwiLCBcIlVuYmxvY2tcIiksXG4gICAgICAgICAgXSksXG4gICAgICAgICAgbSgnLmZvcm0tZ3JvdXAnLFxuICAgICAgICAgICAgbShcImJ1dHRvbi5idG4uYnRuLWxnLmJ0bi1wcmltYXJ5LmJ0bi1ibG9ja1t0eXBlPSdzdWJtaXQnXVwiLCBcIlNhdmVcIilcbiAgICAgICAgICApXG4gICAgICAgIF0pXG4gICAgICApLFxuICAgICAgbShcImEuYnRuLmJ0bi13YXJuaW5nLmJ0bi14cy5wdWxsLXJpZ2h0W2hyZWY9Jy91c2Vycy9cIiArIG0ucm91dGUucGFyYW0oKS5pZCArIFwiJ11bZGF0YS1tZXRob2Q9J2RlbGV0ZSddXCIsIHtjb25maWc6IG0ucm91dGV9LCBcIkRlbGV0ZSBVc2VyXCIpXG4gICAgXSldO1xuICB9XG59O1xuIiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgbWMgPSByZXF1aXJlKCcuLi9jb21wb25lbnRzL0RhdGFUYWJsZS5qcycpO1xudmFyIEF1dGggPSByZXF1aXJlKCcuLi9tb2RlbHMvQXV0aC5qcycpO1xuXG52YXIgdXNlcnMgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24gKCkge1xuICAgIHZhciBjdHJsID0gdGhpcztcbiAgICBjdHJsLm5hdmJhciA9IG5ldyBOYXZiYXIuY29udHJvbGxlcigpO1xuICAgIGN0cmwudXNlciA9IG0ucHJvcCgpO1xuXG4gICAgY3RybC5wcmlvcmV0eUZyb21hdGUgPSBmdW5jdGlvbih2YWx1ZSwgcm93LCBjb2wsIGF0dHJzKSB7XG4gICAgICBpZiAodmFsdWUgPT0gJ2hpZ2gnKSBhdHRycy5jbGFzcyA9ICdsYWJlbCBsYWJlbC1kYW5nZXInO1xuICAgICAgcmV0dXJuIHZhbHVlO1xuICAgIH1cblxuICAgIHRoaXMuZGF0YXRhYmxlID0gbmV3IG1jLkRhdGF0YWJsZS5jb250cm9sbGVyKFxuICAgICAgLy8gQ29sdW1ucyBkZWZpbml0aW9uOlxuICAgICAgW1xuICAgICAgICB7IGtleTogXCJuYW1lXCIsbGFiZWw6IFwiTmFtZVwiIH0sXG4gICAgICAgIHsga2V5OiBcImVtYWlsXCIsbGFiZWw6IFwiRW1haWxcIiB9LFxuICAgICAgICB7IGtleTogXCJwaG9uZVwiLGxhYmVsOiBcIlBob25lXCIgfSxcbiAgICAgICAgeyBrZXk6IFwidHlwZVwiLGxhYmVsOiBcIlR5cGVcIiB9LFxuICAgICAgICB7IGtleTogXCJzdGF0dXNcIixsYWJlbDogXCJTdGF0dXNcIiB9LFxuICAgICAgXSxcbiAgICAgIC8vIE90aGVyIGNvbmZpZ3VyYXRpb246XG4gICAgICB7XG4gICAgICAgIC8vIEFkZHJlc3Mgb2YgdGhlIHdlYnNlcnZlciBzdXBwbHlpbmcgdGhlIGRhdGFcbiAgICAgICAgdXJsOiAndXNlcnMnLFxuICAgICAgICBhdXRob3JpemF0aW9uOiBBdXRoLnRva2VuKCksXG4gICAgICAgIG9uQ2VsbENsaWNrOiBmdW5jdGlvbiAoY29udGVudCwgcm93LCBjb2wpIHtcbiAgICAgICAgICBjb25zb2xlLmxvZyhjb250ZW50LCByb3csIGNvbCk7XG4gICAgICAgICAgbS5yb3V0ZShcIi91c2VyRWRpdFwiLHtpZDpyb3cuaWR9KVxuICAgICAgICB9XG4gICAgICAgIC8vIEhhbmRsZXIgb2YgY2xpY2sgZXZlbnQgb24gZGF0YSBjZWxsXG4gICAgICAgIC8vIEl0IHJlY2VpdmVzIHRoZSByZWxldmFudCBpbmZvcm1hdGlvbiBhbHJlYWR5IHJlc29sdmVkXG4gICAgICB9XG4gICAgKTtcbiAgfSxcblxuICB2aWV3OiBmdW5jdGlvbiAoY3RybCkge1xuICAgIHJldHVybiBbTmF2YmFyLnZpZXcoY3RybC5uYXZiYXIpLCBtKCcuY29udGFpbmVyJywgW1xuICAgICAgbSgnaDEnLCAnVXNlcnMgbWFuYWdlbWVudCcpLFxuICAgICAgbWMuRGF0YXRhYmxlLnZpZXcoY3RybC5kYXRhdGFibGUsIHtcbiAgICAgICAgY2FwdGlvbjogJ0FsbCB1c2VycydcbiAgICAgIH0pXG4gICAgXSldO1xuICB9XG59O1xuIiwidmFyIE5hdmJhciA9IHJlcXVpcmUoJy4uL2NvbXBvbmVudHMvTmF2YmFyLmpzJyk7XG52YXIgQXV0aCA9IHJlcXVpcmUoJy4uL21vZGVscy9BdXRoLmpzJyk7XG5cbnZhciBWZXJpZnkgPSBtb2R1bGUuZXhwb3J0cyA9IHtcbiAgY29udHJvbGxlcjogZnVuY3Rpb24oKXtcbiAgICB2YXIgY3RybCA9IHRoaXM7XG4gICAgY3RybC5uYXZiYXIgPSBuZXcgTmF2YmFyLmNvbnRyb2xsZXIoKTtcbiAgICBjdHJsLm1lc3NhZ2UgPSBtLnByb3AoKTtcblxuICAgIEF1dGgudmVyaWZ5KG0ucm91dGUucGFyYW0oXCJjb2RlXCIpKS50aGVuKGZ1bmN0aW9uKCl7XG4gICAgICBjdHJsLm1lc3NhZ2UoW1xuICAgICAgICAnU3dlZXQuIE5vdywgeW91IGNhbiAnLFxuICAgICAgICBtKCdhW2hyZWY9XCIvbG9naW5cIl0nLCB7Y29uZmlnOiBtLnJvdXRlfSwgJ2xvZ2luJyksXG4gICAgICAgICcuJ1xuICAgICAgXSk7XG4gICAgfSwgZnVuY3Rpb24oKXtcbiAgICAgIGN0cmwubWVzc2FnZSgnSG1tLCB0aGVyZSB3YXMgc29tZXRoaW5nIHdyb25nIHdpdGggdGhhdCBjb2RlLiBDaGVjayB5b3VyIGVtYWlsIGFnYWluLicpO1xuICAgIH0pO1xuICB9LFxuICBcbiAgdmlldzogZnVuY3Rpb24oY3RybCl7XG4gICAgcmV0dXJuIFtOYXZiYXIudmlldyhjdHJsLm5hdmJhciksIG0oJy5jb250YWluZXInLCBbXG4gICAgICBtKCdoMScsICd2ZXJpZnknKSxcbiAgICAgIGN0cmwubWVzc2FnZSgpXG4gICAgXSldO1xuICB9XG59OyJdfQ==
