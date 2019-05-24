const path = require('path');

module.exports = (folder, prefix = '') => {
  //This is where we determine the theme folder location
  const theme = path.basename(path.resolve('../'));

  return `${prefix}/wp-content/themes/${theme}/${folder}/`;
}
