var filterPropList = {
  exact: function (list) {
    return list.filter(function (m) {
        return m.match(/^[^\*\!]+$/);
    });
  },
  contain: function (list) {
    return list.filter(function (m) {
        return m.match(/^\*.+\*$/);
    }).map(function (m) {
        return m.substr(1, m.length - 2);
    });
  },
  endWith: function (list) {
    return list.filter(function (m) {
      return m.match(/^\*[^\*]+$/);
    }).map(function (m) {
      return m.substr(1);
    });
  },
  startWith: function (list) {
    return list.filter(function (m) {
      return m.match(/^[^\*\!]+\*$/);
    }).map(function (m) {
      return m.substr(0, m.length - 1);
    });
  },
  notExact: function (list) {
    return list.filter(function (m) {
      return m.match(/^\![^\*].*$/);
    }).map(function (m) {
      return m.substr(1);
    });
  },
  notContain: function (list) {
    return list.filter(function (m) {
      return m.match(/^\!\*.+\*$/);
    }).map(function (m) {
      return m.substr(2, m.length - 3);
    });
  },
  notEndWith: function (list) {
    return list.filter(function (m) {
      return m.match(/^\!\*[^\*]+$/);
    }).map(function (m) {
      return m.substr(2);
    });
  },
  notStartWith: function (list) {
    return list.filter(function (m) {
      return m.match(/^\![^\*]+\*$/);
    }).map(function (m) {
      return m.substr(1, m.length - 2);
    });
  }
};

function createPropListMatcher(propList) {
  var hasWild = propList.indexOf('*') > -1;
  var matchAll = (hasWild && propList.length === 1);
  var lists = {
    exact: filterPropList.exact(propList),
    contain: filterPropList.contain(propList),
    startWith: filterPropList.startWith(propList),
    endWith: filterPropList.endWith(propList),
    notExact: filterPropList.notExact(propList),
    notContain: filterPropList.notContain(propList),
    notStartWith: filterPropList.notStartWith(propList),
    notEndWith: filterPropList.notEndWith(propList)
  };
  return function (prop) {
    if (matchAll) return true;
    return (
      (
        hasWild ||
        lists.exact.indexOf(prop) > -1 ||
        lists.contain.some(function (m) {
            return prop.indexOf(m) > -1;
        }) ||
        lists.startWith.some(function (m) {
            return prop.indexOf(m) === 0;
        }) ||
        lists.endWith.some(function (m) {
            return prop.indexOf(m) === prop.length - m.length;
        })
      ) &&
      !(
        lists.notExact.indexOf(prop) > -1 ||
        lists.notContain.some(function (m) {
            return prop.indexOf(m) > -1;
        }) ||
        lists.notStartWith.some(function (m) {
            return prop.indexOf(m) === 0;
        }) ||
        lists.notEndWith.some(function (m) {
            return prop.indexOf(m) === prop.length - m.length;
        })
      )
    );
  };
}

module.exports = {
  filterPropList,
  createPropListMatcher
};
