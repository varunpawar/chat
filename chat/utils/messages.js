const moment = require('moment');

function formatMessage(username, text) {
  return {
    username,
    text,
    time: moment().format('h:mm a') // hours minutes am
  };
}

module.exports = formatMessage;
