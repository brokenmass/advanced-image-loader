/* From Promise Object to Promise Array and back
{
  a: Promise A(...)
  b: Promise B(...)
}
=====>
[Promise A, Promise B]
=====>
[ResolvedValue A, resolvedValue B]
=====>
{
  a: ResolvedValue A,
  b: ResolvedValue B
}
*/

const promiseAllMap = function (promiseObject) {
  const promiseKeys = Object.keys(promiseObject);
  const promiseArray = promiseKeys
    .map((key) => promiseObject[key]);

  return Promise.all(promiseArray)
    .then((values) => values.reduce((map, value, index) => {
      const key = promiseKeys[index];

      // eslint-disable-next-line no-param-reassign
      map[key] = value;
      return map;
    }, {}));
};

module.exports = promiseAllMap;
