(function(jQuery) {
    jQuery.browserTest = function(a, z) {
        var u = 'unknown', x = 'X', m = function(r, h) {
            for (var i = 0; i < h.length; i = i + 1) {
                r = r.replace(h[i][0], h[i][1]);
            }
            return r;
        }, c = function(i, a, b, c) {
            var r = {
                name: m((a.exec(i) || [u, u])[1], b)
            };
            r[r.name] = true;
            r.version = (c.exec(i) || [x, x, x, x])[3];
            if (r.name.match(/safari/) && r.version > 400) {
                r.version = '2.0';
            }
            if (r.name === 'presto') {
                r.version = (jQuery.browser.version > 9.27) ? 'futhark' : 'linear_b';
            }
            r.versionNumber = parseFloat(r.version, 10) || 0;
            r.versionX = (r.version !== x) ? (r.version + '').substr(0, 1) : x;
            r.className = r.name + r.versionX;
            return r;
        };
        a = (a.match(/Opera|Navigator|Minefield|KHTML|Chrome/) ? m(a, [[/(Firefox|MSIE|KHTML,\slike\sGecko|Konqueror)/, ''], ['Chrome Safari', 'Chrome'], ['KHTML', 'Konqueror'], ['Minefield', 'Firefox'], ['Navigator', 'Netscape']]) : a).toLowerCase();
        jQuery.browser = jQuery.extend((!z) ? jQuery.browser : {}, c(a, /(camino|chrome|firefox|netscape|konqueror|lynx|msie|opera|safari)/, [], /(camino|chrome|firefox|netscape|netscape6|opera|version|konqueror|lynx|msie|safari)(\/|\s)([a-z0-9\.\+]*?)(\;|dev|rel|\s|$)/));
        jQuery.layout = c(a, /(gecko|konqueror|msie|opera|webkit)/, [['konqueror', 'khtml'], ['msie', 'trident'], ['opera', 'presto']], /(applewebkit|rv|konqueror|msie)(\:|\/|\s)([a-z0-9\.]*?)(\;|\)|\s)/);
        jQuery.os = {
            name: (/(win|mac|linux|sunos|solaris|iphone)/.exec(navigator.platform.toLowerCase()) || [u])[0].replace('sunos', 'solaris')
        };
        if (!z) {
            jQuery('html').addClass([jQuery.os.name, jQuery.browser.name, jQuery.browser.className, jQuery.layout.name, jQuery.layout.className].join(' '));
        }
    };
    jQuery.browserTest(navigator.userAgent);
})(jQuery);

