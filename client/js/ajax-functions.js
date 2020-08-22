function AjaxFunctions() {
  this.ready = function (fn) {
    if (typeof fn !== 'function') {
      return;
    }

    if (document.readyState === 'complete') {
      return fn();
    }

    document.addEventListener('DOMContentLoaded', fn, false);
  };

  this.ajaxRequest = function (method, _url, success, error, params) {
    const xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function () {
      if (xmlhttp.readyState === 4) {
        if (xmlhttp.status === 200) {
          success(JSON.parse(xmlhttp.response));
        } else {
          if (error) {
            error(JSON.parse({ err: xmlhttp.statusText }));
          } else {
            console.log(xmlhttp.statusText);
          }
        }
      }
    };

    let url = _url;
    if (url.slice(-1) === '/') url = url.slice(0, url.length - 1);

    if (params) {
      let query = [];
      for (const key in params) {
        query.push(key + '=' + encodeURIComponent(params[key]));
        query.push('&');
      }
      query.pop();
      query = query.join('');
      switch (method.toLowerCase()) {
        case 'get':
        case 'delete':
          url += '?' + query;
          xmlhttp.open(method, url, true);
          xmlhttp.send();
          break;
        case 'put':
        case 'post':
          xmlhttp.open(method, url, true);
          xmlhttp.setRequestHeader(
            'Content-type',
            'application/x-www-form-urlencoded'
          );
          xmlhttp.send(query);
          break;
        default:
          return;
      }
    } else {
      xmlhttp.open(method, url, true);
      xmlhttp.send();
    }
  };
}

export default AjaxFunctions;
