const generateSortQuery = (sortBy) => {
  let sortList = [];
  sortBy.split(',').forEach((sortItem) => {
    let sortItemArray = sortItem.split(':');
    if (Number(sortItemArray.length) === 2) {
      sortList.push((sortItemArray[1] === 'desc' ? '-' : '') + sortItemArray[0]);
    }
  });
  return sortList.join(' ');
}

module.exports = {
  generateSortQuery
}