/**
* jQuery.query - Query String Modification and Creation for jQuery
* Written by Blair Mitchelmore (blair DOT mitchelmore AT gmail DOT com)
* Licensed under the WTFPL (http://sam.zoy.org/wtfpl/).
* Date: 2009/8/13
*
* @author Blair Mitchelmore
* @version 2.1.7
*
**/
new function (settings) {
  // Various Settings
  var $separator = settings.separator || '&';
  var $spaces = settings.spaces === false ? false : true;
  var $suffix = settings.suffix === false ? '' : '[]';
  var $prefix = settings.prefix === false ? false : true;
  var $hash = $prefix ? settings.hash === true ? "#" : "?" : "";
  var $numbers = settings.numbers === false ? false : true;

  jQuery.query = new function () {
    
    var is = function (o, t) {
      return o != undefined && o !== null && (!!t ? o.constructor == t : true);
    };
    var parse = function (path) {
      var m, rx = /\[([^[]*)\]/g, match = /^([^[]+)(\[.*\])?$/.exec(path), base = match[1], tokens = [];
      while (m = rx.exec(match[2])) tokens.push(m[1]);
      return [base, tokens];
    };
    var set = function (target, tokens, value) {
      var o, token = tokens.shift();
      if (typeof target != 'object') target = null;
      if (token === "") {
        if (!target) target = [];
        if (is(target, Array)) {
          target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
        } else if (is(target, Object)) {
          var i = 0;
          while (target[i++] != null);
          target[--i] = tokens.length == 0 ? value : set(target[i], tokens.slice(0), value);
        } else {
          target = [];
          target.push(tokens.length == 0 ? value : set(null, tokens.slice(0), value));
        }
      } else if (token && token.match(/^\s*[0-9]+\s*$/)) {
        var index = parseInt(token, 10);
        if (!target) target = [];
        target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
      } else if (token) {
        var index = token.replace(/^\s*|\s*$/g, "");
        if (!target) target = {};
        if (is(target, Array)) {
          var temp = {};
          for (var i = 0; i < target.length; ++i) {
            temp[i] = target[i];
          }
          target = temp;
        }
        target[index] = tokens.length == 0 ? value : set(target[index], tokens.slice(0), value);
      } else {
        return value;
      }
      return target;
    };

    var queryObject = function (a) {
      var self = this;
      self.keys = {};

      if (a.queryObject) {
        jQuery.each(a.get(), function (key, val) {
          self.SET(key, val);
        });
      } else {
        jQuery.each(arguments, function () {
          var q = "" + this;
          q = q.replace(/^[?#]/, ''); // remove any leading ? || #
          // joel: removed ; in processing url 
          //q = q.replace(/[;&]$/, ''); // remove any trailing & || ;
          q = q.replace(/[&]$/, ''); // remove any trailing & || ;
          if ($spaces) q = q.replace(/[+]/g, ' '); // replace +'s with spaces

          // joel: removed ; in processing url 
          //jQuery.each(q.split(/[&;]/), function () {
          jQuery.each(q.split(/[&]/), function () {
            var key = decodeURIComponent(this.split('=')[0] || "");
            var val = decodeURIComponent(this.split('=')[1] || "");

            if (!key) return;

            if ($numbers) {
              if (/^[+-]?[0-9]+\.[0-9]*$/.test(val)) // simple float regex
                val = parseFloat(val);
              else if (/^[+-]?[0-9]+$/.test(val)) // simple int regex
                val = parseInt(val, 10);
            }

            val = (!val && val !== 0) ? true : val;

            if (val !== false && val !== true && typeof val != 'number')
              val = val;

            self.SET(key, val);
          });
        });
      }
      return self;
    };

    queryObject.prototype = {
      queryObject: true,
      has: function (key, type) {
        var value = this.get(key);
        return is(value, type);
      },
      GET: function (key) {
        if (!is(key)) return this.keys;
        var parsed = parse(key), base = parsed[0], tokens = parsed[1];
        var target = this.keys[base];
        while (target != null && tokens.length != 0) {
          target = target[tokens.shift()];
        }
        return typeof target == 'number' ? target : target || "";
      },
      get: function (key) {
        var target = this.GET(key);
        if (is(target, Object))
          return jQuery.extend(true, {}, target);
        else if (is(target, Array))
          return target.slice(0);
        return target;
      },
      SET: function (key, val) {
        var value = !is(val) ? null : val;
        var parsed = parse(key), base = parsed[0], tokens = parsed[1];
        var target = this.keys[base];
        this.keys[base] = set(target, tokens.slice(0), value);
        return this;
      },
      set: function (key, val) {
        return this.copy().SET(key, val);
      },
      REMOVE: function (key) {        
        return this.SET(key, null).COMPACT();
      },
      remove: function (key) {
        return this.copy().REMOVE(key);
      },
      EMPTY: function () {
        var self = this;
        jQuery.each(self.keys, function (key, value) {
          delete self.keys[key];
        });
        return self;
      },
      load: function (url) {
        var hash = url.replace(/^.*?[#](.+?)(?:\?.+)?$/, "$1");
        var search = url.replace(/^.*?[?](.+?)(?:#.+)?$/, "$1");
        return new queryObject(url.length == search.length ? '' : search, url.length == hash.length ? '' : hash);
      },
      empty: function () {
        return this.copy().EMPTY();
      },
      copy: function () {
        return new queryObject(this);
      },
      COMPACT: function () {
        function build(orig) {
          var obj = typeof orig == "object" ? is(orig, Array) ? [] : {} : orig;
          if (typeof orig == 'object') {
            function add(o, key, value) {
              if (is(o, Array))
                o.push(value);
              else
                o[key] = value;
            }
            jQuery.each(orig, function (key, value) {
              if (!is(value)) return true;
              add(obj, key, build(value));
            });
          }
          return obj;
        }
        this.keys = build(this.keys);
        return this;
      },
      compact: function () {
        return this.copy().COMPACT();
      },
      toString: function () {
        var i = 0, queryString = [], chunks = [], self = this;
        var encode = function (str) {
          str = str + "";
          if ($spaces) str = str.replace(/ /g, "+");
          return encodeURIComponent(str);
        };
        var addFields = function (arr, key, value) {
          if (!is(value) || value === false) return;
          var o = [encode(key)];
          if (value !== true) {
            o.push("=");
            o.push(encode(value));
          }
          arr.push(o.join(""));
        };
        var build = function (obj, base) {
          var newKey = function (key) {
            return !base || base == "" ? [key].join("") : [base, "[", key, "]"].join("");
          };
          jQuery.each(obj, function (key, value) {
            if (typeof value == 'object')
              build(value, newKey(key));
            else
              addFields(chunks, newKey(key), value);
          });
        };

        build(this.keys);

        if (chunks.length > 0) queryString.push($hash);
        queryString.push(chunks.join($separator));

        return queryString.join("");
      }
    };

    return new queryObject(location.search, location.hash);
  };
} (jQuery.query || {});   // Pass in jQuery.query as settings object

var analytics = new function () {
    var me = this;

    var analyticsClientCode = getUrlParameter('code');
	var myipaddress ="";
    if(analyticsClientCode)
    {
		var cookieValue = getCookie ('analytics-clientcode'); 		
		if (cookieValue!="")
		{
			eraseCookie('analytics-clientcode');
		}
		analyticsClientCode = ("0000000000" + analyticsClientCode).slice(-10);
        setCookie('analytics-clientcode', analyticsClientCode, 365);
    }
    analyticsClientCode = getCookie('analytics-clientcode');
    if(analyticsClientCode && analyticsClientCode != "" && analyticsClientCode != "000000true"){
		$.getJSON('//api.ipify.org?format=jsonp&callback=?', function(data) { myipaddress =data.ip; });
        var socket = io.connect('https://blacktomato-website-analytics.herokuapp.com:443');
        socket.on('connect', function () {
            var data = {
                accountcode: analyticsClientCode,
                url: window.location.href,
                date: "/Date(" + new Date().getTime() +")/",
                device: GetUserDeviceInfo() || "",
                os: GetOSName() || "",
                browser: GetBrowserName(GetOSName(), GetUserDeviceInfo()) || "",
                ip: myipaddress
            };
            
            socket.emit('analytics_msg', data);
            socket.disconnect();
        });        
    }

    function setCookie(cname,cvalue,exdays)
    {
        var d = new Date();
        d.setTime(d.getTime()+(exdays*24*60*60*1000));
        var expires = "expires="+d.toGMTString();
        document.cookie = cname+"="+cvalue+"; "+expires+"; path=/";
    }
	function eraseCookie(name) {
		setCookie(name,"",-1);
	}
    function getCookie(cname)
    {
        var name = cname + "=";
        var ca = document.cookie.split(';');
        for(var i=0; i<ca.length; i++) 
          {
          var c = ca[i].trim();
          if (c.indexOf(name)==0) return c.substring(name.length,c.length);
          }
        return "";
    }

	function getUrlParameter (name){
    name = name.replace(/[\[]/, '\\[').replace(/[\]]/, '\\]');
    var regex = new RegExp('[\\?&]' + name + '=([^&#]*)');
    var results = regex.exec(location.search);
    return results === null ? '' : decodeURIComponent(results[1].replace(/\+/g, ' '));
    }
	
    function GetBrowserName(osname, devicename) {
        if (!isNullOrEmpty(osname) && osname == "MacOS" && devicename == "iPad") {
            if (navigator.userAgent.toLowerCase().indexOf("crios") != -1)
                return toTitleCase("chrome") + ' (' + navigator.userAgent.substr(navigator.userAgent.toLowerCase().lastIndexOf('crios/') + 6, navigator.userAgent.toLowerCase().indexOf('mobile/')-navigator.userAgent.toLowerCase().lastIndexOf('crios/')-7) + ')' || "";
            else if (navigator.userAgent.toLowerCase().indexOf("chrome") != -1)
                return toTitleCase("chrome") + ' (' + navigator.userAgent.substr(navigator.userAgent.toLowerCase().lastIndexOf('chrome/') + 6, navigator.userAgent.toLowerCase().indexOf('mobile/') - navigator.userAgent.toLowerCase().lastIndexOf('chrome/') - 7) + ')' || "";
            else if (jQuery.browser && jQuery.browser.name)
                return toTitleCase(jQuery.browser.name) + ' (' + jQuery.browser.version + ')' || "";
            else 
                "";
        }
        else if (jQuery.browser && jQuery.browser.name)
            return toTitleCase(jQuery.browser.name) + ' (' + jQuery.browser.version + ')' || "";
        else 
            return "";
    };

    function GetOSName() {
        var OSName = "Unknown OS";
        if (navigator.appVersion.indexOf("Win") != -1) OSName = "Windows";
        if (navigator.appVersion.indexOf("Mac") != -1) OSName = "MacOS";
        if (navigator.appVersion.indexOf("X11") != -1) OSName = "UNIX";
        if (navigator.appVersion.indexOf("Linux") != -1) OSName = "Linux";

        return OSName;
    };
    function IsIPad() {
        var flag = false;
        if (navigator.userAgent.match(/iPad/i) != null)
            flag = true;
        else
            flag = false;

        return flag;
    };
    function GetCurrentDate() {
        var currentDate = new Date();
        var month = currentDate.getMonth() + 1;
        var day = currentDate.getDate();
        var result = (day < 10 ? '0' : '') + day + '/' + (month < 10 ? '0' : '') + month + '/' + currentDate.getFullYear();
        return result;
    };
    function toTitleCase(str) {
        return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
    }
    function GetUserDeviceInfo() {
        var device = navigator.userAgent.toLowerCase();
        var deviceName = "";

        if (/ipad/i.test(device)) {
            if (navigator.platform.indexOf("iPad") != -1) {
                deviceName = "iPad";
            }
        }

        if (/iphone/i.test(device)) {
            deviceName = "iPhone";
        }

        if (/ipod/i.test(device)) {
            deviceName = "iPod";
        }

        if (/android/i.test(device)) {
            deviceName = "Android";
        }

        if (/blackberry/i.test(device)) {
            deviceName = "Blackberry";
        }

        if (/webos/i.test(device)) {
            deviceName = "WebOS";
        }

        if (/windows phone/i.test(device)) {
            deviceName = "Windows Phone";
        }

        if (isNullOrEmpty(deviceName)) {
            deviceName = "Desktop";
        }

        return deviceName;
    };

    function isNullOrEmpty(value) {
        var isNullOrEmpty = true;
        if (value) {
            if (typeof (value) == 'string') {
                if (value.length > 0)
                    isNullOrEmpty = false;
            }
            else {
                // change for integer, float value
                isNullOrEmpty = false;
            }
        }
        return isNullOrEmpty;
    };
}